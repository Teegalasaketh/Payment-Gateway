/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Payment, PaymentMethod, PaymentStatus } from "../../types";

// ------------------------------------------------------------------
// REVENUE TREND CHART (Elegant Area Flow with Gradient Fill)
// ------------------------------------------------------------------
export const RevenueTrendChart: React.FC<{ payments: Payment[] }> = ({ payments }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Group completed payments by date (last 7 days of activity)
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const revenueByDayMap: Record<string, number> = {};
  
  // Seed initial days to avoid blank charts
  days.forEach(d => { revenueByDayMap[d] = 0; });

  // Map real values
  payments
    .filter(p => p.status === PaymentStatus.COMPLETED)
    .slice(0, 70) // sample recent records
    .forEach(p => {
      const dName = days[new Date(p.date).getDay()];
      revenueByDayMap[dName] += p.amount;
    });

  const chartData = days.map((day) => ({
    label: day,
    value: parseFloat(revenueByDayMap[day].toFixed(2))
  }));

  const maxVal = Math.max(...chartData.map(d => d.value), 100);
  
  // Chart dimensions
  const width = 500;
  const height = 200;
  const padding = 30;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Calculate coordinates
  const points = chartData.map((d, i) => {
    const x = padding + (i / (chartData.length - 1)) * chartWidth;
    const y = padding + chartHeight - (d.value / maxVal) * chartHeight;
    return { x, y, ...d };
  });

  // Construct SVG line paths
  const linePath = points.reduce((acc, p, i) => {
    return acc + `${i === 0 ? "M" : "L"} ${p.x} ${p.y} `;
  }, "");

  const areaPath = points.length > 0 
    ? `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`
    : "";

  return (
    <div className="relative p-6 rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-100 dark:border-slate-800 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4 h-5">Revenue Trend (Active Inflows)</h3>
      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
            const hVal = padding + chartHeight * ratio;
            return (
              <line
                key={index}
                x1={padding}
                y1={hVal}
                x2={width - padding}
                y2={hVal}
                stroke="currentColor"
                className="text-slate-100 dark:text-slate-800"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
            );
          })}

          {/* Gradient Fill Area */}
          {areaPath && (
            <path d={areaPath} fill="url(#areaGrad)" className="transition-all duration-300" />
          )}

          {/* Core Flow Line */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="#8B5CF6"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-all duration-300 drop-shadow-sm"
            />
          )}

          {/* Interactive Nodes */}
          {points.map((p, i) => (
            <g key={i}>
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredIndex === i ? 6 : 4}
                className="fill-purple-600 stroke-white dark:stroke-slate-950 stroke-2 cursor-pointer transition-all duration-150"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            </g>
          ))}

          {/* Date Axis X Labels */}
          {points.map((p, i) => (
            <text
              key={i}
              x={p.x}
              y={height - padding + 18}
              textAnchor="middle"
              className="fill-slate-400 dark:fill-slate-500 font-mono text-[10px] uppercase"
            >
              {p.label}
            </text>
          ))}
        </svg>

        {/* Dynamic Tooltip Anchor */}
        {hoveredIndex !== null && (
          <div
            className="absolute rounded bg-slate-900 border border-slate-700/80 p-2 text-[11px] font-mono text-white/90 shadow-lg pointer-events-none transition-all duration-150 leading-tight"
            style={{
              left: `${(points[hoveredIndex].x / width) * 100}%`,
              top: `${(points[hoveredIndex].y / height) * 100 - 25}%`,
              transform: "translate(-50%, -100%)",
            }}
          >
            <div className="font-semibold text-purple-400 font-sans">{chartData[hoveredIndex].label} Inflows</div>
            <div>${chartData[hoveredIndex].value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          </div>
        )}
      </div>
    </div>
  );
};

// ------------------------------------------------------------------
// MONTHLY TRANSACTIONS BAR CHART
// ------------------------------------------------------------------
export const MonthlyTransactionsChart: React.FC<{ payments: Payment[] }> = ({ payments }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Group count of payments by last 5 calendar months mock
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const transactionCounts: Record<string, number> = {
    Jan: 48,
    Feb: 65,
    Mar: 82,
    Apr: 74,
    May: 95,
    Jun: payments.length || 112 // dynamic bind recent
  };

  const chartData = months.map(m => ({
    label: m,
    value: transactionCounts[m]
  }));

  const maxVal = Math.max(...chartData.map(d => d.value), 40);

  // Dimensions
  const width = 500;
  const height = 200;
  const padding = 30;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  return (
    <div className="relative p-6 rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-100 dark:border-slate-800 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4 h-5">Monthly Transaction Count</h3>
      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
            const hVal = padding + chartHeight * ratio;
            return (
              <line
                key={index}
                x1={padding}
                y1={hVal}
                x2={width - padding}
                y2={hVal}
                stroke="currentColor"
                className="text-slate-100 dark:text-slate-800"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
            );
          })}

          {/* Render Bars */}
          {chartData.map((d, i) => {
            const barWidth = 32;
            const x = padding + (i / chartData.length) * chartWidth + (chartWidth / chartData.length - barWidth) / 2;
            const barHeight = (d.value / maxVal) * chartHeight;
            const y = height - padding - barHeight;

            return (
              <g key={i}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={Math.max(barHeight, 4)}
                  rx={4}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className={`cursor-pointer transition-all duration-200 fill-purple-600/60 hover:fill-purple-600 dark:fill-purple-500/50 dark:hover:fill-purple-500`}
                />
                
                {/* Text Indicator X labels */}
                <text
                  x={x + barWidth / 2}
                  y={height - padding + 18}
                  textAnchor="middle"
                  className="fill-slate-400 dark:fill-slate-500 font-mono text-[10px]"
                >
                  {d.label}
                </text>
              </g>
            );
          })}
        </svg>

        {hoveredIndex !== null && (
          <div
            className="absolute rounded bg-slate-900 border border-slate-700/80 p-2 text-[11px] font-mono text-white/90 shadow-lg pointer-events-none transition-all duration-150 leading-tight"
            style={{
              left: `${((padding + (hoveredIndex / chartData.length) * chartWidth + (chartWidth / chartData.length) / 2) / width) * 100}%`,
              top: `${((height - padding - (chartData[hoveredIndex].value / maxVal) * chartHeight) / height) * 100 - 15}%`,
              transform: "translate(-50%, -100%)",
            }}
          >
            <div className="font-semibold text-slate-300 font-sans">{chartData[hoveredIndex].label} Checkouts</div>
            <div className="font-bold text-purple-400">{chartData[hoveredIndex].value} Settled</div>
          </div>
        )}
      </div>
    </div>
  );
};


// ------------------------------------------------------------------
// REGISTRATION / PAYMENT METHOD DISTRIBUTION (Segmented Donut)
// ------------------------------------------------------------------
export const PaymentMethodDistributionChart: React.FC<{ payments: Payment[] }> = ({ payments }) => {
  // Count frequency of methods
  const methodsCount: Record<string, number> = {};
  payments.forEach(p => {
    methodsCount[p.method] = (methodsCount[p.method] || 0) + 1;
  });

  const rawData = Object.entries(methodsCount).map(([key, rawCount]) => ({
    name: key.replace('_', ' '),
    count: rawCount
  })).sort((a, b) => b.count - a.count).slice(0, 4);

  // Fallbacks if no payments
  const data = rawData.length > 0 ? rawData : [
    { name: "Credit Card", count: 45 },
    { name: "UPI Inflow", count: 35 },
    { name: "Debit Card", count: 15 },
    { name: "Net Banking", count: 5 }
  ];

  const totalCount = data.reduce((sum, d) => sum + d.count, 0);

  // SVG parameters
  const size = 150;
  const radius = 55;
  const strokeWidth = 14;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  // Colors for segments
  const colors = ["#8B5CF6", "#22C55E", "#F59E0B", "#EF4444"];

  let accumulatedPercent = 0;

  return (
    <div className="relative p-6 rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4 h-5">Processor Terminals</h3>
        <div className="space-y-3">
          {data.map((d, i) => {
            const percent = ((d.count / totalCount) * 100).toFixed(0);
            return (
              <div key={i} className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: colors[i % colors.length] }} />
                  <span className="text-slate-500 dark:text-slate-400 capitalize">{d.name.toLowerCase()}</span>
                </div>
                <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">{percent}%</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="relative w-[150px] h-[150px] shrink-0">
        <svg width={size} height={size} className="transform -rotate-90 select-none">
          {data.map((d, i) => {
            const percentage = d.count / totalCount;
            const strokeDashoffset = circumference - percentage * circumference;
            const strokeDasharray = `${circumference} ${circumference}`;
            const rotationOffset = (accumulatedPercent / 100) * 360;
            accumulatedPercent += percentage * 100;

            return (
              <circle
                key={i}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={colors[i % colors.length]}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-500"
                transform={`rotate(${rotationOffset} ${center} ${center})`}
              />
            );
          })}
        </svg>

        <div className="absolute inset-0 flex flex-col justify-center items-center text-center leading-none">
          <span className="text-xl font-bold font-mono text-slate-800 dark:text-slate-200">{totalCount}</span>
          <span className="text-[9px] text-slate-400 font-sans tracking-wider mt-1 uppercase">Cleared Ints</span>
        </div>
      </div>
    </div>
  );
};
