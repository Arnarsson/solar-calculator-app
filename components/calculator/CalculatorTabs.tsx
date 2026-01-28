'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EssentialTab } from './tabs/EssentialTab';
import { EnergyTab } from './tabs/EnergyTab';
import { SystemTab } from './tabs/SystemTab';
import { AdvancedTab } from './tabs/AdvancedTab';
import { useCalculatorForm } from '@/hooks/use-calculator-form';
import { Loader2 } from 'lucide-react';

export function CalculatorTabs() {
  const {
    input,
    updateField,
    validationErrors,
    isCalculating,
    calculationResult,
  } = useCalculatorForm();

  return (
    <div className="w-full">
      <Tabs defaultValue="essential" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="essential">Grundlæggende</TabsTrigger>
          <TabsTrigger value="energy">Energi</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="advanced">Avanceret</TabsTrigger>
        </TabsList>

        <div className="mt-6 relative">
          {isCalculating && (
            <div className="absolute top-2 right-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Beregner...
            </div>
          )}

          <TabsContent value="essential" className="mt-0">
            <EssentialTab
              input={input}
              onFieldChange={updateField}
              errors={validationErrors}
            />
          </TabsContent>

          <TabsContent value="energy" className="mt-0">
            <EnergyTab
              input={input}
              onFieldChange={updateField}
              errors={validationErrors}
            />
          </TabsContent>

          <TabsContent value="system" className="mt-0">
            <SystemTab
              input={input}
              onFieldChange={updateField}
              errors={validationErrors}
            />
          </TabsContent>

          <TabsContent value="advanced" className="mt-0">
            <AdvancedTab
              input={input}
              onFieldChange={updateField}
              errors={validationErrors}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
