import Decimal from 'decimal.js';
import { YearResult, ProjectionResult, ProjectionSummary } from '@/lib/calculations/projection';
import { PaybackResult } from '@/lib/calculations/payback';
import { SetupCostResult } from '@/lib/calculations/setupPricing';
import { TaxScenarioResult } from '@/lib/calculations/taxScenarios';

/**
 * Serialize a single Decimal to string with full precision
 */
export function serializeDecimal(d: Decimal): string {
  return d.toFixed();
}

/**
 * Serialize a Decimal to number (for charts)
 * WARNING: May lose precision for very large/small numbers
 */
export function serializeDecimalToNumber(d: Decimal): number {
  return d.toNumber();
}

/**
 * Serialize a Decimal with fixed decimal places (for display)
 */
export function serializeDecimalFixed(d: Decimal, places: number = 2): string {
  return d.toFixed(places);
}

// Serialized type definitions (what API returns)
export interface SerializedPaybackResult {
  annualSavings: string;
  selfConsumptionSavings: string;
  gridExportEarnings: string;
  paybackYears: string;
  breakEvenYear: number;
}

export interface SerializedYearResult {
  year: number;
  productionKwh: string;
  electricityRate: string;
  savingsNominal: string;
  savingsReal: string;
  maintenanceCost: string;
  netSavingsNominal: string;
  netSavingsReal: string;
  cumulativeNominal: string;
  cumulativeReal: string;
}

export interface SerializedProjectionSummary {
  totalSavingsNominal: string;
  totalSavingsReal: string;
  totalMaintenanceCost: string;
  breakEvenYearNominal: number;
  breakEvenYearReal: number;
  roi25Year: string;
}

export interface SerializedProjectionResult {
  years: SerializedYearResult[];
  summary: SerializedProjectionSummary;
}

export interface SerializedSetupCostResult {
  panelsCost: string;
  inverterCost: string;
  installationCost: string;
  mountingKitCost: string;
  batteryCost: string;
  subtotal: string;
  vatRate: string;
  vatAmount: string;
  totalWithVat: string;
}

export interface SerializedTaxScenarioResult {
  scenario: string;
  eligibleAmount: string;
  deductionRate: string;
  taxDeduction: string;
  maxDeduction: string;
  effectiveCost: string;
  effectivePaybackYears: string;
  assumptions: string[];
}

// Serializer functions
export function serializePayback(result: PaybackResult): SerializedPaybackResult {
  return {
    annualSavings: serializeDecimalFixed(result.annualSavings),
    selfConsumptionSavings: serializeDecimalFixed(result.selfConsumptionSavings),
    gridExportEarnings: serializeDecimalFixed(result.gridExportEarnings),
    paybackYears: serializeDecimalFixed(result.paybackYears),
    breakEvenYear: result.breakEvenYear,
  };
}

export function serializeProjection(result: ProjectionResult): SerializedProjectionResult {
  return {
    years: result.years.map(y => ({
      year: y.year,
      productionKwh: serializeDecimalFixed(y.productionKwh),
      electricityRate: serializeDecimalFixed(y.electricityRate, 4),
      savingsNominal: serializeDecimalFixed(y.savingsNominal),
      savingsReal: serializeDecimalFixed(y.savingsReal),
      maintenanceCost: serializeDecimalFixed(y.maintenanceCost),
      netSavingsNominal: serializeDecimalFixed(y.netSavingsNominal),
      netSavingsReal: serializeDecimalFixed(y.netSavingsReal),
      cumulativeNominal: serializeDecimalFixed(y.cumulativeNominal),
      cumulativeReal: serializeDecimalFixed(y.cumulativeReal),
    })),
    summary: {
      totalSavingsNominal: serializeDecimalFixed(result.summary.totalSavingsNominal),
      totalSavingsReal: serializeDecimalFixed(result.summary.totalSavingsReal),
      totalMaintenanceCost: serializeDecimalFixed(result.summary.totalMaintenanceCost),
      breakEvenYearNominal: result.summary.breakEvenYearNominal,
      breakEvenYearReal: result.summary.breakEvenYearReal,
      roi25Year: serializeDecimalFixed(result.summary.roi25Year),
    },
  };
}

export function serializeSetupCost(result: SetupCostResult): SerializedSetupCostResult {
  return {
    panelsCost: serializeDecimalFixed(result.panelsCost),
    inverterCost: serializeDecimalFixed(result.inverterCost),
    installationCost: serializeDecimalFixed(result.installationCost),
    mountingKitCost: serializeDecimalFixed(result.mountingKitCost),
    batteryCost: serializeDecimalFixed(result.batteryCost),
    subtotal: serializeDecimalFixed(result.subtotal),
    vatRate: serializeDecimalFixed(result.vatRate, 4),
    vatAmount: serializeDecimalFixed(result.vatAmount),
    totalWithVat: serializeDecimalFixed(result.totalWithVat),
  };
}

export function serializeTaxScenario(result: TaxScenarioResult): SerializedTaxScenarioResult {
  return {
    scenario: result.scenario,
    eligibleAmount: serializeDecimalFixed(result.eligibleAmount),
    deductionRate: serializeDecimalFixed(result.deductionRate, 4),
    taxDeduction: serializeDecimalFixed(result.taxDeduction),
    maxDeduction: serializeDecimalFixed(result.maxDeduction),
    effectiveCost: serializeDecimalFixed(result.effectiveCost),
    effectivePaybackYears: serializeDecimalFixed(result.effectivePaybackYears),
    assumptions: result.assumptions,
  };
}
