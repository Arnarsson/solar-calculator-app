'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
  // Find closest direction
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

export function RoofInput({
  roofAreaM2,
  azimuthDegrees,
  tiltDegrees,
  onAreaChange,
  onAzimuthChange,
  onTiltChange,
  errors,
}: RoofInputProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Tagdetaljer</h3>
        <p className="text-sm text-muted-foreground">
          Angiv tagets areal og orientering for præcis produktionsberegning.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="roofArea">Tagareal til solceller (m²)</Label>
          <Input
            id="roofArea"
            type="number"
            min={10}
            max={500}
            value={roofAreaM2}
            onChange={(e) => onAreaChange(parseFloat(e.target.value) || 0)}
            placeholder="f.eks. 50"
          />
          {errors?.roofAreaM2 && (
            <p className="text-sm text-destructive">{errors.roofAreaM2}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Det anvendelige tagareal til montering af solceller
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="azimuth">
              Orientering (°)
              <span className="ml-2 text-primary font-normal">
                {getAzimuthLabel(azimuthDegrees)}
              </span>
            </Label>
            <Input
              id="azimuth"
              type="range"
              min={0}
              max={360}
              step={5}
              value={azimuthDegrees}
              onChange={(e) => onAzimuthChange(parseFloat(e.target.value))}
              className="h-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Nord (0°)</span>
              <span>Syd (180°)</span>
              <span>Nord (360°)</span>
            </div>
            {errors?.azimuthDegrees && (
              <p className="text-sm text-destructive">{errors.azimuthDegrees}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tilt">
              Taghældning (°)
              <span className="ml-2 text-muted-foreground font-normal">
                {tiltDegrees}°
              </span>
            </Label>
            <Input
              id="tilt"
              type="range"
              min={0}
              max={90}
              step={5}
              value={tiltDegrees}
              onChange={(e) => onTiltChange(parseFloat(e.target.value))}
              className="h-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Fladt (0°)</span>
              <span>Optimal (35°)</span>
              <span>Lodret (90°)</span>
            </div>
            {errors?.tiltDegrees && (
              <p className="text-sm text-destructive">{errors.tiltDegrees}</p>
            )}
          </div>
        </div>

        <div className="rounded-md bg-blue-50 border border-blue-200 p-3 dark:bg-blue-950 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <span className="font-medium">Tip:</span> Sydvendte tage (180°) med 30-40° hældning giver den bedste produktion i Danmark.
          </p>
        </div>
      </div>
    </div>
  );
}
