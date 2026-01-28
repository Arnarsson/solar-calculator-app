'use client';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { BookOpen, ExternalLink } from 'lucide-react';

export function MethodologyPanel() {
  return (
    <div className="card-premium p-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <BookOpen className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Beregningsmetode og forudsætninger</h2>
          <p className="text-sm text-muted-foreground">Gennemsigtighed i alle beregninger</p>
        </div>
      </div>

      <div>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="production">
            <AccordionTrigger>Produktionsberegning</AccordionTrigger>
            <AccordionContent className="space-y-3 text-sm">
              <p>
                Årlig produktion estimeres via{' '}
                <a
                  href="https://re.jrc.ec.europa.eu/pvg_tools/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  EU PVGIS <ExternalLink className="h-3 w-3" />
                </a>
                , som bruger satellitdata for solindstråling på din specifikke placering.
              </p>

              <div className="bg-muted p-3 rounded-md font-mono text-xs">
                <p>// Grundformel</p>
                <p>Årlig produktion (kWh) = Systemstørrelse (kWp) × Solindstråling (kWh/kWp/år) × Ydeevnefaktor</p>
                <p className="mt-2">// Eksempel for København</p>
                <p>5 kWp × 1000 kWh/kWp × 0.8 = 4000 kWh/år</p>
              </div>

              <p className="text-muted-foreground">
                <strong>Ydeevnefaktor (80%):</strong> Tager højde for tab i kabler, inverter, støv, og temperatur.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="degradation">
            <AccordionTrigger>Panel-degradering</AccordionTrigger>
            <AccordionContent className="space-y-3 text-sm">
              <p>Solceller mister gradvist effektivitet over tid:</p>

              <ul className="list-disc list-inside space-y-1">
                <li>
                  <strong>År 1:</strong> 3% tab (Light-Induced Degradation - LID)
                </li>
                <li>
                  <strong>År 2-25:</strong> 0,5% tab pr. år
                </li>
              </ul>

              <div className="bg-muted p-3 rounded-md font-mono text-xs">
                <p>// År 1</p>
                <p>Produktion = Basis × 0,97</p>
                <p className="mt-2">// År N (N {'>'} 1)</p>
                <p>Produktion = Basis × 0,97 × 0,995^(N-1)</p>
                <p className="mt-2">// Efter 25 år</p>
                <p>Produktion ≈ Basis × 0,97 × 0,886 ≈ 86% af original</p>
              </div>

              <p className="text-muted-foreground">
                Kilde: Industristandard baseret på producent-garantier (typisk 80% efter 25 år).
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="financial">
            <AccordionTrigger>Økonomiske beregninger</AccordionTrigger>
            <AccordionContent className="space-y-3 text-sm">
              <p><strong>Tilbagebetalingstid (simpel):</strong></p>
              <div className="bg-muted p-3 rounded-md font-mono text-xs">
                <p>Tilbagebetaling = Systemomkostning / Årlig besparelse</p>
              </div>

              <p className="mt-4"><strong>Årlig besparelse:</strong></p>
              <div className="bg-muted p-3 rounded-md font-mono text-xs">
                <p>Egetforbrug-besparelse = Produktion × Egetforbrugsrate × Elpris</p>
                <p>Salg til net = Produktion × (1 - Egetforbrugsrate) × Salgspris</p>
                <p>Total besparelse = Egetforbrug-besparelse + Salg til net</p>
              </div>

              <p className="mt-4 text-muted-foreground">
                <strong>Salgspris til net:</strong> Vi antager 80% af detailprisen, som afspejler typiske danske
                afregningsaftaler.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="inflation">
            <AccordionTrigger>Inflation og fremskrivning</AccordionTrigger>
            <AccordionContent className="space-y-3 text-sm">
              <p>25-års fremskrivningen bruger følgende standardværdier:</p>

              <ul className="list-disc list-inside space-y-1">
                <li><strong>Generel inflation:</strong> 2% pr. år</li>
                <li><strong>El-prisstigning:</strong> 3% pr. år</li>
                <li><strong>Vedligeholdelse:</strong> 1.000 DKK/år (inflationsjusteret)</li>
              </ul>

              <p className="mt-4"><strong>Nominel vs. real værdi:</strong></p>
              <div className="bg-muted p-3 rounded-md font-mono text-xs">
                <p>// Nominel (faktiske DKK)</p>
                <p>Besparelse år N = Basis × (1 + elprisstigning)^N</p>
                <p className="mt-2">// Real (nutidens værdi)</p>
                <p>Real værdi = Nominel / (1 + inflation)^N</p>
              </div>

              <p className="text-muted-foreground mt-4">
                Du kan justere disse værdier under fanen "Avanceret".
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="accuracy">
            <AccordionTrigger>Præcision og afrunding</AccordionTrigger>
            <AccordionContent className="space-y-3 text-sm">
              <p>
                Alle beregninger bruger <strong>Decimal.js</strong> med 20 cifres præcision for at sikre
                nøjagtighed i finansielle beregninger.
              </p>

              <ul className="list-disc list-inside space-y-1">
                <li>Ingen floating-point afrundingsfejl</li>
                <li>Resultaterne vises afrundet til 2 decimaler for læselighed</li>
                <li>Fuld præcision bevares i alle mellemregninger</li>
              </ul>

              <p className="text-muted-foreground mt-3">
                Denne metode er standard i finanssektoren og sikrer, at selv 25-års
                fremskrivninger ikke akkumulerer afrundingsfejl.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="mt-8 pt-6 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            Beregningsmotor <span className="font-semibold text-foreground">v1.0.0</span> • Sidst opdateret: Januar 2026
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Har du spørgsmål til metoden?{' '}
            <a href="mailto:support@example.com" className="text-primary hover:text-primary/80 font-medium transition-colors">
              Kontakt os
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
