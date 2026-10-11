/**
 * PED PLATFORM - COLLEGE HIERARCHY & BENCHMARK DATA
 * St. Joseph's College (Autonomous), Tiruchirappalli
 * Internal Quality Assurance Cell (IQAC)
 * Structured hierarchically: Departments -> Faculty -> Annexure 9(b) & 9(c) Reports.
 */

export const COLLEGE_INFO = {
  institutionName: "St. Joseph's College (Autonomous)",
  location: "Tiruchirappalli - 620 002, Tamil Nadu",
  cell: "Internal Quality Assurance Cell (IQAC)",
  academicYear: "2025-26",
  naacCycle: "Cycle 4 - Re-accredited with A++ Grade (CGPA 3.58/4)"
};

export const DEPARTMENTS_DATA = [
  {
    id: "DEPT-CS",
    name: "Computer Science",
    hod: "Dr. S. Albert Rabara",
    code: "CS",
    totalFaculty: 4,
    established: "1983",
    description: "Postgraduate & Research Department of Computer Science"
  },
  {
    id: "DEPT-IT",
    name: "Information Technology",
    hod: "Dr. L. Arockiam",
    code: "IT",
    totalFaculty: 3,
    established: "2001",
    description: "Department of Information Technology & Cloud Systems"
  },
  {
    id: "DEPT-MATH",
    name: "Mathematics",
    hod: "Dr. J. Maria Joseph",
    code: "MATH",
    totalFaculty: 3,
    established: "1844",
    description: "Department of Mathematics & Applied Statistics"
  },
  {
    id: "DEPT-PHY",
    name: "Physics",
    hod: "Dr. N. Lawrence",
    code: "PHY",
    totalFaculty: 3,
    established: "1881",
    description: "School of Physical Sciences"
  },
  {
    id: "DEPT-COMM",
    name: "Commerce",
    hod: "Dr. F. R. Alexander Pravin Durai",
    code: "COMM",
    totalFaculty: 3,
    established: "1948",
    description: "Department of Commerce & FinTech Analytics"
  },
  {
    id: "DEPT-MGMT",
    name: "Management Studies",
    hod: "Dr. P. J. Biju",
    code: "BBA",
    totalFaculty: 2,
    established: "1978",
    description: "Department of Business Administration & Leadership"
  }
];

export const INITIAL_FACULTY_RECORDS = [
  {
    id: "FAC-CS-01",
    facultyName: "Dr. D. P. Jeyaseelan",
    designation: "Associate Professor",
    department: "Computer Science",
    programme: "M.Sc. Computer Science",
    courseCode: "23PCS301",
    courseTitle: "Design & Analysis of Algorithms",
    academicYear: "2025-26 (Odd Sem)",
    email: "jeyaseelan@sjctni.edu",
    annexure9b: {
      submitted: true,
      submissionDate: "2026-09-18",
      fileName: "Annexure_9_b_Jeyaseelan_CS301.docx",
      unit: "Unit III",
      topic: "Dynamic Programming & Memoization Graphs",
      teachingMethod: "Flipped Classroom & Timed Peer Sprints",
      pedagogicalApproach: "Active & Collaborative Problem Solving",
      tools: "Moodle LMS, LeetCode Classroom, VS Code Live Share",
      coAlignment: "CO2, CO3, CO4",
      planningPurpose: "Chose flipped delivery to eliminate passive textbook recitation; intended to empower students to build recurrence relations in teams.",
      inClassDelivery: "Conducted 15-minute concept clarification followed by a 45-minute timed peer coding sprint where student duos solved algorithmic problems.",
      impact: "92% of student duos arrived at the optimal O(N) space complexity solution during in-class live tests.",
      lookingAhead: "Will introduce automated GitHub classroom CI test suites for incremental test-driven grading.",
      score: 95,
      band: "Exemplary",
      strengths: [
        "Highly engaging active learning through peer programming sprints.",
        "Demonstrated clear cognitive focus on Higher-Order Thinking Skills (HOTS: Analyze & Create).",
        "Effective digital integration using Moodle and live code collaboration."
      ],
      recommendations: [
        "Document follow-up diagnostic assessments for struggling student pairs.",
        "Consider presenting this sprint methodology at the college pedagogical colloquium."
      ]
    },
    annexure9c: {
      submitted: true,
      submissionDate: "2026-09-25",
      fileName: "Annexure_9_c_Jeyaseelan_CS301.docx",
      courseOutcomes: [
        "CO1: Formulate recurrence relations for divide-and-conquer algorithms.",
        "CO2: Construct dynamic programming state transition matrices.",
        "CO3: Design greedy heuristics for combinatorial optimization.",
        "CO4: Evaluate NP-completeness and polynomial reductions.",
        "CO5: Synthesize approximation algorithms for hard problems."
      ],
      components: [
        { name: "CIA 1 - Midterm Written Evaluation", type: "Summative", co: "CO1, CO2", announcedDate: "2026-08-15", preMaterials: "Question bank & syllabus", compDate: "2026-08-28", postMaterials: "Answer key with marks rubric", scored: true, marks: 25 },
        { name: "Peer Algorithmic Code Review", type: "Alternative", co: "CO2, CO3", announcedDate: "2026-09-02", preMaterials: "Coding style rubric & test cases", compDate: "2026-09-15", postMaterials: "PR reviews with individual feedback", scored: true, marks: 15 },
        { name: "In-Class DP Problem Sprint", type: "Formative", co: "CO3", announcedDate: "2026-09-16", preMaterials: "Recurrence templates", compDate: "2026-09-18", postMaterials: "Recap summary video", scored: false, marks: 10 }
      ],
      whatWorked: "Alternative assessment via peer review incentivized clean algorithmic thinking and code readability.",
      whatCouldImprove: "Provide earlier formative feedback before the first summative CIA test.",
      score: 93,
      band: "Exemplary",
      strengths: [
        "Comprehensive blend of Summative, Formative, and Alternative assessments.",
        "Clear alignment across Course Outcomes CO1-CO5 with published rubrics."
      ],
      recommendations: [
        "Add more frequent non-scored diagnostic checks in early weeks."
      ]
    },
    compositeScore: 94,
    statusBand: "Exemplary"
  },
  {
    id: "FAC-CS-02",
    facultyName: "Dr. K. Maheswaran",
    designation: "Assistant Professor",
    department: "Computer Science",
    programme: "B.Sc. Computer Science",
    courseCode: "23UCS402",
    courseTitle: "Full-Stack Web Engineering",
    academicYear: "2025-26 (Odd Sem)",
    email: "maheswaran@sjctni.edu",
    annexure9b: {
      submitted: true,
      submissionDate: "2026-09-20",
      fileName: "Annexure_9_b_Maheswaran_CS402.docx",
      unit: "Unit IV",
      topic: "RESTful API Architecture & JWT Security",
      teachingMethod: "Project-Based Learning (PjBL)",
      pedagogicalApproach: "Experiential & Inquiry-Based Learning",
      tools: "Postman, GitHub Classroom, Node.js, Express",
      coAlignment: "CO3, CO4",
      planningPurpose: "To transition learners from theoretical HTTP definitions to hands-on authenticated endpoint development.",
      inClassDelivery: "Students worked in 3-member squads to build and test API endpoints with live vulnerability injections.",
      impact: "All teams successfully demonstrated authenticated token exchange and error interceptors.",
      lookingAhead: "Plan to integrate Docker containerization into the in-class deployment cycle.",
      score: 92,
      band: "Exemplary",
      strengths: [
        "Industry-aligned Project-Based Learning strategy.",
        "Effective utilization of GitHub and Postman for automated validation."
      ],
      recommendations: [
        "Formulate explicit self-evaluation rubrics for peer squad contributions."
      ]
    },
    annexure9c: {
      submitted: true,
      submissionDate: "2026-09-28",
      fileName: "Annexure_9_c_Maheswaran_CS402.docx",
      courseOutcomes: [
        "CO1: Design responsive web layouts using semantic standards.",
        "CO2: Build server-side controllers and database schemas.",
        "CO3: Implement RESTful authentication and role authorizations.",
        "CO4: Deploy full-stack applications to cloud environments."
      ],
      components: [
        { name: "CIA 1 - Theory & Architecture", type: "Summative", co: "CO1, CO2", announcedDate: "2026-08-18", preMaterials: "Syllabus & Blueprint", compDate: "2026-08-30", postMaterials: "Model solutions", scored: true, marks: 25 },
        { name: "Capstone Microservice Sprint", type: "Alternative", co: "CO3, CO4", announcedDate: "2026-09-05", preMaterials: "Project rubric & GitHub repos", compDate: "2026-09-22", postMaterials: "Automated test reports", scored: true, marks: 20 }
      ],
      whatWorked: "Live GitHub CI test runs allowed students to self-correct code before final evaluation.",
      whatCouldImprove: "Stagger submission milestones to avoid end-of-unit squad bottlenecks.",
      score: 90,
      band: "Exemplary",
      strengths: [
        "Clear rubric-based evaluation for capstone development.",
        "Balanced distribution between foundational theory and alternative assessments."
      ],
      recommendations: [
        "Add explicit formative self-assessment quizzes prior to CIA 1."
      ]
    },
    compositeScore: 91,
    statusBand: "Exemplary"
  },
  {
    id: "FAC-IT-01",
    facultyName: "Dr. C. Venkatramanan",
    designation: "Associate Professor",
    department: "Information Technology",
    programme: "M.Sc. Information Technology",
    courseCode: "23PIT203",
    courseTitle: "Cloud Architecture & DevOps Pipelines",
    academicYear: "2025-26 (Odd Sem)",
    email: "venkat@sjctni.edu",
    annexure9b: {
      submitted: true,
      submissionDate: "2026-09-22",
      fileName: "Annexure_9_b_Venkat_IT203.docx",
      unit: "Unit II",
      topic: "Container Orchestration with Kubernetes",
      teachingMethod: "Simulation & Virtual Cloud Lab Sprints",
      pedagogicalApproach: "Experiential Learning",
      tools: "AWS Educate, Minikube, Docker Hub, College LMS",
      coAlignment: "CO2, CO3",
      planningPurpose: "To enable students to design resilient cloud architectures with auto-scaling and failover policies.",
      inClassDelivery: "Conducted simulated node-failure challenges where students observed self-healing pod behaviors in real time.",
      impact: "High student excitement; 88% pass rate on complex multi-tier container deployment.",
      lookingAhead: "Add Terraform infrastructure-as-code scripts in upcoming semesters.",
      score: 89,
      band: "Proficient",
      strengths: [
        "Hands-on simulation of realistic cloud infrastructure scenarios.",
        "Strong outcome mapping with high student engagement."
      ],
      recommendations: [
        "Include more structured remedial assistance for students new to command-line environments."
      ]
    },
    annexure9c: {
      submitted: true,
      submissionDate: "2026-09-29",
      fileName: "Annexure_9_c_Venkat_IT203.docx",
      courseOutcomes: [
        "CO1: Analyze virtualization and cloud deployment models.",
        "CO2: Configure Docker containers and multi-container apps.",
        "CO3: Deploy containerized workloads with Kubernetes.",
        "CO4: Automate CI/CD pipelines using GitHub Actions."
      ],
      components: [
        { name: "CIA 1 - Cloud Fundamentals", type: "Summative", co: "CO1, CO2", announcedDate: "2026-08-20", preMaterials: "Study guide", compDate: "2026-09-02", postMaterials: "Feedback sheet", scored: true, marks: 25 },
        { name: "Kubernetes Cluster Deployment Challenge", type: "Alternative", co: "CO2, CO3", announcedDate: "2026-09-10", preMaterials: "Lab checklist & Rubric", compDate: "2026-09-24", postMaterials: "Cluster log audit", scored: true, marks: 20 }
      ],
      whatWorked: "Lab-based practical assessment mirrored real corporate DevOps interviews.",
      whatCouldImprove: "Provide starter code templates for teams struggling with YAML syntax.",
      score: 88,
      band: "Proficient",
      strengths: [
        "Direct alignment with industry competencies (NBA Criterion 3).",
        "Clear rubrics for practical task grading."
      ],
      recommendations: [
        "Incorporate un-scored formative peer feedback on configuration files."
      ]
    },
    compositeScore: 88.5,
    statusBand: "Proficient"
  },
  {
    id: "FAC-MATH-01",
    facultyName: "Dr. S. Athisayanathan",
    designation: "Associate Professor",
    department: "Mathematics",
    programme: "M.Sc. Mathematics",
    courseCode: "23PMT102",
    courseTitle: "Real Analysis & Topology",
    academicYear: "2025-26 (Odd Sem)",
    email: "athisaya@sjctni.edu",
    annexure9b: {
      submitted: true,
      submissionDate: "2026-09-24",
      fileName: "Annexure_9_b_Athisaya_MATH102.docx",
      unit: "Unit I",
      topic: "Compactness, Connectedness & Metric Spaces",
      teachingMethod: "Think-Pair-Share & Proof Construction Sprints",
      pedagogicalApproach: "Collaborative Inquiry",
      tools: "GeoGebra, Smart Interactive Whiteboard, Handouts",
      coAlignment: "CO1, CO2",
      planningPurpose: "To deconstruct abstract topological definitions into visual and student-derived proofs.",
      inClassDelivery: "Presented a counter-intuitive lemma; pairs debated open-cover conditions and presented proof diagrams.",
      impact: "Deepened proof rigor; students successfully spotted edge cases in unbounded sets.",
      lookingAhead: "Incorporate student proof-writing journals for weekly reflections.",
      score: 86,
      band: "Proficient",
      strengths: [
        "Creative use of Think-Pair-Share in an abstract pure mathematics subject.",
        "Demonstrated strong student-centered debate and proof validation."
      ],
      recommendations: [
        "Attach video or LMS links as formal evidence under Section D."
      ]
    },
    annexure9c: {
      submitted: true,
      submissionDate: "2026-10-02",
      fileName: "Annexure_9_c_Athisaya_MATH102.docx",
      courseOutcomes: [
        "CO1: Prove metric space properties and completeness.",
        "CO2: Evaluate topological compactness using Heine-Borel theorems.",
        "CO3: Construct continuous mappings on topological spaces."
      ],
      components: [
        { name: "CIA 1 - Rigorous Proof Exam", type: "Summative", co: "CO1, CO2", announcedDate: "2026-08-22", preMaterials: "Theorem compilation", compDate: "2026-09-04", postMaterials: "Rubric with proof step weights", scored: true, marks: 25 },
        { name: "Mathematical Proof Presentation", type: "Alternative", co: "CO2, CO3", announcedDate: "2026-09-12", preMaterials: "Rubric for mathematical clarity", compDate: "2026-09-26", postMaterials: "Peer feedback forms", scored: true, marks: 15 }
      ],
      whatWorked: "Oral proof presentation required students to defend mathematical logic under peer questioning.",
      whatCouldImprove: "Offer tutorial practice on epsilon-delta notation before formal CIA.",
      score: 84,
      band: "Proficient",
      strengths: [
        "Rigorous oral and written assessment combination.",
        "Structured grading rubric for mathematical proofs."
      ],
      recommendations: [
        "Incorporate weekly low-stakes formative diagnostic quizzes."
      ]
    },
    compositeScore: 85,
    statusBand: "Proficient"
  },
  {
    id: "FAC-PHY-01",
    facultyName: "Dr. B. Kanmani",
    designation: "Assistant Professor",
    department: "Physics",
    programme: "B.Sc. Physics",
    courseCode: "23UPH301",
    courseTitle: "Optics & Laser Spectroscopy",
    academicYear: "2025-26 (Odd Sem)",
    email: "kanmani@sjctni.edu",
    annexure9b: {
      submitted: true,
      submissionDate: "2026-09-26",
      fileName: "Annexure_9_b_Kanmani_PHY301.docx",
      unit: "Unit III",
      topic: "Interferometry & Michelson Experiments",
      teachingMethod: "Virtual Labs (Amrita/MHRD) & Peer Demonstration",
      pedagogicalApproach: "Inquiry-Based Learning",
      tools: "PhET Simulations, Virtual Labs, Laser Spectrometer",
      coAlignment: "CO2, CO3",
      planningPurpose: "To allow students to manipulate wavelength and mirror distance variables safely prior to physical laser handling.",
      inClassDelivery: "Students predicted fringe pattern shifts using virtual simulations before aligning the bench interferometer.",
      impact: "Reduced equipment setup errors in the darkroom by 60%.",
      lookingAhead: "Design interactive digital worksheets for recording diffraction observations.",
      score: 87,
      band: "Proficient",
      strengths: [
        "Pre-lab virtual simulation drastically improved physical laboratory efficiency.",
        "High student engagement during optical fringe alignment."
      ],
      recommendations: [
        "Formalize remedial lab hours for students who struggle with optical alignments."
      ]
    },
    annexure9c: {
      submitted: true,
      submissionDate: "2026-10-04",
      fileName: "Annexure_9_c_Kanmani_PHY301.docx",
      courseOutcomes: [
        "CO1: Explain wave optics principles and polarization.",
        "CO2: Measure optical wavelengths using interferometers.",
        "CO3: Analyze laser emission spectra and coherence lengths."
      ],
      components: [
        { name: "CIA 1 - Theoretical Optics Exam", type: "Summative", co: "CO1, CO2", announcedDate: "2026-08-25", preMaterials: "Blueprint & question types", compDate: "2026-09-08", postMaterials: "Evaluation rubric", scored: true, marks: 25 },
        { name: "Experimental Setup & Unknown Wavelength Calculation", type: "Alternative", co: "CO2, CO3", announcedDate: "2026-09-15", preMaterials: "Lab rubric & safety guidelines", compDate: "2026-09-29", postMaterials: "Error analysis notes", scored: true, marks: 20 }
      ],
      whatWorked: "Direct experimental verification ensured practical alignment with theory.",
      whatCouldImprove: "Provide video examples of standard optical alignment mistakes.",
      score: 86,
      band: "Proficient",
      strengths: [
        "Strong linkage between classroom theory and laboratory measurement.",
        "Clear rubric detailing marks for experimental procedure, precision, and error calculations."
      ],
      recommendations: [
        "Introduce non-scored formative reflections on laser safety protocols."
      ]
    },
    compositeScore: 86.5,
    statusBand: "Proficient"
  },
  {
    id: "FAC-COMM-01",
    facultyName: "Dr. K. Alex",
    designation: "Associate Professor",
    department: "Commerce",
    programme: "M.Com.",
    courseCode: "23PCO302",
    courseTitle: "Financial Markets & Investment Analytics",
    academicYear: "2025-26 (Odd Sem)",
    email: "alex@sjctni.edu",
    annexure9b: {
      submitted: true,
      submissionDate: "2026-09-28",
      fileName: "Annexure_9_b_Alex_COMM302.docx",
      unit: "Unit IV",
      topic: "Portfolio Diversification & Capital Asset Pricing (CAPM)",
      teachingMethod: "Virtual Stock Trading Simulation & Case Analysis",
      pedagogicalApproach: "Experiential & Gamified Learning",
      tools: "Moneybhai Virtual Trading Portal, MS Excel, NSE Live Feeds",
      coAlignment: "CO3, CO4",
      planningPurpose: "To allow students to experience real-time market volatility and beta calculations with virtual capital.",
      inClassDelivery: "Students managed a virtual ₹10 Lakh portfolio over 3 weeks, presenting weekly risk-return justifications.",
      impact: "Students articulated Sharpe ratio and covariance tradeoffs with genuine market examples.",
      lookingAhead: "Invite alumni equity analysts for guest reviews of student portfolio strategies.",
      score: 93,
      band: "Exemplary",
      strengths: [
        "Outstanding experiential learning using real-time market data.",
        "High student engagement through portfolio performance tracking."
      ],
      recommendations: [
        "Ensure students who suffered severe virtual portfolio losses receive structured debriefing sessions."
      ]
    },
    annexure9c: {
      submitted: true,
      submissionDate: "2026-10-06",
      fileName: "Annexure_9_c_Alex_COMM302.docx",
      courseOutcomes: [
        "CO1: Understand financial market instruments and SEBI regulations.",
        "CO2: Calculate security returns, variances, and beta coefficients.",
        "CO3: Construct efficient investment frontiers using modern portfolio theory.",
        "CO4: Evaluate mutual fund performance using risk-adjusted measures."
      ],
      components: [
        { name: "CIA 1 - Financial Theory & Problem Solving", type: "Summative", co: "CO1, CO2", announcedDate: "2026-08-28", preMaterials: "Formula book & Question bank", compDate: "2026-09-10", postMaterials: "Model solutions", scored: true, marks: 25 },
        { name: "Virtual Portfolio Performance Presentation", type: "Alternative", co: "CO3, CO4", announcedDate: "2026-09-12", preMaterials: "Presentation rubric & Excel model", compDate: "2026-10-02", postMaterials: "Feedback critique", scored: true, marks: 20 },
        { name: "In-Class CAPM Numerical Drill", type: "Formative", co: "CO2", announcedDate: "2026-09-20", preMaterials: "Spreadsheet templates", compDate: "2026-09-22", postMaterials: "Solved spreadsheet", scored: false, marks: 10 }
      ],
      whatWorked: "Alternative assessment through portfolio presentation evaluated student decision-making under uncertainty.",
      whatCouldImprove: "Provide additional Excel formula cheat-sheets for students from non-math backgrounds.",
      score: 91,
      band: "Exemplary",
      strengths: [
        "Well-structured balance of written tests, spreadsheet models, and oral presentations.",
        "Comprehensive Course Outcome coverage from CO1 to CO4."
      ],
      recommendations: [
        "Conduct earlier spreadsheet diagnostic sessions for slow learners."
      ]
    },
    compositeScore: 92,
    statusBand: "Exemplary"
  },
  {
    id: "FAC-MGMT-01",
    facultyName: "Dr. A. Savarimuthu",
    designation: "Associate Professor",
    department: "Management Studies",
    programme: "MBA",
    courseCode: "23MBA204",
    courseTitle: "Strategic Human Resource Management",
    academicYear: "2025-26 (Odd Sem)",
    email: "savari@sjctni.edu",
    annexure9b: {
      submitted: true,
      submissionDate: "2026-09-30",
      fileName: "Annexure_9_b_Savari_MGMT204.docx",
      unit: "Unit II",
      topic: "Talent Retention & Corporate Culture Crises",
      teachingMethod: "Harvard-Style Case Study & Role-Play Negotiation",
      pedagogicalApproach: "Participative & Problem-Based Learning",
      tools: "Harvard Business Review Case Studies, Video Case Vignettes, Miro",
      coAlignment: "CO2, CO3",
      planningPurpose: "To develop strategic managerial decision-making when facing union negotiations and organizational restructuring.",
      inClassDelivery: "Students took opposing roles as HR Directors and Employee Union Representatives to draft collective agreements.",
      impact: "High emotional intelligence and debate demonstrated; students applied legal and cultural frameworks.",
      lookingAhead: "Record roleplay sessions so students can review their negotiation body language.",
      score: 91,
      band: "Exemplary",
      strengths: [
        "Exemplary participative role-play and negotiation simulation.",
        "Excellent alignment with MBA managerial leadership attributes."
      ],
      recommendations: [
        "Create an explicit peer observation rubric for audience students during negotiations."
      ]
    },
    annexure9c: {
      submitted: true,
      submissionDate: "2026-10-08",
      fileName: "Annexure_9_c_Savari_MGMT204.docx",
      courseOutcomes: [
        "CO1: Analyze strategic HR alignment with corporate objectives.",
        "CO2: Formulate retention and succession planning strategies.",
        "CO3: Resolve industrial disputes and employee relations conflicts."
      ],
      components: [
        { name: "CIA 1 - Case Analysis Written Exam", type: "Summative", co: "CO1, CO2", announcedDate: "2026-09-01", preMaterials: "Case reading & rubric", compDate: "2026-09-14", postMaterials: "Faculty review comments", scored: true, marks: 25 },
        { name: "Executive HR Policy Proposal", type: "Alternative", co: "CO2, CO3", announcedDate: "2026-09-18", preMaterials: "Policy brief template", compDate: "2026-10-04", postMaterials: "Rubric assessment sheet", scored: true, marks: 20 }
      ],
      whatWorked: "Writing a corporate policy brief mirrored actual corporate deliverables.",
      whatCouldImprove: "Offer sample executive memos from prior years as reference benchmarks.",
      score: 89,
      band: "Proficient",
      strengths: [
        "Realistic corporate deliverables evaluated with explicit rubrics.",
        "Clear alignment with managerial problem solving."
      ],
      recommendations: [
        "Introduce quick formative exit tickets to gauge conceptual retention."
      ]
    },
    compositeScore: 90,
    statusBand: "Exemplary"
  },
  {
    id: "FAC-COMM-02",
    facultyName: "Prof. M. Antony",
    designation: "Assistant Professor",
    department: "Commerce",
    programme: "B.Com.",
    courseCode: "23UCO201",
    courseTitle: "Business Law & Company Regulations",
    academicYear: "2025-26 (Odd Sem)",
    email: "antony@sjctni.edu",
    annexure9b: {
      submitted: true,
      submissionDate: "2026-10-02",
      fileName: "Annexure_9_b_Antony_COMM201.docx",
      unit: "Unit I",
      topic: "Indian Contract Act & Offer/Acceptance Principles",
      teachingMethod: "Traditional Lecture with Black Board",
      pedagogicalApproach: "Teacher-Centric / Traditional",
      tools: "Chalk and Blackboard",
      coAlignment: "CO1",
      planningPurpose: "To dictate sections and landmark legal cases.",
      inClassDelivery: "Read clauses from the textbook; students copied definitions into notebooks.",
      impact: "Students were quiet; questions were mostly recall-based.",
      lookingAhead: "Might try asking students to read cases at home if time permits.",
      score: 58,
      band: "Needs Improvement",
      strengths: [
        "Clear coverage of foundational syllabus clauses."
      ],
      recommendations: [
        "Transition towards interactive legal case discussions or moot court role-plays.",
        "Incorporate multimedia presentations and LMS reading materials.",
        "Shift focus from rote memorization of sections to contextual problem solving."
      ]
    },
    annexure9c: {
      submitted: true,
      submissionDate: "2026-10-09",
      fileName: "Annexure_9_c_Antony_COMM201.docx",
      courseOutcomes: [
        "CO1: State the definitions of valid contracts under the 1872 Act.",
        "CO2: List terms of breach and remedies."
      ],
      components: [
        { name: "CIA 1 - Written Theory Exam", type: "Summative", co: "CO1, CO2", announcedDate: "2026-09-05", preMaterials: "Textbook chapters", compDate: "2026-09-18", postMaterials: "Marks on notice board", scored: true, marks: 25 },
        { name: "Written Assignment on Section 10", type: "Summative", co: "CO1", announcedDate: "2026-09-22", preMaterials: "Assignment prompt", compDate: "2026-10-05", postMaterials: "Graded papers", scored: true, marks: 10 }
      ],
      whatWorked: "Straightforward written questions were easy to grade.",
      whatCouldImprove: "Students wrote very similar answers copied from the same guide.",
      score: 60,
      band: "Developing",
      strengths: [
        "Standard compliance with minimum exam guidelines."
      ],
      recommendations: [
        "Introduce Alternative Assessment components (e.g. drafting contract clauses or case analysis).",
        "Formulate and share transparent grading rubrics with students in advance.",
        "Introduce formative in-class checks rather than only summative written papers."
      ]
    },
    compositeScore: 59,
    statusBand: "Needs Improvement"
  }
];
