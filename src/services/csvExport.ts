import { AgriLoanDisbursement } from '../types/loan';

export function exportLoansToCsv(loans: AgriLoanDisbursement[], filename = 'agriculture_loan_disbursements.csv'): void {
  const headers = [
    'Loan Account No',
    'Borrower Name',
    'Farmer ID',
    'Farmer Category',
    'Phone',
    'Village',
    'District',
    'State',
    'Branch Name',
    'Branch Code',
    'Loan Scheme',
    'Crop / Activity',
    'Crop Season',
    'Land Area (Acres)',
    'Land Survey No',
    'Sanction Amount',
    'Disbursed Amount',
    'Disbursement Date',
    'Disbursement Mode',
    'Transaction Reference (UTR)',
    'Tranche Number',
    'Total Tranches',
    'Interest Rate (%)',
    'Subvention Rate (%)',
    'Effective Interest (%)',
    'Status',
    'Field Officer',
    'Verification Date',
    'Geotag Coordinates',
    'Collateral Type',
    'Subsidy Amount',
    'Remarks',
  ];

  const rows = loans.map((l) => [
    `"${l.loanAccountNumber}"`,
    `"${l.farmerName}"`,
    `"${l.farmerId}"`,
    `"${l.farmerCategory}"`,
    `"${l.phone}"`,
    `"${l.village}"`,
    `"${l.district}"`,
    `"${l.state}"`,
    `"${l.branchName}"`,
    `"${l.branchCode}"`,
    `"${l.loanScheme}"`,
    `"${l.cropOrActivity.replace(/"/g, '""')}"`,
    `"${l.cropSeason}"`,
    l.landAreaAcres,
    `"${l.landSurveyNumber}"`,
    l.sanctionAmount,
    l.disbursedAmount,
    l.disbursementDate,
    `"${l.disbursementMode}"`,
    `"${l.transactionReference}"`,
    l.trancheNumber,
    l.totalTranches,
    l.interestRate,
    l.subventionRate,
    l.effectiveInterestRate,
    `"${l.status}"`,
    `"${l.fieldOfficerName}"`,
    l.fieldOfficerVerificationDate,
    `"${l.geotagCoordinates}"`,
    `"${l.collateralType}"`,
    l.subsidyAmount || 0,
    `"${(l.remarks || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
