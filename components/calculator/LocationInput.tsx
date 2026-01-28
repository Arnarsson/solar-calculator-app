'use client';

import { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { HelpCircle, MapPin, Crosshair, Loader2, CheckCircle2 } from 'lucide-react';

interface LocationInputProps {
  latitude?: number;
  longitude?: number;
  priceArea: 'DK1' | 'DK2';
  onLatitudeChange: (value: number | undefined) => void;
  onLongitudeChange: (value: number | undefined) => void;
  errors?: Record<string, string>;
}

// Danish cities with coordinates for quick selection
const DANISH_CITIES = [
  { name: 'København', lat: 55.6761, lng: 12.5683 },
  { name: 'Aarhus', lat: 56.1629, lng: 10.2039 },
  { name: 'Odense', lat: 55.4038, lng: 10.4024 },
  { name: 'Aalborg', lat: 57.0488, lng: 9.9217 },
  { name: 'Esbjerg', lat: 55.4670, lng: 8.4521 },
  { name: 'Randers', lat: 56.4607, lng: 10.0364 },
  { name: 'Horsens', lat: 55.8607, lng: 9.8503 },
  { name: 'Kolding', lat: 55.4904, lng: 9.4721 },
];

export function LocationInput({
  latitude,
  longitude,
  priceArea,
  onLatitudeChange,
  onLongitudeChange,
  errors,
}: LocationInputProps) {
  const [isLocating, setIsLocating] = useState(false);
  const [locationSuccess, setLocationSuccess] = useState(false);

  const handleGetLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Geolocation understøttes ikke af din browser');
      return;
    }

    setIsLocating(true);
    setLocationSuccess(false);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        onLatitudeChange(Math.round(position.coords.latitude * 10000) / 10000);
        onLongitudeChange(Math.round(position.coords.longitude * 10000) / 10000);
        setIsLocating(false);
        setLocationSuccess(true);
        setTimeout(() => setLocationSuccess(false), 3000);
      },
      (error) => {
        setIsLocating(false);
        console.error('Geolocation error:', error);
        alert('Kunne ikke hente din placering. Tjek at du har givet tilladelse.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [onLatitudeChange, onLongitudeChange]);

  const handleCitySelect = (city: typeof DANISH_CITIES[0]) => {
    onLatitudeChange(city.lat);
    onLongitudeChange(city.lng);
    setLocationSuccess(true);
    setTimeout(() => setLocationSuccess(false), 2000);
  };

  return (
    <TooltipProvider>
      <div className="space-y-5">
        {/* Header with tooltip */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Placering</h3>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="text-muted-foreground hover:text-foreground transition-colors">
                    <HelpCircle className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <p className="text-sm">
                    <strong>Hvorfor er placering vigtig?</strong>
                  </p>
                  <p className="text-xs mt-1 text-muted-foreground">
                    Din placering bestemmer hvor meget solindstråling dit tag modtager årligt.
                    PVGIS (EU's soldata) bruger disse koordinater til præcise beregninger baseret
                    på 10+ års historiske vejrdata.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <p className="text-sm text-muted-foreground">
              Vælg en by eller brug GPS for at finde din præcise placering
            </p>
          </div>

          {/* Auto-locate button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleGetLocation}
            disabled={isLocating}
            className={locationSuccess ? 'border-green-500 text-green-600' : ''}
          >
            {isLocating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : locationSuccess ? (
              <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
            ) : (
              <Crosshair className="h-4 w-4 mr-2" />
            )}
            {isLocating ? 'Finder...' : locationSuccess ? 'Fundet!' : 'Brug GPS'}
          </Button>
        </div>

        {/* Quick city selection */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">
            Hurtig valg - større byer
          </Label>
          <div className="flex flex-wrap gap-2">
            {DANISH_CITIES.map((city) => (
              <button
                key={city.name}
                onClick={() => handleCitySelect(city)}
                className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
                  latitude !== undefined && longitude !== undefined &&
                  Math.abs(latitude - city.lat) < 0.01 && Math.abs(longitude - city.lng) < 0.01
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-muted/50 hover:bg-muted border-border hover:border-primary/50'
                }`}
              >
                {city.name}
              </button>
            ))}
          </div>
        </div>

        {/* Coordinate inputs */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="latitude">Breddegrad</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="text-muted-foreground hover:text-foreground">
                    <HelpCircle className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Nord-syd position (54.5° - 57.8° for Danmark)</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Input
              id="latitude"
              type="number"
              step="0.0001"
              min={54.5}
              max={57.8}
              value={latitude ?? ''}
              onChange={(e) => {
                const val = e.target.value;
                onLatitudeChange(val ? parseFloat(val) : undefined);
              }}
              placeholder="f.eks. 55.6761"
              className="font-mono"
            />
            {errors?.latitude && (
              <p className="text-sm text-destructive">{errors.latitude}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="longitude">Længdegrad</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="text-muted-foreground hover:text-foreground">
                    <HelpCircle className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Øst-vest position (8.0° - 15.2° for Danmark)</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Input
              id="longitude"
              type="number"
              step="0.0001"
              min={8.0}
              max={15.2}
              value={longitude ?? ''}
              onChange={(e) => {
                const val = e.target.value;
                onLongitudeChange(val ? parseFloat(val) : undefined);
              }}
              placeholder="f.eks. 12.5683"
              className="font-mono"
            />
            {errors?.longitude && (
              <p className="text-sm text-destructive">{errors.longitude}</p>
            )}
          </div>
        </div>

        {/* Price area indicator with explanation */}
        <div className="rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <CheckCircle2 className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">Prisområde:</span>
                <span className="px-2 py-0.5 bg-primary text-primary-foreground text-sm rounded-md font-semibold">
                  {priceArea}
                </span>
                <span className="text-muted-foreground">
                  ({priceArea === 'DK1' ? 'Vestdanmark' : 'Østdanmark'})
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                Automatisk detekteret. Prisområdet påvirker elpriser ved salg til nettet.
                {priceArea === 'DK2'
                  ? ' Østdanmark har typisk lidt lavere spotpriser end vest.'
                  : ' Vestdanmark har flere vindmøller og større prisudsving.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
