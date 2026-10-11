/**
 * PED PLATFORM - TEMPLATE & GUIDELINES MANAGER
 * Generates and triggers browser downloads for standard JSON, CSV, and Markdown templates
 * conforming to institutional IQAC accreditation guidelines.
 */

export class TemplateManager {
  /**
   * Download official JSON template
   */
  static downloadJsonTemplate() {
    const templateData = [
      {
        facultyId: "FAC-DEPT-001",
        facultyName: "Dr. Full Name",
        designation: "Associate Professor",
        department: "Computer Science & Engineering",
        courseCode: "CS301",
        courseTitle: "Course Name",
        academicYear: "2025-26 (Even Sem)",
        pedagogicalPractice: "Flipped Classroom / Project-Based Learning / Think-Pair-Share",
        practiceCategory: "Experiential Learning / Active Learning",
        practiceDescription: "Describe how the pedagogical innovation was implemented, how students engaged, and evidence.",
        assessmentMethod: "Rubric-Based Open-Ended Projects / Continuous Coding Sprints",
        bloomsLevels: ["Apply", "Analyze", "Evaluate", "Create"],
        ictTools: "Moodle LMS, GitHub, Google Colab, Virtual Labs",
        studentFeedbackScore: 4.6,
        passPercentage: 92.5,
        evidenceAttached: true,
        evidenceUrl: "https://lms.college.edu/evidence/sample-proof.pdf",
        rubricAttached: true,
        remedialAction: "Remedial tutorial sessions and peer tutoring provided for slower learners.",
        submissionDate: new Date().toISOString().split('T')[0]
      }
    ];

    const jsonString = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(templateData, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", jsonString);
    dlAnchor.setAttribute("download", "PED_Faculty_Report_Template.json");
    dlAnchor.click();
  }

  /**
   * Download official CSV template
   */
  static downloadCsvTemplate() {
    const csvContent = 
`Faculty ID,Faculty Name,Designation,Department,Course Code,Course Title,Academic Year,Pedagogical Practice,Practice Category,Practice Description,Assessment Method,Bloom's Levels,ICT Tools,Student Feedback Score,Pass Percentage,Evidence Attached,Rubric Attached,Remedial Action
FAC-CSE-201,Dr. Sample Professor,Professor,Computer Science & Engineering,CS402,Cloud Computing,2025-26,Project-Based Learning (PjBL),Experiential Learning,"Hands-on microservice deployment challenge with GitHub Actions",Continuous Coding Sprints & Peer Review,"Apply;Analyze;Create","Docker;AWS Educate;GitHub",4.8,94.0,true,true,"Pre-configured starter templates provided for struggling groups"`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "PED_Faculty_Report_Template.csv");
    link.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Download official Markdown / DOC Guide
   */
  static downloadDocGuide() {
    const guideContent = 
`# IQAC Pedagogical & Assessment Practices Evaluation Guidelines
**Academic Quality Assurance Cell | Accreditation Benchmark Reference**

## 1. Overview
This guideline defines the multi-dimensional evaluation rubric for evaluating faculty submissions on pedagogical innovations and continuous assessment practices under NAAC Criterion 2 and NBA Criterion 3.

---

## 2. Evaluation Dimensions & Weights

### Dimension 1: Pedagogical Innovation & Student-Centric Methods (25 Points)
- **Exemplary (22-25 pts):** Flipped Classroom, Project-Based Learning, Hackathons, Peer Instruction. High student autonomy.
- **Proficient (17-21 pts):** Problem-Based Learning, Virtual Labs, Simulations, Case Studies.
- **Developing (11-16 pts):** Interactive questioning, occasional group discussions.
- **Needs Improvement (<10 pts):** Pure traditional chalk-and-talk lectures with minimal student interaction.

### Dimension 2: Bloom's Taxonomy Cognitive Demand (25 Points)
- **Higher-Order Thinking Skills (HOTS):** Evaluate (L5) & Create (L6) integrated into major assignments.
- **Mid-Order:** Apply (L3) & Analyze (L4).
- **Lower-Order (LOTS):** Remember (L1) & Understand (L2).
- *Target Benchmark:* Minimum 65% assessment questions/rubrics targeted at L3-L6.

### Dimension 3: Outcome-Based Education (OBE) & Rubric Transparency (20 Points)
- Transparent 4-tier analytic rubrics distributed prior to assessment.
- Clear alignment with defined Course Outcomes (CO1-CO6).

### Dimension 4: ICT Tools & Digital Learning Integration (15 Points)
- Industry-standard or open-source simulation tools (e.g., MATLAB, GitHub, Google Colab, Wokwi, ANSYS).
- LMS utilization for continuous feedback and reflections.

### Dimension 5: Student Feedback & Continuous Remedial Loop (15 Points)
- Formal student satisfaction survey score (>4.0/5.0).
- Documented proactive remedial tutorials and remedial bridge assignments for slower learners.

---
*IQAC Quality Assurance Committee | PED Platform*
`;

    const blob = new Blob([guideContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "PED_IQAC_Evaluation_Guidelines.md");
    link.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Returns a sample high-scoring report payload for instant UI demonstration
   */
  static getSampleExemplaryPayload() {
    return {
      facultyId: "FAC-CSE-889",
      facultyName: "Dr. Priyanka Bansal",
      designation: "Associate Professor",
      department: "Computer Science & Engineering",
      courseCode: "CS602",
      courseTitle: "Distributed Systems & Microservices",
      academicYear: "2025-26 (Even Sem)",
      pedagogicalPractice: "Flipped Classroom & Chaos Engineering Hackathon",
      practiceCategory: "Active & Experiential Learning",
      practiceDescription: "Weekly flipped video lectures followed by hands-on chaos engineering lab pods. Students intentionally injected network latency and node crashes into distributed cluster setups to test fault tolerance.",
      assessmentMethod: "Rubric-Based Open-Ended Projects",
      bloomsLevels: ["Apply", "Analyze", "Evaluate", "Create"],
      ictTools: "Docker Compose, Chaos Mesh, GitHub Actions, Prometheus",
      studentFeedbackScore: 4.85,
      passPercentage: 97.0,
      evidenceAttached: true,
      evidenceUrl: "https://lms.college.edu/evidence/cs602-chaos-proof.pdf",
      rubricAttached: true,
      remedialAction: "Dedicated debugging office hours and pre-built starter network templates for struggling teams.",
      submissionDate: new Date().toISOString().split('T')[0]
    };
  }

  /**
   * Returns a sample developing report payload for instant UI demonstration
   */
  static getSampleDevelopingPayload() {
    return {
      facultyId: "FAC-ME-440",
      facultyName: "Prof. Alok Verma",
      designation: "Assistant Professor",
      department: "Mechanical Engineering",
      courseCode: "ME204",
      courseTitle: "Thermodynamics Basics",
      academicYear: "2025-26 (Even Sem)",
      pedagogicalPractice: "Traditional Lecture with Minor Quiz",
      practiceCategory: "Teacher-Centric",
      practiceDescription: "Conducted standard classroom chalk-and-board lectures covering steam tables and gas cycles. Conducted surprise pop-quiz at the end of the term.",
      assessmentMethod: "Written Mid-Term & End-Term Only",
      bloomsLevels: ["Remember", "Understand"],
      ictTools: "Blackboard & Chalk",
      studentFeedbackScore: 3.2,
      passPercentage: 66.0,
      evidenceAttached: false,
      evidenceUrl: "",
      rubricAttached: false,
      remedialAction: "No formal remedial tutorials scheduled.",
      submissionDate: new Date().toISOString().split('T')[0]
    };
  }
}
