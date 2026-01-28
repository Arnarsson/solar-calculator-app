'use client';

import * as React from 'react';
import { HelpCircle, Info, X } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface InfoTooltipProps {
  content: React.ReactNode;
  title?: string;
  variant?: 'help' | 'info';
  side?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  iconClassName?: string;
  maxWidth?: string;
}

/**
 * InfoTooltip - A reusable tooltip component for explanatory text
 *
 * On desktop: Shows tooltip on hover
 * On mobile: Shows tooltip on tap (touch-friendly)
 */
export function InfoTooltip({
  content,
  title,
  variant = 'help',
  side = 'top',
  className,
  iconClassName,
  maxWidth = '280px',
}: InfoTooltipProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const Icon = variant === 'help' ? HelpCircle : Info;

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip open={isOpen} onOpenChange={setIsOpen}>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setIsOpen(!isOpen);
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              setIsOpen(!isOpen);
            }}
            className={cn(
              'inline-flex items-center justify-center rounded-full p-0.5',
              'text-slate-400 hover:text-slate-600 focus:text-slate-600',
              'hover:bg-slate-100 focus:bg-slate-100',
              'transition-colors duration-150',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
              'touch-manipulation', // Better touch handling
              className
            )}
            aria-label={title || 'Vis mere information'}
          >
            <Icon className={cn('h-4 w-4', iconClassName)} />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side={side}
          sideOffset={8}
          className={cn(
            'z-[100] p-0 shadow-xl border-slate-200/80',
            'bg-white text-slate-700',
            'touch-auto' // Allow touch scrolling in tooltip
          )}
          style={{ maxWidth }}
        >
          <div className="p-3">
            {title && (
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-slate-900 text-sm">{title}</span>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="lg:hidden -mr-1 p-1 rounded-full hover:bg-slate-100 transition-colors"
                  aria-label="Luk"
                >
                  <X className="h-3.5 w-3.5 text-slate-400" />
                </button>
              </div>
            )}
            <div className="text-xs leading-relaxed text-slate-600">
              {content}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface ExplainerCardProps {
  title: string;
  children: React.ReactNode;
  variant?: 'info' | 'tip' | 'warning';
  className?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

/**
 * ExplainerCard - A card component for inline explanations
 */
export function ExplainerCard({
  title,
  children,
  variant = 'info',
  className,
  collapsible = false,
  defaultExpanded = true,
}: ExplainerCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);

  const variantStyles = {
    info: 'bg-blue-50 border-blue-100 text-blue-800',
    tip: 'bg-amber-50 border-amber-100 text-amber-800',
    warning: 'bg-red-50 border-red-100 text-red-800',
  };

  const iconStyles = {
    info: 'text-blue-500',
    tip: 'text-amber-500',
    warning: 'text-red-500',
  };

  return (
    <div
      className={cn(
        'rounded-xl border p-4',
        variantStyles[variant],
        className
      )}
    >
      <div
        className={cn(
          'flex items-start gap-3',
          collapsible && 'cursor-pointer'
        )}
        onClick={collapsible ? () => setIsExpanded(!isExpanded) : undefined}
        role={collapsible ? 'button' : undefined}
        tabIndex={collapsible ? 0 : undefined}
        onKeyDown={collapsible ? (e) => e.key === 'Enter' && setIsExpanded(!isExpanded) : undefined}
      >
        <Info className={cn('h-5 w-5 flex-shrink-0 mt-0.5', iconStyles[variant])} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-sm">{title}</span>
            {collapsible && (
              <button
                type="button"
                className="text-xs underline opacity-70 hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
              >
                {isExpanded ? 'Skjul' : 'Vis mere'}
              </button>
            )}
          </div>
          {(!collapsible || isExpanded) && (
            <div className="text-sm mt-1 opacity-90">{children}</div>
          )}
        </div>
      </div>
    </div>
  );
}
