'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MobileStickyBarProps {
  currentStep: number;
  totalSteps: number;
  contextText: string;
  ctaText: string;
  onNext: () => void;
  onPrevious: () => void;
  canProceed: boolean;
  showPrevious?: boolean;
  showNext?: boolean;
}

export function MobileStickyBar({
  currentStep,
  totalSteps,
  contextText,
  ctaText,
  onNext,
  onPrevious,
  canProceed,
  showPrevious = true,
  showNext = true,
}: MobileStickyBarProps) {
  // Don't show on desktop or when on last step
  if (currentStep === totalSteps) {
    return null;
  }

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
      {/* Gradient fade effect at top */}
      <div className="absolute -top-6 left-0 right-0 h-6 bg-gradient-to-t from-white to-transparent pointer-events-none" />

      {/* Main bar */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="bg-white border-t border-slate-200 shadow-lg"
      >
        <div className="px-4 py-3 safe-area-inset-bottom">
          {/* Context text with animation */}
          <AnimatePresence mode="wait">
            <motion.div
              key={contextText}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="text-center mb-3"
            >
              {contextText && (
                <p className="text-sm font-medium text-slate-600">{contextText}</p>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation buttons */}
          <div className="flex items-center gap-3">
            {/* Previous button */}
            {showPrevious && currentStep > 1 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={onPrevious}
                  className="flex-shrink-0"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Tilbage
                </Button>
              </motion.div>
            )}

            {/* Primary CTA button */}
            {showNext && (
              <motion.div
                className="flex-1"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: 0.1 }}
              >
                <Button
                  type="button"
                  variant="solar"
                  size="lg"
                  onClick={onNext}
                  disabled={!canProceed}
                  className={cn(
                    'w-full font-semibold transition-all duration-200',
                    canProceed
                      ? 'shadow-lg shadow-solar-500/25 hover:shadow-xl hover:shadow-solar-500/30'
                      : 'opacity-50'
                  )}
                >
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={ctaText}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="flex items-center justify-center"
                    >
                      {ctaText}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </motion.span>
                  </AnimatePresence>
                </Button>
              </motion.div>
            )}
          </div>

          {/* Progress indicator dots */}
          <div className="flex items-center justify-center gap-2 mt-3">
            {Array.from({ length: totalSteps - 1 }).map((_, index) => (
              <motion.div
                key={index}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  index + 1 === currentStep
                    ? 'w-6 bg-primary'
                    : index + 1 < currentStep
                    ? 'w-1.5 bg-primary/60'
                    : 'w-1.5 bg-slate-200'
                )}
                layoutId={`progress-dot-${index}`}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
