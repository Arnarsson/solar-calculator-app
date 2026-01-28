'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProjectionResult } from '@/lib/calculations/projection';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts';

interface SavingsChartProps {
  projection: ProjectionResult;
  currency?: string;
}

export function SavingsChart({ projection, currency = 'DKK' }: SavingsChartProps) {
  // Format data for Recharts
  const chartData = projection.years.map((year) => ({
    year: year.year,
    annualSavings: year.netSavingsNominal.toNumber(),
    cumulative: year.cumulativeNominal.toNumber(),
    production: year.productionKwh.toNumber(),
  }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3">
          <p className="font-semibold mb-2">Year {label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}:{' '}
              {entry.name === 'Production'
                ? `${entry.value.toLocaleString('da-DK', { maximumFractionDigits: 0 })} kWh`
                : `${entry.value.toLocaleString('da-DK', { maximumFractionDigits: 0 })} ${currency}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>25-Year Savings Projection</CardTitle>
        <CardDescription>Annual savings and cumulative total over system lifetime</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="year"
              label={{ value: 'Year', position: 'insideBottom', offset: -5 }}
              className="text-xs"
            />
            <YAxis
              yAxisId="left"
              label={{ value: `Savings (${currency})`, angle: -90, position: 'insideLeft' }}
              className="text-xs"
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              label={{ value: 'Production (kWh)', angle: 90, position: 'insideRight' }}
              className="text-xs"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              yAxisId="left"
              dataKey="annualSavings"
              name="Annual Savings"
              fill="hsl(var(--chart-1))"
              opacity={0.8}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="cumulative"
              name="Cumulative Savings"
              stroke="hsl(var(--chart-2))"
              strokeWidth={2}
              dot={false}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="production"
              name="Production"
              stroke="hsl(var(--chart-3))"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
        <div className="mt-4 text-xs text-muted-foreground">
          <p>
            <span className="inline-block w-3 h-3 bg-chart-1 mr-2"></span>
            Annual Savings: Yearly savings minus maintenance costs
          </p>
          <p>
            <span className="inline-block w-3 h-3 bg-chart-2 mr-2"></span>
            Cumulative Savings: Total savings minus initial investment
          </p>
          <p>
            <span className="inline-block w-3 h-3 bg-chart-3 mr-2"></span>
            Production: System output declining with panel degradation
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
