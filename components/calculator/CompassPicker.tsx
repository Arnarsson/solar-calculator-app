'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

const DIRECTIONS = [
  { label: 'N', fullLabel: 'Nord', degrees: 0 },
  { label: 'NØ', fullLabel: 'Nordøst', degrees: 45 },
  { label: 'Ø', fullLabel: 'Øst', degrees: 90 },
  { label: 'SØ', fullLabel: 'Sydøst', degrees: 135 },
  { label: 'S', fullLabel: 'Syd', degrees: 180 },
  { label: 'SV', fullLabel: 'Sydvest', degrees: 225 },
  { label: 'V', fullLabel: 'Vest', degrees: 270 },
  { label: 'NV', fullLabel: 'Nordvest', degrees: 315 },
] as const;

interface CompassPickerProps {
  value: number;
  onChange: (degrees: number) => void;
  className?: string;
}

export function CompassPicker({ value, onChange, className }: CompassPickerProps) {
  const [hoveredDirection, setHoveredDirection] = useState<string | null>(null);

  // Find closest direction to current value
  const getClosestDirection = (degrees: number): typeof DIRECTIONS[number] => {
    let closest: typeof DIRECTIONS[number] = DIRECTIONS[0];
    let minDiff = 360;

    for (const dir of DIRECTIONS) {
      const diff = Math.min(
        Math.abs(dir.degrees - degrees),
        360 - Math.abs(dir.degrees - degrees)
      );
      if (diff < minDiff) {
        minDiff = diff;
        closest = dir;
      }
    }
    return closest;
  };

  const selectedDirection = getClosestDirection(value);

  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      {/* Compass circle */}
      <div className="relative w-48 h-48">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-2 border-border bg-muted/30" />

        {/* Center dot */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary" />

        {/* Direction indicator line */}
        <div
          className="absolute top-1/2 left-1/2 w-1 h-20 origin-bottom transition-transform duration-200"
          style={{
            transform: `translate(-50%, -100%) rotate(${value}deg)`,
          }}
        >
          <div className="w-full h-full bg-gradient-to-t from-primary to-primary/60 rounded-full" />
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary shadow-lg" />
        </div>

        {/* Direction buttons */}
        {DIRECTIONS.map((dir, index) => {
          const angle = (dir.degrees - 90) * (Math.PI / 180); // -90 to start from top
          const radius = 80; // Distance from center
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          const isSelected = selectedDirection.degrees === dir.degrees;
          const isHovered = hoveredDirection === dir.label;

          return (
            <button
              key={dir.label}
              type="button"
              onClick={() => onChange(dir.degrees)}
              onMouseEnter={() => setHoveredDirection(dir.label)}
              onMouseLeave={() => setHoveredDirection(null)}
              className={cn(
                'absolute w-10 h-10 rounded-full flex items-center justify-center',
                'text-sm font-medium transition-all duration-200',
                'hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                isSelected
                  ? 'bg-primary text-primary-foreground shadow-lg scale-110'
                  : 'bg-background border border-border text-muted-foreground hover:border-primary hover:text-foreground'
              )}
              style={{
                left: `calc(50% + ${x}px - 20px)`,
                top: `calc(50% + ${y}px - 20px)`,
              }}
              title={dir.fullLabel}
            >
              {dir.label}
            </button>
          );
        })}
      </div>

      {/* Selected direction label */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Valgt retning:{' '}
          <span className="font-medium text-foreground">
            {selectedDirection.fullLabel} ({selectedDirection.degrees}°)
          </span>
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {selectedDirection.degrees === 180
            ? 'Optimal for solceller i Danmark'
            : selectedDirection.degrees >= 135 && selectedDirection.degrees <= 225
            ? 'God retning for solceller'
            : selectedDirection.degrees >= 90 && selectedDirection.degrees <= 270
            ? 'Acceptabel retning'
            : 'Suboptimal retning for solceller'}
        </p>
      </div>
    </div>
  );
}
