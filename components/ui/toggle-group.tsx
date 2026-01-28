'use client';

import * as React from 'react';
import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group';
import { cn } from '@/lib/utils';

const ToggleGroupContext = React.createContext<{
  size?: 'default' | 'sm' | 'lg';
  variant?: 'default' | 'outline';
}>({
  size: 'default',
  variant: 'default',
});

const ToggleGroup = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root> & {
    size?: 'default' | 'sm' | 'lg';
    variant?: 'default' | 'outline';
  }
>(({ className, variant = 'default', size = 'default', children, ...props }, ref) => (
  <ToggleGroupPrimitive.Root
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground',
      className
    )}
    {...props}
  >
    <ToggleGroupContext.Provider value={{ variant, size }}>
      {children}
    </ToggleGroupContext.Provider>
  </ToggleGroupPrimitive.Root>
));

ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName;

const toggleGroupItemVariants = {
  default: {
    base: 'data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm',
    hover: 'hover:bg-muted hover:text-muted-foreground',
  },
  outline: {
    base: 'border border-input data-[state=on]:bg-accent data-[state=on]:text-accent-foreground',
    hover: 'hover:bg-accent hover:text-accent-foreground',
  },
};

const toggleGroupItemSizes = {
  default: 'h-9 px-3 min-w-9',
  sm: 'h-8 px-2.5 min-w-8 text-xs',
  lg: 'h-10 px-4 min-w-10',
};

const ToggleGroupItem = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item>
>(({ className, children, ...props }, ref) => {
  const context = React.useContext(ToggleGroupContext);
  const variantStyles = toggleGroupItemVariants[context.variant || 'default'];
  const sizeStyles = toggleGroupItemSizes[context.size || 'default'];

  return (
    <ToggleGroupPrimitive.Item
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        variantStyles.base,
        variantStyles.hover,
        sizeStyles,
        className
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  );
});

ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName;

export { ToggleGroup, ToggleGroupItem };
