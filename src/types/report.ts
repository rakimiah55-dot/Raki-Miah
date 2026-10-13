export interface ReportFilterState {
  dateRange: {
    from: string;
    to: string;
  };
  quickPreset: 'ALL' | 'KHARIF_2025' | 'RABI_2025_26' | 'CURRENT_MONTH' | 'CURRENT_QUARTER' | 'FY_2025_26';
  branchCode: string; // 'ALL' or specific branch code
  loanScheme: string; // 'ALL' or specific scheme
  farmerCategory: string; // 'ALL' or category
  cropSeason: string; // 'ALL' or season
  status: string; // 'ALL' or status
  disbursementMode: string; // 'ALL' or mode
  minAmount?: number;
  maxAmount?: number;
  searchQuery: string;
}

export interface ReportSettings {
  bankName: string;
  bankTagline: string;
  departmentName: string;
  reportTitle: string;
  reportRefNumber: string;
  fiscalYear: string;
  currencySymbol: string;
  currencyCode: string;
  
  // Section Toggles
  includeExecutiveSummary: boolean;
  includeKpiMetrics: boolean;
  includeSchemeBreakdown: boolean;
  includeCategoryBreakdown: boolean;
  includeDetailedTable: boolean;
  includeSubsidySection: boolean;
  includeAuditSignoff: boolean;
  includeWatermark: boolean;
  watermarkText: string;

  // Signatories
  fieldOfficerName: string;
  fieldOfficerDesignation: string;
  branchManagerName: string;
  branchManagerDesignation: string;
  auditorName: string;
  auditorDesignation: string;

  // Custom Notes
  customNotes?: string;
  visibleColumns: string[];
}
