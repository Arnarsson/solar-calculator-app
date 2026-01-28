import { NextRequest, NextResponse } from 'next/server';
import Decimal from 'decimal.js';
import { calculateSetupCost } from '@/lib/calculations/setupPricing';
import { calculatePayback } from '@/lib/calculations/payback';
import { calculateTaxScenario, compareTaxScenarios } from '@/lib/calculations/taxScenarios';
import {
  serializeSetupCost,
  serializePayback,
  serializeTaxScenario,
} from '@/lib/utils/serialization';
import { fetchPVGISData, estimateProductionFromArea } from '@/lib/api/pvgis';

export interface CalculateRequest {
  // Location
  latitude: number;
  longitude: number;
  priceArea: 'DK1' | 'DK2';

  // Roof
  roofAreaM2: number;
  azimuthDegrees: number;
  tiltDegrees: number;

  // System costs
  panelsCost: number;
  inverterCost: number;
  installationCost: number;
  mountingKitCost: number;

  // Energy
  electricityRateDkk: number;
  selfConsumptionRate: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: CalculateRequest = await request.json();

    // 1. Calculate setup cost
    const setupCost = calculateSetupCost({
      panelsCost: new Decimal(body.panelsCost),
      inverterCost: new Decimal(body.inverterCost),
      installationCost: new Decimal(body.installationCost),
      mountingKitCost: new Decimal(body.mountingKitCost),
    });

    // 2. Estimate annual production
    // First try PVGIS, fallback to area-based estimate
    let annualProductionKwh: Decimal;
    let productionSource: 'pvgis' | 'estimate';

    try {
      const pvgisData = await fetchPVGISData({
        latitude: body.latitude,
        longitude: body.longitude,
        peakPowerKw: new Decimal(body.roofAreaM2).times('0.2').toNumber(), // ~200W/m2
        azimuth: body.azimuthDegrees,
        tilt: body.tiltDegrees,
      });
      annualProductionKwh = pvgisData.annualProductionKwh;
      productionSource = 'pvgis';
    } catch (error) {
      // Fallback to estimate
      annualProductionKwh = estimateProductionFromArea(new Decimal(body.roofAreaM2));
      productionSource = 'estimate';
    }

    // 3. Calculate payback
    const gridFeedInRate = new Decimal(body.electricityRateDkk).times('0.8');
    const payback = calculatePayback({
      systemCost: setupCost.totalWithVat,
      annualProductionKwh,
      electricityRate: new Decimal(body.electricityRateDkk),
      selfConsumptionRate: new Decimal(body.selfConsumptionRate),
      gridFeedInRate,
    });

    // 4. Calculate tax scenarios
    const taxScenarios = compareTaxScenarios({
      systemCost: setupCost.totalWithVat,
      installationLaborCost: new Decimal(body.installationCost),
      panelsCost: new Decimal(body.panelsCost),
      inverterCost: new Decimal(body.inverterCost),
      annualSavings: payback.annualSavings,
    });

    // 5. Return serialized results
    return NextResponse.json({
      setupCost: serializeSetupCost(setupCost),
      annualProductionKwh: annualProductionKwh.toFixed(2),
      productionSource,
      payback: serializePayback(payback),
      taxScenarios: taxScenarios.map(serializeTaxScenario),
    });
  } catch (error) {
    console.error('Calculation error:', error);
    return NextResponse.json(
      { error: 'Calculation failed', message: (error as Error).message },
      { status: 500 }
    );
  }
}
