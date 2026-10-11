/**
 * PED PLATFORM - MULTI-CRITERIA EVALUATION ENGINE
 * Tailored for St. Joseph's College (Autonomous), Tiruchirappalli IQAC.
 * Systematically evaluates:
 * - Annexure 9(b): Faculty Reflection on Pedagogical Practices
 * - Annexure 9(c): Faculty Reflection on Assessment Components
 */

export class EvaluatorEngine {
  /**
   * Evaluate Annexure 9(b): Pedagogical Practice
   * @param {Object} rawData 
   * @returns {Object} Evaluated 9(b) record
   */
  static evaluateAnnexure9b(rawData) {
    const method = (rawData.teachingMethod || rawData.pedagogicalPractice || "").toLowerCase();
    const approach = (rawData.pedagogicalApproach || "").toLowerCase();
    const planning = (rawData.planningPurpose || "").toLowerCase();
    const delivery = (rawData.inClassDelivery || "").toLowerCase();
    const impact = (rawData.impact || "").toLowerCase();
    const lookingAhead = (rawData.lookingAhead || "").toLowerCase();
    const tools = (rawData.tools || rawData.ictTools || "").toLowerCase();

    // 1. Method Innovation & Student-Centricity (Max 25)
    let scoreMethod = 10;
    if (method.includes("project") || method.includes("flipped") || method.includes("hackathon") || method.includes("sprint")) {
      scoreMethod = 24;
    } else if (method.includes("simulation") || method.includes("virtual lab") || method.includes("problem") || method.includes("think-pair")) {
      scoreMethod = 22;
    } else if (method.includes("case") || method.includes("role-play") || method.includes("inquiry")) {
      scoreMethod = 20;
    } else if (method.includes("traditional") || method.includes("blackboard") || method.includes("chalk")) {
      scoreMethod = 8;
    }
    if (approach.includes("collaborative") || approach.includes("experiential") || approach.includes("active")) {
      scoreMethod = Math.min(25, scoreMethod + 1);
    }

    // 2. Planning & Purpose Rigor (Max 20)
    let scorePlanning = 12;
    if (planning.length > 50 && (planning.includes("outcome") || planning.includes("engage") || planning.includes("active") || planning.includes("problem"))) {
      scorePlanning = 19;
    } else if (planning.includes("dictate") || planning.includes("memorize") || planning.length < 30) {
      scorePlanning = 9;
    }

    // 3. In-Class Delivery & Flow (Max 20)
    let scoreDelivery = 12;
    if (delivery.length > 50 && (delivery.includes("student") || delivery.includes("team") || delivery.includes("pair") || delivery.includes("hands-on") || delivery.includes("squad"))) {
      scoreDelivery = 19;
    } else if (delivery.includes("copied") || delivery.includes("quiet") || delivery.length < 30) {
      scoreDelivery = 8;
    }

    // 4. Impact & Student Learning Evidence (Max 20)
    let scoreImpact = 12;
    if (impact.length > 40 && (impact.includes("%") || impact.includes("retention") || impact.includes("optimal") || impact.includes("demonstrated") || impact.includes("achieved"))) {
      scoreImpact = 19;
    } else if (impact.includes("recall") || impact.length < 30) {
      scoreImpact = 8;
    }

    // 5. Critical Reflection & Looking Ahead (Max 15)
    let scoreReflection = 8;
    if (lookingAhead.length > 40 && (lookingAhead.includes("improve") || lookingAhead.includes("future") || lookingAhead.includes("challenge") || lookingAhead.includes("introduce") || lookingAhead.includes("scaffold"))) {
      scoreReflection = 14;
    } else if (lookingAhead.includes("if time permits") || lookingAhead.length < 20) {
      scoreReflection = 6;
    }

    // Tools bonus
    if (tools.includes("moodle") || tools.includes("github") || tools.includes("colab") || tools.includes("virtual lab") || tools.includes("simulation")) {
      scoreMethod = Math.min(25, scoreMethod + 1);
    }

    const totalScore = Math.round(scoreMethod + scorePlanning + scoreDelivery + scoreImpact + scoreReflection);

    // Band
    let band = "Developing";
    if (totalScore >= 90) band = "Exemplary";
    else if (totalScore >= 75) band = "Proficient";
    else if (totalScore >= 60) band = "Developing";
    else band = "Needs Improvement";

    // Strengths & Recommendations
    const strengths = [];
    const recommendations = [];

    if (scoreMethod >= 22) {
      strengths.push(`High student-centric engagement demonstrated through ${rawData.teachingMethod || "innovative pedagogy"}.`);
    }
    if (scorePlanning >= 17) {
      strengths.push("Clear outcome-based articulation in planning and session purpose.");
    }
    if (scoreImpact >= 17) {
      strengths.push("Documented empirical signs of student learning and conceptual retention.");
    }
    if (tools.length > 3 && !tools.includes("chalk")) {
      strengths.push(`Effective deployment of digital tools (${rawData.tools || tools}).`);
    }
    if (strengths.length === 0) {
      strengths.push("Basic syllabus coverage accomplished.");
    }

    if (scoreMethod < 16) {
      recommendations.push("Shift away from lecture-only delivery: incorporate Think-Pair-Share, Flipped Classroom, or PjBL sprints.");
    }
    if (scoreImpact < 14) {
      recommendations.push("Establish clear diagnostic checks to verify student learning during class delivery.");
    }
    if (scoreReflection < 10) {
      recommendations.push("Formulate specific corrective interventions for future iterations of this unit.");
    }
    if (recommendations.length === 0) {
      recommendations.push("Document this session as an institutional best practice for IQAC dissemination.");
    }

    return {
      submitted: true,
      submissionDate: rawData.submissionDate || new Date().toISOString().split('T')[0],
      fileName: rawData.fileName || "Annexure_9_b_Submission.docx",
      unit: rawData.unit || "Unit I",
      topic: rawData.topic || "Core Curriculum Topic",
      teachingMethod: rawData.teachingMethod || rawData.pedagogicalPractice || "Active Learning",
      pedagogicalApproach: rawData.pedagogicalApproach || "Experiential Learning",
      tools: rawData.tools || rawData.ictTools || "LMS & Digital Media",
      coAlignment: rawData.coAlignment || "CO1, CO2",
      planningPurpose: rawData.planningPurpose || "Session planning.",
      inClassDelivery: rawData.inClassDelivery || "In-class delivery.",
      impact: rawData.impact || "Student learning observed.",
      lookingAhead: rawData.lookingAhead || "Continuous improvement reflection.",
      score: totalScore,
      band,
      criteria: {
        methodInnovation: { score: scoreMethod, max: 25, label: "Pedagogical Innovation" },
        planningPurpose: { score: scorePlanning, max: 20, label: "Planning & Purpose" },
        inClassDelivery: { score: scoreDelivery, max: 20, label: "In-Class Student Flow" },
        impact: { score: scoreImpact, max: 20, label: "Learning Impact & Signs" },
        reflection: { score: scoreReflection, max: 15, label: "Looking Ahead Reflection" }
      },
      strengths,
      recommendations
    };
  }

  /**
   * Evaluate Annexure 9(c): Assessment Components
   * @param {Object} rawData 
   * @returns {Object} Evaluated 9(c) record
   */
  static evaluateAnnexure9c(rawData) {
    const components = rawData.components || rawData.assessmentComponents || [];
    const whatWorked = (rawData.whatWorked || "").toLowerCase();
    const whatCouldImprove = (rawData.whatCouldImprove || "").toLowerCase();

    // 1. Assessment Variety & Balance (Max 25)
    let hasSummative = false, hasFormative = false, hasAlternative = false;
    components.forEach(c => {
      const type = (c.type || "").toLowerCase();
      if (type.includes("summat")) hasSummative = true;
      if (type.includes("format")) hasFormative = true;
      if (type.includes("alternat") || type.includes("project") || type.includes("sprint") || type.includes("review")) hasAlternative = true;
    });

    let scoreVariety = 10;
    if (hasSummative && hasFormative && hasAlternative) scoreVariety = 24;
    else if ((hasSummative && hasAlternative) || (hasFormative && hasAlternative)) scoreVariety = 20;
    else if (hasSummative && hasFormative) scoreVariety = 18;
    else if (hasSummative) scoreVariety = 12;

    // 2. Course Outcome Coverage (Max 25)
    const outcomes = rawData.courseOutcomes || [];
    let scoreCo = 12;
    if (outcomes.length >= 4) scoreCo = 23;
    else if (outcomes.length >= 2) scoreCo = 18;

    // 3. Transparency & Advance Announcements (Max 20)
    let scoreTransparency = 12;
    const hasPreMaterials = components.some(c => (c.preMaterials || "").length > 5 || (c.before || "").length > 5);
    const hasDates = components.some(c => c.announcedDate || c.date);
    if (hasPreMaterials && hasDates) scoreTransparency = 19;
    else if (hasPreMaterials || hasDates) scoreTransparency = 15;

    // 4. Formative Post-Assessment Feedback (Max 15)
    let scoreFeedback = 8;
    const hasPostMaterials = components.some(c => (c.postMaterials || "").length > 5 || (c.after || "").length > 5);
    if (hasPostMaterials) scoreFeedback = 14;

    // 5. Faculty Reflection on Improvement (Max 15)
    let scoreReflection = 8;
    if (whatWorked.length > 30 && whatCouldImprove.length > 30 && !whatCouldImprove.includes("copied")) {
      scoreReflection = 14;
    }

    const totalScore = Math.round(scoreVariety + scoreCo + scoreTransparency + scoreFeedback + scoreReflection);

    // Band
    let band = "Developing";
    if (totalScore >= 90) band = "Exemplary";
    else if (totalScore >= 75) band = "Proficient";
    else if (totalScore >= 60) band = "Developing";
    else band = "Needs Improvement";

    const strengths = [];
    const recommendations = [];

    if (hasAlternative) {
      strengths.push("Exemplary deployment of Alternative Assessment components fostering practical competency.");
    }
    if (hasSummative && hasFormative) {
      strengths.push("Healthy balance between high-stakes summative exams and low-stakes formative check-ins.");
    }
    if (scoreTransparency >= 17) {
      strengths.push("High transparency in CIE: advance announcement dates and study rubrics provided.");
    }
    if (strengths.length === 0) {
      strengths.push("Basic compliance with internal assessment schedule.");
    }

    if (!hasAlternative) {
      recommendations.push("Introduce Alternative Assessment methods (e.g. open-ended problem solving, peer code reviews, case studies) to evaluate higher cognitive skills.");
    }
    if (!hasPostMaterials) {
      recommendations.push("Provide explicit post-assessment diagnostic review sessions and published rubrics to students.");
    }
    if (recommendations.length === 0) {
      recommendations.push("Continue publishing exemplary CIE rubrics for departmental standardization.");
    }

    return {
      submitted: true,
      submissionDate: rawData.submissionDate || new Date().toISOString().split('T')[0],
      fileName: rawData.fileName || "Annexure_9_c_Submission.docx",
      courseOutcomes: outcomes.length > 0 ? outcomes : [
        "CO1: Understand foundational principles.",
        "CO2: Apply methods to solve domain problems.",
        "CO3: Analyze and evaluate system solutions."
      ],
      components: components.length > 0 ? components : [
        { name: "Continuous Internal Assessment (CIA 1)", type: "Summative", co: "CO1, CO2", scored: true, marks: 25 },
        { name: "Alternative Evaluation Task", type: "Alternative", co: "CO2, CO3", scored: true, marks: 20 }
      ],
      whatWorked: rawData.whatWorked || "Assessment executed per schedule.",
      whatCouldImprove: rawData.whatCouldImprove || "Stagger deadlines in future iterations.",
      score: totalScore,
      band,
      criteria: {
        varietyBalance: { score: scoreVariety, max: 25, label: "Assessment Component Variety" },
        coCoverage: { score: scoreCo, max: 25, label: "Course Outcome (CO) Coverage" },
        transparency: { score: scoreTransparency, max: 20, label: "Advance Notice & Pre-Materials" },
        feedback: { score: scoreFeedback, max: 15, label: "Post-Assessment Feedback" },
        reflection: { score: scoreReflection, max: 15, label: "Faculty Reflection & Improvement" }
      },
      strengths,
      recommendations
    };
  }

  /**
   * Compute composite score and status for a faculty member
   */
  static computeFacultyComposite(facultyRecord) {
    let score9b = facultyRecord.annexure9b?.score || 0;
    let score9c = facultyRecord.annexure9c?.score || 0;

    let composite = 0;
    if (facultyRecord.annexure9b?.submitted && facultyRecord.annexure9c?.submitted) {
      composite = Number(((score9b + score9c) / 2).toFixed(1));
    } else if (facultyRecord.annexure9b?.submitted) {
      composite = score9b;
    } else if (facultyRecord.annexure9c?.submitted) {
      composite = score9c;
    }

    let statusBand = "Pending";
    if (composite >= 90) statusBand = "Exemplary";
    else if (composite >= 75) statusBand = "Proficient";
    else if (composite >= 60) statusBand = "Developing";
    else if (composite > 0) statusBand = "Needs Improvement";

    return {
      ...facultyRecord,
      compositeScore: composite,
      statusBand
    };
  }

  /**
   * Aggregate college-level and department-level IQAC analytics
   */
  static computeCollegeAnalytics(departments, facultyRecords) {
    const totalFaculty = facultyRecords.length;
    const totalDepts = departments.length;

    let sum9b = 0, count9b = 0;
    let sum9c = 0, count9c = 0;
    let sumComposite = 0, countComposite = 0;

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
        topMethod: "Active Learning"
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
          topMethod: "Active Learning"
        };
      }

      const st = deptStats[dName];

      if (f.annexure9b?.submitted) {
        sum9b += f.annexure9b.score;
        count9b++;
        st.sum9b += f.annexure9b.score;
        st.count9b++;
      }

      if (f.annexure9c?.submitted) {
        sum9c += f.annexure9c.score;
        count9c++;
        st.sum9c += f.annexure9c.score;
        st.count9c++;
      }

      if (f.compositeScore > 0) {
        sumComposite += f.compositeScore;
        countComposite++;
        st.submittedCount++;
      }
    });

    // Compute Department Averages
    Object.keys(deptStats).forEach(k => {
      const s = deptStats[k];
      s.avg9b = s.count9b > 0 ? Number((s.sum9b / s.count9b).toFixed(1)) : 0;
      s.avg9c = s.count9c > 0 ? Number((s.sum9c / s.count9c).toFixed(1)) : 0;
      s.avgComposite = Number(((s.avg9b + s.avg9c) / 2).toFixed(1));
      s.completionRate = Math.round((s.submittedCount / (s.totalFaculty || 1)) * 100);
    });

    const collegeAvg9b = count9b > 0 ? Number((sum9b / count9b).toFixed(1)) : 0;
    const collegeAvg9c = count9c > 0 ? Number((sum9c / count9c).toFixed(1)) : 0;
    const collegeComposite = countComposite > 0 ? Number((sumComposite / countComposite).toFixed(1)) : 0;

    return {
      totalFaculty,
      totalDepts,
      submitted9bCount: count9b,
      submitted9cCount: count9c,
      collegeAvg9b,
      collegeAvg9c,
      collegeComposite,
      deptStats
    };
  }
}
