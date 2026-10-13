import React from 'react';
import { 
  Search, 
  Filter, 
  RotateCcw, 
  Calendar, 
  Building2, 
  Layers, 
  Users, 
  Wheat,
  X
} from 'lucide-react';
import { ReportFilterState } from '../types/report';
import { DEFAULT_BRANCHES } from '../data/mockBankingDatabase';

interface FilterToolbarProps {
  filter: ReportFilterState;
  onFilterChange: (newFilter: ReportFilterState) => void;
  totalLoansCount: number;
  filteredLoansCount: number;
}

export const FilterToolbar: React.FC<FilterToolbarProps> = ({
  filter,
  onFilterChange,
  totalLoansCount,
  filteredLoansCount,
}) => {
  const handleQuickPreset = (preset: ReportFilterState['quickPreset']) => {
    let from = '';
    let to = '';

    if (preset === 'KHARIF_2025') {
      from = '2026-06-01';
      to = '2026-10-31';
    } else if (preset === 'RABI_2025_26') {
      from = '2025-10-01';
      to = '2026-03-31';
    } else if (preset === 'FY_2025_26') {
      from = '2025-04-01';
      to = '2026-03-31';
    } else if (preset === 'CURRENT_QUARTER') {
      from = '2026-04-01';
      to = '2026-06-30';
    } else if (preset === 'CURRENT_MONTH') {
      from = '2026-06-01';
      to = '2026-06-30';
    }

    onFilterChange({
      ...filter,
      quickPreset: preset,
      dateRange: { from, to },
    });
  };

  const handleResetFilters = () => {
    onFilterChange({
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
  };

  const hasActiveFilters =
    filter.quickPreset !== 'ALL' ||
    filter.branchCode !== 'ALL' ||
    filter.loanScheme !== 'ALL' ||
    filter.farmerCategory !== 'ALL' ||
    filter.cropSeason !== 'ALL' ||
    filter.status !== 'ALL' ||
    filter.disbursementMode !== 'ALL' ||
    filter.searchQuery.trim() !== '';

  return (
    <div className="bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 space-y-3">
        {/* Top Line: Search & Quick Presets */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={filter.searchQuery}
              onChange={(e) => onFilterChange({ ...filter, searchQuery: e.target.value })}
              placeholder="Search by Farmer Name, Loan A/C, Khatauni Survey #, or Village..."
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
            {filter.searchQuery && (
              <button
                onClick={() => onFilterChange({ ...filter, searchQuery: '' })}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Season & Cycle Presets */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0 text-xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1 shrink-0 flex items-center space-x-1">
              <Calendar className="w-3 h-3 text-emerald-600" />
              <span>Season:</span>
            </span>

            {[
              { id: 'ALL', label: 'All Records' },
              { id: 'KHARIF_2025', label: 'Kharif Season' },
              { id: 'RABI_2025_26', label: 'Rabi Season' },
              { id: 'FY_2025_26', label: 'FY 2025-26' },
              { id: 'CURRENT_QUARTER', label: 'Q1 Current' },
            ].map((p) => {
              const active = filter.quickPreset === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handleQuickPreset(p.id as ReportFilterState['quickPreset'])}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    active
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Line: Detailed Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1 border-t border-slate-100 text-xs">
          {/* Branch Filter */}
          <div>
            <label className="block text-[10px] font-semibold uppercase text-slate-400 mb-0.5">
              Branch / District
            </label>
            <select
              value={filter.branchCode}
              onChange={(e) => onFilterChange({ ...filter, branchCode: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-md py-1.5 px-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ALL">All Branches ({DEFAULT_BRANCHES.length})</option>
              {DEFAULT_BRANCHES.map((b) => (
                <option key={b.code} value={b.code}>
                  {b.name.split(' ')[0]} - {b.district}
                </option>
              ))}
            </select>
          </div>

          {/* Scheme Filter */}
          <div>
            <label className="block text-[10px] font-semibold uppercase text-slate-400 mb-0.5">
              Loan Scheme
            </label>
            <select
              value={filter.loanScheme}
              onChange={(e) => onFilterChange({ ...filter, loanScheme: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-md py-1.5 px-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ALL">All Schemes</option>
              <option value="KCC_CROP_LOAN">KCC Crop Loan</option>
              <option value="AGRI_INFRA_FUND">Agri Infra Fund (AIF)</option>
              <option value="FARM_MECHANIZATION">Farm Mechanization</option>
              <option value="DAIRY_ALLIED">Dairy & Livestock</option>
              <option value="SOLAR_PUMP_KUSUM">Solar Pump (KUSUM)</option>
              <option value="MICRO_IRRIGATION">Micro-Irrigation (PMKSY)</option>
            </select>
          </div>

          {/* Farmer Category */}
          <div>
            <label className="block text-[10px] font-semibold uppercase text-slate-400 mb-0.5">
              Farmer Category
            </label>
            <select
              value={filter.farmerCategory}
              onChange={(e) => onFilterChange({ ...filter, farmerCategory: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-md py-1.5 px-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ALL">All Categories</option>
              <option value="SMALL_MARGINAL">Small & Marginal (&lt; 5 Ac)</option>
              <option value="MEDIUM">Medium Farmer (5-10 Ac)</option>
              <option value="LARGE">Large Commercial (&gt; 10 Ac)</option>
              <option value="WOMEN_SHG">Women Agri-SHG / JLG</option>
              <option value="TENANT_FARMER">Tenant Farmer</option>
            </select>
          </div>

          {/* Crop Season */}
          <div>
            <label className="block text-[10px] font-semibold uppercase text-slate-400 mb-0.5">
              Season Cycle
            </label>
            <select
              value={filter.cropSeason}
              onChange={(e) => onFilterChange({ ...filter, cropSeason: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-md py-1.5 px-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ALL">All Seasons</option>
              <option value="KHARIF">Kharif (Monsoon)</option>
              <option value="RABI">Rabi (Winter)</option>
              <option value="ZAID">Zaid (Summer)</option>
              <option value="ANNUAL">Annual / Commercial</option>
            </select>
          </div>

          {/* Disbursement Mode */}
          <div>
            <label className="block text-[10px] font-semibold uppercase text-slate-400 mb-0.5">
              Disbursement Mode
            </label>
            <select
              value={filter.disbursementMode}
              onChange={(e) => onFilterChange({ ...filter, disbursementMode: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-md py-1.5 px-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ALL">All Modes</option>
              <option value="DBT_AADHAAR">DBT Aadhaar Transfer</option>
              <option value="NEFT_RTGS">NEFT / RTGS</option>
              <option value="DIRECT_ACCOUNT">Direct Account Credit</option>
              <option value="ESCROW_VENDOR">Vendor Escrow Payment</option>
            </select>
          </div>

          {/* Reset Action */}
          <div className="flex items-end">
            <button
              onClick={handleResetFilters}
              disabled={!hasActiveFilters}
              className={`w-full py-1.5 px-2 rounded-md text-xs font-medium flex items-center justify-center space-x-1 transition-colors ${
                hasActiveFilters
                  ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 cursor-pointer'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
              }`}
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>

        {/* Counter indicator */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
          <div className="flex items-center space-x-1.5">
            <span className="font-semibold text-slate-700">
              Showing {filteredLoansCount} of {totalLoansCount}
            </span>
            <span>agriculture loan accounts in active report criteria</span>
          </div>

          {hasActiveFilters && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
              Filters applied
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
