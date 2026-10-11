/**
 * PED PLATFORM - MAIN APPLICATION CONTROLLER
 * Pedagogical & Assessment Practices Evaluation Platform (IQAC)
 */

import { INITIAL_SUBMISSIONS, DEPARTMENTS, ACCREDITATION_BENCHMARKS } from './data/initialData.js';
import { EvaluatorEngine } from './services/evaluator.js';
import { TemplateManager } from './services/templateManager.js';
import { ChartController } from './components/charts.js';

class PedApp {
  constructor() {
    this.submissions = [];
    this.chartCtrl = new ChartController();
    this.selectedFacultyId = null;
    this.selectedDeptFilter = "ALL";
    this.searchQuery = "";

    this.init();
  }

  init() {
    this.loadInitialData();
    this.setupEventListeners();
    this.populateDeptFilter();
    this.renderAll();
  }

  /**
   * Load and evaluate initial demo submissions
   */
  loadInitialData() {
    const saved = localStorage.getItem("ped_submissions");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.submissions = parsed.map(s => EvaluatorEngine.evaluateSubmission(s));
      } catch (e) {
        this.submissions = INITIAL_SUBMISSIONS.map(s => EvaluatorEngine.evaluateSubmission(s));
      }
    } else {
      this.submissions = INITIAL_SUBMISSIONS.map(s => EvaluatorEngine.evaluateSubmission(s));
      this.saveState();
    }

    if (this.submissions.length > 0) {
      this.selectedFacultyId = this.submissions[0].id;
    }
  }

  saveState() {
    localStorage.setItem("ped_submissions", JSON.stringify(this.submissions));
  }

  /**
   * Populate department dropdown in header filter
   */
  populateDeptFilter() {
    const filterSelect = document.getElementById("iqac-dept-filter");
    if (!filterSelect) return;

    filterSelect.innerHTML = `<option value="ALL">All Departments (Institutional)</option>`;
    DEPARTMENTS.forEach(dept => {
      const opt = document.createElement("option");
      opt.value = dept;
      opt.textContent = dept;
      filterSelect.appendChild(opt);
    });
  }

  /**
   * Wire up all UI events and interactions
   */
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
        document.querySelectorAll(".tab-pane").forEach(pane => {
          pane.classList.remove("active");
        });
        const activePane = document.getElementById(targetPane);
        if (activePane) activePane.classList.add("active");

        // Resize charts if tab changed
        if (targetPane === 'iqac-tab') {
          this.renderIqacCharts();
        } else if (targetPane === 'faculty-tab') {
          this.renderFacultyDetail();
        }
      });
    });

    // Reset Demo Data
    document.getElementById("quick-demo-btn")?.addEventListener("click", () => {
      localStorage.removeItem("ped_submissions");
      this.submissions = INITIAL_SUBMISSIONS.map(s => EvaluatorEngine.evaluateSubmission(s));
      this.saveState();
      this.selectedFacultyId = this.submissions[0].id;
      this.renderAll();
      this.showToast("Demo faculty submissions restored successfully!", "success");
    });

    // Department Filter
    document.getElementById("iqac-dept-filter")?.addEventListener("change", (e) => {
      this.selectedDeptFilter = e.target.value;
      this.renderIqacDashboard();
    });

    // Search Box
    document.getElementById("faculty-search-input")?.addEventListener("input", (e) => {
      this.searchQuery = e.target.value.toLowerCase();
      this.renderFacultyTable();
    });

    // Faculty Selector in Individual Tab
    document.getElementById("faculty-select")?.addEventListener("change", (e) => {
      this.selectedFacultyId = e.target.value;
      this.renderFacultyDetail();
    });

    // Print Dossier Buttons
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

    // Export IQAC Dossier Button (in header)
    document.getElementById("export-iqac-summary-btn")?.addEventListener("click", () => {
      this.exportIqacJson();
    });

    // Template Downloads
    document.getElementById("download-json-template-btn")?.addEventListener("click", () => {
      TemplateManager.downloadJsonTemplate();
      this.showToast("JSON template downloaded.", "info");
    });

    document.getElementById("download-csv-template-btn")?.addEventListener("click", () => {
      TemplateManager.downloadCsvTemplate();
      this.showToast("CSV spreadsheet template downloaded.", "info");
    });

    document.getElementById("download-doc-guide-btn")?.addEventListener("click", () => {
      TemplateManager.downloadDocGuide();
      this.showToast("Guidelines and rubrics downloaded.", "info");
    });

    // Quick Sample Loaders in Upload Tab
    document.getElementById("load-sample-upload-btn")?.addEventListener("click", () => {
      const sample = TemplateManager.getSampleExemplaryPayload();
      this.addAndEvaluateSubmission(sample);
      this.showToast("Exemplary report loaded and evaluated!", "success");
    });

    document.getElementById("load-developing-upload-btn")?.addEventListener("click", () => {
      const sample = TemplateManager.getSampleDevelopingPayload();
      this.addAndEvaluateSubmission(sample);
      this.showToast("Developing report loaded (gaps identified for IQAC review).", "info");
    });

    // Manual Form Submission
    const evalForm = document.getElementById("manual-eval-form");
    if (evalForm) {
      evalForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const bloomsInput = document.getElementById("form-blooms").value;
        const sub = {
          facultyName: document.getElementById("form-faculty-name").value,
          facultyId: document.getElementById("form-faculty-id").value,
          department: document.getElementById("form-dept").value,
          courseTitle: document.getElementById("form-course").value,
          pedagogicalPractice: document.getElementById("form-pedagogy").value,
          assessmentMethod: document.getElementById("form-assessment").value,
          bloomsLevels: bloomsInput.split(',').map(s => s.trim()),
          ictTools: document.getElementById("form-ict").value || "LMS",
          practiceDescription: document.getElementById("form-practice-desc").value || "Course assessment execution.",
          studentFeedbackScore: parseFloat(document.getElementById("form-feedback-score").value) || 4.0,
          remedialAction: document.getElementById("form-remedial").value || "Tutorial sessions",
          passPercentage: 88,
          evidenceAttached: true,
          rubricAttached: true,
          submissionDate: new Date().toISOString().split('T')[0]
        };

        this.addAndEvaluateSubmission(sub);
        evalForm.reset();
        this.showToast("Report evaluated and added to institutional registry!", "success");
      });
    }

    // File Dropzone Handling
    this.setupDropzone();
  }

  /**
   * Configure Drag and Drop File Upload Zone
   */
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
      if (files.length > 0) this.handleUploadedFiles(files);
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) this.handleUploadedFiles(e.target.files);
    });
  }

  /**
   * Handle uploaded report files (.json or .csv)
   */
  handleUploadedFiles(files) {
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      const fileName = file.name.toLowerCase();

      reader.onload = (e) => {
        const content = e.target.result;
        try {
          if (fileName.endsWith('.json')) {
            const data = JSON.parse(content);
            const items = Array.isArray(data) ? data : [data];
            items.forEach(item => this.addAndEvaluateSubmission(item, false));
            this.saveState();
            this.renderAll();
            this.showToast(`Successfully evaluated ${items.length} report(s) from ${file.name}`, "success");
          } else if (fileName.endsWith('.csv')) {
            const items = EvaluatorEngine.parseCsv(content);
            if (items.length === 0) {
              this.showToast(`No valid rows parsed from ${file.name}`, "error");
              return;
            }
            items.forEach(item => this.addAndEvaluateSubmission(item, false));
            this.saveState();
            this.renderAll();
            this.showToast(`Successfully evaluated ${items.length} faculty rows from CSV!`, "success");
          } else {
            this.showToast("Please upload a .json or .csv template file.", "error");
          }
        } catch (err) {
          console.error(err);
          this.showToast(`Error parsing file ${file.name}: ${err.message}`, "error");
        }
      };

      reader.readAsText(file);
    });
  }

  /**
   * Add a submission, evaluate it, and update views
   */
  addAndEvaluateSubmission(rawSub, shouldRerender = true) {
    const evaluated = EvaluatorEngine.evaluateSubmission({
      ...rawSub,
      id: rawSub.id || `SUB-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    });

    this.submissions.unshift(evaluated);
    this.selectedFacultyId = evaluated.id;

    if (shouldRerender) {
      this.saveState();
      this.renderAll();
      this.showEvaluationResultBanner(evaluated);
    }
  }

  /**
   * Display immediate result card in upload tab
   */
  showEvaluationResultBanner(evaluated) {
    const banner = document.getElementById("upload-evaluation-result");
    if (!banner) return;

    banner.classList.remove("hidden");
    banner.innerHTML = `
      <div class="flex-between">
        <div>
          <span class="status-badge ${evaluated.bandClass}">${evaluated.band}</span>
          <h3 class="card-title mt-2">Evaluation Completed: ${evaluated.facultyName} (${evaluated.courseTitle})</h3>
          <p class="card-subtitle">Calculated Quality Score: <strong>${evaluated.totalScore}/100</strong> • Department: ${evaluated.department}</p>
        </div>
        <button id="view-evaluated-dossier-btn" class="btn btn-primary btn-sm">
          View Individual Dossier
        </button>
      </div>
    `;

    document.getElementById("view-evaluated-dossier-btn")?.addEventListener("click", () => {
      const facTab = document.getElementById("tab-faculty");
      if (facTab) facTab.click();
    });
  }

  /**
   * Render all dashboards and data views
   */
  renderAll() {
    this.renderMetricRibbon();
    this.renderIqacDashboard();
    this.populateFacultyDropdown();
    this.renderFacultyDetail();
  }

  /**
   * Render Top Executive Metric Ribbon
   */
  renderMetricRibbon() {
    const analytics = EvaluatorEngine.computeIqacAnalytics(this.submissions);

    document.getElementById("stat-total-submissions").textContent = analytics.totalSubmissions;
    document.getElementById("stat-avg-score").textContent = analytics.averageScore.toFixed(1);
    
    const bandElem = document.getElementById("stat-quality-band");
    bandElem.textContent = analytics.qualityBand;
    bandElem.className = `metric-badge ${analytics.qualityBand === 'Exemplary' ? 'badge-success' : 'badge-indigo'}`;

    document.getElementById("stat-higher-order").textContent = `${analytics.higherOrderRatio}%`;
    document.getElementById("stat-naac-compliance").textContent = `${analytics.naacCompliance}%`;
  }

  /**
   * Render IQAC Tab
   */
  renderIqacDashboard() {
    this.renderIqacCharts();
    this.renderAccreditationMatrix();
    this.renderFacultyTable();
  }

  /**
   * Render IQAC Charts using ChartController
   */
  renderIqacCharts() {
    const filteredSubs = this.selectedDeptFilter === "ALL"
      ? this.submissions
      : this.submissions.filter(s => s.department === this.selectedDeptFilter);

    const analytics = EvaluatorEngine.computeIqacAnalytics(filteredSubs);

    this.chartCtrl.renderDeptPerformance('deptPerformanceChart', analytics.deptAverages);
    this.chartCtrl.renderPedagogyDistribution('pedagogyDistributionChart', analytics.pedagogyAdoption);
    this.chartCtrl.renderBloomsInstitutional('bloomsInstitutionChart', analytics.bloomsAggregates);
  }

  /**
   * Render Accreditation Indicators Matrix
   */
  renderAccreditationMatrix() {
    const container = document.getElementById("accreditation-indicators");
    if (!container) return;

    const analytics = EvaluatorEngine.computeIqacAnalytics(this.submissions);

    const values = {
      "naac-2.3.1": analytics.naacCompliance,
      "naac-2.5.1": Math.min(100, Math.round((this.submissions.filter(s => s.rubricAttached).length / (this.submissions.length || 1)) * 100)),
      "nba-obe-crit3": analytics.higherOrderRatio,
      "ict-integration": Math.round((this.submissions.filter(s => s.criteria.ictIntegration.score >= 12).length / (this.submissions.length || 1)) * 100)
    };

    container.innerHTML = ACCREDITATION_BENCHMARKS.map(bench => {
      const val = values[bench.id] || 75;
      const isTargetMet = val >= bench.target;
      const colorClass = isTargetMet ? 'fill-emerald' : 'fill-amber';

      return `
        <div class="accreditation-item">
          <div class="acc-info">
            <div class="acc-title">${bench.criterion}: ${bench.title}</div>
            <div class="acc-desc">Institutional Benchmark Target: ≥ ${bench.target}${bench.unit}</div>
          </div>
          <div class="acc-bar-wrap">
            <div class="acc-pct ${isTargetMet ? 'text-emerald' : 'text-indigo'}">${val}%</div>
            <div class="progress-bar">
              <div class="progress-fill ${colorClass}" style="width: ${Math.min(100, val)}%"></div>
            </div>
          </div>
        </div>
      `;
    }).join("");
  }

  /**
   * Render Faculty Audit Table
   */
  renderFacultyTable() {
    const tbody = document.getElementById("iqac-faculty-table-body");
    if (!tbody) return;

    let items = this.submissions;
    if (this.selectedDeptFilter !== "ALL") {
      items = items.filter(s => s.department === this.selectedDeptFilter);
    }
    if (this.searchQuery) {
      items = items.filter(s => 
        (s.facultyName || "").toLowerCase().includes(this.searchQuery) ||
        (s.courseTitle || "").toLowerCase().includes(this.searchQuery) ||
        (s.pedagogicalPractice || "").toLowerCase().includes(this.searchQuery) ||
        (s.department || "").toLowerCase().includes(this.searchQuery)
      );
    }

    if (items.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 2rem; color: var(--text-dim);">No faculty submissions found matching the criteria.</td></tr>`;
      return;
    }

    tbody.innerHTML = items.map(s => `
      <tr>
        <td>
          <div class="faculty-cell-name">${s.facultyName}</div>
          <div class="faculty-cell-id">${s.facultyId}</div>
        </td>
        <td>${s.department}</td>
        <td><strong>${s.courseCode || ''}</strong> ${s.courseTitle}</td>
        <td><span class="status-badge badge-neutral">${s.pedagogicalPractice}</span></td>
        <td>${Array.isArray(s.bloomsLevels) ? s.bloomsLevels.join(", ") : s.bloomsLevels}</td>
        <td><span class="score-badge ${s.totalScore >= 85 ? 'text-emerald' : (s.totalScore >= 70 ? 'text-indigo' : 'text-cyan')}">${s.totalScore}</span>/100</td>
        <td><span class="status-badge ${s.bandClass}">${s.band}</span></td>
        <td>
          <button class="btn btn-outline btn-sm view-faculty-btn" data-id="${s.id}">
            View Dossier
          </button>
        </td>
      </tr>
    `).join("");

    // Attach row button handlers
    tbody.querySelectorAll(".view-faculty-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        this.selectedFacultyId = btn.getAttribute("data-id");
        const facTab = document.getElementById("tab-faculty");
        if (facTab) facTab.click();
      });
    });
  }

  /**
   * Populate Faculty Selector Dropdown
   */
  populateFacultyDropdown() {
    const select = document.getElementById("faculty-select");
    if (!select) return;

    select.innerHTML = this.submissions.map(s => `
      <option value="${s.id}" ${s.id === this.selectedFacultyId ? 'selected' : ''}>
        ${s.facultyName} - ${s.department} (${s.courseCode || s.courseTitle})
      </option>
    `).join("");
  }

  /**
   * Render Individual Faculty Dossier View
   */
  renderFacultyDetail() {
    const container = document.getElementById("faculty-detail-container");
    if (!container) return;

    const faculty = this.submissions.find(s => s.id === this.selectedFacultyId) || this.submissions[0];
    if (!faculty) {
      container.innerHTML = `<p class="text-muted">No faculty report selected.</p>`;
      return;
    }

    // Initials for avatar
    const initials = faculty.facultyName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

    container.innerHTML = `
      <div class="dossier-wrapper">
        <!-- Header -->
        <div class="dossier-header">
          <div class="dossier-avatar-row">
            <div class="faculty-avatar">${initials}</div>
            <div>
              <h2 class="faculty-meta-title">${faculty.facultyName}</h2>
              <div class="faculty-meta-sub">
                ${faculty.designation} • ${faculty.department} • Emp ID: ${faculty.facultyId}
              </div>
              <div class="faculty-meta-sub mt-2">
                <strong>Course:</strong> ${faculty.courseCode || ''} ${faculty.courseTitle} (${faculty.academicYear})
              </div>
            </div>
          </div>

          <div class="dossier-score-gauge">
            <div class="gauge-number ${faculty.totalScore >= 85 ? 'text-emerald' : 'text-indigo'}">
              ${faculty.totalScore}
            </div>
            <div class="gauge-label">Quality Score / 100</div>
            <div class="mt-2">
              <span class="status-badge ${faculty.bandClass}">${faculty.band}</span>
            </div>
          </div>
        </div>

        <!-- 2 Column: Criteria Bars & Radar Chart -->
        <div class="grid grid-2">
          <!-- 5-Criteria Score Breakdown -->
          <div class="card criteria-breakdown-card">
            <h3 class="card-title">Multi-Criteria Score Breakdown</h3>
            <p class="card-subtitle">Scored against institutional IQAC teaching-learning rubrics</p>

            ${this.renderCriterionRow(faculty.criteria.pedagogyInnovation, 'fill-indigo')}
            ${this.renderCriterionRow(faculty.criteria.bloomsAlignment, 'fill-emerald')}
            ${this.renderCriterionRow(faculty.criteria.obeRubrics, 'fill-cyan')}
            ${this.renderCriterionRow(faculty.criteria.ictIntegration, 'fill-indigo')}
            ${this.renderCriterionRow(faculty.criteria.remedialImpact, 'fill-amber')}

            <div class="mt-3 p-3" style="background: rgba(255,255,255,0.03); border-radius: 8px;">
              <div style="font-size: 0.825rem; color: var(--text-muted);">
                <strong>Pedagogical Practice:</strong> ${faculty.pedagogicalPractice}
              </div>
              <div style="font-size: 0.825rem; color: var(--text-muted); margin-top: 0.25rem;">
                <strong>Assessment Mode:</strong> ${faculty.assessmentMethod}
              </div>
              <div style="font-size: 0.825rem; color: var(--text-muted); margin-top: 0.25rem;">
                <strong>Digital / ICT Tools:</strong> ${faculty.ictTools}
              </div>
              <div style="font-size: 0.825rem; color: var(--text-muted); margin-top: 0.25rem;">
                <strong>Student Feedback:</strong> ${faculty.studentFeedbackScore}/5.0 • Pass Rate: ${faculty.passPercentage}%
              </div>
            </div>
          </div>

          <!-- Radar Chart -->
          <div class="card chart-card">
            <h3 class="card-title">Competency Radar vs IQAC Benchmark</h3>
            <p class="card-subtitle">Visual alignment with institutional quality baseline</p>
            <div class="chart-container">
              <canvas id="facultyRadarChart"></canvas>
            </div>
          </div>
        </div>

        <!-- Qualitative Strengths & Recommendations -->
        <div class="grid grid-2 mt-4">
          <div class="feedback-box">
            <div class="feedback-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              Verified Pedagogical Strengths & Commendations
            </div>
            <ul class="feedback-list">
              ${faculty.strengths.map(s => `<li class="feedback-item">${s}</li>`).join("")}
            </ul>
          </div>

          <div class="growth-box">
            <div class="growth-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              IQAC Quality Cell Recommendations for Growth
            </div>
            <ul class="feedback-list">
              ${faculty.recommendations.map(r => `<li class="growth-item">${r}</li>`).join("")}
            </ul>
          </div>
        </div>

        <!-- Faculty Bloom's Distribution Chart -->
        <div class="card mt-4">
          <h3 class="card-title">Course Cognitive Taxonomy Weight Distribution</h3>
          <p class="card-subtitle">Estimated cognitive proportion in course questions & projects (Remember → Create)</p>
          <div class="chart-container" style="height: 220px;">
            <canvas id="facultyBloomsChart"></canvas>
          </div>
        </div>
      </div>
    `;

    // Render faculty charts
    setTimeout(() => {
      this.chartCtrl.renderFacultyRadar('facultyRadarChart', faculty.criteria);
      this.chartCtrl.renderFacultyBlooms('facultyBloomsChart', faculty.cognitiveBreakdown);
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
   * Open Print Modal with formal official academic appraisal layout
   */
  openPrintModal() {
    const faculty = this.submissions.find(s => s.id === this.selectedFacultyId) || this.submissions[0];
    if (!faculty) return;

    const modal = document.getElementById("dossier-modal");
    const content = document.getElementById("modal-content-area");
    if (!modal || !content) return;

    content.innerHTML = `
      <div style="padding: 1.5rem; font-family: sans-serif; color: #1e293b; background: white; border-radius: 8px;">
        <div style="text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 1rem; margin-bottom: 1.5rem;">
          <h2 style="font-size: 1.4rem; font-weight: 800; text-transform: uppercase; margin: 0; color: #0f172a;">Internal Quality Assurance Cell (IQAC)</h2>
          <h3 style="font-size: 1.1rem; font-weight: 600; margin: 0.25rem 0; color: #475569;">Faculty Pedagogical & Assessment Practices Appraisal Dossier</h3>
          <p style="font-size: 0.8rem; color: #64748b; margin: 0;">Academic Year: ${faculty.academicYear} • Audit Date: ${new Date().toLocaleDateString()}</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 1.5rem; font-size: 0.9rem;">
          <tr>
            <td style="padding: 6px; border: 1px solid #cbd5e1; font-weight: bold; background: #f8fafc; width: 25%;">Faculty Name:</td>
            <td style="padding: 6px; border: 1px solid #cbd5e1;">${faculty.facultyName}</td>
            <td style="padding: 6px; border: 1px solid #cbd5e1; font-weight: bold; background: #f8fafc; width: 25%;">Faculty ID:</td>
            <td style="padding: 6px; border: 1px solid #cbd5e1;">${faculty.facultyId}</td>
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
            <td style="padding: 6px; border: 1px solid #cbd5e1; font-weight: bold; background: #f8fafc;">Evaluation Band:</td>
            <td style="padding: 6px; border: 1px solid #cbd5e1; font-weight: bold; color: #0f172a;">${faculty.band} (${faculty.totalScore}/100)</td>
          </tr>
        </table>

        <h4 style="margin: 1rem 0 0.5rem; color: #0f172a; font-size: 1rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">1. Rubric Evaluation Score Breakdown</h4>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 1.5rem; font-size: 0.85rem;">
          <tr style="background: #f1f5f9;">
            <th style="padding: 6px; border: 1px solid #cbd5e1; text-align: left;">Evaluation Dimension</th>
            <th style="padding: 6px; border: 1px solid #cbd5e1; text-align: center;">Max Marks</th>
            <th style="padding: 6px; border: 1px solid #cbd5e1; text-align: center;">Marks Awarded</th>
          </tr>
          <tr>
            <td style="padding: 6px; border: 1px solid #cbd5e1;">Pedagogical Innovation & Active Learning (NAAC 2.3.1)</td>
            <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center;">25</td>
            <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold;">${faculty.criteria.pedagogyInnovation.score}</td>
          </tr>
          <tr>
            <td style="padding: 6px; border: 1px solid #cbd5e1;">Bloom's Taxonomy Higher-Order Rigor (NBA Crit 3)</td>
            <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center;">25</td>
            <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold;">${faculty.criteria.bloomsAlignment.score}</td>
          </tr>
          <tr>
            <td style="padding: 6px; border: 1px solid #cbd5e1;">Outcome-Based Rubric Rigor (NAAC 2.5.1)</td>
            <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center;">20</td>
            <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold;">${faculty.criteria.obeRubrics.score}</td>
          </tr>
          <tr>
            <td style="padding: 6px; border: 1px solid #cbd5e1;">ICT Tools & Digital Simulation Integration</td>
            <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center;">15</td>
            <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold;">${faculty.criteria.ictIntegration.score}</td>
          </tr>
          <tr>
            <td style="padding: 6px; border: 1px solid #cbd5e1;">Student Feedback & Remedial Loop</td>
            <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center;">15</td>
            <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold;">${faculty.criteria.remedialImpact.score}</td>
          </tr>
          <tr style="background: #f8fafc; font-weight: bold;">
            <td style="padding: 6px; border: 1px solid #cbd5e1;">Aggregate Quality Index</td>
            <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center;">100</td>
            <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center; color: #16a34a; font-size: 1rem;">${faculty.totalScore}</td>
          </tr>
        </table>

        <h4 style="margin: 1rem 0 0.5rem; color: #0f172a; font-size: 1rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">2. Commendations & Strengths</h4>
        <ul style="font-size: 0.85rem; padding-left: 1.25rem; margin-bottom: 1rem; color: #334155;">
          ${faculty.strengths.map(s => `<li>${s}</li>`).join("")}
        </ul>

        <h4 style="margin: 1rem 0 0.5rem; color: #0f172a; font-size: 1rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">3. Recommendations for Enhancement</h4>
        <ul style="font-size: 0.85rem; padding-left: 1.25rem; margin-bottom: 2rem; color: #334155;">
          ${faculty.recommendations.map(r => `<li>${r}</li>`).join("")}
        </ul>

        <div style="display: flex; justify-content: space-between; margin-top: 3rem; padding-top: 1rem; border-top: 1px dashed #94a3b8; font-size: 0.85rem;">
          <div style="text-align: center;">
            <div style="margin-bottom: 2rem;">________________________</div>
            <strong>Faculty Signature</strong>
          </div>
          <div style="text-align: center;">
            <div style="margin-bottom: 2rem;">________________________</div>
            <strong>Head of Department (HOD)</strong>
          </div>
          <div style="text-align: center;">
            <div style="margin-bottom: 2rem;">________________________</div>
            <strong>IQAC Coordinator</strong>
          </div>
        </div>
      </div>
    `;

    modal.classList.remove("hidden");
  }

  /**
   * Export institutional IQAC summary report in JSON format
   */
  exportIqacJson() {
    const analytics = EvaluatorEngine.computeIqacAnalytics(this.submissions);
    const exportPayload = {
      institution: "Internal Quality Assurance Cell (IQAC)",
      academicYear: "2025-26",
      generatedAt: new Date().toISOString(),
      institutionalMetrics: analytics,
      facultySubmissions: this.submissions
    };

    const jsonString = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", jsonString);
    dlAnchor.setAttribute("download", `IQAC_Pedagogy_Evaluation_Report_${new Date().toISOString().split('T')[0]}.json`);
    dlAnchor.click();
    this.showToast("IQAC Institutional Dossier exported successfully!", "success");
  }

  /**
   * Helper to display notifications
   */
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

// Bootstrap application on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  new PedApp();
});
