'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProjectionResult } from '@/lib/calculations/projection';
import { TrendingUp, Clock, Zap, Leaf } from 'lucide-react';

interface ResultsDisplayProps {
  projection: ProjectionResult;
  systemSizeKw: number;
  currency?: string;
}

export function ResultsDisplay({ projection, systemSizeKw, currency = 'DKK' }: ResultsDisplayProps) {
  const { summary } = projection;

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('da-DK', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Calculate first year production
  const firstYearProduction = projection.years[0]?.productionKwh.toNumber() || 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Savings Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Savings (25 years)</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(summary.totalSavingsNominal.toNumber())} {currency}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {formatCurrency(summary.totalSavingsReal.toNumber())} {currency} in today's value
          </p>
        </CardContent>
      </Card>

      {/* Payback Period Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Payback Period</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {summary.breakEvenYearReal} years
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {summary.breakEvenYearNominal} years (nominal)
          </p>
        </CardContent>
      </Card>

      {/* ROI Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Return on Investment</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {summary.roi25Year.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Over 25 years
          </p>
        </CardContent>
      </Card>

      {/* System Production Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">First Year Production</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(firstYearProduction)} kWh
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {systemSizeKw.toFixed(1)} kW system
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
