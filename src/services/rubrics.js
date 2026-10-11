/**
 * PED PLATFORM - IQAC RUBRICS & TAXONOMIES
 * St. Joseph's College (Autonomous), Tiruchirappalli
 * Configurable, versioned rubrics for Annexures 9(b) and 9(c),
 * plus standardized pedagogy and assessment categorization.
 */

export const RUBRIC_VERSION = "v1.2-IQAC-SJC-2025-26";

/**
 * Standardized Pedagogy Categories (User Specification 5)
 */
export const STANDARDIZED_PEDAGOGIES = [
  "Lecture",
  "Discussion",
  "Demonstration",
  "Collaborative Learning",
  "Project-Based Learning",
  "Problem-Based Learning",
  "Case-Based Learning",
  "Flipped Classroom",
  "Experiential Learning",
  "Technology-Enhanced Learning"
];

/**
 * Standardized Assessment Categories (User Specification 5)
 */
export const STANDARDIZED_ASSESSMENTS = [
  "Written Tests",
  "Quizzes",
  "Assignments",
  "Presentations",
  "Practical Assessments",
  "Projects",
  "Viva Voce",
  "Peer Assessment",
  "Self-Assessment"
];

/**
 * Maps faculty-entered pedagogy text to standardized categories
 * Preserves original text while identifying multiple matching categories
 */
export function mapToStandardPedagogies(text) {
  if (!text || typeof text !== 'string') return ["Lecture"];
  const lower = text.toLowerCase();
  const matched = [];

  if (lower.includes("flip") || lower.includes("pre-record") || lower.includes("inverted")) {
    matched.push("Flipped Classroom");
  }
  if (lower.includes("project") || lower.includes("pjbl") || lower.includes("capstone")) {
    matched.push("Project-Based Learning");
  }
  if (lower.includes("problem") || lower.includes("pbl") || lower.includes("inquiry")) {
    matched.push("Problem-Based Learning");
  }
  if (lower.includes("case") || lower.includes("harvard") || lower.includes("vignette")) {
    matched.push("Case-Based Learning");
  }
  if (lower.includes("collaborative") || lower.includes("peer") || lower.includes("sprint") || lower.includes("pair") || lower.includes("team") || lower.includes("group")) {
    matched.push("Collaborative Learning");
  }
  if (lower.includes("simulation") || lower.includes("virtual lab") || lower.includes("hands-on") || lower.includes("makerspace") || lower.includes("field")) {
    matched.push("Experiential Learning");
  }
  if (lower.includes("technology") || lower.includes("lms") || lower.includes("moodle") || lower.includes("github") || lower.includes("colab") || lower.includes("docker") || lower.includes("ict")) {
    matched.push("Technology-Enhanced Learning");
  }
  if (lower.includes("discuss") || lower.includes("debate") || lower.includes("dialogue")) {
    matched.push("Discussion");
  }
  if (lower.includes("demonstrat") || lower.includes("model")) {
    matched.push("Demonstration");
  }
  if (lower.includes("lecture") || lower.includes("chalk") || lower.includes("board") || lower.includes("talk") || matched.length === 0) {
    matched.push("Lecture");
  }

  return [...new Set(matched)];
}

/**
 * Maps faculty-entered assessment text to standardized categories
 */
export function mapToStandardAssessments(text, type = "") {
  if (!text || typeof text !== 'string') return ["Written Tests"];
  const lower = (text + " " + type).toLowerCase();
  const matched = [];

  if (lower.includes("quiz") || lower.includes("mcq") || lower.includes("poll")) {
    matched.push("Quizzes");
  }
  if (lower.includes("project") || lower.includes("capstone") || lower.includes("prototype") || lower.includes("mini project")) {
    matched.push("Projects");
  }
  if (lower.includes("peer review") || lower.includes("peer assess") || lower.includes("peer")) {
    matched.push("Peer Assessment");
  }
  if (lower.includes("self") || lower.includes("reflection journal") || lower.includes("logbook")) {
    matched.push("Self-Assessment");
  }
  if (lower.includes("presentation") || lower.includes("seminar") || lower.includes("oral defense")) {
    matched.push("Presentations");
  }
  if (lower.includes("practical") || lower.includes("lab") || lower.includes("experiment") || lower.includes("simulation")) {
    matched.push("Practical Assessments");
  }
  if (lower.includes("viva") || lower.includes("oral exam") || lower.includes("interview")) {
    matched.push("Viva Voce");
  }
  if (lower.includes("assignment") || lower.includes("homework") || lower.includes("task sheet")) {
    matched.push("Assignments");
  }
  if (lower.includes("cia") || lower.includes("written") || lower.includes("exam") || lower.includes("midterm") || lower.includes("test") || matched.length === 0) {
    matched.push("Written Tests");
  }

  return [...new Set(matched)];
}

/**
 * Annexure 9(b) Rubric Criteria Configuration
 */
export const RUBRIC_9B_CONFIG = {
  version: RUBRIC_VERSION,
  title: "Annexure 9(b) - Faculty Reflection on Pedagogical Practices Rubric",
  criteria: [
    {
      id: "methodApproach",
      name: "Teaching Method & Pedagogical Approach",
      weight: 15,
      maxPoints: 15,
      section: "Section B: Method & Approach",
      description: "Appropriateness and student-centeredness of the reported teaching method.",
      mandatory: true
    },
    {
      id: "planningPurpose",
      name: "Planning & Purpose",
      weight: 15,
      maxPoints: 15,
      section: "Section B: Planning and Purpose",
      description: "Clear articulation of why this method was chosen and intended learning goals.",
      mandatory: true
    },
    {
      id: "classroomDelivery",
      name: "Classroom Delivery & Student Flow",
      weight: 15,
      maxPoints: 15,
      section: "Section B: In-Class Delivery",
      description: "Specific description of teacher activities, student actions, and session flow.",
      mandatory: true
    },
    {
      id: "coAlignment",
      name: "Course Outcome (CO) Alignment",
      weight: 10,
      maxPoints: 10,
      section: "Section B: Alignment with COs",
      description: "Direct mapping to defined Course Outcomes (e.g. CO1, CO2).",
      mandatory: true
    },
    {
      id: "learningEvidence",
      name: "Evidence of Learning & Student Engagement",
      weight: 15,
      maxPoints: 15,
      section: "Section B: Impact",
      description: "Observed signs of learning, performance data, or diagnostic assessment.",
      mandatory: true
    },
    {
      id: "strengthsChallenges",
      name: "Reflection on Strengths & Challenges",
      weight: 10,
      maxPoints: 10,
      section: "Section B: Looking Ahead (Part 1)",
      description: "Critical self-assessment of what worked well and specific hurdles faced.",
      mandatory: true
    },
    {
      id: "futureImprovement",
      name: "Specific Future Improvements",
      weight: 10,
      maxPoints: 10,
      section: "Section B: Looking Ahead (Part 2)",
      description: "Actionable adjustments planned for the next offering of this topic.",
      mandatory: true
    },
    {
      id: "evidenceCompleteness",
      name: "Evidence Relevance & Completeness",
      weight: 10,
      maxPoints: 10,
      section: "Section D: List of Evidence Attached",
      description: "Soft copies, links, or verifiable artifacts supporting classroom claims.",
      mandatory: true
    }
  ]
};

/**
 * Annexure 9(c) Rubric Criteria Configuration
 */
export const RUBRIC_9C_CONFIG = {
  version: RUBRIC_VERSION,
  title: "Annexure 9(c) - Faculty Reflection on Assessment Components Rubric",
  criteria: [
    {
      id: "inventoryCompleteness",
      name: "Assessment Inventory Completeness",
      weight: 15,
      maxPoints: 15,
      section: "Section C: Assessment Components Used",
      description: "Comprehensive listing of continuous assessments (minimum 2 components).",
      mandatory: true
    },
    {
      id: "coMapping",
      name: "Course Outcome (CO) Alignment & Coverage",
      weight: 15,
      maxPoints: 15,
      section: "Section B & C: CO Statements and Component Mapping",
      description: "Explicit mapping of assessment tasks to approved syllabus COs (CO1-CO5).",
      mandatory: true
    },
    {
      id: "assessmentDesign",
      name: "Assessment Design & Variety (Summative/Formative/Alternative)",
      weight: 15,
      maxPoints: 15,
      section: "Section C: Assessment Type",
      description: "Balance across summative exams, formative checks, and alternative tasks.",
      mandatory: true
    },
    {
      id: "preMaterialsTransparency",
      name: "Announcement & Preparatory Materials",
      weight: 10,
      maxPoints: 10,
      section: "Section C: Advance Notice & Pre-Assessment Materials",
      description: "Advance announcement date and study guides, rubrics, or blueprints provided.",
      mandatory: true
    },
    {
      id: "completionRecords",
      name: "Completion Dates & Assessment Records",
      weight: 10,
      maxPoints: 10,
      section: "Section C: Completion Date & Administration",
      description: "Verifiable completion schedules and adherence to continuous timelines.",
      mandatory: true
    },
    {
      id: "postAssessmentFeedback",
      name: "Post-Assessment Feedback & Materials",
      weight: 10,
      maxPoints: 10,
      section: "Section C: Post-Assessment Materials",
      description: "Constructive feedback, answer keys, or diagnostic recap provided to learners.",
      mandatory: true
    },
    {
      id: "marksClassification",
      name: "Marks & Assessment Classification",
      weight: 10,
      maxPoints: 10,
      section: "Section C: Scored vs Practice & Total Marks",
      description: "Transparent allocation of marks and distinction between scored and practice tasks.",
      mandatory: true
    },
    {
      id: "reflectionImprovement",
      name: "Reflection & Continuous Improvement",
      weight: 10,
      maxPoints: 10,
      section: "Section E: Reflection by Faculty",
      description: "Self-assessment on assessment efficacy and specific future modifications.",
      mandatory: true
    },
    {
      id: "evidenceRelevance",
      name: "Evidence Relevance & Completeness",
      weight: 5,
      maxPoints: 5,
      section: "Section D: List of Evidence Attached",
      description: "Question papers, rubrics, sample evaluated scripts, or score sheets attached.",
      mandatory: true
    }
  ]
};
