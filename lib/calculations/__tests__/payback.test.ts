import Decimal from 'decimal.js';
import fc from 'fast-check';
import { calculatePayback, PaybackInput } from '../payback';
import { d } from '../types';

describe('Payback Calculation (Yearly Payback Overview sheet)', () => {
  // Snapshot: Values from Excel
  it('matches Excel for reference installation', () => {
    const input: PaybackInput = {
      systemCost: d('161300'),       // Total with VAT from Setup & Price
      annualProductionKwh: d('8800'), // From PVGIS estimate
      electricityRate: d('2.50'),     // DKK/kWh
      selfConsumptionRate: d('0.70'), // 70%
      gridFeedInRate: d('2.00'),      // 80% of retail
    };

    const result = calculatePayback(input);

    // Excel: Annual savings = (8800 * 0.7 * 2.50) + (8800 * 0.3 * 2.00)
    //                       = 15400 + 5280 = 20680 DKK
    expect(result.annualSavings.toFixed(2)).toBe('20680.00');

    // Payback = 161300 / 20680 = 7.80 years
    expect(result.paybackYears.toFixed(2)).toBe('7.80');
    expect(result.breakEvenYear).toBe(8);
  });

  it('matches Excel for low self-consumption scenario', () => {
    const input: PaybackInput = {
      systemCost: d('85000'),
      annualProductionKwh: d('4200'),
      electricityRate: d('3.20'),
      selfConsumptionRate: d('0.40'),
      gridFeedInRate: d('2.56'),
    };

    const result = calculatePayback(input);

    // (4200 * 0.4 * 3.20) + (4200 * 0.6 * 2.56) = 5376 + 6451.2 = 11827.2
    expect(result.annualSavings.toFixed(2)).toBe('11827.20');
  });

  // Property-based tests
  describe('mathematical properties', () => {
    it('payback decreases as electricity rate increases', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 50000, max: 200000 }),
          fc.integer({ min: 3000, max: 15000 }),
          fc.double({ min: 1.5, max: 3.0, noNaN: true }),
          fc.double({ min: 3.5, max: 6.0, noNaN: true }),
          (cost, production, rate1, rate2) => {
            const baseInput = {
              systemCost: new Decimal(cost),
              annualProductionKwh: new Decimal(production),
              selfConsumptionRate: new Decimal('0.7'),
            };

            const result1 = calculatePayback({
              ...baseInput,
              electricityRate: new Decimal(rate1),
              gridFeedInRate: new Decimal(rate1).times('0.8'),
            });

            const result2 = calculatePayback({
              ...baseInput,
              electricityRate: new Decimal(rate2),
              gridFeedInRate: new Decimal(rate2).times('0.8'),
            });

            // Higher rate = more savings = shorter payback
            return result2.paybackYears.lessThan(result1.paybackYears);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('payback is always positive and finite', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 10000, max: 500000 }),
          fc.integer({ min: 1000, max: 20000 }),
          fc.double({ min: 0.5, max: 10.0, noNaN: true }),
          fc.double({ min: 0.3, max: 1.0, noNaN: true }),
          (cost, production, rate, selfConsumption) => {
            const result = calculatePayback({
              systemCost: new Decimal(cost),
              annualProductionKwh: new Decimal(production),
              electricityRate: new Decimal(rate),
              selfConsumptionRate: new Decimal(selfConsumption),
              gridFeedInRate: new Decimal(rate).times('0.8'),
            });

            return result.paybackYears.isFinite() &&
                   result.paybackYears.greaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
