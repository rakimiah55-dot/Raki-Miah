import React from 'react';
import { 
  X, 
  FileText, 
  Check, 
  Sliders, 
  Download, 
  Building2, 
  UserCheck, 
  ShieldAlert, 
  Eye,
  Sparkles
} from 'lucide-react';
import { ReportSettings } from '../types/report';

interface ReportBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ReportSettings;
  onSaveSettings: (settings: ReportSettings) => void;
  onGeneratePdf: () => void;
  filteredCount: number;
}

export const ReportBuilderModal: React.FC<ReportBuilderModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onGeneratePdf,
  filteredCount,
}) => {
  if (!isOpen) return null;

  const handleChange = <K extends keyof ReportSettings>(key: K, value: ReportSettings[K]) => {
    onSaveSettings({
      ...settings,
      [key]: value,
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden border border-slate-200 text-slate-800">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Agricultural Loan Report Designer
              </h2>
              <p className="text-xs text-slate-400">
                Customize report header, regulatory sections, signatories, and watermark for official PDF export
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
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
          {/* Section 1: Bank Branding & Reference */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center space-x-1.5">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>1. Bank Header & Reference Meta</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bank / Institutional Name
                </label>
                <input
                  type="text"
                  value={settings.bankName}
                  onChange={(e) => handleChange('bankName', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 font-medium focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department / Cell
                </label>
                <input
                  type="text"
                  value={settings.departmentName}
                  onChange={(e) => handleChange('departmentName', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Report Title
                </label>
                <input
                  type="text"
                  value={settings.reportTitle}
                  onChange={(e) => handleChange('reportTitle', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 font-semibold focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  CBS Audit Reference ID
                </label>
                <input
                  type="text"
                  value={settings.reportRefNumber}
                  onChange={(e) => handleChange('reportRefNumber', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fiscal Year & Currency Symbol
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={settings.fiscalYear}
                    onChange={(e) => handleChange('fiscalYear', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    placeholder="2025-26"
                  />
                  <select
                    value={settings.currencySymbol}
                    onChange={(e) => handleChange('currencySymbol', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="₹">₹ (Indian Rupee INR)</option>
                    <option value="$">$ (US Dollar USD)</option>
                    <option value="€">€ (Euro EUR)</option>
                    <option value="£">£ (British Pound GBP)</option>
                    <option value="₱">₱ (Philippine Peso PHP)</option>
                    <option value="KSh">KSh (Kenyan Shilling)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bank Tagline / Slogan
                </label>
                <input
                  type="text"
                  value={settings.bankTagline}
                  onChange={(e) => handleChange('bankTagline', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Report Content Modules Toggles */}
          <div className="border-t border-slate-200 pt-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center space-x-1.5">
              <Sliders className="w-4 h-4 text-emerald-600" />
              <span>2. Report Sections & Inclusions</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  key: 'includeExecutiveSummary',
                  label: 'Executive Summary & Narrative',
                  desc: 'Comprehensive narrative of lending realization and PSL alignment',
                },
                {
                  key: 'includeKpiMetrics',
                  label: 'Executive KPI Metric Boxes',
                  desc: 'Top 4 KPI cards: Total Disbursed, Sanctioned, PSL ratio, Subsidies',
                },
                {
                  key: 'includeSchemeBreakdown',
                  label: 'Loan Scheme Distribution Table',
                  desc: 'Breakdown of KCC, AIF, Farm Mechanization, Dairy, Solar Pump',
                },
                {
                  key: 'includeCategoryBreakdown',
                  label: 'Farmer Category Classification (PSL)',
                  desc: 'Statutory breakdown of Small & Marginal vs Medium and Large farmers',
                },
                {
                  key: 'includeDetailedTable',
                  label: 'Full Disbursement Ledger Table',
                  desc: 'Multi-page account-level ledger with borrower names, UTR, dates',
                },
                {
                  key: 'includeAuditSignoff',
                  label: 'Audit Sign-off & Signature Blocks',
                  desc: 'Endorsement blocks for Field Officer, Branch Manager, and Auditor',
                },
              ].map((item) => {
                const checked = Boolean(settings[item.key as keyof ReportSettings]);
                return (
                  <label
                    key={item.key}
                    className={`flex items-start space-x-3 p-3 rounded-xl border transition-all cursor-pointer ${
                      checked
                        ? 'bg-emerald-50/40 border-emerald-300 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 opacity-70'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) =>
                        handleChange(item.key as keyof ReportSettings, e.target.checked as never)
                      }
                      className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                    />
                    <div>
                      <span className="font-semibold text-slate-900 block">{item.label}</span>
                      <span className="text-[11px] text-slate-500 block leading-tight">{item.desc}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Section 3: Watermark & Security */}
          <div className="border-t border-slate-200 pt-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center space-x-1.5">
              <ShieldAlert className="w-4 h-4 text-emerald-600" />
              <span>3. Security Watermark & Classification</span>
            </h3>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <label className="flex items-center space-x-2 shrink-0 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.includeWatermark}
                  onChange={(e) => handleChange('includeWatermark', e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
                <span className="font-semibold text-slate-800">Print Watermark Stamp</span>
              </label>

              <input
                type="text"
                disabled={!settings.includeWatermark}
                value={settings.watermarkText}
                onChange={(e) => handleChange('watermarkText', e.target.value)}
                placeholder="e.g. CONFIDENTIAL - BANK AUDIT"
                className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 uppercase font-mono disabled:opacity-40 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Section 4: Authorized Signatories */}
          <div className="border-t border-slate-200 pt-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center space-x-1.5">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>4. Signatories & Verification Officers</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Field Officer */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">
                  Field Officer (AFO)
                </span>
                <input
                  type="text"
                  value={settings.fieldOfficerName}
                  onChange={(e) => handleChange('fieldOfficerName', e.target.value)}
                  placeholder="Officer Name"
                  className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs text-slate-900"
                />
                <input
                  type="text"
                  value={settings.fieldOfficerDesignation}
                  onChange={(e) => handleChange('fieldOfficerDesignation', e.target.value)}
                  placeholder="Designation"
                  className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1 text-[11px] text-slate-600"
                />
              </div>

              {/* Branch Manager */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">
                  Branch Manager (BM)
                </span>
                <input
                  type="text"
                  value={settings.branchManagerName}
                  onChange={(e) => handleChange('branchManagerName', e.target.value)}
                  placeholder="Manager Name"
                  className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs text-slate-900"
                />
                <input
                  type="text"
                  value={settings.branchManagerDesignation}
                  onChange={(e) => handleChange('branchManagerDesignation', e.target.value)}
                  placeholder="Designation"
                  className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1 text-[11px] text-slate-600"
                />
              </div>

              {/* Auditor */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">
                  Concurrent Auditor
                </span>
                <input
                  type="text"
                  value={settings.auditorName}
                  onChange={(e) => handleChange('auditorName', e.target.value)}
                  placeholder="Auditor Name"
                  className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs text-slate-900"
                />
                <input
                  type="text"
                  value={settings.auditorDesignation}
                  onChange={(e) => handleChange('auditorDesignation', e.target.value)}
                  placeholder="Designation"
                  className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1 text-[11px] text-slate-600"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Custom Executive Memo */}
          <div className="border-t border-slate-200 pt-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Branch Executive Note (Optional)
            </h3>
            <textarea
              rows={2}
              value={settings.customNotes || ''}
              onChange={(e) => handleChange('customNotes', e.target.value)}
              placeholder="e.g. All Kharif season DBT transfers executed as per NABARD scale of finance guidelines; no loan escrow pending audit."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 transition-colors"
          >
            Close
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onGeneratePdf();
            }}
            className="px-5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-colors flex items-center space-x-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Apply & Generate Official PDF ({filteredCount} loans)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
