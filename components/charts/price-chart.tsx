"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface PriceData {
  hour: string;
  hourDK: string;
  priceDKK: number;
  isCheap: boolean;
  isExpensive: boolean;
}

interface PriceChartProps {
  prices: PriceData[];
  currentHour?: number;
  showAverage?: boolean;
}

export function PriceChart({ prices, currentHour, showAverage = true }: PriceChartProps) {
  const chartData = useMemo(() => {
    return prices.map((p, index) => {
      const date = new Date(p.hourDK || p.hour);
      return {
        time: `${date.getHours().toString().padStart(2, "0")}:00`,
        price: Math.round(p.priceDKK * 100), // Convert to øre
        isCheap: p.isCheap,
        isExpensive: p.isExpensive,
        fill: p.isCheap ? "#22c55e" : p.isExpensive ? "#ef4444" : "#f59e0b",
        index,
      };
    });
  }, [prices]);

  const avgPrice = useMemo(() => {
    if (prices.length === 0) return 0;
    return Math.round(
      (prices.reduce((sum, p) => sum + p.priceDKK, 0) / prices.length) * 100
    );
  }, [prices]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.[0]) return null;
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border">
        <p className="font-semibold">{data.time}</p>
        <p className="text-lg">
          <span className="font-bold" style={{ color: data.fill }}>
            {data.price} øre/kWh
          </span>
        </p>
        {data.isCheap && (
          <p className="text-green-600 text-sm">✓ Cheap hour - good for charging!</p>
        )}
        {data.isExpensive && (
          <p className="text-red-600 text-sm">⚠ Expensive - avoid heavy usage</p>
        )}
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis
          dataKey="time"
          tick={{ fontSize: 11 }}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 11 }}
          tickFormatter={(v) => `${v}ø`}
          domain={["dataMin - 20", "dataMax + 20"]}
        />
        <Tooltip content={<CustomTooltip />} />
        {showAverage && (
          <ReferenceLine
            y={avgPrice}
            stroke="#6b7280"
            strokeDasharray="5 5"
            label={{ value: `Avg: ${avgPrice}ø`, position: "right", fontSize: 11 }}
          />
        )}
        <Area
          type="stepAfter"
          dataKey="price"
          stroke="#f59e0b"
          fill="url(#priceGradient)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
