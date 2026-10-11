# PED | Pedagogical & Assessment Practices Evaluation Platform

> **Automated Multi-Criteria Evaluation & IQAC Quality Analytics Platform**  
> Developed for college academic quality assurance cells (IQAC) to systematically evaluate, benchmark, and audit faculty pedagogical innovations, continuous assessment practices, and Bloom's cognitive taxonomy alignment in compliance with **NAAC (Criterion 2)** and **NBA (Criteria 2 & 3)** benchmarks.

---

## 🌟 Key Capabilities

### 1. 📊 IQAC Institutional Quality Dashboard
- **Institutional Quality Index**: Live aggregate scoring across all academic departments.
- **Department-wise Benchmarks**: Comparative bar charts benchmarking mean departmental quality against IQAC standards.
- **Pedagogical Methodology Distribution**: Interactive doughnut chart tracking adoption of Flipped Classrooms, Project-Based Learning (PjBL), Simulations, and Active Learning.
- **Institutional Bloom's Cognitive Profile**: Polar area chart showing the balance between Lower-Order (LOTS) and Higher-Order Thinking Skills (HOTS: Analyze, Evaluate, Create).
- **Accreditation Compliance Matrix**: Automated progress indicators for NAAC Criterion 2.3.1 (Student-Centric Methods), 2.5.1 (Continuous Internal Evaluation Rigor), and NBA Outcome-Based Education (OBE).
- **Executive Registry & Search**: Searchable audit table with quick filters for Department, Faculty ID, and Performance Band.

### 2. 👨‍🏫 Individual Faculty Appraisal Dossiers
- **Multi-Criteria Breakdown**: Scores across 5 weighted dimensions:
  1. *Pedagogical Innovation & Active Learning* (25 Pts)
  2. *Bloom's Taxonomy Cognitive Demand* (25 Pts)
  3. *Outcome-Based Education (OBE) & Rubric Quality* (20 Pts)
  4. *ICT Tools & Digital Simulation Integration* (15 Pts)
  5. *Student Feedback & Remedial Loop* (15 Pts)
- **Competency Radar Chart**: Visual comparison between faculty performance and the institutional baseline.
- **Cognitive Taxonomy Breakdown**: Proportional analysis of course questions and assessments from *Remember* to *Create*.
- **Commendations & Growth Areas**: Constructive qualitative recommendations for faculty appraisal portfolios.
- **Formal Academic Print View**: One-click printable and PDF-exportable appraisal sheet with signature blocks for Faculty, HOD, and IQAC Coordinator.

### 3. 📥 Batch File Upload & Evaluation Hub
- **File Drag & Drop Zone**: Ingest faculty submission files in standard `.json` or `.csv` formats.
- **Interactive Evaluation Form**: Direct entry for real-time evaluation and instant registry addition.
- **One-Click Demo Evaluators**: Load test files to evaluate Exemplary reports and Developing reports with flagged gaps.

### 4. 📄 Standard Templates & Guidelines
- **Downloadable Templates**: Official `.json` and `.csv` templates ready for distribution to HODs and professors.
- **Comprehensive Guidelines**: `.md` reference document outlining scoring criteria, weights, and accreditation definitions.

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+ recommended)
- Git

### Installation & Local Run
```bash
# Clone the repository
git clone https://github.com/iamg2r2/ped.git
cd ped

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

The application will start at `http://localhost:5173`.

### Production Build
```bash
npm run build
npm run preview
```

---

## 🛠️ Technology Stack
- **Frontend Core**: Vanilla HTML5, Modern Vanilla JavaScript (ES Modules)
- **Build Tooling**: [Vite](https://vite.dev/)
- **Styling**: Vanilla CSS3 (Custom Design System with Slate Glassmorphism, Responsive Grid, Print Media Stylesheet)
- **Visualizations**: [Chart.js](https://www.chartjs.org/)
- **Icons**: Lucide Icons & Custom SVG

---

## 🏛️ Accreditation Alignment
- **NAAC Criterion 2.3.1**: Student centric methods, such as experiential learning, participative learning, and problem solving methodologies.
- **NAAC Criterion 2.5.1**: Continuous Internal Evaluation (CIE) transparency and frequency.
- **NBA Criteria 2 & 3**: Teaching-Learning Processes, Course Outcomes (CO) articulation, and Program Outcomes (PO) attainment.
