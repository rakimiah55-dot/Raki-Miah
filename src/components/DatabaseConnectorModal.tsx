import React, { useState } from 'react';
import { 
  X, 
  Database, 
  Server, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Lock, 
  HardDrive, 
  PlusCircle, 
  Download, 
  Upload, 
  RotateCcw,
  Zap,
  Check
} from 'lucide-react';
import { BankingDatabaseConfig, DatabaseEngine } from '../types/database';
import { AgriLoanDisbursement, FarmerCategory, LoanScheme, CropSeason, DisbursementMode } from '../types/loan';
import { DEFAULT_BRANCHES } from '../data/mockBankingDatabase';

interface DatabaseConnectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: BankingDatabaseConfig;
  onSaveConfig: (newConfig: BankingDatabaseConfig) => void;
  onAddLoan: (loan: AgriLoanDisbursement) => void;
  onResetDatabase: () => void;
  onImportLoans: (loans: AgriLoanDisbursement[]) => void;
  allLoans: AgriLoanDisbursement[];
}

export const DatabaseConnectorModal: React.FC<DatabaseConnectorModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  onAddLoan,
  onResetDatabase,
  onImportLoans,
  allLoans,
}) => {
  const [activeTab, setActiveTab] = useState<'connection' | 'new_loan' | 'data_backup'>('connection');
  const [formData, setFormData] = useState<BankingDatabaseConfig>({ ...config });
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latency?: number } | null>(null);

  // New loan form state
  const [newLoan, setNewLoan] = useState({
    farmerName: '',
    farmerId: `FMR-NEW-${Math.floor(10000 + Math.random() * 90000)}`,
    loanAccountNumber: `60481920${Math.floor(5000 + Math.random() * 4000)}`,
    farmerCategory: 'SMALL_MARGINAL' as FarmerCategory,
    phone: '+91 98' + Math.floor(10000000 + Math.random() * 90000000),
    village: 'Baramati Rural',
    district: 'Pune',
    state: 'Maharashtra',
    branchCode: 'BR-401',
    loanScheme: 'KCC_CROP_LOAN' as LoanScheme,
    cropOrActivity: 'Sugarcane & Drip Irrigation',
    cropSeason: 'KHARIF' as CropSeason,
    landAreaAcres: 2.5,
    landSurveyNumber: 'SURV-88/1',
    sanctionAmount: 175000,
    disbursedAmount: 175000,
    disbursementDate: new Date().toISOString().split('T')[0],
    disbursementMode: 'DBT_AADHAAR' as DisbursementMode,
    interestRate: 7.0,
    subventionRate: 3.0,
    fieldOfficerName: 'Pradeep Joshi, AFO',
    remarks: 'Field inspected & verified with satellite crop health report.',
  });

  const [addSuccessMessage, setAddSuccessMessage] = useState(false);

  if (!isOpen) return null;

  const handleTestConnection = () => {
    setIsTesting(true);
    setTestResult(null);

    setTimeout(() => {
      setIsTesting(false);
      const simulatedLatency = Math.floor(12 + Math.random() * 15);
      setTestResult({
        success: true,
        message: `Successfully connected to ${formData.databaseName} at ${formData.host}:${formData.port} (${formData.engine}). SSL Handshake Verified. 64 records queried in schema '${formData.schema}'.`,
        latency: simulatedLatency,
      });
      setFormData((prev) => ({
        ...prev,
        status: 'CONNECTED',
        latencyMs: simulatedLatency,
        lastSyncTimestamp: new Date().toISOString(),
      }));
    }, 700);
  };

  const handleSaveConnection = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(formData);
    onClose();
  };

  const handleCreateLoanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLoan.farmerName) return;

    const selectedBranch = DEFAULT_BRANCHES.find((b) => b.code === newLoan.branchCode) || DEFAULT_BRANCHES[0];

    const record: AgriLoanDisbursement = {
      id: `AGR-2026-0${allLoans.length + 1}`,
      loanAccountNumber: newLoan.loanAccountNumber,
      farmerName: newLoan.farmerName,
      farmerId: newLoan.farmerId,
      farmerCategory: newLoan.farmerCategory,
      phone: newLoan.phone,
      village: newLoan.village,
      district: newLoan.district,
      state: newLoan.state,
      branchName: selectedBranch.name,
      branchCode: selectedBranch.code,
      loanScheme: newLoan.loanScheme,
      cropOrActivity: newLoan.cropOrActivity,
      cropSeason: newLoan.cropSeason,
      landAreaAcres: Number(newLoan.landAreaAcres),
      landSurveyNumber: newLoan.landSurveyNumber,
      sanctionAmount: Number(newLoan.sanctionAmount),
      disbursedAmount: Number(newLoan.disbursedAmount),
      disbursementDate: newLoan.disbursementDate,
      disbursementMode: newLoan.disbursementMode,
      transactionReference: `UTR-RBI-${Date.now().toString().slice(-10)}`,
      trancheNumber: 1,
      totalTranches: 1,
      interestRate: Number(newLoan.interestRate),
      subventionRate: Number(newLoan.subventionRate),
      effectiveInterestRate: Number(newLoan.interestRate) - Number(newLoan.subventionRate),
      status: 'DISBURSED',
      fieldOfficerName: newLoan.fieldOfficerName,
      fieldOfficerVerificationDate: newLoan.disbursementDate,
      geotagCoordinates: '19.9975° N, 73.7898° E',
      collateralType: 'HYPOTHECATION_CROPS',
      subsidyAmount: Math.round(Number(newLoan.disbursedAmount) * (Number(newLoan.subventionRate) / 100)),
      remarks: newLoan.remarks,
      syncTimestamp: new Date().toISOString(),
    };

    onAddLoan(record);
    setAddSuccessMessage(true);
    setTimeout(() => {
      setAddSuccessMessage(false);
      onClose();
    }, 1200);
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(allLoans, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `cbs_agri_loans_export_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed)) {
            onImportLoans(parsed);
            alert(`Imported ${parsed.length} loan records from CBS export file.`);
            onClose();
          }
        } catch {
          alert('Invalid JSON file format. Please upload valid exported disbursement data.');
        }
      };
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden text-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">
                Core Banking Database (CBS) Connector
              </h2>
              <p className="text-xs text-slate-400">
                Configure live replica connection, execute test ping, or inject disbursement tranches
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-6">
          <button
            onClick={() => setActiveTab('connection')}
            className={`py-3 px-4 text-xs font-medium border-b-2 transition-colors cursor-pointer flex items-center space-x-2 ${
              activeTab === 'connection'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>CBS Connection Parameters</span>
          </button>
          <button
            onClick={() => setActiveTab('new_loan')}
            className={`py-3 px-4 text-xs font-medium border-b-2 transition-colors cursor-pointer flex items-center space-x-2 ${
              activeTab === 'new_loan'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Single Loan Record</span>
          </button>
          <button
            onClick={() => setActiveTab('data_backup')}
            className={`py-3 px-4 text-xs font-medium border-b-2 transition-colors cursor-pointer flex items-center space-x-2 ${
              activeTab === 'data_backup'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>Batch Data & Backup ({allLoans.length} Loans)</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {activeTab === 'connection' && (
            <form onSubmit={handleSaveConnection} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Engine */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Banking Engine / Protocol
                  </label>
                  <select
                    value={formData.engine}
                    onChange={(e) => setFormData({ ...formData, engine: e.target.value as DatabaseEngine })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="FINACLE_CBS">Infosys Finacle CBS (Agri Credit 11.x)</option>
                    <option value="ORACLE_FLEXCUBE">Oracle FLEXCUBE Universal Banking</option>
                    <option value="TEMENOS_TRANSACT">Temenos Transact (Rural Credit Core)</option>
                    <option value="POSTGRESQL_CBS">PostgreSQL / Cloud SQL CBS Replica</option>
                    <option value="REST_API_GATEWAY">CBS Enterprise REST API Gateway</option>
                    <option value="CUSTOM_ODBC">Custom Banking ODBC / JDBC Pool</option>
                  </select>
                </div>

                {/* Host */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Database Host / Endpoint
                  </label>
                  <input
                    type="text"
                    value={formData.host}
                    onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder="e.g. cbs-prod-agri-db01.banking-core.internal"
                  />
                </div>

                {/* Port */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Port
                  </label>
                  <input
                    type="number"
                    value={formData.port}
                    onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {/* Database Name */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Database Name / SID
                  </label>
                  <input
                    type="text"
                    value={formData.databaseName}
                    onChange={(e) => setFormData({ ...formData, databaseName: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {/* Schema */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Agri Credit Schema
                  </label>
                  <input
                    type="text"
                    value={formData.schema}
                    onChange={(e) => setFormData({ ...formData, schema: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {/* Read-Only Username */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Service Account User (Read-Only)
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Security & SSL Settings */}
              <div className="flex items-center justify-between p-3 bg-slate-800/60 rounded-lg border border-slate-700/60">
                <div className="flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="text-xs font-medium text-slate-200">Enforce TLS/SSL v1.3 Encryption</span>
                    <p className="text-[11px] text-slate-400">Strict mutual TLS authentication with bank CA root certificates</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.useSsl}
                  onChange={(e) => setFormData({ ...formData, useSsl: e.target.checked })}
                  className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-400 h-4 w-4"
                />
              </div>

              {/* Custom Filter SQL */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Active CBS Extraction Query / View
                </label>
                <textarea
                  rows={2}
                  value={formData.customFilterSql || ''}
                  onChange={(e) => setFormData({ ...formData, customFilterSql: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-emerald-400 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="SELECT * FROM cbs_credit_agri.disbursement_ledger..."
                />
              </div>

              {/* Test Results Banner */}
              {testResult && (
                <div
                  className={`p-3 rounded-lg border flex items-start space-x-2 text-xs ${
                    testResult.success
                      ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
                      : 'bg-rose-950/40 border-rose-800 text-rose-200'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                  )}
                  <div>
                    <p className="font-semibold">{testResult.success ? 'Connection Validated' : 'Connection Error'}</p>
                    <p className="text-[11px] opacity-90">{testResult.message}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="px-3.5 py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin text-emerald-400' : ''}`} />
                  <span>{isTesting ? 'Pinging Core Banking DB...' : 'Test Connection'}</span>
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                  >
                    Save & Use Connection
                  </button>
                </div>
              </div>
            </form>
          )}

          {activeTab === 'new_loan' && (
            <form onSubmit={handleCreateLoanSubmit} className="space-y-4">
              <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-lg p-3 text-xs text-emerald-300 flex items-center space-x-2">
                <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Simulate entering an approved agri loan disbursement tranche into the core banking database.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Farmer / Borrower Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newLoan.farmerName}
                    onChange={(e) => setNewLoan({ ...newLoan, farmerName: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder="e.g. Balasaheb Thorat"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Farmer Category
                  </label>
                  <select
                    value={newLoan.farmerCategory}
                    onChange={(e) => setNewLoan({ ...newLoan, farmerCategory: e.target.value as FarmerCategory })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="SMALL_MARGINAL">Small & Marginal Farmer (&lt; 2 Hectares / 5 Acres)</option>
                    <option value="MEDIUM">Medium Farmer (5 - 10 Acres)</option>
                    <option value="LARGE">Large Commercial Farmer (&gt; 10 Acres)</option>
                    <option value="WOMEN_SHG">Women Agri-SHG / Joint Liability Group</option>
                    <option value="TENANT_FARMER">Tenant Farmer / Sharecropper</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Servicing Branch
                  </label>
                  <select
                    value={newLoan.branchCode}
                    onChange={(e) => setNewLoan({ ...newLoan, branchCode: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    {DEFAULT_BRANCHES.map((b) => (
                      <option key={b.code} value={b.code}>
                        {b.name} ({b.district})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Loan Scheme / Product
                  </label>
                  <select
                    value={newLoan.loanScheme}
                    onChange={(e) => setNewLoan({ ...newLoan, loanScheme: e.target.value as LoanScheme })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="KCC_CROP_LOAN">KCC Crop Loan (Kisan Credit Card)</option>
                    <option value="AGRI_INFRA_FUND">Agri Infrastructure Fund (AIF)</option>
                    <option value="FARM_MECHANIZATION">Farm Mechanization (Tractor & Implements)</option>
                    <option value="DAIRY_ALLIED">Dairy & Livestock Allied Activities</option>
                    <option value="SOLAR_PUMP_KUSUM">PM-KUSUM Solar Irrigation Pump</option>
                    <option value="MICRO_IRRIGATION">PMKSY Micro-Irrigation & Drip</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Crop / Financed Purpose
                  </label>
                  <input
                    type="text"
                    value={newLoan.cropOrActivity}
                    onChange={(e) => setNewLoan({ ...newLoan, cropOrActivity: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Crop Season
                  </label>
                  <select
                    value={newLoan.cropSeason}
                    onChange={(e) => setNewLoan({ ...newLoan, cropSeason: e.target.value as CropSeason })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="KHARIF">Kharif (Monsoon Sowing)</option>
                    <option value="RABI">Rabi (Winter Sowing)</option>
                    <option value="ZAID">Zaid (Summer Short Season)</option>
                    <option value="ANNUAL">Perennial / Annual Commercial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Disbursed Amount (₹ / Currency)
                  </label>
                  <input
                    type="number"
                    value={newLoan.disbursedAmount}
                    onChange={(e) =>
                      setNewLoan({
                        ...newLoan,
                        disbursedAmount: Number(e.target.value),
                        sanctionAmount: Number(e.target.value),
                      })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Land Holding (Acres)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newLoan.landAreaAcres}
                    onChange={(e) => setNewLoan({ ...newLoan, landAreaAcres: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {addSuccessMessage && (
                <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-lg text-emerald-200 text-xs flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Disbursement ledger entry created and committed to Core Banking DB!</span>
                </div>
              )}

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center space-x-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Insert into CBS Ledger</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === 'data_backup' && (
            <div className="space-y-5">
              <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/60">
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-1">
                  Current Database Volume
                </h3>
                <p className="text-sm font-medium text-emerald-400">
                  {allLoans.length} Verified Agriculture Loan Accounts in Local CBS Cache
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  All modifications, new disbursement tranches, and synced records are securely stored and integrated.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Export Data */}
                <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center space-x-2 text-slate-200 text-xs font-semibold mb-1">
                      <Download className="w-4 h-4 text-emerald-400" />
                      <span>Export JSON Snapshot</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Download current agriculture loan ledger as a structured JSON file for backup or auditing.
                    </p>
                  </div>
                  <button
                    onClick={handleExportJson}
                    className="mt-4 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-medium text-white transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download JSON Backup</span>
                  </button>
                </div>

                {/* Import Data */}
                <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center space-x-2 text-slate-200 text-xs font-semibold mb-1">
                      <Upload className="w-4 h-4 text-sky-400" />
                      <span>Import External Ledger</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Upload an exported JSON dataset from another branch or historical core banking backup.
                    </p>
                  </div>
                  <label className="mt-4 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-medium text-white transition-colors flex items-center justify-center space-x-1.5 cursor-pointer text-center">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Choose JSON File</span>
                    <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Reset to Default */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-slate-300">Reset Demo Database</h4>
                  <p className="text-[11px] text-slate-400">Restore factory sample banking records across all 6 regional branches.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Are you sure you want to reset the banking database to factory defaults?')) {
                      onResetDatabase();
                      onClose();
                    }
                  }}
                  className="px-3 py-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-rose-900/60 rounded-lg transition-colors flex items-center space-x-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Database</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
