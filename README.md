# Solar Calculator Web App

An all-in-one solar panel calculator for estimating production, tracking consumption, and calculating savings and payback time for solar installations.

## Features

- **Setup & Pricing** - Input and track installation costs (panels, inverter, battery, mounting, installation)
- **Production Estimator** - Calculate expected yearly kWh based on panel specifications and location
- **Monthly Dashboard** - View production vs. consumption data with detailed breakdowns
- **Financial Analysis** - Track savings, grid earnings, and payback time
- **Battery & EV Integration** - Monitor battery usage and EV charging
- **CO₂ Savings** - Visualize environmental impact

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Shadcn/UI
- **Database:** Prisma + SQLite (PostgreSQL for production)
- **Authentication:** NextAuth.js
- **Charts:** Recharts

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
cd solar-calculator-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Initialize the database:
```bash
npm run db:push
npm run db:generate
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
solar-calculator-app/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page (main calculator)
├── components/            # React components
│   └── ui/               # Shadcn/UI components
├── lib/                   # Utility functions
│   ├── calculations.ts   # Solar calculation formulas
│   ├── prisma.ts         # Prisma client
│   └── utils.ts          # Helper functions
├── prisma/               # Database schema
│   └── schema.prisma     # Prisma schema
├── types/                # TypeScript types
└── public/               # Static assets
```

## Calculations

### Production Estimate
```
yearlyProduction = panelWattage × numberOfPanels × sunHoursPerYear × efficiencyFactor / 1000
```

### Monthly Savings
```
savings = (electricityUsedDirectly + usedByBattery) × electricityPrice
gridEarnings = sentToGrid × gridSellPrice
totalSaved = savings + gridEarnings
```

### Payback Time
```
paybackYears = totalSetupCost / yearlySavings
```

### CO₂ Savings
```
co2SavedKg = totalProductionUsed × 0.5 (Denmark emission factor)
```

## Default Values (from real data)

- **Panel Wattage:** 400W
- **Number of Panels:** 29
- **System Size:** 11.6 kW
- **Sun Hours (Denmark):** 950/year
- **Efficiency Factor:** 0.8
- **Expected Production:** ~8,816 kWh/year

## Environment Variables

```env
DATABASE_URL="file:./dev.db"      # SQLite for development
NEXTAUTH_SECRET="your-secret"     # NextAuth secret key
NEXTAUTH_URL="http://localhost:3000"
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Database Options

- **Development:** SQLite (file-based)
- **Production:** Vercel Postgres, PlanetScale, or Supabase

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License

## Acknowledgments

Built with data from real solar installation at Platanvej 7, Denmark.
