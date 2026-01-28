'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LocationInputProps {
  latitude: number;
  longitude: number;
  priceArea: 'DK1' | 'DK2';
  onLatitudeChange: (value: number) => void;
  onLongitudeChange: (value: number) => void;
  errors?: Record<string, string>;
}

export function LocationInput({
  latitude,
  longitude,
  priceArea,
  onLatitudeChange,
  onLongitudeChange,
  errors,
}: LocationInputProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Placering</h3>
        <p className="text-sm text-muted-foreground">
          Indtast koordinater for din adresse. Disse bruges til at estimere solindstråling.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="latitude">Breddegrad (Latitude)</Label>
          <Input
            id="latitude"
            type="number"
            step="0.0001"
            min={54.5}
            max={57.8}
            value={latitude}
            onChange={(e) => onLatitudeChange(parseFloat(e.target.value) || 0)}
            placeholder="f.eks. 55.6761"
          />
          {errors?.latitude && (
            <p className="text-sm text-destructive">{errors.latitude}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="longitude">Længdegrad (Longitude)</Label>
          <Input
            id="longitude"
            type="number"
            step="0.0001"
            min={8.0}
            max={15.2}
            value={longitude}
            onChange={(e) => onLongitudeChange(parseFloat(e.target.value) || 0)}
            placeholder="f.eks. 12.5683"
          />
          {errors?.longitude && (
            <p className="text-sm text-destructive">{errors.longitude}</p>
          )}
        </div>
      </div>

      <div className="rounded-md bg-muted p-3">
        <p className="text-sm">
          <span className="font-medium">Prisområde:</span>{' '}
          <span className="text-primary">{priceArea}</span>
          <span className="text-muted-foreground ml-2">
            ({priceArea === 'DK1' ? 'Vestdanmark' : 'Østdanmark'})
          </span>
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Detekteret automatisk ud fra din placering
        </p>
      </div>
    </div>
  );
}
