import React from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Award, 
  CheckCircle, 
  PieChart, 
  BarChart3, 
  Landmark,
  ShieldCheck,
  Wheat
} from 'lucide-react';
import { AgriLoanDisbursement } from '../types/loan';
import { formatCurrency } from '../services/pdfReportGenerator';

interface ExecutiveDashboardProps {
  loans: AgriLoanDisbursement[];
  currencySymbol: string;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  loans,
  currencySymbol,
}) => {
  const totalSanctioned = loans.reduce((acc, curr) => acc + curr.sanctionAmount, 0);
  const totalDisbursed = loans.reduce((acc, curr) => acc + curr.disbursedAmount, 0);
  const totalSubsidy = loans.reduce((acc, curr) => acc + (curr.subsidyAmount || 0), 0);
  const totalAcres = loans.reduce((acc, curr) => acc + curr.landAreaAcres, 0);

  const smallMarginalLoans = loans.filter((l) => l.farmerCategory === 'SMALL_MARGINAL');
  const smallMarginalDisbursed = smallMarginalLoans.reduce((acc, curr) => acc + curr.disbursedAmount, 0);
  const pslRatio = totalDisbursed > 0 ? (smallMarginalDisbursed / totalDisbursed) * 100 : 0;
  const realizationRatio = totalSanctioned > 0 ? (totalDisbursed / totalSanctioned) * 100 : 0;

  // Breakdown by Scheme
  const schemeAgg = loans.reduce((acc, curr) => {
    const key = curr.loanScheme;
    acc[key] = (acc[key] || 0) + curr.disbursedAmount;
    return acc;
  }, {} as Record<string, number>);

  const schemeLabels: Record<string, string> = {
    KCC_CROP_LOAN: 'Kisan Credit Card (Crop Loan)',
    AGRI_INFRA_FUND: 'Agri Infrastructure Fund (AIF)',
    FARM_MECHANIZATION: 'Farm Mechanization / Tractor',
    DAIRY_ALLIED: 'Dairy & Animal Husbandry',
    SOLAR_PUMP_KUSUM: 'PM-KUSUM Solar Pump',
    MICRO_IRRIGATION: 'Micro-Irrigation (PMKSY)',
  };

  const schemeColors: Record<string, string> = {
    KCC_CROP_LOAN: 'bg-emerald-500',
    AGRI_INFRA_FUND: 'bg-sky-500',
    FARM_MECHANIZATION: 'bg-amber-500',
    DAIRY_ALLIED: 'bg-indigo-500',
    SOLAR_PUMP_KUSUM: 'bg-yellow-500',
    MICRO_IRRIGATION: 'bg-teal-500',
  };

  // Breakdown by Category
  const categoryAgg = loans.reduce((acc, curr) => {
    const key = curr.farmerCategory;
    acc[key] = (acc[key] || 0) + curr.disbursedAmount;
    return acc;
  }, {} as Record<string, number>);

  const categoryLabels: Record<string, string> = {
    SMALL_MARGINAL: 'Small & Marginal (< 5 Ac)',
    MEDIUM: 'Medium (5-10 Ac)',
    LARGE: 'Large (> 10 Ac)',
    WOMEN_SHG: 'Women Agri-SHG',
    TENANT_FARMER: 'Tenant Sharecropper',
  };

  return (
    <div className="space-y-6">
      {/* 4 Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Disbursed */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-600" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Disbursed
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {formatCurrency(totalDisbursed, currencySymbol)}
          </p>
          <div className="flex items-center space-x-1.5 mt-2 text-xs">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
              {realizationRatio.toFixed(1)}%
            </span>
            <span className="text-slate-500">Realization of Sanctioned limit</span>
          </div>
        </div>

        {/* Card 2: Total Sanctioned */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-slate-700" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Sanctioned Limit
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Landmark className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {formatCurrency(totalSanctioned, currencySymbol)}
          </p>
          <div className="flex items-center space-x-1.5 mt-2 text-xs">
            <span className="text-slate-600 font-medium">{loans.length} Borrowers</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-500">{totalAcres.toFixed(1)} Cultivated Acres</span>
          </div>
        </div>

        {/* Card 3: Priority Sector Lending (SF/MF) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-teal-600" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Priority Sector (SF/MF)
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2 mt-2">
            <p className="text-2xl font-bold text-slate-900">
              {pslRatio.toFixed(1)}%
            </p>
            <span className="text-xs text-teal-700 font-medium">Target: &gt; 18%</span>
          </div>
          <div className="flex items-center space-x-1.5 mt-2 text-xs text-slate-500">
            <CheckCircle className="w-3.5 h-3.5 text-teal-600" />
            <span>{smallMarginalLoans.length} Small/Marginal Farmers Funded</span>
          </div>
        </div>

        {/* Card 4: Subvention / Subsidy Outflow */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Subvention & Subsidies
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {formatCurrency(totalSubsidy, currencySymbol)}
          </p>
          <div className="flex items-center space-x-1.5 mt-2 text-xs text-slate-500">
            <span>Interest Subvention (3% prompt) + Central subsidy</span>
          </div>
        </div>
      </div>

      {/* Visual Distribution Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scheme Distribution */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-semibold text-slate-800">
                Disbursement by Scheme & Product
              </h3>
            </div>
            <span className="text-xs text-slate-400">Share of Total</span>
          </div>

          <div className="space-y-3.5">
            {Object.entries(schemeAgg).map(([schemeKey, amount]) => {
              const pct = totalDisbursed > 0 ? (amount / totalDisbursed) * 100 : 0;
              const label = schemeLabels[schemeKey] || schemeKey;
              const barColor = schemeColors[schemeKey] || 'bg-emerald-500';

              return (
                <div key={schemeKey} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700">{label}</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-slate-900">
                        {formatCurrency(amount, currencySymbol)}
                      </span>
                      <span className="text-slate-400 w-11 text-right">
                        {pct.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${barColor} rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Farmer Category Distribution */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-semibold text-slate-800">
                Farmer Beneficiary Classification
              </h3>
            </div>
            <span className="text-xs text-slate-400">Statutory PSL</span>
          </div>

          <div className="space-y-3.5">
            {Object.entries(categoryAgg).map(([catKey, amount]) => {
              const pct = totalDisbursed > 0 ? (amount / totalDisbursed) * 100 : 0;
              const label = categoryLabels[catKey] || catKey;
              const count = loans.filter((l) => l.farmerCategory === catKey).length;

              return (
                <div key={catKey} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-medium text-slate-700">{label}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.2 rounded font-mono">
                        {count} accts
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-slate-900">
                        {formatCurrency(amount, currencySymbol)}
                      </span>
                      <span className="text-slate-400 w-11 text-right">
                        {pct.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-600 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
