import Decimal from 'decimal.js';
import { calculateSetupCost, SetupCostInput } from '../setupPricing';
import { d } from '../types';

describe('Setup Pricing (Setup & Price sheet)', () => {
  // Snapshot test: Values from Excel "Setup & Price" sheet
  it('matches Excel for reference installation', () => {
    const input: SetupCostInput = {
      panelsCost: d('47400'),      // From Excel
      inverterCost: d('20625'),
      installationCost: d('49335'),
      mountingKitCost: d('11680'),
    };

    const result = calculateSetupCost(input);

    // Excel values (before VAT)
    expect(result.subtotal.toFixed(2)).toBe('129040.00');
    // With 25% VAT
    expect(result.vatAmount.toFixed(2)).toBe('32260.00');
    expect(result.totalWithVat.toFixed(2)).toBe('161300.00');
  });

  it('handles zero costs', () => {
    const input: SetupCostInput = {
      panelsCost: d('0'),
      inverterCost: d('0'),
      installationCost: d('0'),
      mountingKitCost: d('0'),
    };

    const result = calculateSetupCost(input);

    expect(result.totalWithVat.toFixed(2)).toBe('0.00');
  });

  it('calculates VAT correctly at 25%', () => {
    const input: SetupCostInput = {
      panelsCost: d('100000'),
      inverterCost: d('0'),
      installationCost: d('0'),
      mountingKitCost: d('0'),
    };

    const result = calculateSetupCost(input);

    expect(result.vatAmount.toFixed(2)).toBe('25000.00');
    expect(result.totalWithVat.toFixed(2)).toBe('125000.00');
  });
});
