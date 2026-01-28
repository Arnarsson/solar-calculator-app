import { z } from 'zod';

// Denmark coordinate bounds
const DENMARK_LAT_MIN = 54.5;
const DENMARK_LAT_MAX = 57.8;
const DENMARK_LON_MIN = 8.0;
const DENMARK_LON_MAX = 15.2;

export const locationSchema = z.object({
  // Coordinates are optional - used for PVGIS lookup if provided
  latitude: z
    .number()
    .min(DENMARK_LAT_MIN, 'Latitude must be within Denmark')
    .max(DENMARK_LAT_MAX, 'Latitude must be within Denmark')
    .optional(),
  longitude: z
    .number()
    .min(DENMARK_LON_MIN, 'Longitude must be within Denmark')
    .max(DENMARK_LON_MAX, 'Longitude must be within Denmark')
    .optional(),
  // Price area is required for electricity pricing
  priceArea: z.enum(['DK1', 'DK2']),
});

export const roofSchema = z.object({
  roofAreaM2: z
    .number()
    .min(10, 'Minimum roof area is 10 m²')
    .max(500, 'Maximum roof area is 500 m²'),
  azimuthDegrees: z
    .number()
    .min(0, 'Azimuth must be 0-360°')
    .max(360, 'Azimuth must be 0-360°'),
  tiltDegrees: z
    .number()
    .min(0, 'Tilt must be 0-90°')
    .max(90, 'Tilt must be 0-90°'),
});

export const energySchema = z.object({
  electricityRateDkk: z
    .number()
    .min(0.5, 'Rate must be at least 0.50 DKK/kWh')
    .max(10, 'Rate seems too high'),
  selfConsumptionRate: z
    .number()
    .min(0.1, 'Self-consumption must be at least 10%')
    .max(1, 'Self-consumption cannot exceed 100%'),
  annualConsumptionKwh: z
    .number()
    .min(1000, 'Minimum consumption is 1,000 kWh')
    .max(50000, 'Maximum consumption is 50,000 kWh')
    .optional(),
});

export const systemCostSchema = z.object({
  panelsCost: z.number().min(0).max(500000),
  inverterCost: z.number().min(0).max(100000),
  installationCost: z.number().min(0).max(200000),
  mountingKitCost: z.number().min(0).max(50000),
});

export const advancedSchema = z.object({
  inflationRate: z.number().min(0).max(0.1).default(0.02),
  electricityInflationRate: z.number().min(0).max(0.15).default(0.03),
  maintenanceCostYear1: z.number().min(0).max(10000).default(1000),
});

// Complete calculator input schema
export const calculatorInputSchema = z.object({
  ...locationSchema.shape,
  ...roofSchema.shape,
  ...energySchema.shape,
  ...systemCostSchema.shape,
  ...advancedSchema.shape,
});

export type CalculatorInput = z.infer<typeof calculatorInputSchema>;

// Default values for new calculator
export const defaultCalculatorInput: CalculatorInput = {
  // Location (Copenhagen default - optional for basic flow)
  latitude: undefined,
  longitude: undefined,
  priceArea: 'DK2',

  // Roof (typical Danish house)
  roofAreaM2: 50,
  azimuthDegrees: 180, // South-facing
  tiltDegrees: 35,     // Optimal for Denmark

  // Energy
  electricityRateDkk: 2.50,
  selfConsumptionRate: 0.70,
  annualConsumptionKwh: 5000,

  // System costs (typical 10kW system)
  panelsCost: 50000,
  inverterCost: 20000,
  installationCost: 40000,
  mountingKitCost: 10000,

  // Advanced
  inflationRate: 0.02,
  electricityInflationRate: 0.03,
  maintenanceCostYear1: 1000,
};
