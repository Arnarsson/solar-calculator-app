import Decimal from 'decimal.js';
import fc from 'fast-check';
import { calculateProjection, ProjectionInput, YearResult } from '../projection';
import { d } from '../types';

describe('25-Year Projection (Financial Projection)', () => {
  const defaultInput: ProjectionInput = {
    systemCost: d('161300'),
    annualProductionKwh: d('8800'),
    electricityRateDkk: d('2.50'),
    selfConsumptionRate: d('0.70'),
    gridFeedInRate: d('2.00'),
    inflationRate: d('0.02'),           // 2% general inflation
    electricityInflationRate: d('0.03'), // 3% electricity inflation
    maintenanceCostYear1: d('1000'),     // 1000 DKK/year maintenance
    degradationRateFirstYear: d('0.03'), // 3% LID
    degradationRateAnnual: d('0.005'),   // 0.5%/year after
  };

  it('calculates 25 years of projections', () => {
    const result = calculateProjection(defaultInput);

    expect(result.years).toHaveLength(25);
    expect(result.years[0].year).toBe(1);
    expect(result.years[24].year).toBe(25);
  });

  describe('degradation modeling', () => {
    it('applies 3% first-year degradation (LID)', () => {
      const result = calculateProjection(defaultInput);

      // Year 1: 8800 * 0.97 = 8536 kWh
      expect(result.years[0].productionKwh.toFixed(0)).toBe('8536');
    });

    it('applies 0.5% annual degradation after year 1', () => {
      const result = calculateProjection(defaultInput);

      // Year 2: 8536 * 0.995 = 8493.32 kWh
      expect(result.years[1].productionKwh.toFixed(2)).toBe('8493.32');

      // Year 25: 8536 * 0.995^24 = 7562.67 kWh
      expect(result.years[24].productionKwh.toFixed(2)).toBe('7562.67');
    });
  });

  describe('inflation adjustment', () => {
    it('calculates both nominal and real savings', () => {
      const result = calculateProjection(defaultInput);

      // Year 10 electricity rate: 2.50 * 1.03^9 = 3.26 DKK/kWh
      // Nominal savings increase with electricity inflation
      // Real savings discount back to today's value

      const year10 = result.years[9];
      expect(year10.electricityRate.greaterThan(d('3.0'))).toBe(true);

      // Real savings should be less than nominal (inflation discount)
      expect(year10.savingsReal.lessThan(year10.savingsNominal)).toBe(true);
    });

    it('tracks cumulative savings correctly', () => {
      const result = calculateProjection(defaultInput);

      // Year 1 cumulative starts at (first year savings - system cost)
      expect(result.years[0].cumulativeNominal.lessThan(d('0'))).toBe(true);

      // Eventually goes positive (break-even)
      const breakEvenYear = result.years.findIndex(y =>
        y.cumulativeNominal.greaterThanOrEqualTo(d('0'))
      );
      expect(breakEvenYear).toBeGreaterThan(0);
      expect(breakEvenYear).toBeLessThan(15); // Should break even within 15 years
    });
  });

  describe('summary calculations', () => {
    it('calculates total lifetime savings', () => {
      const result = calculateProjection(defaultInput);

      // 25-year total should be substantial
      expect(result.summary.totalSavingsNominal.greaterThan(d('400000'))).toBe(true);
      expect(result.summary.totalSavingsReal.greaterThan(d('300000'))).toBe(true);
    });

    it('identifies break-even year', () => {
      const result = calculateProjection(defaultInput);

      expect(result.summary.breakEvenYearNominal).toBeGreaterThan(0);
      expect(result.summary.breakEvenYearNominal).toBeLessThanOrEqual(25);
    });
  });

  // Property-based tests
  describe('mathematical properties', () => {
    it('cumulative savings always increase year-over-year (after break-even)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 50000, max: 200000 }),
          fc.integer({ min: 5000, max: 15000 }),
          fc.double({ min: 2.0, max: 5.0, noNaN: true }),
          (cost, production, rate) => {
            const result = calculateProjection({
              ...defaultInput,
              systemCost: new Decimal(cost),
              annualProductionKwh: new Decimal(production),
              electricityRateDkk: new Decimal(rate),
            });

            // After break-even, cumulative should always increase
            const breakEvenIdx = result.years.findIndex(y =>
              y.cumulativeNominal.greaterThanOrEqualTo(0)
            );

            if (breakEvenIdx >= 0 && breakEvenIdx < 24) {
              for (let i = breakEvenIdx; i < 24; i++) {
                if (!result.years[i + 1].cumulativeNominal
                    .greaterThan(result.years[i].cumulativeNominal)) {
                  return false;
                }
              }
            }
            return true;
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
