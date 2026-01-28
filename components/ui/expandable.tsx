'use client';

import * as React from 'react';
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  type Variants,
} from 'framer-motion';
import { cn } from '@/lib/utils';

// Context for expandable state
interface ExpandableContextValue {
  isExpanded: boolean;
  toggle: () => void;
  expand: () => void;
  collapse: () => void;
  expandableId: string;
}

const ExpandableContext = React.createContext<ExpandableContextValue | null>(null);

function useExpandable() {
  const context = React.useContext(ExpandableContext);
  if (!context) {
    throw new Error('useExpandable must be used within an ExpandableProvider');
  }
  return context;
}

// Provider component
interface ExpandableProviderProps {
  children: React.ReactNode;
  /** Controlled expanded state */
  expanded?: boolean;
  /** Callback when expanded state changes */
  onExpandedChange?: (expanded: boolean) => void;
  /** Default expanded state for uncontrolled mode */
  defaultExpanded?: boolean;
}

function ExpandableProvider({
  children,
  expanded: controlledExpanded,
  onExpandedChange,
  defaultExpanded = false,
}: ExpandableProviderProps) {
  const [internalExpanded, setInternalExpanded] = React.useState(defaultExpanded);
  const expandableId = React.useId();

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

  const value = React.useMemo(
    () => ({ isExpanded, toggle, expand, collapse, expandableId }),
    [isExpanded, toggle, expand, collapse, expandableId]
  );

  return (
    <ExpandableContext.Provider value={value}>
      {children}
    </ExpandableContext.Provider>
  );
}

// Root container
interface ExpandableRootProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const ExpandableRoot = React.forwardRef<HTMLDivElement, ExpandableRootProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('relative', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
ExpandableRoot.displayName = 'ExpandableRoot';

// Trigger component
interface ExpandableTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  asChild?: boolean;
}

const ExpandableTrigger = React.forwardRef<HTMLButtonElement, ExpandableTriggerProps>(
  ({ className, children, asChild, ...props }, ref) => {
    const { toggle, isExpanded, expandableId } = useExpandable();

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, {
        onClick: (e: React.MouseEvent) => {
          toggle();
          (children.props as any)?.onClick?.(e);
        },
        'aria-expanded': isExpanded,
        'aria-controls': `expandable-content-${expandableId}`,
      });
    }

    return (
      <button
        ref={ref}
        type="button"
        onClick={toggle}
        aria-expanded={isExpanded}
        aria-controls={`expandable-content-${expandableId}`}
        className={cn(
          'inline-flex items-center justify-center transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
ExpandableTrigger.displayName = 'ExpandableTrigger';

// Content variants for animation
const contentVariants: Variants = {
  collapsed: {
    height: 0,
    opacity: 0,
    overflow: 'hidden',
  },
  expanded: {
    height: 'auto',
    opacity: 1,
    overflow: 'hidden',
  },
};

const reducedMotionVariants: Variants = {
  collapsed: {
    height: 0,
    opacity: 0,
    overflow: 'hidden',
  },
  expanded: {
    height: 'auto',
    opacity: 1,
    overflow: 'hidden',
  },
};

// Content component
interface ExpandableContentProps {
  children: React.ReactNode;
  /** Force mount the content (useful for SEO) */
  forceMount?: boolean;
  className?: string;
}

const ExpandableContent = React.forwardRef<HTMLDivElement, ExpandableContentProps>(
  ({ className, children, forceMount }, ref) => {
    const { isExpanded, expandableId } = useExpandable();
    const prefersReducedMotion = useReducedMotion();

    const variants = prefersReducedMotion ? reducedMotionVariants : contentVariants;
    const transition = prefersReducedMotion
      ? { duration: 0 }
      : { duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] as const };

    if (forceMount) {
      return (
        <motion.div
          ref={ref}
          id={`expandable-content-${expandableId}`}
          initial={false}
          animate={isExpanded ? 'expanded' : 'collapsed'}
          variants={variants}
          transition={transition}
          className={cn(className)}
        >
          <div className="pt-2">{children}</div>
        </motion.div>
      );
    }

    return (
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            ref={ref}
            id={`expandable-content-${expandableId}`}
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            variants={variants}
            transition={transition}
            className={cn(className)}
          >
            <div className="pt-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
);
ExpandableContent.displayName = 'ExpandableContent';

// Card variant - a styled expandable container
interface ExpandableCardProps extends ExpandableProviderProps {
  className?: string;
}

function ExpandableCard({
  children,
  className,
  ...providerProps
}: ExpandableCardProps) {
  return (
    <ExpandableProvider {...providerProps}>
      <ExpandableRoot
        className={cn(
          'rounded-lg border bg-card text-card-foreground shadow-sm',
          className
        )}
      >
        {children}
      </ExpandableRoot>
    </ExpandableProvider>
  );
}

// Chevron icon that rotates with expand state
interface ExpandableChevronProps {
  /** Size of the chevron in pixels */
  size?: number;
  className?: string;
}

function ExpandableChevron({ className, size = 16 }: ExpandableChevronProps) {
  const { isExpanded } = useExpandable();
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      animate={{ rotate: isExpanded ? 180 : 0 }}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2 }}
      className={cn('shrink-0', className)}
    >
      <polyline points="6 9 12 15 18 9" />
    </motion.svg>
  );
}

export {
  ExpandableProvider,
  ExpandableRoot,
  ExpandableTrigger,
  ExpandableContent,
  ExpandableCard,
  ExpandableChevron,
  useExpandable,
};
