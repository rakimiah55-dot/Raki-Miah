import React from 'react';
import { 
  Database, 
  RefreshCw, 
  FileText, 
  Download, 
  Settings2, 
  SlidersHorizontal,
  Landmark,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { BankingDatabaseConfig } from '../types/database';

interface NavbarProps {
  dbConfig: BankingDatabaseConfig;
  isSyncing: boolean;
  onSync: () => void;
  onOpenDbModal: () => void;
  onOpenReportBuilder: () => void;
  onGenerateQuickPdf: () => void;
  onOpenAiMemo: () => void;
  activeCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  dbConfig,
  isSyncing,
  onSync,
  onOpenDbModal,
  onOpenReportBuilder,
  onGenerateQuickPdf,
  onOpenAiMemo,
  activeCount,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-900/30 border border-emerald-500/40">
              <Landmark className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white">
                  AgriLoan <span className="text-emerald-400 font-semibold">Pulse</span>
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300">
                  CBS v4.2
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Agricultural Credit & Priority Sector Lending Report Suite
              </p>
            </div>
          </div>

          {/* Center Database Status Pill */}
          <div className="hidden md:flex items-center space-x-3 bg-slate-800/80 rounded-full px-3.5 py-1.5 border border-slate-700/80">
            <div className="flex items-center space-x-2">
              <div className="relative flex h-2.5 w-2.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  dbConfig.status === 'CONNECTED' ? 'bg-emerald-400' : 'bg-amber-400'
                }`} />
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  dbConfig.status === 'CONNECTED' ? 'bg-emerald-500' : 'bg-amber-500'
                }`} />
              </div>
              <span className="text-xs font-medium text-slate-300">
                {dbConfig.engine.replace(/_/g, ' ')}
              </span>
            </div>
            <span className="text-slate-600">|</span>
            <span className="text-xs text-slate-400 font-mono">
              {dbConfig.latencyMs}ms
            </span>
            <span className="text-slate-600">|</span>
            <button
              onClick={onOpenDbModal}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center space-x-1 cursor-pointer transition-colors"
            >
              <Database className="w-3 h-3" />
              <span>Config</span>
            </button>
            <button
              onClick={onSync}
              disabled={isSyncing}
              title="Sync fresh loan settlements from Banking Database"
              className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* AI Audit Memo */}
            <button
              onClick={onOpenAiMemo}
              className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Audit Memo</span>
            </button>

            {/* Custom Report Builder */}
            <button
              onClick={onOpenReportBuilder}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Report Settings</span>
              <span className="sm:hidden">Settings</span>
            </button>

            {/* Generate PDF Button */}
            <button
              onClick={onGenerateQuickPdf}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/40 border border-emerald-500/50 transition-all cursor-pointer hover:shadow-emerald-900/60 active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export PDF ({activeCount})</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
