'use client';

import { useState, ReactNode } from 'react';
import { WizardStepper } from './WizardStepper';
import { MobileStickyBar } from './MobileStickyBar';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface WizardStep {
  id: number;
  title: string;
  shortTitle: string;
}

export const WIZARD_STEPS: WizardStep[] = [
  { id: 1, title: 'Grundlæggende oplysninger', shortTitle: 'Grundlag' },
  { id: 2, title: 'Omkostninger', shortTitle: 'Omkostninger' },
  { id: 3, title: 'Resultat', shortTitle: 'Resultat' },
];

export interface WizardData {
  // Step 1: Basic info
  priceArea: 'DK1' | 'DK2';
  electricityRateDkk: number;
  selfConsumptionRate: number;
  roofAreaM2: number;
  // Advanced (collapsed by default)
  azimuthDegrees: number;
  tiltDegrees: number;

  // Step 2: Costs
  panelsCost: number;
  panelsCostUseEstimate: boolean;
  inverterCost: number;
  inverterCostUseEstimate: boolean;
  installationCost: number;
  installationCostUseEstimate: boolean;
  otherCost: number;
  otherCostUseEstimate: boolean;
}

export const DEFAULT_WIZARD_DATA: WizardData = {
  // Step 1
  priceArea: 'DK2',
  electricityRateDkk: 2.5,
  selfConsumptionRate: 0.7,
  roofAreaM2: 50,
  azimuthDegrees: 180,
  tiltDegrees: 35,

  // Step 2
  panelsCost: 50000,
  panelsCostUseEstimate: true,
  inverterCost: 20000,
  inverterCostUseEstimate: true,
  installationCost: 40000,
  installationCostUseEstimate: true,
  otherCost: 10000,
  otherCostUseEstimate: true,
};

// Estimate calculation functions
export function getEstimatedPanelsCost(roofAreaM2: number): number {
  // Approximately 1000 DKK per m² for panels
  return Math.round(roofAreaM2 * 1000);
}

export function getEstimatedInverterCost(roofAreaM2: number): number {
  // System size (kW) = area / 6 (approx 6m² per kW)
  // Inverter cost approx 4000 DKK per kW
  const systemSizeKw = roofAreaM2 / 6;
  return Math.round(systemSizeKw * 4000);
}

export function getEstimatedInstallationCost(roofAreaM2: number): number {
  // Approximately 800 DKK per m² for installation
  return Math.round(roofAreaM2 * 800);
}

export function getEstimatedOtherCost(roofAreaM2: number): number {
  // Mounting kit, cables, etc. - approximately 200 DKK per m²
  return Math.round(roofAreaM2 * 200);
}

interface WizardLayoutProps {
  children: (props: {
    currentStep: number;
    setCurrentStep: (step: number) => void;
    completedSteps: number[];
    setCompletedSteps: (steps: number[]) => void;
    wizardData: WizardData;
    setWizardData: (data: WizardData) => void;
    canProceed: boolean;
    setCanProceed: (can: boolean) => void;
  }) => {
    form: ReactNode;
    results: ReactNode;
  };
}

export function WizardLayout({ children }: WizardLayoutProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [wizardData, setWizardData] = useState<WizardData>(DEFAULT_WIZARD_DATA);
  const [canProceed, setCanProceed] = useState(true);

  // Calculate total system cost for display
  const totalSystemCost =
    (wizardData.panelsCostUseEstimate
      ? getEstimatedPanelsCost(wizardData.roofAreaM2)
      : wizardData.panelsCost) +
    (wizardData.inverterCostUseEstimate
      ? getEstimatedInverterCost(wizardData.roofAreaM2)
      : wizardData.inverterCost) +
    (wizardData.installationCostUseEstimate
      ? getEstimatedInstallationCost(wizardData.roofAreaM2)
      : wizardData.installationCost) +
    (wizardData.otherCostUseEstimate
      ? getEstimatedOtherCost(wizardData.roofAreaM2)
      : wizardData.otherCost);

  const totalWithVat = Math.round(totalSystemCost * 1.25);

  const handleStepClick = (step: number) => {
    // Can navigate to: completed steps, current step, or next available step
    // Also allow jumping to any step if all previous steps are completed
    const allPreviousCompleted = Array.from({ length: step - 1 }, (_, i) => i + 1)
      .every(s => completedSteps.includes(s));

    if (completedSteps.includes(step) || step === currentStep || step === currentStep + 1 || allPreviousCompleted) {
      // Mark current step as completed when moving forward
      if (step > currentStep && !completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
      setCurrentStep(step);
    }
  };

  const handleNext = () => {
    if (currentStep < 3) {
      // Mark current step as completed
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const { form, results } = children({
    currentStep,
    setCurrentStep,
    completedSteps,
    setCompletedSteps,
    wizardData,
    setWizardData,
    canProceed,
    setCanProceed,
  });

  // Get context text for mobile sticky bar
  const getContextText = () => {
    if (currentStep === 1) {
      return `${wizardData.roofAreaM2} m² tagflade`;
    }
    if (currentStep === 2) {
      return `Systempris: ${totalWithVat.toLocaleString('da-DK')} kr`;
    }
    return '';
  };

  // Get CTA text
  const getCtaText = () => {
    if (currentStep === 1) return 'Fortsæt til omkostninger';
    if (currentStep === 2) return 'Se resultat';
    return 'Færdig';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Stepper - always visible at top */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <WizardStepper
            steps={WIZARD_STEPS}
            currentStep={currentStep}
            completedSteps={completedSteps}
            onStepClick={handleStepClick}
          />
        </div>
      </div>

      {/* Main content area */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Desktop: 2-column layout */}
        <div className="hidden lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Form column - 4 cols */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-4">
              {form}

              {/* Desktop navigation buttons */}
              <div className="flex items-center justify-between gap-3 pt-2">
                {currentStep > 1 ? (
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    className="flex items-center gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Tilbage
                  </Button>
                ) : (
                  <div /> // Spacer
                )}

                {currentStep < 3 && (
                  <Button
                    onClick={handleNext}
                    className="flex items-center gap-2"
                  >
                    {getCtaText()}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Results column - 8 cols */}
          <div className="lg:col-span-8">{results}</div>
        </div>

        {/* Mobile: Single column with bottom padding for sticky bar */}
        <div className="lg:hidden pb-24">
          {currentStep < 3 ? (
            // Steps 1 and 2: Show form only
            <div>{form}</div>
          ) : (
            // Step 3: Show results
            <div>{results}</div>
          )}
        </div>
      </div>

      {/* Mobile sticky bottom bar */}
      <MobileStickyBar
        currentStep={currentStep}
        totalSteps={3}
        contextText={getContextText()}
        ctaText={getCtaText()}
        onNext={handleNext}
        onPrevious={handlePrevious}
        canProceed={canProceed}
        showPrevious={currentStep > 1}
        showNext={currentStep < 3}
      />
    </div>
  );
}
