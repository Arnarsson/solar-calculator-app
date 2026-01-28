'use client';

import dynamic from 'next/dynamic';
import { MapSkeleton } from './MapSkeleton';

// Dynamically import the map content with SSR disabled
const RoofMapContent = dynamic(
  () => import('./RoofMapContent').then((mod) => mod.RoofMapContent),
  {
    ssr: false,
    loading: () => <MapSkeleton />,
  }
);

export interface RoofMapSelectorProps {
  latitude?: number;
  longitude?: number;
  roofAreaM2: number;
  onLocationChange: (lat: number, lng: number) => void;
  onAreaChange: (areaM2: number) => void;
}

export function RoofMapSelector({
  latitude,
  longitude,
  roofAreaM2,
  onLocationChange,
  onAreaChange,
}: RoofMapSelectorProps) {
  return (
    <div className="relative">
      <RoofMapContent
        latitude={latitude}
        longitude={longitude}
        roofAreaM2={roofAreaM2}
        onLocationChange={onLocationChange}
        onAreaChange={onAreaChange}
      />
      <div className="absolute bottom-2 left-2 right-2 bg-background/90 backdrop-blur-sm rounded-md p-2 text-xs text-muted-foreground pointer-events-none">
        <p>Klik for at placere markør. Brug polygon-værktøjet til at tegne tagfladen.</p>
      </div>
    </div>
  );
}
