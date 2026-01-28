'use client';

import { motion } from 'framer-motion';
import { DollarSign, Percent, ToggleLeft, ToggleRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { InfoTooltip, ExplainerCard } from '@/components/ui/info-tooltip';
import { cn } from '@/lib/utils';
import {
  type WizardData,
  getEstimatedPanelsCost,
  getEstimatedInverterCost,
  getEstimatedInstallationCost,
  getEstimatedOtherCost,
} from '../WizardLayout';

// Stagger animation for cost items
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 24,
    },
  },
} as const;

interface Step2CostsProps {
  data: WizardData;
  onChange: (data: Partial<WizardData>) => void;
}

interface CostLineProps {
  label: string;
  description: string;
  tooltip?: React.ReactNode;
  value: number;
  estimateValue: number;
  useEstimate: boolean;
  onValueChange: (value: number) => void;
  onToggleEstimate: (useEstimate: boolean) => void;
}

function CostLine({
  label,
  description,
  tooltip,
  value,
  estimateValue,
  useEstimate,
  onValueChange,
  onToggleEstimate,
}: CostLineProps) {
  const displayValue = useEstimate ? estimateValue : value;

  return (
    <motion.div
      className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors"
      variants={itemVariants}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Label and description */}
        <div className="flex-1 min-w-0">
          <Label className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
            {label}
            {tooltip && (
              <InfoTooltip
                title={label}
                content={tooltip}
              />
            )}
          </Label>
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        </div>

        {/* Value input or estimate display */}
        <div className="flex items-center gap-3">
          {useEstimate ? (
            <motion.div
              key={estimateValue}
              initial={{ scale: 1.1, opacity: 0.5 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-right"
            >
              <span className="text-lg font-bold text-slate-900">
                {estimateValue.toLocaleString('da-DK')}
              </span>
              <span className="text-sm text-slate-500 ml-1">kr</span>
            </motion.div>
          ) : (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="0"
                max="500000"
                step="1000"
                value={value}
                onChange={(e) => onValueChange(parseFloat(e.target.value) || 0)}
                className="w-28 text-right"
                disabled={useEstimate}
              />
              <span className="text-sm text-slate-500">kr</span>
            </div>
          )}
        </div>
      </div>

      {/* Estimate toggle */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
        <span className="text-xs text-slate-500">
          {useEstimate ? 'Bruger estimat baseret på tagflade' : 'Manuel indtastning'}
        </span>
        <motion.button
          type="button"
          onClick={() => onToggleEstimate(!useEstimate)}
          whileTap={{ scale: 0.95 }}
          className={cn(
            'flex items-center gap-2 text-xs font-medium transition-colors',
            useEstimate
              ? 'text-primary hover:text-primary/80'
              : 'text-slate-500 hover:text-slate-700'
          )}
        >
          {useEstimate ? (
            <>
              <ToggleRight className="h-5 w-5" />
              Brug estimat
            </>
          ) : (
            <>
              <ToggleLeft className="h-5 w-5" />
              Angiv selv
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}

export function Step2Costs({ data, onChange }: Step2CostsProps) {
  // Calculate estimates based on roof area
  const estimates = {
    panels: getEstimatedPanelsCost(data.roofAreaM2),
    inverter: getEstimatedInverterCost(data.roofAreaM2),
    installation: getEstimatedInstallationCost(data.roofAreaM2),
    other: getEstimatedOtherCost(data.roofAreaM2),
  };

  // Calculate totals
  const subtotal =
    (data.panelsCostUseEstimate ? estimates.panels : data.panelsCost) +
    (data.inverterCostUseEstimate ? estimates.inverter : data.inverterCost) +
    (data.installationCostUseEstimate ? estimates.installation : data.installationCost) +
    (data.otherCostUseEstimate ? estimates.other : data.otherCost);

  const VAT_RATE = 0.25;
  const vatAmount = Math.round(subtotal * VAT_RATE);
  const totalWithVat = subtotal + vatAmount;

  // Calculate cost per kWp for reference
  const systemSizeKw = data.roofAreaM2 / 6;
  const costPerKwp = Math.round(totalWithVat / systemSizeKw);

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <DollarSign className="h-5 w-5 text-primary" />
          </div>
          Omkostninger
          <InfoTooltip
            title="Om prisestimater"
            content={
              <>
                <p className="mb-2">
                  Vores estimater er baseret på gennemsnitlige danske markedspriser
                  for solcelleanlæg i 2024.
                </p>
                <p>
                  Har du modtaget tilbud fra en installatør? Skift til manuel
                  indtastning for at bruge de faktiske priser.
                </p>
              </>
            }
          />
        </CardTitle>
        <CardDescription>
          Angiv priser eller brug vores estimater baseret på din tagflade ({data.roofAreaM2} m²)
        </CardDescription>
      </CardHeader>

      <CardContent>
        <motion.div
          className="space-y-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Cost lines */}
          <CostLine
            label="Solpaneler"
            description="Pris for selve solcellepanelerne"
            tooltip={
              <>
                <p className="mb-2">
                  Prisen på solpaneler afhænger af type, kvalitet og effektivitet.
                  Premium-paneler koster mere, men producerer typisk mere strøm pr. m².
                </p>
                <p>
                  <strong>Estimat:</strong> Ca. 1.000 kr/m² for standard monokrystallinske paneler.
                </p>
              </>
            }
            value={data.panelsCost}
            estimateValue={estimates.panels}
            useEstimate={data.panelsCostUseEstimate}
            onValueChange={(value) => onChange({ panelsCost: value })}
            onToggleEstimate={(useEstimate) => onChange({ panelsCostUseEstimate: useEstimate })}
          />

          <CostLine
            label="Inverter"
            description="Omformer DC til AC strøm"
            tooltip={
              <>
                <p className="mb-2">
                  Inverteren omdanner solpanelernes jævnstrøm (DC) til vekselstrøm (AC),
                  som kan bruges i hjemmet.
                </p>
                <p>
                  <strong>Estimat:</strong> Ca. 4.000 kr/kWp. Kvalitetsinvertere
                  som Fronius eller SMA har ofte længere garanti.
                </p>
              </>
            }
            value={data.inverterCost}
            estimateValue={estimates.inverter}
            useEstimate={data.inverterCostUseEstimate}
            onValueChange={(value) => onChange({ inverterCost: value })}
            onToggleEstimate={(useEstimate) => onChange({ inverterCostUseEstimate: useEstimate })}
          />

          <CostLine
            label="Installation"
            description="Arbejdsløn og montering"
            tooltip={
              <>
                <p className="mb-2">
                  Installationsomkostninger inkluderer arbejdsløn, stillads,
                  elmontage og tilslutning til elnettet.
                </p>
                <p>
                  <strong>Estimat:</strong> Ca. 800 kr/m². Prisen varierer
                  afhængig af tagtype og adgangsforhold.
                </p>
              </>
            }
            value={data.installationCost}
            estimateValue={estimates.installation}
            useEstimate={data.installationCostUseEstimate}
            onValueChange={(value) => onChange({ installationCost: value })}
            onToggleEstimate={(useEstimate) => onChange({ installationCostUseEstimate: useEstimate })}
          />

          <CostLine
            label="Andet (kabler, beslag mv.)"
            description="Monteringskit, kabler og diverse"
            tooltip={
              <>
                <p className="mb-2">
                  Inkluderer monteringssystem, DC-kabler, AC-kabler, sikringer,
                  overspændingsbeskyttelse og diverse småting.
                </p>
                <p>
                  <strong>Estimat:</strong> Ca. 200 kr/m². Kan variere afhængig
                  af tagtype og kabelafstande.
                </p>
              </>
            }
            value={data.otherCost}
            estimateValue={estimates.other}
            useEstimate={data.otherCostUseEstimate}
            onValueChange={(value) => onChange({ otherCost: value })}
            onToggleEstimate={(useEstimate) => onChange({ otherCostUseEstimate: useEstimate })}
          />

          {/* Totals */}
          <motion.div
            className="mt-6 p-4 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200"
            variants={itemVariants}
          >
            {/* Subtotal */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Subtotal (ekskl. moms)</span>
              <motion.span
                key={subtotal}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                className="font-semibold text-slate-900"
              >
                {subtotal.toLocaleString('da-DK')} kr
              </motion.span>
            </div>

            {/* VAT */}
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-slate-600 flex items-center gap-1">
                <Percent className="h-3 w-3" />
                Moms (25%)
              </span>
              <motion.span
                key={vatAmount}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                className="font-semibold text-slate-900"
              >
                {vatAmount.toLocaleString('da-DK')} kr
              </motion.span>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200">
              <span className="font-semibold text-slate-900">Total inkl. moms</span>
              <motion.span
                key={totalWithVat}
                initial={{ scale: 1.2, color: '#22c55e' }}
                animate={{ scale: 1, color: 'var(--primary)' }}
                className="text-2xl font-bold text-primary"
              >
                {totalWithVat.toLocaleString('da-DK')} kr
              </motion.span>
            </div>

            {/* Cost per kWp reference */}
            <div className="flex items-center justify-between text-xs mt-3 pt-3 border-t border-slate-200">
              <span className="text-slate-500 flex items-center gap-1">
                Pris pr. kWp ({systemSizeKw.toFixed(1)} kWp system)
                <InfoTooltip
                  title="Pris pr. kWp"
                  content={
                    <>
                      <p className="mb-2">
                        Pris pr. kWp (kilowattpeak) er den mest brugte måleenhed
                        til at sammenligne solcellepriser på tværs af systemstørrelser.
                      </p>
                      <p>
                        <strong>Godt at vide:</strong> Større systemer har ofte lavere pris pr. kWp
                        pga. stordriftsfordele.
                      </p>
                    </>
                  }
                />
              </span>
              <motion.span
                key={costPerKwp}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                className="text-slate-700 font-medium"
              >
                {costPerKwp.toLocaleString('da-DK')} kr/kWp
              </motion.span>
            </div>
          </motion.div>

          {/* Helpful note */}
          <motion.div variants={itemVariants}>
            <ExplainerCard
              title={costPerKwp < 15000 ? 'Lav pris' : costPerKwp > 20000 ? 'Høj pris' : 'Normal pris'}
              variant={costPerKwp < 15000 ? 'tip' : costPerKwp > 20000 ? 'warning' : 'info'}
            >
              {costPerKwp < 15000 ? (
                <>
                  Med {costPerKwp.toLocaleString('da-DK')} kr/kWp er din pris under markedsgennemsnittet.
                  Kontroller at alle omkostninger er medregnet.
                </>
              ) : costPerKwp > 20000 ? (
                <>
                  Med {costPerKwp.toLocaleString('da-DK')} kr/kWp er din pris over markedsgennemsnittet
                  (15.000-20.000 kr/kWp). Overvej at indhente flere tilbud.
                </>
              ) : (
                <>
                  Din pris på {costPerKwp.toLocaleString('da-DK')} kr/kWp ligger inden for
                  det normale interval (15.000-20.000 kr/kWp) for danske solcelleanlæg.
                </>
              )}
            </ExplainerCard>
          </motion.div>
        </motion.div>
      </CardContent>
    </Card>
  );
}
