'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { HelpCircle, Package, Cpu, Wrench, Layers, Calculator, Sparkles, RotateCcw } from 'lucide-react';
import type { CalculatorInput } from '@/lib/validation/calculator';

interface SystemTabProps {
  input: CalculatorInput;
  onFieldChange: <K extends keyof CalculatorInput>(field: K, value: CalculatorInput[K]) => void;
  errors?: Record<string, string>;
}

// Default cost estimates per kW (based on 2024 market prices)
const COST_PER_KW = {
  budget: { panels: 4000, inverter: 1500, installation: 3000, mounting: 800 },
  standard: { panels: 5000, inverter: 2000, installation: 4000, mounting: 1000 },
  premium: { panels: 7000, inverter: 3000, installation: 5000, mounting: 1200 },
};

// Estimate system size from roof area (approx 5.9 panels/kW, 1.7m² per panel)
function estimateKwFromArea(areaM2: number): number {
  const panelArea = 1.7;
  const panelWatt = 400;
  const panels = Math.floor(areaM2 / panelArea);
  return (panels * panelWatt) / 1000;
}

export function SystemTab({ input, onFieldChange, errors }: SystemTabProps) {
  const totalBeforeVat = input.panelsCost + input.inverterCost + input.installationCost + input.mountingKitCost;
  const vatAmount = totalBeforeVat * 0.25;
  const totalWithVat = totalBeforeVat + vatAmount;

  const estimatedKw = estimateKwFromArea(input.roofAreaM2);
  const pricePerKw = estimatedKw > 0 ? Math.round(totalBeforeVat / estimatedKw) : 0;

  // Apply price tier estimates
  const applyEstimates = (tier: 'budget' | 'standard' | 'premium') => {
    const costs = COST_PER_KW[tier];
    onFieldChange('panelsCost', Math.round(estimatedKw * costs.panels));
    onFieldChange('inverterCost', Math.round(estimatedKw * costs.inverter));
    onFieldChange('installationCost', Math.round(estimatedKw * costs.installation));
    onFieldChange('mountingKitCost', Math.round(estimatedKw * costs.mounting));
  };

  const resetToEstimates = () => applyEstimates('standard');

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Systemomkostninger</h3>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  <HelpCircle className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <p className="text-sm font-medium">Om priserne</p>
                <p className="text-xs mt-1 text-muted-foreground">
                  Indtast omkostninger fra dit tilbud (ekskl. moms). Hvis du ikke har et tilbud endnu,
                  brug vores estimater baseret på {estimatedKw.toFixed(1)} kW systemstørrelse.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Button variant="ghost" size="sm" onClick={resetToEstimates}>
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
            Nulstil
          </Button>
        </div>

        {/* Quick estimate buttons */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">
            Hurtig estimat for {estimatedKw.toFixed(1)} kW system
          </Label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => applyEstimates('budget')}
              className="p-3 rounded-lg border border-border hover:border-primary/50 bg-muted/30 hover:bg-muted transition-all text-left"
            >
              <p className="text-xs text-muted-foreground">Budget</p>
              <p className="font-semibold">{Math.round(estimatedKw * 9300).toLocaleString('da-DK')} kr</p>
              <p className="text-[10px] text-muted-foreground">~9.300 kr/kW</p>
            </button>
            <button
              onClick={() => applyEstimates('standard')}
              className="p-3 rounded-lg border-2 border-primary bg-primary/5 hover:bg-primary/10 transition-all text-left relative"
            >
              <span className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-primary text-primary-foreground text-[10px] rounded-full font-medium">
                Anbefalet
              </span>
              <p className="text-xs text-muted-foreground">Standard</p>
              <p className="font-semibold">{Math.round(estimatedKw * 12000).toLocaleString('da-DK')} kr</p>
              <p className="text-[10px] text-muted-foreground">~12.000 kr/kW</p>
            </button>
            <button
              onClick={() => applyEstimates('premium')}
              className="p-3 rounded-lg border border-border hover:border-primary/50 bg-muted/30 hover:bg-muted transition-all text-left"
            >
              <p className="text-xs text-muted-foreground">Premium</p>
              <p className="font-semibold">{Math.round(estimatedKw * 16200).toLocaleString('da-DK')} kr</p>
              <p className="text-[10px] text-muted-foreground">~16.200 kr/kW</p>
            </button>
          </div>
        </div>

        {/* Cost inputs */}
        <div className="grid grid-cols-2 gap-4">
          {/* Panels */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-blue-500" />
              <Label htmlFor="panelsCost" className="text-sm">Solpaneler</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="text-muted-foreground hover:text-foreground">
                    <HelpCircle className="h-3 w-3" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-xs">
                    <strong>Hvad inkluderer dette?</strong>
                    <br />Selve solpanelerne. Typisk 400W mono-krystallinske paneler.
                    <br /><br />
                    <strong>Kvalitet:</strong>
                    <br />• Budget: Tier-2 producenter
                    <br />• Standard: Jinko, Longi, Trina
                    <br />• Premium: REC, SunPower, LG
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="relative">
              <Input
                id="panelsCost"
                type="number"
                min={0}
                value={input.panelsCost}
                onChange={(e) => onFieldChange('panelsCost', parseFloat(e.target.value) || 0)}
                className="font-mono pr-12"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">DKK</span>
            </div>
          </div>

          {/* Inverter */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Cpu className="h-3.5 w-3.5 text-green-500" />
              <Label htmlFor="inverterCost" className="text-sm">Inverter</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="text-muted-foreground hover:text-foreground">
                    <HelpCircle className="h-3 w-3" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-xs">
                    <strong>Hvad er en inverter?</strong>
                    <br />Konverterer jævnstrøm fra paneler til vekselstrøm til dit hjem.
                    <br /><br />
                    <strong>Typer:</strong>
                    <br />• String inverter (billigst)
                    <br />• Hybrid inverter (m. batteri)
                    <br />• Micro-inverters (dyrere, fleksibel)
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="relative">
              <Input
                id="inverterCost"
                type="number"
                min={0}
                value={input.inverterCost}
                onChange={(e) => onFieldChange('inverterCost', parseFloat(e.target.value) || 0)}
                className="font-mono pr-12"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">DKK</span>
            </div>
          </div>

          {/* Installation */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Wrench className="h-3.5 w-3.5 text-orange-500" />
              <Label htmlFor="installationCost" className="text-sm">Installation</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="text-muted-foreground hover:text-foreground">
                    <HelpCircle className="h-3 w-3" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-xs">
                    <strong>Hvad dækker installationen?</strong>
                    <br />• Montering af paneler og inverter
                    <br />• Elarbejde og tilslutning
                    <br />• Anmeldelse til netselskab
                    <br />• Projektering og dokumentation
                    <br /><br />
                    <span className="text-green-600">Arbejdsløn er fradragsberettiget!</span>
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="relative">
              <Input
                id="installationCost"
                type="number"
                min={0}
                value={input.installationCost}
                onChange={(e) => onFieldChange('installationCost', parseFloat(e.target.value) || 0)}
                className="font-mono pr-12"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">DKK</span>
            </div>
          </div>

          {/* Mounting Kit */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Layers className="h-3.5 w-3.5 text-purple-500" />
              <Label htmlFor="mountingKitCost" className="text-sm">Monteringssæt</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="text-muted-foreground hover:text-foreground">
                    <HelpCircle className="h-3 w-3" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-xs">
                    <strong>Monteringssystemet</strong>
                    <br />Skinner, beslag og fastgørelse til dit tagtype.
                    <br /><br />
                    <strong>Varierer efter tagtype:</strong>
                    <br />• Tegltag: Standard pris
                    <br />• Betontagsten: +10-20%
                    <br />• Fladt tag: +20-30% (stillads)
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="relative">
              <Input
                id="mountingKitCost"
                type="number"
                min={0}
                value={input.mountingKitCost}
                onChange={(e) => onFieldChange('mountingKitCost', parseFloat(e.target.value) || 0)}
                className="font-mono pr-12"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">DKK</span>
            </div>
          </div>
        </div>

        {/* Cost Summary */}
        <div className="rounded-xl border-2 border-dashed border-border p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Calculator className="h-4 w-4 text-primary" />
            Prisoversigt
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal (ekskl. moms)</span>
              <span className="font-mono">{totalBeforeVat.toLocaleString('da-DK')} DKK</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Moms (25%)</span>
              <span className="font-mono">{vatAmount.toLocaleString('da-DK')} DKK</span>
            </div>
            <hr className="border-border" />
            <div className="flex justify-between font-semibold">
              <span>Total (inkl. moms)</span>
              <span className="text-primary text-lg font-mono">{totalWithVat.toLocaleString('da-DK')} DKK</span>
            </div>
          </div>

          {/* Price per kW indicator */}
          <div className="flex items-center justify-between pt-2 border-t border-dashed">
            <span className="text-xs text-muted-foreground">Pris per kW (ekskl. moms)</span>
            <span className={`text-sm font-semibold ${
              pricePerKw < 10000 ? 'text-green-600' :
              pricePerKw < 14000 ? 'text-amber-600' : 'text-orange-600'
            }`}>
              {pricePerKw.toLocaleString('da-DK')} DKK/kW
              <span className="text-xs font-normal text-muted-foreground ml-1">
                ({pricePerKw < 10000 ? 'Godt' : pricePerKw < 14000 ? 'Fair' : 'Dyrt'})
              </span>
            </span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
