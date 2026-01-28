"use client";

import { useState, useEffect, useCallback } from "react";

// Types for API responses
interface PriceData {
  hour: string;
  hourDK: string;
  priceDKK: number;
  priceEUR: number;
  priceArea: string;
  isCheap: boolean;
  isExpensive: boolean;
}

interface PriceStats {
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  currentPrice: number;
  cheapestHours: PriceData[];
  expensiveHours: PriceData[];
}

interface ChargingWindow {
  start: string;
  end: string;
  avgPrice: number;
}

interface PriceResponse {
  success: boolean;
  priceArea: string;
  count: number;
  prices: PriceData[];
  stats: PriceStats;
  optimalChargingWindows: ChargingWindow[];
  tomorrowAvailable: boolean;
  fetchedAt: string;
}

interface SolarHourly {
  time: string;
  ghi: number;
  production: number;
  cloudCover?: number;
  temperature?: number;
}

interface DailySummary {
  date: string;
  estimatedProduction: number;
  peakRadiation: number;
  avgCloudCover: number;
  avgTemperature: number;
  quality: "excellent" | "good" | "fair" | "poor";
}

interface SolarResponse {
  success: boolean;
  systemSizeKw: number;
  currentConditions: {
    ghi: number;
    cloudCover: number;
    temperature: number | null;
    currentProduction: number;
    todayTotal: number;
    todayRemaining: number;
  };
  dailySummaries: DailySummary[];
  hourlyData: SolarHourly[];
  summary: {
    totalForecastedProduction: number;
    avgDailyProduction: number;
  };
  fetchedAt: string;
}

interface Recommendation {
  type: string;
  priority: "high" | "medium" | "low";
  startTime: string;
  endTime: string;
  action: string;
  reason: string;
  estimatedSavings: number;
}

interface ArbitrageOpportunity {
  buyTime: string;
  sellTime: string;
  priceDifferenceOre: number;
}

interface OptimizeResponse {
  success: boolean;
  currentStatus: {
    bestActionNow: string;
    nextCheapHour: string | null;
    nextExpensiveHour: string | null;
    potentialDailySavings: number;
  };
  recommendations: Recommendation[];
  evChargingWindows: { start: string; end: string; avgPrice: number }[];
  peakSolarHours: { start: string; end: string; expectedProduction: number }[];
  arbitrageOpportunities: ArbitrageOpportunity[];
  selfSufficiency: {
    percent: number;
    gridDependency: number;
    recommendations: string[];
  };
  fetchedAt: string;
}

// Hook for electricity prices
export function usePrices(priceArea: "DK1" | "DK2" = "DK1") {
  const [data, setData] = useState<PriceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/prices?area=${priceArea}&mode=all`);
      const json = await response.json();
      if (json.success) {
        setData(json);
      } else {
        setError(json.error || "Failed to fetch prices");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoading(false);
    }
  }, [priceArea]);

  useEffect(() => {
    fetchPrices();
    // Refresh every 5 minutes
    const interval = setInterval(fetchPrices, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchPrices]);

  return { data, loading, error, refetch: fetchPrices };
}

// Hook for solar forecast
export function useSolarForecast(systemSizeKw: number = 11.6) {
  const [data, setData] = useState<SolarResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSolar = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/solar?systemSize=${systemSizeKw}&days=7`);
      const json = await response.json();
      if (json.success) {
        setData(json);
      } else {
        setError(json.error || "Failed to fetch solar data");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoading(false);
    }
  }, [systemSizeKw]);

  useEffect(() => {
    fetchSolar();
    // Refresh every 30 minutes
    const interval = setInterval(fetchSolar, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchSolar]);

  return { data, loading, error, refetch: fetchSolar };
}

// Hook for optimization recommendations
export function useOptimization(config?: {
  priceArea?: "DK1" | "DK2";
  systemSize?: number;
  batteryCapacity?: number;
}) {
  const [data, setData] = useState<OptimizeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOptimization = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        area: config?.priceArea || "DK1",
        systemSize: String(config?.systemSize || 11.6),
        battery: String(config?.batteryCapacity || 10),
      });
      const response = await fetch(`/api/optimize?${params}`);
      const json = await response.json();
      if (json.success) {
        setData(json);
      } else {
        setError(json.error || "Failed to fetch optimization");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoading(false);
    }
  }, [config?.priceArea, config?.systemSize, config?.batteryCapacity]);

  useEffect(() => {
    fetchOptimization();
    // Refresh every 15 minutes
    const interval = setInterval(fetchOptimization, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchOptimization]);

  return { data, loading, error, refetch: fetchOptimization };
}

// Combined hook for all live data
export function useLiveData(config?: {
  priceArea?: "DK1" | "DK2";
  systemSize?: number;
}) {
  const prices = usePrices(config?.priceArea);
  const solar = useSolarForecast(config?.systemSize);
  const optimization = useOptimization(config);

  const isLoading = prices.loading || solar.loading || optimization.loading;
  const hasError = prices.error || solar.error || optimization.error;

  const refetchAll = useCallback(() => {
    prices.refetch();
    solar.refetch();
    optimization.refetch();
  }, [prices, solar, optimization]);

  return {
    prices,
    solar,
    optimization,
    isLoading,
    hasError,
    refetchAll,
  };
}
