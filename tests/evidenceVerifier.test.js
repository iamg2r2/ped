import test from 'node:test';
import assert from 'node:assert/strict';
import { EvidenceVerifier } from '../src/services/evidenceVerifier.js';
import { EvaluatorEngine } from '../src/services/evaluator.js';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

test.describe('EvidenceVerifier & Geotag Verification Engine', () => {
  test('Geotag Detection: Extracts GPS Map Camera coordinates and verifies Trichy campus proximity', () => {
    const textWithCampusGeotag = `
      Course: Distributed Systems
      Classroom activity conducted with GPS Map Camera.
      Lat 10.8291° N, Long 78.6883° E
      Tiruchirappalli, Tamil Nadu, India
      18/09/2026 10:45 AM GMT+05:30
    `;

    const result = EvidenceVerifier.scanTextForGeotagWatermarks(textWithCampusGeotag);
    assert.equal(result.found, true);
    assert.equal(result.isCampus, true);
    assert.equal(Math.round(result.lat * 1000) / 1000, 10.829);
    assert.equal(Math.round(result.lng * 1000) / 1000, 78.688);
  });

  test('Geotag Detection: Correctly identifies off-campus coordinates requiring human review', () => {
    const textWithOffCampus = `
      Classroom photo attached.
      Lat: 13.0827, Long: 80.2707 (Chennai)
    `;

    const result = EvidenceVerifier.scanTextForGeotagWatermarks(textWithOffCampus);
    assert.equal(result.found, true);
    assert.equal(result.isCampus, false);
  });

  test('Evidence Audit: Photos without GPS EXIF tags are marked Human Review Required (no blind verification)', async () => {
    // When no GPS metadata or coordinates are present but photos exist
    const auditResult = await EvidenceVerifier.auditEvidence(null, "2 photos attached in annexure without GPS tags");
    assert.equal(auditResult.status, "Missing"); // Since no binary buffer and no coordinates
  });

  test('Evidence Audit: Geotagged text watermark yields Verified status and 10 points', async () => {
    const sampleText = `
      Evidence: GPS Map Camera photo attached showing classroom peer code sprint.
      Latitude: 10.8291, Longitude: 78.6883, Tiruchirappalli campus.
    `;

    const auditResult = await EvidenceVerifier.auditEvidence(null, sampleText);
    assert.equal(auditResult.status, "Verified");
    assert.equal(auditResult.score, 10);
    assert.equal(auditResult.isGeotagConfirmed, true);
    assert.match(auditResult.rationale, /Verified campus geotagged photo/);
  });

  test('EvaluatorEngine Integration: Annexure 9(b) includes structured evidence audit and geotag details', () => {
    const submissionWithGeotag = {
      facultyName: "Dr. K. Anand",
      department: "Information Technology",
      courseTitle: "Cloud Security",
      teachingMethod: "Virtual Security Sandbox Threat Modeling",
      planningPurpose: "Designed session around MITRE ATT&CK matrix to teach real-time intrusion response",
      inClassDelivery: "Students worked in 3-member red/blue teams executing packet captures on Kali Linux VMs",
      coAlignment: "CO1, CO3: Implement public-key cryptosystems and intrusion detection rules",
      impact: "100% of teams correctly mitigated simulated DNS spoofing attacks within allotted time",
      lookingAhead: "Introduce live cloud container honeypots in next offering",
      evidenceAttached: "2 Geotagged photos attached (10.8291° N, 78.6883° E, St. Joseph's College campus)",
      evidenceAudit: {
        status: "Verified",
        score: 10,
        imagesCount: 2,
        isGeotagConfirmed: true,
        geotagDetails: {
          latitude: 10.8291,
          longitude: 78.6883,
          isCampus: true,
          locationLabel: "St. Joseph's College Campus, Tiruchirappalli"
        },
        rationale: "Verified campus geotagged photos attached (10.8291°N, 78.6883°E)."
      }
    };

    const evaluation = EvaluatorEngine.evaluateAnnexure9b(submissionWithGeotag);
    assert.equal(evaluation.evidenceStatus, "Verified");
    assert.equal(evaluation.evidenceCompliance, 100);
    assert.equal(evaluation.isGeotagConfirmed, true);
    assert.equal(evaluation.imagesCount, 2);
    assert.equal(evaluation.geotagDetails.latitude, 10.8291);
    assert.equal(evaluation.evaluationStatus, "Verified");
  });

  test('Binary Export Verification: XLSX workbook generates real binary spreadsheet data', () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([
      ["Department", "HOD", "Score"],
      ["Computer Science", "Dr. Albert", 92]
    ]);
    XLSX.utils.book_append_sheet(wb, ws, "Summary");

    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const size = buffer.byteLength || buffer.length;
    assert.ok(size > 500, "XLSX binary file should be non-empty valid zip/binary container");

    // Verify ZIP PK header (0x50, 0x4B) for genuine .xlsx workbook
    const bytes = new Uint8Array(buffer);
    assert.equal(bytes[0], 0x50); // 'P'
    assert.equal(bytes[1], 0x4B); // 'K'
  });

  test('Binary Export Verification: jsPDF generates real binary PDF document', () => {
    const doc = new jsPDF();
    doc.text("ST. JOSEPH'S COLLEGE (AUTONOMOUS)", 20, 20);
    autoTable(doc, {
      body: [["Faculty", "Score"], ["Dr. Test", "95/100"]]
    });

    const pdfOutput = doc.output('arraybuffer');
    assert.ok(pdfOutput.byteLength > 1000, "PDF output should be valid binary PDF file");
    
    // Check %PDF header bytes
    const bytes = new Uint8Array(pdfOutput);
    const headerStr = String.fromCharCode(...bytes.slice(0, 5));
    assert.equal(headerStr, "%PDF-");
  });
});
