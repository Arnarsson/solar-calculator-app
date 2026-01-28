import Decimal from 'decimal.js';

export interface PaybackInput {
  systemCost: Decimal;
  annualProductionKwh: Decimal;
  electricityRate: Decimal;       // DKK/kWh
  selfConsumptionRate: Decimal;   // 0.0 to 1.0
  gridFeedInRate: Decimal;        // DKK/kWh for exported electricity
}

export interface PaybackResult {
  annualSavings: Decimal;
  selfConsumptionSavings: Decimal;
  gridExportEarnings: Decimal;
  paybackYears: Decimal;
  breakEvenYear: number;
}

/**
 * Calculate simple payback period for solar installation
 * Mirrors "Yearly Payback Overview" Excel sheet logic
 */
export function calculatePayback(input: PaybackInput): PaybackResult {
  // Self-consumed electricity savings
  const selfConsumedKwh = input.annualProductionKwh.times(input.selfConsumptionRate);
  const selfConsumptionSavings = selfConsumedKwh.times(input.electricityRate);

  // Grid export earnings
  const exportedKwh = input.annualProductionKwh.times(
    new Decimal(1).minus(input.selfConsumptionRate)
  );
  const gridExportEarnings = exportedKwh.times(input.gridFeedInRate);

  // Total annual savings
  const annualSavings = selfConsumptionSavings.plus(gridExportEarnings);

  // Simple payback period (years)
  const paybackYears = input.systemCost.dividedBy(annualSavings);

  // Break-even year (first full year with positive cumulative)
  const breakEvenYear = paybackYears.ceil().toNumber();

  return {
    annualSavings,
    selfConsumptionSavings,
    gridExportEarnings,
    paybackYears,
    breakEvenYear,
  };
}
