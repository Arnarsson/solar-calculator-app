import Decimal from 'decimal.js';

// Configure Decimal.js globally for financial calculations
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

// Danish electricity constants
export const DANISH_VAT_RATE = new Decimal('0.25'); // 25% VAT
export const DANISH_GRID_CO2_KG_PER_KWH = new Decimal('0.5'); // Danish grid average
export const DEFAULT_SELF_CONSUMPTION = new Decimal('0.7'); // 70% typical
export const DEFAULT_GRID_FEED_IN_RATIO = new Decimal('0.8'); // 80% of retail rate

// Location input (for PVGIS integration)
export interface LocationInput {
  latitude: Decimal;
  longitude: Decimal;
  priceArea: 'DK1' | 'DK2';
}

// Roof parameters
export interface RoofInput {
  areaM2: Decimal;
  azimuthDegrees: Decimal; // 0 = North, 90 = East, 180 = South, 270 = West
  tiltDegrees: Decimal;    // 0 = flat, 90 = vertical
}

// Helper: Create Decimal from string (for clean test code)
export function d(value: string | number): Decimal {
  return new Decimal(value);
}
