'use client';

import { useQuery } from '@tanstack/react-query';
import { CalculatorInput } from '@/lib/validation/calculator';
import { KPIGrid } from './results/KPIGrid';
import { MetricsGrid } from './results/MetricsGrid';
import { SavingsChart } from './results/SavingsChart';
import { ProductionOverview } from './results/ProductionOverview';
import { CostBreakdown } from './results/CostBreakdown';
import { MethodologySection } from './results/MethodologySection';
import { Loader2, AlertCircle } from 'lucide-react';
import Decimal from 'decimal.js';

interface CalculatorResultsProps {
  input: CalculatorInput;
  enabled: boolean;
  onEditCosts?: () => void;
}

export function CalculatorResults({ input, enabled, onEditCosts }: CalculatorResultsProps) {
  const {
    data: calculationResult,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['calculation', input],
    queryFn: async () => {
      const res = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Calculation failed' }));
        throw new Error(errorData.error || 'Calculation failed');
      }
      return res.json();
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 min cache
  });

  // Show empty state when no input yet
  if (!enabled) {
    return (
      <div className="card-premium p-12">
        <div className="text-center">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full"></div>
            <div className="relative p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl">
              <AlertCircle className="h-12 w-12 text-primary/50" />
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-2">Klar til beregning</h3>
          <p className="text-muted-foreground mb-1">
            Indtast dine oplysninger i panelerne til venstre
          </p>
          <p className="text-sm text-muted-foreground">
            Beregningerne opdateres automatisk
          </p>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="card-premium p-12">
        <div className="text-center">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse"></div>
            <Loader2 className="relative h-12 w-12 animate-spin text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Beregner din investering</h3>
          <p className="text-muted-foreground">
            Analyserer data og udregner besparelser...
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="card-premium p-8">
        <div className="flex items-start gap-4 p-6 bg-destructive/5 border border-destructive/20 rounded-xl">
          <div className="p-2 bg-destructive/10 rounded-lg">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
          </div>
          <div>
            <h3 className="font-semibold text-destructive mb-1">Kunne ikke beregne resultater</h3>
            <p className="text-sm text-destructive/80">
              {error instanceof Error ? error.message : 'Ukendt fejl'}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Prov at justere dine input eller kontakt support hvis fejlen fortsætter.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show results
  if (!calculationResult?.projection) {
    return null;
  }

  const { projection, systemSizeKw } = calculationResult;

  // Calculate system cost with VAT (25%)
  const VAT_RATE = 0.25;
  const systemCost = new Decimal(input.panelsCost)
    .plus(input.inverterCost)
    .plus(input.installationCost)
    .plus(input.mountingKitCost)
    .times(1 + VAT_RATE);

  return (
    <div className="space-y-6">
      {/* KPI Grid - Primary metrics at top */}
      <KPIGrid
        projection={projection}
        systemCost={systemCost}
        currency="DKK"
      />

      {/* Savings Chart */}
      <SavingsChart projection={projection} currency="DKK" />

      {/* Production Overview */}
      <ProductionOverview projection={projection} selfConsumptionRate={input.selfConsumptionRate} />

      {/* Cost Breakdown */}
      <CostBreakdown
        costs={{
          panels: new Decimal(input.panelsCost).times(1 + VAT_RATE),
          inverter: new Decimal(input.inverterCost).times(1 + VAT_RATE),
          installation: new Decimal(input.installationCost).times(1 + VAT_RATE),
          other: new Decimal(input.mountingKitCost).times(1 + VAT_RATE),
        }}
        currency="DKK"
        onEditCosts={onEditCosts}
      />

      {/* Methodology Section */}
      <MethodologySection />

      {/* Legacy Metrics Grid - Additional details */}
      <MetricsGrid
        projection={projection}
        systemSizeKw={systemSizeKw}
        systemCost={systemCost}
        currency="DKK"
      />
    </div>
  );
}
