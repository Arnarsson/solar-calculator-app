'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { CalculatorInput } from '@/lib/validation/calculator';

interface AdvancedTabProps {
  input: CalculatorInput;
  onFieldChange: <K extends keyof CalculatorInput>(field: K, value: CalculatorInput[K]) => void;
  errors?: Record<string, string>;
}

export function AdvancedTab({ input, onFieldChange, errors }: AdvancedTabProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Avancerede indstillinger</h3>
        <p className="text-sm text-muted-foreground">
          Juster antagelser for 25-års fremskrivningen.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="inflationRate">
            Generel inflation
            <span className="ml-2 text-primary font-normal">
              {(input.inflationRate * 100).toFixed(1)}%
            </span>
          </Label>
          <Input
            id="inflationRate"
            type="range"
            min={0}
            max={0.1}
            step={0.005}
            value={input.inflationRate}
            onChange={(e) => onFieldChange('inflationRate', parseFloat(e.target.value))}
            className="h-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span>2% (standard)</span>
            <span>10%</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="electricityInflationRate">
            Elpris-stigning
            <span className="ml-2 text-primary font-normal">
              {(input.electricityInflationRate * 100).toFixed(1)}%
            </span>
          </Label>
          <Input
            id="electricityInflationRate"
            type="range"
            min={0}
            max={0.15}
            step={0.005}
            value={input.electricityInflationRate}
            onChange={(e) => onFieldChange('electricityInflationRate', parseFloat(e.target.value))}
            className="h-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span>3% (standard)</span>
            <span>15%</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Elpriser har historisk steget hurtigere end den generelle inflation
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="maintenanceCost">Årlig vedligeholdelse (DKK)</Label>
          <Input
            id="maintenanceCost"
            type="number"
            min={0}
            max={10000}
            value={input.maintenanceCostYear1}
            onChange={(e) => onFieldChange('maintenanceCostYear1', parseFloat(e.target.value) || 0)}
            placeholder="f.eks. 1000"
          />
          <p className="text-xs text-muted-foreground">
            Årlig inspektion, rengøring, og mindre reparationer. Typisk 500-2000 DKK.
          </p>
        </div>
      </div>

      {/* Assumptions summary */}
      <div className="rounded-md border-2 border-dashed p-4 space-y-3">
        <p className="text-sm font-medium">Faste antagelser (Phase 1)</p>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• <span className="font-medium">Panel-degradering:</span> 3% første år (LID), derefter 0,5%/år</li>
          <li>• <span className="font-medium">Fremskrivningsperiode:</span> 25 år</li>
          <li>• <span className="font-medium">Afkast ved salg til net:</span> 80% af elpris</li>
        </ul>
        <p className="text-xs text-muted-foreground italic">
          Skattescenarier og finansieringsmuligheder kommer i fremtidige versioner.
        </p>
      </div>

      {/* Transparency note per FIN-06 */}
      <div className="rounded-md bg-amber-50 border border-amber-200 p-4 dark:bg-amber-950 dark:border-amber-800">
        <p className="text-sm text-amber-800 dark:text-amber-200">
          <span className="font-medium">Gennemsigtighed:</span> Alle beregninger bruger ovenstående antagelser.
          Du kan se de præcise formler under hver resultatsektion ved at klikke "Vis beregning".
        </p>
      </div>
    </div>
  );
}
