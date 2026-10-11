/**
 * PED PLATFORM - INITIAL BENCHMARK DATA & SUBMISSIONS
 * Preloaded with realistic faculty pedagogical & assessment submissions
 * across departments for immediate out-of-the-box evaluation & analytics.
 */

export const DEPARTMENTS = [
  "Computer Science & Engineering",
  "Electronics & Communication",
  "Mechanical Engineering",
  "Civil Engineering",
  "Artificial Intelligence & Data Science",
  "Information Technology"
];

export const BLOOMS_LEVELS = [
  "Remember",
  "Understand",
  "Apply",
  "Analyze",
  "Evaluate",
  "Create"
];

export const ACCREDITATION_BENCHMARKS = [
  {
    id: "naac-2.3.1",
    criterion: "NAAC 2.3.1",
    title: "Student Centric Methods (Experiential, Participative & Problem Solving)",
    target: 80,
    unit: "% Adoption"
  },
  {
    id: "naac-2.5.1",
    criterion: "NAAC 2.5.1",
    title: "Continuous Internal Evaluation (CIE) Transparency & Robustness",
    target: 85,
    unit: "% Rubrics-Based"
  },
  {
    id: "nba-obe-crit3",
    criterion: "NBA Criterion 3",
    title: "Course Outcome (CO) - Higher-Order Bloom's Cognitive Rigor",
    target: 65,
    unit: "% HOTS (L4-L6)"
  },
  {
    id: "ict-integration",
    criterion: "Digital LMS/ICT",
    title: "ICT Tools, Simulations & Digital Laboratory Integration",
    target: 75,
    unit: "% Compliance"
  }
];

export const INITIAL_SUBMISSIONS = [
  {
    id: "SUB-2026-001",
    facultyId: "FAC-CSE-101",
    facultyName: "Dr. Arvind Sharma",
    designation: "Associate Professor",
    department: "Computer Science & Engineering",
    courseCode: "CS401",
    courseTitle: "Design & Analysis of Algorithms",
    academicYear: "2025-26 (Even Sem)",
    pedagogicalPractice: "Flipped Classroom & Peer Sprints",
    practiceCategory: "Active & Collaborative Learning",
    practiceDescription: "Pre-recorded micro-lectures on greedy & dynamic programming algorithms shared via Moodle LMS. In-class sessions conducted as 45-minute timed algorithmic design sprints where student pairs solved LeetCode/HackerRank problems followed by peer code-walkthroughs.",
    assessmentMethod: "Continuous Coding Sprints & Peer Review",
    bloomsLevels: ["Apply", "Analyze", "Evaluate", "Create"],
    ictTools: "Moodle LMS, GitHub Classroom, LeetCode, VS Code Live Share",
    studentFeedbackScore: 4.8,
    passPercentage: 94.2,
    evidenceAttached: true,
    evidenceUrl: "https://lms.college.edu/evidence/cs401-sprints-proof.pdf",
    rubricAttached: true,
    remedialAction: "Bi-weekly coding clinics conducted for students scoring in bottom quartile; automated test cases provided for incremental self-paced practice.",
    submissionDate: "2026-09-18"
  },
  {
    id: "SUB-2026-002",
    facultyId: "FAC-AI-105",
    facultyName: "Prof. Meera Iyer",
    designation: "Assistant Professor",
    department: "Artificial Intelligence & Data Science",
    courseCode: "AD304",
    courseTitle: "Deep Learning & Neural Networks",
    academicYear: "2025-26 (Even Sem)",
    pedagogicalPractice: "Project-Based Learning (PjBL)",
    practiceCategory: "Experiential Learning",
    practiceDescription: "Capstone project pipeline where student teams designed, trained, and benchmarked computer vision models for healthcare dataset analysis. Evaluated using industry-standard peer reviews and Kaggle leaderboard sprints.",
    assessmentMethod: "Rubric-Based Open-Ended Projects",
    bloomsLevels: ["Apply", "Analyze", "Evaluate", "Create"],
    ictTools: "Google Colab Pro, Weights & Biases, Kaggle, Hugging Face Hub",
    studentFeedbackScore: 4.9,
    passPercentage: 96.0,
    evidenceAttached: true,
    evidenceUrl: "https://lms.college.edu/evidence/ad304-projects.pdf",
    rubricAttached: true,
    remedialAction: "GPU compute credits provided along with step-by-step model debugging notebooks for slower progress groups.",
    submissionDate: "2026-09-22"
  },
  {
    id: "SUB-2026-003",
    facultyId: "FAC-ECE-203",
    facultyName: "Prof. Sunita Nair",
    designation: "Associate Professor",
    department: "Electronics & Communication",
    courseCode: "EC502",
    courseTitle: "Digital Signal Processing",
    academicYear: "2025-26 (Even Sem)",
    pedagogicalPractice: "Simulation & Virtual Lab Sprints",
    practiceCategory: "Participative Learning",
    practiceDescription: "Integrated MATLAB simulation pods and Think-Pair-Share questions during Fourier Transform analysis. Real-time audio signal filtering performed with student microphone inputs.",
    assessmentMethod: "Formative In-Class Quizzes & LMS Reflections",
    bloomsLevels: ["Understand", "Apply", "Analyze"],
    ictTools: "MATLAB Online, Virtual Labs (MHRD), Mentimeter",
    studentFeedbackScore: 4.4,
    passPercentage: 88.5,
    evidenceAttached: true,
    evidenceUrl: "https://lms.college.edu/evidence/ec502-matlab.pdf",
    rubricAttached: true,
    remedialAction: "Recorded video walkthroughs of complex mathematical derivations and remedial tutorial hours.",
    submissionDate: "2026-09-25"
  },
  {
    id: "SUB-2026-004",
    facultyId: "FAC-ME-308",
    facultyName: "Dr. Rajesh Kulkarni",
    designation: "Professor & Head",
    department: "Mechanical Engineering",
    courseCode: "ME305",
    courseTitle: "Fluid Mechanics & Turbo Machinery",
    academicYear: "2025-26 (Even Sem)",
    pedagogicalPractice: "Problem-Based Learning (PBL)",
    practiceCategory: "Inquiry & Problem Solving",
    practiceDescription: "Presented real industrial flow challenges (pump cavitation in thermal power plants). Students performed CFD simulations in ANSYS Fluent to optimize impeller blade angles.",
    assessmentMethod: "Rubric-Based Open-Ended Projects",
    bloomsLevels: ["Apply", "Analyze", "Evaluate"],
    ictTools: "ANSYS Student Edition, SimScale, College LMS",
    studentFeedbackScore: 4.3,
    passPercentage: 85.0,
    evidenceAttached: true,
    evidenceUrl: "https://lms.college.edu/evidence/me305-cfd.pdf",
    rubricAttached: true,
    remedialAction: "Extra lab sessions on mesh generation fundamentals for struggling student groups.",
    submissionDate: "2026-09-28"
  },
  {
    id: "SUB-2026-005",
    facultyId: "FAC-IT-412",
    facultyName: "Dr. Ananya Sen",
    designation: "Associate Professor",
    department: "Information Technology",
    courseCode: "IT601",
    courseTitle: "Cloud Infrastructure & DevOps",
    academicYear: "2025-26 (Even Sem)",
    pedagogicalPractice: "Gamified Quizzes & Hackathons",
    practiceCategory: "Experiential Learning",
    practiceDescription: "Conducted 24-hour infrastructure-as-code challenge. Students deployed self-healing Kubernetes clusters with Prometheus monitoring; live simulated outages tested their rollback configurations.",
    assessmentMethod: "Continuous Coding Sprints & Peer Review",
    bloomsLevels: ["Apply", "Analyze", "Create"],
    ictTools: "AWS Educate, Docker, GitHub Actions, Terraform",
    studentFeedbackScore: 4.7,
    passPercentage: 92.0,
    evidenceAttached: true,
    evidenceUrl: "https://lms.college.edu/evidence/it601-devops.pdf",
    rubricAttached: true,
    remedialAction: "Starter templates with pre-configured CI scripts provided for beginner-tier teams.",
    submissionDate: "2026-10-01"
  },
  {
    id: "SUB-2026-006",
    facultyId: "FAC-ECE-207",
    facultyName: "Prof. Ramesh Patel",
    designation: "Assistant Professor",
    department: "Electronics & Communication",
    courseCode: "EC306",
    courseTitle: "Microcontrollers & Embedded Systems",
    academicYear: "2025-26 (Even Sem)",
    pedagogicalPractice: "Project-Based Learning (PjBL)",
    practiceCategory: "Experiential Learning",
    practiceDescription: "Students designed IoT environmental monitoring boards using ESP32 and MQTT protocol. Functional hardware demonstration evaluated by external alumni mentors.",
    assessmentMethod: "Hardware Prototype Demonstration",
    bloomsLevels: ["Apply", "Analyze", "Create"],
    ictTools: "Arduino IDE, Wokwi IoT Simulator, KiCad EDA",
    studentFeedbackScore: 4.5,
    passPercentage: 89.2,
    evidenceAttached: true,
    evidenceUrl: "https://lms.college.edu/evidence/ec306-esp32.pdf",
    rubricAttached: true,
    remedialAction: "Hardware kits made available in makerspace during open weekend lab hours.",
    submissionDate: "2026-10-04"
  },
  {
    id: "SUB-2026-007",
    facultyId: "FAC-CV-502",
    facultyName: "Prof. Vikram Joshi",
    designation: "Assistant Professor",
    department: "Civil Engineering",
    courseCode: "CE402",
    courseTitle: "Structural Analysis & Design",
    academicYear: "2025-26 (Even Sem)",
    pedagogicalPractice: "Traditional Lecture with Minor Quiz",
    practiceCategory: "Teacher-Centric / Traditional",
    practiceDescription: "Conducted standard 50-minute lectures covering stiffness matrix theorems. End-of-unit 10-minute multiple-choice recall quiz conducted on paper.",
    assessmentMethod: "Written Mid-Term & End-Term Only",
    bloomsLevels: ["Remember", "Understand"],
    ictTools: "PowerPoint Slides",
    studentFeedbackScore: 3.4,
    passPercentage: 68.0,
    evidenceAttached: false,
    evidenceUrl: "",
    rubricAttached: false,
    remedialAction: "No formal remedial program documented; advised students to refer to textbook.",
    submissionDate: "2026-10-06"
  }
];
