// Solar Calculator - All Calculation Logic
// Ported from Excel: Solar panel calculations - Platanvej 7.xlsx

export interface SetupCosts {
  solarPanelsCost: number;
  inverterCost: number;
  batteryCost: number;
  mountingKitCost: number;
  installationCost: number;
  loanInterestRate: number;
}

export interface PanelSpecs {
  panelWattage: number;      // Watts per panel (typical: 350-450W)
  numberOfPanels: number;    // Total panels in setup
  sunHoursPerYear: number;   // Location dependent (Denmark: 900-1000)
  efficiencyFactor: number;  // Real-world losses (typical: 0.8)
}

export interface MonthlyInput {
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
  usedDirectlyFromGrid: number;
  evCharged: number;

  // Pricing
  electricityPrice: number; // kr/kWh
}

export interface MonthlyResults extends MonthlyInput {
  // Calculated fields
  totalFromOwnProduction: number;
  usedFromGrid: number;
  usageWithoutEv: number;
  amountPaid: number;
  amountSaved: number;
  gridEarnings: number;
  totalSaved: number;

  // Battery optimization
  potentialKwhAvoided: number;
  potentialSavings: number;
  arbitrageKwh: number;
  arbitrageSavings: number;

  // CO2
  co2SavedKg: number;
}

export interface YearlyResults {
  totalProduction: number;
  totalConsumption: number;
  totalUsedFromOwnProduction: number;
  totalSentToGrid: number;
  totalUsedFromGrid: number;
  totalEvCharged: number;
  totalPaid: number;
  totalSaved: number;
  totalGridEarnings: number;
  netSavings: number;
  totalCO2SavedKg: number;
  paybackYears: number;
  roi: number;
}

// Production Estimator
export function calculateProductionEstimate(specs: PanelSpecs) {
  const systemSizeKw = (specs.panelWattage * specs.numberOfPanels) / 1000;
  const yearlyProductionKwh = systemSizeKw * specs.sunHoursPerYear * specs.efficiencyFactor;

  return {
    systemSizeKw,
    yearlyProductionKwh,
    monthlyAverageKwh: yearlyProductionKwh / 12,
  };
}

// Total Setup Cost
export function calculateTotalCost(costs: SetupCosts): number {
  return (
    costs.solarPanelsCost +
    costs.inverterCost +
    costs.batteryCost +
    costs.mountingKitCost +
    costs.installationCost +
    costs.loanInterestRate
  );
}

// Monthly Calculations (from Excel formulas)
export function calculateMonthlyResults(
  input: MonthlyInput,
  gridSellPriceRatio: number = 0.3 // Sell price is typically 30% of buy price
): MonthlyResults {
  // Total electricity used from own production
  const totalFromOwnProduction = input.electricityUsedDirectly + input.usedByBattery;

  // Used from grid (what we had to buy)
  const usedFromGrid = input.usedDirectlyFromGrid + input.evCharged;

  // Usage without EV
  const usageWithoutEv = input.consumption - input.evCharged;

  // Amount paid to grid
  const amountPaid = usedFromGrid * input.electricityPrice;

  // Amount saved (what we would have paid if no solar)
  const amountSaved = totalFromOwnProduction * input.electricityPrice;

  // Earnings from selling to grid
  const gridSellPrice = input.electricityPrice * gridSellPriceRatio;
  const gridEarnings = input.sentToGrid * gridSellPrice;

  // Total financial benefit
  const totalSaved = amountSaved + gridEarnings;

  // Battery optimization calculations (Better Use of Setup)
  // Potential kWh that could be avoided from grid with better timing
  const potentialKwhAvoided = Math.min(input.sentToGrid * 0.3, input.usedDirectlyFromGrid * 0.5);
  const potentialSavings = potentialKwhAvoided * input.electricityPrice;

  // Arbitrage: charge battery when cheap, use when expensive
  const arbitrageKwh = input.sentToBattery * 0.2; // Estimate 20% could be better timed
  const arbitrageSavings = arbitrageKwh * (input.electricityPrice * 0.5); // Half price benefit

  // CO2 savings (Denmark grid: ~0.5 kg CO2/kWh)
  const co2SavedKg = totalFromOwnProduction * 0.5;

  return {
    ...input,
    totalFromOwnProduction,
    usedFromGrid,
    usageWithoutEv,
    amountPaid,
    amountSaved,
    gridEarnings,
    totalSaved,
    potentialKwhAvoided,
    potentialSavings,
    arbitrageKwh,
    arbitrageSavings,
    co2SavedKg,
  };
}

// Yearly Summary
export function calculateYearlyResults(
  monthlyData: MonthlyResults[],
  totalSetupCost: number
): YearlyResults {
  const totals = monthlyData.reduce(
    (acc, month) => ({
      totalProduction: acc.totalProduction + month.production,
      totalConsumption: acc.totalConsumption + month.consumption,
      totalUsedFromOwnProduction: acc.totalUsedFromOwnProduction + month.totalFromOwnProduction,
      totalSentToGrid: acc.totalSentToGrid + month.sentToGrid,
      totalUsedFromGrid: acc.totalUsedFromGrid + month.usedFromGrid,
      totalEvCharged: acc.totalEvCharged + month.evCharged,
      totalPaid: acc.totalPaid + month.amountPaid,
      totalSaved: acc.totalSaved + month.amountSaved,
      totalGridEarnings: acc.totalGridEarnings + month.gridEarnings,
      totalCO2SavedKg: acc.totalCO2SavedKg + month.co2SavedKg,
    }),
    {
      totalProduction: 0,
      totalConsumption: 0,
      totalUsedFromOwnProduction: 0,
      totalSentToGrid: 0,
      totalUsedFromGrid: 0,
      totalEvCharged: 0,
      totalPaid: 0,
      totalSaved: 0,
      totalGridEarnings: 0,
      totalCO2SavedKg: 0,
    }
  );

  const netSavings = totals.totalSaved + totals.totalGridEarnings;
  const paybackYears = netSavings > 0 ? totalSetupCost / netSavings : Infinity;
  const roi = netSavings > 0 ? (netSavings / totalSetupCost) * 100 : 0;

  return {
    ...totals,
    netSavings,
    paybackYears,
    roi,
  };
}

// Default values from your Excel data
export const DEFAULT_SETUP_COSTS: SetupCosts = {
  solarPanelsCost: 47400,
  inverterCost: 20625,
  batteryCost: 20925,
  mountingKitCost: 11680,
  installationCost: 49335,
  loanInterestRate: 8000,
};

export const DEFAULT_PANEL_SPECS: PanelSpecs = {
  panelWattage: 400,
  numberOfPanels: 29,
  sunHoursPerYear: 950,
  efficiencyFactor: 0.8,
};

// Sample monthly data from Excel (2025)
export const SAMPLE_MONTHLY_DATA: MonthlyInput[] = [
  { month: 1, year: 2025, production: 214, electricityUsedDirectly: 198, sentToGrid: 16, sentToBattery: 0, consumption: 1660, usedByBattery: 428, usedDirectlyFromGrid: 1030, evCharged: 514, electricityPrice: 1.87 },
  { month: 2, year: 2025, production: 520, electricityUsedDirectly: 15, sentToGrid: 106, sentToBattery: 398, consumption: 1500, usedByBattery: 385, usedDirectlyFromGrid: 1100, evCharged: 450, electricityPrice: 1.87 },
  { month: 3, year: 2025, production: 1480, electricityUsedDirectly: 417, sentToGrid: 669, sentToBattery: 398, consumption: 1350, usedByBattery: 382, usedDirectlyFromGrid: 559, evCharged: 385, electricityPrice: 1.45 },
  { month: 4, year: 2025, production: 2040, electricityUsedDirectly: 747, sentToGrid: 975, sentToBattery: 324, consumption: 1300, usedByBattery: 315, usedDirectlyFromGrid: 238, evCharged: 456, electricityPrice: 1.33 },
  { month: 5, year: 2025, production: 2330, electricityUsedDirectly: 513, sentToGrid: 1550, sentToBattery: 264, consumption: 857, usedByBattery: 234, usedDirectlyFromGrid: 134, evCharged: 245, electricityPrice: 1.71 },
  { month: 6, year: 2025, production: 2380, electricityUsedDirectly: 613, sentToGrid: 1510, sentToBattery: 257, consumption: 1000, usedByBattery: 250, usedDirectlyFromGrid: 143, evCharged: 339, electricityPrice: 1.84 },
  { month: 7, year: 2025, production: 2160, electricityUsedDirectly: 552, sentToGrid: 1360, sentToBattery: 250, consumption: 926, usedByBattery: 239, usedDirectlyFromGrid: 135, evCharged: 299, electricityPrice: 1.86 },
  { month: 8, year: 2025, production: 2150, electricityUsedDirectly: 556, sentToGrid: 1330, sentToBattery: 261, consumption: 1080, usedByBattery: 316, usedDirectlyFromGrid: 163, evCharged: 290, electricityPrice: 1.72 },
  { month: 9, year: 2025, production: 1630, electricityUsedDirectly: 439, sentToGrid: 940, sentToBattery: 252, consumption: 1030, usedByBattery: 328, usedDirectlyFromGrid: 267, evCharged: 363, electricityPrice: 2.28 },
  { month: 10, year: 2025, production: 783, electricityUsedDirectly: 275, sentToGrid: 325, sentToBattery: 183, consumption: 1500, usedByBattery: 402, usedDirectlyFromGrid: 824, evCharged: 486, electricityPrice: 2.10 },
  { month: 11, year: 2025, production: 364, electricityUsedDirectly: 187, sentToGrid: 70, sentToBattery: 107, consumption: 1700, usedByBattery: 374, usedDirectlyFromGrid: 1140, evCharged: 429, electricityPrice: 1.48 },
  { month: 12, year: 2025, production: 225, electricityUsedDirectly: 113, sentToGrid: 26, sentToBattery: 86, consumption: 1750, usedByBattery: 366, usedDirectlyFromGrid: 1270, evCharged: 423, electricityPrice: 1.35 },
];
