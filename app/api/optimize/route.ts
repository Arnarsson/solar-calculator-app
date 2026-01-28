// API Route: /api/optimize
// Combines price + solar data for smart recommendations

import { NextResponse } from 'next/server';
import { fetchSpotPrices, fetchTodayPrices, fetchTomorrowPrices } from '@/lib/api/energi-data-service';
import { fetchSolarForecast, estimateProduction } from '@/lib/api/open-meteo';
import { generateSmartSchedule, calculateSelfSufficiencyPotential } from '@/lib/api/optimizer';

// Default system specs
const DEFAULT_SYSTEM_SIZE_KW = 11.6;
const DEFAULT_BATTERY_CAPACITY_KWH = 10;
const DEFAULT_EV_CHARGER_KW = 11;
const DEFAULT_DAILY_CONSUMPTION = 40;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const priceArea = (searchParams.get('area') as 'DK1' | 'DK2') || 'DK1';
  const systemSize = parseFloat(searchParams.get('systemSize') || String(DEFAULT_SYSTEM_SIZE_KW));
  const batteryCapacity = parseFloat(searchParams.get('battery') || String(DEFAULT_BATTERY_CAPACITY_KWH));
  const evChargerKw = parseFloat(searchParams.get('evCharger') || String(DEFAULT_EV_CHARGER_KW));
  const dailyConsumption = parseFloat(searchParams.get('consumption') || String(DEFAULT_DAILY_CONSUMPTION));

  try {
    // Fetch all data in parallel
    const [todayPrices, tomorrowPrices, solarForecast] = await Promise.all([
      fetchTodayPrices(priceArea),
      fetchTomorrowPrices(priceArea).catch(() => []), // Tomorrow might not be available
      fetchSolarForecast(55.6761, 12.5683, 2), // 2-day forecast
    ]);

    // Combine prices
    const allPrices = [...todayPrices, ...tomorrowPrices];

    // Estimate solar production
    const solarWithProduction = estimateProduction(solarForecast, systemSize);

    // Generate smart schedule
    const schedule = generateSmartSchedule(
      allPrices,
      solarWithProduction,
      batteryCapacity,
      evChargerKw
    );

    // Calculate self-sufficiency
    const selfSufficiency = calculateSelfSufficiencyPotential(
      solarWithProduction,
      dailyConsumption
    );

    return NextResponse.json({
      success: true,
      priceArea,
      systemConfig: {
        systemSizeKw: systemSize,
        batteryCapacityKwh: batteryCapacity,
        evChargerKw,
        dailyConsumption,
      },
      currentStatus: {
        bestActionNow: schedule.summary.bestActionNow,
        nextCheapHour: schedule.summary.nextCheapHour?.toISOString() || null,
        nextExpensiveHour: schedule.summary.nextExpensiveHour?.toISOString() || null,
        potentialDailySavings: Math.round(schedule.summary.potentialDailySavings * 100) / 100,
      },
      recommendations: schedule.recommendations.slice(0, 8).map(r => ({
        type: r.type,
        priority: r.priority,
        startTime: r.startTime.toISOString(),
        endTime: r.endTime.toISOString(),
        action: r.action,
        reason: r.reason,
        estimatedSavings: Math.round(r.estimatedSavings * 100) / 100,
      })),
      evChargingWindows: schedule.optimalEvChargingWindows.map(w => ({
        start: w.start.toISOString(),
        end: w.end.toISOString(),
        avgPrice: Math.round(w.avgPrice * 100) / 100, // øre/kWh
      })),
      peakSolarHours: schedule.peakSolarHours.slice(0, 5).map(p => ({
        start: p.start.toISOString(),
        end: p.end.toISOString(),
        expectedProduction: Math.round(p.expectedProduction * 10) / 10,
      })),
      arbitrageOpportunities: schedule.gridArbitrageOpportunities.slice(0, 3).map(a => ({
        buyTime: a.buyTime.toISOString(),
        sellTime: a.sellTime.toISOString(),
        priceDifferenceOre: Math.round(a.priceDiff * 100), // øre
      })),
      selfSufficiency: {
        percent: Math.round(selfSufficiency.selfSufficiencyPercent),
        gridDependency: Math.round(selfSufficiency.gridDependencyPercent),
        recommendations: selfSufficiency.recommendations,
      },
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Optimization error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate optimization',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
