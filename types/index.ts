// Type definitions for Solar Calculator

export interface User {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
}

export interface Installation {
  id: string;
  userId: string;
  name: string;
  address: string | null;
  panelWattage: number;
  numberOfPanels: number;
  sunHoursPerYear: number;
  efficiencyFactor: number;
  systemSizeKw: number | null;
  yearlyProductionKwh: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SetupCost {
  id: string;
  installationId: string;
  solarPanelsCost: number;
  inverterCost: number;
  batteryCost: number;
  mountingKitCost: number;
  installationCost: number;
  loanInterestRate: number;
  currency: string;
  totalCost: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MonthlyData {
  id: string;
  installationId: string;
  month: number;
  year: number;

  // Production
  production: number;
  electricityUsedDirectly: number;
  sentToGrid: number;
  sentToBattery: number;

  // Consumption
  consumption: number;
  usedByBattery: number;
  totalFromOwnProduction: number;
  usedDirectlyFromGrid: number;
  usedFromGrid: number;
  evCharged: number;
  usageWithoutEv: number;

  // Cost
  electricityPrice: number;
  amountPaid: number;
  amountSaved: number;
  gridEarnings: number;

  // Battery optimization
  potentialKwhAvoided: number;
  potentialSavings: number;
  arbitrageKwh: number;
  arbitrageSavings: number;

  createdAt: Date;
  updatedAt: Date;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
