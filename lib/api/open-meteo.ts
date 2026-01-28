// Open-Meteo API - Solar Radiation and Weather Forecasts
// Free API - no authentication required

export interface SolarForecastResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  hourly_units: {
    time: string;
    shortwave_radiation: string;
    direct_radiation: string;
    diffuse_radiation: string;
    direct_normal_irradiance: string;
    temperature_2m?: string;
    cloudcover?: string;
  };
  hourly: {
    time: string[];
    shortwave_radiation: number[];
    direct_radiation: number[];
    diffuse_radiation: number[];
    direct_normal_irradiance: number[];
    temperature_2m?: number[];
    cloudcover?: number[];
  };
}

export interface HourlySolarData {
  time: Date;
  ghi: number; // Global Horizontal Irradiance (W/m²)
  dni: number; // Direct Normal Irradiance (W/m²)
  dhi: number; // Diffuse Horizontal Irradiance (W/m²)
  directHorizontal: number; // Direct radiation on horizontal plane
  temperature?: number;
  cloudCover?: number;
  estimatedProduction?: number; // kWh estimate for this hour
}

export interface DailySolarSummary {
  date: Date;
  totalGhi: number; // Total irradiance (Wh/m²)
  avgCloudCover: number;
  avgTemperature: number;
  peakRadiation: number;
  estimatedProduction: number; // kWh
  quality: 'excellent' | 'good' | 'fair' | 'poor';
}

// Default location: Copenhagen, Denmark area (Platanvej)
const DEFAULT_LAT = 55.6761;
const DEFAULT_LON = 12.5683;

/**
 * Fetch solar radiation forecast (up to 16 days)
 */
export async function fetchSolarForecast(
  lat: number = DEFAULT_LAT,
  lon: number = DEFAULT_LON,
  days: number = 7
): Promise<HourlySolarData[]> {
  const url = `https://api.open-meteo.com/v1/forecast?` +
    `latitude=${lat}&longitude=${lon}` +
    `&hourly=shortwave_radiation,direct_radiation,diffuse_radiation,direct_normal_irradiance,temperature_2m,cloudcover` +
    `&timezone=Europe/Copenhagen` +
    `&forecast_days=${Math.min(days, 16)}`;

  try {
    const response = await fetch(url, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`Open-Meteo API error: ${response.status}`);
    }

    const data: SolarForecastResponse = await response.json();

    return data.hourly.time.map((time, i) => ({
      time: new Date(time),
      ghi: data.hourly.shortwave_radiation[i] || 0,
      dni: data.hourly.direct_normal_irradiance[i] || 0,
      dhi: data.hourly.diffuse_radiation[i] || 0,
      directHorizontal: data.hourly.direct_radiation[i] || 0,
      temperature: data.hourly.temperature_2m?.[i],
      cloudCover: data.hourly.cloudcover?.[i],
    }));
  } catch (error) {
    console.error('Failed to fetch solar forecast:', error);
    throw error;
  }
}

/**
 * Fetch tilted panel irradiance (for actual panel orientation)
 */
export async function fetchTiltedIrradiance(
  lat: number = DEFAULT_LAT,
  lon: number = DEFAULT_LON,
  tilt: number = 35, // degrees from horizontal
  azimuth: number = 0, // 0 = south, 90 = west, -90 = east
  days: number = 7
): Promise<{ time: Date; gti: number }[]> {
  const url = `https://api.open-meteo.com/v1/forecast?` +
    `latitude=${lat}&longitude=${lon}` +
    `&hourly=global_tilted_irradiance` +
    `&tilt=${tilt}&azimuth=${azimuth}` +
    `&timezone=Europe/Copenhagen` +
    `&forecast_days=${Math.min(days, 16)}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const data = await response.json();

    return data.hourly.time.map((time: string, i: number) => ({
      time: new Date(time),
      gti: data.hourly.global_tilted_irradiance[i] || 0,
    }));
  } catch (error) {
    console.error('Failed to fetch tilted irradiance:', error);
    throw error;
  }
}

/**
 * Estimate solar production from irradiance data
 *
 * @param solarData - Hourly solar data
 * @param systemSizeKw - System size in kW
 * @param efficiency - System efficiency (0.15-0.22 for typical panels)
 * @param performanceRatio - Overall system performance (typically 0.75-0.85)
 */
export function estimateProduction(
  solarData: HourlySolarData[],
  systemSizeKw: number,
  efficiency: number = 0.20,
  performanceRatio: number = 0.80
): HourlySolarData[] {
  // Panel area estimate: 1 kW ≈ 5-6 m² of modern panels
  const panelArea = systemSizeKw * 5.5;

  return solarData.map(hour => {
    // Production = GHI × Panel Area × Efficiency × Performance Ratio
    // GHI is W/m², we want kWh for 1 hour
    const productionWh = hour.ghi * panelArea * efficiency * performanceRatio;
    const productionKwh = productionWh / 1000;

    // Temperature derating: panels lose ~0.4% efficiency per °C above 25°C
    let tempFactor = 1;
    if (hour.temperature && hour.temperature > 25) {
      tempFactor = 1 - (hour.temperature - 25) * 0.004;
    }

    return {
      ...hour,
      estimatedProduction: Math.max(0, productionKwh * tempFactor),
    };
  });
}

/**
 * Aggregate hourly data into daily summaries
 */
export function aggregateToDailySummary(
  hourlyData: HourlySolarData[],
  systemSizeKw: number
): DailySolarSummary[] {
  const dailyMap = new Map<string, HourlySolarData[]>();

  // Group by date
  hourlyData.forEach(hour => {
    const dateKey = hour.time.toISOString().split('T')[0];
    if (!dailyMap.has(dateKey)) {
      dailyMap.set(dateKey, []);
    }
    dailyMap.get(dateKey)!.push(hour);
  });

  return Array.from(dailyMap.entries()).map(([dateStr, hours]) => {
    const totalGhi = hours.reduce((sum, h) => sum + h.ghi, 0);
    const avgCloudCover = hours.reduce((sum, h) => sum + (h.cloudCover || 0), 0) / hours.length;
    const avgTemperature = hours.filter(h => h.temperature).reduce((sum, h) => sum + (h.temperature || 0), 0) /
                          hours.filter(h => h.temperature).length;
    const peakRadiation = Math.max(...hours.map(h => h.ghi));
    const estimatedProduction = hours.reduce((sum, h) => sum + (h.estimatedProduction || 0), 0);

    // Determine quality based on production relative to ideal
    // Ideal summer day in Denmark: ~35 kWh for 11.6 kW system
    const idealProduction = systemSizeKw * 3; // ~3 kWh/kW on good day
    const productionRatio = estimatedProduction / idealProduction;

    let quality: 'excellent' | 'good' | 'fair' | 'poor';
    if (productionRatio > 0.8) quality = 'excellent';
    else if (productionRatio > 0.5) quality = 'good';
    else if (productionRatio > 0.25) quality = 'fair';
    else quality = 'poor';

    return {
      date: new Date(dateStr),
      totalGhi,
      avgCloudCover,
      avgTemperature: avgTemperature || 10,
      peakRadiation,
      estimatedProduction,
      quality,
    };
  });
}

/**
 * Get current solar conditions
 */
export function getCurrentSolarConditions(hourlyData: HourlySolarData[]): {
  current: HourlySolarData | null;
  todayTotal: number;
  todayRemaining: number;
} {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const todayHours = hourlyData.filter(h =>
    h.time.toISOString().split('T')[0] === todayStr
  );

  const currentHour = todayHours.find(h =>
    h.time.getHours() === now.getHours()
  );

  const todayTotal = todayHours.reduce((sum, h) => sum + (h.estimatedProduction || 0), 0);

  const pastHours = todayHours.filter(h => h.time < now);
  const todayProducedSoFar = pastHours.reduce((sum, h) => sum + (h.estimatedProduction || 0), 0);
  const todayRemaining = todayTotal - todayProducedSoFar;

  return {
    current: currentHour || null,
    todayTotal,
    todayRemaining: Math.max(0, todayRemaining),
  };
}
