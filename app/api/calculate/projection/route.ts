import { NextRequest, NextResponse } from 'next/server';
import Decimal from 'decimal.js';
import { calculateProjection } from '@/lib/calculations/projection';
import { serializeProjection } from '@/lib/utils/serialization';

export interface ProjectionRequest {
  systemCost: number;
  annualProductionKwh: number;
  electricityRateDkk: number;
  selfConsumptionRate: number;
  gridFeedInRate: number;
  inflationRate?: number;
  electricityInflationRate?: number;
  maintenanceCostYear1?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: ProjectionRequest = await request.json();

    const projection = calculateProjection({
      systemCost: new Decimal(body.systemCost),
      annualProductionKwh: new Decimal(body.annualProductionKwh),
      electricityRateDkk: new Decimal(body.electricityRateDkk),
      selfConsumptionRate: new Decimal(body.selfConsumptionRate),
      gridFeedInRate: new Decimal(body.gridFeedInRate),
      inflationRate: new Decimal(body.inflationRate ?? 0.02),
      electricityInflationRate: new Decimal(body.electricityInflationRate ?? 0.03),
      maintenanceCostYear1: new Decimal(body.maintenanceCostYear1 ?? 1000),
      degradationRateFirstYear: new Decimal('0.03'),
      degradationRateAnnual: new Decimal('0.005'),
    });

    return NextResponse.json(serializeProjection(projection));
  } catch (error) {
    console.error('Projection calculation error:', error);
    return NextResponse.json(
      { error: 'Projection failed', message: (error as Error).message },
      { status: 500 }
    );
  }
}
