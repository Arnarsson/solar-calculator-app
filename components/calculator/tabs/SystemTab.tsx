'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { CalculatorInput } from '@/lib/validation/calculator';

interface SystemTabProps {
  input: CalculatorInput;
  onFieldChange: <K extends keyof CalculatorInput>(field: K, value: CalculatorInput[K]) => void;
  errors?: Record<string, string>;
}

// Default cost estimates per m² (for estimation guidance)
const COST_ESTIMATES = {
  panels: 1000,      // DKK per m²
  inverter: 400,     // DKK per m²
  installation: 800, // DKK per m²
  mounting: 200,     // DKK per m²
};

export function SystemTab({ input, onFieldChange, errors }: SystemTabProps) {
  const totalBeforeVat = input.panelsCost + input.inverterCost + input.installationCost + input.mountingKitCost;
  const vatAmount = totalBeforeVat * 0.25;
  const totalWithVat = totalBeforeVat + vatAmount;

  // Estimate based on roof area
  const estimatedTotal = input.roofAreaM2 * (COST_ESTIMATES.panels + COST_ESTIMATES.inverter + COST_ESTIMATES.installation + COST_ESTIMATES.mounting);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Systemomkostninger</h3>
        <p className="text-sm text-muted-foreground">
          Indtast omkostninger fra dit tilbud, eller brug vores estimater.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="panelsCost">Solpaneler (DKK)</Label>
          <Input
            id="panelsCost"
            type="number"
            min={0}
            value={input.panelsCost}
            onChange={(e) => onFieldChange('panelsCost', parseFloat(e.target.value) || 0)}
            placeholder="f.eks. 50000"
          />
          <p className="text-xs text-muted-foreground">
            Estimat: {(input.roofAreaM2 * COST_ESTIMATES.panels).toLocaleString('da-DK')} DKK
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="inverterCost">Inverter (DKK)</Label>
          <Input
            id="inverterCost"
            type="number"
            min={0}
            value={input.inverterCost}
            onChange={(e) => onFieldChange('inverterCost', parseFloat(e.target.value) || 0)}
            placeholder="f.eks. 20000"
          />
          <p className="text-xs text-muted-foreground">
            Estimat: {(input.roofAreaM2 * COST_ESTIMATES.inverter).toLocaleString('da-DK')} DKK
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="installationCost">Installation (DKK)</Label>
          <Input
            id="installationCost"
            type="number"
            min={0}
            value={input.installationCost}
            onChange={(e) => onFieldChange('installationCost', parseFloat(e.target.value) || 0)}
            placeholder="f.eks. 40000"
          />
          <p className="text-xs text-muted-foreground">
            Estimat: {(input.roofAreaM2 * COST_ESTIMATES.installation).toLocaleString('da-DK')} DKK
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="mountingKitCost">Monteringssæt (DKK)</Label>
          <Input
            id="mountingKitCost"
            type="number"
            min={0}
            value={input.mountingKitCost}
            onChange={(e) => onFieldChange('mountingKitCost', parseFloat(e.target.value) || 0)}
            placeholder="f.eks. 10000"
          />
          <p className="text-xs text-muted-foreground">
            Estimat: {(input.roofAreaM2 * COST_ESTIMATES.mounting).toLocaleString('da-DK')} DKK
          </p>
        </div>
      </div>

      {/* Cost Summary */}
      <div className="rounded-md border p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span>Subtotal (ekskl. moms)</span>
          <span>{totalBeforeVat.toLocaleString('da-DK')} DKK</span>
        </div>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Moms (25%)</span>
          <span>{vatAmount.toLocaleString('da-DK')} DKK</span>
        </div>
        <hr className="border-border" />
        <div className="flex justify-between font-medium">
          <span>Total (inkl. moms)</span>
          <span className="text-primary">{totalWithVat.toLocaleString('da-DK')} DKK</span>
        </div>
      </div>

      <div className="rounded-md bg-muted p-3">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium">Tip:</span> Typisk pris for et {input.roofAreaM2} m² anlæg er ca. {estimatedTotal.toLocaleString('da-DK')} DKK (ekskl. moms). Brug dette som udgangspunkt og opdater med faktiske tilbud.
        </p>
      </div>
    </div>
  );
}
