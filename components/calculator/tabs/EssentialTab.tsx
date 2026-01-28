'use client';

import { LocationInput } from '../LocationInput';
import { RoofInput } from '../RoofInput';
import type { CalculatorInput } from '@/lib/validation/calculator';

interface EssentialTabProps {
  input: CalculatorInput;
  onFieldChange: <K extends keyof CalculatorInput>(field: K, value: CalculatorInput[K]) => void;
  errors?: Record<string, string>;
}

export function EssentialTab({ input, onFieldChange, errors }: EssentialTabProps) {
  return (
    <div className="space-y-8">
      <LocationInput
        latitude={input.latitude}
        longitude={input.longitude}
        priceArea={input.priceArea}
        onLatitudeChange={(v) => onFieldChange('latitude', v)}
        onLongitudeChange={(v) => onFieldChange('longitude', v)}
        errors={errors}
      />

      <hr className="border-border" />

      <RoofInput
        roofAreaM2={input.roofAreaM2}
        azimuthDegrees={input.azimuthDegrees}
        tiltDegrees={input.tiltDegrees}
        onAreaChange={(v) => onFieldChange('roofAreaM2', v)}
        onAzimuthChange={(v) => onFieldChange('azimuthDegrees', v)}
        onTiltChange={(v) => onFieldChange('tiltDegrees', v)}
        errors={errors}
      />
    </div>
  );
}
