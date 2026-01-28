"use client";

import { useState } from "react";
import {
  Sun,
  Zap,
  Battery,
  Leaf,
  Calculator,
  TrendingUp,
  Car,
  RefreshCw,
  AlertCircle,
  Clock,
  Lightbulb,
  CloudSun,
  Euro,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  calculateProductionEstimate,
  calculateTotalCost,
  calculateMonthlyResults,
  calculateYearlyResults,
  DEFAULT_SETUP_COSTS,
  DEFAULT_PANEL_SPECS,
  SAMPLE_MONTHLY_DATA,
  type SetupCosts,
  type PanelSpecs,
} from "@/lib/calculations";
import { formatCurrency, formatNumber, MONTH_NAMES_SHORT } from "@/lib/utils";
import { useLiveData } from "@/hooks/use-live-data";
import { PriceChart } from "@/components/charts/price-chart";
import { ProductionChart, DailyForecastChart } from "@/components/charts/production-chart";

export default function Home() {
  // Setup costs state
  const [costs, setCosts] = useState<SetupCosts>(DEFAULT_SETUP_COSTS);
  const [specs, setSpecs] = useState<PanelSpecs>(DEFAULT_PANEL_SPECS);
  const [priceArea, setPriceArea] = useState<"DK1" | "DK2">("DK1");

  // Live data hooks
  const { prices, solar, optimization, isLoading, refetchAll } = useLiveData({
    priceArea,
    systemSize: (specs.panelWattage * specs.numberOfPanels) / 1000,
  });

  // Calculate derived values (from original data)
  const totalCost = calculateTotalCost(costs);
  const productionEstimate = calculateProductionEstimate(specs);
  const monthlyResults = SAMPLE_MONTHLY_DATA.map((m) => calculateMonthlyResults(m));
  const yearlyResults = calculateYearlyResults(monthlyResults, totalCost);

  return (
    <div className="min-h-screen bg-gradient-to-b from-solar-50 to-white dark:from-gray-900 dark:to-gray-950">
      {/* Hero Section */}
      <header className="solar-gradient text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Sun className="h-10 w-10" />
                <h1 className="text-4xl font-bold">Solar Calculator 10X</h1>
              </div>
              <p className="text-xl opacity-90 max-w-2xl">
                Live electricity prices • 7-day solar forecast • Smart optimization
              </p>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={priceArea}
                onChange={(e) => setPriceArea(e.target.value as "DK1" | "DK2")}
                className="bg-white/20 text-white border-white/30 rounded-lg px-3 py-2"
              >
                <option value="DK1" className="text-gray-900">DK1 (West)</option>
                <option value="DK2" className="text-gray-900">DK2 (East)</option>
              </select>
              <Button
                variant="outline"
                size="sm"
                onClick={refetchAll}
                disabled={isLoading}
                className="bg-white/10 border-white/30 hover:bg-white/20"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Live Status Bar */}
          {optimization.data && (
            <div className="mt-6 bg-white/10 backdrop-blur rounded-lg p-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-300" />
                  <span className="font-medium">Right Now:</span>
                  <span className="text-yellow-200">
                    {optimization.data.currentStatus.bestActionNow}
                  </span>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  {prices.data && (
                    <div className="flex items-center gap-2">
                      <Euro className="h-4 w-4" />
                      <span>
                        Current: {(prices.data.stats.currentPrice * 100).toFixed(0)} øre/kWh
                      </span>
                    </div>
                  )}
                  {solar.data && (
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4" />
                      <span>
                        Now: {solar.data.currentConditions.currentProduction.toFixed(1)} kWh
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-300" />
                    <span>
                      Potential savings: {optimization.data.currentStatus.potentialDailySavings.toFixed(0)} DKK/day
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 -mt-4">
        <Tabs defaultValue="live" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-7 h-auto gap-2 bg-transparent">
            <TabsTrigger
              value="live"
              className="data-[state=active]:bg-solar-500 data-[state=active]:text-white"
            >
              <Zap className="h-4 w-4 mr-2" /> Live
            </TabsTrigger>
            <TabsTrigger
              value="forecast"
              className="data-[state=active]:bg-solar-500 data-[state=active]:text-white"
            >
              <CloudSun className="h-4 w-4 mr-2" /> Forecast
            </TabsTrigger>
            <TabsTrigger
              value="optimize"
              className="data-[state=active]:bg-solar-500 data-[state=active]:text-white"
            >
              <Lightbulb className="h-4 w-4 mr-2" /> Optimize
            </TabsTrigger>
            <TabsTrigger
              value="setup"
              className="data-[state=active]:bg-solar-500 data-[state=active]:text-white"
            >
              <Calculator className="h-4 w-4 mr-2" /> Setup
            </TabsTrigger>
            <TabsTrigger
              value="dashboard"
              className="data-[state=active]:bg-solar-500 data-[state=active]:text-white"
            >
              <TrendingUp className="h-4 w-4 mr-2" /> History
            </TabsTrigger>
            <TabsTrigger
              value="battery"
              className="data-[state=active]:bg-solar-500 data-[state=active]:text-white"
            >
              <Battery className="h-4 w-4 mr-2" /> Battery
            </TabsTrigger>
            <TabsTrigger
              value="co2"
              className="data-[state=active]:bg-solar-500 data-[state=active]:text-white"
            >
              <Leaf className="h-4 w-4 mr-2" /> CO₂
            </TabsTrigger>
          </TabsList>

          {/* LIVE PRICES TAB - NEW */}
          <TabsContent value="live">
            <div className="grid gap-6">
              {/* Current Price Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className={prices.data?.stats.currentPrice && prices.data.stats.currentPrice < prices.data.stats.avgPrice * 0.7 ? "bg-green-50 border-green-200" : ""}>
                  <CardHeader className="pb-2">
                    <CardDescription>Current Price</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">
                      {prices.data ? `${(prices.data.stats.currentPrice * 100).toFixed(0)} øre` : "..."}
                    </p>
                    <p className="text-sm text-muted-foreground">per kWh</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Today's Low</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-green-600">
                      {prices.data ? `${(prices.data.stats.minPrice * 100).toFixed(0)} øre` : "..."}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Today's High</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-red-600">
                      {prices.data ? `${(prices.data.stats.maxPrice * 100).toFixed(0)} øre` : "..."}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Average</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      {prices.data ? `${(prices.data.stats.avgPrice * 100).toFixed(0)} øre` : "..."}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Price Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Euro className="h-5 w-5" />
                    Live Electricity Prices ({priceArea})
                  </CardTitle>
                  <CardDescription>
                    Real-time spot prices from Energi Data Service • Green = cheap, Red = expensive
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {prices.loading ? (
                    <div className="h-[300px] flex items-center justify-center">
                      <RefreshCw className="h-8 w-8 animate-spin text-solar-500" />
                    </div>
                  ) : prices.error ? (
                    <div className="h-[300px] flex items-center justify-center text-red-500">
                      <AlertCircle className="h-6 w-6 mr-2" />
                      {prices.error}
                    </div>
                  ) : prices.data ? (
                    <PriceChart prices={prices.data.prices} />
                  ) : null}
                </CardContent>
              </Card>

              {/* Best Charging Times */}
              {prices.data && prices.data.optimalChargingWindows.length > 0 && (
                <Card className="bg-green-50 border-green-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-700">
                      <Car className="h-5 w-5" />
                      Best Times to Charge EV / Battery
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                      {prices.data.optimalChargingWindows.map((window, i) => (
                        <div key={i} className="bg-white rounded-lg p-4 shadow-sm">
                          <div className="text-lg font-bold text-green-700">
                            {new Date(window.start).toLocaleTimeString("da-DK", { hour: "2-digit", minute: "2-digit" })} -{" "}
                            {new Date(window.end).toLocaleTimeString("da-DK", { hour: "2-digit", minute: "2-digit" })}
                          </div>
                          <div className="text-sm text-gray-600">
                            Avg: {(window.avgPrice * 100).toFixed(0)} øre/kWh
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(window.start).toLocaleDateString("da-DK", { weekday: "long" })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* FORECAST TAB - NEW */}
          <TabsContent value="forecast">
            <div className="grid gap-6">
              {/* Current Solar Status */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-solar-50 border-solar-200">
                  <CardHeader className="pb-2">
                    <CardDescription>Producing Now</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-solar-600">
                      {solar.data ? `${solar.data.currentConditions.currentProduction.toFixed(1)} kWh` : "..."}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Today Total</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      {solar.data ? `${solar.data.currentConditions.todayTotal.toFixed(1)} kWh` : "..."}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Remaining Today</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-blue-600">
                      {solar.data ? `${solar.data.currentConditions.todayRemaining.toFixed(1)} kWh` : "..."}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Cloud Cover</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      {solar.data ? `${solar.data.currentConditions.cloudCover}%` : "..."}
                      {solar.data && solar.data.currentConditions.cloudCover > 70 ? " ☁️" : solar.data && solar.data.currentConditions.cloudCover < 30 ? " ☀️" : " ⛅"}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Hourly Production Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sun className="h-5 w-5" />
                    48-Hour Production Forecast
                  </CardTitle>
                  <CardDescription>
                    Based on weather forecast from Open-Meteo • {productionEstimate.systemSizeKw.toFixed(1)} kW system
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {solar.loading ? (
                    <div className="h-[300px] flex items-center justify-center">
                      <RefreshCw className="h-8 w-8 animate-spin text-solar-500" />
                    </div>
                  ) : solar.error ? (
                    <div className="h-[300px] flex items-center justify-center text-red-500">
                      <AlertCircle className="h-6 w-6 mr-2" />
                      {solar.error}
                    </div>
                  ) : solar.data ? (
                    <ProductionChart data={solar.data.hourlyData} />
                  ) : null}
                </CardContent>
              </Card>

              {/* 7-Day Forecast */}
              <Card>
                <CardHeader>
                  <CardTitle>7-Day Production Outlook</CardTitle>
                  <CardDescription>
                    Total forecasted: {solar.data?.summary.totalForecastedProduction || 0} kWh
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {solar.data && <DailyForecastChart data={solar.data.dailySummaries} />}
                  {solar.data && (
                    <div className="mt-4 grid grid-cols-7 gap-2 text-center text-sm">
                      {solar.data.dailySummaries.map((day, i) => (
                        <div
                          key={i}
                          className={`p-2 rounded-lg ${
                            day.quality === "excellent"
                              ? "bg-green-100"
                              : day.quality === "good"
                              ? "bg-lime-100"
                              : day.quality === "fair"
                              ? "bg-yellow-100"
                              : "bg-red-100"
                          }`}
                        >
                          <div className="font-medium">
                            {new Date(day.date).toLocaleDateString("da-DK", { weekday: "short" })}
                          </div>
                          <div className="text-lg font-bold">{day.estimatedProduction.toFixed(0)}</div>
                          <div className="text-xs text-gray-500">kWh</div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* OPTIMIZE TAB - NEW */}
          <TabsContent value="optimize">
            <div className="grid gap-6">
              {/* Self-Sufficiency */}
              {optimization.data && (
                <Card className="bg-gradient-to-r from-green-50 to-blue-50">
                  <CardHeader>
                    <CardTitle>Self-Sufficiency Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-8">
                      <div className="relative w-32 h-32">
                        <svg className="w-32 h-32 transform -rotate-90">
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="#e5e7eb"
                            strokeWidth="12"
                            fill="none"
                          />
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="#22c55e"
                            strokeWidth="12"
                            fill="none"
                            strokeDasharray={`${optimization.data.selfSufficiency.percent * 3.52} 352`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-3xl font-bold text-green-600">
                            {optimization.data.selfSufficiency.percent}%
                          </span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-lg font-medium mb-2">
                          You're producing {optimization.data.selfSufficiency.percent}% of your electricity needs
                        </p>
                        <ul className="space-y-1 text-sm text-gray-600">
                          {optimization.data.selfSufficiency.recommendations.map((rec, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-green-500">✓</span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Smart Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    Smart Recommendations
                  </CardTitle>
                  <CardDescription>
                    AI-powered suggestions based on live prices and solar forecast
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {optimization.loading ? (
                    <div className="h-48 flex items-center justify-center">
                      <RefreshCw className="h-8 w-8 animate-spin text-solar-500" />
                    </div>
                  ) : optimization.data ? (
                    <div className="space-y-3">
                      {optimization.data.recommendations.map((rec, i) => (
                        <div
                          key={i}
                          className={`p-4 rounded-lg border-l-4 ${
                            rec.priority === "high"
                              ? "bg-green-50 border-green-500"
                              : rec.priority === "medium"
                              ? "bg-yellow-50 border-yellow-500"
                              : "bg-gray-50 border-gray-400"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-medium">{rec.action}</div>
                              <div className="text-sm text-gray-600">{rec.reason}</div>
                              <div className="text-xs text-gray-500 mt-1">
                                <Clock className="h-3 w-3 inline mr-1" />
                                {new Date(rec.startTime).toLocaleTimeString("da-DK", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })} - {new Date(rec.endTime).toLocaleTimeString("da-DK", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                            </div>
                            <div className="text-right">
                              <span className={`text-sm px-2 py-1 rounded-full ${
                                rec.priority === "high"
                                  ? "bg-green-200 text-green-800"
                                  : rec.priority === "medium"
                                  ? "bg-yellow-200 text-yellow-800"
                                  : "bg-gray-200 text-gray-800"
                              }`}>
                                {rec.priority}
                              </span>
                              <div className="text-sm font-medium text-green-600 mt-1">
                                Save ~{rec.estimatedSavings.toFixed(0)} DKK
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </CardContent>
              </Card>

              {/* Peak Solar Hours & Arbitrage */}
              <div className="grid md:grid-cols-2 gap-6">
                {optimization.data && optimization.data.peakSolarHours.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Sun className="h-5 w-5 text-solar-500" />
                        Peak Solar Hours
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {optimization.data.peakSolarHours.map((peak, i) => (
                          <div key={i} className="flex justify-between items-center p-2 bg-solar-50 rounded">
                            <span>
                              {new Date(peak.start).toLocaleTimeString("da-DK", { hour: "2-digit", minute: "2-digit" })} - {new Date(peak.end).toLocaleTimeString("da-DK", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                            <span className="font-bold text-solar-600">
                              {peak.expectedProduction.toFixed(1)} kWh
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {optimization.data && optimization.data.arbitrageOpportunities && optimization.data.arbitrageOpportunities.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Battery className="h-5 w-5 text-purple-500" />
                        Battery Arbitrage
                      </CardTitle>
                      <CardDescription>Charge cheap, discharge expensive</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {optimization.data.arbitrageOpportunities.map((arb, i) => (
                          <div key={i} className="flex justify-between items-center p-2 bg-purple-50 rounded">
                            <div className="text-sm">
                              <div>Buy: {new Date(arb.buyTime).toLocaleTimeString("da-DK", { hour: "2-digit", minute: "2-digit" })}</div>
                              <div>Sell: {new Date(arb.sellTime).toLocaleTimeString("da-DK", { hour: "2-digit", minute: "2-digit" })}</div>
                            </div>
                            <span className="font-bold text-purple-600">
                              +{arb.priceDifferenceOre} øre/kWh
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* SETUP TAB (original) */}
          <TabsContent value="setup">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Installation Costs</CardTitle>
                  <CardDescription>Enter your solar installation costs</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="panels">Solar Panels (DKK)</Label>
                    <Input
                      id="panels"
                      type="number"
                      value={costs.solarPanelsCost}
                      onChange={(e) =>
                        setCosts({ ...costs, solarPanelsCost: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inverter">Inverter (DKK)</Label>
                    <Input
                      id="inverter"
                      type="number"
                      value={costs.inverterCost}
                      onChange={(e) =>
                        setCosts({ ...costs, inverterCost: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="battery">Battery (DKK)</Label>
                    <Input
                      id="battery"
                      type="number"
                      value={costs.batteryCost}
                      onChange={(e) =>
                        setCosts({ ...costs, batteryCost: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mounting">Mounting Kit (DKK)</Label>
                    <Input
                      id="mounting"
                      type="number"
                      value={costs.mountingKitCost}
                      onChange={(e) =>
                        setCosts({ ...costs, mountingKitCost: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="installation">Setup & Installation (DKK)</Label>
                    <Input
                      id="installation"
                      type="number"
                      value={costs.installationCost}
                      onChange={(e) =>
                        setCosts({ ...costs, installationCost: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="interest">Loan Interest (DKK)</Label>
                    <Input
                      id="interest"
                      type="number"
                      value={costs.loanInterestRate}
                      onChange={(e) =>
                        setCosts({ ...costs, loanInterestRate: Number(e.target.value) })
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card className="bg-solar-50 border-solar-200">
                  <CardHeader>
                    <CardTitle>Total Investment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-5xl font-bold text-solar-600 mb-4">
                      {formatCurrency(totalCost)}
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Solar Panels</span>
                        <span>{formatCurrency(costs.solarPanelsCost)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Inverter</span>
                        <span>{formatCurrency(costs.inverterCost)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Battery</span>
                        <span>{formatCurrency(costs.batteryCost)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Mounting + Installation</span>
                        <span>{formatCurrency(costs.mountingKitCost + costs.installationCost)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Loan Interest</span>
                        <span>{formatCurrency(costs.loanInterestRate)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Panel Specifications</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="wattage">Panel Wattage (W)</Label>
                        <Input
                          id="wattage"
                          type="number"
                          value={specs.panelWattage}
                          onChange={(e) =>
                            setSpecs({ ...specs, panelWattage: Number(e.target.value) })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="numPanels">Number of Panels</Label>
                        <Input
                          id="numPanels"
                          type="number"
                          value={specs.numberOfPanels}
                          onChange={(e) =>
                            setSpecs({ ...specs, numberOfPanels: Number(e.target.value) })
                          }
                        />
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <div className="text-sm text-muted-foreground">System Size</div>
                      <div className="text-3xl font-bold text-solar-600">
                        {productionEstimate.systemSizeKw.toFixed(1)} kW
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* HISTORY/DASHBOARD TAB (original monthly data) */}
          <TabsContent value="dashboard">
            <div className="grid gap-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Total Production</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      {formatNumber(yearlyResults.totalProduction, 0)} kWh
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Total Consumption</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      {formatNumber(yearlyResults.totalConsumption, 0)} kWh
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Used from Own</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-green-600">
                      {formatNumber(yearlyResults.totalUsedFromOwnProduction, 0)} kWh
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Sold to Grid</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatNumber(yearlyResults.totalSentToGrid, 0)} kWh
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Monthly Overview (2025)</CardTitle>
                  <CardDescription>Actual production and consumption data</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Month</th>
                          <th className="text-right py-2">Production</th>
                          <th className="text-right py-2">Consumption</th>
                          <th className="text-right py-2">Used Own</th>
                          <th className="text-right py-2">To Grid</th>
                          <th className="text-right py-2">Price</th>
                          <th className="text-right py-2">Saved</th>
                        </tr>
                      </thead>
                      <tbody>
                        {monthlyResults.map((month, i) => (
                          <tr key={i} className="border-b hover:bg-muted/50">
                            <td className="py-2">{MONTH_NAMES_SHORT[month.month - 1]}</td>
                            <td className="text-right">
                              {formatNumber(month.production, 0)} kWh
                            </td>
                            <td className="text-right">
                              {formatNumber(month.consumption, 0)} kWh
                            </td>
                            <td className="text-right text-green-600">
                              {formatNumber(month.totalFromOwnProduction, 0)} kWh
                            </td>
                            <td className="text-right text-blue-600">
                              {formatNumber(month.sentToGrid, 0)} kWh
                            </td>
                            <td className="text-right">
                              {formatNumber(month.electricityPrice, 2)} kr
                            </td>
                            <td className="text-right font-medium text-green-600">
                              {formatCurrency(month.totalSaved)}
                            </td>
                          </tr>
                        ))}
                        <tr className="font-bold bg-muted">
                          <td className="py-2">Total</td>
                          <td className="text-right">
                            {formatNumber(yearlyResults.totalProduction, 0)} kWh
                          </td>
                          <td className="text-right">
                            {formatNumber(yearlyResults.totalConsumption, 0)} kWh
                          </td>
                          <td className="text-right text-green-600">
                            {formatNumber(yearlyResults.totalUsedFromOwnProduction, 0)} kWh
                          </td>
                          <td className="text-right text-blue-600">
                            {formatNumber(yearlyResults.totalSentToGrid, 0)} kWh
                          </td>
                          <td className="text-right">-</td>
                          <td className="text-right text-green-600">
                            {formatCurrency(yearlyResults.netSavings)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Payback Analysis */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Financial Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                      <div>
                        <p className="text-sm text-muted-foreground">Electricity Saved</p>
                        <p className="text-2xl font-bold text-green-600">
                          {formatCurrency(yearlyResults.totalSaved)}
                        </p>
                      </div>
                      <Zap className="h-8 w-8 text-green-500" />
                    </div>
                    <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                      <div>
                        <p className="text-sm text-muted-foreground">Grid Earnings</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {formatCurrency(yearlyResults.totalGridEarnings)}
                        </p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-blue-500" />
                    </div>
                    <div className="flex justify-between items-center p-4 bg-solar-50 rounded-lg">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Yearly Benefit</p>
                        <p className="text-3xl font-bold text-solar-600">
                          {formatCurrency(yearlyResults.netSavings)}
                        </p>
                      </div>
                      <Sun className="h-8 w-8 text-solar-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-solar-50 border-solar-200">
                  <CardHeader>
                    <CardTitle>Payback Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Investment</p>
                      <p className="text-2xl font-bold">{formatCurrency(totalCost)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Yearly Savings</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(yearlyResults.netSavings)}
                      </p>
                    </div>
                    <div className="pt-4 border-t">
                      <p className="text-sm text-muted-foreground">Payback Time</p>
                      <p className="text-5xl font-bold text-solar-600">
                        {formatNumber(yearlyResults.paybackYears, 1)} years
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Progress to Payback</p>
                      <Progress
                        value={Math.min(100, (1 / yearlyResults.paybackYears) * 100)}
                        className="h-3"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatNumber((1 / yearlyResults.paybackYears) * 100, 1)}% recovered in year 1
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">ROI (Year 1)</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatNumber(yearlyResults.roi, 1)}%
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* BATTERY TAB (original) */}
          <TabsContent value="battery">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Battery className="h-5 w-5" /> Battery Usage
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Energy Stored</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {formatNumber(
                          monthlyResults.reduce((sum, m) => sum + m.sentToBattery, 0),
                          0
                        )}{" "}
                        kWh
                      </p>
                    </div>
                    <Battery className="h-8 w-8 text-purple-500" />
                  </div>
                  <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Used from Battery</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatNumber(
                          monthlyResults.reduce((sum, m) => sum + m.usedByBattery, 0),
                          0
                        )}{" "}
                        kWh
                      </p>
                    </div>
                    <Zap className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Car className="h-5 w-5" /> EV Charging
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Total EV Charged</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {formatNumber(yearlyResults.totalEvCharged, 0)} kWh
                      </p>
                    </div>
                    <Car className="h-8 w-8 text-blue-500" />
                  </div>
                  <div className="space-y-3">
                    <p className="text-sm font-medium">Monthly EV Charging</p>
                    {monthlyResults.slice(0, 6).map((month, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="w-12 text-sm">{MONTH_NAMES_SHORT[month.month - 1]}</span>
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${(month.evCharged / 600) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm w-16 text-right">{month.evCharged} kWh</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* CO2 TAB (original) */}
          <TabsContent value="co2">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-green-50 border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Leaf className="h-5 w-5 text-green-600" /> CO₂ Savings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <p className="text-sm text-muted-foreground">Total CO₂ Saved This Year</p>
                      <p className="text-5xl font-bold text-green-600">
                        {formatNumber(yearlyResults.totalCO2SavedKg, 0)} kg
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Equivalent to</p>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div className="bg-white p-4 rounded-lg">
                          <p className="text-2xl font-bold text-green-600">
                            {formatNumber(yearlyResults.totalCO2SavedKg / 21, 0)}
                          </p>
                          <p className="text-sm text-muted-foreground">Trees planted</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg">
                          <p className="text-2xl font-bold text-green-600">
                            {formatNumber(yearlyResults.totalCO2SavedKg / 0.12, 0)}
                          </p>
                          <p className="text-sm text-muted-foreground">km not driven</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Monthly CO₂ Impact</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {monthlyResults.map((month, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="w-12 text-sm">{MONTH_NAMES_SHORT[month.month - 1]}</span>
                        <div className="flex-1 bg-muted rounded-full h-4">
                          <div
                            className="bg-green-500 h-4 rounded-full flex items-center justify-end pr-2"
                            style={{ width: `${(month.co2SavedKg / 600) * 100}%` }}
                          >
                            {month.co2SavedKg > 100 && (
                              <span className="text-xs text-white">
                                {formatNumber(month.co2SavedKg, 0)}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-sm w-16 text-right">
                          {formatNumber(month.co2SavedKg, 0)} kg
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t mt-12 py-8 bg-muted/30">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p className="font-medium">Solar Calculator 10X</p>
          <p className="mt-1">
            Live data from Energi Data Service (Nordpool) • Solar forecast from Open-Meteo
          </p>
          <p className="mt-1 text-xs">
            Built with real data from Platanvej 7, Denmark
          </p>
        </div>
      </footer>
    </div>
  );
}
