import Decimal from 'decimal.js';

export interface PVGISParams {
  latitude: number;
  longitude: number;
  peakPowerKw: number;     // System size in kW
  azimuth: number;          // Degrees from north (180 = south)
  tilt: number;             // Panel tilt angle
  systemLoss?: number;      // Default 14% (cables, inverter, etc.)
}

export interface PVGISResponse {
  annualProductionKwh: Decimal;
  monthlyProduction: { month: number; kWh: Decimal }[];
  optimalTilt: number;
  optimalAzimuth: number;
}

const PVGIS_BASE_URL = 'https://re.jrc.ec.europa.eu/api/v5_2/PVcalc';

/**
 * Fetch solar production estimate from EU PVGIS API
 *
 * Rate limit: 30 req/sec - use caching for repeated queries
 */
export async function fetchPVGISData(params: PVGISParams): Promise<PVGISResponse> {
  const systemLoss = params.systemLoss ?? 14;

  const url = new URL(PVGIS_BASE_URL);
  url.searchParams.set('lat', params.latitude.toString());
  url.searchParams.set('lon', params.longitude.toString());
  url.searchParams.set('peakpower', params.peakPowerKw.toString());
  url.searchParams.set('loss', systemLoss.toString());
  url.searchParams.set('angle', params.tilt.toString());
  url.searchParams.set('aspect', (params.azimuth - 180).toString()); // PVGIS uses -180 to 180
  url.searchParams.set('outputformat', 'json');

  const response = await fetch(url.toString(), {
    next: { revalidate: 86400 }, // Cache for 24 hours
  });

  if (!response.ok) {
    throw new Error(`PVGIS API error: ${response.status}`);
  }

  const data = await response.json();

  // Parse PVGIS response
  const annualProductionKwh = new Decimal(data.outputs.totals.fixed.E_y);

  const monthlyProduction = data.outputs.monthly.fixed.map((m: any, idx: number) => ({
    month: idx + 1,
    kWh: new Decimal(m.E_m),
  }));

  return {
    annualProductionKwh,
    monthlyProduction,
    optimalTilt: data.inputs.mounting_system.fixed.slope.opt ?? params.tilt,
    optimalAzimuth: (data.inputs.mounting_system.fixed.azimuth.opt ?? 0) + 180,
  };
}

/**
 * Estimate annual production from roof area and efficiency
 * Fallback when PVGIS unavailable or for quick estimates
 */
export function estimateProductionFromArea(
  roofAreaM2: Decimal,
  efficiencyPercent: Decimal = new Decimal('20'), // Modern panel ~20%
  sunHoursPerYear: Decimal = new Decimal('950')    // Denmark average
): Decimal {
  // kWh = Area * Efficiency * Sun Hours * Performance Ratio (0.8)
  const performanceRatio = new Decimal('0.8');
  return roofAreaM2
    .times(efficiencyPercent.dividedBy(100))
    .times(sunHoursPerYear)
    .times(performanceRatio);
}
