/**
 * PED PLATFORM - MAIN CONTROLLER
 * St. Joseph's College (Autonomous), Tiruchirappalli - IQAC Platform
 * Pastel Interface • Department Selector • Reliable Name Reflection
 * Word (.docx) & PDF (.pdf) Ingestion • Working CSV Exports
 */

import { DEPARTMENTS_DATA, INITIAL_FACULTY_RECORDS, COLLEGE_INFO } from './data/initialData.js';
import { EvaluatorEngine } from './services/evaluator.js';
import { DocumentParser } from './services/documentParser.js';

class PedApp {
  constructor() {
    this.departments = [...DEPARTMENTS_DATA];
    this.facultyRecords = [];
    this.selectedDepartment = "Computer Science";
    this.selectedFacultyId = null;
    this.activeParsedDocument = null;

    this.init();
  }

  init() {
    this.loadState();
    this.setupEventListeners();
    this.populateDepartmentDropdowns();
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

    const csFaculty = this.facultyRecords.filter(f => f.department === this.selectedDepartment);
    if (csFaculty.length > 0) {
      this.selectedFacultyId = csFaculty[0].id;
    } else if (this.facultyRecords.length > 0) {
      this.selectedFacultyId = this.facultyRecords[0].id;
      this.selectedDepartment = this.facultyRecords[0].department;
    }
  }

  saveState() {
    localStorage.setItem("ped_college_faculty", JSON.stringify(this.facultyRecords));
  }

  populateDepartmentDropdowns() {
    const mainDeptSelect = document.getElementById("dept-select-main");
    const formDeptSelect = document.getElementById("input-department");

    const deptOptionsHtml = this.departments.map(d => `
      <option value="${d.name}" ${d.name === this.selectedDepartment ? 'selected' : ''}>
        ${d.name} (${d.code})
      </option>
    `).join("");

    if (mainDeptSelect) mainDeptSelect.innerHTML = deptOptionsHtml;
    if (formDeptSelect) formDeptSelect.innerHTML = deptOptionsHtml;
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

        if (targetPane === 'portfolios-tab') {
          this.renderFacultyDossier();
        } else if (targetPane === 'iqac-tab') {
          this.renderIqacSummary();
        }
      });
    });

    // Main Department Dropdown Selection
    document.getElementById("dept-select-main")?.addEventListener("change", (e) => {
      this.selectedDepartment = e.target.value;
      this.populateFacultyDropdown();
      this.renderFacultyDossier();
      this.updateMetricRibbon();
    });

    // Faculty Member Selector
    document.getElementById("faculty-select")?.addEventListener("change", (e) => {
      this.selectedFacultyId = e.target.value;
      this.renderFacultyDossier();
    });

    // Dropzone & File Input Handling
    this.setupFileSelection();

    // Submission Confirmation Form
    document.getElementById("submission-confirm-form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleFormSubmit();
    });

    // Load Sample Test Document
    document.getElementById("load-test-sample-btn")?.addEventListener("click", async () => {
      await this.loadSampleWordDoc();
    });

    // Print Modal Handlers
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

    // Export CSV Buttons
    document.getElementById("export-csv-btn")?.addEventListener("click", () => {
      this.exportAllToCsv();
    });
    document.getElementById("export-summary-table-btn")?.addEventListener("click", () => {
      this.exportDepartmentSummaryCsv();
    });
  }

  setupFileSelection() {
    const dropzone = document.getElementById("file-dropzone");
    const fileInput = document.getElementById("file-input");
    if (!dropzone || !fileInput) return;

    ['dragenter', 'dragover'].forEach(name => {
      dropzone.addEventListener(name, (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(name => {
      dropzone.addEventListener(name, (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
      });
    });

    dropzone.addEventListener('drop', (e) => {
      const files = e.dataTransfer.files;
      if (files.length > 0) this.processSelectedFile(files[0]);
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) this.processSelectedFile(e.target.files[0]);
    });
  }

  /**
   * Reads selected file, extracts details, and pre-fills the form inputs on-screen!
   */
  async processSelectedFile(file) {
    // Show chosen file pill
    const pill = document.getElementById("file-chosen-pill");
    const pillName = document.getElementById("file-chosen-name");
    if (pill && pillName) {
      pill.style.display = "inline-flex";
      pillName.textContent = file.name;
    }

    try {
      const parsed = await DocumentParser.parseFile(file);
      this.activeParsedDocument = parsed;

      // Pre-fill form inputs with extracted values so the user sees their name right away!
      const nameInput = document.getElementById("input-faculty-name");
      const deptSelect = document.getElementById("input-department");
      const courseInput = document.getElementById("input-course-title");
      const typeSelect = document.getElementById("input-annexure-type");
      const methodInput = document.getElementById("input-method");
      const reflectInput = document.getElementById("input-reflection");

      if (nameInput && parsed.facultyName) {
        nameInput.value = parsed.facultyName;
      }
      if (deptSelect && parsed.department) {
        // Find matching option
        for (let i = 0; i < deptSelect.options.length; i++) {
          if (deptSelect.options[i].value.toLowerCase().includes(parsed.department.toLowerCase())) {
            deptSelect.selectedIndex = i;
            break;
          }
        }
      }
      if (courseInput) {
        courseInput.value = `${parsed.courseCode || ''} ${parsed.courseTitle || ''}`.trim();
      }
      if (typeSelect) {
        typeSelect.value = parsed.type === 'ANNEXURE_9C' ? '9C' : '9B';
      }
      if (methodInput) {
        methodInput.value = parsed.teachingMethod || (parsed.type === 'ANNEXURE_9C' ? 'Continuous Assessment' : '');
      }
      if (reflectInput) {
        reflectInput.value = parsed.planningPurpose || parsed.inClassDelivery || parsed.whatWorked || '';
      }

      this.showToast(`Document loaded: ${file.name}. Please confirm your name and details below.`, "success");
    } catch (err) {
      console.error(err);
      this.showToast(`Could not read file: ${err.message}`, "error");
    }
  }

  /**
   * Load test Word doc for demonstration
   */
  async loadSampleWordDoc() {
    try {
      const response = await fetch('/templates/Annexure_9_b_Template_Pedagogy_Approach.docx');
      const blob = await response.blob();
      const file = new File([blob], 'Annexure_9_b_Sample_Submission.docx', {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });
      await this.processSelectedFile(file);
      
      // If template was blank, prefill realistic sample
      const nameInput = document.getElementById("input-faculty-name");
      if (nameInput && !nameInput.value) {
        nameInput.value = "Dr. M. Xavier";
      }
      const courseInput = document.getElementById("input-course-title");
      if (courseInput && !courseInput.value) {
        courseInput.value = "23PCS302 Distributed Computing";
      }
      const methodInput = document.getElementById("input-method");
      if (methodInput && !methodInput.value) {
        methodInput.value = "Flipped Classroom & Microservice Simulation Pods";
      }
      const reflectInput = document.getElementById("input-reflection");
      if (reflectInput && !reflectInput.value) {
        reflectInput.value = "Conducted hands-on container deployment challenge. Students engaged in active problem solving with high retention.";
      }
    } catch (e) {
      console.error(e);
      this.showToast("Could not load sample template.", "error");
    }
  }

  /**
   * Handles submission of the confirmed form
   */
  handleFormSubmit() {
    const facultyName = document.getElementById("input-faculty-name").value.trim();
    const department = document.getElementById("input-department").value;
    const course = document.getElementById("input-course-title").value.trim();
    const annexureType = document.getElementById("input-annexure-type").value;
    const method = document.getElementById("input-method").value.trim();
    const reflection = document.getElementById("input-reflection").value.trim();

    if (!facultyName) {
      this.showToast("Please enter your Faculty Name.", "error");
      return;
    }

    // Find existing faculty by name in this department, or create new
    let faculty = this.facultyRecords.find(f => 
      f.facultyName.toLowerCase() === facultyName.toLowerCase() &&
      f.department.toLowerCase() === department.toLowerCase()
    );

    if (!faculty) {
      faculty = {
        id: `FAC-${Date.now().toString().slice(-4)}`,
        facultyName: facultyName,
        designation: "Assistant Professor",
        department: department,
        programme: "Undergraduate / Postgraduate",
        courseCode: course.split(' ')[0] || "CRS",
        courseTitle: course,
        academicYear: "2025-26",
        email: `${facultyName.toLowerCase().replace(/[^a-z]/g, '')}@sjctni.edu`,
        annexure9b: null,
        annexure9c: null,
        compositeScore: 0,
        statusBand: "Pending"
      };
      this.facultyRecords.unshift(faculty);
    } else {
      faculty.courseTitle = course;
    }

    // Evaluate the submission
    if (annexureType === '9C') {
      faculty.annexure9c = EvaluatorEngine.evaluateAnnexure9c({
        fileName: this.activeParsedDocument?.fileName || "Annexure_9_c_Submission.docx",
        whatWorked: reflection || "Continuous assessment components conducted per approved syllabus.",
        whatCouldImprove: "Continue refining question rubrics.",
        courseOutcomes: this.activeParsedDocument?.courseOutcomes || [
          "CO1: Formulate domain problems.",
          "CO2: Apply critical evaluation methods.",
          "CO3: Synthesize system architectures."
        ],
        components: [
          { name: "Continuous Internal Assessment (CIA 1)", type: "Summative", co: "CO1, CO2", scored: true, marks: 25 },
          { name: method || "Alternative Practical Assessment", type: "Alternative", co: "CO2, CO3", scored: true, marks: 20 },
          { name: "In-Class Formative Check", type: "Formative", co: "CO1", scored: false, marks: 10 }
        ]
      });
    } else {
      faculty.annexure9b = EvaluatorEngine.evaluateAnnexure9b({
        fileName: this.activeParsedDocument?.fileName || "Annexure_9_b_Submission.docx",
        teachingMethod: method || "Active & Collaborative Learning",
        pedagogicalApproach: "Experiential Learning",
        tools: "College LMS & Digital Worksheets",
        planningPurpose: reflection || "To encourage active learning and higher-order critical thinking.",
        inClassDelivery: reflection || "Conducted structured student-centric activities with peer interaction.",
        impact: "Observed high student engagement and successful attainment of session outcomes.",
        lookingAhead: "Will provide additional practice scaffolding in future offerings."
      });
    }

    // Recompute composite
    const updated = EvaluatorEngine.computeFacultyComposite(faculty);
    Object.assign(faculty, updated);

    // Update active department and active faculty
    this.selectedDepartment = department;
    this.selectedFacultyId = faculty.id;

    const mainDeptSelect = document.getElementById("dept-select-main");
    if (mainDeptSelect) mainDeptSelect.value = department;

    this.saveState();
    this.renderAll();

    // Show result banner
    this.showEvaluationResultBanner(faculty, annexureType);
    this.showToast(`Report evaluated successfully for ${faculty.facultyName}!`, "success");
  }

  showEvaluationResultBanner(faculty, type) {
    const banner = document.getElementById("upload-evaluation-result");
    if (!banner) return;

    banner.classList.remove("hidden");
    const is9b = type === '9B';
    const score = is9b ? faculty.annexure9b?.score : faculty.annexure9c?.score;
    const band = is9b ? faculty.annexure9b?.band : faculty.annexure9c?.band;

    banner.innerHTML = `
      <div class="flex-between flex-wrap gap-2">
        <div>
          <span class="status-badge ${band === 'Exemplary' ? 'badge-success' : 'badge-indigo'}">${band}</span>
          <h3 class="card-title mt-2">Evaluation Completed: ${faculty.facultyName}</h3>
          <p class="card-subtitle">
            ${is9b ? 'Annexure 9(b) Pedagogy Score' : 'Annexure 9(c) Assessment Score'}: 
            <strong>${score}/100</strong> • Department: <strong>${faculty.department}</strong> (${faculty.courseTitle})
          </p>
        </div>
        <button id="view-evaluated-dossier-btn" class="btn btn-primary btn-sm">
          View Faculty Portfolio →
        </button>
      </div>
    `;

    document.getElementById("view-evaluated-dossier-btn")?.addEventListener("click", () => {
      document.getElementById("tab-portfolios")?.click();
    });
  }

  /**
   * Render All Views
   */
  renderAll() {
    this.updateMetricRibbon();
    this.populateFacultyDropdown();
    this.renderFacultyDossier();
    this.renderIqacSummary();
  }

  updateMetricRibbon() {
    const analytics = EvaluatorEngine.computeCollegeAnalytics(this.departments, this.facultyRecords);

    const avgElem = document.getElementById("stat-college-avg");
    if (avgElem) avgElem.textContent = analytics.collegeComposite.toFixed(1);

    const bandElem = document.getElementById("stat-quality-band");
    if (bandElem) {
      bandElem.textContent = analytics.collegeComposite >= 85 ? "Exemplary" : (analytics.collegeComposite >= 75 ? "Proficient" : "Developing");
    }

    const deptText = document.getElementById("stat-active-dept");
    if (deptText) deptText.textContent = this.selectedDepartment;

    const deptFacultyCount = this.facultyRecords.filter(f => f.department === this.selectedDepartment).length;
    const deptCountElem = document.getElementById("stat-dept-count");
    if (deptCountElem) deptCountElem.textContent = `${deptFacultyCount} Faculty`;

    const count9bElem = document.getElementById("stat-count-9b");
    if (count9bElem) count9bElem.textContent = analytics.submitted9bCount;

    const avg9bElem = document.getElementById("stat-avg-9b");
    if (avg9bElem) avg9bElem.textContent = `Avg: ${analytics.collegeAvg9b.toFixed(1)}`;

    const count9cElem = document.getElementById("stat-count-9c");
    if (count9cElem) count9cElem.textContent = analytics.submitted9cCount;

    const avg9cElem = document.getElementById("stat-avg-9c");
    if (avg9cElem) avg9cElem.textContent = `Avg: ${analytics.collegeAvg9c.toFixed(1)}`;
  }

  populateFacultyDropdown() {
    const select = document.getElementById("faculty-select");
    if (!select) return;

    const deptFaculty = this.facultyRecords.filter(f => f.department === this.selectedDepartment);

    if (deptFaculty.length === 0) {
      select.innerHTML = `<option value="">No faculty submitted yet in ${this.selectedDepartment}</option>`;
      this.selectedFacultyId = null;
      return;
    }

    select.innerHTML = deptFaculty.map(f => `
      <option value="${f.id}" ${f.id === this.selectedFacultyId ? 'selected' : ''}>
        ${f.facultyName} (${f.courseCode || f.courseTitle}) - Score: ${f.compositeScore}/100
      </option>
    `).join("");

    if (!deptFaculty.some(f => f.id === this.selectedFacultyId)) {
      this.selectedFacultyId = deptFaculty[0].id;
    }
  }

  renderFacultyDossier() {
    const container = document.getElementById("faculty-detail-container");
    if (!container) return;

    const deptFaculty = this.facultyRecords.filter(f => f.department === this.selectedDepartment);
    const faculty = deptFaculty.find(f => f.id === this.selectedFacultyId) || deptFaculty[0];

    if (!faculty) {
      container.innerHTML = `
        <div class="card p-4 text-center">
          <p style="color: var(--text-muted); margin-bottom: 1rem;">No reports submitted yet for the <strong>${this.selectedDepartment}</strong> department.</p>
          <button id="switch-to-upload-btn" class="btn btn-primary btn-sm">
            Upload Report for ${this.selectedDepartment}
          </button>
        </div>
      `;
      document.getElementById("switch-to-upload-btn")?.addEventListener("click", () => {
        const deptInput = document.getElementById("input-department");
        if (deptInput) deptInput.value = this.selectedDepartment;
        document.getElementById("tab-upload")?.click();
      });
      return;
    }

    const initials = faculty.facultyName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    const b = faculty.annexure9b;
    const c = faculty.annexure9c;

    container.innerHTML = `
      <div class="dossier-wrapper">
        <!-- Header -->
        <div class="dossier-header">
          <div class="dossier-avatar-row">
            <div class="faculty-avatar">${initials}</div>
            <div>
              <h2 class="faculty-meta-title">${faculty.facultyName}</h2>
              <div class="faculty-meta-sub">
                ${faculty.designation} • <strong>${faculty.department}</strong> • Faculty ID: ${faculty.id}
              </div>
              <div class="faculty-meta-sub mt-2">
                <strong>Course:</strong> ${faculty.courseCode || ''} ${faculty.courseTitle}
              </div>
              <div style="font-size: 0.775rem; color: var(--text-muted); margin-top: 0.25rem;">
                Email: ${faculty.email || 'faculty@sjctni.edu'} • Academic Year: ${faculty.academicYear}
              </div>
            </div>
          </div>

          <div class="dossier-score-gauge">
            <div class="gauge-number ${faculty.compositeScore >= 85 ? 'text-emerald' : 'text-indigo'}">
              ${faculty.compositeScore > 0 ? faculty.compositeScore : '--'}
            </div>
            <div class="gauge-label">Quality Score / 100</div>
            <div class="mt-2">
              <span class="status-badge ${faculty.statusBand === 'Exemplary' ? 'badge-success' : 'badge-indigo'}">
                ${faculty.statusBand}
              </span>
            </div>
          </div>
        </div>

        <!-- Annexure 9(b) Section -->
        <div class="annexure-box">
          <div class="annexure-header-row">
            <div>
              <span class="annexure-tag tag-9b">Annexure 9(b)</span>
              <h3 style="display: inline-block; font-size: 1.15rem; margin-left: 0.5rem;">
                Faculty Reflection on Pedagogical Practices
              </h3>
            </div>
            ${b?.submitted ? `<span class="status-badge badge-indigo">Score: ${b.score}/100 (${b.band})</span>` : '<span class="status-badge badge-warning">Not Submitted</span>'}
          </div>

          ${b?.submitted ? `
            <div class="mt-3">
              <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;">
                <div><strong>Teaching Method / Strategy:</strong> ${b.teachingMethod}</div>
                <div><strong>Pedagogical Approach:</strong> ${b.pedagogicalApproach}</div>
                <div><strong>Tools & Materials:</strong> ${b.tools}</div>
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
                <div class="reflection-label">Impact & Evidence of Student Learning</div>
                <div class="reflection-text">${b.impact}</div>
              </div>

              <div class="reflection-item">
                <div class="reflection-label">Looking Ahead & Continuous Improvement</div>
                <div class="reflection-text">${b.lookingAhead}</div>
              </div>

              <div class="grid grid-2 mt-3">
                <div class="feedback-box">
                  <div class="feedback-title">Commendations & Strengths</div>
                  <ul class="feedback-list">
                    ${(b.strengths || []).map(s => `<li class="feedback-item">${s}</li>`).join("")}
                  </ul>
                </div>

                <div class="growth-box">
                  <div class="growth-title">IQAC Recommendations for Improvement</div>
                  <ul class="feedback-list">
                    ${(b.recommendations || []).map(r => `<li class="growth-item">${r}</li>`).join("")}
                  </ul>
                </div>
              </div>
            </div>
          ` : `
            <p style="color: var(--text-muted); padding: 1rem 0;">No Annexure 9(b) submitted for this faculty yet.</p>
          `}
        </div>

        <!-- Annexure 9(c) Section -->
        <div class="annexure-box mt-4">
          <div class="annexure-header-row">
            <div>
              <span class="annexure-tag tag-9c">Annexure 9(c)</span>
              <h3 style="display: inline-block; font-size: 1.15rem; margin-left: 0.5rem;">
                Faculty Reflection on Assessment Components
              </h3>
            </div>
            ${c?.submitted ? `<span class="status-badge badge-success">Score: ${c.score}/100 (${c.band})</span>` : '<span class="status-badge badge-warning">Not Submitted</span>'}
          </div>

          ${c?.submitted ? `
            <div class="mt-3">
              <h4 style="font-size: 0.9rem; margin-bottom: 0.5rem; color: #166534;">Assessment Components Conducted</h4>
              <div class="table-responsive" style="margin-bottom: 1.25rem;">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Component</th>
                      <th>Type</th>
                      <th>Aligned COs</th>
                      <th>Scored / Practice</th>
                      <th>Total Marks</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${(c.components || []).map(comp => `
                      <tr>
                        <td><strong>${comp.name}</strong></td>
                        <td><span class="status-badge ${comp.type === 'Alternative' ? 'badge-success' : 'badge-neutral'}">${comp.type}</span></td>
                        <td>${comp.co || 'CO1, CO2'}</td>
                        <td>${comp.scored ? 'Scored' : 'Practice'}</td>
                        <td><strong>${comp.marks}</strong></td>
                      </tr>
                    `).join("")}
                  </tbody>
                </table>
              </div>

              <div class="reflection-item" style="background: var(--pastel-mint); border-left-color: #22c55e;">
                <div class="reflection-label" style="color: #166534;">What Worked Well in the Assessment Process?</div>
                <div class="reflection-text">${c.whatWorked}</div>
              </div>

              <div class="reflection-item" style="background: var(--pastel-mint); border-left-color: #22c55e;">
                <div class="reflection-label" style="color: #166534;">What Could Be Improved in Future Offerings?</div>
                <div class="reflection-text">${c.whatCouldImprove}</div>
              </div>
            </div>
          ` : `
            <p style="color: var(--text-muted); padding: 1rem 0;">No Annexure 9(c) submitted for this faculty yet.</p>
          `}
        </div>
      </div>
    `;
  }

  /**
   * Render IQAC Department Summary (Simple, Basic, No graphs)
   */
  renderIqacSummary() {
    const analytics = EvaluatorEngine.computeCollegeAnalytics(this.departments, this.facultyRecords);
    
    // 1. Department Summary Table
    const deptTbody = document.getElementById("departments-summary-tbody");
    if (deptTbody) {
      deptTbody.innerHTML = this.departments.map(d => {
        const stats = analytics.deptStats[d.name] || {
          avg9b: 0, avg9c: 0, avgComposite: 0, submittedCount: 0
        };

        return `
          <tr>
            <td><strong>${d.name}</strong> (${d.code})</td>
            <td>${d.hod}</td>
            <td>${d.totalFaculty}</td>
            <td>${stats.avg9b > 0 ? `${stats.avg9b}/100` : '--'}</td>
            <td>${stats.avg9c > 0 ? `${stats.avg9c}/100` : '--'}</td>
            <td><strong style="color: #4338ca;">${stats.avgComposite > 0 ? `${stats.avgComposite}/100` : '--'}</strong></td>
            <td>
              <span class="status-badge ${stats.submittedCount > 0 ? 'badge-success' : 'badge-neutral'}">
                ${stats.submittedCount} Submitted
              </span>
            </td>
            <td>
              <button class="btn btn-outline btn-sm view-dept-action-btn" data-dept="${d.name}">
                View Portfolios →
              </button>
            </td>
          </tr>
        `;
      }).join("");

      deptTbody.querySelectorAll(".view-dept-action-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const dept = btn.getAttribute("data-dept");
          this.selectedDepartment = dept;
          const mainDeptSelect = document.getElementById("dept-select-main");
          if (mainDeptSelect) mainDeptSelect.value = dept;
          this.populateFacultyDropdown();
          this.renderFacultyDossier();
          document.getElementById("tab-portfolios")?.click();
        });
      });
    }

    // 2. All Faculty Registry Table
    const facultyTbody = document.getElementById("all-faculty-registry-tbody");
    if (facultyTbody) {
      facultyTbody.innerHTML = this.facultyRecords.map(f => `
        <tr>
          <td><strong>${f.facultyName}</strong></td>
          <td>${f.department}</td>
          <td>${f.courseTitle}</td>
          <td>${f.annexure9b ? `${f.annexure9b.score}/100` : '--'}</td>
          <td>${f.annexure9c ? `${f.annexure9c.score}/100` : '--'}</td>
          <td><strong style="color: #166534;">${f.compositeScore}/100</strong></td>
          <td><span class="status-badge ${f.statusBand === 'Exemplary' ? 'badge-success' : 'badge-indigo'}">${f.statusBand}</span></td>
        </tr>
      `).join("");
    }
  }

  /**
   * Export All Faculty Records to CSV (Working, Real Data!)
   */
  exportAllToCsv() {
    const headers = [
      "Faculty ID",
      "Faculty Name",
      "Department",
      "Course Code",
      "Course Title",
      "Annexure 9(b) Submitted",
      "Annexure 9(b) Score",
      "Teaching Method (9b)",
      "Annexure 9(c) Submitted",
      "Annexure 9(c) Score",
      "Composite Quality Score",
      "Evaluation Band",
      "Academic Year"
    ];

    const rows = this.facultyRecords.map(f => [
      f.id,
      `"${f.facultyName}"`,
      `"${f.department}"`,
      `"${f.courseCode || ''}"`,
      `"${f.courseTitle || ''}"`,
      f.annexure9b?.submitted ? "Yes" : "No",
      f.annexure9b?.score || "",
      `"${f.annexure9b?.teachingMethod || ''}"`,
      f.annexure9c?.submitted ? "Yes" : "No",
      f.annexure9c?.score || "",
      f.compositeScore,
      f.statusBand,
      `"${f.academicYear || '2025-26'}"`
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `St_Josephs_IQAC_Faculty_Evaluation_Report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    this.showToast("All faculty reports exported to CSV successfully!", "success");
  }

  /**
   * Export Department Summary to CSV
   */
  exportDepartmentSummaryCsv() {
    const analytics = EvaluatorEngine.computeCollegeAnalytics(this.departments, this.facultyRecords);
    const headers = ["Department", "Code", "HOD", "Total Faculty", "Submissions Count", "Annexure 9(b) Avg", "Annexure 9(c) Avg", "Overall Quality Index"];

    const rows = this.departments.map(d => {
      const s = analytics.deptStats[d.name] || {};
      return [
        `"${d.name}"`,
        d.code,
        `"${d.hod}"`,
        d.totalFaculty,
        s.submittedCount || 0,
        s.avg9b || 0,
        s.avg9c || 0,
        s.avgComposite || 0
      ];
    });

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `St_Josephs_IQAC_Department_Summary_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    this.showToast("Department summary exported to CSV!", "success");
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
      <div style="padding: 1.5rem; font-family: sans-serif; color: #0f172a; background: white;">
        <div style="text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 1rem; margin-bottom: 1.5rem;">
          <h2 style="font-size: 1.35rem; font-weight: 800; text-transform: uppercase; margin: 0; color: #0f172a;">${COLLEGE_INFO.institutionName}</h2>
          <h4 style="font-size: 0.95rem; font-weight: 600; color: #475569; margin: 0.2rem 0;">${COLLEGE_INFO.location}</h4>
          <h3 style="font-size: 1.1rem; font-weight: 700; margin: 0.35rem 0 0; color: #1e293b;">${COLLEGE_INFO.cell}</h3>
          <p style="font-size: 0.8rem; color: #64748b; margin: 0.2rem 0 0;">Faculty Pedagogical & Assessment Practices Appraisal Dossier</p>
        </div>

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

        <h4 style="margin: 1rem 0 0.5rem; color: #0f172a; font-size: 0.95rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">
          1. Annexure 9(b): Pedagogical Approach & Reflection (Score: ${b ? `${b.score}/100` : 'Pending'})
        </h4>
        <p style="font-size: 0.85rem; margin-bottom: 0.4rem;"><strong>Teaching Method:</strong> ${b?.teachingMethod || 'N/A'}</p>
        <p style="font-size: 0.825rem; color: #334155; margin-bottom: 0.4rem;"><strong>Planning & Delivery:</strong> ${b?.inClassDelivery || 'N/A'}</p>
        <p style="font-size: 0.825rem; color: #334155; margin-bottom: 1rem;"><strong>Impact:</strong> ${b?.impact || 'N/A'}</p>

        <h4 style="margin: 1rem 0 0.5rem; color: #0f172a; font-size: 0.95rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">
          2. Annexure 9(c): Assessment Components & Reflection (Score: ${c ? `${c.score}/100` : 'Pending'})
        </h4>
        <p style="font-size: 0.85rem; margin-bottom: 0.4rem;"><strong>Assessment Components:</strong> ${c?.components?.length || 0} evaluated</p>
        <p style="font-size: 0.825rem; color: #334155; margin-bottom: 0.4rem;"><strong>What Worked:</strong> ${c?.whatWorked || 'N/A'}</p>
        <p style="font-size: 0.825rem; color: #334155; margin-bottom: 1.5rem;"><strong>Areas for Improvement:</strong> ${c?.whatCouldImprove || 'N/A'}</p>

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

// Bootstrap app
document.addEventListener("DOMContentLoaded", () => {
  new PedApp();
});
