import Link from 'next/link';
import { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Sun,
  Zap,
  Home,
  Leaf,
  TrendingUp,
  Shield,
  Clock,
  CheckCircle2,
  ArrowRight,
  BarChart3,
  Calculator,
  FileText,
} from 'lucide-react';
import { Navigation } from '@/components/marketing/Navigation';

export const metadata: Metadata = {
  title: 'SolBeregner - Beregn din solcelle-investering',
  description:
    'Beregn tilbagebetalingstid, arlig besparelse og 25-ars fremskrivning for din solcelleinvestering i Danmark. Gratis, ingen login, resultater med det samme.',
  keywords: [
    'solceller',
    'solcelleberegner',
    'solcelle investering',
    'tilbagebetalingstid',
    'solenergi',
    'Danmark',
    'besparelse',
    'vedvarende energi',
  ],
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <Navigation />

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-accent/50 via-background to-background" />

          {/* Decorative elements */}
          <div className="absolute right-0 top-20 -z-10 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute left-0 top-40 -z-10 h-96 w-96 rounded-full bg-warning/5 blur-3xl" />

          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div className="text-center lg:text-left">
                {/* Badge */}
                <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-success/10 px-4 py-1.5 text-sm font-medium text-success">
                  <Zap className="h-4 w-4" />
                  Gratis beregning pa 2 minutter
                </div>

                {/* Headline */}
                <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                  Beregn din{' '}
                  <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    solcelle-investering
                  </span>{' '}
                  pa 2 minutter
                </h1>

                {/* Subheadline */}
                <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
                  Se praecis hvor meget du kan spare med solceller. Danske
                  boligejere sparer i gennemsnit{' '}
                  <span className="font-semibold text-foreground">
                    600.000+ kr
                  </span>{' '}
                  over 25 ar.
                </p>

                {/* CTA */}
                <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
                  <Button asChild size="lg" className="w-full sm:w-auto">
                    <Link href="/calculator">
                      Start beregning
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>

                {/* Trust text */}
                <p className="mt-4 text-sm text-muted-foreground">
                  Gratis &bull; Ingen login &bull; Resultater med det samme
                </p>

                {/* Trust indicators */}
                <div className="mt-8 flex flex-wrap items-center justify-center gap-6 lg:justify-start">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4 text-success" />
                    PVGIS soldata fra EU
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="h-4 w-4 text-info" />
                    Opdaterede elpriser
                  </div>
                </div>
              </div>

              {/* Hero illustration */}
              <div className="relative mx-auto w-full max-w-md lg:max-w-none">
                <div className="relative aspect-square rounded-3xl bg-gradient-to-br from-accent via-card to-secondary p-1 shadow-2xl">
                  <div className="flex h-full flex-col items-center justify-center rounded-[calc(1.5rem-4px)] bg-card p-8">
                    {/* Stylized house with solar panels */}
                    <div className="relative">
                      <div className="relative mx-auto h-48 w-64">
                        {/* House base */}
                        <div className="absolute bottom-0 h-32 w-full rounded-lg bg-secondary" />
                        {/* Roof */}
                        <div className="absolute left-1/2 top-8 h-0 w-0 -translate-x-1/2 border-b-[60px] border-l-[140px] border-r-[140px] border-b-primary/80 border-l-transparent border-r-transparent" />
                        {/* Solar panels on roof */}
                        <div className="absolute left-1/2 top-12 flex -translate-x-1/2 -rotate-[8deg] gap-1">
                          {[...Array(4)].map((_, i) => (
                            <div
                              key={i}
                              className="h-8 w-10 rounded bg-primary shadow-lg"
                            >
                              <div className="m-1 grid grid-cols-2 gap-0.5">
                                {[...Array(4)].map((_, j) => (
                                  <div
                                    key={j}
                                    className="h-2 w-full rounded-sm bg-primary-foreground/20"
                                  />
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                        {/* Sun */}
                        <div className="absolute -right-8 -top-4">
                          <Sun className="h-16 w-16 text-warning" />
                        </div>
                        {/* Window */}
                        <div className="absolute bottom-8 left-1/2 h-12 w-10 -translate-x-1/2 rounded bg-info/30" />
                        {/* Door */}
                        <div className="absolute bottom-0 left-8 h-14 w-8 rounded-t bg-primary/60" />
                      </div>
                    </div>
                    {/* Stats preview */}
                    <div className="mt-8 grid w-full grid-cols-2 gap-4">
                      <div className="rounded-lg bg-success/10 p-3 text-center">
                        <p className="text-2xl font-bold text-success">627.000</p>
                        <p className="text-xs text-muted-foreground">
                          kr i besparelse
                        </p>
                      </div>
                      <div className="rounded-lg bg-info/10 p-3 text-center">
                        <p className="text-2xl font-bold text-info">6,2 ar</p>
                        <p className="text-xs text-muted-foreground">
                          tilbagebetaling
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social proof */}
        <section className="border-y border-border bg-muted/30">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-center gap-8 text-center sm:gap-12">
              <div>
                <p className="text-3xl font-bold text-foreground">10.000+</p>
                <p className="text-sm text-muted-foreground">danske boligejere</p>
              </div>
              <div className="h-8 w-px bg-border" />
              <div>
                <p className="text-3xl font-bold text-foreground">4.8/5</p>
                <p className="text-sm text-muted-foreground">
                  brugertilfredhed
                </p>
              </div>
              <div className="h-8 w-px bg-border" />
              <div>
                <p className="text-3xl font-bold text-foreground">2 min</p>
                <p className="text-sm text-muted-foreground">
                  gennemsnitlig tid
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="hvordan" className="scroll-mt-20">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
                Sadan virker det
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                Fa et praecist estimat pa din solcelle-investering i tre simple
                trin
              </p>
            </div>

            <div className="mt-16 grid gap-8 md:grid-cols-3">
              {/* Step 1 */}
              <div className="relative">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                  1
                </div>
                <div className="absolute left-6 top-12 hidden h-full w-px bg-border md:block" />
                <Card className="relative overflow-hidden">
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent">
                      <FileText className="h-6 w-6 text-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Indtast grundinfo
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Angiv din tagflade, arlige elforbrug og placering. Vi guider
                      dig gennem processen.
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Step 2 */}
              <div className="relative">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                  2
                </div>
                <div className="absolute left-6 top-12 hidden h-full w-px bg-border md:block" />
                <Card className="relative overflow-hidden">
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent">
                      <Calculator className="h-6 w-6 text-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Se omkostninger
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Brug vores estimater eller indtast dine egne priser fra
                      tilbud du har modtaget.
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Step 3 */}
              <div className="relative">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                  3
                </div>
                <Card className="relative overflow-hidden">
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent">
                      <BarChart3 className="h-6 w-6 text-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Fa dit resultat
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Se tilbagebetalingstid, arlig besparelse og 25-ars
                      fremskrivning af din investering.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="mt-12 text-center">
              <Button asChild size="lg">
                <Link href="/calculator">
                  Start din beregning nu
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section id="fordele" className="scroll-mt-20 bg-muted/30">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
                Hvorfor vaelge solceller?
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                Solceller er en af de bedste investeringer du kan lave i din bolig
              </p>
            </div>

            <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {/* Benefit 1 */}
              <Card className="border-none bg-card shadow-md transition-shadow hover:shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success/10">
                    <TrendingUp className="h-7 w-7 text-success" />
                  </div>
                  <h3 className="font-semibold text-foreground">
                    Spar penge pa elregningen
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Reducer din elregning med op til 70% og bliv mindre afhengig
                    af elselskaberne.
                  </p>
                </CardContent>
              </Card>

              {/* Benefit 2 */}
              <Card className="border-none bg-card shadow-md transition-shadow hover:shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-info/10">
                    <Home className="h-7 w-7 text-info" />
                  </div>
                  <h3 className="font-semibold text-foreground">
                    Oeg din boligvaerdi
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Boliger med solceller saelges hurtigere og til hoejere priser
                    end tilsvarende boliger.
                  </p>
                </CardContent>
              </Card>

              {/* Benefit 3 */}
              <Card className="border-none bg-card shadow-md transition-shadow hover:shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success/10">
                    <Leaf className="h-7 w-7 text-success" />
                  </div>
                  <h3 className="font-semibold text-foreground">
                    Reducer dit CO2-aftryk
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Goer en forskel for klimaet ved at producere din egen gronne
                    energi derhjemme.
                  </p>
                </CardContent>
              </Card>

              {/* Benefit 4 */}
              <Card className="border-none bg-card shadow-md transition-shadow hover:shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-warning/10">
                    <Shield className="h-7 w-7 text-warning" />
                  </div>
                  <h3 className="font-semibold text-foreground">
                    Uafhaengig af elpriser
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Beskyt dig mod stigende elpriser og opna oekonomisk
                    forudsigelighed i mange ar.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Data sources */}
        <section className="border-y border-border">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <h2 className="text-3xl font-bold text-foreground">
                  Praecise beregninger baseret pa palidelige data
                </h2>
                <p className="mt-4 text-muted-foreground">
                  Vores beregninger er baseret pa de bedste tilgaengelige
                  datakilder, sa du kan stole pa resultaterne.
                </p>
                <ul className="mt-6 space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-success" />
                    <div>
                      <p className="font-medium text-foreground">
                        PVGIS soldata fra EU
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Bruger EU&apos;s officielle solstraledata for praecise
                        produktionsestimater
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-success" />
                    <div>
                      <p className="font-medium text-foreground">
                        Aktuelle danske elpriser
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Opdaterede elpriser inkl. afgifter og nettariffer for
                        danske husstande
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-success" />
                    <div>
                      <p className="font-medium text-foreground">
                        Realistiske antagelser
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Inkluderer paneldegradation, inflation og prisstigning pa
                        el over tid
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="relative">
                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="bg-gradient-to-br from-primary/10 via-card to-success/10 p-8">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-lg bg-card p-4 shadow-sm">
                          <p className="text-xs uppercase tracking-wider text-muted-foreground">
                            Arlig produktion
                          </p>
                          <p className="mt-1 text-2xl font-bold text-foreground">
                            9.850 kWh
                          </p>
                        </div>
                        <div className="rounded-lg bg-card p-4 shadow-sm">
                          <p className="text-xs uppercase tracking-wider text-muted-foreground">
                            Selvforsyning
                          </p>
                          <p className="mt-1 text-2xl font-bold text-success">
                            68%
                          </p>
                        </div>
                        <div className="rounded-lg bg-card p-4 shadow-sm">
                          <p className="text-xs uppercase tracking-wider text-muted-foreground">
                            CO2 reduceret
                          </p>
                          <p className="mt-1 text-2xl font-bold text-foreground">
                            2,4 ton/ar
                          </p>
                        </div>
                        <div className="rounded-lg bg-card p-4 shadow-sm">
                          <p className="text-xs uppercase tracking-wider text-muted-foreground">
                            ROI efter 25 ar
                          </p>
                          <p className="mt-1 text-2xl font-bold text-success">
                            412%
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="scroll-mt-20">
          <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
                Ofte stillede sporgsmal
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Fa svar pa de mest almindelige sporgsmal om solceller og vores
                beregner
              </p>
            </div>

            <div className="mt-12">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-left">
                    Hvor praecis er beregningen?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Vores beregninger er baseret pa PVGIS-data fra EU, som er den
                    mest palidelige kilde til solstraledata i Europa. Vi tager
                    hojde for din placering, taghaeldning, orientering og lokale
                    forhold. Resultaterne er typisk inden for 5-10% af faktisk
                    produktion.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger className="text-left">
                    Hvad koster solceller i Danmark?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Et typisk solcelleanlaeg til en villa koster mellem 80.000 og
                    150.000 kr inkl. installation. Prisen afhaenger af anlaeggets
                    storrelse, paneltype og om du vaelger batteri. Med vores
                    beregner kan du se praecis hvad afkastet bliver for din
                    specifikke situation.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger className="text-left">
                    Hvor lang er tilbagebetalingstiden?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Tilbagebetalingstiden for solceller i Danmark er typisk mellem
                    5-8 ar, afhaengigt af dit elforbrug, anlaeggets storrelse og
                    de aktuelle elpriser. Med de seneste ars hoejere elpriser har
                    tilbagebetalingstiden generelt vaeret kortere.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger className="text-left">
                    Skal jeg have batteri til mine solceller?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Et batteri kan oege din selvforsyningsgrad betydeligt, men det
                    forlaenger ogsa tilbagebetalingstiden. Det giver bedst mening
                    hvis du har et hojt elforbrug om aftenen, eller onsker at
                    vaere mere uafhaengig af elnettet. Vores beregner kan vise dig
                    forskellen med og uden batteri.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5">
                  <AccordionTrigger className="text-left">
                    Hvad sker der med overskudsstrommen?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Overskudsstrom saelges til elnettet via nettoafregning. Du far
                    typisk omkring 0,80-1,20 kr per kWh for overskudsstrommen,
                    hvilket er lavere end hvad du betaler for at kobe strom. Derfor
                    er det mest fordelagtigt at bruge sa meget af din egen strom
                    som muligt.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-6">
                  <AccordionTrigger className="text-left">
                    Hvor laenge holder solceller?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Moderne solceller har en forventet levetid pa 25-30 ar eller
                    mere. De fleste producenter giver 25 ars garanti pa
                    effektiviteten. Panelerne degraderer typisk med 0,3-0,5% per ar,
                    sa efter 25 ar producerer de stadig ca. 85-90% af den
                    oprindelige kapacitet.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-primary">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-primary-foreground sm:text-4xl">
                Klar til at se din besparelse?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-primary-foreground/80">
                Fa et gratis og uforpligtende estimat pa din solcelle-investering.
                Det tager kun 2 minutter.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  variant="secondary"
                  className="w-full sm:w-auto"
                >
                  <Link href="/calculator">
                    Start beregning nu
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm text-primary-foreground/70">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Gratis
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Ingen login
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />2 minutter
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <Sun className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="font-semibold text-foreground">
                  SolBeregner
                </span>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Den mest praecise solcelleberegner for danske boligejere. Baseret
                pa EU soldata og aktuelle danske elpriser.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Beregner</h4>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/calculator" className="hover:text-foreground">
                    Start beregning
                  </Link>
                </li>
                <li>
                  <Link href="#hvordan" className="hover:text-foreground">
                    Hvordan det virker
                  </Link>
                </li>
                <li>
                  <Link href="#faq" className="hover:text-foreground">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Information</h4>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>
                  <span>Data fra PVGIS (EU)</span>
                </li>
                <li>
                  <span>Opdateret med danske elpriser</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} SolBeregner. Alle rettigheder forbeholdes.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
