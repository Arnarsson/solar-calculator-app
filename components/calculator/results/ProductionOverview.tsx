'use client';

import { useState, useMemo } from 'react';
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { AnimatedNumber } from '@/components/ui/animated-number';
import { Zap, TrendingDown, BarChart3, Grid3X3 } from 'lucide-react';

// Helper to safely get number
const toNum = (val: any): number => {
  if (val === undefined || val === null) return 0;
  if (typeof val === 'number') return val;
  if (typeof val === 'string') return parseFloat(val);
  if (val.toNumber) return val.toNumber();
  return 0;
};

interface ProductionOverviewProps {
  projection: any;
  selfConsumptionRate: number;
}

const chartConfig = {
  selfConsumed: {
    label: 'Egetforbrug',
    color: 'hsl(142, 71%, 45%)',
  },
  exported: {
    label: 'Solgt til net',
    color: 'hsl(220, 90%, 56%)',
  },
} satisfies ChartConfig;

type ViewMode = 'chart' | 'metrics';

const formatKwh = (n: number) => n.toLocaleString('da-DK', { maximumFractionDigits: 0 });

export function ProductionOverview({ projection, selfConsumptionRate }: ProductionOverviewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('metrics');

  const metrics = useMemo(() => {
    const firstYearProduction = toNum(projection.years[0]?.productionKwh);
    const lastYearProduction = toNum(projection.years[24]?.productionKwh);
    const totalProduction = projection.years.reduce(
      (sum: number, year: any) => sum + toNum(year.productionKwh),
      0
    );
    const degradation = ((firstYearProduction - lastYearProduction) / firstYearProduction) * 100;

    const selfConsumedKwh = Math.round(firstYearProduction * selfConsumptionRate);
    const exportedKwh = Math.round(firstYearProduction * (1 - selfConsumptionRate));

    return {
      firstYearProduction,
      lastYearProduction,
      totalProduction,
      degradation,
      selfConsumedKwh,
      exportedKwh,
    };
  }, [projection.years, selfConsumptionRate]);

  const chartData = useMemo(() => {
    const years = [1, 5, 10, 15, 20, 25];
    return years.map((yearNum) => {
      const yearData = projection.years[yearNum - 1];
      const production = toNum(yearData?.productionKwh);
      return {
        year: `Ar ${yearNum}`,
        selfConsumed: Math.round(production * selfConsumptionRate),
        exported: Math.round(production * (1 - selfConsumptionRate)),
      };
    });
  }, [projection.years, selfConsumptionRate]);

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl">Produktionsoversigt</CardTitle>
            <CardDescription>
              Energifordeling over systemets levetid
            </CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <ToggleGroup
              type="single"
              value={viewMode}
              onValueChange={(value) => value && setViewMode(value as ViewMode)}
              size="sm"
            >
              <ToggleGroupItem value="metrics" aria-label="Vis nogletal">
                <Grid3X3 className="h-4 w-4 mr-1.5" />
                Nogletal
              </ToggleGroupItem>
              <ToggleGroupItem value="chart" aria-label="Vis graf">
                <BarChart3 className="h-4 w-4 mr-1.5" />
                Graf
              </ToggleGroupItem>
            </ToggleGroup>
            <div className="flex items-center gap-2 text-sm text-amber-600 font-medium">
              <TrendingDown className="h-4 w-4" />
              <span>{metrics.degradation.toFixed(1)}% nedgang</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {viewMode === 'metrics' ? (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 border border-emerald-200">
                <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide mb-1">Ar 1 produktion</p>
                <p className="text-2xl font-bold text-emerald-900">
                  <AnimatedNumber value={metrics.firstYearProduction} format={formatKwh} />
                </p>
                <p className="text-xs text-emerald-600 mt-1">kWh</p>
              </div>
              <div className="rounded-xl bg-muted p-4 border border-border">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Ar 25 produktion</p>
                <p className="text-2xl font-bold text-foreground">
                  <AnimatedNumber value={metrics.lastYearProduction} format={formatKwh} />
                </p>
                <p className="text-xs text-muted-foreground mt-1">kWh</p>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 p-4 border border-blue-200">
                <p className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">Total (25 ar)</p>
                <p className="text-2xl font-bold text-blue-900">
                  <AnimatedNumber value={metrics.totalProduction} format={formatKwh} />
                </p>
                <p className="text-xs text-blue-600 mt-1">kWh</p>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 p-4 border border-amber-200">
                <p className="text-xs font-medium text-amber-600 uppercase tracking-wide mb-1">Egetforbrug</p>
                <p className="text-2xl font-bold text-amber-900">
                  {Math.round(selfConsumptionRate * 100)}%
                </p>
                <p className="text-xs text-amber-600 mt-1">af produktion</p>
              </div>
            </div>

            {/* Energy Distribution Summary */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500 rounded-lg">
                    <Zap className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-foreground">Egetforbrug</span>
                    <p className="text-xs text-muted-foreground">ar 1</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-emerald-700">
                  {metrics.selfConsumedKwh.toLocaleString('da-DK')} kWh
                </span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-blue-50 border border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <Zap className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-foreground">Solgt til net</span>
                    <p className="text-xs text-muted-foreground">ar 1</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-blue-700">
                  {metrics.exportedKwh.toLocaleString('da-DK')} kWh
                </span>
              </div>
            </div>
          </div>
        ) : (
          <>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                <XAxis
                  dataKey="year"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  className="text-xs"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  className="text-xs"
                  label={{ value: 'kWh', angle: -90, position: 'insideLeft', className: 'text-xs fill-muted-foreground' }}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) => (
                        <div className="flex items-center justify-between gap-8">
                          <span className="text-muted-foreground">
                            {name === 'selfConsumed' ? 'Egetforbrug' : 'Solgt til net'}
                          </span>
                          <span className="font-bold">{Number(value).toLocaleString('da-DK')} kWh</span>
                        </div>
                      )}
                    />
                  }
                />
                <Bar dataKey="selfConsumed" stackId="a" fill="hsl(142, 71%, 45%)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="exported" stackId="a" fill="hsl(220, 90%, 56%)" radius={[4, 4, 0, 0]} />
                <ChartLegend content={<ChartLegendContent />} />
              </BarChart>
            </ChartContainer>

            <div className="mt-4 grid grid-cols-2 gap-3 border-t pt-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-sm text-muted-foreground">Egetforbrug (ar 1)</span>
                </div>
                <span className="font-semibold text-emerald-700">{metrics.selfConsumedKwh.toLocaleString('da-DK')} kWh</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 border border-blue-100">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm text-muted-foreground">Solgt til net (ar 1)</span>
                </div>
                <span className="font-semibold text-blue-700">{metrics.exportedKwh.toLocaleString('da-DK')} kWh</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
