'use client';

import { useState } from 'react';
import { CalculatorTabs } from './CalculatorTabs';
import { CalculatorResults } from './CalculatorResults';
import { MethodologyPanel } from './MethodologyPanel';
import { useCalculatorForm } from '@/hooks/use-calculator-form';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator as CalculatorIcon, BookOpen, RotateCcw } from 'lucide-react';

export function Calculator() {
  const {
    input,
    updateField,
    updateFields,
    reset,
    validationErrors,
    isDirty,
  } = useCalculatorForm();

  const [activeView, setActiveView] = useState<'results' | 'methodology'>('results');

  // Check if we have enough valid data for calculations
  const hasValidInput = Object.keys(validationErrors).length === 0 && isDirty;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <CalculatorIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Solcelleberegner</h1>
                <p className="text-sm text-muted-foreground">
                  Beregn afkast på din solcelleinvestering
                </p>
              </div>
            </div>

            <Button variant="outline" size="sm" onClick={reset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Nulstil
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Inputs */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="sticky top-6 space-y-4">
              <div className="bg-card border rounded-lg p-6">
                <CalculatorTabs />
              </div>

              {/* Quick summary when scrolling */}
              {isDirty && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-sm">
                  <p className="font-medium text-primary">Indtastet:</p>
                  <p className="text-muted-foreground">
                    {input.roofAreaM2} m² tag • {input.electricityRateDkk.toFixed(2)} DKK/kWh •{' '}
                    {Math.round(input.selfConsumptionRate * 100)}% egetforbrug
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Results */}
          <div className="lg:col-span-7 xl:col-span-8">
            {/* View toggle */}
            <div className="mb-4">
              <Tabs value={activeView} onValueChange={(v) => setActiveView(v as any)}>
                <TabsList>
                  <TabsTrigger value="results">
                    <CalculatorIcon className="h-4 w-4 mr-2" />
                    Resultater
                  </TabsTrigger>
                  <TabsTrigger value="methodology">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Metode
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {activeView === 'results' ? (
              <CalculatorResults input={input} enabled={hasValidInput} />
            ) : (
              <MethodologyPanel />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-12 py-6 text-center text-sm text-muted-foreground">
        <p>
          Alle beregninger er estimater. Få altid professionel rådgivning før køb.
        </p>
        <p className="mt-1">
          Beregningsmotor v1.0.0 • Data fra EU PVGIS
        </p>
      </footer>
    </div>
  );
}
