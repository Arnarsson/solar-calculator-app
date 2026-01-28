'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, Settings, Calendar, ExternalLink } from 'lucide-react';

interface MethodologySectionProps {
  className?: string;
}

export function MethodologySection({ className }: MethodologySectionProps) {
  const lastUpdated = '28. januar 2026';

  return (
    <Card className={`border-0 shadow-lg ${className || ''}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Settings className="h-5 w-5 text-muted-foreground" />
          Beregningsmetode
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <Accordion type="single" collapsible className="w-full">
          {/* Datakilder */}
          <AccordionItem value="datakilder" className="border-border">
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Database className="h-4 w-4 text-blue-600" />
                </div>
                <span className="font-medium text-foreground">Datakilder</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground pl-12 pr-4 pb-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">PVGIS (EU Joint Research Centre)</h4>
                  <p className="mb-2">
                    Solindstralingsdata og estimeret energiproduktion er baseret pa PVGIS
                    (Photovoltaic Geographical Information System) fra EU&apos;s Joint Research Centre.
                  </p>
                  <a
                    href="https://re.jrc.ec.europa.eu/pvg_tools/en/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    Besog PVGIS <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Elpriser</h4>
                  <p>
                    Elpriser er baseret pa gennemsnitlige danske forbrugerpriser inkl.
                    afgifter, netabonnementer og moms. Standardværdien kan justeres i beregneren.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Afregningspriser</h4>
                  <p>
                    Priser for salg af overskudsstrorm til nettet er baseret pa
                    typiske danske afregningspriser fra elselskaber.
                  </p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Antagelser */}
          <AccordionItem value="antagelser" className="border-border">
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <Settings className="h-4 w-4 text-emerald-600" />
                </div>
                <span className="font-medium text-foreground">Antagelser</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground pl-12 pr-4 pb-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-muted rounded-lg border border-border">
                    <h4 className="font-semibold text-foreground mb-1">Panel-degradering</h4>
                    <p className="text-xs text-muted-foreground mb-1">Arlig ydelsesnedgang</p>
                    <span className="text-lg font-bold text-foreground">0,5%</span>
                    <p className="text-xs text-muted-foreground mt-1">pr. ar (12,2% over 25 ar)</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg border border-border">
                    <h4 className="font-semibold text-foreground mb-1">Inflation</h4>
                    <p className="text-xs text-muted-foreground mb-1">Generel prisstigning</p>
                    <span className="text-lg font-bold text-foreground">2,0%</span>
                    <p className="text-xs text-muted-foreground mt-1">pr. ar (Nationalbankens mal)</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg border border-border">
                    <h4 className="font-semibold text-foreground mb-1">Elprisstigning</h4>
                    <p className="text-xs text-muted-foreground mb-1">Arlig stigning i elpriser</p>
                    <span className="text-lg font-bold text-foreground">3,0%</span>
                    <p className="text-xs text-muted-foreground mt-1">pr. ar (historisk gennemsnit)</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg border border-border">
                    <h4 className="font-semibold text-foreground mb-1">Systemlevetid</h4>
                    <p className="text-xs text-muted-foreground mb-1">Beregningsperiode</p>
                    <span className="text-lg font-bold text-foreground">25 ar</span>
                    <p className="text-xs text-muted-foreground mt-1">typisk garantiperiode</p>
                  </div>
                </div>

                <div className="pt-2">
                  <h4 className="font-semibold text-foreground mb-2">Ovrige antagelser</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Moms pa systemomkostninger: 25%</li>
                    <li>Systemeffektivitet: 85% (inkl. inverter- og kabeltab)</li>
                    <li>Panelernes optimal vinkel og orientering mod syd</li>
                    <li>Ingen skygge eller hindringer</li>
                    <li>Inverterudskiftning efter ca. 12-15 ar (ikke inkluderet i pris)</li>
                  </ul>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Sidst opdateret */}
          <AccordionItem value="opdateret" className="border-border border-b-0">
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-50 rounded-lg">
                  <Calendar className="h-4 w-4 text-amber-600" />
                </div>
                <span className="font-medium text-foreground">Sidst opdateret</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground pl-12 pr-4 pb-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg border border-border">
                  <span className="text-foreground">Beregningsmotor version</span>
                  <span className="font-semibold text-foreground">1.0.0</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg border border-border">
                  <span className="text-foreground">PVGIS-data</span>
                  <span className="font-semibold text-foreground">2024 release</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg border border-border">
                  <span className="text-foreground">Priser opdateret</span>
                  <span className="font-semibold text-foreground">{lastUpdated}</span>
                </div>
                <p className="text-xs text-muted-foreground pt-2">
                  Beregningerne er estimater og bor ikke bruges som eneste grundlag for
                  investeringsbeslutninger. Kontakt en professionel installatior for
                  et præcist tilbud tilpasset din specifikke situation.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
