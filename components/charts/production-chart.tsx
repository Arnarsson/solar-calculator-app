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
  Bar,
  ComposedChart,
  Line,
} from "recharts";

interface ProductionData {
  time: string;
  ghi: number;
  production: number;
  cloudCover?: number;
  temperature?: number;
}

interface ProductionChartProps {
  data: ProductionData[];
  showCloudCover?: boolean;
}

export function ProductionChart({ data, showCloudCover = true }: ProductionChartProps) {
  const chartData = useMemo(() => {
    return data.map((d) => {
      const date = new Date(d.time);
      return {
        time: `${date.getHours().toString().padStart(2, "0")}:00`,
        date: date.toLocaleDateString("da-DK", { weekday: "short" }),
        production: d.production,
        ghi: d.ghi,
        cloudCover: d.cloudCover,
        fullTime: d.time,
      };
    });
  }, [data]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.[0]) return null;
    const d = payload[0].payload;
    const date = new Date(d.fullTime);
    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border">
        <p className="font-semibold">
          {date.toLocaleDateString("da-DK", { weekday: "long" })} {d.time}
        </p>
        <p className="text-solar-600 font-bold text-lg">
          {d.production.toFixed(2)} kWh
        </p>
        <p className="text-gray-500 text-sm">Solar Radiation: {d.ghi} W/m²</p>
        {d.cloudCover !== undefined && (
          <p className="text-gray-500 text-sm">
            Cloud Cover: {d.cloudCover}%
            {d.cloudCover > 70 ? " ☁️" : d.cloudCover < 30 ? " ☀️" : " ⛅"}
          </p>
        )}
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="productionGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis
          dataKey="time"
          tick={{ fontSize: 11 }}
          interval={3}
        />
        <YAxis
          yAxisId="production"
          tick={{ fontSize: 11 }}
          tickFormatter={(v) => `${v}kWh`}
        />
        {showCloudCover && (
          <YAxis
            yAxisId="cloud"
            orientation="right"
            tick={{ fontSize: 11 }}
            tickFormatter={(v) => `${v}%`}
            domain={[0, 100]}
          />
        )}
        <Tooltip content={<CustomTooltip />} />
        <Area
          yAxisId="production"
          type="monotone"
          dataKey="production"
          stroke="#f59e0b"
          fill="url(#productionGradient)"
          strokeWidth={2}
        />
        {showCloudCover && (
          <Line
            yAxisId="cloud"
            type="monotone"
            dataKey="cloudCover"
            stroke="#94a3b8"
            strokeWidth={1}
            strokeDasharray="3 3"
            dot={false}
          />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
}

interface DailyForecastProps {
  data: {
    date: string;
    estimatedProduction: number;
    quality: string;
    avgCloudCover: number;
  }[];
}

export function DailyForecastChart({ data }: DailyForecastProps) {
  const chartData = useMemo(() => {
    return data.map((d) => {
      const date = new Date(d.date);
      return {
        day: date.toLocaleDateString("da-DK", { weekday: "short" }),
        production: d.estimatedProduction,
        quality: d.quality,
        cloudCover: d.avgCloudCover,
        fill:
          d.quality === "excellent"
            ? "#22c55e"
            : d.quality === "good"
            ? "#84cc16"
            : d.quality === "fair"
            ? "#f59e0b"
            : "#ef4444",
      };
    });
  }, [data]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.[0]) return null;
    const d = payload[0].payload;
    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border">
        <p className="font-semibold capitalize">{d.day}</p>
        <p className="font-bold text-lg" style={{ color: d.fill }}>
          {d.production.toFixed(1)} kWh
        </p>
        <p className="text-sm text-gray-500">
          Quality: {d.quality} • Clouds: {Math.round(d.cloudCover)}%
        </p>
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={200}>
      <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis dataKey="day" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}kWh`} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="production" radius={[4, 4, 0, 0]}>
          {chartData.map((entry, index) => (
            <Bar key={index} dataKey="production" fill={entry.fill} />
          ))}
        </Bar>
      </ComposedChart>
    </ResponsiveContainer>
  );
}
