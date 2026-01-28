'use client';

import { TrendingUp, DollarSign, Calendar, Percent, Zap, TrendingDown } from 'lucide-react';

// Helper to safely get number from string or number
const toNum = (val: any): number => {
  if (val === undefined || val === null) return 0;
  if (typeof val === 'number') return val;
  if (typeof val === 'string') return parseFloat(val);
  if (val.toNumber) return val.toNumber();
  return 0;
};

interface MetricsGridProps {
  projection: any; // Serialized projection from API
  systemSizeKw: number;
  systemCost: any; // Can be Decimal or number
  currency?: string;
}

export function MetricsGrid({ projection, systemSizeKw, systemCost, currency = 'DKK' }: MetricsGridProps) {
  const { summary, years } = projection;

  const systemCostNum = toNum(systemCost);

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

  // Calculate additional metrics from serialized data
  const firstYearProduction = toNum(years[0]?.productionKwh);
  const lastYearProduction = toNum(years[years.length - 1]?.productionKwh);
  const totalProduction = years.reduce((sum: number, y: any) => sum + toNum(y.productionKwh), 0);

  const costPerKw = systemCostNum / systemSizeKw;
  const costPerKwh25Year = systemCostNum / totalProduction;

  const firstYearSavings = toNum(years[0]?.netSavingsNominal);
  const totalSavingsNominal = toNum(summary?.totalSavingsNominal);
  const avgAnnualSavings = totalSavingsNominal / 25;

  const totalDegradation = ((firstYearProduction - lastYearProduction) / firstYearProduction) * 100;

  const metrics = [
    {
      icon: DollarSign,
      label: 'Systempris',
      value: `${formatCurrency(systemCostNum)} ${currency}`,
      subtext: `${formatCurrency(costPerKw)} ${currency}/kW`,
    },
    {
      icon: Zap,
      label: 'Systemstørrelse',
      value: `${systemSizeKw.toFixed(1)} kW`,
      subtext: `${formatNumber(firstYearProduction / systemSizeKw)} kWh/kW/år`,
    },
    {
      icon: TrendingUp,
      label: 'Total Besparelse',
      value: `${formatCurrency(toNum(summary?.totalSavingsReal))} ${currency}`,
      subtext: "I dagens værdi",
    },
    {
      icon: Calendar,
      label: 'Tilbagebetaling',
      value: `${summary?.breakEvenYearReal || '-'} år`,
      subtext: `${summary?.breakEvenYearNominal || '-'} år (nominelt)`,
    },
    {
      icon: Percent,
      label: 'Afkast (ROI)',
      value: `${toNum(summary?.roi25Year).toFixed(0)}%`,
      subtext: 'Over 25 år',
    },
    {
      icon: Zap,
      label: 'Total Produktion',
      value: `${formatCurrency(totalProduction)} kWh`,
      subtext: 'Over 25 år',
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <div key={index} className="metric-card group">
            <div className="flex flex-row items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {metric.label}
              </h3>
              <div className="p-2 rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors">
                <Icon className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold tracking-tight text-slate-900">{metric.value}</div>
              <p className="text-xs text-slate-500">{metric.subtext}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
