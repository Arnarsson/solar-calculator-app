'use client';

import { useState, useMemo } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ReferenceLine,
} from 'recharts';
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
import { TrendingUp, BarChart3, LineChart } from 'lucide-react';

// Helper to safely get number
const toNum = (val: any): number => {
  if (val === undefined || val === null) return 0;
  if (typeof val === 'number') return val;
  if (typeof val === 'string') return parseFloat(val);
  if (val.toNumber) return val.toNumber();
  return 0;
};

interface SavingsChartProps {
  projection: any;
  currency?: string;
}

const chartConfigCumulative = {
  cumulative: {
    label: 'Kumulativ besparelse',
    color: 'hsl(142, 71%, 45%)',
  },
} satisfies ChartConfig;

const chartConfigAnnual = {
  annualSavings: {
    label: 'Arlig besparelse',
    color: 'hsl(220, 90%, 56%)',
  },
} satisfies ChartConfig;

type ChartMode = 'kumulativ' | 'aarlig';

export function SavingsChart({ projection, currency = 'DKK' }: SavingsChartProps) {
  const [chartMode, setChartMode] = useState<ChartMode>('kumulativ');

  const chartData = useMemo(() => {
    return projection.years.map((year: any) => ({
      year: year.year,
      yearLabel: `Ar ${year.year}`,
      cumulative: Math.round(toNum(year.cumulativeReal)),
      annualSavings: Math.round(toNum(year.netSavingsReal)),
    }));
  }, [projection.years]);

  // Find break-even year (where cumulative crosses from negative to positive)
  const breakEvenYear = useMemo(() => {
    for (let i = 0; i < chartData.length; i++) {
      if (chartData[i].cumulative >= 0) {
        return chartData[i].year;
      }
    }
    return null;
  }, [chartData]);

  const totalSavings = toNum(projection.summary?.totalSavingsReal);
  const breakEvenYearFromSummary = projection.summary?.breakEvenYearReal || '-';

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl">25-ars besparelsesprojekt</CardTitle>
            <CardDescription>
              {chartMode === 'kumulativ'
                ? 'Kumulativ besparelse over systemets levetid'
                : 'Arlig besparelse pr. ar'}
            </CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <ToggleGroup
              type="single"
              value={chartMode}
              onValueChange={(value) => value && setChartMode(value as ChartMode)}
              size="sm"
            >
              <ToggleGroupItem value="kumulativ" aria-label="Vis kumulativ">
                <LineChart className="h-4 w-4 mr-1.5" />
                Kumulativ
              </ToggleGroupItem>
              <ToggleGroupItem value="aarlig" aria-label="Vis arlig">
                <BarChart3 className="h-4 w-4 mr-1.5" />
                Arlig
              </ToggleGroupItem>
            </ToggleGroup>
            <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
              <TrendingUp className="h-4 w-4" />
              <span>+{Math.round(totalSavings).toLocaleString('da-DK')} {currency}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {chartMode === 'kumulativ' ? (
          <ChartContainer config={chartConfigCumulative} className="h-[300px] w-full">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="fillCumulative" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
              <XAxis
                dataKey="year"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                className="text-xs"
                label={{ value: 'Ar', position: 'insideBottomRight', offset: -5, className: 'text-xs fill-muted-foreground' }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                className="text-xs"
                label={{ value: `Besparelse (${currency})`, angle: -90, position: 'insideLeft', className: 'text-xs fill-muted-foreground' }}
              />
              {/* Break-even reference line */}
              {breakEvenYear && (
                <ReferenceLine
                  x={breakEvenYear}
                  stroke="hsl(142, 71%, 35%)"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  label={{
                    value: 'Break-even',
                    position: 'top',
                    fill: 'hsl(142, 71%, 35%)',
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                />
              )}
              {/* Zero reference line */}
              <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeOpacity={0.3} />
              <ChartTooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => `Ar ${value}`}
                    formatter={(value) => (
                      <div className="flex items-center justify-between gap-8">
                        <span className="text-muted-foreground">Kumulativ</span>
                        <span className="font-bold">
                          {Number(value).toLocaleString('da-DK')} {currency}
                        </span>
                      </div>
                    )}
                  />
                }
              />
              <Area
                dataKey="cumulative"
                type="monotone"
                fill="url(#fillCumulative)"
                stroke="hsl(142, 71%, 45%)"
                strokeWidth={2}
              />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        ) : (
          <ChartContainer config={chartConfigAnnual} className="h-[300px] w-full">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
              <XAxis
                dataKey="year"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                className="text-xs"
                label={{ value: 'Ar', position: 'insideBottomRight', offset: -5, className: 'text-xs fill-muted-foreground' }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                className="text-xs"
                label={{ value: `Besparelse (${currency})`, angle: -90, position: 'insideLeft', className: 'text-xs fill-muted-foreground' }}
              />
              <ChartTooltip
                cursor={{ fill: 'hsl(var(--muted))', fillOpacity: 0.3 }}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => `Ar ${value}`}
                    formatter={(value) => (
                      <div className="flex items-center justify-between gap-8">
                        <span className="text-muted-foreground">Arlig besparelse</span>
                        <span className="font-bold">
                          {Number(value).toLocaleString('da-DK')} {currency}
                        </span>
                      </div>
                    )}
                  />
                }
              />
              <Bar
                dataKey="annualSavings"
                fill="hsl(220, 90%, 56%)"
                radius={[4, 4, 0, 0]}
              />
              <ChartLegend content={<ChartLegendContent />} />
            </BarChart>
          </ChartContainer>
        )}

        <div className="mt-4 flex items-center justify-between text-sm border-t border-border pt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span className="text-muted-foreground">Break-even efter</span>
            <span className="font-semibold">{breakEvenYearFromSummary} ar</span>
          </div>
          <div className="text-muted-foreground">
            Herefter er alt overskud
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
