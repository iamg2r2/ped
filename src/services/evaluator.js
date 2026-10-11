/**
 * PED PLATFORM - MULTI-CRITERIA EVALUATION ENGINE
 * Automatically evaluates faculty pedagogical and assessment practice reports,
 * scoring them across 5 accreditation-aligned dimensions and generating
 * qualitative feedback, Bloom's cognitive taxonomy profiles, and IQAC indicators.
 */

export class EvaluatorEngine {
  /**
   * Evaluate a single faculty submission
   * @param {Object} sub Submission object
   * @returns {Object} Evaluation report card
   */
  static evaluateSubmission(sub) {
    // 1. Pedagogical Innovation (Max 25)
    let scorePedagogy = 10;
    const practice = (sub.pedagogicalPractice || "").toLowerCase();
    const desc = (sub.practiceDescription || "").toLowerCase();

    if (practice.includes("project") || practice.includes("flipped") || practice.includes("hackathon") || practice.includes("peer")) {
      scorePedagogy = 24;
    } else if (practice.includes("problem") || practice.includes("simulation") || practice.includes("virtual lab") || practice.includes("think-pair")) {
      scorePedagogy = 21;
    } else if (practice.includes("case study") || practice.includes("gamified")) {
      scorePedagogy = 19;
    } else if (practice.includes("traditional") || practice.includes("lecture")) {
      scorePedagogy = 8;
    }

    if (desc.includes("collaborative") || desc.includes("hands-on") || desc.includes("active")) {
      scorePedagogy = Math.min(25, scorePedagogy + 1);
    }

    // 2. Bloom's Taxonomy Cognitive Demand (Max 25)
    let scoreBlooms = 10;
    const levels = Array.isArray(sub.bloomsLevels) ? sub.bloomsLevels : (typeof sub.bloomsLevels === 'string' ? sub.bloomsLevels.split(',').map(s => s.trim()) : []);
    const normalizedLevels = levels.map(l => l.toLowerCase());
    
    const hasCreate = normalizedLevels.some(l => l.includes("create"));
    const hasEvaluate = normalizedLevels.some(l => l.includes("eval"));
    const hasAnalyze = normalizedLevels.some(l => l.includes("analy"));
    const hasApply = normalizedLevels.some(l => l.includes("apply"));
    const hasUnderstand = normalizedLevels.some(l => l.includes("understand"));
    const hasRemember = normalizedLevels.some(l => l.includes("remember"));

    let hotsCount = (hasCreate ? 1 : 0) + (hasEvaluate ? 1 : 0) + (hasAnalyze ? 1 : 0);
    let lotsCount = (hasRemember ? 1 : 0) + (hasUnderstand ? 1 : 0);

    if (hasCreate && hasEvaluate) {
      scoreBlooms = 25;
    } else if (hotsCount >= 2) {
      scoreBlooms = 22;
    } else if (hasAnalyze || hasApply) {
      scoreBlooms = 18;
    } else if (lotsCount > 0 && hotsCount === 0) {
      scoreBlooms = 9;
    }

    // 3. Outcome-Based Education (OBE) & Rubric Quality (Max 20)
    let scoreObe = 8;
    if (sub.rubricAttached === true || String(sub.rubricAttached).toLowerCase() === 'true') {
      scoreObe += 7;
    }
    const assessMethod = (sub.assessmentMethod || "").toLowerCase();
    if (assessMethod.includes("rubric") || assessMethod.includes("open-ended") || assessMethod.includes("prototype") || assessMethod.includes("coding")) {
      scoreObe += 5;
    } else if (assessMethod.includes("quiz") || assessMethod.includes("formative")) {
      scoreObe += 3;
    }
    scoreObe = Math.min(20, scoreObe);

    // 4. ICT & Digital Tools Integration (Max 15)
    let scoreIct = 5;
    const ict = (sub.ictTools || "").toLowerCase();
    if (ict.includes("colab") || ict.includes("github") || ict.includes("aws") || ict.includes("ansys") || ict.includes("matlab") || ict.includes("docker") || ict.includes("wokwi")) {
      scoreIct = 15;
    } else if (ict.includes("moodle") || ict.includes("canvas") || ict.includes("mentimeter") || ict.includes("virtual lab")) {
      scoreIct = 12;
    } else if (ict.includes("powerpoint") || ict.includes("slide") || ict === "") {
      scoreIct = 5;
    } else {
      scoreIct = 9;
    }

    // 5. Student Impact & Remedial Loop (Max 15)
    let scoreFeedback = 6;
    const feedbackVal = parseFloat(sub.studentFeedbackScore) || 3.5;
    // Scaled 1-5 to 1-8 points
    const feedbackPoints = Math.min(8, Math.max(2, ((feedbackVal - 1) / 4) * 8));
    
    let remedialPoints = 2;
    const remedial = (sub.remedialAction || "").toLowerCase();
    if (remedial.length > 20 && !remedial.includes("no formal")) {
      remedialPoints = 7;
    }
    scoreFeedback = Math.round(feedbackPoints + remedialPoints);
    scoreFeedback = Math.min(15, scoreFeedback);

    // Total Score
    const totalScore = Math.round(scorePedagogy + scoreBlooms + scoreObe + scoreIct + scoreFeedback);

    // Grade Band Determination
    let band = "Developing";
    let bandClass = "badge-warning";
    if (totalScore >= 90) {
      band = "Exemplary";
      bandClass = "badge-success";
    } else if (totalScore >= 75) {
      band = "Proficient";
      bandClass = "badge-indigo";
    } else if (totalScore >= 60) {
      band = "Developing";
      bandClass = "badge-warning";
    } else {
      band = "Needs Improvement";
      bandClass = "badge-danger";
    }

    // Cognitive Percentages for Charts
    const cognitiveBreakdown = this.calculateCognitiveWeights(normalizedLevels, practice, desc);

    // Strengths & Growth Areas
    const { strengths, recommendations } = this.generateQualitativeFeedback({
      totalScore,
      scorePedagogy,
      scoreBlooms,
      scoreObe,
      scoreIct,
      scoreFeedback,
      sub
    });

    return {
      ...sub,
      evaluated: true,
      totalScore,
      band,
      bandClass,
      criteria: {
        pedagogyInnovation: { score: scorePedagogy, max: 25, label: "Pedagogical Innovation" },
        bloomsAlignment: { score: scoreBlooms, max: 25, label: "Bloom's Higher-Order Demand" },
        obeRubrics: { score: scoreObe, max: 20, label: "Outcome-Based Rubrics Rigor" },
        ictIntegration: { score: scoreIct, max: 15, label: "ICT & Simulation Integration" },
        remedialImpact: { score: scoreFeedback, max: 15, label: "Student Feedback & Remedial Loop" }
      },
      cognitiveBreakdown,
      strengths,
      recommendations
    };
  }

  /**
   * Calculate cognitive weight breakdown across 6 Bloom's levels
   */
  static calculateCognitiveWeights(levels, practice, desc) {
    let rem = 10, und = 15, app = 25, ana = 25, eva = 15, cre = 10;

    if (levels.some(l => l.includes("remember")) && levels.length <= 2) {
      rem = 45; und = 35; app = 15; ana = 5; eva = 0; cre = 0;
    } else if (levels.some(l => l.includes("create")) && levels.some(l => l.includes("eval"))) {
      rem = 5; und = 10; app = 20; ana = 25; eva = 20; cre = 20;
    } else if (levels.some(l => l.includes("apply")) && levels.some(l => l.includes("analy"))) {
      rem = 10; und = 15; app = 35; ana = 30; eva = 5; cre = 5;
    }

    return {
      Remember: rem,
      Understand: und,
      Apply: app,
      Analyze: ana,
      Evaluate: eva,
      Create: cre
    };
  }

  /**
   * Generate constructive academic qualitative feedback
   */
  static generateQualitativeFeedback({ totalScore, scorePedagogy, scoreBlooms, scoreObe, scoreIct, scoreFeedback, sub }) {
    const strengths = [];
    const recommendations = [];

    // Evaluate Strengths
    if (scorePedagogy >= 22) {
      strengths.push(`High student-centric engagement demonstrated through ${sub.pedagogicalPractice}.`);
    }
    if (scoreBlooms >= 21) {
      strengths.push("Assessments heavily targeted Higher-Order Thinking Skills (HOTS: Analyze, Evaluate, Create).");
    }
    if (scoreObe >= 17) {
      strengths.push("Explicit grading rubrics shared with learners, ensuring CIE transparency (NAAC 2.5.1).");
    }
    if (scoreIct >= 12) {
      strengths.push(`Effective digital enablement using advanced tools: ${sub.ictTools}.`);
    }
    if (parseFloat(sub.studentFeedbackScore) >= 4.5) {
      strengths.push(`Outstanding student satisfaction rating (${sub.studentFeedbackScore}/5.0).`);
    }

    if (strengths.length === 0) {
      strengths.push("Syllabus mapped to basic foundational learning outcomes.");
    }

    // Evaluate Recommendations
    if (scoreBlooms < 18) {
      recommendations.push("Increase cognitive demand: introduce problem sets requiring students to Evaluate and Synthesize solutions rather than rote recall.");
    }
    if (scoreObe < 15) {
      recommendations.push("Develop explicit 4-tier analytic rubrics for open-ended assignments and attach to syllabus dossier.");
    }
    if (scoreIct < 10) {
      recommendations.push("Incorporate modern simulation environments, virtual laboratories, or collaborative code platforms into weekly modules.");
    }
    if (scorePedagogy < 16) {
      recommendations.push("Transition towards interactive pedagogy: incorporate Think-Pair-Share, Flipped Classroom, or PjBL sprints.");
    }
    if (!sub.remedialAction || sub.remedialAction.toLowerCase().includes("no formal")) {
      recommendations.push("Document structured remedial sessions and peer-assisted learning mechanisms for students needing academic support.");
    }

    if (recommendations.length === 0) {
      recommendations.push("Consider publishing this pedagogical practice as an institutional best practice paper in an engineering education journal.");
    }

    return { strengths, recommendations };
  }

  /**
   * Aggregate institutional analytics for IQAC
   * @param {Array} evaluatedSubmissions 
   */
  static computeIqacAnalytics(evaluatedSubmissions) {
    if (!evaluatedSubmissions || evaluatedSubmissions.length === 0) {
      return {
        totalSubmissions: 0,
        averageScore: 0,
        qualityBand: "N/A",
        higherOrderRatio: 0,
        naacCompliance: 0,
        deptAverages: {},
        pedagogyAdoption: {},
        bloomsAggregates: { Remember: 0, Understand: 0, Apply: 0, Analyze: 0, Evaluate: 0, Create: 0 }
      };
    }

    const total = evaluatedSubmissions.length;
    const sumScore = evaluatedSubmissions.reduce((acc, s) => acc + s.totalScore, 0);
    const avgScore = Number((sumScore / total).toFixed(1));

    // Quality Band
    let qualityBand = "Proficient";
    if (avgScore >= 85) qualityBand = "Exemplary";
    else if (avgScore >= 70) qualityBand = "Proficient";
    else qualityBand = "Developing";

    // Dept Averages
    const deptTotals = {};
    const deptCounts = {};
    evaluatedSubmissions.forEach(s => {
      const d = s.department || "Other";
      deptTotals[d] = (deptTotals[d] || 0) + s.totalScore;
      deptCounts[d] = (deptCounts[d] || 0) + 1;
    });

    const deptAverages = {};
    Object.keys(deptTotals).forEach(d => {
      deptAverages[d] = Number((deptTotals[d] / deptCounts[d]).toFixed(1));
    });

    // Pedagogy Adoption distribution
    const pedagogyAdoption = {};
    evaluatedSubmissions.forEach(s => {
      const p = s.pedagogicalPractice || "Other";
      pedagogyAdoption[p] = (pedagogyAdoption[p] || 0) + 1;
    });

    // Bloom's Aggregate
    const bloomsAggregates = { Remember: 0, Understand: 0, Apply: 0, Analyze: 0, Evaluate: 0, Create: 0 };
    evaluatedSubmissions.forEach(s => {
      if (s.cognitiveBreakdown) {
        Object.keys(s.cognitiveBreakdown).forEach(k => {
          bloomsAggregates[k] = (bloomsAggregates[k] || 0) + s.cognitiveBreakdown[k];
        });
      }
    });

    Object.keys(bloomsAggregates).forEach(k => {
      bloomsAggregates[k] = Math.round(bloomsAggregates[k] / total);
    });

    // Higher Order Ratio (Analyze + Evaluate + Create)
    const hotsTotal = bloomsAggregates.Analyze + bloomsAggregates.Evaluate + bloomsAggregates.Create;
    const higherOrderRatio = Math.round(hotsTotal);

    // NAAC Criterion 2.3.1 Compliance (% submissions with active/problem/experiential learning)
    const studentCentricCount = evaluatedSubmissions.filter(s => {
      const p = (s.pedagogicalPractice || "").toLowerCase();
      return !p.includes("traditional") && !p.includes("chalk");
    }).length;
    const naacCompliance = Math.round((studentCentricCount / total) * 100);

    return {
      totalSubmissions: total,
      averageScore: avgScore,
      qualityBand,
      higherOrderRatio,
      naacCompliance,
      deptAverages,
      pedagogyAdoption,
      bloomsAggregates
    };
  }

  /**
   * Parse CSV string into array of submission objects
   */
  static parseCsv(csvText) {
    const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const results = [];

    for (let i = 1; i < lines.length; i++) {
      // Basic CSV token parser handling quotes
      const row = lines[i];
      const values = [];
      let current = '';
      let inQuotes = false;
      for (let c = 0; c < row.length; c++) {
        const char = row[c];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());

      const obj = {};
      headers.forEach((h, idx) => {
        const val = values[idx] || '';
        obj[h] = val.replace(/^"|"$/g, '');
      });

      // Map to standard schema
      results.push({
        id: `SUB-${Date.now()}-${i}`,
        facultyId: obj["Faculty ID"] || obj.facultyId || `FAC-UPLOAD-${i}`,
        facultyName: obj["Faculty Name"] || obj.facultyName || "Unknown Faculty",
        designation: obj["Designation"] || obj.designation || "Assistant Professor",
        department: obj["Department"] || obj.department || "Computer Science & Engineering",
        courseCode: obj["Course Code"] || obj.courseCode || "CS101",
        courseTitle: obj["Course Title"] || obj.courseTitle || "Core Course",
        academicYear: obj["Academic Year"] || obj.academicYear || "2025-26",
        pedagogicalPractice: obj["Pedagogical Practice"] || obj.pedagogicalPractice || "Active Learning",
        practiceCategory: obj["Practice Category"] || obj.practiceCategory || "Experiential Learning",
        practiceDescription: obj["Practice Description"] || obj.practiceDescription || "",
        assessmentMethod: obj["Assessment Method"] || obj.assessmentMethod || "Continuous Internal Evaluation",
        bloomsLevels: obj["Bloom's Levels"] ? obj["Bloom's Levels"].split(';').map(s => s.trim()) : ["Apply", "Analyze"],
        ictTools: obj["ICT Tools"] || obj.ictTools || "LMS",
        studentFeedbackScore: parseFloat(obj["Student Feedback Score"] || obj.studentFeedbackScore) || 4.2,
        passPercentage: parseFloat(obj["Pass Percentage"] || obj.passPercentage) || 85.0,
        evidenceAttached: (obj["Evidence Attached"] || "").toLowerCase() === 'true',
        rubricAttached: (obj["Rubric Attached"] || "").toLowerCase() === 'true',
        remedialAction: obj["Remedial Action"] || obj.remedialAction || "Peer support and extra tutorials",
        submissionDate: new Date().toISOString().split('T')[0]
      });
    }

    return results;
  }
}
