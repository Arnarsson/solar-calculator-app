import Decimal from 'decimal.js';
import { DANISH_GRID_CO2_KG_PER_KWH } from './types';

export interface CO2SavingsInput {
  annualProductionKwh: Decimal;
  emissionFactorKgPerKwh?: Decimal; // Default: Danish grid average
}

export interface CO2SavingsResult {
  annualCO2SavingsKg: Decimal;
  annualCO2SavingsTonnes: Decimal;
  lifetimeCO2SavingsTonnes: Decimal; // 25-year estimate
  emissionFactorKgPerKwh: Decimal;
  // Equivalents for user understanding
  equivalentCarKm: Decimal;       // Average car: 120g CO2/km
  equivalentTreesYear: Decimal;   // Tree absorbs ~21 kg CO2/year
}

// Constants for equivalents
const CAR_CO2_KG_PER_KM = new Decimal('0.12');    // Average car: 120g/km
const TREE_CO2_KG_PER_YEAR = new Decimal('21');   // Tree absorption: 21 kg/year
const SYSTEM_LIFETIME_YEARS = 25;

/**
 * Calculate CO2 savings from solar production
 *
 * Uses Danish grid emission factor by default. The calculation assumes
 * each kWh of solar production displaces grid electricity.
 *
 * Note: This is a simplified calculation. Actual emissions vary by:
 * - Time of day (grid mix varies)
 * - Season (more fossil fuels in winter)
 * - Whether self-consumed or exported
 *
 * For conservative estimates, we use the average grid factor.
 */
export function calculateCO2Savings(input: CO2SavingsInput): CO2SavingsResult {
  const emissionFactor = input.emissionFactorKgPerKwh ?? DANISH_GRID_CO2_KG_PER_KWH;

  // Annual CO2 savings
  const annualCO2SavingsKg = input.annualProductionKwh.times(emissionFactor);
  const annualCO2SavingsTonnes = annualCO2SavingsKg.dividedBy(1000);

  // Lifetime CO2 savings (simplified - no degradation factor)
  // Note: Could be enhanced to account for production degradation
  const lifetimeCO2SavingsTonnes = annualCO2SavingsTonnes.times(SYSTEM_LIFETIME_YEARS);

  // Equivalent metrics for user understanding
  const equivalentCarKm = annualCO2SavingsKg.dividedBy(CAR_CO2_KG_PER_KM);
  const equivalentTreesYear = annualCO2SavingsKg.dividedBy(TREE_CO2_KG_PER_YEAR);

  return {
    annualCO2SavingsKg,
    annualCO2SavingsTonnes,
    lifetimeCO2SavingsTonnes,
    emissionFactorKgPerKwh: emissionFactor,
    equivalentCarKm,
    equivalentTreesYear,
  };
}

/**
 * Format CO2 savings for display with Danish locale
 */
export function formatCO2Savings(result: CO2SavingsResult): {
  annual: string;
  lifetime: string;
  carKm: string;
  trees: string;
} {
  return {
    annual: `${result.annualCO2SavingsTonnes.toFixed(1)} ton CO₂/år`,
    lifetime: `${result.lifetimeCO2SavingsTonnes.toFixed(0)} ton CO₂ over 25 år`,
    carKm: `${result.equivalentCarKm.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.')} km i bil`,
    trees: `${result.equivalentTreesYear.toFixed(0)} træer`,
  };
}
