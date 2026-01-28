'use client';

import { Pie, PieChart, Cell, Label } from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import Decimal from 'decimal.js';

// Helper to safely get number
const toNum = (val: any): number => {
  if (val === undefined || val === null) return 0;
  if (typeof val === 'number') return val;
  if (typeof val === 'string') return parseFloat(val);
  if (val.toNumber) return val.toNumber();
  return 0;
};

interface CostBreakdownProps {
  costs: {
    panels: Decimal | number;
    inverter: Decimal | number;
    installation: Decimal | number;
    other?: Decimal | number;
  };
  currency?: string;
  onEditCosts?: () => void;
}

const COLORS = [
  'hsl(220, 90%, 56%)',
  'hsl(142, 71%, 45%)',
  'hsl(38, 92%, 50%)',
  'hsl(280, 65%, 60%)',
];

const chartConfig = {
  value: { label: 'Belob' },
  panels: { label: 'Solceller', color: COLORS[0] },
  inverter: { label: 'Inverter', color: COLORS[1] },
  installation: { label: 'Installation', color: COLORS[2] },
  other: { label: 'Andet', color: COLORS[3] },
} satisfies ChartConfig;

export function CostBreakdown({ costs, currency = 'DKK', onEditCosts }: CostBreakdownProps) {
  const panelsVal = toNum(costs.panels);
  const inverterVal = toNum(costs.inverter);
  const installationVal = toNum(costs.installation);
  const otherVal = toNum(costs.other);
  const total = panelsVal + inverterVal + installationVal + otherVal;

  const data = [
    { name: 'Solceller', value: panelsVal, fill: COLORS[0] },
    { name: 'Inverter', value: inverterVal, fill: COLORS[1] },
    { name: 'Installation', value: installationVal, fill: COLORS[2] },
  ];

  if (otherVal > 0) {
    data.push({ name: 'Andet', value: otherVal, fill: COLORS[3] });
  }

  const formatCurrency = (value: number) => Math.round(value).toLocaleString('da-DK');

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">Omkostningsopdeling</CardTitle>
            <CardDescription>
              Total investering inkl. 25% moms
            </CardDescription>
          </div>
          {onEditCosts && (
            <Button
              variant="outline"
              size="sm"
              onClick={onEditCosts}
              className="gap-2"
            >
              <Pencil className="h-4 w-4" />
              Rediger omkostninger
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid md:grid-cols-2 gap-6 items-center">
          {/* Donut chart with center label */}
          <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[250px]">
            <PieChart>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => (
                      <div className="flex items-center justify-between gap-8">
                        <span className="text-muted-foreground">{name}</span>
                        <span className="font-bold">{Number(value).toLocaleString('da-DK')} {currency}</span>
                      </div>
                    )}
                  />
                }
              />
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                nameKey="name"
                strokeWidth={2}
                stroke="hsl(var(--background))"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-2xl font-bold"
                          >
                            {formatCurrency(total)}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground text-sm"
                          >
                            {currency}
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>

          {/* Breakdown list */}
          <div className="space-y-3">
            {data.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between p-4 rounded-xl border bg-slate-50/50 hover:bg-slate-100/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full shadow-sm"
                    style={{ backgroundColor: item.fill }}
                  />
                  <span className="font-medium text-slate-700">{item.name}</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-900">
                    {formatCurrency(item.value)} {currency}
                  </div>
                  <div className="text-xs text-slate-500">
                    {((item.value / total) * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            ))}

            {/* Total row */}
            <div className="flex items-center justify-between p-4 rounded-xl border-2 border-slate-200 bg-slate-100/50 mt-4">
              <span className="font-semibold text-slate-800">Total</span>
              <span className="text-xl font-bold text-slate-900">
                {formatCurrency(total)} {currency}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
