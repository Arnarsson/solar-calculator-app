'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WizardStep } from './WizardLayout';

interface WizardStepperProps {
  steps: WizardStep[];
  currentStep: number;
  completedSteps: number[];
  onStepClick: (step: number) => void;
}

export function WizardStepper({
  steps,
  currentStep,
  completedSteps,
  onStepClick,
}: WizardStepperProps) {
  const getStepState = (stepId: number): 'completed' | 'current' | 'upcoming' => {
    if (completedSteps.includes(stepId)) return 'completed';
    if (stepId === currentStep) return 'current';
    return 'upcoming';
  };

  const isClickable = (stepId: number): boolean => {
    // Can click completed steps, current step, next step, or any step if all previous are completed
    const allPreviousCompleted = Array.from({ length: stepId - 1 }, (_, i) => i + 1)
      .every(s => completedSteps.includes(s));
    return completedSteps.includes(stepId) || stepId === currentStep || stepId === currentStep + 1 || allPreviousCompleted;
  };

  return (
    <nav aria-label="Progress" className="w-full">
      <ol className="flex items-center justify-between">
        {steps.map((step, index) => {
          const state = getStepState(step.id);
          const clickable = isClickable(step.id);
          const isLast = index === steps.length - 1;

          return (
            <li
              key={step.id}
              className={cn('flex items-center', !isLast && 'flex-1')}
            >
              {/* Step indicator */}
              <button
                type="button"
                onClick={() => clickable && onStepClick(step.id)}
                disabled={!clickable}
                className={cn(
                  'group flex items-center gap-3 transition-all duration-200',
                  clickable && 'cursor-pointer',
                  !clickable && 'cursor-not-allowed'
                )}
                aria-current={state === 'current' ? 'step' : undefined}
              >
                {/* Circle */}
                <span
                  className={cn(
                    'relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all duration-200',
                    state === 'completed' &&
                      'border-primary bg-primary text-primary-foreground',
                    state === 'current' &&
                      'border-primary bg-primary/10 text-primary ring-4 ring-primary/20',
                    state === 'upcoming' &&
                      'border-border bg-background text-muted-foreground',
                    clickable &&
                      state !== 'current' &&
                      'group-hover:border-primary/60 group-hover:text-primary/80'
                  )}
                >
                  {state === 'completed' ? (
                    <Check className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <span>{step.id}</span>
                  )}
                </span>

                {/* Labels */}
                <div className="hidden sm:flex flex-col items-start">
                  <span
                    className={cn(
                      'text-xs font-medium uppercase tracking-wider transition-colors duration-200',
                      state === 'completed' && 'text-primary',
                      state === 'current' && 'text-primary',
                      state === 'upcoming' && 'text-muted-foreground'
                    )}
                  >
                    Trin {step.id}/3
                  </span>
                  <span
                    className={cn(
                      'text-sm font-semibold transition-colors duration-200',
                      state === 'completed' && 'text-foreground',
                      state === 'current' && 'text-foreground',
                      state === 'upcoming' && 'text-muted-foreground'
                    )}
                  >
                    {step.shortTitle}
                  </span>
                </div>

                {/* Mobile: Show only short title below circle */}
                <span
                  className={cn(
                    'sm:hidden absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium whitespace-nowrap transition-colors duration-200',
                    state === 'completed' && 'text-primary',
                    state === 'current' && 'text-primary',
                    state === 'upcoming' && 'text-muted-foreground'
                  )}
                >
                  {step.shortTitle}
                </span>
              </button>

              {/* Connector line */}
              {!isLast && (
                <div className="flex-1 mx-4">
                  <div
                    className={cn(
                      'h-0.5 w-full rounded-full transition-colors duration-300',
                      completedSteps.includes(step.id)
                        ? 'bg-primary'
                        : 'bg-muted'
                    )}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
