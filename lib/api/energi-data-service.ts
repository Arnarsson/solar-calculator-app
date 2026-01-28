// Energi Data Service API - Real Danish Electricity Prices
// Free API from Energinet (Danish TSO) - no authentication required
// Data source: Nord Pool spot prices

export interface SpotPriceRecord {
  HourUTC: string;
  HourDK: string;
  PriceArea: 'DK1' | 'DK2';
  SpotPriceDKK: number;
  SpotPriceEUR: number;
}

export interface SpotPriceResponse {
  total: number;
  filters: string;
  limit: number;
  dataset: string;
  records: SpotPriceRecord[];
}

export interface HourlyPrice {
  hour: Date;
  hourDK: string;
  priceDKK: number; // per kWh (converted from MWh)
  priceEUR: number; // per kWh
  priceArea: 'DK1' | 'DK2';
  isExpensive: boolean;
  isCheap: boolean;
}

const BASE_URL = 'https://api.energidataservice.dk/dataset/Elspotprices';

/**
 * Fetch spot prices from Energi Data Service
 * Prices are in DKK/MWh, we convert to DKK/kWh
 */
export async function fetchSpotPrices(
  priceArea: 'DK1' | 'DK2' = 'DK1',
  hours: number = 48
): Promise<HourlyPrice[]> {
  const filter = encodeURIComponent(JSON.stringify({ PriceArea: priceArea }));
  const url = `${BASE_URL}?limit=${hours}&filter=${filter}&sort=HourUTC%20desc`;

  try {
    const response = await fetch(url, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data: SpotPriceResponse = await response.json();

    // Calculate thresholds for cheap/expensive
    const prices = data.records.map(r => r.SpotPriceDKK);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const cheapThreshold = avgPrice * 0.7;
    const expensiveThreshold = avgPrice * 1.3;

    return data.records.map(record => ({
      hour: new Date(record.HourUTC),
      hourDK: record.HourDK,
      priceDKK: record.SpotPriceDKK / 1000, // Convert MWh to kWh
      priceEUR: record.SpotPriceEUR / 1000,
      priceArea: record.PriceArea,
      isCheap: record.SpotPriceDKK < cheapThreshold,
      isExpensive: record.SpotPriceDKK > expensiveThreshold,
    })).reverse(); // Return chronological order
  } catch (error) {
    console.error('Failed to fetch spot prices:', error);
    throw error;
  }
}

/**
 * Fetch today's prices
 */
export async function fetchTodayPrices(
  priceArea: 'DK1' | 'DK2' = 'DK1'
): Promise<HourlyPrice[]> {
  const filter = encodeURIComponent(JSON.stringify({ PriceArea: priceArea }));
  const url = `${BASE_URL}?start=StartOfDay&filter=${filter}&sort=HourUTC%20asc`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const data: SpotPriceResponse = await response.json();

    const prices = data.records.map(r => r.SpotPriceDKK);
    const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
    const cheapThreshold = avgPrice * 0.7;
    const expensiveThreshold = avgPrice * 1.3;

    return data.records.map(record => ({
      hour: new Date(record.HourUTC),
      hourDK: record.HourDK,
      priceDKK: record.SpotPriceDKK / 1000,
      priceEUR: record.SpotPriceEUR / 1000,
      priceArea: record.PriceArea,
      isCheap: record.SpotPriceDKK < cheapThreshold,
      isExpensive: record.SpotPriceDKK > expensiveThreshold,
    }));
  } catch (error) {
    console.error('Failed to fetch today prices:', error);
    throw error;
  }
}

/**
 * Fetch tomorrow's prices (available after ~13:00 CET)
 */
export async function fetchTomorrowPrices(
  priceArea: 'DK1' | 'DK2' = 'DK1'
): Promise<HourlyPrice[]> {
  const filter = encodeURIComponent(JSON.stringify({ PriceArea: priceArea }));
  const url = `${BASE_URL}?start=StartOfDay%2BP1D&filter=${filter}&sort=HourUTC%20asc`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const data: SpotPriceResponse = await response.json();

    if (data.records.length === 0) {
      return []; // Tomorrow's prices not yet available
    }

    const prices = data.records.map(r => r.SpotPriceDKK);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const cheapThreshold = avgPrice * 0.7;
    const expensiveThreshold = avgPrice * 1.3;

    return data.records.map(record => ({
      hour: new Date(record.HourUTC),
      hourDK: record.HourDK,
      priceDKK: record.SpotPriceDKK / 1000,
      priceEUR: record.SpotPriceEUR / 1000,
      priceArea: record.PriceArea,
      isCheap: record.SpotPriceDKK < cheapThreshold,
      isExpensive: record.SpotPriceDKK > expensiveThreshold,
    }));
  } catch (error) {
    console.error('Failed to fetch tomorrow prices:', error);
    return [];
  }
}

/**
 * Get price statistics for a set of prices
 */
export function getPriceStats(prices: HourlyPrice[]) {
  if (prices.length === 0) {
    return { min: 0, max: 0, avg: 0, current: 0, cheapestHours: [], expensiveHours: [] };
  }

  const priceValues = prices.map(p => p.priceDKK);
  const min = Math.min(...priceValues);
  const max = Math.max(...priceValues);
  const avg = priceValues.reduce((a, b) => a + b, 0) / priceValues.length;

  const now = new Date();
  const currentHour = prices.find(p => {
    const hour = new Date(p.hour);
    return hour.getHours() === now.getHours() &&
           hour.getDate() === now.getDate();
  });

  // Find cheapest 4 hours
  const sortedByPrice = [...prices].sort((a, b) => a.priceDKK - b.priceDKK);
  const cheapestHours = sortedByPrice.slice(0, 4);
  const expensiveHours = sortedByPrice.slice(-4).reverse();

  return {
    min,
    max,
    avg,
    current: currentHour?.priceDKK ?? avg,
    cheapestHours,
    expensiveHours,
  };
}

/**
 * Find optimal charging windows
 */
export function findOptimalChargingWindows(
  prices: HourlyPrice[],
  requiredHours: number = 4
): { start: Date; end: Date; avgPrice: number }[] {
  if (prices.length < requiredHours) return [];

  const windows: { start: Date; end: Date; avgPrice: number }[] = [];

  for (let i = 0; i <= prices.length - requiredHours; i++) {
    const windowPrices = prices.slice(i, i + requiredHours);
    const avgPrice = windowPrices.reduce((sum, p) => sum + p.priceDKK, 0) / requiredHours;
    windows.push({
      start: windowPrices[0].hour,
      end: windowPrices[requiredHours - 1].hour,
      avgPrice,
    });
  }

  // Return top 3 cheapest windows
  return windows.sort((a, b) => a.avgPrice - b.avgPrice).slice(0, 3);
}
