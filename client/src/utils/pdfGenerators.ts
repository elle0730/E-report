import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Subpoena PDF Generator
export function generateSubpoenaPdf(subpoena: {
  refNumber: string;
  caseNumber: string;
  respondent: string;
  complainant: string;
  hearingDate: string;
  hearingTime: string;
  venue: string;
  reason: string;
  signatory: string;
  signatoryTitle?: string;
}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Official Header Letterhead
  doc.setFont('times', 'bold');
  doc.setFontSize(10);
  doc.text('REPUBLIC OF THE PHILIPPINES', pageWidth / 2, 15, { align: 'center' });
  doc.text('PROVINCE OF PANGASINAN', pageWidth / 2, 20, { align: 'center' });
  doc.text('MUNICIPALITY OF SAN NICOLAS', pageWidth / 2, 25, { align: 'center' });
  doc.setFontSize(12);
  doc.text('BARANGAY BENSICAN', pageWidth / 2, 31, { align: 'center' });

  doc.setLineWidth(0.5);
  doc.line(20, 34, pageWidth - 20, 34);
  doc.setLineWidth(0.2);
  doc.line(20, 35, pageWidth - 20, 35);

  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.text('OFFICE OF THE LUPONG TAGAPAMAYAPA', pageWidth / 2, 42, { align: 'center' });

  // KP Form Header
  doc.setFontSize(9);
  doc.setFont('times', 'italic');
  doc.text('KP Form No. 9', 20, 48);
  doc.text(`Reference No: ${subpoena.refNumber}`, pageWidth - 20, 48, { align: 'right' });

  // Parties & Case Box
  doc.setFont('times', 'normal');
  doc.setFontSize(10);
  doc.text(`COMPLAINANT: ${subpoena.complainant}`, 20, 56);
  doc.text('— AGAINST —', 20, 62);
  doc.text(`RESPONDENT: ${subpoena.respondent}`, 20, 68);

  doc.text(`BARANGAY CASE NO.: ${subpoena.caseNumber}`, pageWidth - 20, 56, { align: 'right' });
  doc.text(`FOR: ${subpoena.reason}`, pageWidth - 20, 62, { align: 'right' });

  // Main Summons Title
  doc.setFont('times', 'bold');
  doc.setFontSize(14);
  doc.text('SUBPOENA / SUMMONS (PATAWAG)', pageWidth / 2, 82, { align: 'center' });

  // Body Text
  doc.setFont('times', 'normal');
  doc.setFontSize(11);
  const toText = `TO: ${subpoena.respondent}\nAddress: Barangay Bensican, San Nicolas, Pangasinan\n`;
  doc.text(toText, 20, 92);

  const mainParagraph = `You are hereby summoned to personally appear before the Punong Barangay / Lupong Tagapamayapa of Barangay Bensican at the ${subpoena.venue} on ${subpoena.hearingDate} at exactly ${subpoena.hearingTime}, to respond to and answer the formal complaint filed before this Office regarding: "${subpoena.reason}".`;

  const splitMain = doc.splitTextToSize(mainParagraph, pageWidth - 40);
  doc.text(splitMain, 20, 106);

  const warningParagraph = `FAILURE OR WILLFUL REFUSAL TO APPEAR may result in the forfeiture of your right to present defenses in accordance with the Katarungang Pambarangay Law under Republic Act No. 7160 (Local Government Code of 1991), and appropriate legal certification for court filing shall be issued.`;
  const splitWarning = doc.splitTextToSize(warningParagraph, pageWidth - 40);
  doc.text(splitWarning, 20, 126);

  const issuedDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  doc.text(`Issued this ${issuedDate} at Barangay Bensican, San Nicolas, Pangasinan.`, 20, 150);

  // Signatory Block
  doc.setFont('times', 'bold');
  doc.text(subpoena.signatory.toUpperCase(), pageWidth - 30, 175, { align: 'right' });
  doc.setFont('times', 'normal');
  doc.text(subpoena.signatoryTitle || 'Punong Barangay / Lupon Chairman', pageWidth - 30, 180, { align: 'right' });
  doc.setLineWidth(0.3);
  doc.line(pageWidth - 80, 171, pageWidth - 20, 171);

  // Officer Return of Service Box
  doc.rect(20, 200, pageWidth - 40, 50);
  doc.setFont('times', 'bold');
  doc.setFontSize(9);
  doc.text('OFFICER RETURN OF SERVICE', 25, 206);
  doc.setFont('times', 'normal');
  doc.text('I hereby certify that I have served this Subpoena/Summons upon the respondent on ____________________', 25, 213);
  doc.text('Method of Service: [  ] Handed Personally   [  ] Substituted Service to competent person of household', 25, 219);
  doc.text('Served by: _____________________________________   Signature of Recipient: _________________________', 25, 227);
  doc.text('Position / Barangay Tanod: _______________________   Date Received: _________________________________', 25, 235);

  // Footer seal note
  doc.setFontSize(8);
  doc.setFont('times', 'italic');
  doc.text('Barangay Bensican Official Seal • San Nicolas, Pangasinan • Data Privacy Act Compliant', pageWidth / 2, 280, { align: 'center' });

  // Download PDF
  doc.save(`${subpoena.refNumber}_Official_Summons.pdf`);
}

// Accountability Report PDF Generator
export function generateAccountabilityPdf(items: any[], summary: any) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFont('times', 'bold');
  doc.setFontSize(12);
  doc.text('BARANGAY BENSICAN, SAN NICOLAS, PANGASINAN', pageWidth / 2, 14, { align: 'center' });
  doc.setFontSize(14);
  doc.text('OFFICIAL PUBLIC ACCOUNTABILITY & CONCERN RESOLUTION REPORT', pageWidth / 2, 21, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('times', 'normal');
  doc.text(`Generated on: ${new Date().toLocaleString()} | Total Resolved Concerns: ${summary.totalResolved} | Average Resolution Time: ${summary.avgResolutionDays} days`, pageWidth / 2, 27, { align: 'center' });

  const tableData = items.map((item, index) => [
    index + 1,
    item.ref_number,
    item.title,
    item.category_name,
    item.resident_name || 'Resident',
    item.created_at ? item.created_at.split('T')[0] : '',
    item.resolution_date ? item.resolution_date.split('T')[0] : '',
    `${item.resolutionDays || 1} days`,
    item.admin_name || 'Barangay Staff',
    item.outcome || 'Resolved through barangay action'
  ]);

  autoTable(doc, {
    startY: 32,
    head: [['#', 'Ref Number', 'Concern Title', 'Category', 'Complainant', 'Received', 'Resolved', 'Time', 'Handled By', 'Outcome / Resolution']],
    body: tableData,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [21, 128, 61], textColor: 255, fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 8 },
      1: { cellWidth: 26 },
      2: { cellWidth: 40 },
      3: { cellWidth: 26 },
      4: { cellWidth: 26 },
      5: { cellWidth: 20 },
      6: { cellWidth: 20 },
      7: { cellWidth: 16 },
      8: { cellWidth: 30 },
      9: { cellWidth: 'auto' }
    }
  });

  const finalY = (doc as any).lastAutoTable.finalY + 15;
  if (finalY < 185) {
    doc.setFont('times', 'bold');
    doc.text('Prepared & Certified Correct:', 30, finalY);
    doc.text('Office of the Punong Barangay', 30, finalY + 12);
    doc.setFont('times', 'normal');
    doc.text('Punong Barangay, Bensican', 30, finalY + 17);

    doc.setFont('times', 'bold');
    doc.text('Attested By:', pageWidth - 70, finalY);
    doc.text('Office of the Barangay Secretary', pageWidth - 70, finalY + 12);
    doc.setFont('times', 'normal');
    doc.text('Barangay Secretary', pageWidth - 70, finalY + 17);
  }

  doc.save(`Barangay_Bensican_Accountability_Report_${Date.now()}.pdf`);
}

// Accountability CSV Export
export function exportAccountabilityCsv(items: any[]) {
  const headers = ['Ref Number', 'Title', 'Category', 'Resident', 'Date Received', 'Date Resolved', 'Resolution Days', 'Handler', 'Outcome'];
  const rows = items.map(i => [
    `"${i.ref_number}"`,
    `"${(i.title || '').replace(/"/g, '""')}"`,
    `"${i.category_name || ''}"`,
    `"${i.resident_name || ''}"`,
    `"${i.created_at ? i.created_at.split('T')[0] : ''}"`,
    `"${i.resolution_date ? i.resolution_date.split('T')[0] : ''}"`,
    `"${i.resolutionDays || 1}"`,
    `"${i.admin_name || ''}"`,
    `"${(i.outcome || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Barangay_Bensican_Accountability_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

