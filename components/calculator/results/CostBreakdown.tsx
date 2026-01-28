'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import Decimal from 'decimal.js';

interface CostItem {
  name: string;
  value: Decimal;
}

interface CostBreakdownProps {
  costs: {
    panels: Decimal;
    inverter: Decimal;
    installation: Decimal;
    other?: Decimal;
  };
  currency?: string;
}

const COLORS = [
  'hsl(var(--chart-1))', // Solar orange - panels
  'hsl(var(--chart-2))', // Green - inverter
  'hsl(var(--chart-3))', // Blue - installation
  'hsl(var(--chart-4))', // Purple - other
];

export function CostBreakdown({ costs, currency = 'DKK' }: CostBreakdownProps) {
  // Prepare data for pie chart
  const data: { name: string; value: number; percentage: number }[] = [];
  const total = costs.panels
    .plus(costs.inverter)
    .plus(costs.installation)
    .plus(costs.other || new Decimal(0));

  const items: CostItem[] = [
    { name: 'Solar Panels', value: costs.panels },
    { name: 'Inverter', value: costs.inverter },
    { name: 'Installation', value: costs.installation },
  ];

  if (costs.other && costs.other.greaterThan(0)) {
    items.push({ name: 'Other', value: costs.other });
  }

  items.forEach((item) => {
    data.push({
      name: item.name,
      value: item.value.toNumber(),
      percentage: item.value.dividedBy(total).times(100).toNumber(),
    });
  });

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('da-DK', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Custom label
  const renderCustomLabel = (entry: any) => {
    return `${entry.percentage.toFixed(1)}%`;
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const entry = payload[0];
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3">
          <p className="font-semibold mb-1">{entry.name}</p>
          <p className="text-sm">
            {formatCurrency(entry.value)} {currency}
          </p>
          <p className="text-xs text-muted-foreground">{entry.payload.percentage.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Cost Breakdown</CardTitle>
        <CardDescription>
          Total: {formatCurrency(total.toNumber())} {currency}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>

        {/* Detailed breakdown table */}
        <div className="mt-6 space-y-2">
          {items.map((item, index) => (
            <div key={item.name} className="flex justify-between items-center py-2 border-b border-border">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></div>
                <span className="text-sm font-medium">{item.name}</span>
              </div>
              <div className="text-right">
                <span className="font-semibold">
                  {formatCurrency(item.value.toNumber())} {currency}
                </span>
                <span className="text-xs text-muted-foreground ml-2">
                  ({item.value.dividedBy(total).times(100).toFixed(1)}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
