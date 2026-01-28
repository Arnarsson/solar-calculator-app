'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, MapPin, Zap, Sun, Home } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import type { WizardData } from '../WizardLayout';

interface Step1BasicInfoProps {
  data: WizardData;
  onChange: (data: Partial<WizardData>) => void;
}

// Price presets for quick selection
const PRICE_PRESETS = [1.5, 2.0, 2.5, 3.0, 3.5];

// Price area options
const PRICE_AREAS = [
  { value: 'DK1' as const, label: 'DK1 (Vestdanmark)', description: 'Jylland og Fyn' },
  { value: 'DK2' as const, label: 'DK2 (Østdanmark)', description: 'Sjælland, Lolland-Falster, Bornholm' },
];

// Compass directions for azimuth
const AZIMUTH_OPTIONS = [
  { value: 0, label: 'Nord', short: 'N' },
  { value: 45, label: 'Nordøst', short: 'NØ' },
  { value: 90, label: 'Øst', short: 'Ø' },
  { value: 135, label: 'Sydøst', short: 'SØ' },
  { value: 180, label: 'Syd', short: 'S' },
  { value: 225, label: 'Sydvest', short: 'SV' },
  { value: 270, label: 'Vest', short: 'V' },
  { value: 315, label: 'Nordvest', short: 'NV' },
];

export function Step1BasicInfo({ data, onChange }: Step1BasicInfoProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handlePriceAreaChange = (value: 'DK1' | 'DK2') => {
    onChange({ priceArea: value });
  };

  const handleElectricityRateChange = (value: number) => {
    onChange({ electricityRateDkk: value });
  };

  const handleSelfConsumptionChange = (value: number[]) => {
    onChange({ selfConsumptionRate: value[0] / 100 });
  };

  const handleRoofAreaChange = (value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0) {
      onChange({ roofAreaM2: num });
    }
  };

  const handleAzimuthChange = (value: number) => {
    onChange({ azimuthDegrees: value });
  };

  const handleTiltChange = (value: number[]) => {
    onChange({ tiltDegrees: value[0] });
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Sun className="h-5 w-5 text-primary" />
          </div>
          Grundlæggende oplysninger
        </CardTitle>
        <CardDescription>
          Fortæl os om dit forbrug og din tagflade
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Price Area Selector */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <MapPin className="h-4 w-4 text-slate-500" />
            Prisområde
          </Label>
          <div className="grid grid-cols-2 gap-3">
            {PRICE_AREAS.map((area) => (
              <button
                key={area.value}
                type="button"
                onClick={() => handlePriceAreaChange(area.value)}
                className={cn(
                  'p-4 rounded-xl border-2 text-left transition-all duration-200',
                  data.priceArea === area.value
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                )}
              >
                <span className="font-semibold text-slate-900">{area.label}</span>
                <p className="text-xs text-slate-500 mt-1">{area.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Electricity Price */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Zap className="h-4 w-4 text-slate-500" />
            Elpris (kr/kWh)
          </Label>

          {/* Quick presets */}
          <div className="flex flex-wrap gap-2">
            {PRICE_PRESETS.map((price) => (
              <Button
                key={price}
                type="button"
                variant={data.electricityRateDkk === price ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleElectricityRateChange(price)}
                className="min-w-[60px]"
              >
                {price.toFixed(1)}
              </Button>
            ))}
          </div>

          {/* Custom input */}
          <div className="flex items-center gap-2">
            <Input
              type="number"
              step="0.1"
              min="0.5"
              max="10"
              value={data.electricityRateDkk}
              onChange={(e) => handleElectricityRateChange(parseFloat(e.target.value) || 0)}
              className="w-24"
            />
            <span className="text-sm text-slate-500">kr/kWh</span>
          </div>

          <p className="text-xs text-slate-500">
            Den gennemsnitlige elpris i Danmark er ca. 2,50 kr/kWh inkl. afgifter.
          </p>
        </div>

        {/* Self-consumption Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Home className="h-4 w-4 text-slate-500" />
              Egetforbrug
            </Label>
            <span className="text-lg font-bold text-primary">
              {Math.round(data.selfConsumptionRate * 100)}%
            </span>
          </div>

          <Slider
            value={[data.selfConsumptionRate * 100]}
            onValueChange={handleSelfConsumptionChange}
            min={10}
            max={100}
            step={5}
            className="w-full"
          />

          <div className="flex justify-between text-xs text-slate-500">
            <span>10%</span>
            <span>100%</span>
          </div>

          <p className="text-xs text-slate-500">
            Hvor meget af den producerede strøm du bruger selv. Typisk 50-80% for et gennemsnitligt parcelhus.
          </p>
        </div>

        {/* Roof Area */}
        <div className="space-y-3">
          <Label htmlFor="roofArea" className="flex items-center gap-2 text-sm font-medium">
            <Sun className="h-4 w-4 text-slate-500" />
            Tagflade til solceller
          </Label>

          <div className="flex items-center gap-2">
            <Input
              id="roofArea"
              type="number"
              min="10"
              max="500"
              value={data.roofAreaM2}
              onChange={(e) => handleRoofAreaChange(e.target.value)}
              className="w-24"
            />
            <span className="text-sm text-slate-500">m²</span>
          </div>

          {/* Quick estimate based on area */}
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Estimeret systemstørrelse:</span>
              <span className="font-semibold text-slate-900">
                {(data.roofAreaM2 / 6).toFixed(1)} kWp
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-slate-600">Antal paneler (ca.):</span>
              <span className="font-semibold text-slate-900">
                {Math.round(data.roofAreaM2 / 2)} stk
              </span>
            </div>
          </div>
        </div>

        {/* Advanced Section (collapsed) */}
        <div className="border-t pt-4">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center justify-between w-full text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
          >
            <span className="flex items-center gap-2">
              Avanceret (orientering og hældning)
            </span>
            {showAdvanced ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {showAdvanced && (
            <div className="mt-4 space-y-6 animate-in slide-in-from-top-2 duration-200">
              {/* Azimuth / Orientation */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Tagets orientering</Label>
                <div className="grid grid-cols-4 gap-2">
                  {AZIMUTH_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleAzimuthChange(option.value)}
                      className={cn(
                        'p-2 rounded-lg border text-center text-sm transition-all duration-200',
                        data.azimuthDegrees === option.value
                          ? 'border-primary bg-primary/10 text-primary font-semibold'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                      )}
                    >
                      <span className="block text-lg">{option.short}</span>
                      <span className="block text-xs text-slate-500">{option.value}°</span>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-slate-500">
                  Sydvendt (180°) giver den bedste produktion. Optimal er 160-200°.
                </p>
              </div>

              {/* Tilt Angle */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Taghældning</Label>
                  <span className="text-lg font-bold text-primary">{data.tiltDegrees}°</span>
                </div>

                <Slider
                  value={[data.tiltDegrees]}
                  onValueChange={handleTiltChange}
                  min={0}
                  max={90}
                  step={5}
                  className="w-full"
                />

                <div className="flex justify-between text-xs text-slate-500">
                  <span>0° (fladt)</span>
                  <span>35° (optimal)</span>
                  <span>90° (lodret)</span>
                </div>

                <p className="text-xs text-slate-500">
                  Optimal hældning i Danmark er 30-40°. De fleste danske tage har 25-45° hældning.
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
