import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Charts Documentation | Solar Calculator',
  description: 'Understanding the charts and visualizations in the solar calculator',
};

export default function ChartsDocPage() {
  return (
    <div className="container max-w-4xl py-12">
      <div className="mb-8">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to Calculator
        </Link>
      </div>

      <h1 className="text-4xl font-bold mb-4">Charts & Visualizations</h1>
      <p className="text-lg text-muted-foreground mb-12">
        Understanding the financial projections and data visualizations in the solar calculator
      </p>

      {/* Results Display */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Summary Cards</h2>
        <p className="text-muted-foreground mb-4">
          The four summary cards provide quick insights into your solar investment:
        </p>
        <div className="space-y-4">
          <div className="border-l-4 border-chart-1 pl-4">
            <h3 className="font-semibold">Total Savings (25 years)</h3>
            <p className="text-sm text-muted-foreground">
              Shows your total savings over 25 years in both nominal (future) values and real
              (today&apos;s) values. The real value accounts for inflation, giving you an honest
              comparison in today&apos;s purchasing power.
            </p>
          </div>
          <div className="border-l-4 border-chart-2 pl-4">
            <h3 className="font-semibold">Payback Period</h3>
            <p className="text-sm text-muted-foreground">
              The number of years until your cumulative savings equal your initial investment. The
              real payback period (accounting for inflation) is typically longer than the nominal
              period.
            </p>
          </div>
          <div className="border-l-4 border-chart-3 pl-4">
            <h3 className="font-semibold">Return on Investment (ROI)</h3>
            <p className="text-sm text-muted-foreground">
              Your total profit as a percentage of your initial investment over 25 years. Calculated
              as: (Total Savings ÷ System Cost) × 100%
            </p>
          </div>
          <div className="border-l-4 border-chart-4 pl-4">
            <h3 className="font-semibold">First Year Production</h3>
            <p className="text-sm text-muted-foreground">
              Expected electricity generation in year 1, accounting for 3% light-induced degradation
              (LID) that occurs in the first few months after installation.
            </p>
          </div>
        </div>
      </section>

      {/* Savings Chart */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">25-Year Savings Projection</h2>
        <p className="text-muted-foreground mb-4">
          This chart combines three key metrics over your system&apos;s 25-year lifetime:
        </p>
        <div className="space-y-4">
          <div className="border-l-4 border-chart-1 pl-4">
            <h3 className="font-semibold">Annual Savings (Bars)</h3>
            <p className="text-sm text-muted-foreground">
              Your net savings each year (electricity value minus maintenance costs). These increase
              over time due to electricity price inflation, despite production declining from panel
              degradation.
            </p>
          </div>
          <div className="border-l-4 border-chart-2 pl-4">
            <h3 className="font-semibold">Cumulative Savings (Line - Left Axis)</h3>
            <p className="text-sm text-muted-foreground">
              Your running total of savings minus the initial investment. When this line crosses
              zero, you&apos;ve reached payback. After that, it&apos;s pure profit.
            </p>
          </div>
          <div className="border-l-4 border-chart-3 pl-4">
            <h3 className="font-semibold">Production (Dashed Line - Right Axis)</h3>
            <p className="text-sm text-muted-foreground">
              Annual electricity generation in kWh. Shows 3% decline in year 1 (LID), then 0.5%
              annual degradation. By year 25, panels typically produce ~88% of original capacity.
            </p>
          </div>
        </div>
        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-semibold text-sm mb-2">Why separate Y-axes?</h4>
          <p className="text-xs text-muted-foreground">
            Savings are measured in DKK (currency) while production is measured in kWh (energy). The
            dual Y-axis design allows you to see both trends clearly, despite different units and
            scales.
          </p>
        </div>
      </section>

      {/* Cost Breakdown */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">System Cost Breakdown</h2>
        <p className="text-muted-foreground mb-4">
          The pie chart shows how your initial investment is distributed across system components:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>
            <strong>Solar Panels:</strong> Typically 40-50% of total cost. The actual electricity
            generators.
          </li>
          <li>
            <strong>Inverter:</strong> Usually 10-15%. Converts DC from panels to AC for your home.
          </li>
          <li>
            <strong>Installation:</strong> Often 30-40%. Includes labor, mounting hardware, electrical
            work, and permits.
          </li>
          <li>
            <strong>Other:</strong> Optional costs like batteries, monitoring systems, or roof
            reinforcement.
          </li>
        </ul>
        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-semibold text-sm mb-2">Understanding the breakdown</h4>
          <p className="text-xs text-muted-foreground">
            This breakdown helps you evaluate quotes. If one installer&apos;s panel cost is unusually
            high but installation is low, they might be padding margins. Compare percentage
            distributions, not just total prices.
          </p>
        </div>
      </section>

      {/* Production Overview */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Production Overview</h2>
        <p className="text-muted-foreground mb-4">
          This section helps you understand how your solar production gets used:
        </p>
        <div className="space-y-4">
          <div className="border-l-4 border-chart-2 pl-4">
            <h3 className="font-semibold">Self-consumed (Green)</h3>
            <p className="text-sm text-muted-foreground">
              Electricity you generate and use immediately in your home. This is the most valuable
              because you avoid paying retail electricity rates (typically 2-3 DKK/kWh).
            </p>
          </div>
          <div className="border-l-4 border-chart-5 pl-4">
            <h3 className="font-semibold">Exported to Grid (Red)</h3>
            <p className="text-sm text-muted-foreground">
              Excess electricity sent to the grid when you produce more than you use. In Denmark, you
              typically receive 80% of retail rate (~1.6-2.4 DKK/kWh) for exported power.
            </p>
          </div>
        </div>
        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-semibold text-sm mb-2">Self-consumption rate matters</h4>
          <p className="text-xs text-muted-foreground">
            A 70% self-consumption rate means you use 70% of your solar power directly. Higher rates
            mean better economics. Consider batteries or load-shifting (running dishwashers during the
            day) to increase self-consumption.
          </p>
        </div>
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Key Metrics Explained</h3>
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
            <li>
              <strong>First Year:</strong> Production after 3% LID (light-induced degradation)
            </li>
            <li>
              <strong>Year 25:</strong> Production after cumulative degradation (~12% total)
            </li>
            <li>
              <strong>Total Production:</strong> Lifetime kWh generation over 25 years
            </li>
            <li>
              <strong>Degradation:</strong> Total performance loss from year 1 to year 25
            </li>
          </ul>
        </div>
      </section>

      {/* Metrics Grid */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Comprehensive Metrics</h2>
        <p className="text-muted-foreground mb-4">
          The metrics grid provides 12 key financial and technical indicators:
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold text-sm mb-2">Financial Metrics</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>System Cost & Cost per kW</li>
              <li>Total Savings (Nominal & Real)</li>
              <li>Payback Period</li>
              <li>ROI & Annualized Return</li>
              <li>First Year Savings</li>
              <li>Total Maintenance Cost</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-sm mb-2">Technical Metrics</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>System Size (kW)</li>
              <li>kWh/kW/year Efficiency</li>
              <li>Total Production (25 years)</li>
              <li>Cost per kWh</li>
              <li>Total Degradation</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Understanding Inflation */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Understanding Nominal vs. Real Values</h2>
        <p className="text-muted-foreground mb-4">
          The calculator tracks two types of financial values:
        </p>
        <div className="space-y-4">
          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold">Nominal Values (Future Money)</h3>
            <p className="text-sm text-muted-foreground">
              These are the actual DKK amounts you&apos;ll see in future years. They&apos;re higher
              because they include inflation. Your year 25 savings might be 15,000 DKK nominal, but
              that&apos;s in 2051 money, not today&apos;s money.
            </p>
          </div>
          <div className="border-l-4 border-chart-2 pl-4">
            <h3 className="font-semibold">Real Values (Today&apos;s Money)</h3>
            <p className="text-sm text-muted-foreground">
              These discount future savings back to today&apos;s purchasing power using the inflation
              rate. Real values let you compare: &quot;Is 15,000 DKK in 2051 worth it compared to my
              80,000 DKK investment today?&quot;
            </p>
          </div>
        </div>
        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-semibold text-sm mb-2">Why two inflation rates?</h4>
          <p className="text-xs text-muted-foreground mb-2">
            The calculator uses separate rates for general inflation (2%) and electricity inflation
            (3-4%):
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground">
            <li>
              <strong>General Inflation (2%):</strong> Used to discount future savings to today&apos;s
              value
            </li>
            <li>
              <strong>Electricity Inflation (3-4%):</strong> Historical trend shows electricity prices
              rise faster than general inflation, especially with carbon taxes and grid modernization
            </li>
          </ul>
        </div>
      </section>

      {/* Assumptions */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Key Assumptions</h2>
        <div className="bg-muted/50 rounded-lg p-6 space-y-3">
          <p className="text-sm">
            <strong>Panel Degradation:</strong> 3% in year 1 (LID), then 0.5% annually (industry
            standard for Tier 1 panels)
          </p>
          <p className="text-sm">
            <strong>System Lifetime:</strong> 25 years (typical warranty period for solar panels)
          </p>
          <p className="text-sm">
            <strong>Electricity Inflation:</strong> 3-4% annually (Danish historical average, 2010-2025)
          </p>
          <p className="text-sm">
            <strong>General Inflation:</strong> 2% annually (Danish central bank target)
          </p>
          <p className="text-sm">
            <strong>Maintenance:</strong> Varies by system, typically 0.5-1% of system cost per year
          </p>
          <p className="text-sm">
            <strong>Grid Feed-in Rate:</strong> 80% of retail rate (typical Danish net metering policy)
          </p>
        </div>
      </section>

      {/* Danish Context */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Danish Market Context</h2>
        <p className="text-muted-foreground mb-4">
          These projections are based on Danish electricity market conditions:
        </p>
        <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
          <li>
            <strong>Price Areas:</strong> DK1 (west) and DK2 (east) have different wholesale prices
          </li>
          <li>
            <strong>Net Metering:</strong> Excess production credited at ~80% of retail rate
          </li>
          <li>
            <strong>Tax Treatment:</strong> Residential solar income typically tax-free up to certain
            thresholds (verify with SKAT)
          </li>
          <li>
            <strong>High Electricity Prices:</strong> Denmark has among Europe&apos;s highest rates
            (2-3 DKK/kWh), making solar more attractive
          </li>
        </ul>
      </section>

      {/* Footer */}
      <div className="border-t pt-8 mt-12">
        <p className="text-sm text-muted-foreground">
          <strong>Disclaimer:</strong> These projections are estimates based on current market
          conditions and typical system performance. Actual results will vary based on weather,
          installation quality, equipment specifications, and changes in electricity rates or policies.
          Consult with qualified solar installers for site-specific assessments.
        </p>
      </div>
    </div>
  );
}
