'use client';

import { useState } from 'react';
import { Calendar, TrendingUp, Wallet, DollarSign, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { SavingsChart } from '../results/SavingsChart';
import { ProductionOverview } from '../results/ProductionOverview';
import { CostBreakdown } from '../results/CostBreakdown';
import { MethodologyPanel } from '../MethodologyPanel';
import Decimal from 'decimal.js';
import type { WizardData } from '../WizardLayout';
import {
  getEstimatedPanelsCost,
  getEstimatedInverterCost,
  getEstimatedInstallationCost,
  getEstimatedOtherCost,
} from '../WizardLayout';

interface Step3ResultsProps {
  data: WizardData;
}

// Helper to safely get number
const toNum = (val: unknown): number => {
  if (val === undefined || val === null) return 0;
  if (typeof val === 'number') return val;
  if (typeof val === 'string') return parseFloat(val);
  if (typeof val === 'object' && val !== null && 'toNumber' in val) {
    return (val as { toNumber: () => number }).toNumber();
  }
  return 0;
};

interface KpiCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  subtext?: string;
  highlight?: boolean;
}

function KpiCard({ icon: Icon, label, value, subtext, highlight = false }: KpiCardProps) {
  return (
    <div
      className={cn(
        'p-4 rounded-xl border transition-all duration-200',
        highlight
          ? 'bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 ring-2 ring-primary/10'
          : 'bg-background border-border hover:border-primary/50'
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
        <div
          className={cn(
            'p-2 rounded-lg',
            highlight ? 'bg-primary/10' : 'bg-muted'
          )}
        >
          <Icon
            className={cn('h-4 w-4', highlight ? 'text-primary' : 'text-muted-foreground')}
          />
        </div>
      </div>
      <div
        className={cn(
          'text-2xl font-bold',
          highlight ? 'text-primary' : 'text-foreground'
        )}
      >
        {value}
      </div>
      {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
    </div>
  );
}

export function Step3Results({ data }: Step3ResultsProps) {
  const [activeTab, setActiveTab] = useState('grafer');

  // Calculate costs with estimates where needed
  const panelsCost = data.panelsCostUseEstimate
    ? getEstimatedPanelsCost(data.roofAreaM2)
    : data.panelsCost;
  const inverterCost = data.inverterCostUseEstimate
    ? getEstimatedInverterCost(data.roofAreaM2)
    : data.inverterCost;
  const installationCost = data.installationCostUseEstimate
    ? getEstimatedInstallationCost(data.roofAreaM2)
    : data.installationCost;
  const otherCost = data.otherCostUseEstimate
    ? getEstimatedOtherCost(data.roofAreaM2)
    : data.otherCost;

  // Default location for price area (since we're not using coordinates)
  const getDefaultCoordinates = (priceArea: 'DK1' | 'DK2') => {
    if (priceArea === 'DK1') {
      // Aarhus (central Jutland)
      return { latitude: 56.1629, longitude: 10.2039 };
    }
    // Copenhagen (Zealand)
    return { latitude: 55.6761, longitude: 12.5683 };
  };

  const coords = getDefaultCoordinates(data.priceArea);

  // Build API input
  const apiInput = {
    latitude: coords.latitude,
    longitude: coords.longitude,
    priceArea: data.priceArea,
    roofAreaM2: data.roofAreaM2,
    azimuthDegrees: data.azimuthDegrees,
    tiltDegrees: data.tiltDegrees,
    electricityRateDkk: data.electricityRateDkk,
    selfConsumptionRate: data.selfConsumptionRate,
    panelsCost,
    inverterCost,
    installationCost,
    mountingKitCost: otherCost,
    inflationRate: 0.02,
    electricityInflationRate: 0.03,
    maintenanceCostYear1: 1000,
  };

  const {
    data: calculationResult,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['wizard-calculation', apiInput],
    queryFn: async () => {
      const res = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiInput),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Calculation failed' }));
        throw new Error(errorData.error || 'Calculation failed');
      }
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="border-0 shadow-lg">
          <CardContent className="py-16">
            <div className="text-center">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
                <Loader2 className="relative h-12 w-12 animate-spin text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Beregner din investering</h3>
              <p className="text-muted-foreground">
                Analyserer data og udregner besparelser...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <Card className="border-0 shadow-lg">
          <CardContent className="py-8">
            <div className="flex items-start gap-4 p-6 bg-destructive/5 border border-destructive/20 rounded-xl">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
              </div>
              <div>
                <h3 className="font-semibold text-destructive mb-1">
                  Kunne ikke beregne resultater
                </h3>
                <p className="text-sm text-destructive/80">
                  {error instanceof Error ? error.message : 'Ukendt fejl'}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Prøv at justere dine input eller kontakt support hvis fejlen fortsætter.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No results
  if (!calculationResult?.projection) {
    return null;
  }

  const { projection, systemSizeKw } = calculationResult;

  // Calculate system cost with VAT
  const VAT_RATE = 0.25;
  const systemCostNum = panelsCost + inverterCost + installationCost + otherCost;
  const systemCostWithVat = Math.round(systemCostNum * (1 + VAT_RATE));

  // Extract key metrics
  const breakEvenYear = projection.summary?.breakEvenYearReal || '-';
  const annualSavingsYear1 = Math.round(toNum(projection.years[0]?.netSavingsReal));
  const totalSavings25Year = Math.round(toNum(projection.summary?.totalSavingsReal));

  // Format numbers
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('da-DK', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={Calendar}
          label="Tilbagebetaling"
          value={`${breakEvenYear} år`}
          subtext="Tid til investeringen er tjent hjem"
          highlight={true}
        />
        <KpiCard
          icon={TrendingUp}
          label="Årlig besparelse"
          value={`${formatCurrency(annualSavingsYear1)} kr`}
          subtext="Første års besparelse"
        />
        <KpiCard
          icon={Wallet}
          label="25-års besparelse"
          value={`${formatCurrency(totalSavings25Year)} kr`}
          subtext="I dagens værdi"
        />
        <KpiCard
          icon={DollarSign}
          label="Systempris"
          value={`${formatCurrency(systemCostWithVat)} kr`}
          subtext={`${systemSizeKw?.toFixed(1)} kWp system`}
        />
      </div>

      {/* Tabbed content */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Detaljeret analyse</CardTitle>
          <CardDescription>
            Udforsk dine resultater i detaljer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="grafer">Grafer</TabsTrigger>
              <TabsTrigger value="produktion">Produktion</TabsTrigger>
              <TabsTrigger value="omkostninger">Omkostninger</TabsTrigger>
              <TabsTrigger value="metode">Metode</TabsTrigger>
            </TabsList>

            <TabsContent value="grafer" className="mt-0">
              <SavingsChart projection={projection} currency="DKK" />
            </TabsContent>

            <TabsContent value="produktion" className="mt-0">
              <ProductionOverview
                projection={projection}
                selfConsumptionRate={data.selfConsumptionRate}
              />
            </TabsContent>

            <TabsContent value="omkostninger" className="mt-0">
              <CostBreakdown
                costs={{
                  panels: new Decimal(panelsCost).times(1 + VAT_RATE),
                  inverter: new Decimal(inverterCost).times(1 + VAT_RATE),
                  installation: new Decimal(installationCost).times(1 + VAT_RATE),
                  other: new Decimal(otherCost).times(1 + VAT_RATE),
                }}
                currency="DKK"
              />
            </TabsContent>

            <TabsContent value="metode" className="mt-0">
              <div className="-m-6">
                <MethodologyPanel />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Summary insight */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="py-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-foreground mb-1">
                God investering!
              </h3>
              <p className="text-foreground">
                Med en tilbagebetalingstid på {breakEvenYear} år og en total besparelse på{' '}
                <strong>{formatCurrency(totalSavings25Year)} kr</strong> over 25 år, er dette
                en solid investering. Dit anlæg vil producere grøn energi og spare dig penge
                i mange år fremover.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
