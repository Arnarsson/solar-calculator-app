'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react';
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
  const [isExpanded, setIsExpanded] = useState(true);

  // Motion values for swipe gesture
  const y = useMotionValue(0);
  const opacity = useTransform(y, [-50, 0, 50], [1, 1, 0.5]);

  // Handle swipe gestures
  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const threshold = 50;
      const velocity = info.velocity.y;
      const offset = info.offset.y;

      // Swipe down to collapse
      if (offset > threshold || velocity > 500) {
        setIsExpanded(false);
      }
      // Swipe up to expand or trigger next
      else if (offset < -threshold || velocity < -500) {
        if (!isExpanded) {
          setIsExpanded(true);
        } else if (canProceed && showNext) {
          // Quick swipe up when expanded triggers next
          onNext();
        }
      }
    },
    [isExpanded, canProceed, showNext, onNext]
  );

  // Don't show on desktop or when on last step
  if (currentStep === totalSteps) {
    return null;
  }

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
      {/* Gradient fade effect at top */}
      <div className="absolute -top-8 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none" />

      {/* Main bar with drag gesture */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring' as const, stiffness: 300, damping: 30 }}
        style={{ opacity }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        className="bg-background border-t border-border shadow-lg touch-none"
      >
        {/* Drag handle indicator */}
        <div
          className="flex justify-center pt-2 pb-1 cursor-grab active:cursor-grabbing"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <motion.div
            animate={{ width: isExpanded ? 32 : 48 }}
            className="h-1 bg-border rounded-full"
          />
        </div>

        <AnimatePresence mode="wait">
          {isExpanded ? (
            <motion.div
              key="expanded"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="px-4 pb-3 safe-area-inset-bottom overflow-hidden"
            >
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
                    <p className="text-sm font-medium text-muted-foreground">{contextText}</p>
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
                      className="flex-shrink-0 active:scale-95 transition-transform touch-manipulation"
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
                        'w-full font-semibold transition-all duration-200 touch-manipulation',
                        'active:scale-[0.98] active:shadow-md',
                        canProceed
                          ? 'shadow-lg shadow-solar-500/25'
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
                        : 'w-1.5 bg-muted'
                    )}
                    layoutId={`progress-dot-${index}`}
                  />
                ))}
              </div>

              {/* Swipe hint */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ delay: 1 }}
                className="text-[10px] text-muted-foreground text-center mt-2"
              >
                Swipe op for at fortsætte
              </motion.p>
            </motion.div>
          ) : (
            // Collapsed state - minimal bar
            <motion.div
              key="collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-4 pb-3 safe-area-inset-bottom"
            >
              <button
                onClick={() => setIsExpanded(true)}
                className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-muted-foreground active:text-foreground transition-colors touch-manipulation"
              >
                <ChevronUp className="h-4 w-4" />
                <span>Trin {currentStep} af {totalSteps - 1}</span>
                <span className="text-muted-foreground">|</span>
                <span className="text-primary font-semibold">{ctaText}</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
