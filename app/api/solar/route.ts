// API Route: /api/solar
// Fetches solar radiation forecast from Open-Meteo

import { NextResponse } from 'next/server';
import {
  fetchSolarForecast,
  estimateProduction,
  aggregateToDailySummary,
  getCurrentSolarConditions,
} from '@/lib/api/open-meteo';

// Default system specs from Platanvej installation
const DEFAULT_SYSTEM_SIZE_KW = 11.6;
const DEFAULT_LAT = 55.6761; // Copenhagen area
const DEFAULT_LON = 12.5683;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat') || String(DEFAULT_LAT));
  const lon = parseFloat(searchParams.get('lon') || String(DEFAULT_LON));
  const days = parseInt(searchParams.get('days') || '7');
  const systemSize = parseFloat(searchParams.get('systemSize') || String(DEFAULT_SYSTEM_SIZE_KW));

  try {
    // Fetch raw solar data
    const rawSolarData = await fetchSolarForecast(lat, lon, days);

    // Estimate production based on system size
    const solarWithProduction = estimateProduction(rawSolarData, systemSize);

    // Aggregate to daily summaries
    const dailySummaries = aggregateToDailySummary(solarWithProduction, systemSize);

    // Get current conditions
    const currentConditions = getCurrentSolarConditions(solarWithProduction);

    // Calculate totals
    const totalForecastedProduction = dailySummaries.reduce(
      (sum, day) => sum + day.estimatedProduction,
      0
    );

    return NextResponse.json({
      success: true,
      location: { lat, lon },
      systemSizeKw: systemSize,
      forecastDays: days,
      currentConditions: {
        ghi: currentConditions.current?.ghi || 0,
        cloudCover: currentConditions.current?.cloudCover || 0,
        temperature: currentConditions.current?.temperature || null,
        currentProduction: currentConditions.current?.estimatedProduction || 0,
        todayTotal: currentConditions.todayTotal,
        todayRemaining: currentConditions.todayRemaining,
      },
      dailySummaries: dailySummaries.map(day => ({
        date: day.date.toISOString().split('T')[0],
        estimatedProduction: Math.round(day.estimatedProduction * 10) / 10,
        peakRadiation: Math.round(day.peakRadiation),
        avgCloudCover: Math.round(day.avgCloudCover),
        avgTemperature: Math.round(day.avgTemperature),
        quality: day.quality,
      })),
      hourlyData: solarWithProduction.slice(0, 48).map(hour => ({
        time: hour.time.toISOString(),
        ghi: Math.round(hour.ghi),
        production: Math.round((hour.estimatedProduction || 0) * 100) / 100,
        cloudCover: hour.cloudCover,
        temperature: hour.temperature,
      })),
      summary: {
        totalForecastedProduction: Math.round(totalForecastedProduction),
        avgDailyProduction: Math.round(totalForecastedProduction / dailySummaries.length * 10) / 10,
        bestDay: dailySummaries.reduce((best, day) =>
          day.estimatedProduction > best.estimatedProduction ? day : best
        ),
        worstDay: dailySummaries.reduce((worst, day) =>
          day.estimatedProduction < worst.estimatedProduction ? day : worst
        ),
      },
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Solar fetch error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch solar forecast',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
