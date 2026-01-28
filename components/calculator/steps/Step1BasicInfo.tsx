'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, MapPin, Zap, Sun, Home, Loader2, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { InfoTooltip, ExplainerCard } from '@/components/ui/info-tooltip';
import { CompassPicker } from '../CompassPicker';
import { cn } from '@/lib/utils';
import type { WizardData } from '../WizardLayout';

// Stagger animation for form fields
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 24,
    },
  },
} as const;

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

export function Step1BasicInfo({ data, onChange }: Step1BasicInfoProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isFetchingPrice, setIsFetchingPrice] = useState(false);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [priceSource, setPriceSource] = useState<string | null>(null);

  // Fetch current electricity price from Energi Data Service
  const fetchCurrentPrice = async () => {
    setIsFetchingPrice(true);
    setPriceError(null);

    try {
      const response = await fetch(`/api/electricity-prices?region=${data.priceArea}`);

      if (!response.ok) {
        throw new Error('Kunne ikke hente elpriser');
      }

      const priceData = await response.json();

      // Update electricity rate with fetched current price (spot + fees/taxes)
      onChange({ electricityRateDkk: priceData.currentPrice });
      setPriceSource(`Spotpris ${data.priceArea}: ${priceData.spotPrice.toFixed(2)} kr + afgifter`);
    } catch (error) {
      console.error('Error fetching price:', error);
      setPriceError('Kunne ikke hente pris. Prøv igen eller indtast manuelt.');
    } finally {
      setIsFetchingPrice(false);
    }
  };

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

      <CardContent>
        <motion.div
          className="space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Price Area Selector */}
          <motion.div className="space-y-3" variants={itemVariants}>
            <Label className="flex items-center gap-2 text-sm font-medium">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              Prisområde
              <InfoTooltip
                title="Hvad er prisområde?"
                content={
                  <>
                    Danmark er opdelt i to elspotområder (DK1 og DK2) med forskellige
                    elpriser. Vælg det område, hvor din bolig ligger, for at få
                    mere præcise beregninger af dine besparelser.
                  </>
                }
              />
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {PRICE_AREAS.map((area) => (
                <motion.button
                  key={area.value}
                  type="button"
                  onClick={() => handlePriceAreaChange(area.value)}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    'p-4 rounded-xl border-2 text-left transition-all duration-200',
                    data.priceArea === area.value
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                      : 'border-border hover:border-primary/50 hover:bg-muted'
                  )}
                >
                  <span className="font-semibold text-foreground">{area.label}</span>
                  <p className="text-xs text-muted-foreground mt-1">{area.description}</p>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Electricity Price */}
          <motion.div className="space-y-3" variants={itemVariants}>
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Zap className="h-4 w-4 text-muted-foreground" />
              Elpris (kr/kWh)
              <InfoTooltip
                title="Din elpris"
                content={
                  <>
                    Din elpris findes på din elregning og inkluderer spotpris,
                    elafgifter, tariffer og moms. Det er den totale pris du
                    betaler pr. kWh. En højere elpris betyder større besparelser
                    ved solceller.
                  </>
                }
              />
            </Label>

            {/* Auto-fetch button */}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={fetchCurrentPrice}
                disabled={isFetchingPrice}
                className="flex items-center gap-2"
              >
                {isFetchingPrice ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Hent aktuel pris
              </Button>
              {priceSource && (
                <span className="text-xs text-muted-foreground">
                  Fra {priceSource}
                </span>
              )}
            </div>

            {priceError && (
              <p className="text-xs text-destructive">{priceError}</p>
            )}

            {/* Quick presets */}
            <div className="flex flex-wrap gap-2">
              {PRICE_PRESETS.map((price) => (
                <motion.div key={price} whileTap={{ scale: 0.95 }}>
                  <Button
                    type="button"
                    variant={data.electricityRateDkk === price ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleElectricityRateChange(price)}
                    className="min-w-[60px]"
                  >
                    {price.toFixed(1)}
                  </Button>
                </motion.div>
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
              <span className="text-sm text-muted-foreground">kr/kWh</span>
            </div>

            <p className="text-xs text-muted-foreground">
              Den gennemsnitlige elpris i Danmark er ca. 2,50 kr/kWh inkl. afgifter.
            </p>
          </motion.div>

          {/* Self-consumption Slider */}
          <motion.div className="space-y-3" variants={itemVariants}>
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Home className="h-4 w-4 text-muted-foreground" />
                Egetforbrug
                <InfoTooltip
                  title="Hvad er egetforbrug?"
                  content={
                    <>
                      <p className="mb-2">
                        <strong>Egetforbrug</strong> er den andel af din solcelleproduktion,
                        som du bruger direkte i husstanden.
                      </p>
                      <p className="mb-2">
                        Resten af strommen sælges til elnettet til spotpris (ca. 0,30-0,80 kr/kWh),
                        hvilket er langt mindre end du selv betaler for el.
                      </p>
                      <p>
                        <strong>Tip:</strong> Højere egetforbrug = større besparelser.
                        Du kan øge egetforbruget med varmepumpe, elbil eller batteri.
                      </p>
                    </>
                  }
                  maxWidth="320px"
                />
              </Label>
              <motion.span
                key={data.selfConsumptionRate}
                initial={{ scale: 1.2, color: '#22c55e' }}
                animate={{ scale: 1, color: 'var(--primary)' }}
                className="text-lg font-bold text-primary"
              >
                {Math.round(data.selfConsumptionRate * 100)}%
              </motion.span>
            </div>

            <Slider
              value={[data.selfConsumptionRate * 100]}
              onValueChange={handleSelfConsumptionChange}
              min={10}
              max={100}
              step={5}
              className="w-full"
            />

            <div className="flex justify-between text-xs text-muted-foreground">
              <span>10%</span>
              <span>100%</span>
            </div>

            {/* Contextual help based on value */}
            <ExplainerCard
              title={
                data.selfConsumptionRate < 0.5
                  ? 'Lavt egetforbrug'
                  : data.selfConsumptionRate > 0.8
                  ? 'Højt egetforbrug'
                  : 'Typisk egetforbrug'
              }
              variant={data.selfConsumptionRate < 0.5 ? 'warning' : 'tip'}
              className="text-xs"
            >
              {data.selfConsumptionRate < 0.5 ? (
                <>
                  Med {Math.round(data.selfConsumptionRate * 100)}% egetforbrug sælges
                  meget strøm til lav spotpris. Overvej varmepumpe eller elbil for
                  at øge egetforbruget og dine besparelser.
                </>
              ) : data.selfConsumptionRate > 0.8 ? (
                <>
                  {Math.round(data.selfConsumptionRate * 100)}% egetforbrug er flot!
                  Du udnytter din solcellestrøm optimalt og maksimerer dine besparelser.
                </>
              ) : (
                <>
                  {Math.round(data.selfConsumptionRate * 100)}% er typisk for et
                  parcelhus med normalt forbrug. Du kan øge det med varmepumpe,
                  elbil eller batteri.
                </>
              )}
            </ExplainerCard>
          </motion.div>

          {/* Roof Area */}
          <motion.div className="space-y-3" variants={itemVariants}>
            <Label htmlFor="roofArea" className="flex items-center gap-2 text-sm font-medium">
              <Sun className="h-4 w-4 text-muted-foreground" />
              Tagflade til solceller
              <InfoTooltip
                title="Tagflade til solceller"
                content={
                  <>
                    <p className="mb-2">
                      Angiv det areal på dit tag, hvor du kan placere solceller.
                      Husk at fratrække arealet til tagvinduer, skorstene og skyggeområder.
                    </p>
                    <p>
                      <strong>Tommelfingerregel:</strong> Ca. 6 m² pr. kWp systemstørrelse,
                      og ca. 2 m² pr. panel.
                    </p>
                  </>
                }
              />
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
              <span className="text-sm text-muted-foreground">m²</span>
            </div>

            {/* Quick estimate based on area */}
            <motion.div
              className="p-3 bg-muted rounded-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Estimeret systemstørrelse:</span>
                <motion.span
                  key={data.roofAreaM2}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  className="font-semibold text-foreground"
                >
                  {(data.roofAreaM2 / 6).toFixed(1)} kWp
                </motion.span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-muted-foreground">Antal paneler (ca.):</span>
                <motion.span
                  key={`panels-${data.roofAreaM2}`}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  className="font-semibold text-foreground"
                >
                  {Math.round(data.roofAreaM2 / 2)} stk
                </motion.span>
              </div>
            </motion.div>
          </motion.div>

          {/* Advanced Section (collapsed) */}
          <motion.div className="border-t border-border pt-4" variants={itemVariants}>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center justify-between w-full text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <span className="flex items-center gap-2">
                Avanceret (orientering og hældning)
                <InfoTooltip
                  title="Avancerede indstillinger"
                  content={
                    <>
                      Tagets orientering og hældning påvirker solcelleproduktionen
                      betydeligt. Standardværdierne er sat til optimale danske forhold,
                      men du kan justere dem, hvis du kender dit tags præcise orientering.
                    </>
                  }
                />
              </span>
              <motion.div
                animate={{ rotate: showAdvanced ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="h-4 w-4" />
              </motion.div>
            </button>

            <motion.div
              initial={false}
              animate={{
                height: showAdvanced ? 'auto' : 0,
                opacity: showAdvanced ? 1 : 0,
              }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="mt-4 space-y-6">
                {/* Azimuth / Orientation with Visual Compass */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2 text-sm font-medium">
                    Tagets orientering
                    <InfoTooltip
                      title="Tagorientering (azimut)"
                      content={
                        <>
                          <p className="mb-2">
                            Klik på kompasretningen for at vælge hvilken vej dit tag vender.
                          </p>
                          <p>
                            <strong>Optimal:</strong> Syd giver højeste produktion.
                            Øst/vest giver ca. 15-20% mindre produktion.
                          </p>
                        </>
                      }
                    />
                  </Label>
                  <CompassPicker
                    value={data.azimuthDegrees}
                    onChange={handleAzimuthChange}
                  />
                </div>

                {/* Tilt Angle */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2 text-sm font-medium">
                      Taghældning
                      <InfoTooltip
                        title="Taghældning (tilt)"
                        content={
                          <>
                            <p className="mb-2">
                              Taghældningen måles i grader fra vandret.
                              Et fladt tag er 0°, et lodret tag er 90°.
                            </p>
                            <p>
                              <strong>Optimal i Danmark:</strong> 30-40° giver den bedste
                              årsproduktion. Danske tage har typisk 25-45° hældning.
                            </p>
                          </>
                        }
                      />
                    </Label>
                    <motion.span
                      key={data.tiltDegrees}
                      initial={{ scale: 1.2, color: '#22c55e' }}
                      animate={{ scale: 1, color: 'var(--primary)' }}
                      className="text-lg font-bold text-primary"
                    >
                      {data.tiltDegrees}°
                    </motion.span>
                  </div>

                  <Slider
                    value={[data.tiltDegrees]}
                    onValueChange={handleTiltChange}
                    min={0}
                    max={90}
                    step={5}
                    className="w-full"
                  />

                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0° (fladt)</span>
                    <span>35° (optimal)</span>
                    <span>90° (lodret)</span>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Optimal hældning i Danmark er 30-40°. De fleste danske tage har 25-45° hældning.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </CardContent>
    </Card>
  );
}
