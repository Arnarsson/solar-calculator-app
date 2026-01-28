'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProjectionResult } from '@/lib/calculations/projection';
import { TrendingUp, DollarSign, Calendar, Percent, Zap, TrendingDown } from 'lucide-react';
import Decimal from 'decimal.js';

interface MetricsGridProps {
  projection: ProjectionResult;
  systemSizeKw: number;
  systemCost: Decimal;
  currency?: string;
}

export function MetricsGrid({ projection, systemSizeKw, systemCost, currency = 'DKK' }: MetricsGridProps) {
  const { summary, years } = projection;

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('da-DK', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Format number
  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('da-DK', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Calculate additional metrics
  const firstYearProduction = years[0].productionKwh.toNumber();
  const lastYearProduction = years[years.length - 1].productionKwh.toNumber();
  const totalProduction = years.reduce((sum, y) => sum + y.productionKwh.toNumber(), 0);

  const costPerKw = systemCost.dividedBy(systemSizeKw).toNumber();
  const costPerKwh25Year = systemCost.dividedBy(totalProduction).toNumber();

  const firstYearSavings = years[0].netSavingsNominal.toNumber();
  const avgAnnualSavings = summary.totalSavingsNominal.dividedBy(25).toNumber();

  const totalDegradation = ((firstYearProduction - lastYearProduction) / firstYearProduction) * 100;

  const metrics = [
    {
      icon: DollarSign,
      label: 'System Cost',
      value: `${formatCurrency(systemCost.toNumber())} ${currency}`,
      subtext: `${formatCurrency(costPerKw)} ${currency}/kW`,
    },
    {
      icon: Zap,
      label: 'System Size',
      value: `${systemSizeKw.toFixed(2)} kW`,
      subtext: `${formatNumber(firstYearProduction / systemSizeKw)} kWh/kW/year`,
    },
    {
      icon: TrendingUp,
      label: 'Total Savings (Nominal)',
      value: `${formatCurrency(summary.totalSavingsNominal.toNumber())} ${currency}`,
      subtext: `${formatCurrency(avgAnnualSavings)} ${currency}/year avg`,
    },
    {
      icon: TrendingUp,
      label: 'Total Savings (Real)',
      value: `${formatCurrency(summary.totalSavingsReal.toNumber())} ${currency}`,
      subtext: "In today's value",
    },
    {
      icon: Calendar,
      label: 'Payback Period (Real)',
      value: `${summary.breakEvenYearReal} years`,
      subtext: `${summary.breakEvenYearNominal} years (nominal)`,
    },
    {
      icon: Percent,
      label: 'Return on Investment',
      value: `${summary.roi25Year.toFixed(1)}%`,
      subtext: 'Over 25 years',
    },
    {
      icon: Zap,
      label: 'Total Production',
      value: `${formatCurrency(totalProduction)} kWh`,
      subtext: 'Over 25 years',
    },
    {
      icon: DollarSign,
      label: 'Cost per kWh',
      value: `${costPerKwh25Year.toFixed(2)} ${currency}`,
      subtext: '25-year average',
    },
    {
      icon: TrendingUp,
      label: 'First Year Savings',
      value: `${formatCurrency(firstYearSavings)} ${currency}`,
      subtext: 'After maintenance',
    },
    {
      icon: TrendingDown,
      label: 'Total Degradation',
      value: `${totalDegradation.toFixed(1)}%`,
      subtext: 'Year 1 to Year 25',
    },
    {
      icon: DollarSign,
      label: 'Maintenance Cost',
      value: `${formatCurrency(summary.totalMaintenanceCost.toNumber())} ${currency}`,
      subtext: 'Total over 25 years',
    },
    {
      icon: Percent,
      label: 'Annualized Return',
      value: `${(summary.roi25Year.dividedBy(25)).toFixed(2)}%`,
      subtext: 'Average per year',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{metric.subtext}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
