import test from 'node:test';
import assert from 'node:assert/strict';
import { EvaluatorEngine } from '../src/services/evaluator.js';
import { RUBRIC_9B_CONFIG, RUBRIC_9C_CONFIG, mapToStandardPedagogies, mapToStandardAssessments } from '../src/services/rubrics.js';

test('Regression Suite: PED Scoring Engine Validation', async (t) => {

  await t.test('Test Case 1: Document contains only faculty name receives ZERO credit and Incomplete status', () => {
    const raw9b = {
      facultyName: "Dr. A. John",
      fileName: "Name_Only_Submission.docx"
    };

    const result = EvaluatorEngine.evaluateAnnexure9b(raw9b);

    assert.equal(result.qualityScore, 0, 'Quality score must be 0 for name-only submission');
    assert.equal(result.pedagogicalQuality, 0, 'Pedagogical quality must be 0');
    assert.equal(result.evidenceCompliance, 0, 'Evidence compliance must be 0');
    assert.ok(result.submissionCompleteness <= 10, 'Completeness must be near 0 (at most 8% for name header)');
    assert.equal(result.evaluationStatus, 'Incomplete — Not Evaluable');
    assert.equal(result.statusBand, 'Needs Improvement');

    // Verify all criteria received zero
    result.criteriaResults.forEach(c => {
      assert.equal(c.awardedPoints, 0, `Criterion ${c.criterionName} must have 0 points`);
      assert.equal(c.reviewStatus, 'Missing', `Criterion ${c.criterionName} must be marked Missing`);
    });

    assert.ok(result.deficiencies.length > 0, 'Must have deficiencies flagged');
  });

  await t.test('Test Case 2: Completely empty document is marked not evaluable with 0 score', () => {
    const emptyResult9b = EvaluatorEngine.evaluateAnnexure9b({});
    assert.equal(emptyResult9b.qualityScore, 0, 'Empty 9b quality score must be 0');
    assert.equal(emptyResult9b.submissionCompleteness, 0, 'Empty 9b completeness must be 0');
    assert.equal(emptyResult9b.evaluationStatus, 'Incomplete — Not Evaluable');

    const emptyResult9c = EvaluatorEngine.evaluateAnnexure9c({});
    assert.equal(emptyResult9c.qualityScore, 0, 'Empty 9c quality score must be 0');
    assert.equal(emptyResult9c.submissionCompleteness, 0, 'Empty 9c completeness must be 0');
    assert.equal(emptyResult9c.evaluationStatus, 'Incomplete — Not Evaluable');
  });

  await t.test('Test Case 3: All fields filled with generic statements yields low quality score and flags vague reflection', () => {
    const genericSubmission = {
      facultyName: "Dr. Generic Lecturer",
      department: "Mathematics",
      teachingMethod: "Conducted standard lecture and usual chalk and talk",
      planningPurpose: "Regular class conducted as per syllabus schedule",
      inClassDelivery: "Standard lecture delivered, read from textbook",
      coAlignment: "General topic covered in regular session",
      impact: "Students understood the topics well and all went well",
      lookingAhead: "Normal lecture planned for future classes",
      tools: "Chalk and blackboard",
      evidence: "None"
    };

    const result = EvaluatorEngine.evaluateAnnexure9b(genericSubmission);

    assert.ok(result.qualityScore < 45, `Generic score must be low (<45), got ${result.qualityScore}`);
    assert.equal(result.statusBand, 'Needs Improvement');
    assert.ok(result.improvements.some(imp => imp.toLowerCase().includes('active') || imp.toLowerCase().includes('rationale')), 'Must recommend specific pedagogical improvements');
    assert.ok(result.evaluationStatus === 'Provisional — Review Required', 'Generic submission must be marked Provisional');
  });

  await t.test('Test Case 4: Detailed reflection but no required evidence keeps quality assessable but evidence deficient', () => {
    const detailedNoEvidence = {
      facultyName: "Dr. S. Maria",
      department: "Computer Science",
      courseTitle: "Data Structures",
      teachingMethod: "Flipped Classroom with peer code review sprint",
      pedagogicalApproach: "Collaborative learning and inquiry-based problem solving",
      planningPurpose: "To enable students to actively debate tree traversal algorithms and achieve higher-order cognitive mastery",
      inClassDelivery: "Students worked in pairs of two for 40 minutes analyzing binary tree balancing algorithms while the instructor facilitated",
      coAlignment: "Directly mapped to CO2: Apply tree data structures to solve algorithmic problems",
      impact: "Diagnostic pre-quiz showed 42% accuracy, post-sprint lab tasks achieved 88% first-pass test case pass rate",
      lookingAhead: "Strong engagement in pair debugging; student pace varied on AVL rotations so additional scaffolding worksheets will be provided in next iteration",
      tools: "VS Code, Moodle LMS, GitHub Classroom",
      evidence: "None"
    };

    const result = EvaluatorEngine.evaluateAnnexure9b(detailedNoEvidence);

    // Quality should be high because reflection is detailed and student-centric
    assert.ok(result.pedagogicalQuality >= 70, `Pedagogical quality should be assessable and high, got ${result.pedagogicalQuality}`);
    // Evidence compliance MUST remain strictly 0
    assert.equal(result.evidenceCompliance, 0, 'Evidence compliance must remain 0 when evidence is missing');
    assert.equal(result.evidenceStatus, 'Missing', 'Evidence status must be Missing');
    assert.equal(result.evaluationStatus, 'Provisional — Review Required', 'Must require review due to missing evidence');
    assert.ok(result.deficiencies.some(d => d.toLowerCase().includes('evidence')), 'Must flag missing evidence in deficiencies');
  });

  await t.test('Test Case 5: Complete submission with relevant evidence evaluated fully according to rubric', () => {
    const completeSubmission = {
      facultyName: "Dr. A. Francis",
      department: "Physics",
      courseTitle: "Quantum Mechanics",
      teachingMethod: "Problem-Based Learning with PhET interactive simulations",
      pedagogicalApproach: "Inquiry-guided learning with active peer discussion",
      planningPurpose: "Designed to address student misconceptions in wave-particle duality and satisfy CO3 analysis requirements",
      inClassDelivery: "Students formed teams of 4, formulated testable hypotheses, and manipulated virtual interference slits with real-time data recording",
      coAlignment: "CO3: Evaluate quantum mechanical wave functions and boundary conditions",
      impact: "Formative rubric scores indicated 84% student mastery of probability density distributions compared to 55% in baseline lecture",
      lookingAhead: "Simulation allowed deep conceptual transfer. Next cycle will include pre-session micro-modules on matrix notation",
      tools: "PhET Simulation Software, Google Classroom",
      evidence: "https://lms.sjctni.edu/evidence/phys301/quantum_sim_log.pdf"
    };

    const result = EvaluatorEngine.evaluateAnnexure9b(completeSubmission);

    assert.ok(result.qualityScore >= 85, `Complete submission should score >= 85, got ${result.qualityScore}`);
    assert.equal(result.evidenceCompliance, 100, 'Evidence compliance should be 100%');
    assert.equal(result.evidenceStatus, 'Verified');
    assert.equal(result.evaluationStatus, 'Verified');
    assert.ok(result.standardizedPedagogies.includes('Problem-Based Learning') || result.standardizedPedagogies.includes('Experiential Learning'));
  });

  await t.test('Test Case 6: Corrupted or unreadable file results in Extraction Failure without fabricated score', () => {
    const corrupted9b = {
      fileName: "Corrupted_Upload.docx",
      isCorrupted: true,
      extractionFailed: true
    };

    const result = EvaluatorEngine.evaluateAnnexure9b(corrupted9b);

    assert.equal(result.qualityScore, 0, 'Quality score must be 0 for corrupted file');
    assert.equal(result.pedagogicalQuality, 0, 'Pedagogical quality must be 0');
    assert.equal(result.submissionCompleteness, 0, 'Completeness must be 0');
    assert.equal(result.evidenceStatus, 'Invalid or unreadable');
    assert.equal(result.evaluationStatus, 'Extraction Failed — Review Required');

    result.criteriaResults.forEach(c => {
      assert.equal(c.awardedPoints, 0);
      assert.equal(c.reviewStatus, 'Not Evaluated');
    });
  });

  await t.test('Test Case 7: Missing CO mapping receives ZERO for CO criterion and explicit recommendation', () => {
    const missingCoSubmission = {
      facultyName: "Dr. K. Joseph",
      department: "Chemistry",
      teachingMethod: "Demonstration of chromatography techniques",
      planningPurpose: "To illustrate separation science principles for laboratory trainees",
      inClassDelivery: "Conducted real-time TLC separation followed by student group measurements",
      coAlignment: "", // MISSING CO
      impact: "Students successfully calculated Rf values with 90% precision",
      lookingAhead: "Introduce digital scanning of TLC plates next year",
      tools: "Chromatography chamber, UV lamp",
      evidence: "https://drive.google.com/tlc_lab_report.pdf"
    };

    const result = EvaluatorEngine.evaluateAnnexure9b(missingCoSubmission);
    const coCriterion = result.criteriaResults.find(c => c.criterionId === 'coAlignment');

    assert.ok(coCriterion, 'CO alignment criterion must be present');
    assert.equal(coCriterion.awardedPoints, 0, 'CO alignment criterion must be 0 when missing');
    assert.equal(coCriterion.reviewStatus, 'Missing');
    assert.ok(coCriterion.recommendation.toLowerCase().includes('course outcomes') || coCriterion.recommendation.toLowerCase().includes('co'), 'Must give explicit CO recommendation');
    assert.ok(result.deficiencies.some(d => d.toLowerCase().includes('course outcome')), 'Deficiencies must flag missing CO');
  });

  await t.test('Test Case 8: Strong submission with one missing section awards credit for supported criteria and flags missing section', () => {
    const oneMissingSection = {
      facultyName: "Dr. B. Lawrence",
      department: "Commerce",
      courseTitle: "Financial Management",
      teachingMethod: "Case-Based Learning using HBR Corporate Restructuring case",
      pedagogicalApproach: "Collaborative case study analysis with structured board-room simulation",
      planningPurpose: "Develop critical analytical capability in debt-equity structuring under distress",
      inClassDelivery: "Students analyzed company balance sheets in teams of 5 and defended restructuring proposals before peer jury",
      coAlignment: "CO4: Formulate optimal capital structure decisions for distressed enterprises",
      impact: "Peer jury evaluated 8 teams with average rubric score of 4.2 out of 5",
      lookingAhead: "", // MISSING LOOKING AHEAD SECTION
      tools: "Excel financial models, Case study dossier",
      evidence: "https://lms.sjctni.edu/commerce/fin401_case_eval.pdf"
    };

    const result = EvaluatorEngine.evaluateAnnexure9b(oneMissingSection);

    // Supported criteria must earn points
    const methodCrit = result.criteriaResults.find(c => c.criterionId === 'methodApproach');
    const deliveryCrit = result.criteriaResults.find(c => c.criterionId === 'classroomDelivery');
    assert.ok(methodCrit.awardedPoints > 10, 'Supported method criterion must earn credit');
    assert.ok(deliveryCrit.awardedPoints > 10, 'Supported delivery criterion must earn credit');

    // Missing criteria must get 0
    const strengthsCrit = result.criteriaResults.find(c => c.criterionId === 'strengthsChallenges');
    const futureCrit = result.criteriaResults.find(c => c.criterionId === 'futureImprovement');
    assert.equal(strengthsCrit.awardedPoints, 0, 'Missing strengths section must get 0 points');
    assert.equal(futureCrit.awardedPoints, 0, 'Missing future improvement section must get 0 points');
    assert.equal(strengthsCrit.reviewStatus, 'Missing');

    // Missing section must be flagged, score cannot be inflated, status must be provisional
    assert.equal(result.evaluationStatus, 'Provisional — Review Required');
    assert.ok(result.deficiencies.length > 0, 'Must explicitly flag missing section in deficiencies');
  });

  await t.test('Annexure 9(c): Multi-component assessment evaluation and CO coverage', () => {
    const assessment9c = {
      facultyName: "Dr. R. Raman",
      department: "Statistics",
      courseTitle: "Biostatistics",
      courseOutcomes: [
        { code: "CO1", text: "Understand probability fundamentals" },
        { code: "CO2", text: "Apply hypothesis testing to clinical trials" },
        { code: "CO3", text: "Model survival analysis with Cox regression" }
      ],
      components: [
        { 
          name: "CIA I Written Test", 
          type: "Summative", 
          maxMarks: 50, 
          co: "CO1",
          announcedDate: "2025-08-10",
          preMaterials: "Question blueprint and study guide uploaded on Moodle LMS",
          completionDate: "2025-08-25",
          conductedBy: "Course Instructor",
          postMaterials: "Model answers and schema discussed with students",
          scored: "Scored (50 marks)"
        },
        { 
          name: "Clinical Data Analysis Project", 
          type: "Alternative/Project", 
          maxMarks: 30, 
          co: "CO2, CO3",
          announcedDate: "2025-09-01",
          preMaterials: "Detailed analytical rubric and trial dataset specifications provided",
          completionDate: "2025-09-30",
          conductedBy: "Course Instructor",
          postMaterials: "Individual code commentary and peer debriefing session",
          scored: "Scored (30 marks)"
        }
      ],
      whatWorked: "Real-world dataset stimulated high motivation and accurate statistical modeling.",
      whatCouldImprove: "Provide starter R scripts for students struggling with syntax in the first week.",
      evidence: "https://lms.sjctni.edu/stats/biostat_assessment_rubric.pdf"
    };

    const result = EvaluatorEngine.evaluateAnnexure9c(assessment9c);

    assert.ok(result.qualityScore >= 75, `Valid 9c submission should score >= 75, got ${result.qualityScore}`);
    assert.ok(result.standardizedAssessments.includes('Written Tests'));
    assert.ok(result.standardizedAssessments.includes('Projects'));
    assert.equal(result.evidenceCompliance, 100);
    assert.equal(result.evaluationStatus, 'Verified');
  });

  await t.test('Taxonomy Standardization: Maps variety of pedagogies and assessments', () => {
    const pResults = mapToStandardPedagogies("Conducted inverted classroom with hackathon sprint and Python Colab notebooks");
    assert.ok(pResults.includes("Flipped Classroom"));
    assert.ok(pResults.includes("Collaborative Learning"));
    assert.ok(pResults.includes("Technology-Enhanced Learning"));

    const aResults = mapToStandardAssessments("Term-end capstone viva and viva-voce presentation with prototype demo", "Alternative");
    assert.ok(aResults.includes("Projects"));
    assert.ok(aResults.includes("Viva Voce"));
    assert.ok(aResults.includes("Presentations"));
  });

  await t.test('REGRESSION TEST: An empty or name-only document CAN NEVER receive ~70% or any high score', () => {
    // Exact scenario reported by user: almost-empty sample containing only name previously awarded ~70%
    const userReportedScenario9b = EvaluatorEngine.evaluateAnnexure9b({
      facultyName: "Dr. Faculty Name Only",
      fileName: "Annexure_9b_sample.docx"
    });

    assert.equal(userReportedScenario9b.qualityScore, 0, 'Regressed: Name-only document quality score MUST be 0');
    assert.notEqual(userReportedScenario9b.qualityScore, 70, 'Regressed: Cannot score 70%');
    assert.ok(userReportedScenario9b.qualityScore < 10, 'Score must be less than 10%');
    assert.equal(userReportedScenario9b.evaluationStatus, 'Incomplete — Not Evaluable');

    const userReportedScenario9c = EvaluatorEngine.evaluateAnnexure9c({
      facultyName: "Dr. Faculty Name Only",
      fileName: "Annexure_9c_sample.docx"
    });

    assert.equal(userReportedScenario9c.qualityScore, 0, 'Regressed: Name-only 9c quality score MUST be 0');
    assert.ok(userReportedScenario9c.qualityScore < 10, 'Score must be less than 10%');
    assert.equal(userReportedScenario9c.evaluationStatus, 'Incomplete — Not Evaluable');
  });
});
