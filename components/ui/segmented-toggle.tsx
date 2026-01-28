'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  description?: string;
}

interface SegmentedToggleProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
  className,
}: SegmentedToggleProps<T>) {
  const selectedIndex = options.findIndex((opt) => opt.value === value);

  return (
    <div
      className={cn(
        'relative inline-flex p-1 rounded-full bg-muted',
        className
      )}
    >
      {/* Animated background pill */}
      <motion.div
        className="absolute inset-y-1 rounded-full bg-foreground"
        initial={false}
        animate={{
          left: `calc(${selectedIndex * 50}% + 4px)`,
          width: 'calc(50% - 8px)',
        }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 35,
        }}
      />

      {/* Options */}
      {options.map((option) => {
        const isSelected = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'relative z-10 flex-1 px-5 py-2.5 rounded-full text-center transition-colors duration-200',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
              isSelected ? 'text-background' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <span className="block font-medium text-sm whitespace-nowrap">{option.label}</span>
            {option.description && (
              <span
                className={cn(
                  'block text-[10px] mt-0.5 transition-colors duration-200 whitespace-nowrap',
                  isSelected ? 'text-background/70' : 'text-muted-foreground/70'
                )}
              >
                {option.description}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
