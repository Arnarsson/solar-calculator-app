import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Solar calculation utilities
export function calculateSystemSize(panelWattage: number, numberOfPanels: number): number {
  return (panelWattage * numberOfPanels) / 1000;
}

export function calculateYearlyProduction(
  panelWattage: number,
  numberOfPanels: number,
  sunHoursPerYear: number,
  efficiencyFactor: number
): number {
  const systemSizeKw = calculateSystemSize(panelWattage, numberOfPanels);
  return systemSizeKw * sunHoursPerYear * efficiencyFactor;
}

export function calculateTotalSetupCost(costs: {
  solarPanelsCost: number;
  inverterCost: number;
  batteryCost: number;
  mountingKitCost: number;
  installationCost: number;
  loanInterestRate: number;
}): number {
  return (
    costs.solarPanelsCost +
    costs.inverterCost +
    costs.batteryCost +
    costs.mountingKitCost +
    costs.installationCost +
    costs.loanInterestRate
  );
}

export function calculateMonthlySavings(
  electricityUsedDirectly: number,
  usedByBattery: number,
  electricityPrice: number
): number {
  return (electricityUsedDirectly + usedByBattery) * electricityPrice;
}

export function calculateGridEarnings(
  sentToGrid: number,
  gridSellPrice: number = 0.5 // Default sell price is lower than buy price
): number {
  return sentToGrid * gridSellPrice;
}

export function calculatePaybackYears(
  totalCost: number,
  yearlySavings: number
): number {
  if (yearlySavings <= 0) return Infinity;
  return totalCost / yearlySavings;
}

export function calculateCO2Savings(
  productionUsedKwh: number,
  emissionFactorKgPerKwh: number = 0.5 // Denmark average
): number {
  return productionUsedKwh * emissionFactorKgPerKwh;
}

export function formatCurrency(amount: number, currency: string = "DKK"): string {
  return new Intl.NumberFormat("da-DK", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number, decimals: number = 0): string {
  return new Intl.NumberFormat("da-DK", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export const MONTH_NAMES_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];
