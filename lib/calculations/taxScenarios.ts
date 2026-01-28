import Decimal from 'decimal.js';

export type TaxScenarioType = 'NO_TAX' | 'LABOR_DEDUCTION';

export interface TaxScenarioInput {
  systemCost: Decimal;
  installationLaborCost: Decimal;
  panelsCost: Decimal;
  inverterCost: Decimal;
  annualSavings: Decimal;
}

export interface TaxScenarioResult {
  scenario: TaxScenarioType;
  eligibleAmount: Decimal;
  deductionRate: Decimal;
  taxDeduction: Decimal;
  maxDeduction: Decimal;
  effectiveCost: Decimal;
  effectivePaybackYears: Decimal;
  assumptions: string[];
}

// Danish tax deduction constants (2026 placeholder - needs SKAT verification)
// These are ESTIMATES based on historical håndværkerfradrag patterns
const LABOR_DEDUCTION_RATE = new Decimal('0.26'); // ~26% tax value of deduction
const MAX_DEDUCTION_DKK = new Decimal('25000');   // Annual cap (placeholder)

/**
 * Calculate tax scenario for solar installation
 *
 * IMPORTANT: These values are placeholders. Verify with SKAT 2026 guidelines
 * before production use. Danish tax rules change annually.
 *
 * @param input - Cost breakdown and annual savings
 * @param scenario - Tax scenario to calculate
 */
export function calculateTaxScenario(
  input: TaxScenarioInput,
  scenario: TaxScenarioType
): TaxScenarioResult {
  const baseAssumptions = [
    'Danish home improvement deduction (håndværkerfradrag) rules',
    'Standard tax bracket assumed',
    'Single-year deduction (not spread across years)',
  ];

  if (scenario === 'NO_TAX') {
    return {
      scenario,
      eligibleAmount: new Decimal(0),
      deductionRate: new Decimal(0),
      taxDeduction: new Decimal(0),
      maxDeduction: new Decimal(0),
      effectiveCost: input.systemCost,
      effectivePaybackYears: input.systemCost.dividedBy(input.annualSavings),
      assumptions: ['No tax deduction applied'],
    };
  }

  // LABOR_DEDUCTION scenario
  const eligibleAmount = input.installationLaborCost;

  // Calculate tax deduction (capped at max)
  const rawDeduction = eligibleAmount.times(LABOR_DEDUCTION_RATE);
  const taxDeduction = Decimal.min(rawDeduction, MAX_DEDUCTION_DKK);

  // Effective cost after deduction
  const effectiveCost = input.systemCost.minus(taxDeduction);

  // Effective payback with lower cost
  const effectivePaybackYears = effectiveCost.dividedBy(input.annualSavings);

  return {
    scenario,
    eligibleAmount,
    deductionRate: LABOR_DEDUCTION_RATE,
    taxDeduction,
    maxDeduction: MAX_DEDUCTION_DKK,
    effectiveCost,
    effectivePaybackYears,
    assumptions: [
      ...baseAssumptions,
      `Deduction rate: ${LABOR_DEDUCTION_RATE.times(100).toFixed(0)}% tax value`,
      `Maximum deduction: ${MAX_DEDUCTION_DKK.toFixed(0)} DKK`,
      'Deduction applies to labor costs only (not equipment)',
      'PLACEHOLDER VALUES - Verify with SKAT 2026 rules before use',
    ],
  };
}

/**
 * Compare multiple tax scenarios side-by-side
 */
export function compareTaxScenarios(input: TaxScenarioInput): TaxScenarioResult[] {
  const scenarios: TaxScenarioType[] = ['NO_TAX', 'LABOR_DEDUCTION'];
  return scenarios.map(s => calculateTaxScenario(input, s));
}
