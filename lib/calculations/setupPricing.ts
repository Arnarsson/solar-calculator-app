import Decimal from 'decimal.js';
import { DANISH_VAT_RATE } from './types';

export interface SetupCostInput {
  panelsCost: Decimal;
  inverterCost: Decimal;
  installationCost: Decimal;
  mountingKitCost: Decimal;
  batteryCost?: Decimal; // Optional for Phase 5
}

export interface SetupCostResult {
  panelsCost: Decimal;
  inverterCost: Decimal;
  installationCost: Decimal;
  mountingKitCost: Decimal;
  batteryCost: Decimal;
  subtotal: Decimal;
  vatRate: Decimal;
  vatAmount: Decimal;
  totalWithVat: Decimal;
}

/**
 * Calculate system setup cost with VAT breakdown
 * Mirrors "Setup & Price" Excel sheet
 */
export function calculateSetupCost(input: SetupCostInput): SetupCostResult {
  const batteryCost = input.batteryCost ?? new Decimal(0);

  const subtotal = input.panelsCost
    .plus(input.inverterCost)
    .plus(input.installationCost)
    .plus(input.mountingKitCost)
    .plus(batteryCost);

  const vatAmount = subtotal.times(DANISH_VAT_RATE);
  const totalWithVat = subtotal.plus(vatAmount);

  return {
    panelsCost: input.panelsCost,
    inverterCost: input.inverterCost,
    installationCost: input.installationCost,
    mountingKitCost: input.mountingKitCost,
    batteryCost,
    subtotal,
    vatRate: DANISH_VAT_RATE,
    vatAmount,
    totalWithVat,
  };
}
