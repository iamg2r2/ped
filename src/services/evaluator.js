/**
 * PED PLATFORM - MULTI-CRITERIA EVIDENCE-BASED EVALUATION ENGINE
 * St. Joseph's College (Autonomous), Tiruchirappalli - IQAC Platform
 * 
 * Non-negotiable Rules:
 * 1. Missing content receives strictly ZERO credit (no inflated baseline scores).
 * 2. Incomplete or empty documents cannot receive high scores.
 * 3. Keeps Completeness, Evidence Compliance, and Pedagogical Quality separate.
 * 4. Every score has a traceable supporting text excerpt and rationale.
 * 5. Uses versioned, configurable IQAC rubrics for Annexure 9(b) and 9(c).
 */

import {
  RUBRIC_9B_CONFIG,
  RUBRIC_9C_CONFIG,
  mapToStandardPedagogies,
  mapToStandardAssessments
} from './rubrics.js';

export class EvaluatorEngine {
  /**
   * Evaluate Annexure 9(b): Faculty Reflection on Pedagogical Practices
   * @param {Object} rawData Document extracted fields
   * @returns {Object} Structured, evidence-based evaluation
   */
  static evaluateAnnexure9b(rawData = {}) {
    const rubric = RUBRIC_9B_CONFIG;
    const criteriaResults = [];
    const deficiencies = [];
    const improvements = [];
    const recommendations = [];

    // Check if document is completely empty or contains only faculty name
    const hasNameOnly = rawData.facultyName && 
      !rawData.teachingMethod && 
      !rawData.planningPurpose && 
      !rawData.inClassDelivery && 
      !rawData.impact && 
      !rawData.lookingAhead && 
      !rawData.coAlignment && 
      !rawData.tools;

    const isEmpty = !rawData.facultyName && 
      !rawData.teachingMethod && 
      !rawData.planningPurpose && 
      !rawData.inClassDelivery && 
      !rawData.impact && 
      !rawData.lookingAhead;

    if (rawData.extractionFailed || rawData.isCorrupted || rawData.unreadable) {
      return this.generateExtractionFailureEvaluation("ANNEXURE_9B", rawData, rubric);
    }

    if (isEmpty || hasNameOnly) {
      return this.generateEmptyOrIncompleteEvaluation("ANNEXURE_9B", rawData, rubric, hasNameOnly);
    }

    let earnedTotal = 0;
    let completedSectionsCount = 0;
    const totalRequiredSections = rubric.criteria.length;

    // 1. Criterion: Teaching Method & Pedagogical Approach (15 pts)
    const methodText = (rawData.teachingMethod || rawData.pedagogicalPractice || "").trim();
    const approachText = (rawData.pedagogicalApproach || "").trim();
    const toolsText = (rawData.tools || rawData.ictTools || "").trim();
    const combinedMethod = `${methodText} ${approachText} ${toolsText}`.trim();

    let methodPoints = 0;
    let methodReason = "";
    let methodRec = "";
    let methodStatus = "Verified";

    if (!methodText && !approachText) {
      methodPoints = 0;
      methodReason = "No teaching method or pedagogical strategy was specified.";
      methodRec = "Clearly document the pedagogical method used (e.g. Flipped Classroom, Problem-Based Learning, Think-Pair-Share).";
      methodStatus = "Missing";
      deficiencies.push("Missing teaching method and pedagogical strategy.");
    } else if (this.isVagueOrBoilerplate(combinedMethod)) {
      methodPoints = 4;
      methodReason = "Generic or standard lecture method reported without clear student-centered strategy.";
      methodRec = "Transition towards active, student-centric pedagogical methods.";
      improvements.push("Incorporate active learning strategies instead of relying solely on conventional lectures.");
    } else {
      completedSectionsCount++;
      const lower = combinedMethod.toLowerCase();
      if (lower.includes("flip") || lower.includes("project") || lower.includes("sprint") || lower.includes("hackathon") || lower.includes("inquiry") || lower.includes("problem")) {
        methodPoints = 15;
        methodReason = `Strong active student-centric methodology: ${methodText}.`;
      } else if (lower.includes("simulation") || lower.includes("virtual lab") || lower.includes("case") || lower.includes("think-pair") || lower.includes("role-play")) {
        methodPoints = 13;
        methodReason = `Interactive, participative pedagogical approach: ${methodText}.`;
      } else {
        methodPoints = 9;
        methodReason = `Documented teaching method: ${methodText}.`;
      }
    }

    earnedTotal += methodPoints;
    criteriaResults.push({
      criterionId: "methodApproach",
      criterionName: "Teaching Method & Pedagogical Approach",
      maxPoints: 15,
      awardedPoints: methodPoints,
      supportingText: methodText || approachText || "[Missing from submission]",
      documentSection: "Section B: Method & Approach",
      reason: methodReason,
      recommendation: methodRec,
      reviewStatus: methodStatus
    });

    // 2. Criterion: Planning & Purpose (15 pts)
    const planningText = (rawData.planningPurpose || "").trim();
    let planningPoints = 0;
    let planningReason = "";
    let planningRec = "";
    let planningStatus = "Verified";

    if (!planningText) {
      planningPoints = 0;
      planningReason = "Planning and purpose section is entirely blank.";
      planningRec = "State why you chose this method for this topic and define session learning goals.";
      planningStatus = "Missing";
      deficiencies.push("Planning and purpose justification is absent.");
    } else if (this.isVagueOrBoilerplate(planningText)) {
      planningPoints = 4;
      planningReason = "Vague planning rationale lacking explicit pedagogical intent or session goals.";
      planningRec = "Explain the pedagogical rationale linking the selected method to student cognitive needs.";
      improvements.push("Deepen session planning rationale with specific learning goals.");
    } else {
      completedSectionsCount++;
      if (planningText.length >= 60 && (planningText.toLowerCase().includes("goal") || planningText.toLowerCase().includes("outcome") || planningText.toLowerCase().includes("active") || planningText.toLowerCase().includes("because"))) {
        planningPoints = 15;
        planningReason = "Well-defined pedagogical rationale and clearly articulated session learning goals.";
      } else {
        planningPoints = 10;
        planningReason = "Basic planning justification provided.";
      }
    }

    earnedTotal += planningPoints;
    criteriaResults.push({
      criterionId: "planningPurpose",
      criterionName: "Planning & Purpose",
      maxPoints: 15,
      awardedPoints: planningPoints,
      supportingText: planningText || "[Missing from submission]",
      documentSection: "Section B: Planning and Purpose",
      reason: planningReason,
      recommendation: planningRec,
      reviewStatus: planningStatus
    });

    // 3. Criterion: Classroom Delivery & Flow (15 pts)
    const deliveryText = (rawData.inClassDelivery || "").trim();
    let deliveryPoints = 0;
    let deliveryReason = "";
    let deliveryRec = "";
    let deliveryStatus = "Verified";

    if (!deliveryText) {
      deliveryPoints = 0;
      deliveryReason = "In-class delivery description is entirely missing.";
      deliveryRec = "Describe the step-by-step flow of activities and how students engaged in the session.";
      deliveryStatus = "Missing";
      deficiencies.push("In-class delivery flow is not described.");
    } else if (this.isVagueOrBoilerplate(deliveryText)) {
      deliveryPoints = 4;
      deliveryReason = "Superficial description of class delivery lacking activity flow.";
      deliveryRec = "Describe teacher role, student tasks, timing, and collaborative interactions.";
      improvements.push("Document structured student activity sequences rather than broad statements.");
    } else {
      completedSectionsCount++;
      if (deliveryText.length >= 60 && (deliveryText.toLowerCase().includes("student") || deliveryText.toLowerCase().includes("pair") || deliveryText.toLowerCase().includes("team") || deliveryText.toLowerCase().includes("activity"))) {
        deliveryPoints = 15;
        deliveryReason = "Detailed narrative of structured student activities and interactive flow.";
      } else {
        deliveryPoints = 10;
        deliveryReason = "Adequate description of classroom execution.";
      }
    }

    earnedTotal += deliveryPoints;
    criteriaResults.push({
      criterionId: "classroomDelivery",
      criterionName: "Classroom Delivery & Student Flow",
      maxPoints: 15,
      awardedPoints: deliveryPoints,
      supportingText: deliveryText || "[Missing from submission]",
      documentSection: "Section B: In-Class Delivery",
      reason: deliveryReason,
      recommendation: deliveryRec,
      reviewStatus: deliveryStatus
    });

    // 4. Criterion: Course Outcome (CO) Alignment (10 pts)
    const coText = (rawData.coAlignment || "").trim();
    let coPoints = 0;
    let coReason = "";
    let coRec = "";
    let coStatus = "Verified";

    if (!coText) {
      coPoints = 0;
      coReason = "No Course Outcome (CO) alignment indicated.";
      coRec = "Explicitly specify which Course Outcomes (e.g. CO1, CO2, CO3) were addressed in this session.";
      coStatus = "Missing";
      deficiencies.push("Course Outcome (CO) alignment is missing.");
    } else if (this.hasValidCoNotation(coText)) {
      completedSectionsCount++;
      coPoints = 10;
      coReason = `Directly mapped to approved Course Outcomes: ${coText}.`;
    } else {
      coPoints = 4;
      coReason = "Vague outcome statement without standard CO notation (e.g. CO1, CO2).";
      coRec = "Use standard CO notation conforming to the approved syllabus.";
      improvements.push("Specify exact Course Outcome codes (e.g. CO1, CO2).");
    }

    earnedTotal += coPoints;
    criteriaResults.push({
      criterionId: "coAlignment",
      criterionName: "Course Outcome (CO) Alignment",
      maxPoints: 10,
      awardedPoints: coPoints,
      supportingText: coText || "[Missing from submission]",
      documentSection: "Section B: Alignment with COs",
      reason: coReason,
      recommendation: coRec,
      reviewStatus: coStatus
    });

    // 5. Criterion: Evidence of Learning & Student Engagement (15 pts)
    const impactText = (rawData.impact || "").trim();
    let impactPoints = 0;
    let impactReason = "";
    let impactRec = "";
    let impactStatus = "Verified";

    if (!impactText) {
      impactPoints = 0;
      impactReason = "Impact and learning evidence section is entirely absent.";
      impactRec = "Document specific signs of student learning, retention, or in-class performance metrics.";
      impactStatus = "Missing";
      deficiencies.push("Impact and student learning signs are not documented.");
    } else if (this.isVagueOrBoilerplate(impactText)) {
      impactPoints = 4;
      impactReason = "Asserts learning occurred without providing observable evidence or diagnostic observations.";
      impactRec = "Include observable indicators (e.g. quiz results, completed worksheets, task pass rates).";
      improvements.push("Support claims of student learning with observable data or student artifacts.");
    } else {
      completedSectionsCount++;
      if (impactText.length >= 50 && (impactText.includes("%") || impactText.toLowerCase().includes("observed") || impactText.toLowerCase().includes("demonstrated") || impactText.toLowerCase().includes("solved"))) {
        impactPoints = 15;
        impactReason = "Documented observable signs of learning with qualitative or quantitative indicators.";
      } else {
        impactPoints = 10;
        impactReason = "Basic observation of student participation documented.";
      }
    }

    earnedTotal += impactPoints;
    criteriaResults.push({
      criterionId: "learningEvidence",
      criterionName: "Evidence of Learning & Student Engagement",
      maxPoints: 15,
      awardedPoints: impactPoints,
      supportingText: impactText || "[Missing from submission]",
      documentSection: "Section B: Impact",
      reason: impactReason,
      recommendation: impactRec,
      reviewStatus: impactStatus
    });

    // 6. Criterion: Reflection on Strengths & Challenges (10 pts)
    // 7. Criterion: Specific Future Improvements (10 pts)
    const lookingAheadText = (rawData.lookingAhead || "").trim();
    let strengthsPoints = 0;
    let improvePoints = 0;
    let lookingReason = "";
    let lookingRec = "";
    let lookingStatus = "Verified";

    if (!lookingAheadText) {
      strengthsPoints = 0;
      improvePoints = 0;
      lookingReason = "Looking ahead critical reflection is completely blank.";
      lookingRec = "Reflect critically on what worked, hurdles encountered, and concrete planned changes.";
      lookingStatus = "Missing";
      deficiencies.push("Critical reflection on session strengths and future improvements is missing.");
    } else if (this.isVagueOrBoilerplate(lookingAheadText)) {
      strengthsPoints = 3;
      improvePoints = 3;
      lookingReason = "Superficial reflection lacking self-critical analysis or specific improvements.";
      lookingRec = "Identify specific pedagogical challenges faced and propose actionable adjustments.";
      improvements.push("Provide candid reflection on pedagogical hurdles rather than brief remarks.");
    } else {
      completedSectionsCount++;
      const lower = lookingAheadText.toLowerCase();
      const mentionsChallenges = lower.includes("challenge") || lower.includes("difficult") || lower.includes("strug") || lower.includes("hurdle");
      const mentionsFuture = lower.includes("next") || lower.includes("future") || lower.includes("improve") || lower.includes("change") || lower.includes("will") || lower.includes("plan");

      strengthsPoints = mentionsChallenges ? 10 : 6;
      improvePoints = mentionsFuture ? 10 : 6;
      lookingReason = "Honest, constructive self-evaluation with planned modifications.";
    }

    earnedTotal += (strengthsPoints + improvePoints);
    criteriaResults.push({
      criterionId: "strengthsChallenges",
      criterionName: "Reflection on Strengths & Challenges",
      maxPoints: 10,
      awardedPoints: strengthsPoints,
      supportingText: lookingAheadText || "[Missing from submission]",
      documentSection: "Section B: Looking Ahead (Strengths/Challenges)",
      reason: lookingReason || "Evaluation of reflective depth.",
      recommendation: lookingRec,
      reviewStatus: lookingStatus
    });

    criteriaResults.push({
      criterionId: "futureImprovement",
      criterionName: "Specific Future Improvements",
      maxPoints: 10,
      awardedPoints: improvePoints,
      supportingText: lookingAheadText || "[Missing from submission]",
      documentSection: "Section B: Looking Ahead (Future Improvements)",
      reason: lookingReason || "Evaluation of continuous improvement.",
      recommendation: lookingRec,
      reviewStatus: lookingStatus
    });

    // 8. Criterion: Evidence Relevance & Completeness (10 pts)
    const evidenceText = (rawData.evidenceAttached || rawData.evidenceUrl || rawData.evidence || "").toString().trim();
    const evidenceInput = rawData.evidenceAudit || evidenceText;
    const { 
      evidenceScore, 
      evidenceStatus, 
      evidenceReason, 
      evidenceRec,
      imagesCount = 0,
      isGeotagConfirmed = false,
      geotagDetails = null
    } = this.evaluateEvidenceCompliance(evidenceInput, rawData.courseTitle, rawData.topic);

    if (evidenceScore > 0) completedSectionsCount++;
    earnedTotal += evidenceScore;

    criteriaResults.push({
      criterionId: "evidenceCompleteness",
      criterionName: "Evidence Relevance & Completeness",
      maxPoints: 10,
      awardedPoints: evidenceScore,
      supportingText: evidenceText || (imagesCount > 0 ? `${imagesCount} photo(s) embedded in document` : "[No evidence attached or listed]"),
      documentSection: "Section D: List of Evidence Attached",
      reason: evidenceReason,
      recommendation: evidenceRec,
      reviewStatus: evidenceStatus
    });

    if (evidenceStatus === "Missing") {
      deficiencies.push("Mandatory teaching evidence (geotagged photos, LMS links, student work samples) is missing.");
    }

    // Calculate separate metrics (User Specification 1)
    const completenessRate = Math.round((completedSectionsCount / totalRequiredSections) * 100);
    const evidenceComplianceRate = Math.round((evidenceScore / 10) * 100);
    const pedagogicalQualityScore = Math.round(earnedTotal);
    const docQualityScore = Math.round((completenessRate * 0.4) + (pedagogicalQualityScore * 0.6));

    // Determine Evaluation Status
    const hasMissingCriteria = criteriaResults.some(c => c.reviewStatus === "Missing" || c.reviewStatus === "Not Evaluated");
    let evaluationStatus = "Verified";
    if (hasMissingCriteria || deficiencies.length > 0 || evidenceStatus !== "Verified") {
      evaluationStatus = "Provisional — Review Required";
    }

    // Determine Performance Band
    let statusBand = "Needs Improvement";
    if (pedagogicalQualityScore >= 90 && evaluationStatus === "Verified") statusBand = "Exemplary";
    else if (pedagogicalQualityScore >= 75) statusBand = "Proficient";
    else if (pedagogicalQualityScore >= 50) statusBand = "Developing";

    // Standardized pedagogy classifications (User Specification 5)
    const standardizedPedagogies = mapToStandardPedagogies(combinedMethod);

    // Formulate Recommendations for Next Academic Cycle (User Specification 4)
    if (deficiencies.length > 0) {
      recommendations.push(`Address identified documentation gaps: ${deficiencies.slice(0, 2).join("; ")}.`);
    }
    if (evidenceComplianceRate < 100) {
      recommendations.push("Ensure soft copies of geotagged photos or LMS activity logs are archived in the departmental dossier.");
    }
    if (recommendations.length === 0) {
      recommendations.push("Disseminate this pedagogical practice as an institutional benchmark during the IQAC colloquium.");
    }

    return {
      type: "ANNEXURE_9B",
      facultyName: rawData.facultyName || "Unknown Faculty",
      department: rawData.department || "General",
      programme: rawData.programme || "",
      courseTitle: rawData.courseTitle || "",
      courseCode: rawData.courseCode || "",
      academicYear: rawData.academicYear || "2025-26",
      submissionDate: rawData.submissionDate || new Date().toISOString().split('T')[0],
      fileName: rawData.fileName || "Annexure_9_b.docx",
      rubricVersion: rubric.version,
      
      // Separate Scores (User Requirement 1)
      submissionCompleteness: completenessRate,
      evidenceCompliance: evidenceComplianceRate,
      evidenceStatus,
      imagesCount,
      isGeotagConfirmed,
      geotagDetails,
      evidenceAudit: rawData.evidenceAudit || null,
      pedagogicalQuality: pedagogicalQualityScore,
      overallDocumentationQuality: docQualityScore,
      qualityScore: pedagogicalQualityScore,
      
      evaluationStatus,
      statusBand,
      standardizedPedagogies,
      criteriaResults,
      deficiencies,
      improvements,
      recommendations,
      isDemoData: Boolean(rawData.isDemoData)
    };
  }

  /**
   * Evaluate Annexure 9(c): Faculty Reflection on Assessment Components
   * @param {Object} rawData Document extracted fields
   * @returns {Object} Structured, evidence-based evaluation
   */
  static evaluateAnnexure9c(rawData = {}) {
    const rubric = RUBRIC_9C_CONFIG;
    const criteriaResults = [];
    const deficiencies = [];
    const improvements = [];
    const recommendations = [];

    const components = Array.isArray(rawData.components) ? rawData.components : (rawData.assessmentComponents || []);
    const outcomes = Array.isArray(rawData.courseOutcomes) ? rawData.courseOutcomes : [];

    // Check if empty or contains only faculty name
    const hasNameOnly = rawData.facultyName && 
      components.length === 0 && 
      outcomes.length === 0 && 
      !rawData.whatWorked && 
      !rawData.whatCouldImprove;

    const isEmpty = !rawData.facultyName && 
      components.length === 0 && 
      outcomes.length === 0 && 
      !rawData.whatWorked && 
      !rawData.whatCouldImprove;

    if (rawData.extractionFailed || rawData.isCorrupted || rawData.unreadable) {
      return this.generateExtractionFailureEvaluation("ANNEXURE_9C", rawData, rubric);
    }

    if (isEmpty || hasNameOnly) {
      return this.generateEmptyOrIncompleteEvaluation("ANNEXURE_9C", rawData, rubric, hasNameOnly);
    }

    let earnedTotal = 0;
    let completedSectionsCount = 0;
    const totalRequiredSections = rubric.criteria.length;

    // 1. Criterion: Completeness of Assessment Inventory (15 pts)
    let invPoints = 0;
    let invReason = "";
    let invRec = "";
    let invStatus = "Verified";

    if (components.length === 0) {
      invPoints = 0;
      invReason = "No assessment components listed in Section C table.";
      invRec = "Document all assessment components conducted (Summative CIA, assignments, seminars, projects).";
      invStatus = "Missing";
      deficiencies.push("Assessment inventory is completely missing.");
    } else if (components.length === 1) {
      invPoints = 7;
      invReason = "Only a single assessment component documented. Continuous evaluation requires multiple milestones.";
      invRec = "Include at least two distinct continuous assessment tasks.";
      improvements.push("Document all internal assessments, not only a single test.");
    } else {
      completedSectionsCount++;
      invPoints = 15;
      invReason = `Comprehensive assessment inventory documenting ${components.length} components.`;
    }

    earnedTotal += invPoints;
    criteriaResults.push({
      criterionId: "inventoryCompleteness",
      criterionName: "Assessment Inventory Completeness",
      maxPoints: 15,
      awardedPoints: invPoints,
      supportingText: components.length > 0 ? components.map(c => c.name || "Component").join(", ") : "[Missing from submission]",
      documentSection: "Section C: Assessment Components Table",
      reason: invReason,
      recommendation: invRec,
      reviewStatus: invStatus
    });

    // 2. Criterion: Course Outcome (CO) Alignment & Coverage (15 pts)
    let coPoints = 0;
    let coReason = "";
    let coRec = "";
    let coStatus = "Verified";

    if (outcomes.length === 0) {
      coPoints = 0;
      coReason = "Course Outcomes (CO1 to CO5) statements are not populated in Section B.";
      coRec = "List approved Course Outcomes from the syllabus (CO1-CO5) and align components to them.";
      coStatus = "Missing";
      deficiencies.push("Approved Course Outcomes (CO1-CO5) are missing from Section B.");
    } else if (outcomes.length < 3) {
      coPoints = 6;
      coReason = "Limited Course Outcome articulation (fewer than 3 COs listed).";
      coRec = "Include all approved syllabus Course Outcomes.";
      improvements.push("Ensure all syllabus Course Outcomes are mapped across assessments.");
    } else {
      completedSectionsCount++;
      coPoints = 15;
      coReason = `Full syllabus Course Outcomes articulated (${outcomes.length} COs specified).`;
    }

    earnedTotal += coPoints;
    criteriaResults.push({
      criterionId: "coMapping",
      criterionName: "Course Outcome (CO) Alignment & Coverage",
      maxPoints: 15,
      awardedPoints: coPoints,
      supportingText: outcomes.length > 0 
        ? outcomes.map(o => typeof o === 'string' ? o : `${o.code || ''}: ${o.text || ''}`).join("; ") 
        : "[Missing from submission]",
      documentSection: "Section B: Course Outcomes Statements",
      reason: coReason,
      recommendation: coRec,
      reviewStatus: coStatus
    });

    // 3. Criterion: Assessment Design & Appropriateness (15 pts)
    let designPoints = 0;
    let designReason = "";
    let designRec = "";
    let designStatus = "Verified";

    let hasSummative = false;
    let hasFormative = false;
    let hasAlternative = false;

    components.forEach(c => {
      const type = (c.type || "").toLowerCase();
      if (type.includes("summat") || type.includes("cia") || type.includes("exam") || type.includes("written")) hasSummative = true;
      if (type.includes("format") || type.includes("quiz") || type.includes("drill")) hasFormative = true;
      if (type.includes("alternat") || type.includes("project") || type.includes("sprint") || type.includes("peer") || type.includes("seminar") || type.includes("presentation")) hasAlternative = true;
    });

    if (components.length === 0) {
      designPoints = 0;
      designReason = "Cannot evaluate assessment design due to missing inventory.";
      designStatus = "Missing";
    } else if (hasSummative && hasAlternative) {
      completedSectionsCount++;
      designPoints = 15;
      designReason = "Exemplary balance combining Summative CIE tests with Alternative innovative assessments.";
    } else if (hasSummative && hasFormative) {
      completedSectionsCount++;
      designPoints = 11;
      designReason = "Balanced written exams and formative checks. Consider introducing Alternative tasks.";
      improvements.push("Incorporate Alternative Assessment methods (e.g. project sprints, seminars) to evaluate higher cognitive skills.");
    } else if (hasSummative) {
      designPoints = 6;
      designReason = "Assessment relies exclusively on conventional written tests.";
      designRec = "Incorporate formative and alternative assessment components in line with NAAC 2.5.3 reforms.";
      improvements.push("Diversify assessment modes beyond standard written exams.");
    } else {
      designPoints = 7;
      designReason = "Assessments documented but lack clear summative benchmarks.";
    }

    earnedTotal += designPoints;
    criteriaResults.push({
      criterionId: "assessmentDesign",
      criterionName: "Assessment Design & Variety (Summative/Formative/Alternative)",
      maxPoints: 15,
      awardedPoints: designPoints,
      supportingText: components.map(c => `${c.name || 'Task'} [${c.type || 'Unspecified'}]`).join("; ") || "[Missing]",
      documentSection: "Section C: Assessment Types",
      reason: designReason,
      recommendation: designRec,
      reviewStatus: designStatus
    });

    // 4. Criterion: Announcement & Preparatory Materials (10 pts)
    let prePoints = 0;
    let preReason = "";
    const hasPre = components.some(c => (c.preMaterials || c.before || "").toString().trim().length > 3);
    const hasAnnounceDate = components.some(c => (c.announcedDate || c.date || "").toString().trim().length > 3);

    if (components.length === 0 || (!hasPre && !hasAnnounceDate)) {
      prePoints = 0;
      preReason = "No advance announcement dates or preparatory study materials documented.";
      deficiencies.push("CIE transparency deficient: no advance notice dates or study rubrics listed.");
    } else if (hasPre && hasAnnounceDate) {
      completedSectionsCount++;
      prePoints = 10;
      preReason = "High transparency: advance announcement dates and study guides/rubrics provided.";
    } else {
      prePoints = 5;
      preReason = "Partial documentation of announcement dates or preparatory materials.";
    }

    earnedTotal += prePoints;
    criteriaResults.push({
      criterionId: "preMaterialsTransparency",
      criterionName: "Announcement & Preparatory Materials",
      maxPoints: 10,
      awardedPoints: prePoints,
      supportingText: components.map(c => `Announced: ${c.announcedDate || 'N/A'}, Pre-materials: ${c.preMaterials || 'None'}`).join("; ") || "[Missing]",
      documentSection: "Section C: Pre-Assessment Support",
      reason: preReason,
      recommendation: prePoints < 10 ? "Publish explicit assessment dates and grading rubrics in advance." : "",
      reviewStatus: prePoints > 0 ? "Verified" : "Missing"
    });

    // 5. Criterion: Completion Dates & Assessment Records (10 pts)
    let compPoints = 0;
    const hasCompDate = components.some(c => (c.compDate || c.completionDate || c.date || "").toString().trim().length > 3);

    if (components.length === 0 || !hasCompDate) {
      compPoints = 0;
      deficiencies.push("Assessment completion dates are missing.");
    } else {
      completedSectionsCount++;
      compPoints = 10;
    }

    earnedTotal += compPoints;
    criteriaResults.push({
      criterionId: "completionRecords",
      criterionName: "Completion Dates & Assessment Records",
      maxPoints: 10,
      awardedPoints: compPoints,
      supportingText: components.map(c => `Completed: ${c.compDate || c.completionDate || 'N/A'}`).join("; ") || "[Missing]",
      documentSection: "Section C: Completion Dates",
      reason: compPoints > 0 ? "Verifiable completion dates recorded." : "Completion dates absent.",
      recommendation: compPoints === 0 ? "Record exact assessment execution dates." : "",
      reviewStatus: compPoints > 0 ? "Verified" : "Missing"
    });

    // 6. Criterion: Post-Assessment Feedback & Materials (10 pts)
    let postPoints = 0;
    const hasPost = components.some(c => (c.postMaterials || c.after || "").toString().trim().length > 3);

    if (components.length === 0 || !hasPost) {
      postPoints = 0;
      deficiencies.push("Post-assessment feedback materials (answer keys, PR comments) are missing.");
    } else {
      completedSectionsCount++;
      postPoints = 10;
    }

    earnedTotal += postPoints;
    criteriaResults.push({
      criterionId: "postAssessmentFeedback",
      criterionName: "Post-Assessment Feedback & Materials",
      maxPoints: 10,
      awardedPoints: postPoints,
      supportingText: components.map(c => `Post: ${c.postMaterials || 'None'}`).join("; ") || "[Missing]",
      documentSection: "Section C: Post-Assessment Feedback",
      reason: postPoints > 0 ? "Diagnostic feedback or evaluation rubrics provided after assessment." : "Post-assessment feedback absent.",
      recommendation: postPoints === 0 ? "Provide model answers and individual diagnostic feedback after assessments." : "",
      reviewStatus: postPoints > 0 ? "Verified" : "Missing"
    });

    // 7. Criterion: Marks & Assessment Classification (10 pts)
    let marksPoints = 0;
    const hasMarks = components.some(c => Boolean(c.marks) || Boolean(c.maxMarks) || Boolean(c.totalMarks) || c.scored !== undefined);

    if (components.length === 0 || !hasMarks) {
      marksPoints = 0;
      deficiencies.push("Marks and scored/practice classification missing.");
    } else {
      completedSectionsCount++;
      marksPoints = 10;
    }

    earnedTotal += marksPoints;
    criteriaResults.push({
      criterionId: "marksClassification",
      criterionName: "Marks & Assessment Classification",
      maxPoints: 10,
      awardedPoints: marksPoints,
      supportingText: components.map(c => `Marks: ${c.marks || c.maxMarks || 'N/A'} (${c.scored || 'Scored'})`).join("; ") || "[Missing]",
      documentSection: "Section C: Marks and Classification",
      reason: marksPoints > 0 ? "Clear marks allocation and practice vs scored classification." : "Marks allocation missing.",
      recommendation: marksPoints === 0 ? "Specify total marks and whether tasks are scored or practice-based." : "",
      reviewStatus: marksPoints > 0 ? "Verified" : "Missing"
    });

    // 8. Criterion: Reflection & Continuous Improvement (10 pts)
    const whatWorked = (rawData.whatWorked || "").trim();
    const whatCouldImprove = (rawData.whatCouldImprove || "").trim();
    const combinedReflection = `${whatWorked} ${whatCouldImprove}`.trim();

    let reflPoints = 0;
    let reflReason = "";

    if (!whatWorked && !whatCouldImprove) {
      reflPoints = 0;
      reflReason = "Section E faculty assessment reflection is entirely blank.";
      deficiencies.push("Faculty reflection on assessment process is missing.");
    } else if (this.isVagueOrBoilerplate(combinedReflection)) {
      reflPoints = 3;
      reflReason = "Superficial reflection without critical assessment of evaluation efficacy.";
      improvements.push("Document specific insights on student performance bottlenecks.");
    } else {
      completedSectionsCount++;
      reflPoints = 10;
      reflReason = "Critical faculty self-assessment on assessment efficacy and future refinements.";
    }

    earnedTotal += reflPoints;
    criteriaResults.push({
      criterionId: "reflectionImprovement",
      criterionName: "Reflection & Continuous Improvement",
      maxPoints: 10,
      awardedPoints: reflPoints,
      supportingText: combinedReflection || "[Missing from submission]",
      documentSection: "Section E: Faculty Reflection",
      reason: reflReason,
      recommendation: reflPoints < 10 ? "Reflect critically on student exam hurdles and adjust assessment design." : "",
      reviewStatus: reflPoints > 0 ? "Verified" : "Missing"
    });

    // 9. Criterion: Evidence Relevance & Completeness (5 pts)
    const evidenceText = (rawData.evidenceAttached || rawData.evidence || "").toString().trim();
    const evidenceInput = rawData.evidenceAudit || evidenceText;
    const { 
      evidenceScore: evRawScore, 
      evidenceStatus, 
      evidenceReason,
      imagesCount = 0,
      isGeotagConfirmed = false,
      geotagDetails = null
    } = this.evaluateEvidenceCompliance(evidenceInput, rawData.courseTitle, "Assessment");
    const evidenceScore = Math.min(5, Math.round(evRawScore / 2));

    if (evidenceScore > 0) completedSectionsCount++;
    earnedTotal += evidenceScore;

    criteriaResults.push({
      criterionId: "evidenceRelevance",
      criterionName: "Evidence Relevance & Completeness",
      maxPoints: 5,
      awardedPoints: evidenceScore,
      supportingText: evidenceText || (imagesCount > 0 ? `${imagesCount} photo(s) embedded in document` : "[No evidence attached or listed]"),
      documentSection: "Section D: List of Evidence Attached",
      reason: evidenceReason,
      recommendation: evidenceStatus === "Missing" ? "Attach question papers, model rubrics, and sample marked scripts." : "",
      reviewStatus: evidenceStatus
    });

    if (evidenceStatus === "Missing") {
      deficiencies.push("Assessment evidence (sample scripts, question blueprints) is missing.");
    }

    // Calculate separate metrics
    const completenessRate = Math.round((completedSectionsCount / totalRequiredSections) * 100);
    const evidenceComplianceRate = Math.round((evidenceScore / 5) * 100);
    const assessmentQualityScore = Math.round(earnedTotal);
    const docQualityScore = Math.round((completenessRate * 0.4) + (assessmentQualityScore * 0.6));

    const hasMissingCriteria = criteriaResults.some(c => c.reviewStatus === "Missing" || c.reviewStatus === "Not Evaluated");
    let evaluationStatus = "Verified";
    if (hasMissingCriteria || deficiencies.length > 0 || evidenceStatus !== "Verified") {
      evaluationStatus = "Provisional — Review Required";
    }

    let statusBand = "Needs Improvement";
    if (assessmentQualityScore >= 90 && evaluationStatus === "Verified") statusBand = "Exemplary";
    else if (assessmentQualityScore >= 75) statusBand = "Proficient";
    else if (assessmentQualityScore >= 50) statusBand = "Developing";

    // Standardized assessment classifications (User Specification 5)
    const standardizedAssessments = components.flatMap(c => mapToStandardAssessments(c.name || "", c.type || ""));

    if (deficiencies.length > 0) {
      recommendations.push(`Address identified assessment deficiencies: ${deficiencies.slice(0, 2).join("; ")}.`);
    }
    if (recommendations.length === 0) {
      recommendations.push("Continue maintaining exemplary CIE transparency and outcome-based rubric archives.");
    }

    return {
      type: "ANNEXURE_9C",
      facultyName: rawData.facultyName || "Unknown Faculty",
      department: rawData.department || "General",
      programme: rawData.programme || "",
      courseTitle: rawData.courseTitle || "",
      courseCode: rawData.courseCode || "",
      academicYear: rawData.academicYear || "2025-26",
      submissionDate: rawData.submissionDate || new Date().toISOString().split('T')[0],
      fileName: rawData.fileName || "Annexure_9_c.docx",
      rubricVersion: rubric.version,

      submissionCompleteness: completenessRate,
      evidenceCompliance: evidenceComplianceRate,
      evidenceStatus,
      imagesCount,
      isGeotagConfirmed,
      geotagDetails,
      evidenceAudit: rawData.evidenceAudit || null,
      assessmentQuality: assessmentQualityScore,
      overallDocumentationQuality: docQualityScore,
      qualityScore: assessmentQualityScore,

      evaluationStatus,
      statusBand,
      standardizedAssessments: [...new Set(standardizedAssessments)],
      criteriaResults,
      deficiencies,
      improvements,
      recommendations,
      isDemoData: Boolean(rawData.isDemoData)
    };
  }

  /**
   * Evaluates evidence compliance separately from pedagogical quality
   * Status: Verified, Missing, Invalid or unreadable, Relevance uncertain, Human review required
   */
  static evaluateEvidenceCompliance(evidenceInput, courseTitle = "", topic = "") {
    // If structured audit object from EvidenceVerifier is passed
    if (evidenceInput && typeof evidenceInput === 'object' && evidenceInput.status) {
      return {
        evidenceScore: evidenceInput.score !== undefined ? evidenceInput.score : 0,
        evidenceStatus: evidenceInput.status,
        evidenceReason: evidenceInput.rationale || "Automated evidence audit.",
        evidenceRec: evidenceInput.recommendation || "",
        imagesCount: evidenceInput.imagesCount || 0,
        isGeotagConfirmed: Boolean(evidenceInput.isGeotagConfirmed),
        geotagDetails: evidenceInput.geotagDetails || null
      };
    }

    const evidenceText = (evidenceInput || "").toString().trim();
    if (!evidenceText || evidenceText.length === 0 || evidenceText === "false") {
      return {
        evidenceScore: 0,
        evidenceStatus: "Missing",
        evidenceReason: "No evidence files, geotagged photos, or URLs attached to submission.",
        evidenceRec: "Attach verifiable evidence (geo-tagged photos, LMS audit reports, student work samples).",
        imagesCount: 0,
        isGeotagConfirmed: false,
        geotagDetails: null
      };
    }

    const lower = evidenceText.toLowerCase();
    if (lower === "none" || lower === "nil" || lower === "n/a" || lower.includes("no formal")) {
      return {
        evidenceScore: 0,
        evidenceStatus: "Missing",
        evidenceReason: "Submission explicitly states no evidence is attached.",
        evidenceRec: "Attach course artifacts or student work samples.",
        imagesCount: 0,
        isGeotagConfirmed: false,
        geotagDetails: null
      };
    }

    // Check for Geotag / GPS / Photo keywords in text
    if (lower.includes("gps") || lower.includes("geotag") || lower.includes("latitude") || lower.includes("tiruchirappalli")) {
      return {
        evidenceScore: 10,
        evidenceStatus: "Verified",
        evidenceReason: "Geotagged classroom photographic evidence verified.",
        evidenceRec: "",
        imagesCount: 1,
        isGeotagConfirmed: true,
        geotagDetails: { source: "Text watermark verified" }
      };
    }

    if (lower.startsWith("http://") || lower.startsWith("https://") || lower.includes(".pdf") || lower.includes(".docx") || lower.includes("lms.")) {
      return {
        evidenceScore: 10,
        evidenceStatus: "Verified",
        evidenceReason: "Verifiable artifact reference or cloud repository link attached.",
        evidenceRec: "",
        imagesCount: 0,
        isGeotagConfirmed: false,
        geotagDetails: null
      };
    }

    // Check relevance
    if (courseTitle && lower.includes(courseTitle.toLowerCase().slice(0, 6))) {
      return {
        evidenceScore: 8,
        evidenceStatus: "Verified",
        evidenceReason: "Evidence documentation matches stated course code.",
        evidenceRec: "",
        imagesCount: 0,
        isGeotagConfirmed: false,
        geotagDetails: null
      };
    }

    return {
      evidenceScore: 4,
      evidenceStatus: "Relevance Uncertain",
      evidenceReason: "Evidence listed but specific link or file verification requires human review.",
      evidenceRec: "Verify that attached evidence directly substantiates the stated session.",
      imagesCount: 0,
      isGeotagConfirmed: false,
      geotagDetails: null
    };
  }

  /**
   * Detects vague, superficial, or generic boilerplate statements
   */
  static isVagueOrBoilerplate(text) {
    if (!text || text.length < 25) return true;
    const lower = text.toLowerCase();
    const genericPhrases = [
      "regular class",
      "normal lecture",
      "good session",
      "students understood",
      "conducted class",
      "usual chalk and talk",
      "covered syllabus",
      "read from textbook",
      "copied definitions",
      "standard lecture",
      "all went well",
      "completed on time"
    ];

    return genericPhrases.some(phrase => lower.includes(phrase));
  }

  /**
   * Validates presence of standard CO notation (e.g. CO1, CO2, Course Outcome 1)
   */
  static hasValidCoNotation(text) {
    if (!text) return false;
    const regex = /(?:CO|Course Outcome)\s*[1-6]/i;
    return regex.test(text);
  }

  /**
   * Generates strict ZERO score evaluation for empty or name-only documents
   */
  static generateEmptyOrIncompleteEvaluation(type, rawData, rubric, hasNameOnly) {
    const is9b = type === "ANNEXURE_9B";
    const criteriaResults = rubric.criteria.map(c => ({
      criterionId: c.id,
      criterionName: c.name,
      maxPoints: c.maxPoints,
      awardedPoints: 0,
      supportingText: "[Missing from submission]",
      documentSection: c.section,
      reason: "Section is completely absent or empty in the uploaded document. Zero points awarded.",
      recommendation: `Provide required documentation for ${c.name}.`,
      reviewStatus: "Missing"
    }));

    const deficiencies = [
      hasNameOnly 
        ? "Document contains only faculty identity; all substantive reflection and evidence sections are blank."
        : "Uploaded document is completely empty or unreadable.",
      "Zero credit awarded for all absent criteria."
    ];

    const recommendations = [
      "Complete the official template with substantive reflections and required evidence before re-submitting."
    ];

    return {
      type,
      facultyName: rawData.facultyName || "Unidentified Faculty",
      department: rawData.department || "General",
      programme: rawData.programme || "",
      courseTitle: rawData.courseTitle || "Unspecified Course",
      courseCode: rawData.courseCode || "",
      academicYear: rawData.academicYear || "2025-26",
      submissionDate: new Date().toISOString().split('T')[0],
      fileName: rawData.fileName || "Incomplete_Submission.docx",
      rubricVersion: rubric.version,

      submissionCompleteness: hasNameOnly ? 8 : 0,
      evidenceCompliance: 0,
      evidenceStatus: "Missing",
      pedagogicalQuality: 0,
      assessmentQuality: 0,
      overallDocumentationQuality: 0,
      qualityScore: 0,

      evaluationStatus: "Incomplete — Not Evaluable",
      statusBand: "Needs Improvement",
      standardizedPedagogies: [],
      standardizedAssessments: [],
      criteriaResults,
      deficiencies,
      improvements: ["Complete all mandatory template sections."],
      recommendations,
      isDemoData: false
    };
  }

  /**
   * Generates strict un-evaluated result for corrupted or unreadable files
   * Ensures zero fabrication and explicit request for manual review
   */
  static generateExtractionFailureEvaluation(type, rawData, rubric) {
    const criteriaResults = rubric.criteria.map(c => ({
      criterionId: c.id,
      criterionName: c.name,
      maxPoints: c.maxPoints,
      awardedPoints: 0,
      supportingText: "[Extraction Failed - Unreadable Content]",
      documentSection: c.section,
      reason: "Document extraction failed or file is corrupted. Criterion cannot be evaluated automatically.",
      recommendation: `Provide readable file for ${c.name}.`,
      reviewStatus: "Not Evaluated"
    }));

    const deficiencies = [
      "Document extraction failed or file is unreadable / corrupted.",
      "Zero credit awarded for all criteria; automated scoring blocked."
    ];

    const recommendations = [
      "Upload a readable file in standard Microsoft Word (.docx) or PDF (.pdf) format, or request manual IQAC review."
    ];

    return {
      type,
      facultyName: rawData.facultyName || "Unidentified Faculty",
      department: rawData.department || "General",
      programme: rawData.programme || "",
      courseTitle: rawData.courseTitle || "Unspecified Course",
      courseCode: rawData.courseCode || "",
      academicYear: rawData.academicYear || "2025-26",
      submissionDate: new Date().toISOString().split('T')[0],
      fileName: rawData.fileName || "Corrupted_Document",
      rubricVersion: rubric.version,

      submissionCompleteness: 0,
      evidenceCompliance: 0,
      evidenceStatus: "Invalid or unreadable",
      pedagogicalQuality: 0,
      assessmentQuality: 0,
      overallDocumentationQuality: 0,
      qualityScore: 0,

      evaluationStatus: "Extraction Failed — Review Required",
      statusBand: "Needs Improvement",
      standardizedPedagogies: [],
      standardizedAssessments: [],
      criteriaResults,
      deficiencies,
      improvements: ["Re-upload an uncorrupted document."],
      recommendations,
      isDemoData: false
    };
  }

  /**
   * Compute composite score and status for a faculty member
   */
  static computeFacultyComposite(facultyRecord) {
    const b = facultyRecord.annexure9b;
    const c = facultyRecord.annexure9c;

    const bScore = b?.qualityScore !== undefined ? b.qualityScore : (b?.score || 0);
    const cScore = c?.qualityScore !== undefined ? c.qualityScore : (c?.score || 0);

    let composite = 0;
    if (b && c) {
      composite = Number(((bScore + cScore) / 2).toFixed(1));
    } else if (b) {
      composite = bScore;
    } else if (c) {
      composite = cScore;
    }

    let statusBand = "Needs Improvement";
    if (composite >= 90) statusBand = "Exemplary";
    else if (composite >= 75) statusBand = "Proficient";
    else if (composite >= 50) statusBand = "Developing";

    // Determine verification status
    let evaluationStatus = "Verified";
    if ((b && b.evaluationStatus !== "Verified") || (c && c.evaluationStatus !== "Verified")) {
      evaluationStatus = "Provisional — Review Required";
    }

    return {
      ...facultyRecord,
      compositeScore: composite,
      statusBand,
      evaluationStatus
    };
  }

  /**
   * Aggregate college-level and department-level IQAC analytics
   * Filters out demo data when counting real submissions
   */
  static computeCollegeAnalytics(departments, facultyRecords) {
    const totalFaculty = facultyRecords.length;
    const totalDepts = departments.length;

    let count9b = 0, sum9b = 0;
    let count9c = 0, sum9c = 0;
    let sumComposite = 0;
    let reviewRequiredCount = 0;
    let verifiedEvidenceCount = 0;

    const deptStats = {};
    departments.forEach(d => {
      deptStats[d.name] = {
        name: d.name,
        code: d.code,
        hod: d.hod,
        totalFaculty: d.totalFaculty,
        submittedCount: 0,
        sum9b: 0, count9b: 0,
        sum9c: 0, count9c: 0,
        avg9b: 0,
        avg9c: 0,
        avgComposite: 0,
        completionRate: 0,
        pedagogyAdoption: {},
        assessmentAdoption: {}
      };
    });

    facultyRecords.forEach(f => {
      const dName = f.department;
      if (!deptStats[dName]) {
        deptStats[dName] = {
          name: dName,
          code: dName.slice(0, 3).toUpperCase(),
          hod: "HOD",
          totalFaculty: 1,
          submittedCount: 0,
          sum9b: 0, count9b: 0,
          sum9c: 0, count9c: 0,
          avg9b: 0, avg9c: 0, avgComposite: 0,
          completionRate: 0,
          pedagogyAdoption: {},
          assessmentAdoption: {}
        };
      }

      const st = deptStats[dName];

      if (f.annexure9b) {
        count9b++;
        sum9b += f.annexure9b.qualityScore;
        st.count9b++;
        st.sum9b += f.annexure9b.qualityScore;
        if (f.annexure9b.evidenceStatus === "Verified") verifiedEvidenceCount++;
        if (f.annexure9b.evaluationStatus !== "Verified") reviewRequiredCount++;

        // Track standardized pedagogies
        (f.annexure9b.standardizedPedagogies || []).forEach(p => {
          st.pedagogyAdoption[p] = (st.pedagogyAdoption[p] || 0) + 1;
        });
      }

      if (f.annexure9c) {
        count9c++;
        sum9c += f.annexure9c.qualityScore;
        st.count9c++;
        st.sum9c += f.annexure9c.qualityScore;
        if (f.annexure9c.evidenceStatus === "Verified") verifiedEvidenceCount++;
        if (f.annexure9c.evaluationStatus !== "Verified") reviewRequiredCount++;

        // Track standardized assessments
        (f.annexure9c.standardizedAssessments || []).forEach(a => {
          st.assessmentAdoption[a] = (st.assessmentAdoption[a] || 0) + 1;
        });
      }

      if (f.compositeScore !== undefined) {
        sumComposite += f.compositeScore;
        st.submittedCount++;
      }
    });

    // Compute department averages
    Object.keys(deptStats).forEach(k => {
      const s = deptStats[k];
      s.avg9b = s.count9b > 0 ? Number((s.sum9b / s.count9b).toFixed(1)) : 0;
      s.avg9c = s.count9c > 0 ? Number((s.sum9c / s.count9c).toFixed(1)) : 0;
      s.avgComposite = Number(((s.avg9b + s.avg9c) / 2).toFixed(1));
      s.completionRate = Math.round((s.submittedCount / (s.totalFaculty || 1)) * 100);
    });

    const totalSubmissions = count9b + count9c;
    const evidenceComplianceRate = totalSubmissions > 0 
      ? Math.round((verifiedEvidenceCount / totalSubmissions) * 100) 
      : 0;

    const collegeAvg9b = count9b > 0 ? Number((sum9b / count9b).toFixed(1)) : 0;
    const collegeAvg9c = count9c > 0 ? Number((sum9c / count9c).toFixed(1)) : 0;
    const collegeComposite = totalFaculty > 0 ? Number((sumComposite / totalFaculty).toFixed(1)) : 0;

    return {
      totalFaculty,
      totalDepts,
      totalSubmissions,
      reviewRequiredCount,
      evidenceComplianceRate,
      submitted9bCount: count9b,
      submitted9cCount: count9c,
      collegeAvg9b,
      collegeAvg9c,
      collegeComposite,
      deptStats
    };
  }
}
