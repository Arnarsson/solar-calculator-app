import { Metadata } from 'next';
import { Calculator } from '@/components/calculator/Calculator';

export const metadata: Metadata = {
  title: 'Solcelleberegner | Beregn afkast på solceller',
  description:
    'Beregn tilbagebetalingstid, årlig besparelse og 25-års fremskrivning for din solcelleinvestering. Præcise beregninger med danske skattescenarier.',
  keywords: [
    'solceller',
    'solcelleberegner',
    'tilbagebetaling',
    'solenergi',
    'Danmark',
    'håndværkerfradrag',
  ],
};

export default function CalculatorPage() {
  return <Calculator />;
}
