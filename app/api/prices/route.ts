// API Route: /api/prices
// Fetches real-time electricity prices from Energi Data Service (Danish TSO)

import { NextResponse } from 'next/server';
import {
  fetchSpotPrices,
  fetchTodayPrices,
  fetchTomorrowPrices,
  getPriceStats,
  findOptimalChargingWindows,
} from '@/lib/api/energi-data-service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const priceArea = (searchParams.get('area') as 'DK1' | 'DK2') || 'DK1';
  const mode = searchParams.get('mode') || 'latest'; // latest, today, tomorrow, all
  const hours = parseInt(searchParams.get('hours') || '48');

  try {
    let prices;
    let tomorrow = null;

    switch (mode) {
      case 'today':
        prices = await fetchTodayPrices(priceArea);
        break;
      case 'tomorrow':
        prices = await fetchTomorrowPrices(priceArea);
        break;
      case 'all':
        prices = await fetchTodayPrices(priceArea);
        tomorrow = await fetchTomorrowPrices(priceArea);
        if (tomorrow.length > 0) {
          prices = [...prices, ...tomorrow];
        }
        break;
      default:
        prices = await fetchSpotPrices(priceArea, hours);
    }

    const stats = getPriceStats(prices);
    const chargingWindows = findOptimalChargingWindows(prices, 4);

    return NextResponse.json({
      success: true,
      priceArea,
      count: prices.length,
      prices,
      stats: {
        minPrice: stats.min,
        maxPrice: stats.max,
        avgPrice: stats.avg,
        currentPrice: stats.current,
        cheapestHours: stats.cheapestHours.slice(0, 4),
        expensiveHours: stats.expensiveHours.slice(0, 4),
      },
      optimalChargingWindows: chargingWindows,
      tomorrowAvailable: tomorrow !== null && tomorrow.length > 0,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Price fetch error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch electricity prices',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
