// Danish number formatting utilities

/**
 * Format a number as Danish Kroner (DKK)
 * @param value - The numeric value to format
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted string like "1.234 kr." or "1.234,50 kr."
 */
export function formatDKK(value: number, decimals = 0): string {
  if (decimals === 0) {
    return Math.round(value).toLocaleString('da-DK') + ' kr.';
  }
  return value.toLocaleString('da-DK', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }) + ' kr.';
}

/**
 * Format a number as kilowatt-hours (kWh)
 * @param value - The numeric value to format
 * @returns Formatted string like "1.234 kWh"
 */
export function formatKWh(value: number): string {
  return Math.round(value).toLocaleString('da-DK') + ' kWh';
}

/**
 * Format a number as a percentage
 * @param value - The numeric value (0-100 scale or 0-1 scale)
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted string like "70%" or "70,5%"
 */
export function formatPercent(value: number, decimals = 0): string {
  // If value is in 0-1 scale, convert to percentage
  const percentValue = value <= 1 && value >= 0 ? value * 100 : value;
  return percentValue.toFixed(decimals).replace('.', ',') + '%';
}

/**
 * Format a number as years (Danish format)
 * @param value - The numeric value in years
 * @returns Formatted string like "7,5 år"
 */
export function formatYears(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return rounded.toString().replace('.', ',') + ' år';
}

/**
 * Parse a number from Danish or international format
 * Handles both "1.234,56" (Danish) and "1234.56" (international) formats
 * @param input - The string to parse
 * @returns Parsed number
 */
export function parseNumber(input: string): number {
  // Remove whitespace
  const cleaned = input.replace(/\s/g, '');

  // Check if it's Danish format (has comma as decimal separator)
  if (cleaned.includes(',')) {
    // Danish format: 1.234,56 -> remove dots, replace comma with dot
    return parseFloat(cleaned.replace(/\./g, '').replace(',', '.'));
  }

  // International format: 1,234.56 or 1234.56 -> remove commas
  return parseFloat(cleaned.replace(/,/g, ''));
}

/**
 * Format a number as kilowatts (kW)
 * @param value - The numeric value to format
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted string like "10,5 kW"
 */
export function formatKW(value: number, decimals = 1): string {
  return value.toLocaleString('da-DK', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }) + ' kW';
}

/**
 * Format a number as square meters
 * @param value - The numeric value to format
 * @returns Formatted string like "50 m²"
 */
export function formatM2(value: number): string {
  return Math.round(value).toLocaleString('da-DK') + ' m\u00B2';
}
