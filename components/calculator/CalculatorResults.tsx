'use client';

import { useQuery } from '@tanstack/react-query';
import { CalculatorInput } from '@/lib/validation/calculator';
import { MetricsGrid } from './results/MetricsGrid';
import { SavingsChart } from './results/SavingsChart';
import { ProductionOverview } from './results/ProductionOverview';
import { CostBreakdown } from './results/CostBreakdown';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle } from 'lucide-react';
import Decimal from 'decimal.js';

interface CalculatorResultsProps {
  input: CalculatorInput;
  enabled: boolean;
}

export function CalculatorResults({ input, enabled }: CalculatorResultsProps) {
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
      <Card>
        <CardHeader>
          <CardTitle>Resultater</CardTitle>
          <CardDescription>Udfyld inputfelterne for at se beregninger</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Indtast dine oplysninger i panelerne til venstre</p>
            <p className="text-sm mt-1">Beregningerne opdateres automatisk</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Resultater</CardTitle>
          <CardDescription>Beregner din solcelleinvestering...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-12 w-12 mx-auto mb-3 animate-spin text-primary" />
            <p className="text-muted-foreground">Beregner...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show error state
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Fejl</CardTitle>
          <CardDescription>Der opstod en fejl under beregningen</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-3 p-4 bg-destructive/10 text-destructive rounded-lg">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Kunne ikke beregne resultater</p>
              <p className="text-sm mt-1">{error instanceof Error ? error.message : 'Ukendt fejl'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show results
  if (!calculationResult?.projection) {
    return null;
  }

  const { projection, systemSizeKw, estimatedYield } = calculationResult;

  // Calculate system cost with VAT (25%)
  const VAT_RATE = 0.25;
  const systemCost = new Decimal(input.panelsCost)
    .plus(input.inverterCost)
    .plus(input.installationCost)
    .plus(input.mountingKitCost)
    .times(1 + VAT_RATE);

  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <MetricsGrid
        projection={projection}
        systemSizeKw={systemSizeKw}
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
      />

      {/* Tax Scenarios Comparison */}
      {calculationResult.taxScenarios && (
        <Card>
          <CardHeader>
            <CardTitle>Skattescenarier</CardTitle>
            <CardDescription>
              Sammenligning med og uden håndværkerfradrag
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {/* Without Deduction */}
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-3">Uden håndværkerfradrag</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Systemomkostning:</span>
                    <span className="font-medium">
                      {systemCost.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.')} DKK
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tilbagebetaling:</span>
                    <span className="font-medium">
                      {projection.summary.breakEvenYearReal} år
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-muted-foreground">Total besparelse (25 år):</span>
                    <span className="font-semibold">
                      {projection.summary.totalSavingsReal.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.')} DKK
                    </span>
                  </div>
                </div>
              </div>

              {/* With Deduction */}
              <div className="p-4 border-2 border-primary rounded-lg bg-primary/5">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  Med håndværkerfradrag
                  <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                    Anbefalet
                  </span>
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Effektiv omkostning:</span>
                    <span className="font-medium">
                      {calculationResult.taxScenarios.withDeduction?.effectiveCost
                        .toFixed(0)
                        .replace(/\B(?=(\d{3})+(?!\d))/g, '.')}{' '}
                      DKK
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Skattebesparelse:</span>
                    <span className="font-medium text-green-600">
                      -
                      {calculationResult.taxScenarios.withDeduction?.taxBenefit
                        .toFixed(0)
                        .replace(/\B(?=(\d{3})+(?!\d))/g, '.')}{' '}
                      DKK
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tilbagebetaling:</span>
                    <span className="font-medium">
                      {calculationResult.taxScenarios.withDeduction?.paybackYears} år
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-muted-foreground">Total besparelse (25 år):</span>
                    <span className="font-semibold text-green-600">
                      {calculationResult.taxScenarios.withDeduction?.totalSavings25Years
                        .toFixed(0)
                        .replace(/\B(?=(\d{3})+(?!\d))/g, '.')}{' '}
                      DKK
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg text-sm">
              <p className="text-amber-800 dark:text-amber-200">
                <strong>Bemærk:</strong> Skatteværdierne er estimater. Konsulter SKAT eller en skatteekspert
                for din specifikke situation.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
