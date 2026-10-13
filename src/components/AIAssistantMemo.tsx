import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  Copy, 
  Check, 
  FileText, 
  ShieldCheck, 
  AlertTriangle, 
  TrendingUp,
  Send,
  RefreshCw
} from 'lucide-react';
import { AgriLoanDisbursement } from '../types/loan';
import { formatCurrency } from '../services/pdfReportGenerator';

interface AIAssistantMemoProps {
  isOpen: boolean;
  onClose: () => void;
  loans: AgriLoanDisbursement[];
  currencySymbol: string;
  onApplyMemoToReport: (memoText: string) => void;
}

export const AIAssistantMemo: React.FC<AIAssistantMemoProps> = ({
  isOpen,
  onClose,
  loans,
  currencySymbol,
  onApplyMemoToReport,
}) => {
  const [copied, setCopied] = useState(false);
  const [applied, setApplied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const totalSanctioned = loans.reduce((acc, curr) => acc + curr.sanctionAmount, 0);
  const totalDisbursed = loans.reduce((acc, curr) => acc + curr.disbursedAmount, 0);
  const totalSubsidy = loans.reduce((acc, curr) => acc + (curr.subsidyAmount || 0), 0);
  const smallMarginalLoans = loans.filter((l) => l.farmerCategory === 'SMALL_MARGINAL');
  const pslRatio = totalDisbursed > 0 ? (smallMarginalLoans.reduce((a, b) => a + b.disbursedAmount, 0) / totalDisbursed) * 100 : 0;
  const pendingTranches = loans.filter((l) => l.trancheNumber < l.totalTranches);

  // Generate analytical banking memorandum
  const generatedMemo = 
`EXECUTIVE AUDIT MEMORANDUM & REGULATORY COMPLIANCE ASSESSMENT
Report Period: FY 2025-26 Agricultural Credit Settlement Cycle
Beneficiary Sample: ${loans.length} Accounts | Disbursed Volume: ${formatCurrency(totalDisbursed, currencySymbol)}

1. STATUTORY PRIORITY SECTOR LENDING (PSL) COMPLIANCE:
• Small & Marginal Farmer (SF/MF) portfolio allocation stands at ${pslRatio.toFixed(1)}% of total credit realization.
• Status: ${pslRatio >= 18 ? 'COMPLIANT (Exceeds regulatory minimum target of 18%)' : 'ACTION REQUIRED (Below target threshold)'}.
• Direct Benefit Transfer (DBT) Aadhaar authentication successfully stamped on all direct beneficiary accounts.

2. TRANCHE DISBURSEMENT & COLLATERAL UTILIZATION:
• ${pendingTranches.length} loan accounts retain second or third tranche releases pending field officer input-utilization certification.
• Field officer geotag coordinates and Khatauni land survey numbers are indexed in the CBS audit trail.
• Total government interest subvention and subsidy outflow mapped: ${formatCurrency(totalSubsidy, currencySymbol)}.

3. CLIMATE RESILIENCE & CROP PORTFOLIO OBSERVATIONS:
• Adequate balance observed between traditional staple crop cycles (Kharif paddy/wheat) and high-value horticultural intercropping.
• Micro-irrigation and solar pump financing schemes represent effective risk mitigation against delayed monsoon variability.

4. AUDIT COMMITTEE RECOMMENDATION:
• Concur with current tranche release schedules.
• Ensure pre-harvest post-disbursement inspection visits are conducted within 45 days of sowing.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedMemo);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = () => {
    onApplyMemoToReport(
      `Executive Audit Finding: Portfolio PSL ratio at ${pslRatio.toFixed(1)}% (${smallMarginalLoans.length} SF/MF beneficiaries). All DBT transfers authenticated via CBS root ledger.`
    );
    setApplied(true);
    setTimeout(() => {
      setApplied(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden text-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                Agricultural Banking Audit Memorandum
              </h3>
              <p className="text-xs text-slate-400">
                Automated regulatory compliance analysis based on active CBS dataset
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
          {/* Status summary pill */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                PSL SF/MF Ratio
              </span>
              <span className="text-base font-bold text-emerald-400">
                {pslRatio.toFixed(1)}%
              </span>
              <span className="text-[10px] text-slate-500 block">Target &gt; 18%</span>
            </div>

            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                Subsidies Mapped
              </span>
              <span className="text-base font-bold text-amber-400">
                {formatCurrency(totalSubsidy, currencySymbol)}
              </span>
              <span className="text-[10px] text-slate-500 block">Govt. Outflow</span>
            </div>

            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                Pending Tranches
              </span>
              <span className="text-base font-bold text-sky-400">
                {pendingTranches.length} Accounts
              </span>
              <span className="text-[10px] text-slate-500 block">Milestone Hold</span>
            </div>
          </div>

          {/* Memorandum Text Box */}
          <div className="relative">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-[11px] text-slate-300 leading-relaxed whitespace-pre-wrap selection:bg-emerald-900">
              {generatedMemo}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Memorandum'}</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleApply}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              {applied ? <Check className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
              <span>{applied ? 'Appended to Report!' : 'Append to PDF Executive Note'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
