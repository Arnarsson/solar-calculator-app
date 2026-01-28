'use client';

import { Card } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { AnimatedNumber } from '@/components/ui/animated-number';
import { HelpCircle } from 'lucide-react';

// Helper to safely get number
const toNum = (val: any): number => {
  if (val === undefined || val === null) return 0;
  if (typeof val === 'number') return val;
  if (typeof val === 'string') return parseFloat(val);
  if (val.toNumber) return val.toNumber();
  return 0;
};

interface KPIGridProps {
  projection: any;
  systemCost: any;
  currency?: string;
}

interface KPICardProps {
  title: string;
  value: number;
  subtitle: string;
  tooltip: string;
  format?: (n: number) => string;
  colorClass?: string;
}

function KPICard({
  title,
  value,
  subtitle,
  tooltip,
  format,
  colorClass = 'from-muted to-muted/80 border-border',
}: KPICardProps) {
  return (
    <Card className={`relative overflow-hidden border bg-gradient-to-br ${colorClass} p-5`}>
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                <HelpCircle className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <p className="text-sm">{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="space-y-1">
        <div className="text-3xl font-bold tracking-tight text-foreground">
          <AnimatedNumber value={value} format={format} />
        </div>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </Card>
  );
}

export function KPIGrid({ projection, systemCost, currency = 'DKK' }: KPIGridProps) {
  const { summary } = projection;

  const systemCostNum = toNum(systemCost);
  const breakEvenYear = toNum(summary?.breakEvenYearReal) || 0;
  const firstYearSavings = toNum(projection.years?.[0]?.netSavingsReal) || 0;
  const totalSavingsReal = toNum(summary?.totalSavingsReal) || 0;

  const formatYear = (n: number) => n.toFixed(1);
  const formatCurrency = (n: number) => n.toLocaleString('da-DK', { maximumFractionDigits: 0 });

  const kpis: KPICardProps[] = [
    {
      title: 'TILBAGEBETALING',
      value: breakEvenYear,
      subtitle: 'ar',
      tooltip: 'Antal ar for din investering er tjent hjem, justeret for inflation. Beregnet i reale værdier (dagens pengeverdi).',
      format: formatYear,
      colorClass: 'from-emerald-50 to-emerald-100 border-emerald-200 dark:from-emerald-950/50 dark:to-emerald-900/30 dark:border-emerald-800/50',
    },
    {
      title: 'ARLIG BESPARELSE',
      value: firstYearSavings,
      subtitle: `${currency} i forste ar`,
      tooltip: 'Din forventede besparelse i det forste ar efter installation. Inkluderer bade egetforbrug og salg til nettet.',
      format: formatCurrency,
      colorClass: 'from-blue-50 to-blue-100 border-blue-200 dark:from-blue-950/50 dark:to-blue-900/30 dark:border-blue-800/50',
    },
    {
      title: '25-ARS BESPARELSE',
      value: totalSavingsReal,
      subtitle: `${currency} i dagens værdi`,
      tooltip: 'Total besparelse over 25 ar, beregnet i dagens pengeverdi (realværdi). Tager hojde for inflation og panelernes degradering.',
      format: formatCurrency,
      colorClass: 'from-indigo-50 to-indigo-100 border-indigo-200 dark:from-indigo-950/50 dark:to-indigo-900/30 dark:border-indigo-800/50',
    },
    {
      title: 'SYSTEMPRIS',
      value: systemCostNum,
      subtitle: `${currency} inkl. moms`,
      tooltip: 'Samlet pris for dit solcelleanlæg inklusive paneler, inverter, montering og installation. Prisen er inkl. 25% moms.',
      format: formatCurrency,
      colorClass: 'from-amber-50 to-amber-100 border-amber-200 dark:from-amber-950/50 dark:to-amber-900/30 dark:border-amber-800/50',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, index) => (
        <KPICard key={index} {...kpi} />
      ))}
    </div>
  );
}
