import Decimal from 'decimal.js';

export interface ProjectionInput {
  systemCost: Decimal;
  annualProductionKwh: Decimal;
  electricityRateDkk: Decimal;
  selfConsumptionRate: Decimal;
  gridFeedInRate: Decimal;
  inflationRate: Decimal;
  electricityInflationRate: Decimal;
  maintenanceCostYear1: Decimal;
  degradationRateFirstYear: Decimal;
  degradationRateAnnual: Decimal;
}

export interface YearResult {
  year: number;
  productionKwh: Decimal;
  electricityRate: Decimal;
  gridFeedInRate: Decimal;
  selfConsumptionSavings: Decimal;
  gridExportEarnings: Decimal;
  savingsNominal: Decimal;
  savingsReal: Decimal;
  maintenanceCost: Decimal;
  netSavingsNominal: Decimal;
  netSavingsReal: Decimal;
  cumulativeNominal: Decimal;
  cumulativeReal: Decimal;
}

export interface ProjectionSummary {
  totalSavingsNominal: Decimal;
  totalSavingsReal: Decimal;
  totalMaintenanceCost: Decimal;
  breakEvenYearNominal: number;
  breakEvenYearReal: number;
  roi25Year: Decimal; // Percentage
}

export interface ProjectionResult {
  years: YearResult[];
  summary: ProjectionSummary;
}

/**
 * Calculate 25-year financial projection with degradation and inflation
 *
 * Key assumptions:
 * - Year 1: 3% LID (light-induced degradation)
 * - Years 2-25: 0.5%/year degradation
 * - Electricity rates inflate at electricityInflationRate
 * - Maintenance costs inflate at general inflationRate
 * - Real values discounted by general inflationRate
 */
export function calculateProjection(input: ProjectionInput): ProjectionResult {
  const years: YearResult[] = [];
  let cumulativeNominal = input.systemCost.negated();
  let cumulativeReal = input.systemCost.negated();
  let breakEvenYearNominal = 0;
  let breakEvenYearReal = 0;
  let totalSavingsNominal = new Decimal(0);
  let totalSavingsReal = new Decimal(0);
  let totalMaintenanceCost = new Decimal(0);

  for (let year = 1; year <= 25; year++) {
    // Production with degradation
    let production: Decimal;
    if (year === 1) {
      production = input.annualProductionKwh.times(
        new Decimal(1).minus(input.degradationRateFirstYear)
      );
    } else {
      const year1Production = input.annualProductionKwh.times(
        new Decimal(1).minus(input.degradationRateFirstYear)
      );
      production = year1Production.times(
        new Decimal(1).minus(input.degradationRateAnnual).pow(year - 1)
      );
    }

    // Electricity rate with inflation
    const electricityRate = input.electricityRateDkk.times(
      new Decimal(1).plus(input.electricityInflationRate).pow(year - 1)
    );
    const gridFeedInRate = input.gridFeedInRate.times(
      new Decimal(1).plus(input.electricityInflationRate).pow(year - 1)
    );

    // Savings calculation
    const selfConsumedKwh = production.times(input.selfConsumptionRate);
    const exportedKwh = production.times(
      new Decimal(1).minus(input.selfConsumptionRate)
    );

    const selfConsumptionSavings = selfConsumedKwh.times(electricityRate);
    const gridExportEarnings = exportedKwh.times(gridFeedInRate);
    const savingsNominal = selfConsumptionSavings.plus(gridExportEarnings);

    // Savings in today's value
    const discountFactor = new Decimal(1).plus(input.inflationRate).pow(year - 1);
    const savingsReal = savingsNominal.dividedBy(discountFactor);

    // Maintenance cost (inflates with general inflation)
    const maintenanceCost = input.maintenanceCostYear1.times(
      new Decimal(1).plus(input.inflationRate).pow(year - 1)
    );
    const maintenanceReal = input.maintenanceCostYear1;

    // Net savings
    const netSavingsNominal = savingsNominal.minus(maintenanceCost);
    const netSavingsReal = savingsReal.minus(maintenanceReal);

    // Cumulative
    cumulativeNominal = cumulativeNominal.plus(netSavingsNominal);
    cumulativeReal = cumulativeReal.plus(netSavingsReal);

    // Track break-even
    if (breakEvenYearNominal === 0 && cumulativeNominal.greaterThanOrEqualTo(0)) {
      breakEvenYearNominal = year;
    }
    if (breakEvenYearReal === 0 && cumulativeReal.greaterThanOrEqualTo(0)) {
      breakEvenYearReal = year;
    }

    // Totals
    totalSavingsNominal = totalSavingsNominal.plus(netSavingsNominal);
    totalSavingsReal = totalSavingsReal.plus(netSavingsReal);
    totalMaintenanceCost = totalMaintenanceCost.plus(maintenanceCost);

    years.push({
      year,
      productionKwh: production,
      electricityRate,
      gridFeedInRate,
      selfConsumptionSavings,
      gridExportEarnings,
      savingsNominal,
      savingsReal,
      maintenanceCost,
      netSavingsNominal,
      netSavingsReal,
      cumulativeNominal,
      cumulativeReal,
    });
  }

  // ROI: (Total profit / Investment) * 100
  const roi25Year = totalSavingsNominal.dividedBy(input.systemCost).times(100);

  return {
    years,
    summary: {
      totalSavingsNominal,
      totalSavingsReal,
      totalMaintenanceCost,
      breakEvenYearNominal,
      breakEvenYearReal,
      roi25Year,
    },
  };
}

/**
 * Format projection for Recharts (Decimal -> number)
 */
export function formatProjectionForChart(result: ProjectionResult) {
  return result.years.map(y => ({
    year: y.year,
    savingsNominal: y.netSavingsNominal.toNumber(),
    savingsReal: y.netSavingsReal.toNumber(),
    cumulativeNominal: y.cumulativeNominal.toNumber(),
    cumulativeReal: y.cumulativeReal.toNumber(),
    productionKwh: y.productionKwh.toNumber(),
  }));
}
