'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { CalculatorInput } from '@/lib/validation/calculator';

interface EnergyTabProps {
  input: CalculatorInput;
  onFieldChange: <K extends keyof CalculatorInput>(field: K, value: CalculatorInput[K]) => void;
  errors?: Record<string, string>;
}

export function EnergyTab({ input, onFieldChange, errors }: EnergyTabProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Elpriser og forbrug</h3>
        <p className="text-sm text-muted-foreground">
          Disse værdier bruges til at beregne dine besparelser.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="electricityRate">Nuværende elpris (DKK/kWh)</Label>
          <Input
            id="electricityRate"
            type="number"
            step="0.01"
            min={0.5}
            max={10}
            value={input.electricityRateDkk}
            onChange={(e) => onFieldChange('electricityRateDkk', parseFloat(e.target.value) || 0)}
            placeholder="f.eks. 2.50"
          />
          {errors?.electricityRateDkk && (
            <p className="text-sm text-destructive">{errors.electricityRateDkk}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Inkl. afgifter og moms. Se din seneste elregning.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="selfConsumption">
            Egetforbrug
            <span className="ml-2 text-primary font-normal">
              {Math.round(input.selfConsumptionRate * 100)}%
            </span>
          </Label>
          <Input
            id="selfConsumption"
            type="range"
            min={0.1}
            max={1}
            step={0.05}
            value={input.selfConsumptionRate}
            onChange={(e) => onFieldChange('selfConsumptionRate', parseFloat(e.target.value))}
            className="h-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>10% (meget eksport)</span>
            <span>70% (typisk)</span>
            <span>100% (off-grid)</span>
          </div>
          {errors?.selfConsumptionRate && (
            <p className="text-sm text-destructive">{errors.selfConsumptionRate}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="annualConsumption">Årligt elforbrug (kWh) - valgfrit</Label>
          <Input
            id="annualConsumption"
            type="number"
            min={1000}
            max={50000}
            value={input.annualConsumptionKwh ?? ''}
            onChange={(e) => onFieldChange('annualConsumptionKwh', parseFloat(e.target.value) || undefined)}
            placeholder="f.eks. 5000"
          />
          <p className="text-xs text-muted-foreground">
            Bruges til at beregne selvforsyningsgrad
          </p>
        </div>
      </div>

      <div className="rounded-md bg-muted p-4 space-y-2">
        <p className="text-sm font-medium">Forudsætninger</p>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Salg til nettet: 80% af købspris ({(input.electricityRateDkk * 0.8).toFixed(2)} DKK/kWh)</li>
          <li>• Elpriser stiger 3% årligt (kan ændres under Avanceret)</li>
          <li>• Prisområde {input.priceArea} spot-priser</li>
        </ul>
      </div>
    </div>
  );
}
