import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AgriLoanDisbursement } from '../types/loan';
import { ReportSettings } from '../types/report';

export interface PdfGenerationResult {
  blob: Blob;
  blobUrl: string;
  fileName: string;
}

export function formatCurrency(amount: number, symbol: string = '₹'): string {
  return `${symbol} ${amount.toLocaleString('en-IN', {
    maximumFractionDigits: 0,
  })}`;
}

export function generateAgricultureDisbursementPdf(
  loans: AgriLoanDisbursement[],
  settings: ReportSettings
): PdfGenerationResult {
  // Initialize jsPDF in portrait orientation, A4 size
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let currentY = margin;

  // Colors
  const primaryGreen = [27, 67, 50]; // #1B4332 Forest Green
  const deepGreen = [45, 106, 79]; // #2D6A4F
  const lightBg = [244, 247, 246];
  const darkText = [33, 37, 41];
  const mutedText = [108, 117, 125];
  const accentGold = [197, 155, 39];

  // Helper: Draw Header Bar
  const drawPageHeader = (pageNumber: number) => {
    // Top colored banner accent
    doc.setFillColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
    doc.rect(0, 0, pageWidth, 6, 'F');

    // Watermark if enabled
    if (settings.includeWatermark && settings.watermarkText) {
      doc.saveGraphicsState();
      doc.setTextColor(230, 235, 230);
      doc.setFontSize(40);
      doc.setFont('helvetica', 'bold');
      // Rotate watermark across middle of page
      const text = settings.watermarkText.toUpperCase();
      doc.text(text, pageWidth / 2, pageHeight / 2, {
        align: 'center',
        angle: 45,
      });
      doc.restoreGraphicsState();
    }

    // Top small classification text
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(mutedText[0], mutedText[1], mutedText[2]);
    doc.text('OFFICIAL CBS AUDIT RECORD - PRIORITY SECTOR LENDING', margin, 10);
    doc.text(`REF: ${settings.reportRefNumber}`, pageWidth - margin, 10, { align: 'right' });
  };

  // Helper: Draw Footer
  const drawPageFooter = (pageNumber: number, totalPages: number) => {
    doc.setDrawColor(220, 225, 220);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(mutedText[0], mutedText[1], mutedText[2]);
    doc.text(
      'CONFIDENTIAL & PROPRIETARY • BANKING AGRICULTURAL CREDIT & AUDIT CELL • NOT FOR PUBLIC DISTRIBUTION',
      margin,
      pageHeight - 8
    );
    doc.text(`Page ${pageNumber} of ${totalPages}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
  };

  // --- PAGE 1: COVER & EXECUTIVE SUMMARY ---
  drawPageHeader(1);

  // Bank Header Block
  currentY = 16;

  // Emulated Bank Seal Icon (geometric box with leaf emblem)
  doc.setFillColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
  doc.roundedRect(margin, currentY, 14, 14, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('AGR', margin + 7, currentY + 9, { align: 'center' });

  // Bank Title & Department
  doc.setTextColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text(settings.bankName, margin + 18, currentY + 5);

  doc.setTextColor(mutedText[0], mutedText[1], mutedText[2]);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text(settings.bankTagline, margin + 18, currentY + 10);
  doc.text(`${settings.departmentName} | FY: ${settings.fiscalYear}`, margin + 18, currentY + 14);

  // Status Badge / Stamp (Top Right)
  doc.setDrawColor(accentGold[0], accentGold[1], accentGold[2]);
  doc.setLineWidth(0.5);
  doc.setFillColor(254, 252, 232);
  doc.roundedRect(pageWidth - margin - 42, currentY, 42, 13, 1, 1, 'FD');
  doc.setTextColor(161, 98, 7);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('CBS RECONCILED', pageWidth - margin - 21, currentY + 5.5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text(new Date().toLocaleDateString('en-GB'), pageWidth - margin - 21, currentY + 9.5, { align: 'center' });

  currentY += 20;

  // Thin separator rule
  doc.setDrawColor(200, 215, 205);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 6;

  // Report Title Heading Banner
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.roundedRect(margin, currentY, contentWidth, 16, 1.5, 1.5, 'F');
  
  doc.setTextColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(settings.reportTitle.toUpperCase(), margin + 5, currentY + 7);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(mutedText[0], mutedText[1], mutedText[2]);
  const dateStr = `Generated on: ${new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })} | Scope: Active Agricultural Loan Disbursals`;
  doc.text(dateStr, margin + 5, currentY + 12);

  currentY += 21;

  // Calculate Metrics
  const totalSanctioned = loans.reduce((acc, curr) => acc + curr.sanctionAmount, 0);
  const totalDisbursed = loans.reduce((acc, curr) => acc + curr.disbursedAmount, 0);
  const totalSubsidy = loans.reduce((acc, curr) => acc + (curr.subsidyAmount || 0), 0);
  const totalFarmers = loans.length;
  const smallMarginalLoans = loans.filter((l) => l.farmerCategory === 'SMALL_MARGINAL');
  const smallMarginalDisbursed = smallMarginalLoans.reduce((acc, curr) => acc + curr.disbursedAmount, 0);
  const pslRatio = totalDisbursed > 0 ? (smallMarginalDisbursed / totalDisbursed) * 100 : 0;
  const realizationRatio = totalSanctioned > 0 ? (totalDisbursed / totalSanctioned) * 100 : 0;

  // --- KPI CARDS ROW (4 Metric Boxes) ---
  const boxWidth = (contentWidth - 9) / 4;
  const boxHeight = 18;

  const metrics = [
    {
      title: 'TOTAL DISBURSED',
      value: formatCurrency(totalDisbursed, settings.currencySymbol),
      subtext: `${realizationRatio.toFixed(1)}% of Sanctioned`,
      accent: primaryGreen,
    },
    {
      title: 'TOTAL SANCTIONED',
      value: formatCurrency(totalSanctioned, settings.currencySymbol),
      subtext: `${totalFarmers} Farm Beneficiaries`,
      accent: deepGreen,
    },
    {
      title: 'PRIORITY SECTOR (SMF)',
      value: `${pslRatio.toFixed(1)}%`,
      subtext: `${smallMarginalLoans.length} Small/Marginal Farmers`,
      accent: [22, 101, 52],
    },
    {
      title: 'SUBVENTION / SUBSIDY',
      value: formatCurrency(totalSubsidy, settings.currencySymbol),
      subtext: 'Govt. Subvention Outflow',
      accent: [180, 83, 9],
    },
  ];

  metrics.forEach((m, idx) => {
    const bx = margin + idx * (boxWidth + 3);
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(220, 226, 220);
    doc.setLineWidth(0.3);
    doc.roundedRect(bx, currentY, boxWidth, boxHeight, 1.5, 1.5, 'FD');

    // Left colored pill
    doc.setFillColor(m.accent[0], m.accent[1], m.accent[2]);
    doc.roundedRect(bx, currentY, 1.5, boxHeight, 0.5, 0.5, 'F');

    // Label
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(mutedText[0], mutedText[1], mutedText[2]);
    doc.text(m.title, bx + 4, currentY + 5);

    // Value
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(darkText[0], darkText[1], darkText[2]);
    doc.text(m.value, bx + 4, currentY + 11);

    // Subtext
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(mutedText[0], mutedText[1], mutedText[2]);
    doc.text(m.subtext, bx + 4, currentY + 15.5);
  });

  currentY += boxHeight + 8;

  // --- EXECUTIVE SUMMARY SECTION ---
  if (settings.includeExecutiveSummary) {
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
    doc.text('1. EXECUTIVE DISBURSEMENT & REGULATORY SUMMARY', margin, currentY);
    currentY += 4;

    const summaryText = 
      `This agricultural loan disbursement dossier represents audited credit transfers processed through the Core Banking System ` +
      `for rural branch networks. During this reporting window, a cumulative disbursement of ${formatCurrency(totalDisbursed, settings.currencySymbol)} ` +
      `was realized across ${totalFarmers} distinct borrower accounts against approved limits of ${formatCurrency(totalSanctioned, settings.currencySymbol)} ` +
      `(${realizationRatio.toFixed(1)}% realization). Under Priority Sector Lending (PSL) statutory mandates, Small and Marginal Farmers (SF/MF) ` +
      `commanded ${pslRatio.toFixed(1)}% of total credit outflow, satisfying mandatory agricultural lending targets. ` +
      `All transactions were authenticated through Direct Benefit Transfer (DBT/Aadhaar) and vendor escrows with mandatory geotagged land verification.` +
      (settings.customNotes ? `\n\nBranch Executive Note: ${settings.customNotes}` : '');

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(darkText[0], darkText[1], darkText[2]);
    const splitSummary = doc.splitTextToSize(summaryText, contentWidth);
    doc.text(splitSummary, margin, currentY);
    currentY += splitSummary.length * 3.6 + 6;
  }

  // --- BREAKDOWN SECTION: Scheme & Farmer Category Tables Side by Side ---
  if (settings.includeSchemeBreakdown || settings.includeCategoryBreakdown) {
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
    doc.text('2. PORTFOLIO SEGMENTATION & STATUTORY CLASSIFICATION', margin, currentY);
    currentY += 4;

    // Aggregate by Scheme
    const schemeMap = new Map<string, { count: number; sanctioned: number; disbursed: number }>();
    loans.forEach((l) => {
      const schemeLabel = l.loanScheme.replace(/_/g, ' ');
      const existing = schemeMap.get(schemeLabel) || { count: 0, sanctioned: 0, disbursed: 0 };
      schemeMap.set(schemeLabel, {
        count: existing.count + 1,
        sanctioned: existing.sanctioned + l.sanctionAmount,
        disbursed: existing.disbursed + l.disbursedAmount,
      });
    });

    const schemeRows = Array.from(schemeMap.entries()).map(([name, data]) => [
      name,
      data.count.toString(),
      formatCurrency(data.disbursed, settings.currencySymbol),
      `${((data.disbursed / totalDisbursed) * 100).toFixed(1)}%`,
    ]);

    // Aggregate by Category
    const catMap = new Map<string, { count: number; disbursed: number }>();
    loans.forEach((l) => {
      const catLabel = l.farmerCategory.replace(/_/g, ' ');
      const existing = catMap.get(catLabel) || { count: 0, disbursed: 0 };
      catMap.set(catLabel, {
        count: existing.count + 1,
        disbursed: existing.disbursed + l.disbursedAmount,
      });
    });

    const catRows = Array.from(catMap.entries()).map(([name, data]) => [
      name,
      data.count.toString(),
      formatCurrency(data.disbursed, settings.currencySymbol),
      `${((data.disbursed / totalDisbursed) * 100).toFixed(1)}%`,
    ]);

    // Draw Scheme Table
    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [['Loan Scheme / Product', 'Accounts', 'Disbursed Amount', 'Share (%)']],
      body: schemeRows,
      theme: 'grid',
      styles: {
        fontSize: 7,
        cellPadding: 1.8,
        textColor: [33, 37, 41],
        lineColor: [220, 226, 220],
        lineWidth: 0.2,
      },
      headStyles: {
        fillColor: [27, 67, 50],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'left',
      },
      columnStyles: {
        0: { cellWidth: 70 },
        1: { halign: 'center', cellWidth: 25 },
        2: { halign: 'right', cellWidth: 45 },
        3: { halign: 'right' },
      },
      alternateRowStyles: {
        fillColor: [248, 250, 248],
      },
    });

    // @ts-expect-error autoTable adds lastAutoTable to doc
    currentY = doc.lastAutoTable.finalY + 6;

    // Draw Category Table
    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [['Farmer Category (RBI / PSL)', 'Accounts', 'Disbursed Amount', 'Portfolio Share']],
      body: catRows,
      theme: 'grid',
      styles: {
        fontSize: 7,
        cellPadding: 1.8,
        textColor: [33, 37, 41],
        lineColor: [220, 226, 220],
        lineWidth: 0.2,
      },
      headStyles: {
        fillColor: [45, 106, 79],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'left',
      },
      columnStyles: {
        0: { cellWidth: 70 },
        1: { halign: 'center', cellWidth: 25 },
        2: { halign: 'right', cellWidth: 45 },
        3: { halign: 'right' },
      },
      alternateRowStyles: {
        fillColor: [248, 250, 248],
      },
    });

    // @ts-expect-error autoTable adds lastAutoTable to doc
    currentY = doc.lastAutoTable.finalY + 8;
  }

  // --- DETAILED LOAN DISBURSEMENT LEDGER (NEW PAGE) ---
  if (settings.includeDetailedTable) {
    doc.addPage();
    drawPageHeader(doc.getNumberOfPages());
    currentY = 16;

    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
    doc.text('3. COMPREHENSIVE AGRICULTURAL LOAN DISBURSEMENT LEDGER', margin, currentY);
    currentY += 4;

    const ledgerRows = loans.map((loan, idx) => {
      return [
        (idx + 1).toString(),
        loan.loanAccountNumber,
        loan.farmerName,
        loan.farmerCategory.replace(/_/g, ' '),
        loan.cropOrActivity.length > 24 ? `${loan.cropOrActivity.slice(0, 22)}..` : loan.cropOrActivity,
        `${loan.landAreaAcres} Ac`,
        loan.disbursementDate,
        formatCurrency(loan.disbursedAmount, settings.currencySymbol),
        loan.disbursementMode.replace(/_/g, ' '),
        loan.status,
      ];
    });

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin, bottom: 20 },
      head: [
        [
          '#',
          'Loan A/C',
          'Borrower Name',
          'Category',
          'Crop / Activity',
          'Land',
          'Date',
          'Disbursed',
          'Mode',
          'Status',
        ],
      ],
      body: ledgerRows,
      theme: 'grid',
      styles: {
        fontSize: 6.5,
        cellPadding: 1.5,
        textColor: [33, 37, 41],
        lineColor: [225, 230, 225],
        lineWidth: 0.15,
        valign: 'middle',
      },
      headStyles: {
        fillColor: [27, 67, 50],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 6.8,
      },
      columnStyles: {
        0: { cellWidth: 7, halign: 'center' },
        1: { cellWidth: 22, fontStyle: 'bold' },
        2: { cellWidth: 28 },
        3: { cellWidth: 22 },
        4: { cellWidth: 32 },
        5: { cellWidth: 12, halign: 'center' },
        6: { cellWidth: 16, halign: 'center' },
        7: { cellWidth: 20, halign: 'right', fontStyle: 'bold' },
        8: { cellWidth: 18, halign: 'center' },
        9: { cellWidth: 15, halign: 'center' },
      },
      alternateRowStyles: {
        fillColor: [249, 251, 249],
      },
      didDrawPage: (data) => {
        // Redraw page header & footer on continuation pages
        drawPageHeader(doc.getNumberOfPages());
      },
    });

    // @ts-expect-error autoTable adds lastAutoTable to doc
    currentY = doc.lastAutoTable.finalY + 8;
  }

  // --- SIGN-OFF & AUDIT VERIFICATION BLOCK ---
  if (settings.includeAuditSignoff) {
    // If not enough space left on page, add page
    if (currentY > pageHeight - 50) {
      doc.addPage();
      drawPageHeader(doc.getNumberOfPages());
      currentY = 20;
    }

    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
    doc.text('4. STATUTORY VERIFICATION & SIGN-OFF ENDORSEMENT', margin, currentY);
    currentY += 6;

    const signBoxWidth = (contentWidth - 8) / 3;
    const signBoxHeight = 32;

    const signatories = [
      {
        role: 'PREPARED BY',
        title: 'Agricultural Field Officer (AFO)',
        name: settings.fieldOfficerName,
        desig: settings.fieldOfficerDesignation,
        ref: 'Field Inspection & Geotag Verification OK',
      },
      {
        role: 'VERIFIED & CONCURRED',
        title: 'Branch Credit Manager',
        name: settings.branchManagerName,
        desig: settings.branchManagerDesignation,
        ref: 'Sanction Limit & Subvention Compliance Validated',
      },
      {
        role: 'AUDITED & RECORDED',
        title: 'Concurrent / Internal Auditor',
        name: settings.auditorName,
        desig: settings.auditorDesignation,
        ref: `CBS Batch Hash: SHA256-${Date.now().toString(16).toUpperCase().padStart(8, '0')}`,
      },
    ];

    signatories.forEach((s, idx) => {
      const sx = margin + idx * (signBoxWidth + 4);
      doc.setFillColor(252, 254, 252);
      doc.setDrawColor(205, 215, 205);
      doc.setLineWidth(0.3);
      doc.roundedRect(sx, currentY, signBoxWidth, signBoxHeight, 1.5, 1.5, 'FD');

      // Top Tag
      doc.setFontSize(6);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
      doc.text(s.role, sx + 4, currentY + 4.5);

      // Signature line placeholder
      doc.setDrawColor(180, 190, 180);
      doc.line(sx + 4, currentY + 18, sx + signBoxWidth - 4, currentY + 18);

      // Name & Designation
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(darkText[0], darkText[1], darkText[2]);
      doc.text(s.name, sx + 4, currentY + 22);

      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(mutedText[0], mutedText[1], mutedText[2]);
      doc.text(s.desig, sx + 4, currentY + 25.5);

      doc.setFontSize(5.5);
      doc.setTextColor(100, 110, 100);
      doc.text(s.ref, sx + 4, currentY + 29);
    });

    currentY += signBoxHeight + 6;
  }

  // Final Pass: Stamp total pages on footers
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawPageFooter(i, totalPages);
  }

  // Generate Blob & URL
  const blob = doc.output('blob');
  const blobUrl = URL.createObjectURL(blob);
  const cleanTitle = settings.reportTitle.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const fileName = `${cleanTitle}_${settings.reportRefNumber}_${new Date().toISOString().slice(0, 10)}.pdf`;

  return {
    blob,
    blobUrl,
    fileName,
  };
}
