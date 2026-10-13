export type FarmerCategory = 
  | 'SMALL_MARGINAL'
  | 'MEDIUM'
  | 'LARGE'
  | 'WOMEN_SHG'
  | 'TENANT_FARMER';

export type LoanScheme = 
  | 'KCC_CROP_LOAN'
  | 'AGRI_INFRA_FUND'
  | 'FARM_MECHANIZATION'
  | 'DAIRY_ALLIED'
  | 'SOLAR_PUMP_KUSUM'
  | 'MICRO_IRRIGATION';

export type CropSeason = 'KHARIF' | 'RABI' | 'ZAID' | 'ANNUAL';

export type DisbursementMode = 
  | 'DBT_AADHAAR'
  | 'NEFT_RTGS'
  | 'DIRECT_ACCOUNT'
  | 'ESCROW_VENDOR'
  | 'IN_KIND_VOUCHER';

export type LoanStatus = 
  | 'DISBURSED'
  | 'PARTIALLY_DISBURSED'
  | 'PENDING_APPROVAL'
  | 'ON_HOLD_AUDIT'
  | 'REJECTED';

export type CollateralType = 
  | 'HYPOTHECATION_CROPS'
  | 'LAND_MORTGAGE'
  | 'EQUIPMENT_LIEN'
  | 'GROUP_GUARANTEE'
  | 'CREDIT_GUARANTEE_TRUST';

export interface AgriLoanDisbursement {
  id: string; // e.g. "AGR-2026-0101"
  loanAccountNumber: string; // e.g. "604819203941"
  farmerName: string;
  farmerId: string; // Farmer ID / National ID
  farmerCategory: FarmerCategory;
  phone: string;
  village: string;
  district: string;
  state: string;
  branchName: string;
  branchCode: string;
  loanScheme: LoanScheme;
  cropOrActivity: string; // e.g. "Paddy (Organic Basmati)", "Tractor 45HP", "Dairy Cow - 4 Heads"
  cropSeason: CropSeason;
  landAreaAcres: number;
  landSurveyNumber: string;
  sanctionAmount: number;
  disbursedAmount: number;
  disbursementDate: string; // YYYY-MM-DD
  disbursementMode: DisbursementMode;
  transactionReference: string; // UTR or Ref number
  trancheNumber: number;
  totalTranches: number;
  interestRate: number; // e.g. 7.00
  subventionRate: number; // e.g. 3.00
  effectiveInterestRate: number; // e.g. 4.00
  status: LoanStatus;
  fieldOfficerName: string;
  fieldOfficerVerificationDate: string;
  geotagCoordinates: string;
  collateralType: CollateralType;
  subsidyAmount?: number;
  remarks?: string;
  syncTimestamp?: string;
}

export interface BankBranch {
  code: string;
  name: string;
  district: string;
  zone: string;
  ifscCode: string;
  managerName: string;
}
