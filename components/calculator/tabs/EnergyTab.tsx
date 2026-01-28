'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { HelpCircle, Zap, ArrowRightLeft, Home, TrendingUp, Info } from 'lucide-react';
import type { CalculatorInput } from '@/lib/validation/calculator';

interface EnergyTabProps {
  input: CalculatorInput;
  onFieldChange: <K extends keyof CalculatorInput>(field: K, value: CalculatorInput[K]) => void;
  errors?: Record<string, string>;
}

// Typical consumption benchmarks
const CONSUMPTION_BENCHMARKS = [
  { label: 'Lejlighed', kwh: 2000, icon: '🏢' },
  { label: 'Parcelhus', kwh: 5000, icon: '🏠' },
  { label: 'Stort hus', kwh: 8000, icon: '🏡' },
  { label: 'Varmepumpe', kwh: 12000, icon: '♨️' },
  { label: 'Elbil + VP', kwh: 18000, icon: '🚗' },
];

export function EnergyTab({ input, onFieldChange, errors }: EnergyTabProps) {
  const feedInRate = (input.electricityRateDkk * 0.8).toFixed(2);

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Energi & Priser</h3>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                <HelpCircle className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-xs">
              <p className="text-sm font-medium">Sådan påvirker disse tal din besparelse</p>
              <p className="text-xs mt-1 text-muted-foreground">
                Jo højere elpris, jo mere sparer du per kWh du producerer selv.
                Egetforbrug bestemmer hvor meget du sparer vs. sælger til lavere pris.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Electricity Rate */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label htmlFor="electricityRate" className="text-sm font-medium">
                Din elpris
              </Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="text-muted-foreground hover:text-foreground">
                    <HelpCircle className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-xs">
                    <strong>Hvad skal jeg indtaste?</strong>
                    <br />Find din gennemsnitlige kWh-pris på din elregning.
                    Inkludér transport, afgifter og moms.
                    <br /><br />
                    <strong>Typiske priser (2024):</strong>
                    <br />• Variabel: 2.00-3.50 DKK/kWh
                    <br />• Fast pris: 2.50-4.00 DKK/kWh
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <span className="text-sm font-mono bg-muted px-2 py-0.5 rounded">
              {input.electricityRateDkk.toFixed(2)} kr/kWh
            </span>
          </div>

          <div className="relative">
            <Input
              id="electricityRate"
              type="number"
              step="0.1"
              min={0.5}
              max={10}
              value={input.electricityRateDkk}
              onChange={(e) => onFieldChange('electricityRateDkk', parseFloat(e.target.value) || 0)}
              placeholder="f.eks. 2.50"
              className="font-mono pr-16"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              DKK/kWh
            </span>
          </div>

          {errors?.electricityRateDkk && (
            <p className="text-sm text-destructive">{errors.electricityRateDkk}</p>
          )}

          {/* Quick presets */}
          <div className="flex gap-2">
            {[1.5, 2.0, 2.5, 3.0, 3.5].map((price) => (
              <button
                key={price}
                onClick={() => onFieldChange('electricityRateDkk', price)}
                className={`px-3 py-1 text-xs rounded-full border transition-all ${
                  Math.abs(input.electricityRateDkk - price) < 0.1
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-muted/50 hover:bg-muted border-border hover:border-primary/50'
                }`}
              >
                {price.toFixed(1)} kr
              </button>
            ))}
          </div>
        </div>

        {/* Self-consumption Rate */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm font-medium">Egetforbrug</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="text-muted-foreground hover:text-foreground">
                    <HelpCircle className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-xs">
                    <strong>Hvad er egetforbrug?</strong>
                    <br />Andelen af din solstrøm du bruger selv i stedet for at sælge til nettet.
                    <br /><br />
                    <strong>Hvorfor er det vigtigt?</strong>
                    <br />Du sparer {input.electricityRateDkk.toFixed(2)} kr/kWh ved egetforbrug,
                    men får kun ca. {feedInRate} kr/kWh ved salg.
                    <br /><br />
                    <strong>Typiske værdier:</strong>
                    <br />• Hjemmearbejde/pensionist: 50-70%
                    <br />• Normalt job: 30-50%
                    <br />• Med batteri: 70-90%
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <span className={`text-sm font-semibold ${
              input.selfConsumptionRate >= 0.6 ? 'text-green-600' :
              input.selfConsumptionRate >= 0.4 ? 'text-amber-600' : 'text-orange-600'
            }`}>
              {Math.round(input.selfConsumptionRate * 100)}%
            </span>
          </div>

          {/* Visual indicator */}
          <div className="flex items-center gap-2 h-8">
            <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-300"
                style={{ width: `${input.selfConsumptionRate * 100}%` }}
              />
            </div>
          </div>

          <Slider
            value={[input.selfConsumptionRate]}
            onValueChange={([v]) => onFieldChange('selfConsumptionRate', v)}
            min={0.1}
            max={1}
            step={0.05}
            className="w-full"
          />

          <div className="flex justify-between text-xs text-muted-foreground">
            <span>10% - Sjældent hjemme</span>
            <span className="text-green-600 font-medium">70% - Typisk</span>
            <span>100% - Off-grid</span>
          </div>
        </div>

        {/* Annual Consumption with Benchmarks */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Home className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="annualConsumption" className="text-sm font-medium">
                Årligt elforbrug
              </Label>
              <span className="text-xs text-muted-foreground">(valgfrit)</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="text-muted-foreground hover:text-foreground">
                    <HelpCircle className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-xs">
                    <strong>Find dit forbrug:</strong>
                    <br />Log ind på din elforsyning eller tjek årsopgørelsen.
                    <br /><br />
                    Bruges til at beregne selvforsyningsgrad - hvor stor andel
                    af dit totale forbrug solcellerne dækker.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            {input.annualConsumptionKwh && (
              <span className="text-sm font-mono bg-muted px-2 py-0.5 rounded">
                {input.annualConsumptionKwh.toLocaleString('da-DK')} kWh/år
              </span>
            )}
          </div>

          <Input
            id="annualConsumption"
            type="number"
            min={1000}
            max={50000}
            value={input.annualConsumptionKwh ?? ''}
            onChange={(e) => onFieldChange('annualConsumptionKwh', parseFloat(e.target.value) || undefined)}
            placeholder="f.eks. 5000"
            className="font-mono"
          />

          {/* Benchmark buttons */}
          <div className="flex flex-wrap gap-2">
            {CONSUMPTION_BENCHMARKS.map((benchmark) => (
              <button
                key={benchmark.label}
                onClick={() => onFieldChange('annualConsumptionKwh', benchmark.kwh)}
                className={`px-3 py-1.5 text-xs rounded-lg border transition-all flex items-center gap-1.5 ${
                  input.annualConsumptionKwh === benchmark.kwh
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-muted/50 hover:bg-muted border-border hover:border-primary/50'
                }`}
              >
                <span>{benchmark.icon}</span>
                <span>{benchmark.label}</span>
                <span className="text-[10px] opacity-70">{(benchmark.kwh/1000)}k</span>
              </button>
            ))}
          </div>
        </div>

        {/* Assumptions card */}
        <div className="rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-4 dark:from-blue-950 dark:to-indigo-950 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg dark:bg-blue-900">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Beregningsforudsætninger</p>
              <ul className="text-xs text-blue-700 dark:text-blue-300 mt-2 space-y-1">
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-blue-400" />
                  <span>Salg til nettet: <strong>{feedInRate} DKK/kWh</strong> (80% af købspris)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-blue-400" />
                  <span>Elpriser stiger <strong>3% årligt</strong> (justerbart under Avanceret)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-blue-400" />
                  <span>Prisområde: <strong>{input.priceArea}</strong> spot-priser</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
