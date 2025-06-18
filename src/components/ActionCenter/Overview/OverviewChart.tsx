import React from "react";
import { ChartDataPoint } from "./interfaces";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface OverviewChartProps {
  data: ChartDataPoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[rgba(0,0,0,0.8)] p-3 rounded-lg shadow-lg border border-[#444B5A]">
        <p className="text-white font-medium mb-2">{label}</p>
        <div className="space-y-1">
          <p className="text-white">
            Volume:{" "}
            <span className="text-[#00CFFF]">
              ${payload[0]?.value.toLocaleString()}
            </span>
          </p>
          <p className="text-white">
            Virgen Points:{" "}
            <span className="text-[#FF2FE6]">
              {payload[1]?.value.toLocaleString()}
            </span>
          </p>
          <p className="text-white">
            Transactions:{" "}
            <span className="text-[#B0BEC5]">
              {payload[2]?.value.toLocaleString()}
            </span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

const OverviewChart: React.FC<OverviewChartProps> = ({ data }) => {
  const maxVolume =
    Math.ceil(Math.max(...data.map((d) => d.volume)) / 10000) * 10000;
  const maxPoints =
    Math.ceil(Math.max(...data.map((d) => d.virgenPoints)) / 250) * 250;

  return (
    <div className="relative w-[90%] h-[240px]">
      <ResponsiveContainer width="120%" height="100%">
        <BarChart
          data={data.slice(0, 6)}
          margin={{ top: 20, right: 40, bottom: 5 }}
          barGap={2}
          barCategoryGap={"20%"}
        >
          <defs>
            <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00CFFF" stopOpacity={1} />
              <stop offset="100%" stopColor="#00CFFF" stopOpacity={0.7} />
            </linearGradient>
            <linearGradient id="pointsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF2FE6" stopOpacity={1} />
              <stop offset="100%" stopColor="#FF2FE6" stopOpacity={0.7} />
            </linearGradient>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow
                dx="0"
                dy="2"
                stdDeviation="2"
                floodColor="#000"
                floodOpacity="0.2"
              />
            </filter>
            <pattern
              id="gridPattern"
              x="0"
              y="0"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 20 0 L 0 0 0 20"
                fill="none"
                stroke="#2C2F38"
                strokeWidth="1"
                opacity="0.2"
              />
            </pattern>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#CDCECF"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            stroke="#B0BEC5"
            tick={{ fill: "#B0BEC5", fontSize: 10, fontWeight: 500 }}
            axisLine={{ stroke: "#444B5A" }}
            tickLine={{ stroke: "#444B5A" }}
            interval={0}
            minTickGap={20}
          />
          <YAxis
            yAxisId="left"
            orientation="left"
            stroke="#B0BEC5"
            tick={{ fill: "#B0BEC5", fontSize: 10 }}
            axisLine={{ stroke: "#444B5A" }}
            tickLine={{ stroke: "#444B5A" }}
            domain={[0, maxVolume]}
            tickFormatter={(value) => `$${value / 1000}K`}
            label={{
              value: "Volume",
              angle: -90,
              position: "insideLeft",
              offset: 12,
              fill: "#B0BEC5",
              fontSize: 10,
              fontWeight: 500,
            }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="#B0BEC5"
            tick={{ fill: "#B0BEC5", fontSize: 10 }}
            axisLine={{ stroke: "#444B5A" }}
            tickLine={{ stroke: "#444B5A" }}
            domain={[0, maxPoints]}
            tickFormatter={(value) => value.toString()}
            label={{
              value: "Virgen Points",
              angle: 90,
              position: "insideRight",
              offset: 12,
              fill: "#B0BEC5",
              fontSize: 10,
              fontWeight: 500,
            }}
          />

          <Tooltip content={<CustomTooltip />} />

          {/* Static background (must use fixed width/height, not %) */}
          <rect
            x={0}
            y={0}
            width={600}
            height={300}
            fill="url(#gridPattern)"
            style={{
              clipPath: "inset(0 0 0 0)",
              pointerEvents: "none",
              opacity: 0.5,
            }}
          />

          <Bar
            yAxisId="left"
            dataKey="volume"
            fill="url(#volumeGradient)"
            radius={[2, 2, 0, 0]}
            filter="url(#shadow)"
            stackId="aligned"
          />
          <Bar
            yAxisId="right"
            dataKey="virgenPoints"
            fill="url(#pointsGradient)"
            radius={[2, 2, 0, 0]}
            filter="url(#shadow)"
            stackId="aligned"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default OverviewChart;
