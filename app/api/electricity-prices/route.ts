import { NextRequest, NextResponse } from 'next/server';

// Energi Data Service - Danish public API for electricity prices (no auth required)
const ENERGI_DATA_SERVICE_API = 'https://api.energidataservice.dk/dataset/Elspotprices';

interface EnergiDataRecord {
  HourUTC: string;
  HourDK: string;
  PriceArea: string;
  SpotPriceDKK: number;
  SpotPriceEUR: number;
}

interface EnergiDataResponse {
  total: number;
  limit: number;
  dataset: string;
  records: EnergiDataRecord[];
}

interface PriceResponse {
  currentPrice: number;
  averagePrice: number;
  spotPrice: number;
  prices: { hour: string; price: number }[];
  region: string;
  currency: string;
  source: string;
}

// Danish electricity fees and taxes (approximate, 2024 values)
// - Transmission tariff: ~0.10 DKK/kWh
// - System tariff: ~0.05 DKK/kWh
// - Electricity tax (elafgift): ~0.90 DKK/kWh
// - PSO: 0 (phased out)
// Total non-VAT fees: ~1.05 DKK/kWh
// With 25% VAT on everything: ~1.31 DKK/kWh additional
const FEES_AND_TAXES_DKK = 1.30;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const region = searchParams.get('region') || 'DK2';

  try {
    // Get today's date in ISO format for filtering
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    // Fetch spot prices for the region from Energi Data Service
    const url = new URL(ENERGI_DATA_SERVICE_API);
    url.searchParams.set('limit', '48'); // Get 48 hours of data
    url.searchParams.set('filter', JSON.stringify({ PriceArea: region }));
    url.searchParams.set('sort', 'HourDK desc');

    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      console.error('Energi Data Service API error:', response.status, await response.text());
      return NextResponse.json(
        { error: 'Failed to fetch electricity prices' },
        { status: response.status }
      );
    }

    const data: EnergiDataResponse = await response.json();

    if (!data.records || data.records.length === 0) {
      return NextResponse.json(
        { error: 'No price data available' },
        { status: 404 }
      );
    }

    // Find current hour's price
    const currentHourDK = now.toLocaleString('sv-SE', {
      timeZone: 'Europe/Copenhagen',
      hour: '2-digit',
      hour12: false
    });
    const currentDateDK = now.toLocaleDateString('sv-SE', {
      timeZone: 'Europe/Copenhagen'
    });

    const currentRecord = data.records.find((r) => {
      const recordDate = r.HourDK.split('T')[0];
      const recordHour = r.HourDK.split('T')[1]?.substring(0, 2);
      return recordDate === currentDateDK && recordHour === currentHourDK;
    });

    // SpotPriceDKK is in øre/MWh, convert to DKK/kWh (divide by 1000)
    const spotPriceKwh = (currentRecord?.SpotPriceDKK || data.records[0]?.SpotPriceDKK || 0) / 1000;

    // Calculate average of available prices
    const validPrices = data.records
      .filter((r) => r.SpotPriceDKK > 0)
      .map((r) => r.SpotPriceDKK / 1000);
    const averageSpotPrice = validPrices.length > 0
      ? validPrices.reduce((sum, p) => sum + p, 0) / validPrices.length
      : 0;

    // Total price = spot price + fees/taxes
    const currentPrice = spotPriceKwh + FEES_AND_TAXES_DKK;
    const averagePrice = averageSpotPrice + FEES_AND_TAXES_DKK;

    // Format prices for response
    const prices = data.records.slice(0, 24).map((r) => ({
      hour: r.HourDK,
      price: r.SpotPriceDKK / 1000 + FEES_AND_TAXES_DKK,
    }));

    return NextResponse.json({
      currentPrice: Math.round(currentPrice * 100) / 100,
      averagePrice: Math.round(averagePrice * 100) / 100,
      spotPrice: Math.round(spotPriceKwh * 100) / 100,
      prices,
      region,
      currency: 'DKK',
      source: 'Energi Data Service',
    } satisfies PriceResponse);
  } catch (error) {
    console.error('Error fetching electricity prices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch electricity prices' },
      { status: 500 }
    );
  }
}
