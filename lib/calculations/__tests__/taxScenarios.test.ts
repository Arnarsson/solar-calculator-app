import Decimal from 'decimal.js';
import { calculateTaxScenario, TaxScenarioInput, TaxScenarioType } from '../taxScenarios';
import { d } from '../types';

describe('Tax Scenarios (Danish Tax Deductions)', () => {
  const baseInput: TaxScenarioInput = {
    systemCost: d('161300'),          // Total with VAT
    installationLaborCost: d('49335'), // Labor portion only
    panelsCost: d('47400'),
    inverterCost: d('20625'),
    annualSavings: d('20680'),
  };

  describe('NO_TAX scenario', () => {
    it('returns original values without deduction', () => {
      const result = calculateTaxScenario(baseInput, 'NO_TAX');

      expect(result.scenario).toBe('NO_TAX');
      expect(result.effectiveCost.equals(baseInput.systemCost)).toBe(true);
      expect(result.taxDeduction.equals(d('0'))).toBe(true);
    });
  });

  describe('LABOR_DEDUCTION scenario', () => {
    it('applies deduction only to labor costs', () => {
      const result = calculateTaxScenario(baseInput, 'LABOR_DEDUCTION');

      expect(result.scenario).toBe('LABOR_DEDUCTION');
      // Deduction is on labor only, not equipment
      expect(result.eligibleAmount.equals(baseInput.installationLaborCost)).toBe(true);
      // Deduction rate (placeholder - needs 2026 SKAT rules)
      expect(result.taxDeduction.greaterThan(d('0'))).toBe(true);
    });

    it('caps deduction at maximum allowed', () => {
      const expensiveLabor: TaxScenarioInput = {
        ...baseInput,
        installationLaborCost: d('500000'), // Very expensive labor
      };

      const result = calculateTaxScenario(expensiveLabor, 'LABOR_DEDUCTION');

      // Should be capped at max deduction
      expect(result.taxDeduction.lessThanOrEqualTo(result.maxDeduction)).toBe(true);
    });
  });

  describe('effective payback comparison', () => {
    it('shows lower effective cost with tax deduction', () => {
      const noTax = calculateTaxScenario(baseInput, 'NO_TAX');
      const withTax = calculateTaxScenario(baseInput, 'LABOR_DEDUCTION');

      expect(withTax.effectiveCost.lessThan(noTax.effectiveCost)).toBe(true);
      expect(withTax.effectivePaybackYears.lessThan(noTax.effectivePaybackYears)).toBe(true);
    });
  });

  it('documents assumptions for transparency (FIN-06)', () => {
    const result = calculateTaxScenario(baseInput, 'LABOR_DEDUCTION');

    expect(result.assumptions).toContain('Danish home improvement deduction');
    expect(result.assumptions.length).toBeGreaterThan(0);
  });
});
