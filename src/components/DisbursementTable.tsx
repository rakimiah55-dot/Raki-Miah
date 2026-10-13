import React, { useState } from 'react';
import { 
  Eye, 
  Download, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  FileCheck, 
  ExternalLink, 
  ArrowUpDown, 
  Check, 
  X,
  CreditCard,
  User,
  ShieldCheck,
  Calendar,
  Layers
} from 'lucide-react';
import { AgriLoanDisbursement } from '../types/loan';
import { formatCurrency } from '../services/pdfReportGenerator';

interface DisbursementTableProps {
  loans: AgriLoanDisbursement[];
  currencySymbol: string;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onExportCsv: () => void;
}

export const DisbursementTable: React.FC<DisbursementTableProps> = ({
  loans,
  currencySymbol,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onClearSelection,
  onExportCsv,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<keyof AgriLoanDisbursement>('disbursementDate');
  const [sortAsc, setSortAsc] = useState(false);
  const [inspectedLoan, setInspectedLoan] = useState<AgriLoanDisbursement | null>(null);

  // Sorting
  const sortedLoans = [...loans].sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];

    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortAsc ? valA - valB : valB - valA;
    }
    if (typeof valA === 'string' && typeof valB === 'string') {
      return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedLoans.length / pageSize) || 1;
  const paginatedLoans = sortedLoans.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (field: keyof AgriLoanDisbursement) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'SMALL_MARGINAL':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'WOMEN_SHG':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'TENANT_FARMER':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'MEDIUM':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60">
        <div className="flex items-center space-x-3">
          <h3 className="text-sm font-semibold text-slate-900">
            Disbursement Ledger
          </h3>
          <span className="text-xs text-slate-500">
            ({loans.length} filtered loans)
          </span>

          {selectedIds.length > 0 && (
            <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-md text-xs">
              <span className="font-semibold">{selectedIds.length} Selected</span>
              <button
                onClick={onClearSelection}
                className="text-emerald-700 hover:text-emerald-900 font-medium"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onExportCsv}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 transition-colors flex items-center space-x-1.5 cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-xs"
          >
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-100/80 text-slate-700 uppercase font-semibold text-[11px] border-b border-slate-200">
            <tr>
              <th className="p-3 w-10 text-center">
                <input
                  type="checkbox"
                  checked={selectedIds.length === loans.length && loans.length > 0}
                  onChange={onSelectAll}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5 cursor-pointer"
                />
              </th>
              <th className="p-3 cursor-pointer" onClick={() => handleSort('loanAccountNumber')}>
                <div className="flex items-center space-x-1">
                  <span>Loan A/C & ID</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="p-3 cursor-pointer" onClick={() => handleSort('farmerName')}>
                <div className="flex items-center space-x-1">
                  <span>Borrower / Category</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="p-3">Branch & District</th>
              <th className="p-3">Scheme & Crop Purpose</th>
              <th className="p-3 text-center">Land (Ac)</th>
              <th className="p-3 text-right cursor-pointer" onClick={() => handleSort('disbursedAmount')}>
                <div className="flex items-center justify-end space-x-1">
                  <span>Disbursed</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="p-3 text-center cursor-pointer" onClick={() => handleSort('disbursementDate')}>
                <div className="flex items-center justify-center space-x-1">
                  <span>Date</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="p-3 text-center">Mode & Tranche</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-normal">
            {paginatedLoans.length === 0 ? (
              <tr>
                <td colSpan={11} className="p-8 text-center text-slate-400">
                  No agriculture loan disbursements match current filter criteria.
                </td>
              </tr>
            ) : (
              paginatedLoans.map((loan) => {
                const isSelected = selectedIds.includes(loan.id);

                return (
                  <tr
                    key={loan.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isSelected ? 'bg-emerald-50/40' : ''
                    }`}
                  >
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect(loan.id)}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5 cursor-pointer"
                      />
                    </td>
                    <td className="p-3 font-mono">
                      <span className="font-semibold text-slate-900 block">
                        {loan.loanAccountNumber}
                      </span>
                      <span className="text-[10px] text-slate-400">{loan.id}</span>
                    </td>
                    <td className="p-3">
                      <span className="font-semibold text-slate-900 block">
                        {loan.farmerName}
                      </span>
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium border ${getCategoryBadgeClass(
                          loan.farmerCategory
                        )}`}
                      >
                        {loan.farmerCategory.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-slate-800 font-medium block">
                        {loan.branchName.replace(' Branch', '')}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {loan.village}, {loan.district}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-slate-900 font-medium block">
                        {loan.cropOrActivity}
                      </span>
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded font-mono">
                        {loan.loanScheme.replace(/_/g, ' ')} ({loan.cropSeason})
                      </span>
                    </td>
                    <td className="p-3 text-center font-mono">
                      {loan.landAreaAcres} Ac
                    </td>
                    <td className="p-3 text-right">
                      <span className="font-bold text-slate-900 block font-mono">
                        {formatCurrency(loan.disbursedAmount, currencySymbol)}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Limit: {formatCurrency(loan.sanctionAmount, currencySymbol)}
                      </span>
                    </td>
                    <td className="p-3 text-center font-mono text-[11px] text-slate-700">
                      {loan.disbursementDate}
                    </td>
                    <td className="p-3 text-center">
                      <span className="text-[11px] font-medium text-slate-800 block">
                        {loan.disbursementMode.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Tranche {loan.trancheNumber} of {loan.totalTranches}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-2.5 h-2.5 mr-1" />
                        {loan.status}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => setInspectedLoan(loan)}
                        title="View Full Loan Dossier"
                        className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3.5 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
        <div>
          Showing {(currentPage - 1) * pageSize + 1} to{' '}
          {Math.min(currentPage * pageSize, sortedLoans.length)} of {sortedLoans.length} entries
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            Previous
          </button>
          <span className="px-3 py-1 font-semibold text-slate-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            Next
          </button>
        </div>
      </div>

      {/* Row Inspection Modal */}
      {inspectedLoan && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-200 text-slate-800">
            {/* Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Agricultural Loan Dossier - {inspectedLoan.loanAccountNumber}
                  </h3>
                  <p className="text-xs text-slate-400">
                    CBS Audit Record Ref: {inspectedLoan.id} • {inspectedLoan.branchName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectedLoan(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              {/* Farmer Profile */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] font-semibold uppercase text-slate-400 block">
                    Borrower / Farmer Name
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    {inspectedLoan.farmerName}
                  </span>
                  <span className="text-slate-500 block text-[11px]">
                    ID: {inspectedLoan.farmerId} • Ph: {inspectedLoan.phone}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-semibold uppercase text-slate-400 block">
                    Land Holding & Survey #
                  </span>
                  <span className="text-sm font-semibold text-slate-900">
                    {inspectedLoan.landAreaAcres} Acres ({inspectedLoan.landSurveyNumber})
                  </span>
                  <span className="text-slate-500 block text-[11px]">
                    Village: {inspectedLoan.village}, Dist: {inspectedLoan.district}
                  </span>
                </div>
              </div>

              {/* Financial & Disbursement Breakdown */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-lg">
                  <span className="text-[10px] font-semibold uppercase text-emerald-800 block">
                    Disbursed Amount
                  </span>
                  <span className="text-lg font-bold text-emerald-950 font-mono">
                    {formatCurrency(inspectedLoan.disbursedAmount, currencySymbol)}
                  </span>
                  <span className="text-[10px] text-emerald-700 block">
                    Sanction: {formatCurrency(inspectedLoan.sanctionAmount, currencySymbol)}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[10px] font-semibold uppercase text-slate-500 block">
                    Interest & Subvention
                  </span>
                  <span className="text-lg font-bold text-slate-900 font-mono">
                    {inspectedLoan.effectiveInterestRate}% p.a.
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    Gross {inspectedLoan.interestRate}% less {inspectedLoan.subventionRate}% prompt incentive
                  </span>
                </div>

                <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg">
                  <span className="text-[10px] font-semibold uppercase text-amber-800 block">
                    Govt. Subsidy Mapped
                  </span>
                  <span className="text-lg font-bold text-amber-950 font-mono">
                    {formatCurrency(inspectedLoan.subsidyAmount || 0, currencySymbol)}
                  </span>
                  <span className="text-[10px] text-amber-700 block">
                    Credit-linked capital subsidy
                  </span>
                </div>
              </div>

              {/* Technical Details & Banking Verification */}
              <div className="space-y-2 border-t border-slate-200 pt-3">
                <h4 className="font-semibold text-slate-900">
                  CBS Settlement & Field Verification Audit Trail
                </h4>

                <div className="grid grid-cols-2 gap-3 text-slate-600 bg-slate-50/60 p-3 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-slate-400 font-medium">Disbursement Mode:</span>{' '}
                    <span className="text-slate-900 font-semibold">{inspectedLoan.disbursementMode}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Bank UTR Transaction:</span>{' '}
                    <span className="text-slate-900 font-mono font-medium">{inspectedLoan.transactionReference}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Agriculture Field Officer:</span>{' '}
                    <span className="text-slate-900 font-semibold">{inspectedLoan.fieldOfficerName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Inspection Date:</span>{' '}
                    <span className="text-slate-900">{inspectedLoan.fieldOfficerVerificationDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Geotag Coordinates:</span>{' '}
                    <span className="text-emerald-700 font-mono font-medium flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {inspectedLoan.geotagCoordinates}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Collateral Type:</span>{' '}
                    <span className="text-slate-900">{inspectedLoan.collateralType}</span>
                  </div>
                </div>

                {inspectedLoan.remarks && (
                  <div className="p-3 bg-slate-100 rounded-lg text-slate-700 border border-slate-200">
                    <span className="font-semibold text-slate-900 block mb-0.5">Field Inspection Notes:</span>
                    {inspectedLoan.remarks}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setInspectedLoan(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-lg text-xs transition-colors cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
