'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ProjectionResult } from '@/lib/calculations/projection';

interface ProductionOverviewProps {
  projection: ProjectionResult;
  selfConsumptionRate: number; // 0-1
}

export function ProductionOverview({ projection, selfConsumptionRate }: ProductionOverviewProps) {
  // Calculate overview metrics from first year
  const firstYear = projection.years[0];
  const lastYear = projection.years[projection.years.length - 1];

  const firstYearProduction = firstYear.productionKwh.toNumber();
  const lastYearProduction = lastYear.productionKwh.toNumber();
  const totalProduction = projection.years.reduce(
    (sum, year) => sum + year.productionKwh.toNumber(),
    0
  );

  // Calculate self-consumed vs exported
  const selfConsumedKwh = firstYearProduction * selfConsumptionRate;
  const exportedKwh = firstYearProduction * (1 - selfConsumptionRate);

  // Data for stacked bar chart (selected years)
  const chartData = [
    {
      year: 'Year 1',
      selfConsumed: (projection.years[0].productionKwh.toNumber() * selfConsumptionRate).toFixed(0),
      exported: (projection.years[0].productionKwh.toNumber() * (1 - selfConsumptionRate)).toFixed(0),
    },
    {
      year: 'Year 5',
      selfConsumed: (projection.years[4].productionKwh.toNumber() * selfConsumptionRate).toFixed(0),
      exported: (projection.years[4].productionKwh.toNumber() * (1 - selfConsumptionRate)).toFixed(0),
    },
    {
      year: 'Year 10',
      selfConsumed: (projection.years[9].productionKwh.toNumber() * selfConsumptionRate).toFixed(0),
      exported: (projection.years[9].productionKwh.toNumber() * (1 - selfConsumptionRate)).toFixed(0),
    },
    {
      year: 'Year 15',
      selfConsumed: (projection.years[14].productionKwh.toNumber() * selfConsumptionRate).toFixed(0),
      exported: (projection.years[14].productionKwh.toNumber() * (1 - selfConsumptionRate)).toFixed(0),
    },
    {
      year: 'Year 20',
      selfConsumed: (projection.years[19].productionKwh.toNumber() * selfConsumptionRate).toFixed(0),
      exported: (projection.years[19].productionKwh.toNumber() * (1 - selfConsumptionRate)).toFixed(0),
    },
    {
      year: 'Year 25',
      selfConsumed: (projection.years[24].productionKwh.toNumber() * selfConsumptionRate).toFixed(0),
      exported: (projection.years[24].productionKwh.toNumber() * (1 - selfConsumptionRate)).toFixed(0),
    },
  ];

  // Format number
  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('da-DK', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = parseInt(payload[0].value) + parseInt(payload[1].value);
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3">
          <p className="font-semibold mb-2">{label}</p>
          <p className="text-sm" style={{ color: payload[0].color }}>
            Self-consumed: {formatNumber(parseInt(payload[0].value))} kWh
          </p>
          <p className="text-sm" style={{ color: payload[1].color }}>
            Exported: {formatNumber(parseInt(payload[1].value))} kWh
          </p>
          <p className="text-sm font-semibold mt-1 pt-1 border-t border-border">
            Total: {formatNumber(total)} kWh
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Production Overview</CardTitle>
        <CardDescription>Energy generation and usage breakdown over system lifetime</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Key metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div>
            <p className="text-xs text-muted-foreground">First Year</p>
            <p className="text-lg font-semibold">{formatNumber(firstYearProduction)} kWh</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Year 25</p>
            <p className="text-lg font-semibold">{formatNumber(lastYearProduction)} kWh</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Production</p>
            <p className="text-lg font-semibold">{formatNumber(totalProduction)} kWh</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Degradation</p>
            <p className="text-lg font-semibold">
              {((1 - lastYearProduction / firstYearProduction) * 100).toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Stacked bar chart */}
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="year" className="text-xs" />
            <YAxis
              label={{ value: 'Production (kWh)', angle: -90, position: 'insideLeft' }}
              className="text-xs"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="selfConsumed" name="Self-consumed" stackId="a" fill="hsl(var(--chart-2))" />
            <Bar dataKey="exported" name="Exported to grid" stackId="a" fill="hsl(var(--chart-5))" />
          </BarChart>
        </ResponsiveContainer>

        {/* Usage breakdown */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="text-sm font-semibold mb-3">First Year Breakdown</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-chart-2"></div>
                <span className="text-sm">Self-consumed</span>
              </div>
              <span className="font-medium">
                {formatNumber(selfConsumedKwh)} kWh ({(selfConsumptionRate * 100).toFixed(0)}%)
              </span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-chart-5"></div>
                <span className="text-sm">Exported to grid</span>
              </div>
              <span className="font-medium">
                {formatNumber(exportedKwh)} kWh ({((1 - selfConsumptionRate) * 100).toFixed(0)}%)
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
