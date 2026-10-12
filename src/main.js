/**
 * PED PLATFORM - AUTOMATED BULK DOCUMENT INGESTION & EVALUATION ENGINE
 * St. Joseph's College (Autonomous), Tiruchirappalli - IQAC Platform
 * 
 * Features:
 * 1. Bulk background checking of 600+ documents (drag-and-drop, multi-file, or folder upload).
 * 2. Zero manual form typing: directly parses inner tables, Course Outcomes, and reflection text.
 * 3. Automatic classification into departments and faculty portfolios.
 * 4. Strict IQAC scoring rubrics: 0 credit for missing content or name-only documents.
 * 5. Asynchronous non-blocking queue with live progress bar and status counters.
 * 6. Live updates across Submissions, Faculty Reports, and IQAC Analytics.
 * 7. Real exports: Multi-sheet Excel workbook, CSV logs, printable PDF dossiers.
 */

import { DEPARTMENTS_DATA, INITIAL_FACULTY_RECORDS, COLLEGE_INFO } from './data/initialData.js';
import { EvaluatorEngine } from './services/evaluator.js';
import { DocumentParser } from './services/documentParser.js';
import { EvidenceVerifier } from './services/evidenceVerifier.js';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  RUBRIC_9B_CONFIG, 
  RUBRIC_9C_CONFIG, 
  STANDARDIZED_PEDAGOGIES, 
  STANDARDIZED_ASSESSMENTS,
  mapToStandardPedagogies,
  mapToStandardAssessments
} from './services/rubrics.js';

class PedApp {
  constructor() {
    this.departments = [...DEPARTMENTS_DATA];
    this.facultyRecords = [];
    this.submissionsLog = [];
    this.selectedDepartment = "Computer Science";
    this.selectedFacultyId = null;
    this.isProcessingBatch = false;

    // Filters for Submissions Table
    this.submissionSearchQuery = "";
    this.submissionStatusFilter = "ALL";
    this.submissionDeptFilter = "ALL";

    // Filters for IQAC Analytics
    this.analyticsFilters = {
      academicYear: "ALL",
      semester: "ALL",
      department: "ALL",
      programme: "ALL",
      annexure: "ALL"
    };

    this.init();
  }

  init() {
    this.loadState();
    this.setupEventListeners();
    this.populateDepartmentDropdowns();
    this.renderAll();
  }

  loadState() {
    const saved = localStorage.getItem("ped_college_faculty_v3");
    if (saved) {
      try {
        this.facultyRecords = JSON.parse(saved);
      } catch (e) {
        this.initializeDefaultRecords();
      }
    } else {
      this.initializeDefaultRecords();
    }

    const savedLog = localStorage.getItem("ped_submissions_log_v3");
    if (savedLog) {
      try {
        this.submissionsLog = JSON.parse(savedLog);
      } catch (e) {
        this.submissionsLog = [];
      }
    }

    // Default initial selection
    const deptFaculty = this.facultyRecords.filter(f => f.department === this.selectedDepartment);
    if (deptFaculty.length > 0) {
      this.selectedFacultyId = deptFaculty[0].id;
    } else if (this.facultyRecords.length > 0) {
      this.selectedFacultyId = this.facultyRecords[0].id;
      this.selectedDepartment = this.facultyRecords[0].department;
    }
  }

  initializeDefaultRecords() {
    this.facultyRecords = INITIAL_FACULTY_RECORDS.map(f => {
      const copy = { ...f, isDemoData: true };
      if (copy.annexure9b) {
        copy.annexure9b = EvaluatorEngine.evaluateAnnexure9b({
          ...copy.annexure9b,
          facultyName: copy.facultyName,
          department: copy.department,
          courseTitle: copy.courseTitle,
          courseCode: copy.courseCode,
          isDemoData: true
        });
      }
      if (copy.annexure9c) {
        copy.annexure9c = EvaluatorEngine.evaluateAnnexure9c({
          ...copy.annexure9c,
          facultyName: copy.facultyName,
          department: copy.department,
          courseTitle: copy.courseTitle,
          courseCode: copy.courseCode,
          isDemoData: true
        });
      }
      return EvaluatorEngine.computeFacultyComposite(copy);
    });

    this.submissionsLog = [];
    this.facultyRecords.forEach(f => {
      if (f.annexure9b) {
        this.submissionsLog.push({
          id: `SUB-9B-${f.id}`,
          date: f.annexure9b.submissionDate || "2026-09-18",
          fileName: f.annexure9b.fileName || "Annexure_9b.docx",
          facultyName: f.facultyName,
          facultyId: f.id,
          department: f.department,
          annexure: "Annexure 9(b)",
          course: `${f.courseCode || ''} ${f.courseTitle || ''}`.trim(),
          completeness: f.annexure9b.submissionCompleteness,
          evidenceStatus: f.annexure9b.evidenceStatus,
          qualityScore: f.annexure9b.qualityScore,
          evaluationStatus: f.annexure9b.evaluationStatus,
          evaluationData: f.annexure9b
        });
      }
      if (f.annexure9c) {
        this.submissionsLog.push({
          id: `SUB-9C-${f.id}`,
          date: f.annexure9c.submissionDate || "2026-09-25",
          fileName: f.annexure9c.fileName || "Annexure_9c.docx",
          facultyName: f.facultyName,
          facultyId: f.id,
          department: f.department,
          annexure: "Annexure 9(c)",
          course: `${f.courseCode || ''} ${f.courseTitle || ''}`.trim(),
          completeness: f.annexure9c.submissionCompleteness,
          evidenceStatus: f.annexure9c.evidenceStatus,
          qualityScore: f.annexure9c.qualityScore,
          evaluationStatus: f.annexure9c.evaluationStatus,
          evaluationData: f.annexure9c
        });
      }
    });

    this.saveState();
  }

  saveState() {
    localStorage.setItem("ped_college_faculty_v3", JSON.stringify(this.facultyRecords));
    localStorage.setItem("ped_submissions_log_v3", JSON.stringify(this.submissionsLog));
  }

  setupEventListeners() {
    // 4 Primary Navigation Tabs
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

        if (targetPane === 'faculty-reports-tab') {
          this.renderFacultyDossier();
        } else if (targetPane === 'iqac-analytics-tab') {
          this.renderIqacAnalytics();
        } else if (targetPane === 'submissions-tab') {
          this.renderSubmissionsRegistryTable();
        }
      });
    });

    // Bulk File Selection Handlers
    this.setupBulkFileSelection();

    // Department & Faculty Selectors on Faculty Reports Tab
    document.getElementById("dept-select-main")?.addEventListener("change", (e) => {
      this.selectedDepartment = e.target.value;
      this.populateFacultyDropdown();
      this.renderFacultyDossier();
    });

    document.getElementById("faculty-select")?.addEventListener("change", (e) => {
      this.selectedFacultyId = e.target.value;
      this.renderFacultyDossier();
    });

    // Sample Batch Test Button
    document.getElementById("load-test-sample-btn")?.addEventListener("click", async () => {
      await this.runSampleBatchTest();
    });

    // Reset to Calibration Baseline
    document.getElementById("clear-custom-submissions-btn")?.addEventListener("click", () => {
      if (confirm("Reset portal to baseline calibration data? All uploaded batch records will be cleared.")) {
        localStorage.removeItem("ped_college_faculty_v3");
        localStorage.removeItem("ped_submissions_log_v3");
        this.initializeDefaultRecords();
        this.renderAll();
        document.getElementById("batch-progress-card")?.classList.add("hidden");
        document.getElementById("upload-evaluation-result")?.classList.add("hidden");
        this.showToast("Portal reset to baseline calibration data.", "info");
      }
    });

    // Submissions Registry Table Filters & Search
    document.getElementById("search-submissions-input")?.addEventListener("input", (e) => {
      this.submissionSearchQuery = e.target.value.toLowerCase().trim();
      this.renderSubmissionsRegistryTable();
    });

    document.getElementById("filter-submissions-status")?.addEventListener("change", (e) => {
      this.submissionStatusFilter = e.target.value;
      this.renderSubmissionsRegistryTable();
    });

    document.getElementById("filter-submissions-dept")?.addEventListener("change", (e) => {
      this.submissionDeptFilter = e.target.value;
      this.renderSubmissionsRegistryTable();
    });

    // Print & PDF Export Handlers
    document.getElementById("download-faculty-pdf-btn")?.addEventListener("click", () => {
      this.downloadFacultyPdf();
    });
    document.getElementById("download-institutional-pdf-btn")?.addEventListener("click", () => {
      this.downloadInstitutionalPdf();
    });
    document.getElementById("print-dossier-btn")?.addEventListener("click", () => {
      this.openPrintModal("faculty");
    });
    document.getElementById("print-institutional-btn")?.addEventListener("click", () => {
      this.openPrintModal("institutional");
    });
    document.getElementById("modal-download-pdf-btn")?.addEventListener("click", () => {
      if (this.currentModalMode === "institutional") {
        this.downloadInstitutionalPdf();
      } else {
        this.downloadFacultyPdf();
      }
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

    // Export Excel / CSV Buttons
    document.getElementById("export-excel-btn")?.addEventListener("click", () => {
      this.exportInstitutionalExcelWorkbook();
    });
    document.getElementById("download-submissions-csv-btn")?.addEventListener("click", () => {
      this.exportSubmissionsCsv();
    });
    document.getElementById("export-faculty-csv-btn")?.addEventListener("click", () => {
      this.exportSelectedFacultyCsv();
    });
    document.getElementById("export-summary-table-btn")?.addEventListener("click", () => {
      this.exportDepartmentSummaryCsv();
    });

    // Analytics Filters
    ["analytics-filter-ay", "analytics-filter-sem", "analytics-filter-dept", "analytics-filter-prog", "analytics-filter-annexure"].forEach(id => {
      document.getElementById(id)?.addEventListener("change", () => {
        this.updateAnalyticsFilters();
      });
    });
  }

  /**
   * Sets up drag-and-drop and multiple file/folder buttons
   */
  setupBulkFileSelection() {
    const dropzone = document.getElementById("file-dropzone");
    const fileInputMultiple = document.getElementById("file-input-multiple");
    const folderInput = document.getElementById("folder-input");
    const btnFiles = document.getElementById("btn-browse-files");
    const btnFolder = document.getElementById("btn-browse-folder");

    if (!dropzone) return;

    btnFiles?.addEventListener("click", (e) => {
      e.stopPropagation();
      fileInputMultiple?.click();
    });

    btnFolder?.addEventListener("click", (e) => {
      e.stopPropagation();
      folderInput?.click();
    });

    dropzone.addEventListener("click", (e) => {
      // Don't trigger if clicked a child button
      if (e.target.tagName !== "BUTTON" && !e.target.closest("button")) {
        fileInputMultiple?.click();
      }
    });

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
      const files = Array.from(e.dataTransfer.files || []);
      if (files.length > 0) {
        this.processFilesBatch(files);
      }
    });

    fileInputMultiple?.addEventListener('change', (e) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) {
        this.processFilesBatch(files);
      }
    });

    folderInput?.addEventListener('change', (e) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) {
        this.processFilesBatch(files);
      }
    });
  }

  /**
   * Asynchronous, non-blocking batch processing pipeline for 600+ documents.
   * Reads documents in the background, extracts content, evaluates against rubrics,
   * and updates all portal data automatically.
   */
  async processFilesBatch(fileList) {
    if (!fileList || fileList.length === 0) return;
    if (this.isProcessingBatch) {
      this.showToast("Another batch is currently processing. Please wait...", "warning");
      return;
    }

    this.isProcessingBatch = true;

    // Filter for Word and PDF documents
    const validFiles = fileList.filter(f => {
      const n = f.name.toLowerCase();
      return n.endsWith('.docx') || n.endsWith('.doc') || n.endsWith('.pdf');
    });

    if (validFiles.length === 0) {
      this.showToast("No Word (.docx) or PDF (.pdf) documents found in selection.", "error");
      this.isProcessingBatch = false;
      return;
    }

    // Display Batch Progress Card
    const progressCard = document.getElementById("batch-progress-card");
    const progressFill = document.getElementById("batch-progress-fill");
    const statusTitle = document.getElementById("batch-status-title");
    const currentFileText = document.getElementById("batch-current-file-text");
    const countDisplay = document.getElementById("batch-count-display");
    const percentageDisplay = document.getElementById("batch-percentage-display");
    const spinner = document.getElementById("batch-spinner");

    const statVerified = document.getElementById("batch-stat-verified");
    const statProvisional = document.getElementById("batch-stat-provisional");
    const statIncomplete = document.getElementById("batch-stat-incomplete");
    const statFailed = document.getElementById("batch-stat-failed");

    if (progressCard) progressCard.classList.remove("hidden");
    if (spinner) spinner.style.display = "inline-block";
    if (statusTitle) statusTitle.textContent = `Batch Ingestion Active: Checking ${validFiles.length} Documents in Background...`;

    let verifiedCount = 0;
    let provisionalCount = 0;
    let incompleteCount = 0;
    let failedCount = 0;

    const total = validFiles.length;
    this.showToast(`Starting automated background check for ${total} documents...`, "info");

    for (let i = 0; i < total; i++) {
      const file = validFiles[i];

      // Update Live UI Counters
      const pct = Math.round(((i + 1) / total) * 100);
      if (progressFill) progressFill.style.width = `${pct}%`;
      if (countDisplay) countDisplay.textContent = `${i + 1} / ${total}`;
      if (percentageDisplay) percentageDisplay.textContent = `${pct}% Completed`;
      if (currentFileText) currentFileText.textContent = `Analyzing: ${file.name} (${(file.size / 1024).toFixed(1)} KB)...`;

      // Non-blocking yield for browser paint loop
      await new Promise(resolve => setTimeout(resolve, 5));

      try {
        const parsed = await DocumentParser.parseFile(file);
        let evaluation;

        if (parsed.extractionFailed || parsed.isCorrupted) {
          failedCount++;
          evaluation = EvaluatorEngine.generateExtractionFailureEvaluation(
            parsed.type || "ANNEXURE_9B",
            { fileName: file.name, facultyName: parsed.facultyName || "Unknown Faculty" },
            RUBRIC_9B_CONFIG
          );
        } else if (parsed.type === "ANNEXURE_9C") {
          evaluation = EvaluatorEngine.evaluateAnnexure9c({
            ...parsed,
            fileName: file.name,
            isDemoData: false
          });
        } else {
          evaluation = EvaluatorEngine.evaluateAnnexure9b({
            ...parsed,
            fileName: file.name,
            isDemoData: false
          });
        }

        // Tally outcome
        if (evaluation.evaluationStatus === "Verified") verifiedCount++;
        else if (evaluation.evaluationStatus === "Incomplete — Not Evaluable") incompleteCount++;
        else if (evaluation.evaluationStatus.includes("Failed")) failedCount++;
        else provisionalCount++;

        // Update Counter DOM
        if (statVerified) statVerified.textContent = verifiedCount;
        if (statProvisional) statProvisional.textContent = provisionalCount;
        if (statIncomplete) statIncomplete.textContent = incompleteCount;
        if (statFailed) statFailed.textContent = failedCount;

        // Register in Faculty Records & Submissions
        this.registerEvaluatedSubmission(evaluation, file.name);

      } catch (err) {
        console.error("Batch processing error on file:", file.name, err);
        failedCount++;
        if (statFailed) statFailed.textContent = failedCount;
      }

      // Periodically update table every 10 files or on the last file
      if ((i + 1) % 10 === 0 || i === total - 1) {
        this.saveState();
        this.updateMetricRibbon();
        this.renderSubmissionsRegistryTable();
      }
    }

    // Batch Complete
    if (spinner) spinner.style.display = "none";
    if (statusTitle) statusTitle.textContent = `Batch Processing Complete: ${total} Documents Analyzed & Recorded`;
    if (currentFileText) currentFileText.textContent = `All records updated across Submissions, Faculty Reports, and IQAC Analytics.`;

    this.isProcessingBatch = false;
    this.saveState();
    this.renderAll();

    this.showToast(
      `Batch of ${total} documents verified: ${verifiedCount} Verified, ${provisionalCount} Provisional, ${incompleteCount} Incomplete (0 Score).`,
      "success"
    );
  }

  /**
   * Registers a single evaluated document into faculty portfolios and submissions log
   */
  registerEvaluatedSubmission(evaluation, fileName) {
    const facultyName = evaluation.facultyName || "Unidentified Faculty";
    const department = evaluation.department || "General";
    const is9c = evaluation.type === "ANNEXURE_9C";

    // Find existing faculty by name & department, or create new
    let faculty = this.facultyRecords.find(f => 
      f.facultyName.toLowerCase() === facultyName.toLowerCase() &&
      f.department.toLowerCase() === department.toLowerCase()
    );

    if (!faculty) {
      faculty = {
        id: `FAC-${Date.now().toString().slice(-4)}-${Math.floor(Math.random() * 900 + 100)}`,
        facultyName: facultyName,
        designation: "Assistant Professor",
        department: department,
        programme: evaluation.programme || "Undergraduate / Postgraduate",
        courseCode: evaluation.courseCode || "CRS",
        courseTitle: evaluation.courseTitle || "Course Offering",
        academicYear: evaluation.academicYear || "2025-26",
        email: `${facultyName.toLowerCase().replace(/[^a-z]/g, '')}@sjctni.edu`,
        annexure9b: null,
        annexure9c: null,
        compositeScore: 0,
        statusBand: "Needs Improvement",
        isDemoData: false
      };
      this.facultyRecords.unshift(faculty);
    } else {
      if (evaluation.courseTitle) faculty.courseTitle = evaluation.courseTitle;
      faculty.isDemoData = false;
    }

    if (is9c) {
      faculty.annexure9c = evaluation;
    } else {
      faculty.annexure9b = evaluation;
    }

    // Recompute faculty composite score
    const updated = EvaluatorEngine.computeFacultyComposite(faculty);
    Object.assign(faculty, updated);

    // Append to Submissions Log (avoid duplicate IDs)
    const subId = `SUB-${is9c ? '9C' : '9B'}-${faculty.id}-${Date.now().toString().slice(-4)}`;
    this.submissionsLog.unshift({
      id: subId,
      date: evaluation.submissionDate || new Date().toISOString().split('T')[0],
      fileName: fileName,
      facultyName: facultyName,
      facultyId: faculty.id,
      department: department,
      annexure: is9c ? "Annexure 9(c)" : "Annexure 9(b)",
      course: `${evaluation.courseCode || ''} ${evaluation.courseTitle || ''}`.trim() || faculty.courseTitle,
      completeness: evaluation.submissionCompleteness,
      evidenceStatus: evaluation.evidenceStatus,
      qualityScore: evaluation.qualityScore,
      evaluationStatus: evaluation.evaluationStatus,
      evaluationData: evaluation
    });

    this.selectedDepartment = department;
    this.selectedFacultyId = faculty.id;
  }

  /**
   * Demonstrates bulk testing with 5 diverse sample cases:
   * 1. Empty/Name-only doc (strictly 0 points)
   * 2. Corrupted file (Extraction failure)
   * 3. Generic boilerplate submission (Low score < 45)
   * 4. High quality with missing evidence (Provisional, evidence 0%)
   * 5. Exemplary complete submission (Verified, 94 pts)
   */
  async runSampleBatchTest() {
    this.showToast("Generating 6 diverse test documents (including Geotagged Photo Verification)...", "info");

    const sampleSubmissions = [
      {
        fileName: "Sample_01_Name_Only_Submission.docx",
        type: "ANNEXURE_9B",
        facultyName: "Dr. Name Only Candidate",
        department: "Computer Science",
        courseTitle: "Distributed Systems",
        teachingMethod: "",
        planningPurpose: "",
        inClassDelivery: "",
        impact: "",
        lookingAhead: "",
        evidenceAttached: ""
      },
      {
        fileName: "Sample_02_Corrupted_Upload.docx",
        type: "ANNEXURE_9B",
        facultyName: "Dr. Archive Corrupted",
        department: "Mathematics",
        extractionFailed: true,
        isCorrupted: true
      },
      {
        fileName: "Sample_03_Generic_Photo_No_GPS.docx",
        type: "ANNEXURE_9B",
        facultyName: "Dr. Standard Lecturer",
        department: "Commerce",
        courseTitle: "Corporate Accounting",
        teachingMethod: "Conducted standard lecture and usual chalk and talk",
        planningPurpose: "Regular class conducted as per syllabus schedule",
        inClassDelivery: "Standard lecture delivered, read from textbook",
        coAlignment: "General topic covered in regular session",
        impact: "Students understood the topics well and all went well",
        lookingAhead: "Normal lecture planned for future classes",
        evidenceAttached: "Classroom photo attached without GPS metadata",
        evidenceAudit: {
          status: "Human Review Required",
          score: 6,
          imagesCount: 1,
          isGeotagConfirmed: false,
          rationale: "1 photo attached in document, but embedded EXIF GPS tags are absent or were stripped during compression. Manual review required.",
          recommendation: "Use GPS Map Camera to ensure coordinate timestamps are visible."
        }
      },
      {
        fileName: "Sample_04_Detailed_No_Evidence.docx",
        type: "ANNEXURE_9B",
        facultyName: "Dr. S. Maria (Rich Reflection)",
        department: "Physics",
        courseTitle: "Quantum Mechanics",
        teachingMethod: "Flipped Classroom with peer code sprint",
        pedagogicalApproach: "Collaborative learning and inquiry-based problem solving",
        planningPurpose: "To enable students to actively debate wave functions and achieve higher-order cognitive mastery",
        inClassDelivery: "Students worked in pairs for 45 minutes calculating probability densities while instructor facilitated",
        coAlignment: "CO2, CO3: Apply boundary conditions to wave equations",
        impact: "Pre-quiz 42% accuracy, post-sprint lab tasks achieved 88% first-pass pass rate",
        lookingAhead: "Strong engagement in peer debates. Next offering will include matrix tutorials",
        evidenceAttached: "None",
        evidenceAudit: {
          status: "Missing",
          score: 0,
          imagesCount: 0,
          isGeotagConfirmed: false,
          rationale: "No embedded photos or verifiable links attached.",
          recommendation: "Attach geotagged photos to satisfy Section D compliance."
        }
      },
      {
        fileName: "Sample_05_Geotagged_Photo_Evidence.docx",
        type: "ANNEXURE_9B",
        facultyName: "Dr. K. Anand (Geotagged Evidence)",
        department: "Information Technology",
        courseTitle: "Cloud Security & Threat Modeling",
        teachingMethod: "Virtual Security Sandbox & Hands-On Threat Modeling",
        pedagogicalApproach: "Problem-Based Collaborative Learning",
        planningPurpose: "Designed session around MITRE ATT&CK matrix to teach real-time intrusion response",
        inClassDelivery: "Students worked in 3-member red/blue teams executing packet captures on Kali Linux VMs",
        coAlignment: "CO1, CO3: Implement public-key cryptosystems and intrusion detection rules",
        impact: "100% of teams correctly mitigated simulated DNS spoofing attacks within allotted time",
        lookingAhead: "Introduce live cloud container honeypots in the next laboratory session",
        evidenceAttached: "2 Geotagged classroom photos attached: Lat 10.8291° N, Long 78.6883° E (GPS Map Camera, St. Joseph's College campus)",
        evidenceAudit: {
          status: "Verified",
          score: 10,
          imagesCount: 2,
          isGeotagConfirmed: true,
          geotagDetails: {
            latitude: 10.8291,
            longitude: 78.6883,
            isCampus: true,
            locationLabel: "St. Joseph's College Campus, Tiruchirappalli",
            timestamp: "2026-09-20"
          },
          rationale: "Verified campus geotagged photos attached (10.8291°N, 78.6883°E). Coordinates match St. Joseph's College campus.",
          recommendation: "Continue maintaining visual archives for NAAC Criterion 2.3.1."
        }
      },
      {
        fileName: "Sample_06_Exemplar_Assessment.docx",
        type: "ANNEXURE_9C",
        facultyName: "Dr. A. Francis (Exemplar CIE)",
        department: "Computer Science",
        courseTitle: "Cloud Architecture",
        courseOutcomes: [
          { code: "CO1", text: "Design distributed microservices" },
          { code: "CO2", text: "Evaluate container orchestration security" },
          { code: "CO3", text: "Deploy Kubernetes clusters on AWS" }
        ],
        components: [
          { name: "CIA 1 Written Exam", type: "Summative", co: "CO1, CO2", announcedDate: "2026-08-15", preMaterials: "Blueprint & question bank", completionDate: "2026-08-28", postMaterials: "Model answers", scored: true, maxMarks: 50 },
          { name: "Kubernetes Cloud Sprint", type: "Alternative", co: "CO2, CO3", announcedDate: "2026-09-05", preMaterials: "Docker rubric & repos", completionDate: "2026-09-20", postMaterials: "Automated PR comments", scored: true, maxMarks: 30 }
        ],
        whatWorked: "Hands-on containerization sprint drove 95% pass rate on live test cases.",
        whatCouldImprove: "Stagger initial setup milestones for beginners.",
        evidenceAttached: "https://lms.sjctni.edu/cs/cloud_sprint_dossier.pdf"
      }
    ];

    // Process through the batch pipeline
    const progressCard = document.getElementById("batch-progress-card");
    const progressFill = document.getElementById("batch-progress-fill");
    const statusTitle = document.getElementById("batch-status-title");
    const countDisplay = document.getElementById("batch-count-display");
    const currentFileText = document.getElementById("batch-current-file-text");

    if (progressCard) progressCard.classList.remove("hidden");
    if (statusTitle) statusTitle.textContent = "Processing Sample Batch (6 Documents)...";

    const totalSamples = sampleSubmissions.length;
    for (let i = 0; i < totalSamples; i++) {
      const item = sampleSubmissions[i];
      if (progressFill) progressFill.style.width = `${((i + 1) / totalSamples) * 100}%`;
      if (countDisplay) countDisplay.textContent = `${i + 1} / ${totalSamples}`;
      if (currentFileText) currentFileText.textContent = `Analyzing: ${item.fileName}...`;

      await new Promise(resolve => setTimeout(resolve, 200));

      let evaluation;
      if (item.extractionFailed) {
        evaluation = EvaluatorEngine.generateExtractionFailureEvaluation(
          item.type, { fileName: item.fileName, facultyName: item.facultyName }, RUBRIC_9B_CONFIG
        );
      } else if (item.type === "ANNEXURE_9C") {
        evaluation = EvaluatorEngine.evaluateAnnexure9c({ ...item, isDemoData: false });
      } else {
        evaluation = EvaluatorEngine.evaluateAnnexure9b({ ...item, isDemoData: false });
      }

      this.registerEvaluatedSubmission(evaluation, item.fileName);
    }

    if (statusTitle) statusTitle.textContent = "Sample Batch Verification Complete (5 Documents Analyzed)";
    this.saveState();
    this.renderAll();
    this.renderEvaluationResultBanner(this.submissionsLog[0].evaluationData);

    this.showToast("Batch test complete! Check results table below.", "success");
  }

  /**
   * Renders the Submissions Registry Table with instant search and multi-criteria filters
   */
  renderSubmissionsRegistryTable() {
    const tbody = document.getElementById("submissions-registry-tbody");
    if (!tbody) return;

    let filtered = this.submissionsLog;

    // Apply Search Query
    if (this.submissionSearchQuery) {
      filtered = filtered.filter(s => 
        (s.facultyName || "").toLowerCase().includes(this.submissionSearchQuery) ||
        (s.course || "").toLowerCase().includes(this.submissionSearchQuery) ||
        (s.fileName || "").toLowerCase().includes(this.submissionSearchQuery) ||
        (s.department || "").toLowerCase().includes(this.submissionSearchQuery)
      );
    }

    // Apply Status Filter
    if (this.submissionStatusFilter !== "ALL") {
      filtered = filtered.filter(s => s.evaluationStatus === this.submissionStatusFilter);
    }

    // Apply Department Filter
    if (this.submissionDeptFilter !== "ALL") {
      filtered = filtered.filter(s => s.department === this.submissionDeptFilter);
    }

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9" style="text-align: center; color: var(--text-muted); padding: 2rem;">
            No submissions matched your filter criteria (${this.submissionsLog.length} total on record).
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map(sub => {
      const statusBadge = sub.evaluationStatus === "Verified" 
        ? "badge-success" 
        : (sub.evaluationStatus === "Incomplete — Not Evaluable" ? "badge-danger" : "badge-warning");

      const ev = sub.evaluationData || {};
      const isGeotagConfirmed = Boolean(ev.isGeotagConfirmed);
      const imagesCount = ev.imagesCount || 0;
      const geotagCoords = ev.geotagDetails?.latitude 
        ? `${ev.geotagDetails.latitude.toFixed(4)}°N, ${ev.geotagDetails.longitude.toFixed(4)}°E` 
        : null;

      let evidenceLabel = sub.evidenceStatus;
      let evidenceBadgeClass = sub.evidenceStatus === "Verified" ? "badge-success" : (sub.evidenceStatus === "Missing" ? "badge-danger" : "badge-warning");

      if (isGeotagConfirmed) {
        evidenceLabel = `📍 GPS Geotagged`;
        evidenceBadgeClass = "badge-success";
      } else if (imagesCount > 0) {
        evidenceLabel = `📸 Photos (${imagesCount}) • GPS Unverified`;
        evidenceBadgeClass = "badge-warning";
      } else if (sub.evidenceStatus === "Missing") {
        evidenceLabel = "Missing Evidence";
        evidenceBadgeClass = "badge-danger";
      }

      return `
        <tr>
          <td><span style="font-family: monospace; font-size: 0.775rem;">${sub.date}</span></td>
          <td>
            <strong>${sub.facultyName}</strong>
            <div style="font-size: 0.725rem; color: var(--text-muted);">${sub.fileName || 'document.docx'}</div>
          </td>
          <td>${sub.department}</td>
          <td><span class="badge ${sub.annexure.includes('9(b)') ? 'badge-indigo' : 'badge-success'}">${sub.annexure}</span></td>
          <td>${sub.completeness}%</td>
          <td>
            <span class="status-badge ${evidenceBadgeClass}" title="${geotagCoords ? `GPS Coordinates: ${geotagCoords}` : sub.evidenceStatus}">
              ${evidenceLabel}
            </span>
            ${geotagCoords ? `<div style="font-size: 0.675rem; color: #15803d; font-family: monospace; font-weight: 600; margin-top: 2px;">📍 ${geotagCoords}</div>` : ''}
          </td>
          <td>
            <strong style="color: ${sub.qualityScore === 0 ? '#e11d48' : '#4338ca'}; font-size: 0.95rem;">
              ${sub.qualityScore}
            </strong>/100
          </td>
          <td><span class="status-badge ${statusBadge}">${sub.evaluationStatus}</span></td>
          <td>
            <div class="d-flex gap-1">
              <button class="btn btn-outline btn-sm view-sub-btn" data-facid="${sub.facultyId}" title="View Individual Faculty Report">
                View Report →
              </button>
              <button class="btn btn-outline btn-sm inspect-sub-btn" data-subid="${sub.id}" title="Inspect Rubric Evaluation">
                Inspect
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join("");

    tbody.querySelectorAll(".view-sub-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const facId = btn.getAttribute("data-facid");
        this.selectedFacultyId = facId;
        const fac = this.facultyRecords.find(f => f.id === facId);
        if (fac) {
          this.selectedDepartment = fac.department;
          const mainDeptSelect = document.getElementById("dept-select-main");
          if (mainDeptSelect) mainDeptSelect.value = fac.department;
        }
        this.populateFacultyDropdown();
        this.renderFacultyDossier();
        document.getElementById("tab-faculty-reports")?.click();
      });
    });

    tbody.querySelectorAll(".inspect-sub-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const subId = btn.getAttribute("data-subid");
        const sub = this.submissionsLog.find(s => s.id === subId);
        if (sub && sub.evaluationData) {
          this.renderEvaluationResultBanner(sub.evaluationData);
        }
      });
    });
  }

  /**
   * Renders the evaluation banner when inspecting a submission
   */
  renderEvaluationResultBanner(ev) {
    const box = document.getElementById("upload-evaluation-result");
    if (!box || !ev) return;

    box.classList.remove("hidden");

    const statusBadgeClass = ev.evaluationStatus === "Verified" 
      ? "badge-success" 
      : (ev.evaluationStatus === "Incomplete — Not Evaluable" ? "badge-danger" : "badge-warning");

    const evidenceBadgeClass = ev.evidenceStatus === "Verified"
      ? "badge-success"
      : (ev.evidenceStatus === "Missing" ? "badge-danger" : "badge-warning");

    box.innerHTML = `
      <div class="card p-4" style="border: 2px solid var(--pastel-lavender-border); background: white;">
        <div class="flex-between flex-wrap gap-2 mb-3 pb-2" style="border-bottom: 1px solid var(--border-card);">
          <div>
            <div class="d-flex align-items-center gap-2">
              <h2 style="font-size: 1.2rem; font-weight: 800; color: var(--text-main); margin: 0;">
                Audited Document: ${ev.facultyName}
              </h2>
              <span class="status-badge ${statusBadgeClass}">${ev.evaluationStatus}</span>
            </div>
            <p style="font-size: 0.825rem; color: var(--text-muted); margin-top: 0.2rem;">
              ${ev.type === 'ANNEXURE_9C' ? 'Annexure 9(c): Assessment Components' : 'Annexure 9(b): Pedagogical Practices'} • Rubric Version: ${ev.rubricVersion} • File: ${ev.fileName || 'document.docx'}
            </p>
          </div>
          <div class="d-flex gap-2">
            <button class="btn btn-primary btn-sm" id="btn-goto-faculty-report">
              View Complete Faculty Report →
            </button>
            <button class="btn btn-outline btn-sm" id="btn-close-eval-banner">✕ Close</button>
          </div>
        </div>

        <!-- 4 Distinct Measures (User Specification 1) -->
        <div class="grid grid-4 mb-4">
          <div class="metric-card p-3" style="background: var(--pastel-sky); border-color: var(--pastel-sky-border);">
            <div class="metric-label" style="font-size: 0.75rem;">1. Submission Completeness</div>
            <div class="metric-value-row">
              <span class="metric-value" style="font-size: 1.6rem;">${ev.submissionCompleteness}%</span>
            </div>
            <div class="metric-subtext">Required rubric sections filled</div>
          </div>

          <div class="metric-card p-3" style="background: var(--pastel-mint); border-color: var(--pastel-mint-border);">
            <div class="metric-label" style="font-size: 0.75rem;">2. Evidence Compliance</div>
            <div class="metric-value-row">
              <span class="metric-value" style="font-size: 1.6rem;">${ev.evidenceCompliance}%</span>
              <span class="status-badge ${evidenceBadgeClass}" style="font-size: 0.7rem;">${ev.evidenceStatus}</span>
            </div>
            <div class="metric-subtext">Verifiable attached evidence</div>
          </div>

          <div class="metric-card p-3" style="background: var(--pastel-lavender); border-color: var(--pastel-lavender-border);">
            <div class="metric-label" style="font-size: 0.75rem;">3. Quality Score</div>
            <div class="metric-value-row">
              <span class="metric-value text-indigo" style="font-size: 1.6rem;">${ev.qualityScore}/100</span>
              <span class="status-badge badge-indigo" style="font-size: 0.7rem;">${ev.statusBand}</span>
            </div>
            <div class="metric-subtext">Derived from assessable criteria</div>
          </div>

          <div class="metric-card p-3" style="background: var(--pastel-peach); border-color: var(--pastel-peach-border);">
            <div class="metric-label" style="font-size: 0.75rem;">4. Documentation Quality</div>
            <div class="metric-value-row">
              <span class="metric-value" style="font-size: 1.6rem;">${ev.overallDocumentationQuality}/100</span>
            </div>
            <div class="metric-subtext">Composite documentation index</div>
          </div>
        </div>

        <!-- Geotag & Visual Evidence Audit (NAAC Criterion 2.3.1) -->
        <div class="mb-4 p-3" style="background: ${ev.isGeotagConfirmed ? '#f0fdf4' : (ev.imagesCount > 0 ? '#fffbeb' : '#f8fafc')}; border: 1px solid ${ev.isGeotagConfirmed ? '#bbf7d0' : (ev.imagesCount > 0 ? '#fde68a' : '#e2e8f0')}; border-radius: var(--radius-md);">
          <div class="flex-between flex-wrap gap-2">
            <div>
              <h4 style="font-size: 0.9rem; font-weight: 700; color: ${ev.isGeotagConfirmed ? '#166534' : (ev.imagesCount > 0 ? '#92400e' : '#334155')}; display: flex; align-items: center; gap: 0.4rem; margin: 0;">
                <span>${ev.isGeotagConfirmed ? '📍' : (ev.imagesCount > 0 ? '📸' : '📎')}</span>
                Visual Evidence & Geotag Verification Result (NAAC 2.3.1)
              </h4>
              <p style="font-size: 0.8rem; color: #475569; margin: 0.25rem 0 0;">
                ${ev.criteriaResults?.find(c => c.criterionId.includes("evidence") || c.criterionId.includes("Evidence"))?.reason || (ev.isGeotagConfirmed ? "Geotagged photos verified" : "No visual artifacts attached")}
              </p>
            </div>
            <div class="text-right">
              <span class="status-badge ${ev.isGeotagConfirmed ? 'badge-success' : (ev.imagesCount > 0 ? 'badge-warning' : 'badge-danger')}">
                ${ev.isGeotagConfirmed ? 'Verified (GPS Geotag)' : (ev.imagesCount > 0 ? `Photos (${ev.imagesCount}) • GPS Unverified` : ev.evidenceStatus)}
              </span>
              ${ev.geotagDetails?.latitude ? `
                <div style="font-size: 0.725rem; font-family: monospace; color: #166534; font-weight: 600; margin-top: 0.25rem;">
                  Coords: ${ev.geotagDetails.latitude.toFixed(4)}°N, ${ev.geotagDetails.longitude.toFixed(4)}°E (${ev.geotagDetails.isCampus ? "St. Joseph's Campus Match" : "Off-Campus"})
                </div>
              ` : ''}
            </div>
          </div>
        </div>

        <!-- Deficiencies & Required Corrections (User Specification 1 & 4) -->
        ${ev.deficiencies && ev.deficiencies.length > 0 ? `
          <div class="mb-3 p-3" style="background: #fff1f2; border: 1px solid #fecdd3; border-radius: var(--radius-md);">
            <h4 style="font-size: 0.9rem; font-weight: 700; color: #9f1239; margin-bottom: 0.35rem;">
              ⚠️ Deficiencies Identified (Must be corrected before credit)
            </h4>
            <ul style="margin-left: 1.25rem; font-size: 0.825rem; color: #881337;">
              ${ev.deficiencies.map(d => `<li>${d}</li>`).join("")}
            </ul>
          </div>
        ` : ''}

        <!-- Criterion-Wise Breakdown -->
        <h4 style="font-size: 0.9rem; font-weight: 700; margin-bottom: 0.5rem; color: var(--text-main);">
          Criterion-Wise Rubric Evaluation
        </h4>
        <div class="table-responsive">
          <table class="data-table" style="font-size: 0.8rem;">
            <thead>
              <tr>
                <th>Criterion</th>
                <th>Points</th>
                <th>Supporting Document Text</th>
                <th>Rationale</th>
                <th>Review Status</th>
              </tr>
            </thead>
            <tbody>
              ${(ev.criteriaResults || []).map(c => `
                <tr>
                  <td><strong>${c.criterionName}</strong></td>
                  <td><strong>${c.awardedPoints}</strong> / ${c.maxPoints}</td>
                  <td style="max-width: 280px; word-break: break-word; color: ${c.awardedPoints === 0 ? '#e11d48' : '#334155'};">
                    ${c.supportingText || '[Missing from submission]'}
                  </td>
                  <td style="max-width: 260px;">${c.reason}</td>
                  <td>
                    <span class="status-badge ${c.reviewStatus === 'Verified' ? 'badge-success' : (c.reviewStatus === 'Missing' ? 'badge-danger' : 'badge-warning')}">
                      ${c.reviewStatus}
                    </span>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;

    document.getElementById("btn-goto-faculty-report")?.addEventListener("click", () => {
      document.getElementById("tab-faculty-reports")?.click();
    });

    document.getElementById("btn-close-eval-banner")?.addEventListener("click", () => {
      box.classList.add("hidden");
    });

    box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /**
   * Renders Individual Faculty Report with the 3 Mandatory Sections:
   * 1. Deficiencies identified
   * 2. Specific improvements required
   * 3. Recommendations for the next academic cycle
   */
  renderFacultyDossier() {
    const container = document.getElementById("faculty-detail-container");
    if (!container) return;

    const faculty = this.facultyRecords.find(f => f.id === this.selectedFacultyId) || this.facultyRecords[0];
    if (!faculty) {
      container.innerHTML = `<div class="card p-4 text-center">No faculty member found for department ${this.selectedDepartment}.</div>`;
      return;
    }

    const b = faculty.annexure9b;
    const c = faculty.annexure9c;

    const allDeficiencies = [...(b?.deficiencies || []), ...(c?.deficiencies || [])];
    const allImprovements = [...(b?.improvements || []), ...(c?.improvements || [])];
    const allRecommendations = [...(b?.recommendations || []), ...(c?.recommendations || [])];

    container.innerHTML = `
      <div class="card p-4">
        <!-- Faculty Appraisal Header -->
        <div class="dossier-header-grid">
          <div>
            <div class="d-flex align-items-center gap-2 mb-1">
              <h2 style="font-size: 1.45rem; font-weight: 800; color: var(--text-main); margin: 0;">
                ${faculty.facultyName}
              </h2>
              <span class="status-badge ${faculty.evaluationStatus === 'Verified' ? 'badge-success' : 'badge-warning'}">
                ${faculty.evaluationStatus || 'Provisional — Review Required'}
              </span>
            </div>
            <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 0.75rem;">
              ${faculty.designation} • Department of ${faculty.department} • St. Joseph's College (Autonomous)
            </p>
            <div class="d-flex flex-wrap gap-2">
              <span class="info-pill">📚 ${faculty.courseCode || ''} ${faculty.courseTitle}</span>
              <span class="info-pill">📅 Academic Year: ${faculty.academicYear || '2025-26'}</span>
              <span class="info-pill">✉️ ${faculty.email}</span>
            </div>
          </div>

          <div class="dossier-score-gauge">
            <div class="gauge-number text-indigo">
              ${faculty.compositeScore}
            </div>
            <div class="gauge-label">Composite Quality Index / 100</div>
            <div class="mt-2">
              <span class="status-badge ${faculty.compositeScore >= 85 ? 'badge-success' : (faculty.compositeScore >= 70 ? 'badge-indigo' : 'badge-warning')}">
                ${faculty.statusBand}
              </span>
            </div>
          </div>
        </div>

        <!-- THE 3 MANDATORY FACULTY REPORT SECTIONS (User Specification 4) -->
        <div class="mt-4">
          <h3 style="font-size: 1.05rem; font-weight: 800; color: var(--text-main); margin-bottom: 0.75rem;">
            Faculty Development & Corrective Action Summary
          </h3>

          <div class="grid grid-3 gap-3 mb-4">
            <!-- 1. Deficiencies Identified -->
            <div class="card p-3" style="background: #fff1f2; border-color: #fecdd3;">
              <h4 style="font-size: 0.9rem; font-weight: 700; color: #9f1239; margin-bottom: 0.4rem; display: flex; align-items: center; gap: 0.4rem;">
                <span>⚠️</span> 1. Deficiencies Identified
              </h4>
              <p style="font-size: 0.75rem; color: #881337; margin-bottom: 0.5rem;">
                Missing elements or unverified claims requiring correction:
              </p>
              ${allDeficiencies.length > 0 ? `
                <ul style="font-size: 0.8rem; color: #881337; margin-left: 1.15rem; line-height: 1.45;">
                  ${allDeficiencies.map(d => `<li>${d}</li>`).join("")}
                </ul>
              ` : `
                <p style="font-size: 0.8rem; color: #166534; font-weight: 600;">No documentation deficiencies identified.</p>
              `}
            </div>

            <!-- 2. Specific Improvements Required -->
            <div class="card p-3" style="background: #fffbeb; border-color: #fde68a;">
              <h4 style="font-size: 0.9rem; font-weight: 700; color: #92400e; margin-bottom: 0.4rem; display: flex; align-items: center; gap: 0.4rem;">
                <span>🎯</span> 2. Specific Improvements Required
              </h4>
              <p style="font-size: 0.75rem; color: #78350f; margin-bottom: 0.5rem;">
                Pedagogical or assessment modifications needed:
              </p>
              ${allImprovements.length > 0 ? `
                <ul style="font-size: 0.8rem; color: #78350f; margin-left: 1.15rem; line-height: 1.45;">
                  ${allImprovements.map(imp => `<li>${imp}</li>`).join("")}
                </ul>
              ` : `
                <p style="font-size: 0.8rem; color: #166534; font-weight: 600;">Teaching and assessment methods meet rubric benchmarks.</p>
              `}
            </div>

            <!-- 3. Recommendations for Next Academic Cycle -->
            <div class="card p-3" style="background: #f0fdf4; border-color: #bbf7d0;">
              <h4 style="font-size: 0.9rem; font-weight: 700; color: #166534; margin-bottom: 0.4rem; display: flex; align-items: center; gap: 0.4rem;">
                <span>🌱</span> 3. Recommendations for Next Cycle
              </h4>
              <p style="font-size: 0.75rem; color: #14532d; margin-bottom: 0.5rem;">
                Strategic guidance for the upcoming course offering:
              </p>
              ${allRecommendations.length > 0 ? `
                <ul style="font-size: 0.8rem; color: #14532d; margin-left: 1.15rem; line-height: 1.45;">
                  ${allRecommendations.map(r => `<li>${r}</li>`).join("")}
                </ul>
              ` : `
                <p style="font-size: 0.8rem; color: #14532d;">Disseminate this pedagogical practice across the department.</p>
              `}
            </div>
          </div>
        </div>

        <!-- ANNEXURE 9(b) REPORT SECTION -->
        <div class="annexure-box mt-4">
          <div class="annexure-header-row">
            <div>
              <span class="annexure-tag tag-9b">Annexure 9(b)</span>
              <h3 style="display: inline-block; font-size: 1.15rem; margin-left: 0.5rem; color: var(--text-main);">
                Reflection on Pedagogical Practices
              </h3>
            </div>
            ${b ? `
              <div class="d-flex align-items-center gap-2">
                <span class="status-badge badge-indigo">Quality: ${b.qualityScore}/100</span>
                <span class="status-badge ${b.evaluationStatus === 'Verified' ? 'badge-success' : 'badge-warning'}">${b.evaluationStatus}</span>
              </div>
            ` : '<span class="status-badge badge-neutral">Not Submitted</span>'}
          </div>

          ${b ? `
            <div class="mt-3">
              <div class="grid grid-3 gap-2 mb-3 p-3" style="background: var(--bg-subtle); border-radius: var(--radius-sm); font-size: 0.8rem;">
                <div><strong>Completeness:</strong> ${b.submissionCompleteness}%</div>
                <div><strong>Evidence Compliance:</strong> ${b.evidenceCompliance}% (${b.evidenceStatus})</div>
                <div><strong>Pedagogies Mapped:</strong> ${(b.standardizedPedagogies || []).join(", ") || "Lecture"}</div>
              </div>

              <!-- Photographic Evidence & Geotag Verification Banner -->
              <div class="mb-3 p-3" style="background: ${b.isGeotagConfirmed ? '#f0fdf4' : (b.imagesCount > 0 ? '#fffbeb' : '#f8fafc')}; border: 1px solid ${b.isGeotagConfirmed ? '#bbf7d0' : (b.imagesCount > 0 ? '#fde68a' : '#e2e8f0')}; border-radius: var(--radius-sm);">
                <div class="flex-between flex-wrap gap-2">
                  <div>
                    <h5 style="font-size: 0.85rem; font-weight: 700; color: ${b.isGeotagConfirmed ? '#166534' : (b.imagesCount > 0 ? '#92400e' : '#334155')}; margin: 0; display: flex; align-items: center; gap: 0.35rem;">
                      <span>${b.isGeotagConfirmed ? '📍' : (b.imagesCount > 0 ? '📸' : '📎')}</span>
                      Section D: Photographic Evidence & Geotag Audit (NAAC Criterion 2.3.1)
                    </h5>
                    <p style="font-size: 0.775rem; color: #475569; margin: 0.2rem 0 0;">
                      ${b.criteriaResults?.find(cr => cr.criterionId === 'evidenceCompleteness')?.reason || (b.isGeotagConfirmed ? 'Verified classroom photographs attached' : 'No visual evidence attached')}
                    </p>
                  </div>
                  <div class="text-right">
                    <span class="status-badge ${b.isGeotagConfirmed ? 'badge-success' : (b.imagesCount > 0 ? 'badge-warning' : 'badge-danger')}">
                      ${b.isGeotagConfirmed ? 'Verified (GPS Geotag)' : (b.imagesCount > 0 ? `Photos (${b.imagesCount}) • GPS Unverified` : b.evidenceStatus)}
                    </span>
                    ${b.geotagDetails?.latitude ? `
                      <div style="font-size: 0.7rem; font-family: monospace; color: #166534; font-weight: 600; margin-top: 0.2rem;">
                        Coords: ${b.geotagDetails.latitude.toFixed(4)}°N, ${b.geotagDetails.longitude.toFixed(4)}°E (${b.geotagDetails.isCampus ? "St. Joseph's Campus Match" : "Off-Campus"})
                      </div>
                    ` : ''}
                  </div>
                </div>
              </div>

              <!-- Criterion Breakdown Table with Exact Supporting Text -->
              <h4 style="font-size: 0.85rem; font-weight: 700; margin-bottom: 0.4rem;">Criterion-by-Criterion Evaluation & Supporting Text</h4>
              <div class="table-responsive">
                <table class="data-table" style="font-size: 0.775rem;">
                  <thead>
                    <tr>
                      <th style="width: 22%;">Rubric Criterion</th>
                      <th style="width: 10%;">Score</th>
                      <th style="width: 32%;">Supporting Document Text</th>
                      <th style="width: 26%;">Evaluation Rationale</th>
                      <th style="width: 10%;">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${(b.criteriaResults || []).map(c => `
                      <tr>
                        <td><strong>${c.criterionName}</strong></td>
                        <td><strong>${c.awardedPoints}</strong> / ${c.maxPoints}</td>
                        <td style="word-break: break-word; color: ${c.awardedPoints === 0 ? '#e11d48' : '#334155'};">
                          ${c.supportingText || '[Missing from submission]'}
                        </td>
                        <td>${c.reason}</td>
                        <td>
                          <span class="status-badge ${c.reviewStatus === 'Verified' ? 'badge-success' : (c.reviewStatus === 'Missing' ? 'badge-danger' : 'badge-warning')}">
                            ${c.reviewStatus}
                          </span>
                        </td>
                      </tr>
                    `).join("")}
                  </tbody>
                </table>
              </div>
            </div>
          ` : '<p style="color: var(--text-muted); padding: 1rem 0;">No Annexure 9(b) report submitted yet.</p>'}
        </div>

        <!-- ANNEXURE 9(c) REPORT SECTION -->
        <div class="annexure-box mt-4">
          <div class="annexure-header-row">
            <div>
              <span class="annexure-tag tag-9c">Annexure 9(c)</span>
              <h3 style="display: inline-block; font-size: 1.15rem; margin-left: 0.5rem; color: var(--text-main);">
                Reflection on Assessment Components
              </h3>
            </div>
            ${c ? `
              <div class="d-flex align-items-center gap-2">
                <span class="status-badge badge-success">Quality: ${c.qualityScore}/100</span>
                <span class="status-badge ${c.evaluationStatus === 'Verified' ? 'badge-success' : 'badge-warning'}">${c.evaluationStatus}</span>
              </div>
            ` : '<span class="status-badge badge-neutral">Not Submitted</span>'}
          </div>

          ${c ? `
            <div class="mt-3">
              <div class="grid grid-3 gap-2 mb-3 p-3" style="background: var(--bg-subtle); border-radius: var(--radius-sm); font-size: 0.8rem;">
                <div><strong>Completeness:</strong> ${c.submissionCompleteness}%</div>
                <div><strong>Evidence Compliance:</strong> ${c.evidenceCompliance}% (${c.evidenceStatus})</div>
                <div><strong>Assessments Mapped:</strong> ${(c.standardizedAssessments || []).join(", ") || "Written Tests"}</div>
              </div>

              <!-- Assessment CIE Artifacts Banner -->
              <div class="mb-3 p-3" style="background: ${c.evidenceStatus === 'Verified' ? '#f0fdf4' : (c.evidenceStatus === 'Missing' ? '#fff1f2' : '#fffbeb')}; border: 1px solid ${c.evidenceStatus === 'Verified' ? '#bbf7d0' : (c.evidenceStatus === 'Missing' ? '#fecdd3' : '#fde68a')}; border-radius: var(--radius-sm);">
                <div class="flex-between flex-wrap gap-2">
                  <div>
                    <h5 style="font-size: 0.85rem; font-weight: 700; color: ${c.evidenceStatus === 'Verified' ? '#166534' : '#991b1b'}; margin: 0; display: flex; align-items: center; gap: 0.35rem;">
                      <span>${c.evidenceStatus === 'Verified' ? '✅' : '📎'}</span>
                      Section D: CIE Assessment Artifacts & Repository Audit
                    </h5>
                    <p style="font-size: 0.775rem; color: #475569; margin: 0.2rem 0 0;">
                      ${c.criteriaResults?.find(cr => cr.criterionId === 'evidenceRelevance')?.reason || 'Assessment question blueprints, model keys and sample marked scripts'}
                    </p>
                  </div>
                  <div class="text-right">
                    <span class="status-badge ${c.evidenceStatus === 'Verified' ? 'badge-success' : 'badge-danger'}">
                      ${c.evidenceStatus}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Criterion Breakdown Table -->
              <h4 style="font-size: 0.85rem; font-weight: 700; margin-bottom: 0.4rem;">Criterion-by-Criterion Evaluation & Supporting Text</h4>
              <div class="table-responsive">
                <table class="data-table" style="font-size: 0.775rem;">
                  <thead>
                    <tr>
                      <th style="width: 22%;">Rubric Criterion</th>
                      <th style="width: 10%;">Score</th>
                      <th style="width: 32%;">Supporting Document Text</th>
                      <th style="width: 26%;">Evaluation Rationale</th>
                      <th style="width: 10%;">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${(c.criteriaResults || []).map(cr => `
                      <tr>
                        <td><strong>${cr.criterionName}</strong></td>
                        <td><strong>${cr.awardedPoints}</strong> / ${cr.maxPoints}</td>
                        <td style="word-break: break-word; color: ${cr.awardedPoints === 0 ? '#e11d48' : '#334155'};">
                          ${cr.supportingText || '[Missing from submission]'}
                        </td>
                        <td>${cr.reason}</td>
                        <td>
                          <span class="status-badge ${cr.reviewStatus === 'Verified' ? 'badge-success' : (cr.reviewStatus === 'Missing' ? 'badge-danger' : 'badge-warning')}">
                            ${cr.reviewStatus}
                          </span>
                        </td>
                      </tr>
                    `).join("")}
                  </tbody>
                </table>
              </div>
            </div>
          ` : '<p style="color: var(--text-muted); padding: 1rem 0;">No Annexure 9(c) report submitted yet.</p>'}
        </div>
      </div>
    `;
  }

  /**
   * Renders IQAC Institutional Analytics
   */
  renderIqacAnalytics() {
    const filteredRecords = this.getFilteredFacultyRecords();
    const analytics = EvaluatorEngine.computeCollegeAnalytics(this.departments, filteredRecords);

    this.renderAnalyticsHighlights(filteredRecords);
    this.renderPedagogyAnalyticsTable(filteredRecords);
    this.renderAssessmentAnalyticsTable(filteredRecords);
    this.renderComplianceAndRecommendations(filteredRecords);
    this.renderDepartmentSummaryTable(analytics);
  }

  getFilteredFacultyRecords() {
    return this.facultyRecords.filter(f => {
      if (this.analyticsFilters.department !== "ALL" && f.department !== this.analyticsFilters.department) {
        return false;
      }
      if (this.analyticsFilters.programme !== "ALL") {
        const prog = (f.programme || "").toUpperCase();
        if (this.analyticsFilters.programme === "PG" && !prog.includes("M.SC") && !prog.includes("POSTGRADUATE") && !prog.includes("MBA")) return false;
        if (this.analyticsFilters.programme === "UG" && !prog.includes("B.SC") && !prog.includes("UNDERGRADUATE") && !prog.includes("BBA")) return false;
      }
      return true;
    });
  }

  renderAnalyticsHighlights(records) {
    const grid = document.getElementById("analytics-highlights-grid");
    if (!grid) return;

    const pedagogyCounts = {};
    const assessmentCounts = {};

    records.forEach(f => {
      (f.annexure9b?.standardizedPedagogies || []).forEach(p => {
        pedagogyCounts[p] = (pedagogyCounts[p] || 0) + 1;
      });
      (f.annexure9c?.standardizedAssessments || []).forEach(a => {
        assessmentCounts[a] = (assessmentCounts[a] || 0) + 1;
      });
    });

    const sortedPed = Object.entries(pedagogyCounts).sort((a, b) => b[1] - a[1]);
    const sortedAssess = Object.entries(assessmentCounts).sort((a, b) => b[1] - a[1]);

    const mostPed = sortedPed.length > 0 ? `${sortedPed[0][0]} (${sortedPed[0][1]} uses)` : "Lecture (N/A)";
    const leastPed = sortedPed.length > 1 ? `${sortedPed[sortedPed.length - 1][0]} (${sortedPed[sortedPed.length - 1][1]} uses)` : "Case-Based (0 uses)";
    const mostAssess = sortedAssess.length > 0 ? `${sortedAssess[0][0]} (${sortedAssess[0][1]} uses)` : "Written Tests (N/A)";
    const totalSubs = records.filter(f => f.annexure9b).length + records.filter(f => f.annexure9c).length;

    grid.innerHTML = `
      <div class="metric-card p-3">
        <div class="metric-label">Most Reported Pedagogy</div>
        <div class="metric-value-row">
          <span class="metric-value text-indigo" style="font-size: 1.15rem;">${mostPed}</span>
        </div>
        <div class="metric-subtext">Highest departmental adoption</div>
      </div>

      <div class="metric-card p-3">
        <div class="metric-label">Least Reported Pedagogy</div>
        <div class="metric-value-row">
          <span class="metric-value text-rose" style="font-size: 1.15rem;">${leastPed}</span>
        </div>
        <div class="metric-subtext">Candidate for faculty development</div>
      </div>

      <div class="metric-card p-3">
        <div class="metric-label">Most Reported Assessment</div>
        <div class="metric-value-row">
          <span class="metric-value text-emerald" style="font-size: 1.15rem;">${mostAssess}</span>
        </div>
        <div class="metric-subtext">Continuous internal evaluation mode</div>
      </div>

      <div class="metric-card p-3">
        <div class="metric-label">Audit Dataset Size</div>
        <div class="metric-value-row">
          <span class="metric-value text-cyan" style="font-size: 1.15rem;">${records.length} Faculty</span>
        </div>
        <div class="metric-subtext">${totalSubs} total evaluated forms</div>
      </div>
    `;
  }

  renderPedagogyAnalyticsTable(records) {
    const tbody = document.getElementById("pedagogy-analytics-tbody");
    if (!tbody) return;

    const totalFacultyCount = Math.max(1, records.length);
    const stats = {};

    STANDARDIZED_PEDAGOGIES.forEach(p => {
      stats[p] = { category: p, uses: 0, distinctFaculty: new Set() };
    });

    records.forEach(f => {
      if (f.annexure9b) {
        (f.annexure9b.standardizedPedagogies || []).forEach(p => {
          if (!stats[p]) stats[p] = { category: p, uses: 0, distinctFaculty: new Set() };
          stats[p].uses++;
          stats[p].distinctFaculty.add(f.id);
        });
      }
    });

    tbody.innerHTML = STANDARDIZED_PEDAGOGIES.map(p => {
      const s = stats[p] || { uses: 0, distinctFaculty: new Set() };
      const adopterCount = s.distinctFaculty.size;
      const rate = Math.round((adopterCount / totalFacultyCount) * 100);

      return `
        <tr>
          <td><strong>${p}</strong></td>
          <td>${s.uses}</td>
          <td>${adopterCount} Faculty</td>
          <td>
            <div class="d-flex align-items-center gap-2">
              <div style="flex: 1; height: 6px; background: #e2e8f0; border-radius: 999px; overflow: hidden;">
                <div style="width: ${rate}%; height: 100%; background: #6366f1;"></div>
              </div>
              <span style="font-size: 0.75rem; font-weight: 700; min-width: 35px;">${rate}%</span>
            </div>
          </td>
        </tr>
      `;
    }).join("");
  }

  renderAssessmentAnalyticsTable(records) {
    const tbody = document.getElementById("assessment-analytics-tbody");
    if (!tbody) return;

    const totalFacultyCount = Math.max(1, records.length);
    const stats = {};

    STANDARDIZED_ASSESSMENTS.forEach(a => {
      stats[a] = { category: a, uses: 0, distinctFaculty: new Set() };
    });

    records.forEach(f => {
      if (f.annexure9c) {
        (f.annexure9c.standardizedAssessments || []).forEach(a => {
          if (!stats[a]) stats[a] = { category: a, uses: 0, distinctFaculty: new Set() };
          stats[a].uses++;
          stats[a].distinctFaculty.add(f.id);
        });
      }
    });

    tbody.innerHTML = STANDARDIZED_ASSESSMENTS.map(a => {
      const s = stats[a] || { uses: 0, distinctFaculty: new Set() };
      const adopterCount = s.distinctFaculty.size;
      const rate = Math.round((adopterCount / totalFacultyCount) * 100);

      return `
        <tr>
          <td><strong>${a}</strong></td>
          <td>${s.uses}</td>
          <td>${adopterCount} Faculty</td>
          <td>
            <div class="d-flex align-items-center gap-2">
              <div style="flex: 1; height: 6px; background: #e2e8f0; border-radius: 999px; overflow: hidden;">
                <div style="width: ${rate}%; height: 100%; background: #22c55e;"></div>
              </div>
              <span style="font-size: 0.75rem; font-weight: 700; min-width: 35px;">${rate}%</span>
            </div>
          </td>
        </tr>
      `;
    }).join("");
  }

  renderComplianceAndRecommendations(records) {
    const statsContainer = document.getElementById("compliance-stats-container");
    const recContainer = document.getElementById("institutional-recommendations-container");

    if (statsContainer) {
      let totalSubs = 0;
      let coAlignedCount = 0;
      let verifiedEvidenceCount = 0;

      records.forEach(f => {
        if (f.annexure9b) {
          totalSubs++;
          if (f.annexure9b.criteriaResults?.find(c => c.criterionId === 'coAlignment')?.awardedPoints > 0) coAlignedCount++;
          if (f.annexure9b.evidenceStatus === 'Verified') verifiedEvidenceCount++;
        }
        if (f.annexure9c) {
          totalSubs++;
          if (f.annexure9c.criteriaResults?.find(c => c.criterionId === 'coMapping')?.awardedPoints > 0) coAlignedCount++;
          if (f.annexure9c.evidenceStatus === 'Verified') verifiedEvidenceCount++;
        }
      });

      const coRate = totalSubs > 0 ? Math.round((coAlignedCount / totalSubs) * 100) : 0;
      const evRate = totalSubs > 0 ? Math.round((verifiedEvidenceCount / totalSubs) * 100) : 0;

      statsContainer.innerHTML = `
        <div style="font-size: 0.85rem; line-height: 1.8;">
          <div class="flex-between py-1" style="border-bottom: 1px solid #f1f5f9;">
            <span>Direct Course Outcome (CO) Mapping Rate:</span>
            <strong>${coRate}% (${coAlignedCount} / ${totalSubs} submissions)</strong>
          </div>
          <div class="flex-between py-1" style="border-bottom: 1px solid #f1f5f9;">
            <span>Verified Evidence Attachment Rate:</span>
            <strong>${evRate}% (${verifiedEvidenceCount} / ${totalSubs} submissions)</strong>
          </div>
          <div class="flex-between py-1">
            <span>Submissions Requiring Manual Review:</span>
            <strong style="color: #ea580c;">${totalSubs - verifiedEvidenceCount} submissions</strong>
          </div>
        </div>
      `;
    }

    if (recContainer) {
      recContainer.innerHTML = `
        <ul style="font-size: 0.825rem; color: var(--text-body); margin-left: 1.15rem; line-height: 1.5;">
          <li><strong>Organize Hands-on Rubric Workshop:</strong> Standardize explicit Course Outcome (CO1-CO5) mapping across all continuous internal assessments.</li>
          <li><strong>Strengthen Evidence Portfolios:</strong> Ensure all faculty attach soft copies of student test scripts, code PR reviews, or geotagged session logs.</li>
          <li><strong>Expand Alternative Assessments:</strong> Incentivize departments relying exclusively on written tests to integrate project sprints and viva-voce evaluations.</li>
        </ul>
      `;
    }
  }

  renderDepartmentSummaryTable(analytics) {
    const tbody = document.getElementById("departments-summary-tbody");
    if (!tbody) return;

    tbody.innerHTML = this.departments.map(d => {
      const stats = analytics.deptStats[d.name] || {
        avg9b: 0, avg9c: 0, avgComposite: 0, submittedCount: 0
      };

      return `
        <tr>
          <td><strong>${d.name}</strong> (${d.code})</td>
          <td>${d.hod}</td>
          <td>${d.totalFaculty}</td>
          <td>${stats.submittedCount} Forms</td>
          <td>${stats.avg9b > 0 ? `${stats.avg9b}/100` : '--'}</td>
          <td>${stats.avg9c > 0 ? `${stats.avg9c}/100` : '--'}</td>
          <td><strong style="color: #4338ca;">${stats.avgComposite > 0 ? `${stats.avgComposite}/100` : '--'}</strong></td>
          <td>${stats.submittedCount > 0 ? `${analytics.evidenceComplianceRate}%` : '--'}</td>
          <td>
            <span class="status-badge ${stats.submittedCount > 0 ? 'badge-success' : 'badge-neutral'}">
              ${stats.submittedCount > 0 ? 'Active' : 'Pending'}
            </span>
          </td>
        </tr>
      `;
    }).join("");
  }

  updateAnalyticsFilters() {
    this.analyticsFilters.academicYear = document.getElementById("analytics-filter-ay")?.value || "ALL";
    this.analyticsFilters.semester = document.getElementById("analytics-filter-sem")?.value || "ALL";
    this.analyticsFilters.department = document.getElementById("analytics-filter-dept")?.value || "ALL";
    this.analyticsFilters.programme = document.getElementById("analytics-filter-prog")?.value || "ALL";
    this.analyticsFilters.annexure = document.getElementById("analytics-filter-annexure")?.value || "ALL";

    this.renderIqacAnalytics();
  }

  populateDepartmentDropdowns() {
    const mainDeptSelect = document.getElementById("dept-select-main");
    const filterDeptSelect = document.getElementById("analytics-filter-dept");

    const deptOptionsHtml = this.departments.map(d => `
      <option value="${d.name}" ${d.name === this.selectedDepartment ? 'selected' : ''}>
        ${d.name} (${d.code})
      </option>
    `).join("");

    if (mainDeptSelect) mainDeptSelect.innerHTML = deptOptionsHtml;

    if (filterDeptSelect) {
      filterDeptSelect.innerHTML = `<option value="ALL">All Departments</option>` + this.departments.map(d => `
        <option value="${d.name}">${d.name}</option>
      `).join("");
    }

    this.populateFacultyDropdown();
  }

  populateFacultyDropdown() {
    const facultySelect = document.getElementById("faculty-select");
    if (!facultySelect) return;

    const filtered = this.facultyRecords.filter(f => f.department === this.selectedDepartment);
    if (filtered.length === 0) {
      facultySelect.innerHTML = `<option value="">No faculty members in this department</option>`;
      return;
    }

    facultySelect.innerHTML = filtered.map(f => `
      <option value="${f.id}" ${f.id === this.selectedFacultyId ? 'selected' : ''}>
        ${f.facultyName} (${f.courseCode || 'CRS'}) - Score: ${f.compositeScore}/100
      </option>
    `).join("");

    if (!filtered.some(f => f.id === this.selectedFacultyId) && filtered.length > 0) {
      this.selectedFacultyId = filtered[0].id;
    }
  }

  /**
   * Updates Top Dashboard Metric Ribbon (The 4 Specified Metrics)
   */
  updateMetricRibbon() {
    const totalSubsEl = document.getElementById("stat-total-submissions");
    const reviewReqEl = document.getElementById("stat-review-required");
    const evCompEl = document.getElementById("stat-evidence-compliance");
    const deptsRepEl = document.getElementById("stat-depts-represented");

    let count9b = 0;
    let count9c = 0;
    let reviewCount = 0;
    let verifiedEvidenceCount = 0;
    const deptsSet = new Set();

    this.facultyRecords.forEach(f => {
      deptsSet.add(f.department);
      if (f.annexure9b) {
        count9b++;
        if (f.annexure9b.evaluationStatus !== "Verified") reviewCount++;
        if (f.annexure9b.evidenceStatus === "Verified") verifiedEvidenceCount++;
      }
      if (f.annexure9c) {
        count9c++;
        if (f.annexure9c.evaluationStatus !== "Verified") reviewCount++;
        if (f.annexure9c.evidenceStatus === "Verified") verifiedEvidenceCount++;
      }
    });

    const totalSubmissions = count9b + count9c;
    const evRate = totalSubmissions > 0 ? Math.round((verifiedEvidenceCount / totalSubmissions) * 100) : 0;

    if (totalSubsEl) totalSubsEl.textContent = totalSubmissions;
    document.getElementById("stat-submissions-split")?.replaceChildren(document.createTextNode(`${count9b} (9b) • ${count9c} (9c)`));

    if (reviewReqEl) reviewReqEl.textContent = reviewCount;
    if (evCompEl) evCompEl.textContent = `${evRate}%`;
    document.getElementById("stat-evidence-count")?.replaceChildren(document.createTextNode(`${verifiedEvidenceCount} Verified`));

    if (deptsRepEl) deptsRepEl.textContent = deptsSet.size;
  }

  renderAll() {
    this.updateMetricRibbon();
    this.renderSubmissionsRegistryTable();
    this.renderFacultyDossier();
    this.renderIqacAnalytics();
  }

  /**
   * EXPORTS — GENUINE BINARY FILES (.xlsx, .pdf, UTF-8 CSV)
   */
  exportInstitutionalExcelWorkbook() {
    const analytics = EvaluatorEngine.computeCollegeAnalytics(this.departments, this.facultyRecords);
    const wb = XLSX.utils.book_new();

    // Sheet 1: Department Summary
    const deptHeaders = ["Department", "Code", "HOD", "Total Faculty", "Submissions", "Pedagogy Avg (9b)", "Assessment Avg (9c)", "Composite Index", "Status"];
    const deptRows = this.departments.map(d => {
      const s = analytics.deptStats[d.name] || {};
      return [
        d.name,
        d.code,
        d.hod,
        d.totalFaculty,
        s.submittedCount || 0,
        s.avg9b || 0,
        s.avg9c || 0,
        s.avgComposite || 0,
        s.submittedCount > 0 ? "Active" : "Pending"
      ];
    });
    const wsDept = XLSX.utils.aoa_to_sheet([deptHeaders, ...deptRows]);
    wsDept['!cols'] = [{ wch: 26 }, { wch: 8 }, { wch: 24 }, { wch: 14 }, { wch: 14 }, { wch: 18 }, { wch: 18 }, { wch: 16 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, wsDept, "Department Summary");

    // Sheet 2: Pedagogy Usage
    const pedHeaders = ["Pedagogical Strategy", "Documented Uses", "Distinct Faculty Adopters", "Adoption Rate (%)"];
    const pedRows = STANDARDIZED_PEDAGOGIES.map(p => {
      let uses = 0;
      const adopters = new Set();
      this.facultyRecords.forEach(f => {
        if (f.annexure9b?.standardizedPedagogies?.includes(p)) {
          uses++;
          adopters.add(f.id);
        }
      });
      return [p, uses, adopters.size, `${Math.round((adopters.size / Math.max(1, this.facultyRecords.length)) * 100)}%`];
    });
    const wsPed = XLSX.utils.aoa_to_sheet([pedHeaders, ...pedRows]);
    wsPed['!cols'] = [{ wch: 32 }, { wch: 18 }, { wch: 24 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, wsPed, "Pedagogy Usage");

    // Sheet 3: Assessment Usage
    const assessHeaders = ["Assessment Method", "Documented Uses", "Distinct Faculty Adopters", "Adoption Rate (%)"];
    const assessRows = STANDARDIZED_ASSESSMENTS.map(a => {
      let uses = 0;
      const adopters = new Set();
      this.facultyRecords.forEach(f => {
        if (f.annexure9c?.standardizedAssessments?.includes(a)) {
          uses++;
          adopters.add(f.id);
        }
      });
      return [a, uses, adopters.size, `${Math.round((adopters.size / Math.max(1, this.facultyRecords.length)) * 100)}%`];
    });
    const wsAssess = XLSX.utils.aoa_to_sheet([assessHeaders, ...assessRows]);
    wsAssess['!cols'] = [{ wch: 30 }, { wch: 18 }, { wch: 24 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, wsAssess, "Assessment Usage");

    // Sheet 4: Geotag & Evidence Verification Audit (Dedicated Sheet)
    const evHeaders = [
      "Submission ID", "Faculty Name", "Department", "Annexure", "Evidence Status", 
      "Score (/10)", "Photos Embedded", "GPS Geotag Verified", "Coordinates / Campus Match", 
      "Audit Rationale", "Accreditation Recommendation"
    ];
    const evRows = this.submissionsLog.map(s => {
      const ev = s.evaluationData || {};
      const coords = ev.geotagDetails?.latitude 
        ? `${ev.geotagDetails.latitude.toFixed(4)}°N, ${ev.geotagDetails.longitude.toFixed(4)}°E` 
        : (ev.isGeotagConfirmed ? "Detected" : "None");
      const locLabel = ev.geotagDetails?.isCampus ? "St. Joseph's College Campus" : (coords !== "None" ? "Off-Campus / Watermark" : "N/A");

      const rationale = ev.criteriaResults?.find(c => c.criterionId.includes("evidence") || c.criterionId.includes("Evidence"))?.reason || "Audited";
      const recommendation = ev.criteriaResults?.find(c => c.criterionId.includes("evidence") || c.criterionId.includes("Evidence"))?.recommendation || "Maintain visual archives";

      return [
        s.id,
        s.facultyName,
        s.department,
        s.annexure,
        s.evidenceStatus,
        ev.evidenceCompliance !== undefined ? Math.round(ev.evidenceCompliance / 10) : 0,
        ev.imagesCount || 0,
        ev.isGeotagConfirmed ? "Yes (GPS Geotagged)" : (ev.imagesCount > 0 ? "Photos (No GPS)" : "No"),
        `${coords} [${locLabel}]`,
        rationale,
        recommendation
      ];
    });
    const wsEv = XLSX.utils.aoa_to_sheet([evHeaders, ...evRows]);
    wsEv['!cols'] = [
      { wch: 18 }, { wch: 24 }, { wch: 20 }, { wch: 16 }, { wch: 22 },
      { wch: 12 }, { wch: 16 }, { wch: 20 }, { wch: 30 }, { wch: 45 }, { wch: 45 }
    ];
    XLSX.utils.book_append_sheet(wb, wsEv, "Geotag & Evidence Audit");

    // Sheet 5: Submissions Registry Log
    const rawHeaders = ["Submission ID", "Date", "Faculty Name", "Department", "Course", "Annexure", "Completeness (%)", "Evidence Status", "Quality Score", "Verification Status"];
    const rawRows = this.submissionsLog.map(s => [
      s.id, s.date, s.facultyName, s.department, s.course, s.annexure, s.completeness, s.evidenceStatus, s.qualityScore, s.evaluationStatus
    ]);
    const wsSub = XLSX.utils.aoa_to_sheet([rawHeaders, ...rawRows]);
    wsSub['!cols'] = [
      { wch: 18 }, { wch: 14 }, { wch: 24 }, { wch: 20 }, { wch: 24 },
      { wch: 16 }, { wch: 16 }, { wch: 20 }, { wch: 14 }, { wch: 24 }
    ];
    XLSX.utils.book_append_sheet(wb, wsSub, "Submissions Registry");

    // Generate real binary .xlsx file
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `St_Josephs_IQAC_Institutional_Audit_${new Date().toISOString().split('T')[0]}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);

    this.showToast("Real multi-sheet Excel (.xlsx) workbook downloaded successfully!", "success");
  }

  downloadFacultyPdf(facultyId = null) {
    const targetId = facultyId || this.selectedFacultyId;
    const faculty = this.facultyRecords.find(f => f.id === targetId) || this.facultyRecords[0];
    if (!faculty) {
      this.showToast("No faculty profile selected for PDF generation.", "error");
      return;
    }

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4'
    });

    const b = faculty.annexure9b;
    const c = faculty.annexure9c;
    const pageW = doc.internal.pageSize.getWidth();

    // 1. College Header
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, pageW, 70, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("ST. JOSEPH'S COLLEGE (AUTONOMOUS)", pageW / 2, 24, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.text("Tiruchirappalli, Tamil Nadu • Re-accredited by NAAC with A++ Grade (Cycle 4)", pageW / 2, 38, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(224, 231, 255);
    doc.text("INTERNAL QUALITY ASSURANCE CELL (IQAC) — FACULTY APPRAISAL DOSSIER", pageW / 2, 54, { align: "center" });

    // 2. Faculty Identity Table
    const infoRows = [
      ["Faculty Name:", faculty.facultyName, "Department:", faculty.department],
      ["Designation:", faculty.designation || "Assistant Professor", "Academic Year:", faculty.academicYear || "2025-26"],
      ["Course Title:", `${faculty.courseCode || ''} ${faculty.courseTitle || ''}`, "Quality Score:", `${faculty.compositeScore}/100 (${faculty.evaluationStatus || 'Provisional'})`]
    ];

    autoTable(doc, {
      startY: 85,
      body: infoRows,
      theme: 'grid',
      styles: { fontSize: 8.5, cellPadding: 4, textColor: [30, 41, 59] },
      columnStyles: {
        0: { fontStyle: 'bold', fillColor: [248, 250, 252], cellWidth: 85 },
        1: { cellWidth: 175 },
        2: { fontStyle: 'bold', fillColor: [248, 250, 252], cellWidth: 85 },
        3: { cellWidth: 175 }
      }
    });

    let currentY = doc.lastAutoTable.finalY + 10;

    // 3. Geotag & Visual Evidence Audit Stamp
    const bGeotag = b?.isGeotagConfirmed 
      ? `GPS Geotag Verified (${b.geotagDetails?.latitude?.toFixed(4)}°N, ${b.geotagDetails?.longitude?.toFixed(4)}°E • Campus Match)` 
      : (b?.imagesCount > 0 ? `${b.imagesCount} Photos (GPS Unverified)` : b?.evidenceStatus || 'Missing');
    const cEvidence = c?.evidenceStatus || 'Missing';

    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(40, currentY, pageW - 80, 44, 4, 4, 'FD');

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text("Visual Evidence & Geotag Verification Audit (NAAC Criterion 2.3.1):", 48, currentY + 14);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    doc.text(`• Annexure 9(b) Pedagogy: ${bGeotag}`, 52, currentY + 27);
    doc.text(`• Annexure 9(c) Assessment: ${cEvidence} • CIE Question Blueprints & Rubrics`, 52, currentY + 38);

    currentY += 54;

    // 4. The 3 Mandatory Feedback Sections
    const defText = [...(b?.deficiencies || []), ...(c?.deficiencies || [])].join("; ") || "All criteria meet institutional benchmarks.";
    const impText = [...(b?.improvements || []), ...(c?.improvements || [])].join("; ") || "Teaching and assessment methods meet rubric standards.";
    const recText = [...(b?.recommendations || []), ...(c?.recommendations || [])].join("; ") || "Disseminate this pedagogical practice as an institutional benchmark.";

    const feedbackRows = [
      ["1. Deficiencies Identified (Correction Required):", defText],
      ["2. Specific Improvements Required:", impText],
      ["3. Recommendations for Next Academic Cycle:", recText]
    ];

    autoTable(doc, {
      startY: currentY,
      head: [["Feedback & Corrective Action Summary", "Details"]],
      body: feedbackRows,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
      styles: { fontSize: 8, cellPadding: 4, textColor: [30, 41, 59] },
      columnStyles: {
        0: { fontStyle: 'bold', fillColor: [248, 250, 252], cellWidth: 175 },
        1: { cellWidth: 345 }
      }
    });

    currentY = doc.lastAutoTable.finalY + 10;

    // 5. Criteria Score Breakdown
    const allCriteria = [];
    if (b?.criteriaResults) {
      b.criteriaResults.forEach(cr => {
        allCriteria.push(["9(b)", cr.criterionName, `${cr.awardedPoints} / ${cr.maxPoints}`, cr.supportingText?.slice(0, 70) || 'None', cr.reviewStatus]);
      });
    }
    if (c?.criteriaResults) {
      c.criteriaResults.forEach(cr => {
        allCriteria.push(["9(c)", cr.criterionName, `${cr.awardedPoints} / ${cr.maxPoints}`, cr.supportingText?.slice(0, 70) || 'None', cr.reviewStatus]);
      });
    }

    if (allCriteria.length > 0) {
      autoTable(doc, {
        startY: currentY,
        head: [["Form", "Criterion Name", "Score", "Supporting Text Excerpt", "Status"]],
        body: allCriteria,
        theme: 'grid',
        headStyles: { fillColor: [51, 65, 85], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
        styles: { fontSize: 7.5, cellPadding: 3.5, textColor: [30, 41, 59] },
        columnStyles: {
          0: { cellWidth: 35 },
          1: { cellWidth: 135, fontStyle: 'bold' },
          2: { cellWidth: 50, halign: 'center' },
          3: { cellWidth: 235 },
          4: { cellWidth: 65, halign: 'center' }
        }
      });
      currentY = doc.lastAutoTable.finalY + 22;
    }

    // 6. Institutional Signatories
    if (currentY + 45 > doc.internal.pageSize.getHeight() - 25) {
      doc.addPage();
      currentY = 40;
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.setLineDashPattern([2, 2], 0);
    doc.line(40, currentY, pageW - 40, currentY);

    doc.setTextColor(30, 41, 59);
    doc.setFont("helvetica", "bold");
    const sigY = currentY + 20;
    doc.text("_______________________", 60, sigY - 6);
    doc.text("Faculty Signature", 80, sigY + 5);

    doc.text("_______________________", pageW / 2 - 40, sigY - 6);
    doc.text("Head of Department (HOD)", pageW / 2 - 35, sigY + 5);

    doc.text("_______________________", pageW - 140, sigY - 6);
    doc.text("IQAC Coordinator", pageW - 120, sigY + 5);

    const safeName = faculty.facultyName.replace(/[^a-zA-Z0-9]/g, '_');
    doc.save(`Faculty_Appraisal_Report_${safeName}_${new Date().toISOString().split('T')[0]}.pdf`);
    this.showToast(`Real PDF Report downloaded: Faculty_Appraisal_Report_${safeName}.pdf`, "success");
  }

  downloadInstitutionalPdf() {
    const analytics = EvaluatorEngine.computeCollegeAnalytics(this.departments, this.facultyRecords);
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'pt',
      format: 'a4'
    });

    const pageW = doc.internal.pageSize.getWidth();

    // College Header
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, pageW, 65, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("ST. JOSEPH'S COLLEGE (AUTONOMOUS)", pageW / 2, 23, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Tiruchirappalli, Tamil Nadu • Re-accredited by NAAC with A++ Grade (Cycle 4)", pageW / 2, 37, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(224, 231, 255);
    doc.text("INTERNAL QUALITY ASSURANCE CELL (IQAC) — INSTITUTIONAL PEDAGOGICAL & ASSESSMENT AUDIT", pageW / 2, 53, { align: "center" });

    // Department Table
    const deptHeaders = ["Department", "Code", "Head of Dept (HOD)", "Faculty Count", "Submissions", "Pedagogy Avg (9b)", "Assessment Avg (9c)", "Composite Index", "Status"];
    const deptRows = this.departments.map(d => {
      const s = analytics.deptStats[d.name] || {};
      return [
        d.name,
        d.code,
        d.hod,
        d.totalFaculty,
        s.submittedCount || 0,
        s.avg9b > 0 ? `${s.avg9b}/100` : '--',
        s.avg9c > 0 ? `${s.avg9c}/100` : '--',
        s.avgComposite > 0 ? `${s.avgComposite}/100` : '--',
        s.submittedCount > 0 ? 'Active' : 'Pending'
      ];
    });

    autoTable(doc, {
      startY: 85,
      head: [deptHeaders],
      body: deptRows,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
      styles: { fontSize: 8.5, cellPadding: 5, textColor: [30, 41, 59] },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 140 },
        1: { cellWidth: 45, halign: 'center' },
        2: { cellWidth: 120 },
        3: { cellWidth: 70, halign: 'center' },
        4: { cellWidth: 75, halign: 'center' },
        5: { cellWidth: 95, halign: 'center' },
        6: { cellWidth: 95, halign: 'center' },
        7: { cellWidth: 85, halign: 'center', fontStyle: 'bold' },
        8: { cellWidth: 65, halign: 'center' }
      }
    });

    const finalY = doc.lastAutoTable.finalY + 35;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("_______________________", 80, finalY);
    doc.text("IQAC Coordinator", 100, finalY + 12);

    doc.text("_______________________", pageW / 2 - 50, finalY);
    doc.text("Dean of Academics", pageW / 2 - 35, finalY + 12);

    doc.text("_______________________", pageW - 160, finalY);
    doc.text("Principal", pageW - 130, finalY + 12);

    doc.save(`St_Josephs_IQAC_Institutional_Audit_${new Date().toISOString().split('T')[0]}.pdf`);
    this.showToast("Real Institutional Audit PDF report downloaded successfully!", "success");
  }

  exportSubmissionsCsv() {
    const headers = [
      "Submission ID", "Date", "Faculty Name", "Department", "Annexure", "Course", 
      "Completeness (%)", "Evidence Status", "Images Attached", "GPS Geotag Verified", 
      "Coordinates / Location", "Quality Score", "Evaluation Status"
    ];
    const rows = this.submissionsLog.map(s => {
      const ev = s.evaluationData || {};
      const coords = ev.geotagDetails?.latitude 
        ? `${ev.geotagDetails.latitude.toFixed(4)}N ${ev.geotagDetails.longitude.toFixed(4)}E` 
        : (ev.isGeotagConfirmed ? "Detected" : "None");

      return [
        s.id,
        s.date,
        `"${s.facultyName}"`,
        `"${s.department}"`,
        `"${s.annexure}"`,
        `"${s.course}"`,
        s.completeness,
        `"${s.evidenceStatus}"`,
        ev.imagesCount || 0,
        ev.isGeotagConfirmed ? "Yes" : "No",
        `"${coords}"`,
        s.qualityScore,
        `"${s.evaluationStatus}"`
      ];
    });

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\r\n");
    this.downloadCsvFile(csvContent, `St_Josephs_IQAC_Submissions_${new Date().toISOString().split('T')[0]}.csv`);
  }

  exportDepartmentSummaryCsv() {
    const analytics = EvaluatorEngine.computeCollegeAnalytics(this.departments, this.facultyRecords);
    const headers = ["Department", "Code", "HOD", "Total Faculty", "Submissions", "Pedagogy Avg (9b)", "Assessment Avg (9c)", "Composite Index"];
    const rows = this.departments.map(d => {
      const s = analytics.deptStats[d.name] || {};
      return [
        `"${d.name}"`, d.code, `"${d.hod}"`, d.totalFaculty, s.submittedCount || 0, s.avg9b || 0, s.avg9c || 0, s.avgComposite || 0
      ];
    });

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\r\n");
    this.downloadCsvFile(csvContent, `St_Josephs_IQAC_Department_Summary_${new Date().toISOString().split('T')[0]}.csv`);
  }

  exportSelectedFacultyCsv() {
    const faculty = this.facultyRecords.find(f => f.id === this.selectedFacultyId);
    if (!faculty) return;

    const headers = ["Criterion ID", "Criterion Name", "Max Points", "Awarded Points", "Document Section", "Supporting Text", "Evaluation Rationale", "Review Status"];
    const rows = [];

    (faculty.annexure9b?.criteriaResults || []).forEach(c => {
      rows.push([c.criterionId, `"${c.criterionName}"`, c.maxPoints, c.awardedPoints, `"${c.documentSection}"`, `"${c.supportingText?.replace(/"/g, '""')}"`, `"${c.reason?.replace(/"/g, '""')}"`, c.reviewStatus]);
    });

    (faculty.annexure9c?.criteriaResults || []).forEach(c => {
      rows.push([c.criterionId, `"${c.criterionName}"`, c.maxPoints, c.awardedPoints, `"${c.documentSection}"`, `"${c.supportingText?.replace(/"/g, '""')}"`, `"${c.reason?.replace(/"/g, '""')}"`, c.reviewStatus]);
    });

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\r\n");
    this.downloadCsvFile(csvContent, `Faculty_Report_${faculty.facultyName.replace(/[^a-zA-Z]/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
  }

  downloadCsvFile(csvContent, fileName) {
    // Add UTF-8 BOM (\uFEFF) so Microsoft Excel on Windows parses accents and degree symbols properly
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    this.showToast(`Exported ${fileName} successfully!`, "success");
  }

  openPrintModal(mode = "faculty") {
    this.currentModalMode = mode;
    const modal = document.getElementById("dossier-modal");
    const content = document.getElementById("modal-content-area");
    if (!modal || !content) return;

    if (mode === "institutional") {
      const analytics = EvaluatorEngine.computeCollegeAnalytics(this.departments, this.facultyRecords);
      content.innerHTML = `
        <div style="padding: 1.5rem; font-family: sans-serif; color: #0f172a; background: white;">
          <div style="text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 1rem; margin-bottom: 1.5rem;">
            <h2 style="font-size: 1.35rem; font-weight: 800; text-transform: uppercase; margin: 0;">${COLLEGE_INFO.institutionName}</h2>
            <h4 style="font-size: 0.95rem; font-weight: 600; color: #475569; margin: 0.2rem 0;">${COLLEGE_INFO.location}</h4>
            <h3 style="font-size: 1.1rem; font-weight: 700; margin: 0.35rem 0 0;">${COLLEGE_INFO.cell}</h3>
            <p style="font-size: 0.8rem; color: #64748b; margin: 0.2rem 0 0;">Consolidated Institutional Pedagogical & Assessment Audit Report • AY 2025-26</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 1.5rem; font-size: 0.85rem;">
            <thead>
              <tr style="background: #f1f5f9;">
                <th style="padding: 6px; border: 1px solid #cbd5e1; text-align: left;">Department</th>
                <th style="padding: 6px; border: 1px solid #cbd5e1;">HOD</th>
                <th style="padding: 6px; border: 1px solid #cbd5e1;">Faculty</th>
                <th style="padding: 6px; border: 1px solid #cbd5e1;">Submissions</th>
                <th style="padding: 6px; border: 1px solid #cbd5e1;">Pedagogy Avg (9b)</th>
                <th style="padding: 6px; border: 1px solid #cbd5e1;">Assessment Avg (9c)</th>
                <th style="padding: 6px; border: 1px solid #cbd5e1;">Composite Score</th>
              </tr>
            </thead>
            <tbody>
              ${this.departments.map(d => {
                const s = analytics.deptStats[d.name] || {};
                return `
                  <tr>
                    <td style="padding: 6px; border: 1px solid #cbd5e1;"><strong>${d.name}</strong></td>
                    <td style="padding: 6px; border: 1px solid #cbd5e1;">${d.hod}</td>
                    <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center;">${d.totalFaculty}</td>
                    <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center;">${s.submittedCount || 0}</td>
                    <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center;">${s.avg9b || '--'}</td>
                    <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center;">${s.avg9c || '--'}</td>
                    <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold; color: #4338ca;">${s.avgComposite || '--'}</td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>

          <div style="display: flex; justify-content: space-between; margin-top: 3.5rem; padding-top: 1rem; border-top: 1px dashed #94a3b8; font-size: 0.85rem;">
            <div style="text-align: center;"><div>________________________</div><strong>IQAC Coordinator</strong></div>
            <div style="text-align: center;"><div>________________________</div><strong>Dean of Academics</strong></div>
            <div style="text-align: center;"><div>________________________</div><strong>Principal</strong></div>
          </div>
        </div>
      `;
    } else {
      const faculty = this.facultyRecords.find(f => f.id === this.selectedFacultyId) || this.facultyRecords[0];
      if (!faculty) return;
      const b = faculty.annexure9b;
      const c = faculty.annexure9c;

      content.innerHTML = `
        <div style="padding: 1.5rem; font-family: sans-serif; color: #0f172a; background: white;">
          <div style="text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 1rem; margin-bottom: 1.5rem;">
            <h2 style="font-size: 1.35rem; font-weight: 800; text-transform: uppercase; margin: 0;">${COLLEGE_INFO.institutionName}</h2>
            <h4 style="font-size: 0.95rem; font-weight: 600; color: #475569; margin: 0.2rem 0;">${COLLEGE_INFO.location}</h4>
            <h3 style="font-size: 1.1rem; font-weight: 700; margin: 0.35rem 0 0;">${COLLEGE_INFO.cell}</h3>
            <p style="font-size: 0.8rem; color: #64748b; margin: 0.2rem 0 0;">Individual Faculty Pedagogical Appraisal Dossier • AY 2025-26</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 1.25rem; font-size: 0.85rem;">
            <tr>
              <td style="padding: 6px; border: 1px solid #cbd5e1; font-weight: bold; background: #f8fafc; width: 22%;">Faculty Name:</td>
              <td style="padding: 6px; border: 1px solid #cbd5e1;">${faculty.facultyName}</td>
              <td style="padding: 6px; border: 1px solid #cbd5e1; font-weight: bold; background: #f8fafc; width: 22%;">Department:</td>
              <td style="padding: 6px; border: 1px solid #cbd5e1;">${faculty.department}</td>
            </tr>
            <tr>
              <td style="padding: 6px; border: 1px solid #cbd5e1; font-weight: bold; background: #f8fafc;">Course:</td>
              <td style="padding: 6px; border: 1px solid #cbd5e1;">${faculty.courseCode || ''} ${faculty.courseTitle}</td>
              <td style="padding: 6px; border: 1px solid #cbd5e1; font-weight: bold; background: #f8fafc;">Quality Score:</td>
              <td style="padding: 6px; border: 1px solid #cbd5e1; font-weight: bold; color: #16a34a;">${faculty.compositeScore}/100 (${faculty.evaluationStatus || 'Provisional'})</td>
            </tr>
          </table>

          <div style="margin-bottom: 1rem; padding: 0.75rem; background: #f8fafc; border-left: 3px solid #6366f1; font-size: 0.825rem;">
            <strong>Deficiencies & Improvements:</strong>
            <p style="margin: 0.25rem 0 0;">${[...(b?.deficiencies || []), ...(c?.deficiencies || [])].join("; ") || "All criteria meet institutional benchmarks."}</p>
          </div>

          <h4 style="margin: 1rem 0 0.5rem; color: #0f172a; font-size: 0.95rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">
            1. Annexure 9(b): Pedagogical Reflection (Score: ${b ? `${b.qualityScore}/100` : 'Not Submitted'})
          </h4>
          <p style="font-size: 0.85rem; margin-bottom: 0.4rem;"><strong>Teaching Method:</strong> ${b?.teachingMethod || 'N/A'}</p>
          <p style="font-size: 0.825rem; color: #334155; margin-bottom: 0.4rem;"><strong>Delivery:</strong> ${b?.inClassDelivery || 'N/A'}</p>
          <p style="font-size: 0.825rem; color: #334155; margin-bottom: 1rem;"><strong>Impact:</strong> ${b?.impact || 'N/A'}</p>

          <h4 style="margin: 1rem 0 0.5rem; color: #0f172a; font-size: 0.95rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">
            2. Annexure 9(c): Assessment Components (Score: ${c ? `${c.qualityScore}/100` : 'Not Submitted'})
          </h4>
          <p style="font-size: 0.85rem; margin-bottom: 0.4rem;"><strong>Reflection:</strong> ${c?.whatWorked || 'N/A'}</p>
          <p style="font-size: 0.825rem; color: #334155; margin-bottom: 1.5rem;"><strong>Areas for Improvement:</strong> ${c?.whatCouldImprove || 'N/A'}</p>

          <div style="display: flex; justify-content: space-between; margin-top: 3.5rem; padding-top: 1rem; border-top: 1px dashed #94a3b8; font-size: 0.85rem;">
            <div style="text-align: center;"><div>________________________</div><strong>Faculty Signature</strong></div>
            <div style="text-align: center;"><div>________________________</div><strong>Head of Department (HOD)</strong></div>
            <div style="text-align: center;"><div>________________________</div><strong>IQAC Coordinator</strong></div>
          </div>
        </div>
      `;
    }

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

// Bootstrap Application
document.addEventListener("DOMContentLoaded", () => {
  new PedApp();
});
