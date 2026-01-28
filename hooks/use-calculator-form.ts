'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { useQuery } from '@tanstack/react-query';
import {
  CalculatorInput,
  calculatorInputSchema,
  defaultCalculatorInput,
} from '@/lib/validation/calculator';

interface UseCalculatorFormOptions {
  debounceMs?: number;
  onCalculate?: (input: CalculatorInput) => void;
}

export function useCalculatorForm(options: UseCalculatorFormOptions = {}) {
  const { debounceMs = 500, onCalculate } = options;

  const [input, setInput] = useState<CalculatorInput>(defaultCalculatorInput);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(true); // Start dirty to show results immediately

  // Validate input
  const validateInput = useCallback((data: CalculatorInput) => {
    const result = calculatorInputSchema.safeParse(data);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      setValidationErrors(errors);
      return false;
    }
    setValidationErrors({});
    return true;
  }, []);

  // Debounced calculation trigger
  const debouncedCalculate = useDebouncedCallback(
    (data: CalculatorInput) => {
      if (validateInput(data)) {
        onCalculate?.(data);
      }
    },
    debounceMs
  );

  // Update a single field
  const updateField = useCallback(
    <K extends keyof CalculatorInput>(field: K, value: CalculatorInput[K]) => {
      setInput((prev) => {
        const next = { ...prev, [field]: value };
        setIsDirty(true);
        debouncedCalculate(next);
        return next;
      });
    },
    [debouncedCalculate]
  );

  // Update multiple fields
  const updateFields = useCallback(
    (updates: Partial<CalculatorInput>) => {
      setInput((prev) => {
        const next = { ...prev, ...updates };
        setIsDirty(true);
        debouncedCalculate(next);
        return next;
      });
    },
    [debouncedCalculate]
  );

  // Reset to defaults
  const reset = useCallback(() => {
    setInput(defaultCalculatorInput);
    setValidationErrors({});
    setIsDirty(false);
  }, []);

  // Auto-detect price area from longitude (only if longitude is set)
  useEffect(() => {
    if (input.longitude !== undefined) {
      // DK1 (West) if longitude < 10.5, otherwise DK2 (East)
      const newPriceArea = input.longitude < 10.5 ? 'DK1' : 'DK2';
      if (input.priceArea !== newPriceArea) {
        setInput((prev) => ({ ...prev, priceArea: newPriceArea }));
      }
    }
  }, [input.longitude, input.priceArea]);

  // Query for calculation results
  const {
    data: calculationResult,
    isLoading: isCalculating,
    error: calculationError,
  } = useQuery({
    queryKey: ['calculation', input],
    queryFn: async () => {
      const res = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error('Calculation failed');
      return res.json();
    },
    enabled: isDirty && Object.keys(validationErrors).length === 0,
    staleTime: 5 * 60 * 1000, // 5 min cache
  });

  return {
    input,
    updateField,
    updateFields,
    reset,
    validationErrors,
    isDirty,
    isCalculating,
    calculationResult,
    calculationError,
  };
}
