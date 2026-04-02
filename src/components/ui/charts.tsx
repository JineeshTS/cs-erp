"use client";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/* ────────── Default colour palettes ────────── */

const DEFAULT_COLORS = [
  "hsl(221, 83%, 53%)",  // blue-600
  "hsl(160, 84%, 39%)",  // emerald-600
  "hsl(38, 92%, 50%)",   // amber-500
  "hsl(0, 72%, 51%)",    // red-600
  "hsl(270, 76%, 58%)",  // violet-500
  "hsl(199, 89%, 48%)",  // sky-500
  "hsl(30, 100%, 50%)",  // orange-500
  "hsl(330, 81%, 60%)",  // pink-400
];

/* ────────── Bar Chart Card ────────── */

interface BarChartCardProps {
  title: string;
  data: Record<string, unknown>[];
  dataKey: string;
  categoryKey: string;
  color?: string;
  height?: number;
}

export function BarChartCard({
  title,
  data,
  dataKey,
  categoryKey,
  color = DEFAULT_COLORS[0],
  height = 300,
}: BarChartCardProps) {
  return (
    <Card className="dark:border-slate-700/60 dark:bg-slate-900">
      <CardHeader>
        <CardTitle className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
            <XAxis
              dataKey={categoryKey}
              tick={{ fontSize: 12 }}
              className="text-slate-500 dark:text-slate-400"
            />
            <YAxis tick={{ fontSize: 12 }} className="text-slate-500 dark:text-slate-400" />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--tooltip-bg, #fff)",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Legend wrapperStyle={{ fontSize: "12px" }} />
            <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

/* ────────── Line Chart Card ────────── */

interface LineChartCardProps {
  title: string;
  data: Record<string, unknown>[];
  dataKeys: string[];
  categoryKey: string;
  colors?: string[];
  height?: number;
}

export function LineChartCard({
  title,
  data,
  dataKeys,
  categoryKey,
  colors = DEFAULT_COLORS,
  height = 300,
}: LineChartCardProps) {
  return (
    <Card className="dark:border-slate-700/60 dark:bg-slate-900">
      <CardHeader>
        <CardTitle className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
            <XAxis
              dataKey={categoryKey}
              tick={{ fontSize: 12 }}
              className="text-slate-500 dark:text-slate-400"
            />
            <YAxis tick={{ fontSize: 12 }} className="text-slate-500 dark:text-slate-400" />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--tooltip-bg, #fff)",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Legend wrapperStyle={{ fontSize: "12px" }} />
            {dataKeys.map((key, idx) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={colors[idx % colors.length]}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

/* ────────── Pie Chart Card ────────── */

interface PieChartCardProps {
  title: string;
  data: Record<string, unknown>[];
  dataKey: string;
  nameKey: string;
  colors?: string[];
  height?: number;
}

export function PieChartCard({
  title,
  data,
  dataKey,
  nameKey,
  colors = DEFAULT_COLORS,
  height = 300,
}: PieChartCardProps) {
  return (
    <Card className="dark:border-slate-700/60 dark:bg-slate-900">
      <CardHeader>
        <CardTitle className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={data}
              dataKey={dataKey}
              nameKey={nameKey}
              cx="50%"
              cy="50%"
              innerRadius="40%"
              outerRadius="70%"
              paddingAngle={2}
              label={({ name, percent }: { name?: string; percent?: number }) =>
                `${name ?? ""} ${(((percent ?? 0)) * 100).toFixed(0)}%`
              }
              labelLine={{ stroke: "#94a3b8", strokeWidth: 1 }}
            >
              {data.map((_, idx) => (
                <Cell
                  key={`cell-${idx}`}
                  fill={colors[idx % colors.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--tooltip-bg, #fff)",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Legend wrapperStyle={{ fontSize: "12px" }} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

/* ────────── Area Chart Card ────────── */

interface AreaChartCardProps {
  title: string;
  data: Record<string, unknown>[];
  dataKey: string;
  categoryKey: string;
  color?: string;
  height?: number;
}

export function AreaChartCard({
  title,
  data,
  dataKey,
  categoryKey,
  color = DEFAULT_COLORS[0],
  height = 300,
}: AreaChartCardProps) {
  return (
    <Card className="dark:border-slate-700/60 dark:bg-slate-900">
      <CardHeader>
        <CardTitle className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
            <XAxis
              dataKey={categoryKey}
              tick={{ fontSize: 12 }}
              className="text-slate-500 dark:text-slate-400"
            />
            <YAxis tick={{ fontSize: 12 }} className="text-slate-500 dark:text-slate-400" />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--tooltip-bg, #fff)",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              fill={color}
              fillOpacity={0.15}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
