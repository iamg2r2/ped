/**
 * PED PLATFORM - ROBUST DOCUMENT PARSER SERVICE
 * Parses Word (.docx), PDF (.pdf), JSON, and CSV files.
 * Uses DOMParser on Mammoth HTML tables to extract cells from
 * St. Joseph's College IQAC Annexure 9(b) and 9(c) templates.
 */

import mammoth from 'mammoth';

export class DocumentParser {
  /**
   * Main entry point to parse any uploaded file
   * @param {File} file 
   * @returns {Promise<Object>} Extracted document metadata and text
   */
  static async parseFile(file) {
    const fileName = file.name.toLowerCase();
    
    if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
      return await this.parseDocx(file);
    } else if (fileName.endsWith('.pdf')) {
      return await this.parsePdf(file);
    } else if (fileName.endsWith('.json')) {
      const text = await file.text();
      const data = JSON.parse(text);
      return Array.isArray(data) ? data : [data];
    } else if (fileName.endsWith('.csv')) {
      return await file.text();
    } else {
      throw new Error("Unsupported format. Please upload a Word (.docx) or PDF (.pdf) file.");
    }
  }

  /**
   * Parse Word (.docx) document
   */
  static async parseDocx(file) {
    const arrayBuffer = await file.arrayBuffer();
    const htmlResult = await mammoth.convertToHtml({ arrayBuffer });
    const textResult = await mammoth.extractRawText({ arrayBuffer });
    
    const html = htmlResult.value || "";
    const rawText = textResult.value || "";

    return this.extractFromHtmlAndText(html, rawText, file.name);
  }

  /**
   * Parse PDF document
   */
  static async parsePdf(file) {
    const arrayBuffer = await file.arrayBuffer();
    let text = "";

    try {
      const pdfjsLib = await import('pdfjs-dist/build/pdf.mjs');
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
      }

      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(" ");
        text += pageText + "\n";
      }
    } catch (e) {
      console.warn("PDF parse fallback:", e);
      text = file.name;
    }

    return this.extractFromHtmlAndText("", text, file.name);
  }

  /**
   * Extract fields by analyzing HTML tables and raw text
   */
  static extractFromHtmlAndText(html, rawText, fileName) {
    const isAnnexure9c = rawText.includes("Assessment Components") || 
                         rawText.includes("Assessment Component") || 
                         fileName.toLowerCase().includes("9_c") ||
                         fileName.toLowerCase().includes("assessment");
                         
    const type = isAnnexure9c ? "ANNEXURE_9C" : "ANNEXURE_9B";

    let facultyName = "";
    let department = "";
    let programme = "";
    let courseTitle = "";
    let courseCode = "";
    let academicYear = "";
    
    // 9b fields
    let teachingMethod = "";
    let pedagogicalApproach = "";
    let tools = "";
    let coAlignment = "";
    let planningPurpose = "";
    let inClassDelivery = "";
    let impact = "";
    let lookingAhead = "";

    // 9c fields
    let courseOutcomes = [];
    let assessmentComponents = [];
    let whatWorked = "";
    let whatCouldImprove = "";

    // Parse HTML table rows using DOMParser
    if (html && typeof DOMParser !== 'undefined') {
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const rows = doc.querySelectorAll('tr');

        rows.forEach(tr => {
          const cells = tr.querySelectorAll('td, th');
          if (cells.length >= 2) {
            const keyText = cells[0].textContent.trim().toLowerCase();
            const valText = cells[1].textContent.trim();

            if (valText && valText.length > 0) {
              if (keyText.includes("faculty name") || keyText.includes("name of faculty")) {
                facultyName = valText;
              } else if (keyText.includes("department")) {
                department = valText;
              } else if (keyText.includes("programme")) {
                programme = valText;
              } else if (keyText.includes("course title")) {
                courseTitle = valText;
              } else if (keyText.includes("course code")) {
                courseCode = valText;
              } else if (keyText.includes("academic year") || keyText.includes("semester")) {
                academicYear = valText;
              } else if (keyText.includes("teaching method") || keyText.includes("strategy")) {
                teachingMethod = valText;
              } else if (keyText.includes("pedagogical approach")) {
                pedagogicalApproach = valText;
              } else if (keyText.includes("tools") || keyText.includes("materials")) {
                tools = valText;
              } else if (keyText.includes("alignment with cos") || keyText.includes("aligned co")) {
                coAlignment = valText;
              } else if (keyText.includes("planning and purpose") || keyText.includes("planning")) {
                planningPurpose = valText;
              } else if (keyText.includes("in-class delivery") || keyText.includes("delivery")) {
                inClassDelivery = valText;
              } else if (keyText.includes("impact") || keyText.includes("signs of student learning")) {
                impact = valText;
              } else if (keyText.includes("looking ahead") || keyText.includes("challenges")) {
                lookingAhead = valText;
              } else if (keyText.includes("what worked well")) {
                whatWorked = valText;
              } else if (keyText.includes("what could be improved") || keyText.includes("improved")) {
                whatCouldImprove = valText;
              }
            }
          }
        });
      } catch (err) {
        console.warn("DOMParser error:", err);
      }
    }

    // Fallback: regex search on rawText if not extracted from tables
    if (!facultyName) {
      facultyName = this.extractRegex(rawText, /(?:Faculty Name|Name of Faculty)[:\s\t\n]+([A-Za-z.\s]+?)(?:\r?\n|Department|Programme|$)/i) || "";
    }
    if (!department) {
      department = this.extractRegex(rawText, /(?:Department)[:\s\t\n]+([A-Za-z&\s]+?)(?:\r?\n|Programme|Course|$)/i) || "";
    }
    if (!courseTitle) {
      courseTitle = this.extractRegex(rawText, /(?:Course Title)[:\s\t\n]+([A-Za-z0-9&\s]+?)(?:\r?\n|Course Code|$)/i) || "";
    }
    if (!courseCode) {
      courseCode = this.extractRegex(rawText, /(?:Course Code)[:\s\t\n]+([A-Za-z0-9]+)/i) || "";
    }

    if (!planningPurpose) planningPurpose = this.extractSection(rawText, "Planning and Purpose", "In-Class Delivery") || "";
    if (!inClassDelivery) inClassDelivery = this.extractSection(rawText, "In-Class Delivery", "Impact") || "";
    if (!impact) impact = this.extractSection(rawText, "Impact", "Looking Ahead") || "";
    if (!lookingAhead) lookingAhead = this.extractSection(rawText, "Looking Ahead", "List of Evidence") || "";
    if (!whatWorked) whatWorked = this.extractSection(rawText, "What worked well in the assessment process?", "What could be improved") || "";
    if (!whatCouldImprove) whatCouldImprove = this.extractSection(rawText, "What could be improved in future offerings?", "Date of Submission") || "";

    return {
      type,
      fileName,
      facultyName: facultyName.trim(),
      department: department.trim(),
      programme: programme.trim(),
      courseTitle: courseTitle.trim(),
      courseCode: courseCode.trim(),
      academicYear: academicYear.trim(),
      teachingMethod: teachingMethod.trim(),
      pedagogicalApproach: pedagogicalApproach.trim(),
      tools: tools.trim(),
      coAlignment: coAlignment.trim(),
      planningPurpose: planningPurpose.trim(),
      inClassDelivery: inClassDelivery.trim(),
      impact: impact.trim(),
      lookingAhead: lookingAhead.trim(),
      whatWorked: whatWorked.trim(),
      whatCouldImprove: whatCouldImprove.trim(),
      courseOutcomes,
      assessmentComponents,
      rawText
    };
  }

  static extractRegex(text, regex) {
    const match = text.match(regex);
    return match && match[1] ? match[1].trim() : null;
  }

  static extractSection(text, startKeyword, endKeyword) {
    const startIdx = text.indexOf(startKeyword);
    if (startIdx === -1) return null;

    const afterStart = text.slice(startIdx + startKeyword.length);
    const endIdx = afterStart.indexOf(endKeyword);

    if (endIdx !== -1) {
      return afterStart.slice(0, endIdx).replace(/^[:\s\t\n?]+/, '').trim();
    }
    return afterStart.slice(0, 300).replace(/^[:\s\t\n?]+/, '').trim();
  }
}
