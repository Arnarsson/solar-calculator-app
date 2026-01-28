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
import { HelpCircle, Home, Compass, ArrowUpFromLine, Lightbulb, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface RoofInputProps {
  roofAreaM2: number;
  azimuthDegrees: number;
  tiltDegrees: number;
  onAreaChange: (value: number) => void;
  onAzimuthChange: (value: number) => void;
  onTiltChange: (value: number) => void;
  errors?: Record<string, string>;
}

// Compass direction labels
const AZIMUTH_LABELS: Record<number, string> = {
  0: 'Nord',
  45: 'Nordøst',
  90: 'Øst',
  135: 'Sydøst',
  180: 'Syd',
  225: 'Sydvest',
  270: 'Vest',
  315: 'Nordvest',
  360: 'Nord',
};

function getAzimuthLabel(degrees: number): string {
  const normalized = ((degrees % 360) + 360) % 360;
  const directions = Object.keys(AZIMUTH_LABELS).map(Number).sort((a, b) => a - b);

  let closest = directions[0];
  let minDiff = Math.abs(normalized - closest);

  for (const dir of directions) {
    const diff = Math.abs(normalized - dir);
    if (diff < minDiff) {
      minDiff = diff;
      closest = dir;
    }
  }

  return AZIMUTH_LABELS[closest];
}

// Calculate production efficiency based on orientation and tilt
function getEfficiency(azimuth: number, tilt: number): { score: number; label: string; color: string } {
  // Optimal is south (180°) with 35° tilt for Denmark
  const azimuthFactor = Math.cos((Math.abs(azimuth - 180) * Math.PI) / 180);
  const tiltFactor = 1 - Math.abs(tilt - 35) / 100;
  const score = Math.round((azimuthFactor * 0.6 + tiltFactor * 0.4) * 100);

  if (score >= 90) return { score, label: 'Optimal', color: 'text-green-600' };
  if (score >= 75) return { score, label: 'God', color: 'text-emerald-600' };
  if (score >= 60) return { score, label: 'Acceptabel', color: 'text-amber-600' };
  return { score, label: 'Suboptimal', color: 'text-orange-600' };
}

// Calculate estimated kW capacity from area
function estimateCapacity(areaM2: number): { kw: number; panels: number } {
  const panelArea = 1.7; // m² per panel (standard 400W panel)
  const panelWatt = 400;
  const panels = Math.floor(areaM2 / panelArea);
  const kw = (panels * panelWatt) / 1000;
  return { kw: Math.round(kw * 10) / 10, panels };
}

export function RoofInput({
  roofAreaM2,
  azimuthDegrees,
  tiltDegrees,
  onAreaChange,
  onAzimuthChange,
  onTiltChange,
  errors,
}: RoofInputProps) {
  const efficiency = getEfficiency(azimuthDegrees, tiltDegrees);
  const capacity = estimateCapacity(roofAreaM2);

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Home className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Tagdetaljer</h3>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                <HelpCircle className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-xs">
              <p className="text-sm font-medium">Om tagoplysninger</p>
              <p className="text-xs mt-1 text-muted-foreground">
                Tagets orientering og hældning påvirker hvor meget solenergi dine paneler kan opfange.
                I Danmark giver sydvendte tage med 30-40° hældning op til 15% mere produktion end andre orienteringer.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Roof Area */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label htmlFor="roofArea" className="text-sm font-medium">
                Tagareal til solceller
              </Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="text-muted-foreground hover:text-foreground">
                    <HelpCircle className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-xs">
                    <strong>Sådan måler du:</strong> Mål det område af taget der har direkte sollys og
                    ingen skygge fra skorsten, kviste eller træer. Typisk hus har 30-60 m² egnet tagareal.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <span className="text-sm font-mono bg-muted px-2 py-0.5 rounded">
              {roofAreaM2} m²
            </span>
          </div>

          <Input
            id="roofArea"
            type="number"
            min={10}
            max={500}
            value={roofAreaM2}
            onChange={(e) => onAreaChange(parseFloat(e.target.value) || 0)}
            placeholder="f.eks. 50"
            className="font-mono"
          />
          {errors?.roofAreaM2 && (
            <p className="text-sm text-destructive">{errors.roofAreaM2}</p>
          )}

          {/* Capacity estimate */}
          <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 border">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Estimeret kapacitet</p>
              <p className="font-semibold">{capacity.kw} kW</p>
            </div>
            <div className="flex-1 border-l pl-4">
              <p className="text-xs text-muted-foreground">Ca. antal paneler</p>
              <p className="font-semibold">{capacity.panels} stk</p>
            </div>
          </div>
        </div>

        {/* Orientation (Azimuth) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm font-medium">Tagets orientering</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="text-muted-foreground hover:text-foreground">
                    <HelpCircle className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-xs">
                    <strong>Hvordan finder jeg retningen?</strong> Se på dit tag fra oven (Google Maps).
                    Den retning taget "peger" mod er orienteringen. Syd = taget hælder mod syd.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-primary">
                {getAzimuthLabel(azimuthDegrees)}
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                ({azimuthDegrees}°)
              </span>
            </div>
          </div>

          {/* Visual compass */}
          <div className="relative h-24 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full border-2 border-dashed border-muted-foreground/30" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="w-1 h-8 bg-gradient-to-t from-primary to-primary/50 rounded-full origin-bottom transform transition-transform duration-200"
                style={{ transform: `rotate(${azimuthDegrees}deg) translateY(-8px)` }}
              />
            </div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">N</div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-xs font-medium text-green-600">S</div>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">V</div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">Ø</div>
          </div>

          <Slider
            value={[azimuthDegrees]}
            onValueChange={([v]) => onAzimuthChange(v)}
            min={0}
            max={360}
            step={5}
            className="w-full"
          />

          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Nord (0°)</span>
            <span className="text-green-600 font-medium">Syd (180°) - optimal</span>
            <span>Nord (360°)</span>
          </div>
        </div>

        {/* Tilt angle */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ArrowUpFromLine className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm font-medium">Taghældning</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="text-muted-foreground hover:text-foreground">
                    <HelpCircle className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-xs">
                    <strong>Standard taghældninger:</strong>
                    <br />• Fladt tag: 0-10°
                    <br />• Let hældning: 15-25°
                    <br />• Standard sadeltag: 30-45° (optimal)
                    <br />• Stejlt tag: 50°+
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <span className="text-sm font-semibold font-mono">{tiltDegrees}°</span>
          </div>

          {/* Visual tilt indicator */}
          <div className="flex items-end justify-center h-16 gap-8">
            <div className="flex flex-col items-center">
              <div className="w-16 h-1 bg-muted-foreground/30 rounded" />
              <span className="text-[10px] text-muted-foreground mt-1">Fladt</span>
            </div>
            <div className="flex flex-col items-center">
              <div
                className="w-16 h-1 bg-primary rounded origin-left transition-transform duration-200"
                style={{ transform: `rotate(-${tiltDegrees}deg)` }}
              />
              <span className="text-[10px] text-muted-foreground mt-1">Dit tag</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-1 bg-green-500/50 rounded origin-left" style={{ transform: 'rotate(-35deg)' }} />
              <span className="text-[10px] text-green-600 mt-1">Optimal</span>
            </div>
          </div>

          <Slider
            value={[tiltDegrees]}
            onValueChange={([v]) => onTiltChange(v)}
            min={0}
            max={90}
            step={5}
            className="w-full"
          />

          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Fladt (0°)</span>
            <span className="text-green-600 font-medium">Optimal (35°)</span>
            <span>Lodret (90°)</span>
          </div>
        </div>

        {/* Efficiency score */}
        <div className={`rounded-xl p-4 border ${
          efficiency.score >= 75
            ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800'
            : efficiency.score >= 60
            ? 'bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800'
            : 'bg-orange-50 border-orange-200 dark:bg-orange-950 dark:border-orange-800'
        }`}>
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${
              efficiency.score >= 75 ? 'bg-green-100' : efficiency.score >= 60 ? 'bg-amber-100' : 'bg-orange-100'
            }`}>
              {efficiency.score >= 75 ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : efficiency.score >= 60 ? (
                <Lightbulb className="h-4 w-4 text-amber-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-orange-600" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">Placeringseffektivitet:</span>
                <span className={`font-bold ${efficiency.color}`}>
                  {efficiency.score}% - {efficiency.label}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {efficiency.score >= 75
                  ? 'Din tagplacering er god til solceller og vil give tæt på maksimal produktion.'
                  : efficiency.score >= 60
                  ? 'Acceptabel placering. Overvej om andre dele af taget har bedre orientering.'
                  : 'Suboptimal orientering. Du mister potentielt 20-30% produktion vs. sydvendt tag.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
