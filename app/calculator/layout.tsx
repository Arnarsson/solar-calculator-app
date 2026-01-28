import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Solcelleberegner | Beregn dit afkast på 2 minutter',
  description:
    'Beregn tilbagebetalingstid, årlig besparelse og 25-års fremskrivning for din solcelleinvestering i Danmark. Gratis og uden login.',
  keywords: [
    'solceller',
    'solcelleberegner',
    'tilbagebetaling',
    'solenergi',
    'Danmark',
    'besparelse',
    'solcelle investering',
    'ROI solceller',
  ],
};

export default function CalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
