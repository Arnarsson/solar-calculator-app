import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// Type for scenario creation (Prisma Decimal accepts string input)
export interface ScenarioInput {
  name: string;
  formulaVersion?: string;
  input: {
    latitude: string;
    longitude: string;
    priceArea: 'DK1' | 'DK2';
    roofAreaM2: string;
    azimuthDegrees: string;
    tiltDegrees: string;
    systemCostDkk: string;
    panelsCostDkk: string;
    inverterCostDkk: string;
    installationCostDkk: string;
    electricityRateDkk: string;
    selfConsumptionRate: string;
    annualConsumptionKwh: string;
    inflationRate: string;
    electricityInflationRate: string;
    maintenanceCostDkk: string;
  };
}

/**
 * Save a new calculation scenario to the database
 * @param userId - User ID who owns the scenario
 * @param data - Scenario input data with string values for Decimal fields
 * @returns Created scenario with input data
 */
export async function saveScenario(userId: string, data: ScenarioInput) {
  return prisma.calculationScenario.create({
    data: {
      userId,
      name: data.name,
      formulaVersion: data.formulaVersion ?? '1.0.0',
      input: {
        create: {
          latitude: new Prisma.Decimal(data.input.latitude),
          longitude: new Prisma.Decimal(data.input.longitude),
          priceArea: data.input.priceArea,
          roofAreaM2: new Prisma.Decimal(data.input.roofAreaM2),
          azimuthDegrees: new Prisma.Decimal(data.input.azimuthDegrees),
          tiltDegrees: new Prisma.Decimal(data.input.tiltDegrees),
          systemCostDkk: new Prisma.Decimal(data.input.systemCostDkk),
          panelsCostDkk: new Prisma.Decimal(data.input.panelsCostDkk),
          inverterCostDkk: new Prisma.Decimal(data.input.inverterCostDkk),
          installationCostDkk: new Prisma.Decimal(data.input.installationCostDkk),
          electricityRateDkk: new Prisma.Decimal(data.input.electricityRateDkk),
          selfConsumptionRate: new Prisma.Decimal(data.input.selfConsumptionRate),
          annualConsumptionKwh: new Prisma.Decimal(data.input.annualConsumptionKwh),
          inflationRate: new Prisma.Decimal(data.input.inflationRate),
          electricityInflationRate: new Prisma.Decimal(data.input.electricityInflationRate),
          maintenanceCostDkk: new Prisma.Decimal(data.input.maintenanceCostDkk),
        }
      }
    },
    include: { input: true }
  });
}

/**
 * Load a scenario by ID with all related data
 * @param scenarioId - Scenario ID to load
 * @returns Scenario with input and projections, or null if not found
 */
export async function loadScenario(scenarioId: string) {
  return prisma.calculationScenario.findUnique({
    where: { id: scenarioId },
    include: { input: true, projections: true }
  });
}

/**
 * List all scenarios for a user
 * @param userId - User ID to list scenarios for
 * @returns Array of scenario summaries ordered by most recent first
 */
export async function listUserScenarios(userId: string) {
  return prisma.calculationScenario.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      name: true,
      formulaVersion: true,
      createdAt: true,
      updatedAt: true
    }
  });
}

/**
 * Delete a scenario by ID
 * @param scenarioId - Scenario ID to delete
 * @returns Deleted scenario
 */
export async function deleteScenario(scenarioId: string) {
  return prisma.calculationScenario.delete({
    where: { id: scenarioId }
  });
}

/**
 * Update scenario name
 * @param scenarioId - Scenario ID to update
 * @param name - New name for scenario
 * @returns Updated scenario
 */
export async function updateScenarioName(scenarioId: string, name: string) {
  return prisma.calculationScenario.update({
    where: { id: scenarioId },
    data: { name }
  });
}
