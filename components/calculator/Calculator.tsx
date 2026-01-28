'use client';

import { useState } from 'react';
import { CalculatorTabs } from './CalculatorTabs';
import { CalculatorResults } from './CalculatorResults';
import { MethodologyPanel } from './MethodologyPanel';
import { useCalculatorForm } from '@/hooks/use-calculator-form';
import { Button } from '@/components/ui/button';
import { Sun, RotateCcw, TrendingUp, Zap, BadgePercent } from 'lucide-react';

export function Calculator() {
  const {
    input,
    updateField,
    updateFields,
    reset,
    validationErrors,
    isDirty,
  } = useCalculatorForm();

  const [showMethodology, setShowMethodology] = useState(false);

  const hasValidInput = Object.keys(validationErrors).length === 0 && isDirty;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Hero Header */}
      <header className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>

        <div className="relative container mx-auto px-6 py-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur rounded-full text-sm text-white/80 mb-6">
              <Sun className="h-4 w-4 text-amber-400" />
              <span>Beregn din solcelle-investering</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              Find ud af hvor meget du kan spare
            </h1>
            <p className="text-lg text-slate-300 max-w-xl">
              Præcis beregning af ROI, tilbagebetalingstid og 25-års besparelser baseret på danske forhold og aktuelle elpriser.
            </p>
          </div>

          {/* Quick Stats Preview */}
          <div className="grid grid-cols-3 gap-4 mt-12 max-w-2xl">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 text-emerald-400 mb-2">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Typisk ROI</span>
              </div>
              <div className="text-2xl font-bold text-white">8-12%</div>
              <div className="text-xs text-slate-400 mt-1">årligt afkast</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 text-blue-400 mb-2">
                <Zap className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Tilbagebetaling</span>
              </div>
              <div className="text-2xl font-bold text-white">6-9 år</div>
              <div className="text-xs text-slate-400 mt-1">gennemsnitligt</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 text-amber-400 mb-2">
                <BadgePercent className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Skattefradrag</span>
              </div>
              <div className="text-2xl font-bold text-white">Op til 12.900</div>
              <div className="text-xs text-slate-400 mt-1">DKK årligt</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Calculator Section */}
      <main className="container mx-auto px-6 -mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Input Panel */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="sticky top-8 space-y-6">
              <div className="card-premium p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Dine oplysninger</h2>
                    <p className="text-sm text-slate-500 mt-0.5">Indtast data for beregning</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={reset}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>

                <CalculatorTabs />
              </div>

              {/* Live Summary Card */}
              {isDirty && (
                <div className="card-premium p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                      Live beregning
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Tagareal</span>
                      <span className="text-sm font-semibold text-slate-900">{input.roofAreaM2} m²</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Elpris</span>
                      <span className="text-sm font-semibold text-slate-900">{input.electricityRateDkk.toFixed(2)} kr/kWh</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Egetforbrug</span>
                      <span className="text-sm font-semibold text-slate-900">{Math.round(input.selfConsumptionRate * 100)}%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-7 xl:col-span-8">
            <div className="mb-6 flex items-center gap-4">
              <button
                onClick={() => setShowMethodology(false)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  !showMethodology
                    ? 'bg-slate-900 text-white shadow-lg'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Beregninger
              </button>
              <button
                onClick={() => setShowMethodology(true)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  showMethodology
                    ? 'bg-slate-900 text-white shadow-lg'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Metode & Antagelser
              </button>
            </div>

            {showMethodology ? (
              <MethodologyPanel />
            ) : (
              <CalculatorResults input={input} enabled={hasValidInput} />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-24 py-12 bg-slate-900 text-slate-400">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm">
            Beregninger er estimater. Få professionel rådgivning før investering.
          </p>
          <div className="flex items-center justify-center gap-6 mt-4 text-xs">
            <span>Beregningsmotor v1.0</span>
            <span className="w-1 h-1 rounded-full bg-slate-600"></span>
            <span>EU PVGIS Data</span>
            <span className="w-1 h-1 rounded-full bg-slate-600"></span>
            <span>Decimal Præcision</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
