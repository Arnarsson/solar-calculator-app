'use client';

import * as React from 'react';
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  type Variants,
  type PanInfo,
} from 'framer-motion';
import { cn } from '@/lib/utils';

// Context for toolbar state
interface ToolbarContextValue {
  isExpanded: boolean;
  toggle: () => void;
  expand: () => void;
  collapse: () => void;
}

const ToolbarContext = React.createContext<ToolbarContextValue | null>(null);

function useToolbar() {
  const context = React.useContext(ToolbarContext);
  if (!context) {
    throw new Error('useToolbar must be used within a ToolbarExpandable');
  }
  return context;
}

// Animation variants
const toolbarVariants: Variants = {
  collapsed: {
    height: 'auto',
  },
  expanded: {
    height: 'auto',
  },
};

const contentVariants: Variants = {
  collapsed: {
    opacity: 0,
    height: 0,
    marginTop: 0,
  },
  expanded: {
    opacity: 1,
    height: 'auto',
    marginTop: 12,
  },
};

const reducedMotionContentVariants: Variants = {
  collapsed: {
    opacity: 0,
    height: 0,
    marginTop: 0,
  },
  expanded: {
    opacity: 1,
    height: 'auto',
    marginTop: 12,
  },
};

// Main toolbar component
interface ToolbarExpandableProps {
  children: React.ReactNode;
  /** Controlled expanded state */
  expanded?: boolean;
  /** Callback when expanded state changes */
  onExpandedChange?: (expanded: boolean) => void;
  /** Default expanded state for uncontrolled mode */
  defaultExpanded?: boolean;
  /** Position of the toolbar */
  position?: 'bottom' | 'top';
  /** Enable swipe gestures to expand/collapse */
  enableSwipe?: boolean;
  className?: string;
}

function ToolbarExpandable({
  children,
  className,
  expanded: controlledExpanded,
  onExpandedChange,
  defaultExpanded = false,
  position = 'bottom',
  enableSwipe = true,
}: ToolbarExpandableProps) {
  const [internalExpanded, setInternalExpanded] = React.useState(defaultExpanded);
  const prefersReducedMotion = useReducedMotion();

  const isControlled = controlledExpanded !== undefined;
  const isExpanded = isControlled ? controlledExpanded : internalExpanded;

  const toggle = React.useCallback(() => {
    if (isControlled) {
      onExpandedChange?.(!controlledExpanded);
    } else {
      setInternalExpanded((prev) => {
        const next = !prev;
        onExpandedChange?.(next);
        return next;
      });
    }
  }, [isControlled, controlledExpanded, onExpandedChange]);

  const expand = React.useCallback(() => {
    if (isControlled) {
      onExpandedChange?.(true);
    } else {
      setInternalExpanded(true);
      onExpandedChange?.(true);
    }
  }, [isControlled, onExpandedChange]);

  const collapse = React.useCallback(() => {
    if (isControlled) {
      onExpandedChange?.(false);
    } else {
      setInternalExpanded(false);
      onExpandedChange?.(false);
    }
  }, [isControlled, onExpandedChange]);

  const handleDragEnd = React.useCallback(
    (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      // Prevent event from propagating
      event.preventDefault?.();

      if (!enableSwipe) return;

      const threshold = 50;
      const velocity = info.velocity.y;
      const offset = info.offset.y;

      if (position === 'bottom') {
        // Swipe up to expand, down to collapse
        if (offset < -threshold || velocity < -500) {
          expand();
        } else if (offset > threshold || velocity > 500) {
          collapse();
        }
      } else {
        // Swipe down to expand, up to collapse (for top position)
        if (offset > threshold || velocity > 500) {
          expand();
        } else if (offset < -threshold || velocity < -500) {
          collapse();
        }
      }
    },
    [enableSwipe, position, expand, collapse]
  );

  const contextValue = React.useMemo(
    () => ({ isExpanded, toggle, expand, collapse }),
    [isExpanded, toggle, expand, collapse]
  );

  const positionClasses = position === 'bottom'
    ? 'bottom-0 left-0 right-0 rounded-t-2xl'
    : 'top-0 left-0 right-0 rounded-b-2xl';

  return (
    <ToolbarContext.Provider value={contextValue}>
      <motion.div
        className={cn(
          'fixed z-50 bg-background/95 backdrop-blur-md border shadow-lg',
          'px-4 py-3 safe-area-inset-bottom',
          positionClasses,
          className
        )}
        initial={false}
        animate={isExpanded ? 'expanded' : 'collapsed'}
        variants={toolbarVariants}
        transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3, ease: 'easeInOut' }}
        drag={enableSwipe ? 'y' : false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.1}
        onDragEnd={enableSwipe ? handleDragEnd : undefined}
      >
        {/* Drag handle indicator */}
        {enableSwipe && (
          <div className="flex justify-center mb-2">
            <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
          </div>
        )}
        {children}
      </motion.div>
    </ToolbarContext.Provider>
  );
}

// Primary action bar (always visible)
interface ToolbarPrimaryProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

function ToolbarPrimary({ className, children, ...props }: ToolbarPrimaryProps) {
  return (
    <div
      className={cn('flex items-center justify-between gap-3', className)}
      {...props}
    >
      {children}
    </div>
  );
}

// Expandable content area
interface ToolbarContentProps {
  children: React.ReactNode;
  className?: string;
}

function ToolbarContent({ className, children }: ToolbarContentProps) {
  const { isExpanded } = useToolbar();
  const prefersReducedMotion = useReducedMotion();

  const variants = prefersReducedMotion ? reducedMotionContentVariants : contentVariants;
  const transition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] as const };

  return (
    <AnimatePresence initial={false}>
      {isExpanded && (
        <motion.div
          initial="collapsed"
          animate="expanded"
          exit="collapsed"
          variants={variants}
          transition={transition}
          className={cn('overflow-hidden', className)}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Toggle button for the toolbar
interface ToolbarToggleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  /** Icon to show when collapsed */
  collapsedIcon?: React.ReactNode;
  /** Icon to show when expanded */
  expandedIcon?: React.ReactNode;
}

function ToolbarToggle({
  className,
  children,
  collapsedIcon,
  expandedIcon,
  ...props
}: ToolbarToggleProps) {
  const { isExpanded, toggle } = useToolbar();
  const prefersReducedMotion = useReducedMotion();

  const icon = isExpanded ? expandedIcon : collapsedIcon;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-expanded={isExpanded}
      className={cn(
        'inline-flex items-center justify-center rounded-full p-2',
        'text-muted-foreground hover:text-foreground hover:bg-muted',
        'transition-colors focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-ring focus-visible:ring-offset-2',
        className
      )}
      {...props}
    >
      {icon || children || (
        <motion.svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2 }}
        >
          <polyline points="18 15 12 9 6 15" />
        </motion.svg>
      )}
    </button>
  );
}

// Action button within toolbar
interface ToolbarActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  /** Visual variant */
  variant?: 'default' | 'primary' | 'secondary' | 'ghost';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

function ToolbarAction({
  className,
  children,
  variant = 'default',
  size = 'md',
  ...props
}: ToolbarActionProps) {
  const variantClasses = {
    default: 'bg-background border hover:bg-muted',
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    ghost: 'hover:bg-muted',
  };

  const sizeClasses = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4',
    lg: 'h-12 px-6 text-lg',
  };

  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium',
        'transition-colors focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

// Group of toolbar items
interface ToolbarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

function ToolbarGroup({ className, children, ...props }: ToolbarGroupProps) {
  return (
    <div
      className={cn('flex items-center gap-2', className)}
      {...props}
    >
      {children}
    </div>
  );
}

// Separator between toolbar items
function ToolbarSeparator({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('h-6 w-px bg-border', className)}
      role="separator"
      aria-orientation="vertical"
      {...props}
    />
  );
}

export {
  ToolbarExpandable,
  ToolbarPrimary,
  ToolbarContent,
  ToolbarToggle,
  ToolbarAction,
  ToolbarGroup,
  ToolbarSeparator,
  useToolbar,
};
