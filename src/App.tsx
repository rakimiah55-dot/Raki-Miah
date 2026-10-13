/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { FilterToolbar } from './components/FilterToolbar';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { DisbursementTable } from './components/DisbursementTable';
import { DatabaseConnectorModal } from './components/DatabaseConnectorModal';
import { ReportBuilderModal } from './components/ReportBuilderModal';
import { ReportPreviewModal } from './components/ReportPreviewModal';
import { AIAssistantMemo } from './components/AIAssistantMemo';
import { 
  AgriLoanDisbursement, 
  BankBranch 
} from './types/loan';
import { BankingDatabaseConfig } from './types/database';
import { ReportFilterState, ReportSettings } from './types/report';
import { 
  loadBankingLoans, 
  saveBankingLoans, 
  loadBankingConfig, 
  saveBankingConfig, 
  resetBankingDatabase, 
  simulateCbsSync 
} from './data/mockBankingDatabase';
import { 
  generateAgricultureDisbursementPdf, 
  PdfGenerationResult 
} from './services/pdfReportGenerator';
import { exportLoansToCsv } from './services/csvExport';
import { 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Sparkles, 
  Download, 
  Layers, 
  ShieldCheck, 
  Calendar,
  FileCheck
} from 'lucide-react';

export default function App() {
  // Database & Loans State
  const [loans, setLoans] = useState<AgriLoanDisbursement[]>(() => loadBankingLoans());
  const [dbConfig, setDbConfig] = useState<BankingDatabaseConfig>(() => loadBankingConfig());
  const [isSyncing, setIsSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Filters State
  const [filters, setFilters] = useState<ReportFilterState>({
    dateRange: { from: '', to: '' },
    quickPreset: 'ALL',
    branchCode: 'ALL',
    loanScheme: 'ALL',
    farmerCategory: 'ALL',
    cropSeason: 'ALL',
    status: 'ALL',
    disbursementMode: 'ALL',
    searchQuery: '',
  });

  // Selected loans for selective report export
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Report Settings State
  const [reportSettings, setReportSettings] = useState<ReportSettings>({
    bankName: 'National Agricultural & Rural Development Bank',
    bankTagline: 'Priority Sector Lending & Rural Financial Inclusion Directorate',
    departmentName: 'Department of Agricultural Credit & Microfinance',
    reportTitle: 'Agriculture Loan Disbursement Audit Report',
    reportRefNumber: `NABR-AGRI-DISB-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    fiscalYear: '2025-2026',
    currencySymbol: '₹',
    currencyCode: 'INR',
    includeExecutiveSummary: true,
    includeKpiMetrics: true,
    includeSchemeBreakdown: true,
    includeCategoryBreakdown: true,
    includeDetailedTable: true,
    includeSubsidySection: true,
    includeAuditSignoff: true,
    includeWatermark: true,
    watermarkText: 'CONFIDENTIAL - CBS AUDIT COPY',
    fieldOfficerName: 'Pradeep Joshi, AFO',
    fieldOfficerDesignation: 'Agricultural Field Officer (Senior Scale)',
    branchManagerName: 'Sunil R. Deshmukh',
    branchManagerDesignation: 'Assistant General Manager & Branch Head',
    auditorName: 'K. S. Ramanujam, FCA',
    auditorDesignation: 'Concurrent Bank Auditor',
    customNotes: 'All disbursements verified against Aadhaar DBT and field geotagging records.',
    visibleColumns: [
      'loanAccountNumber',
      'farmerName',
      'farmerCategory',
      'branchName',
      'cropOrActivity',
      'landAreaAcres',
      'disbursedAmount',
      'disbursementDate',
      'disbursementMode',
      'status',
    ],
  });

  // Modals state
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [isReportBuilderOpen, setIsReportBuilderOpen] = useState(false);
  const [isAiMemoOpen, setIsAiMemoOpen] = useState(false);
  const [pdfResult, setPdfResult] = useState<PdfGenerationResult | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // Active View Tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'ledger'>('dashboard');

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Sync with Core Banking Database
  const handleSyncDatabase = async () => {
    setIsSyncing(true);
    try {
      const result = await simulateCbsSync(loans);
      setLoans(loadBankingLoans());
      setDbConfig((prev) => {
        const updated = {
          ...prev,
          lastSyncTimestamp: new Date().toISOString(),
          totalRecordsInDb: result.recordsCount,
          status: 'CONNECTED' as const,
        };
        saveBankingConfig(updated);
        return updated;
      });
      showToast(result.message, 'success');
    } catch {
      showToast('Error syncing with CBS database replica.', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Filter Loans
  const filteredLoans = useMemo(() => {
    return loans.filter((loan) => {
      // Search query
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase();
        const matchesName = loan.farmerName.toLowerCase().includes(query);
        const matchesAccount = loan.loanAccountNumber.includes(query);
        const matchesVillage = loan.village.toLowerCase().includes(query);
        const matchesDistrict = loan.district.toLowerCase().includes(query);
        const matchesId = loan.id.toLowerCase().includes(query);
        const matchesCrop = loan.cropOrActivity.toLowerCase().includes(query);
        const matchesSurvey = loan.landSurveyNumber.toLowerCase().includes(query);

        if (!matchesName && !matchesAccount && !matchesVillage && !matchesDistrict && !matchesId && !matchesCrop && !matchesSurvey) {
          return false;
        }
      }

      // Branch filter
      if (filters.branchCode !== 'ALL' && loan.branchCode !== filters.branchCode) {
        return false;
      }

      // Scheme filter
      if (filters.loanScheme !== 'ALL' && loan.loanScheme !== filters.loanScheme) {
        return false;
      }

      // Farmer category filter
      if (filters.farmerCategory !== 'ALL' && loan.farmerCategory !== filters.farmerCategory) {
        return false;
      }

      // Season filter
      if (filters.cropSeason !== 'ALL' && loan.cropSeason !== filters.cropSeason) {
        return false;
      }

      // Disbursement mode filter
      if (filters.disbursementMode !== 'ALL' && loan.disbursementMode !== filters.disbursementMode) {
        return false;
      }

      // Date range filter
      if (filters.dateRange.from && loan.disbursementDate < filters.dateRange.from) {
        return false;
      }
      if (filters.dateRange.to && loan.disbursementDate > filters.dateRange.to) {
        return false;
      }

      return true;
    });
  }, [loans, filters]);

  // Target loans for report: selected subset if any, else all filtered
  const targetReportLoans = useMemo(() => {
    if (selectedIds.length > 0) {
      return filteredLoans.filter((l) => selectedIds.includes(l.id));
    }
    return filteredLoans;
  }, [filteredLoans, selectedIds]);

  // Generate PDF and open preview
  const handleGeneratePdf = () => {
    if (targetReportLoans.length === 0) {
      showToast('No loan records match criteria to generate a report.', 'error');
      return;
    }

    try {
      const result = generateAgricultureDisbursementPdf(targetReportLoans, reportSettings);
      setPdfResult(result);
      setIsPreviewModalOpen(true);
      showToast(`Generated official PDF with ${targetReportLoans.length} disbursement records.`, 'success');
    } catch (err) {
      console.error('Error generating PDF:', err);
      showToast('Failed to compile PDF report. Please verify report options.', 'error');
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    if (targetReportLoans.length === 0) {
      showToast('No loan records to export.', 'error');
      return;
    }
    exportLoansToCsv(targetReportLoans, `agri_disbursement_${reportSettings.reportRefNumber}.csv`);
    showToast(`Exported ${targetReportLoans.length} records to CSV.`, 'success');
  };

  // Selection handlers
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredLoans.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredLoans.map((l) => l.id));
    }
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans antialiased">
      {/* Top Banking Navbar */}
      <Navbar
        dbConfig={dbConfig}
        isSyncing={isSyncing}
        onSync={handleSyncDatabase}
        onOpenDbModal={() => setIsDbModalOpen(true)}
        onOpenReportBuilder={() => setIsReportBuilderOpen(true)}
        onGenerateQuickPdf={handleGeneratePdf}
        onOpenAiMemo={() => setIsAiMemoOpen(true)}
        activeCount={targetReportLoans.length}
      />

      {/* Filter and Query Toolbar */}
      <FilterToolbar
        filter={filters}
        onFilterChange={setFilters}
        totalLoansCount={loans.length}
        filteredLoansCount={filteredLoans.length}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Banner with Banking Compliance & Quick Action Strip */}
        <div className="bg-gradient-to-r from-emerald-900 to-slate-900 rounded-2xl p-5 sm:p-6 text-white shadow-md border border-emerald-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                FY {reportSettings.fiscalYear} DISBURSEMENT CYCLE
              </span>
              <span className="text-slate-400 text-xs hidden sm:inline">•</span>
              <span className="text-xs text-slate-300 hidden sm:inline">
                {reportSettings.bankName}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Agriculture Loan Disbursement Report Generator
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl">
              Live Core Banking System integration with automated Priority Sector Lending (PSL) compliance calculation, DBT subsidy tracking, and multi-page audit PDF publishing.
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {/* View Switcher Tabs */}
            <div className="bg-slate-800/80 p-1 rounded-xl border border-slate-700 flex items-center space-x-1">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Analytics View
              </button>
              <button
                onClick={() => setActiveTab('ledger')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'ledger'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Ledger Table ({filteredLoans.length})
              </button>
            </div>

            {/* Quick Export PDF */}
            <button
              onClick={handleGeneratePdf}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-1.5 cursor-pointer active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Export PDF</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Executive Dashboard & Analytics */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <ExecutiveDashboard
              loans={targetReportLoans}
              currencySymbol={reportSettings.currencySymbol}
            />

            {/* In-Dashboard Quick Ledger Summary */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-800">
                  Recent Disbursed Tranches ({targetReportLoans.length} Loans)
                </h3>
                <button
                  onClick={() => setActiveTab('ledger')}
                  className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer"
                >
                  View Full Interactive Table &rarr;
                </button>
              </div>

              <DisbursementTable
                loans={targetReportLoans}
                currencySymbol={reportSettings.currencySymbol}
                selectedIds={selectedIds}
                onToggleSelect={handleToggleSelect}
                onSelectAll={handleSelectAll}
                onClearSelection={handleClearSelection}
                onExportCsv={handleExportCsv}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Full Detailed Ledger Table */}
        {activeTab === 'ledger' && (
          <div className="space-y-6">
            <DisbursementTable
              loans={targetReportLoans}
              currencySymbol={reportSettings.currencySymbol}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onSelectAll={handleSelectAll}
              onClearSelection={handleClearSelection}
              onExportCsv={handleExportCsv}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-xs py-5 mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-300">
              AgriLoan Pulse CBS v4.2
            </span>
            <span>•</span>
            <span>Core Banking Agri Credit Report Generator</span>
          </div>

          <div className="text-[11px] text-slate-500">
            Encrypted Database Session • ISO 27001 / RBI Cyber Security Framework Compliant
          </div>
        </div>
      </footer>

      {/* Database Connector Modal */}
      <DatabaseConnectorModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
        config={dbConfig}
        onSaveConfig={(newConfig) => {
          setDbConfig(newConfig);
          saveBankingConfig(newConfig);
          showToast('Updated Banking Database connection parameters.', 'success');
        }}
        onAddLoan={(newLoan) => {
          const updated = [newLoan, ...loans];
          setLoans(updated);
          saveBankingLoans(updated);
          showToast(`Loan account ${newLoan.loanAccountNumber} inserted into CBS database.`, 'success');
        }}
        onResetDatabase={() => {
          const reset = resetBankingDatabase();
          setLoans(reset);
          showToast('Banking database reset to default demo records.', 'info');
        }}
        onImportLoans={(imported) => {
          setLoans(imported);
          saveBankingLoans(imported);
          showToast(`Imported ${imported.length} loan records.`, 'success');
        }}
        allLoans={loans}
      />

      {/* Report Builder Modal */}
      <ReportBuilderModal
        isOpen={isReportBuilderOpen}
        onClose={() => setIsReportBuilderOpen(false)}
        settings={reportSettings}
        onSaveSettings={setReportSettings}
        onGeneratePdf={handleGeneratePdf}
        filteredCount={targetReportLoans.length}
      />

      {/* Report Preview & Print Modal */}
      <ReportPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        pdfResult={pdfResult}
        onExportCsv={handleExportCsv}
      />

      {/* AI Assistant Memo Modal */}
      <AIAssistantMemo
        isOpen={isAiMemoOpen}
        onClose={() => setIsAiMemoOpen(false)}
        loans={targetReportLoans}
        currencySymbol={reportSettings.currencySymbol}
        onApplyMemoToReport={(memoText) => {
          setReportSettings((prev) => ({
            ...prev,
            customNotes: memoText,
          }));
          showToast('Appended executive memorandum to PDF notes.', 'success');
        }}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-bounce-in">
          <div
            className={`px-4 py-2.5 rounded-xl shadow-lg border flex items-center space-x-2 text-xs font-semibold ${
              toastMessage.type === 'success'
                ? 'bg-slate-900 border-emerald-500 text-white'
                : toastMessage.type === 'error'
                ? 'bg-rose-950 border-rose-600 text-white'
                : 'bg-slate-900 border-sky-500 text-white'
            }`}
          >
            {toastMessage.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />}
            {toastMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
            {toastMessage.type === 'info' && <Info className="w-4 h-4 text-sky-400 shrink-0" />}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}
    </div>
  );
}
