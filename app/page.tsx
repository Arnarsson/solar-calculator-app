'use client';

import { WizardLayout, WizardData } from '@/components/calculator/WizardLayout';
import { Step1BasicInfo } from '@/components/calculator/steps/Step1BasicInfo';
import { Step2Costs } from '@/components/calculator/steps/Step2Costs';
import { Step3Results } from '@/components/calculator/steps/Step3Results';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <WizardLayout>
        {({ currentStep, setCurrentStep, wizardData, setWizardData }) => {
          // Render form based on current step
          const renderForm = () => {
            switch (currentStep) {
              case 1:
                return (
                  <Step1BasicInfo
                    data={wizardData}
                    onChange={(updates) => setWizardData({ ...wizardData, ...updates })}
                  />
                );
              case 2:
                return (
                  <Step2Costs
                    data={wizardData}
                    onChange={(updates) => setWizardData({ ...wizardData, ...updates })}
                  />
                );
              case 3:
                return (
                  <Card>
                    <CardHeader>
                      <CardTitle>Dine resultater</CardTitle>
                      <CardDescription>
                        Baseret på dine indtastninger
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Se detaljerede resultater til højre (desktop) eller nedenfor (mobil)
                      </p>
                    </CardContent>
                  </Card>
                );
              default:
                return null;
            }
          };

          // Render results/preview based on step
          const renderResults = () => {
            if (currentStep < 3) {
              // Preview mode for steps 1-2
              return (
                <Card className="bg-slate-50 border-dashed">
                  <CardHeader>
                    <CardTitle className="text-lg">Foreløbigt estimat</CardTitle>
                    <CardDescription>
                      Opdateres når du udfylder flere felter
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Step3Results data={wizardData} />
                  </CardContent>
                </Card>
              );
            }

            // Full results for step 3
            return <Step3Results data={wizardData} />;
          };

          return {
            form: renderForm(),
            results: renderResults(),
          };
        }}
      </WizardLayout>
    </main>
  );
}
