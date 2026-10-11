/**
 * PED PLATFORM - MAIN CONTROLLER
 * St. Joseph's College (Autonomous), Tiruchirappalli - IQAC Platform
 * Full Department & Faculty Categorization, Annexure 9(b) & 9(c) Evaluation,
 * Word (.docx) & PDF (.pdf) Document Ingestion, and Accreditation Analytics.
 */

import { DEPARTMENTS_DATA, INITIAL_FACULTY_RECORDS, COLLEGE_INFO } from './data/initialData.js';
import { EvaluatorEngine } from './services/evaluator.js';
import { DocumentParser } from './services/documentParser.js';
import { TemplateManager } from './services/templateManager.js';
import { ChartController } from './components/charts.js';

class PedApp {
  constructor() {
    this.departments = [...DEPARTMENTS_DATA];
    this.facultyRecords = [];
    this.chartCtrl = new ChartController();
    
    this.selectedDeptFilter = "ALL";
    this.selectedFacultyId = null;
    this.deptSearchQuery = "";

    this.init();
  }

  init() {
    this.loadState();
    this.setupEventListeners();
    this.populateDeptDropdowns();
    this.renderAll();
  }

  loadState() {
    const saved = localStorage.getItem("ped_college_faculty");
    if (saved) {
      try {
        this.facultyRecords = JSON.parse(saved);
      } catch (e) {
        this.facultyRecords = INITIAL_FACULTY_RECORDS.map(f => EvaluatorEngine.computeFacultyComposite(f));
      }
    } else {
      this.facultyRecords = INITIAL_FACULTY_RECORDS.map(f => EvaluatorEngine.computeFacultyComposite(f));
      this.saveState();
    }

    if (this.facultyRecords.length > 0) {
      this.selectedFacultyId = this.facultyRecords[0].id;
    }
  }

  saveState() {
    localStorage.setItem("ped_college_faculty", JSON.stringify(this.facultyRecords));
  }

  populateDeptDropdowns() {
    const filterSelect = document.getElementById("faculty-dept-filter");
    const formDeptSelect = document.getElementById("form-dept");

    if (filterSelect) {
      filterSelect.innerHTML = `<option value="ALL">All Departments (Institutional)</option>`;
      this.departments.forEach(d => {
        const opt = document.createElement("option");
        opt.value = d.name;
        opt.textContent = `${d.name} (${d.code})`;
        filterSelect.appendChild(opt);
      });
    }

    if (formDeptSelect) {
      formDeptSelect.innerHTML = "";
      this.departments.forEach(d => {
        const opt = document.createElement("option");
        opt.value = d.name;
        opt.textContent = `${d.name} (${d.code})`;
        formDeptSelect.appendChild(opt);
      });
    }
  }

  setupEventListeners() {
    // Navigation Tabs
    const tabs = document.querySelectorAll(".nav-tab");
    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        tabs.forEach(t => {
          t.classList.remove("active");
          t.setAttribute("aria-selected", "false");
        });
        tab.classList.add("active");
        tab.setAttribute("aria-selected", "true");

        const targetPane = tab.getAttribute("data-tab");
        document.querySelectorAll(".tab-pane").forEach(pane => pane.classList.remove("active"));
        const activePane = document.getElementById(targetPane);
        if (activePane) activePane.classList.add("active");

        if (targetPane === 'iqac-tab') {
          this.renderIqacCharts();
        } else if (targetPane === 'faculty-tab') {
          this.renderFacultyDossier();
        } else if (targetPane === 'departments-tab') {
          this.renderDepartmentsGrid();
        }
      });
    });

    // Reset Demo Data
    document.getElementById("quick-demo-btn")?.addEventListener("click", () => {
      localStorage.removeItem("ped_college_faculty");
      this.facultyRecords = INITIAL_FACULTY_RECORDS.map(f => EvaluatorEngine.computeFacultyComposite(f));
      this.saveState();
      this.selectedFacultyId = this.facultyRecords[0].id;
      this.renderAll();
      this.showToast("St. Joseph's College demo faculty submissions restored!", "success");
    });

    // Department Search in Departments Hub
    document.getElementById("dept-search-input")?.addEventListener("input", (e) => {
      this.deptSearchQuery = e.target.value.toLowerCase();
      this.renderDepartmentsGrid();
    });

    // Department Filter in Faculty Tab
    document.getElementById("faculty-dept-filter")?.addEventListener("change", (e) => {
      this.selectedDeptFilter = e.target.value;
      this.populateFacultySelect();
      this.renderFacultyDossier();
    });

    // Faculty Selector in Faculty Tab
    document.getElementById("faculty-select")?.addEventListener("change", (e) => {
      this.selectedFacultyId = e.target.value;
      this.renderFacultyDossier();
    });

    // Print Modal Triggers
    document.getElementById("print-dossier-btn")?.addEventListener("click", () => {
      this.openPrintModal();
    });

    document.getElementById("modal-print-btn")?.addEventListener("click", () => {
      window.print();
    });

    document.getElementById("modal-close-btn")?.addEventListener("click", () => {
      document.getElementById("dossier-modal").classList.add("hidden");
    });

    document.querySelector(".modal-backdrop")?.addEventListener("click", () => {
      document.getElementById("dossier-modal").classList.add("hidden");
    });

    // Export IQAC College Report
    document.getElementById("export-college-summary-btn")?.addEventListener("click", () => {
      this.exportCollegeJson();
    });

    // Download Guidelines Button
    document.getElementById("download-guidelines-btn")?.addEventListener("click", () => {
      TemplateManager.downloadDocGuide();
      this.showToast("IQAC Evaluation Guidelines downloaded.", "info");
    });

    // Test Word Doc Parse Buttons (Annexure 9b and 9c)
    document.getElementById("test-parse-9b-btn")?.addEventListener("click", async () => {
      await this.loadSampleWordDoc('/templates/Annexure_9_b_Template_Pedagogy_Approach.docx', 'Annexure_9_b_Sample.docx');
    });

    document.getElementById("test-parse-9c-btn")?.addEventListener("click", async () => {
      await this.loadSampleWordDoc('/templates/Annexure_9_c_Template_Assessment Component.docx', 'Annexure_9_c_Sample.docx');
    });

    // Manual Entry Form
    document.getElementById("manual-eval-form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleManualFormSubmit();
    });

    // File Dropzone
    this.setupDropzone();
  }

  setupDropzone() {
    const dropzone = document.getElementById("file-dropzone");
    const fileInput = document.getElementById("file-input");
    if (!dropzone || !fileInput) return;

    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
      });
    });

    dropzone.addEventListener('drop', (e) => {
      const files = e.dataTransfer.files;
      if (files.length > 0) this.handleFilesUpload(files);
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) this.handleFilesUpload(e.target.files);
    });
  }

  /**
   * Process uploaded files (.docx, .pdf, .json, .csv)
   */
  async handleFilesUpload(files) {
    for (const file of Array.from(files)) {
      try {
        const parsed = await DocumentParser.parseFile(file);
        
        if (Array.isArray(parsed)) {
          // Batch JSON
          parsed.forEach(item => this.ingestParsedRecord(item));
          this.showToast(`Batch evaluated ${parsed.length} records!`, "success");
        } else if (typeof parsed === 'string') {
          // CSV string
          const csvRecords = EvaluatorEngine.parseCsv(parsed);
          csvRecords.forEach(item => this.ingestParsedRecord(item));
          this.showToast(`Parsed & evaluated ${csvRecords.length} CSV rows!`, "success");
        } else {
          // Single Word or PDF Document (Annexure 9b or 9c)
          this.ingestParsedRecord(parsed);
          this.showToast(`Successfully evaluated ${file.name} (${parsed.type === 'ANNEXURE_9B' ? 'Annexure 9(b) Pedagogy' : 'Annexure 9(c) Assessment'})!`, "success");
        }
      } catch (err) {
        console.error(err);
        this.showToast(`Error reading ${file.name}: ${err.message}`, "error");
      }
    }

    this.saveState();
    this.renderAll();
  }

  /**
   * Load and evaluate a sample Word template from the public/templates folder
   */
  async loadSampleWordDoc(url, filename) {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const file = new File([blob], filename, { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
      await this.handleFilesUpload([file]);
    } catch (e) {
      console.error(e);
      this.showToast(`Could not load template: ${e.message}`, "error");
    }
  }

  /**
   * Ingest a parsed record into faculty hierarchy
   */
  ingestParsedRecord(parsed) {
    const facName = parsed.facultyName || "Faculty Member";
    const deptName = parsed.department || "Computer Science";

    // Find existing faculty or create new
    let faculty = this.facultyRecords.find(f => 
      f.facultyName.toLowerCase() === facName.toLowerCase() ||
      (f.courseCode && parsed.courseCode && f.courseCode.toLowerCase() === parsed.courseCode.toLowerCase())
    );

    if (!faculty) {
      faculty = {
        id: `FAC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        facultyName: facName,
        designation: parsed.designation || "Assistant Professor",
        department: deptName,
        programme: parsed.programme || "B.Sc. / M.Sc.",
        courseCode: parsed.courseCode || "CS101",
        courseTitle: parsed.courseTitle || "Core Course",
        academicYear: parsed.academicYear || "2025-26",
        email: "faculty@sjctni.edu",
        annexure9b: null,
        annexure9c: null,
        compositeScore: 0,
        statusBand: "Pending"
      };
      this.facultyRecords.unshift(faculty);
    }

    // Attach & evaluate the annexure
    if (parsed.type === 'ANNEXURE_9C') {
      faculty.annexure9c = EvaluatorEngine.evaluateAnnexure9c(parsed);
    } else {
      faculty.annexure9b = EvaluatorEngine.evaluateAnnexure9b(parsed);
    }

    // Recompute composite
    const updated = EvaluatorEngine.computeFacultyComposite(faculty);
    Object.assign(faculty, updated);

    this.selectedFacultyId = faculty.id;
    this.showEvaluationBanner(faculty, parsed.type);
  }

  /**
   * Manual Form Submit
   */
  handleManualFormSubmit() {
    const type = document.getElementById("form-annexure-type").value;
    const dept = document.getElementById("form-dept").value;
    const name = document.getElementById("form-faculty-name").value;
    const course = document.getElementById("form-course").value;
    const method = document.getElementById("form-method").value;
    const tools = document.getElementById("form-tools").value;
    const reflection = document.getElementById("form-reflection").value;

    const parsed = {
      type: type === '9C' ? 'ANNEXURE_9C' : 'ANNEXURE_9B',
      facultyName: name,
      department: dept,
      courseTitle: course,
      courseCode: course.split(' ')[0] || "CRS",
      teachingMethod: method,
      tools: tools,
      planningPurpose: reflection,
      inClassDelivery: reflection,
      impact: reflection,
      lookingAhead: reflection,
      whatWorked: reflection,
      whatCouldImprove: reflection,
      submissionDate: new Date().toISOString().split('T')[0]
    };

    this.ingestParsedRecord(parsed);
    this.saveState();
    this.renderAll();
    document.getElementById("manual-eval-form").reset();
    this.showToast("Manual evaluation saved successfully!", "success");
  }

  /**
   * Evaluation Result Banner
   */
  showEvaluationBanner(faculty, type) {
    const banner = document.getElementById("upload-evaluation-result");
    if (!banner) return;

    banner.classList.remove("hidden");
    const is9b = type === 'ANNEXURE_9B';
    const score = is9b ? faculty.annexure9b?.score : faculty.annexure9c?.score;
    const band = is9b ? faculty.annexure9b?.band : faculty.annexure9c?.band;

    banner.innerHTML = `
      <div class="flex-between flex-wrap gap-2">
        <div>
          <span class="status-badge ${band === 'Exemplary' ? 'badge-success' : 'badge-indigo'}">${band}</span>
          <h3 class="card-title mt-2">Evaluation Completed: ${faculty.facultyName}</h3>
          <p class="card-subtitle">
            ${is9b ? 'Annexure 9(b) Pedagogy Score' : 'Annexure 9(c) Assessment Score'}: 
            <strong>${score}/100</strong> • Department: ${faculty.department} (${faculty.courseTitle})
          </p>
        </div>
        <button id="view-banner-dossier-btn" class="btn btn-primary btn-sm">
          View Faculty Portfolio Dossier
        </button>
      </div>
    `;

    document.getElementById("view-banner-dossier-btn")?.addEventListener("click", () => {
      document.getElementById("tab-faculty")?.click();
    });
  }

  /**
   * Render All Views
   */
  renderAll() {
    this.renderMetricRibbon();
    this.renderDepartmentsGrid();
    this.populateFacultySelect();
    this.renderFacultyDossier();
    this.renderIqacCharts();
  }

  /**
   * Executive Metric Ribbon
   */
  renderMetricRibbon() {
    const analytics = EvaluatorEngine.computeCollegeAnalytics(this.departments, this.facultyRecords);

    document.getElementById("stat-college-composite").textContent = analytics.collegeComposite.toFixed(1);
    
    const bandElem = document.getElementById("stat-quality-band");
    bandElem.textContent = analytics.collegeComposite >= 85 ? "Exemplary" : (analytics.collegeComposite >= 75 ? "Proficient" : "Developing");
    bandElem.className = `metric-badge ${analytics.collegeComposite >= 85 ? 'badge-success' : 'badge-indigo'}`;

    document.getElementById("stat-total-depts").textContent = analytics.totalDepts;
    document.getElementById("stat-count-9b").textContent = analytics.submitted9bCount;
    document.getElementById("stat-avg-9b").textContent = `Avg: ${analytics.collegeAvg9b.toFixed(1)}`;
    document.getElementById("stat-count-9c").textContent = analytics.submitted9cCount;
    document.getElementById("stat-avg-9c").textContent = `Avg: ${analytics.collegeAvg9c.toFixed(1)}`;
  }

  /**
   * Departments Hub Grid
   */
  renderDepartmentsGrid() {
    const container = document.getElementById("departments-grid");
    if (!container) return;

    const analytics = EvaluatorEngine.computeCollegeAnalytics(this.departments, this.facultyRecords);
    let depts = this.departments;

    if (this.deptSearchQuery) {
      depts = depts.filter(d => 
        d.name.toLowerCase().includes(this.deptSearchQuery) ||
        d.hod.toLowerCase().includes(this.deptSearchQuery) ||
        d.code.toLowerCase().includes(this.deptSearchQuery)
      );
    }

    container.innerHTML = depts.map(d => {
      const stats = analytics.deptStats[d.name] || {
        avg9b: 0, avg9c: 0, avgComposite: 0, submittedCount: 0, completionRate: 0
      };

      return `
        <div class="dept-card">
          <div>
            <div class="dept-header">
              <span class="dept-code-badge">${d.code}</span>
              <span class="status-badge ${stats.completionRate >= 80 ? 'badge-success' : 'badge-neutral'}">
                ${stats.completionRate}% Submitted
              </span>
            </div>
            <h3 class="dept-name">${d.name}</h3>
            <p class="dept-hod"><strong>HOD:</strong> ${d.hod}</p>
            <p style="font-size: 0.775rem; color: var(--text-dim); margin-top: 0.25rem;">${d.description}</p>
          </div>

          <div class="dept-stats-row">
            <div class="dept-stat-box">
              <div class="dept-stat-val text-indigo">${stats.avg9b > 0 ? stats.avg9b : '--'}</div>
              <div class="dept-stat-lbl">Annexure 9(b)</div>
            </div>
            <div class="dept-stat-box">
              <div class="dept-stat-val text-emerald">${stats.avg9c > 0 ? stats.avg9c : '--'}</div>
              <div class="dept-stat-lbl">Annexure 9(c)</div>
            </div>
          </div>

          <div style="margin-bottom: 1rem;">
            <div class="flex-between" style="font-size: 0.75rem; margin-bottom: 0.25rem; color: var(--text-muted);">
              <span>Faculty Portfolios</span>
              <span>${stats.submittedCount} / ${d.totalFaculty}</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill fill-emerald" style="width: ${stats.completionRate}%;"></div>
            </div>
          </div>

          <button class="btn btn-outline btn-sm btn-block view-dept-faculty-btn" data-dept="${d.name}">
            View ${d.name} Faculty Portfolios →
          </button>
        </div>
      `;
    }).join("");

    // Attach click to open department faculty
    container.querySelectorAll(".view-dept-faculty-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const deptName = btn.getAttribute("data-dept");
        const deptFilter = document.getElementById("faculty-dept-filter");
        if (deptFilter) {
          deptFilter.value = deptName;
          this.selectedDeptFilter = deptName;
          this.populateFacultySelect();
          this.renderFacultyDossier();
        }
        document.getElementById("tab-faculty")?.click();
      });
    });
  }

  /**
   * Populate Faculty Selector Dropdown
   */
  populateFacultySelect() {
    const select = document.getElementById("faculty-select");
    if (!select) return;

    let items = this.facultyRecords;
    if (this.selectedDeptFilter !== "ALL") {
      items = items.filter(f => f.department === this.selectedDeptFilter);
    }

    if (items.length === 0) {
      select.innerHTML = `<option value="">No faculty in this department</option>`;
      return;
    }

    select.innerHTML = items.map(f => `
      <option value="${f.id}" ${f.id === this.selectedFacultyId ? 'selected' : ''}>
        ${f.facultyName} - ${f.department} (${f.courseCode || f.courseTitle})
      </option>
    `).join("");

    if (!items.some(f => f.id === this.selectedFacultyId)) {
      this.selectedFacultyId = items[0].id;
    }
  }

  /**
   * Render Individual Faculty Detailed Dossier (Dual Annexures)
   */
  renderFacultyDossier() {
    const container = document.getElementById("faculty-detail-container");
    if (!container) return;

    let items = this.facultyRecords;
    if (this.selectedDeptFilter !== "ALL") {
      items = items.filter(f => f.department === this.selectedDeptFilter);
    }

    const faculty = items.find(f => f.id === this.selectedFacultyId) || items[0];
    if (!faculty) {
      container.innerHTML = `<div class="card p-4 text-center text-muted">No faculty records found for this department filter.</div>`;
      return;
    }

    const initials = faculty.facultyName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    const b = faculty.annexure9b;
    const c = faculty.annexure9c;

    container.innerHTML = `
      <div class="dossier-wrapper">
        <!-- Dossier Header -->
        <div class="dossier-header">
          <div class="dossier-avatar-row">
            <div class="faculty-avatar">${initials}</div>
            <div>
              <h2 class="faculty-meta-title">${faculty.facultyName}</h2>
              <div class="faculty-meta-sub">
                ${faculty.designation} • <strong>${faculty.department}</strong> • Emp ID: ${faculty.id}
              </div>
              <div class="faculty-meta-sub mt-2">
                <strong>Course:</strong> ${faculty.courseCode || ''} ${faculty.courseTitle} (${faculty.programme || ''})
              </div>
              <div style="font-size: 0.775rem; color: var(--text-dim); margin-top: 0.25rem;">
                Email: ${faculty.email || 'faculty@sjctni.edu'} • Academic Year: ${faculty.academicYear}
              </div>
            </div>
          </div>

          <div class="dossier-score-gauge">
            <div class="gauge-number ${faculty.compositeScore >= 85 ? 'text-emerald' : 'text-indigo'}">
              ${faculty.compositeScore > 0 ? faculty.compositeScore : '--'}
            </div>
            <div class="gauge-label">Composite IQAC Score / 100</div>
            <div class="mt-2">
              <span class="status-badge ${faculty.statusBand === 'Exemplary' ? 'badge-success' : (faculty.statusBand === 'Proficient' ? 'badge-indigo' : 'badge-warning')}">
                ${faculty.statusBand}
              </span>
            </div>
          </div>
        </div>

        <!-- Radar Competency Comparison -->
        <div class="grid grid-2 mb-4">
          <div class="card chart-card">
            <div class="card-header">
              <h3 class="card-title">Competency Radar vs College Benchmark</h3>
              <p class="card-subtitle">Aggregated assessment across 6 pedagogical and evaluation dimensions</p>
            </div>
            <div class="chart-container">
              <canvas id="facultyRadarChart"></canvas>
            </div>
          </div>

          <!-- Quick Summary Status -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">Submission Audit Verification</h3>
              <p class="card-subtitle">Official Annexure filing status under IQAC Academic Audit</p>
            </div>
            <div class="d-flex flex-column gap-3 mt-3">
              <div class="p-3" style="background: rgba(99, 102, 241, 0.08); border-radius: 8px; border: 1px solid rgba(99, 102, 241, 0.25);">
                <div class="flex-between">
                  <div>
                    <span class="annexure-tag tag-9b">Annexure 9(b)</span>
                    <strong style="margin-left: 0.5rem;">Pedagogical Practices Reflection</strong>
                  </div>
                  <span class="status-badge ${b?.submitted ? 'badge-success' : 'badge-warning'}">
                    ${b?.submitted ? `Score: ${b.score}/100` : 'Pending'}
                  </span>
                </div>
                <div style="font-size: 0.825rem; color: var(--text-muted); margin-top: 0.5rem;">
                  <strong>Method:</strong> ${b?.teachingMethod || 'Not submitted'} • <strong>Tools:</strong> ${b?.tools || 'N/A'}
                </div>
              </div>

              <div class="p-3" style="background: rgba(16, 185, 129, 0.08); border-radius: 8px; border: 1px solid rgba(16, 185, 129, 0.25);">
                <div class="flex-between">
                  <div>
                    <span class="annexure-tag tag-9c">Annexure 9(c)</span>
                    <strong style="margin-left: 0.5rem;">Assessment Components Reflection</strong>
                  </div>
                  <span class="status-badge ${c?.submitted ? 'badge-success' : 'badge-warning'}">
                    ${c?.submitted ? `Score: ${c.score}/100` : 'Pending'}
                  </span>
                </div>
                <div style="font-size: 0.825rem; color: var(--text-muted); margin-top: 0.5rem;">
                  <strong>Components:</strong> ${c?.components?.length || 0} evaluated • <strong>COs Articulated:</strong> ${c?.courseOutcomes?.length || 0}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- SECTION 1: Annexure 9(b) Details -->
        <div class="annexure-box">
          <div class="annexure-header-row">
            <div>
              <span class="annexure-tag tag-9b">Annexure 9(b)</span>
              <h3 style="display: inline-block; font-size: 1.25rem; margin-left: 0.5rem;">Faculty Reflection on Pedagogical Practices</h3>
            </div>
            ${b?.submitted ? `<span class="score-badge text-indigo">${b.score}/100 (${b.band})</span>` : '<span class="status-badge badge-warning">Pending</span>'}
          </div>

          ${b?.submitted ? `
            <div class="grid grid-2 mt-3">
              <div>
                <h4 style="font-size: 0.95rem; margin-bottom: 0.5rem; color: #a5b4fc;">Section B: Pedagogical Approach & Execution</h4>
                <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;">
                  <div><strong>Unit & Topic:</strong> ${b.unit} - ${b.topic}</div>
                  <div><strong>Teaching Method:</strong> ${b.teachingMethod}</div>
                  <div><strong>Pedagogical Approach:</strong> ${b.pedagogicalApproach}</div>
                  <div><strong>Tools & Materials:</strong> ${b.tools}</div>
                  <div><strong>Alignment with COs:</strong> ${b.coAlignment}</div>
                </div>

                <div class="reflection-item">
                  <div class="reflection-label">Planning and Purpose</div>
                  <div class="reflection-text">${b.planningPurpose}</div>
                </div>

                <div class="reflection-item">
                  <div class="reflection-label">In-Class Delivery & Flow</div>
                  <div class="reflection-text">${b.inClassDelivery}</div>
                </div>

                <div class="reflection-item">
                  <div class="reflection-label">Impact & Evidence of Learning</div>
                  <div class="reflection-text">${b.impact}</div>
                </div>

                <div class="reflection-item">
                  <div class="reflection-label">Looking Ahead & Continuous Improvement</div>
                  <div class="reflection-text">${b.lookingAhead}</div>
                </div>
              </div>

              <div>
                <h4 style="font-size: 0.95rem; margin-bottom: 0.5rem; color: #a5b4fc;">IQAC Rubric Evaluation</h4>
                ${this.renderCriterionRow(b.criteria?.methodInnovation || { score: 20, max: 25, label: "Pedagogical Innovation" }, 'fill-indigo')}
                ${this.renderCriterionRow(b.criteria?.planningPurpose || { score: 17, max: 20, label: "Planning & Purpose Rigor" }, 'fill-emerald')}
                ${this.renderCriterionRow(b.criteria?.inClassDelivery || { score: 17, max: 20, label: "In-Class Student Flow" }, 'fill-cyan')}
                ${this.renderCriterionRow(b.criteria?.impact || { score: 16, max: 20, label: "Impact & Learning Evidence" }, 'fill-indigo')}
                ${this.renderCriterionRow(b.criteria?.reflection || { score: 12, max: 15, label: "Critical Looking Ahead" }, 'fill-amber')}

                <div class="feedback-box mt-3">
                  <div class="feedback-title">Commendations (9b)</div>
                  <ul class="feedback-list">
                    ${(b.strengths || []).map(s => `<li class="feedback-item">${s}</li>`).join("")}
                  </ul>
                </div>

                <div class="growth-box mt-3">
                  <div class="growth-title">IQAC Growth Recommendations (9b)</div>
                  <ul class="feedback-list">
                    ${(b.recommendations || []).map(r => `<li class="growth-item">${r}</li>`).join("")}
                  </ul>
                </div>
              </div>
            </div>
          ` : `
            <p class="text-muted" style="padding: 1.5rem 0;">No Annexure 9(b) submitted for this faculty yet. Upload their completed Word/PDF document in the Upload tab.</p>
          `}
        </div>

        <!-- SECTION 2: Annexure 9(c) Details -->
        <div class="annexure-box mt-4">
          <div class="annexure-header-row">
            <div>
              <span class="annexure-tag tag-9c">Annexure 9(c)</span>
              <h3 style="display: inline-block; font-size: 1.25rem; margin-left: 0.5rem;">Faculty Reflection on Assessment Components</h3>
            </div>
            ${c?.submitted ? `<span class="score-badge text-emerald">${c.score}/100 (${c.band})</span>` : '<span class="status-badge badge-warning">Pending</span>'}
          </div>

          ${c?.submitted ? `
            <div class="mt-3">
              <h4 style="font-size: 0.95rem; margin-bottom: 0.5rem; color: #34d399;">Section B: Approved Course Outcomes (COs)</h4>
              <ul style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.25rem; padding-left: 1.25rem;">
                ${(c.courseOutcomes || []).map(co => `<li>${co}</li>`).join("")}
              </ul>

              <h4 style="font-size: 0.95rem; margin-bottom: 0.5rem; color: #34d399;">Section C: Assessment Components Used</h4>
              <div class="table-responsive" style="margin-bottom: 1.25rem;">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Component Name</th>
                      <th>Type</th>
                      <th>Aligned COs</th>
                      <th>Announced Date</th>
                      <th>Materials Provided Before</th>
                      <th>Completion Date</th>
                      <th>Feedback Provided After</th>
                      <th>Marks</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${(c.components || []).map(comp => `
                      <tr>
                        <td><strong>${comp.name}</strong></td>
                        <td><span class="status-badge ${comp.type === 'Alternative' ? 'badge-success' : 'badge-neutral'}">${comp.type}</span></td>
                        <td>${comp.co || comp.alignedCos || 'CO1'}</td>
                        <td>${comp.announcedDate || comp.date || 'Announced'}</td>
                        <td style="font-size: 0.8rem;">${comp.preMaterials || comp.before || 'Syllabus & Blueprint'}</td>
                        <td>${comp.compDate || 'Completed'}</td>
                        <td style="font-size: 0.8rem;">${comp.postMaterials || comp.after || 'Graded Feedback'}</td>
                        <td><strong>${comp.marks}</strong></td>
                      </tr>
                    `).join("")}
                  </tbody>
                </table>
              </div>

              <div class="grid grid-2">
                <div>
                  <h4 style="font-size: 0.95rem; margin-bottom: 0.5rem; color: #34d399;">Section E: Faculty Reflection on Assessment</h4>
                  <div class="reflection-item">
                    <div class="reflection-label" style="color: #34d399;">What Worked Well in the Assessment Process?</div>
                    <div class="reflection-text">${c.whatWorked}</div>
                  </div>
                  <div class="reflection-item">
                    <div class="reflection-label" style="color: #34d399;">What Could Be Improved in Future Offerings?</div>
                    <div class="reflection-text">${c.whatCouldImprove}</div>
                  </div>
                </div>

                <div>
                  <h4 style="font-size: 0.95rem; margin-bottom: 0.5rem; color: #34d399;">IQAC Assessment Rubric</h4>
                  ${this.renderCriterionRow(c.criteria?.varietyBalance || { score: 20, max: 25, label: "Assessment Component Variety" }, 'fill-emerald')}
                  ${this.renderCriterionRow(c.criteria?.coCoverage || { score: 20, max: 25, label: "Course Outcome (CO) Coverage" }, 'fill-cyan')}
                  ${this.renderCriterionRow(c.criteria?.transparency || { score: 16, max: 20, label: "Advance Notice & Pre-Materials" }, 'fill-indigo')}
                  ${this.renderCriterionRow(c.criteria?.feedback || { score: 12, max: 15, label: "Post-Assessment Diagnostic Feedback" }, 'fill-emerald')}
                  ${this.renderCriterionRow(c.criteria?.reflection || { score: 12, max: 15, label: "Faculty Improvement Reflection" }, 'fill-amber')}
                </div>
              </div>
            </div>
          ` : `
            <p class="text-muted" style="padding: 1.5rem 0;">No Annexure 9(c) submitted for this faculty yet. Upload their completed Word/PDF document in the Upload tab.</p>
          `}
        </div>
      </div>
    `;

    // Render faculty radar chart
    setTimeout(() => {
      this.chartCtrl.renderFacultyRadar('facultyRadarChart', faculty);
    }, 50);
  }

  renderCriterionRow(crit, fillClass) {
    const pct = Math.round((crit.score / crit.max) * 100);
    return `
      <div class="criterion-row">
        <div class="criterion-title-wrap">
          <div class="criterion-title">${crit.label}</div>
        </div>
        <div class="criterion-bar">
          <div class="progress-fill ${fillClass}" style="width: ${pct}%;"></div>
        </div>
        <div class="criterion-score-text">${crit.score} / ${crit.max}</div>
      </div>
    `;
  }

  /**
   * Render IQAC Charts
   */
  renderIqacCharts() {
    const analytics = EvaluatorEngine.computeCollegeAnalytics(this.departments, this.facultyRecords);
    this.chartCtrl.renderDeptComparison('deptComparisonChart', analytics.deptStats);
    this.chartCtrl.renderPedagogyDistribution('pedagogyAdoptionChart', this.facultyRecords);
    this.chartCtrl.renderAssessmentTypes('assessmentTypesChart', this.facultyRecords);
  }

  /**
   * Formal Academic Appraisal Dossier for Printing / PDF
   */
  openPrintModal() {
    const faculty = this.facultyRecords.find(f => f.id === this.selectedFacultyId) || this.facultyRecords[0];
    if (!faculty) return;

    const modal = document.getElementById("dossier-modal");
    const content = document.getElementById("modal-content-area");
    if (!modal || !content) return;

    const b = faculty.annexure9b;
    const c = faculty.annexure9c;

    content.innerHTML = `
      <div style="padding: 1.5rem; font-family: sans-serif; color: #0f172a; background: white; border-radius: 8px;">
        <!-- Letterhead -->
        <div style="text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 1rem; margin-bottom: 1.5rem;">
          <h2 style="font-size: 1.35rem; font-weight: 800; text-transform: uppercase; margin: 0; color: #0f172a;">${COLLEGE_INFO.institutionName}</h2>
          <h4 style="font-size: 0.95rem; font-weight: 600; color: #475569; margin: 0.2rem 0;">${COLLEGE_INFO.location}</h4>
          <h3 style="font-size: 1.1rem; font-weight: 700; margin: 0.35rem 0 0; color: #1e293b;">${COLLEGE_INFO.cell}</h3>
          <p style="font-size: 0.8rem; color: #64748b; margin: 0.2rem 0 0;">Faculty Pedagogical & Assessment Practices Appraisal Dossier (Annexures 9b & 9c)</p>
        </div>

        <!-- Faculty Details Table -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 1.25rem; font-size: 0.85rem;">
          <tr>
            <td style="padding: 6px; border: 1px solid #cbd5e1; font-weight: bold; background: #f8fafc; width: 22%;">Faculty Name:</td>
            <td style="padding: 6px; border: 1px solid #cbd5e1;">${faculty.facultyName}</td>
            <td style="padding: 6px; border: 1px solid #cbd5e1; font-weight: bold; background: #f8fafc; width: 22%;">Faculty ID:</td>
            <td style="padding: 6px; border: 1px solid #cbd5e1;">${faculty.id}</td>
          </tr>
          <tr>
            <td style="padding: 6px; border: 1px solid #cbd5e1; font-weight: bold; background: #f8fafc;">Department:</td>
            <td style="padding: 6px; border: 1px solid #cbd5e1;">${faculty.department}</td>
            <td style="padding: 6px; border: 1px solid #cbd5e1; font-weight: bold; background: #f8fafc;">Designation:</td>
            <td style="padding: 6px; border: 1px solid #cbd5e1;">${faculty.designation}</td>
          </tr>
          <tr>
            <td style="padding: 6px; border: 1px solid #cbd5e1; font-weight: bold; background: #f8fafc;">Course Taught:</td>
            <td style="padding: 6px; border: 1px solid #cbd5e1;">${faculty.courseCode || ''} ${faculty.courseTitle}</td>
            <td style="padding: 6px; border: 1px solid #cbd5e1; font-weight: bold; background: #f8fafc;">Composite Index:</td>
            <td style="padding: 6px; border: 1px solid #cbd5e1; font-weight: bold; color: #16a34a;">${faculty.compositeScore}/100 (${faculty.statusBand})</td>
          </tr>
        </table>

        <!-- Annexure 9(b) Summary -->
        <h4 style="margin: 1rem 0 0.5rem; color: #0f172a; font-size: 0.95rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">
          1. Annexure 9(b): Pedagogical Approach & Reflection (Score: ${b ? `${b.score}/100` : 'Pending'})
        </h4>
        <p style="font-size: 0.85rem; margin-bottom: 0.4rem;"><strong>Teaching Method:</strong> ${b?.teachingMethod || 'N/A'} • <strong>Tools:</strong> ${b?.tools || 'N/A'}</p>
        <p style="font-size: 0.825rem; color: #334155; margin-bottom: 0.4rem;"><strong>Planning & Delivery:</strong> ${b?.inClassDelivery || 'N/A'}</p>
        <p style="font-size: 0.825rem; color: #334155; margin-bottom: 1rem;"><strong>Impact:</strong> ${b?.impact || 'N/A'}</p>

        <!-- Annexure 9(c) Summary -->
        <h4 style="margin: 1rem 0 0.5rem; color: #0f172a; font-size: 0.95rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">
          2. Annexure 9(c): Assessment Components & Reflection (Score: ${c ? `${c.score}/100` : 'Pending'})
        </h4>
        <p style="font-size: 0.85rem; margin-bottom: 0.4rem;"><strong>Assessment Components Evaluated:</strong> ${c?.components?.length || 0}</p>
        <p style="font-size: 0.825rem; color: #334155; margin-bottom: 0.4rem;"><strong>What Worked:</strong> ${c?.whatWorked || 'N/A'}</p>
        <p style="font-size: 0.825rem; color: #334155; margin-bottom: 1.5rem;"><strong>Areas for Improvement:</strong> ${c?.whatCouldImprove || 'N/A'}</p>

        <!-- Signatures -->
        <div style="display: flex; justify-content: space-between; margin-top: 3.5rem; padding-top: 1rem; border-top: 1px dashed #94a3b8; font-size: 0.85rem;">
          <div style="text-align: center;">
            <div style="margin-bottom: 2.5rem;">________________________</div>
            <strong>Faculty Signature</strong>
          </div>
          <div style="text-align: center;">
            <div style="margin-bottom: 2.5rem;">________________________</div>
            <strong>Head of Department (HOD)</strong>
          </div>
          <div style="text-align: center;">
            <div style="margin-bottom: 2.5rem;">________________________</div>
            <strong>IQAC Coordinator</strong>
          </div>
        </div>
      </div>
    `;

    modal.classList.remove("hidden");
  }

  /**
   * Export institutional IQAC summary report in JSON
   */
  exportCollegeJson() {
    const analytics = EvaluatorEngine.computeCollegeAnalytics(this.departments, this.facultyRecords);
    const exportPayload = {
      institution: COLLEGE_INFO,
      generatedAt: new Date().toISOString(),
      analytics,
      departments: this.departments,
      facultyPortfolios: this.facultyRecords
    };

    const jsonString = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", jsonString);
    dlAnchor.setAttribute("download", `SJC_IQAC_PED_Report_${new Date().toISOString().split('T')[0]}.json`);
    dlAnchor.click();
    this.showToast("IQAC College Dossier exported successfully!", "success");
  }

  showToast(message, type = "info") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }
}

// Bootstrap app on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  new PedApp();
});
