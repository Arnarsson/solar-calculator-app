// Smart Optimization Engine
// Combines real-time prices + solar forecast for optimal decisions

import { HourlyPrice, getPriceStats, findOptimalChargingWindows } from './energi-data-service';
import { HourlySolarData, DailySolarSummary } from './open-meteo';

export interface OptimizationRecommendation {
  type: 'charge_ev' | 'charge_battery' | 'use_appliances' | 'sell_to_grid' | 'avoid_usage';
  priority: 'high' | 'medium' | 'low';
  startTime: Date;
  endTime: Date;
  reason: string;
  estimatedSavings: number; // DKK
  action: string;
}

export interface SmartSchedule {
  recommendations: OptimizationRecommendation[];
  optimalEvChargingWindows: { start: Date; end: Date; avgPrice: number }[];
  peakSolarHours: { start: Date; end: Date; expectedProduction: number }[];
  gridArbitrageOpportunities: { buyTime: Date; sellTime: Date; priceDiff: number }[];
  summary: {
    potentialDailySavings: number;
    bestActionNow: string;
    nextCheapHour: Date | null;
    nextExpensiveHour: Date | null;
  };
}

/**
 * Generate smart recommendations based on prices and solar forecast
 */
export function generateSmartSchedule(
  prices: HourlyPrice[],
  solarData: HourlySolarData[],
  batteryCapacityKwh: number = 10,
  evChargerKw: number = 11
): SmartSchedule {
  const recommendations: OptimizationRecommendation[] = [];
  const now = new Date();

  // Price analysis
  const priceStats = getPriceStats(prices);
  const avgPrice = priceStats.avg;

  // Find optimal EV charging windows (need ~4 hours for typical charge)
  const evWindows = findOptimalChargingWindows(prices, 4);

  // Find peak solar hours
  const peakSolarHours = findPeakSolarHours(solarData);

  // Find grid arbitrage opportunities
  const arbitrageOpportunities = findArbitrageOpportunities(prices);

  // Generate recommendations for each hour in next 24h
  const next24h = prices.filter(p => {
    const hourTime = new Date(p.hour);
    return hourTime > now && hourTime < new Date(now.getTime() + 24 * 60 * 60 * 1000);
  });

  next24h.forEach(priceHour => {
    const hour = new Date(priceHour.hour);
    const solarHour = solarData.find(s =>
      s.time.getHours() === hour.getHours() &&
      s.time.getDate() === hour.getDate()
    );
    const production = solarHour?.estimatedProduction || 0;
    const priceDKK = priceHour.priceDKK;

    // Cheap price + low solar = charge battery from grid
    if (priceHour.isCheap && production < 1) {
      recommendations.push({
        type: 'charge_battery',
        priority: 'high',
        startTime: hour,
        endTime: new Date(hour.getTime() + 60 * 60 * 1000),
        reason: `Electricity at ${(priceDKK * 100).toFixed(0)} øre/kWh - lowest ${prices.length > 0 ? Math.round((1 - priceDKK / avgPrice) * 100) : 0}% below average`,
        estimatedSavings: (avgPrice - priceDKK) * batteryCapacityKwh,
        action: 'Charge battery from grid now',
      });
    }

    // Cheap price = good for EV charging
    if (priceHour.isCheap) {
      recommendations.push({
        type: 'charge_ev',
        priority: 'medium',
        startTime: hour,
        endTime: new Date(hour.getTime() + 60 * 60 * 1000),
        reason: `Low electricity price: ${(priceDKK * 100).toFixed(0)} øre/kWh`,
        estimatedSavings: (avgPrice - priceDKK) * evChargerKw,
        action: 'Start EV charging',
      });
    }

    // High solar + high price = sell to grid
    if (production > 2 && priceHour.isExpensive) {
      recommendations.push({
        type: 'sell_to_grid',
        priority: 'high',
        startTime: hour,
        endTime: new Date(hour.getTime() + 60 * 60 * 1000),
        reason: `High price (${(priceDKK * 100).toFixed(0)} øre) + good production (${production.toFixed(1)} kWh)`,
        estimatedSavings: production * priceDKK * 0.3, // 30% sell price
        action: 'Export excess to grid at premium',
      });
    }

    // Expensive price = avoid heavy usage
    if (priceHour.isExpensive && production < 1) {
      recommendations.push({
        type: 'avoid_usage',
        priority: 'medium',
        startTime: hour,
        endTime: new Date(hour.getTime() + 60 * 60 * 1000),
        reason: `Price peak: ${(priceDKK * 100).toFixed(0)} øre/kWh`,
        estimatedSavings: priceDKK * 2, // Assume 2 kWh saved
        action: 'Avoid running dishwasher, washing machine',
      });
    }

    // High solar = use appliances
    if (production > 3) {
      recommendations.push({
        type: 'use_appliances',
        priority: 'low',
        startTime: hour,
        endTime: new Date(hour.getTime() + 60 * 60 * 1000),
        reason: `Peak solar production: ${production.toFixed(1)} kWh expected`,
        estimatedSavings: Math.min(production, 2) * avgPrice,
        action: 'Run energy-intensive appliances (washing, dishwasher)',
      });
    }
  });

  // Sort by priority and time
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  recommendations.sort((a, b) => {
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return a.startTime.getTime() - b.startTime.getTime();
  });

  // Deduplicate similar recommendations
  const deduped = deduplicateRecommendations(recommendations);

  // Calculate potential daily savings
  const potentialDailySavings = deduped
    .filter(r => r.priority === 'high')
    .reduce((sum, r) => sum + r.estimatedSavings, 0);

  // Find next cheap/expensive hours
  const futureprices = prices.filter(p => new Date(p.hour) > now);
  const nextCheap = futureprices.find(p => p.isCheap);
  const nextExpensive = futureprices.find(p => p.isExpensive);

  // Determine best action now
  const currentPrice = prices.find(p => {
    const h = new Date(p.hour);
    return h.getHours() === now.getHours() && h.getDate() === now.getDate();
  });
  const currentSolar = solarData.find(s =>
    s.time.getHours() === now.getHours() && s.time.getDate() === now.getDate()
  );

  let bestActionNow = 'Normal operation';
  if (currentPrice?.isCheap) {
    bestActionNow = 'Charge EV/battery - prices are low!';
  } else if (currentPrice?.isExpensive && (currentSolar?.estimatedProduction || 0) > 2) {
    bestActionNow = 'Maximize grid export - high prices!';
  } else if ((currentSolar?.estimatedProduction || 0) > 4) {
    bestActionNow = 'Run appliances - peak solar production!';
  }

  return {
    recommendations: deduped.slice(0, 10), // Top 10 recommendations
    optimalEvChargingWindows: evWindows,
    peakSolarHours,
    gridArbitrageOpportunities: arbitrageOpportunities,
    summary: {
      potentialDailySavings,
      bestActionNow,
      nextCheapHour: nextCheap ? new Date(nextCheap.hour) : null,
      nextExpensiveHour: nextExpensive ? new Date(nextExpensive.hour) : null,
    },
  };
}

/**
 * Find peak solar production hours
 */
interface PeakPeriod {
  start: Date;
  hours: HourlySolarData[];
}

function findPeakSolarHours(
  solarData: HourlySolarData[]
): { start: Date; end: Date; expectedProduction: number }[] {
  const peaks: { start: Date; end: Date; expectedProduction: number }[] = [];
  let currentPeak: PeakPeriod | null = null;

  solarData.forEach(hour => {
    const production = hour.estimatedProduction || 0;

    if (production > 2) { // Significant production threshold
      if (!currentPeak) {
        currentPeak = { start: hour.time, hours: [hour] };
      } else {
        currentPeak.hours.push(hour);
      }
    } else if (currentPeak) {
      // End of peak period
      peaks.push({
        start: currentPeak.start,
        end: currentPeak.hours[currentPeak.hours.length - 1].time,
        expectedProduction: currentPeak.hours.reduce((sum: number, h: HourlySolarData) => sum + (h.estimatedProduction || 0), 0),
      });
      currentPeak = null;
    }
  });

  // Don't forget last peak
  if (currentPeak !== null) {
    const peak = currentPeak as PeakPeriod;
    peaks.push({
      start: peak.start,
      end: peak.hours[peak.hours.length - 1].time,
      expectedProduction: peak.hours.reduce((sum: number, h: HourlySolarData) => sum + (h.estimatedProduction || 0), 0),
    });
  }

  return peaks;
}

/**
 * Find grid arbitrage opportunities (buy low, sell high with battery)
 */
function findArbitrageOpportunities(
  prices: HourlyPrice[]
): { buyTime: Date; sellTime: Date; priceDiff: number }[] {
  const opportunities: { buyTime: Date; sellTime: Date; priceDiff: number }[] = [];

  // Group by day
  const byDay = new Map<string, HourlyPrice[]>();
  prices.forEach(p => {
    const dayKey = new Date(p.hour).toISOString().split('T')[0];
    if (!byDay.has(dayKey)) byDay.set(dayKey, []);
    byDay.get(dayKey)!.push(p);
  });

  byDay.forEach(dayPrices => {
    if (dayPrices.length < 12) return;

    const sorted = [...dayPrices].sort((a, b) => a.priceDKK - b.priceDKK);
    const cheapest = sorted.slice(0, 4);
    const expensive = sorted.slice(-4);

    cheapest.forEach(cheap => {
      expensive.forEach(exp => {
        // Only if sell time is after buy time
        if (new Date(exp.hour) > new Date(cheap.hour)) {
          const priceDiff = exp.priceDKK - cheap.priceDKK;
          // Only worthwhile if difference > 30 øre (battery efficiency loss)
          if (priceDiff > 0.30) {
            opportunities.push({
              buyTime: new Date(cheap.hour),
              sellTime: new Date(exp.hour),
              priceDiff,
            });
          }
        }
      });
    });
  });

  // Sort by profit potential
  return opportunities.sort((a, b) => b.priceDiff - a.priceDiff).slice(0, 5);
}

/**
 * Remove duplicate/overlapping recommendations
 */
function deduplicateRecommendations(
  recs: OptimizationRecommendation[]
): OptimizationRecommendation[] {
  const seen = new Set<string>();
  return recs.filter(r => {
    const key = `${r.type}-${r.startTime.toISOString().slice(0, 13)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Calculate self-sufficiency potential based on forecast
 */
export function calculateSelfSufficiencyPotential(
  solarData: HourlySolarData[],
  avgDailyConsumption: number = 40 // kWh
): {
  selfSufficiencyPercent: number;
  gridDependencyPercent: number;
  recommendations: string[];
} {
  const totalProduction = solarData.reduce((sum, h) => sum + (h.estimatedProduction || 0), 0);
  const days = Math.ceil(solarData.length / 24);
  const totalConsumption = avgDailyConsumption * days;

  const selfSufficiency = Math.min(100, (totalProduction / totalConsumption) * 100);
  const gridDependency = 100 - selfSufficiency;

  const recommendations: string[] = [];

  if (selfSufficiency < 30) {
    recommendations.push('Consider adding more panels or reducing consumption');
    recommendations.push('Battery storage would significantly improve self-sufficiency');
  } else if (selfSufficiency < 50) {
    recommendations.push('Shift more consumption to peak solar hours');
    recommendations.push('A larger battery could capture more excess production');
  } else if (selfSufficiency < 70) {
    recommendations.push('Good self-sufficiency! Optimize timing of high-power appliances');
  } else {
    recommendations.push('Excellent self-sufficiency! Consider EV charging during solar peaks');
  }

  return {
    selfSufficiencyPercent: selfSufficiency,
    gridDependencyPercent: gridDependency,
    recommendations,
  };
}
