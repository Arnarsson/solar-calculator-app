'use client';

import { DollarSign, Percent, ToggleLeft, ToggleRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  type WizardData,
  getEstimatedPanelsCost,
  getEstimatedInverterCost,
  getEstimatedInstallationCost,
  getEstimatedOtherCost,
} from '../WizardLayout';

interface Step2CostsProps {
  data: WizardData;
  onChange: (data: Partial<WizardData>) => void;
}

interface CostLineProps {
  label: string;
  description: string;
  value: number;
  estimateValue: number;
  useEstimate: boolean;
  onValueChange: (value: number) => void;
  onToggleEstimate: (useEstimate: boolean) => void;
}

function CostLine({
  label,
  description,
  value,
  estimateValue,
  useEstimate,
  onValueChange,
  onToggleEstimate,
}: CostLineProps) {
  const displayValue = useEstimate ? estimateValue : value;

  return (
    <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors">
      <div className="flex items-start justify-between gap-4">
        {/* Label and description */}
        <div className="flex-1 min-w-0">
          <Label className="text-sm font-semibold text-slate-900">{label}</Label>
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        </div>

        {/* Value input or estimate display */}
        <div className="flex items-center gap-3">
          {useEstimate ? (
            <div className="text-right">
              <span className="text-lg font-bold text-slate-900">
                {estimateValue.toLocaleString('da-DK')}
              </span>
              <span className="text-sm text-slate-500 ml-1">kr</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="0"
                max="500000"
                step="1000"
                value={value}
                onChange={(e) => onValueChange(parseFloat(e.target.value) || 0)}
                className="w-28 text-right"
                disabled={useEstimate}
              />
              <span className="text-sm text-slate-500">kr</span>
            </div>
          )}
        </div>
      </div>

      {/* Estimate toggle */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
        <span className="text-xs text-slate-500">
          {useEstimate ? 'Bruger estimat baseret på tagflade' : 'Manuel indtastning'}
        </span>
        <button
          type="button"
          onClick={() => onToggleEstimate(!useEstimate)}
          className={cn(
            'flex items-center gap-2 text-xs font-medium transition-colors',
            useEstimate
              ? 'text-primary hover:text-primary/80'
              : 'text-slate-500 hover:text-slate-700'
          )}
        >
          {useEstimate ? (
            <>
              <ToggleRight className="h-5 w-5" />
              Brug estimat
            </>
          ) : (
            <>
              <ToggleLeft className="h-5 w-5" />
              Angiv selv
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export function Step2Costs({ data, onChange }: Step2CostsProps) {
  // Calculate estimates based on roof area
  const estimates = {
    panels: getEstimatedPanelsCost(data.roofAreaM2),
    inverter: getEstimatedInverterCost(data.roofAreaM2),
    installation: getEstimatedInstallationCost(data.roofAreaM2),
    other: getEstimatedOtherCost(data.roofAreaM2),
  };

  // Calculate totals
  const subtotal =
    (data.panelsCostUseEstimate ? estimates.panels : data.panelsCost) +
    (data.inverterCostUseEstimate ? estimates.inverter : data.inverterCost) +
    (data.installationCostUseEstimate ? estimates.installation : data.installationCost) +
    (data.otherCostUseEstimate ? estimates.other : data.otherCost);

  const VAT_RATE = 0.25;
  const vatAmount = Math.round(subtotal * VAT_RATE);
  const totalWithVat = subtotal + vatAmount;

  // Calculate cost per kWp for reference
  const systemSizeKw = data.roofAreaM2 / 6;
  const costPerKwp = Math.round(totalWithVat / systemSizeKw);

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <DollarSign className="h-5 w-5 text-primary" />
          </div>
          Omkostninger
        </CardTitle>
        <CardDescription>
          Angiv priser eller brug vores estimater baseret på din tagflade ({data.roofAreaM2} m²)
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Cost lines */}
        <CostLine
          label="Solpaneler"
          description="Pris for selve solcellepanelerne"
          value={data.panelsCost}
          estimateValue={estimates.panels}
          useEstimate={data.panelsCostUseEstimate}
          onValueChange={(value) => onChange({ panelsCost: value })}
          onToggleEstimate={(useEstimate) => onChange({ panelsCostUseEstimate: useEstimate })}
        />

        <CostLine
          label="Inverter"
          description="Omformer DC til AC strøm"
          value={data.inverterCost}
          estimateValue={estimates.inverter}
          useEstimate={data.inverterCostUseEstimate}
          onValueChange={(value) => onChange({ inverterCost: value })}
          onToggleEstimate={(useEstimate) => onChange({ inverterCostUseEstimate: useEstimate })}
        />

        <CostLine
          label="Installation"
          description="Arbejdsløn og montering"
          value={data.installationCost}
          estimateValue={estimates.installation}
          useEstimate={data.installationCostUseEstimate}
          onValueChange={(value) => onChange({ installationCost: value })}
          onToggleEstimate={(useEstimate) => onChange({ installationCostUseEstimate: useEstimate })}
        />

        <CostLine
          label="Andet (kabler, beslag mv.)"
          description="Monteringskit, kabler og diverse"
          value={data.otherCost}
          estimateValue={estimates.other}
          useEstimate={data.otherCostUseEstimate}
          onValueChange={(value) => onChange({ otherCost: value })}
          onToggleEstimate={(useEstimate) => onChange({ otherCostUseEstimate: useEstimate })}
        />

        {/* Totals */}
        <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200">
          {/* Subtotal */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Subtotal (ekskl. moms)</span>
            <span className="font-semibold text-slate-900">
              {subtotal.toLocaleString('da-DK')} kr
            </span>
          </div>

          {/* VAT */}
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-slate-600 flex items-center gap-1">
              <Percent className="h-3 w-3" />
              Moms (25%)
            </span>
            <span className="font-semibold text-slate-900">
              {vatAmount.toLocaleString('da-DK')} kr
            </span>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200">
            <span className="font-semibold text-slate-900">Total inkl. moms</span>
            <span className="text-2xl font-bold text-primary">
              {totalWithVat.toLocaleString('da-DK')} kr
            </span>
          </div>

          {/* Cost per kWp reference */}
          <div className="flex items-center justify-between text-xs mt-3 pt-3 border-t border-slate-200">
            <span className="text-slate-500">
              Pris pr. kWp ({systemSizeKw.toFixed(1)} kWp system)
            </span>
            <span className="text-slate-700 font-medium">
              {costPerKwp.toLocaleString('da-DK')} kr/kWp
            </span>
          </div>
        </div>

        {/* Helpful note */}
        <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
          <p className="text-sm text-blue-800">
            <strong>Tip:</strong> Gennemsnitsprisen for et komplet solcelleanlæg i Danmark er
            15.000-20.000 kr/kWp inkl. moms og installation.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
