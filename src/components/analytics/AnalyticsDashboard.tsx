"use client";

import React, { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import ContentLayout from "@/components/layout/ContentLayout";
import {
  TileLayout,
  TileLayoutItem,
  TileLayoutRepositionEvent,
  TilePosition,
} from "@progress/kendo-react-layout";
import {
  Chart,
  ChartSeries,
  ChartSeriesItem,
  ChartTitle,
  ChartTooltip,
  ChartLegend,
} from "@progress/kendo-react-charts";

// Custom SVG Gauge Component replacing missing ArcGauge component
const PlantEfficiencyGauge = ({ value = 87 }: { value: number }) => {
  const radius = 65;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center my-2">
      <svg className="w-52 h-32 overflow-visible" viewBox="0 0 160 90">
        <path
          d="M 15 80 A 65 65 0 0 1 145 80"
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="14"
          strokeLinecap="round"
        />
        <path
          d="M 15 80 A 65 65 0 0 1 145 80"
          fill="none"
          stroke="#10b981"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute bottom-1 flex flex-col items-center">
        <span className="text-3xl font-extrabold text-slate-800">{value}%</span>
        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Optimal OEE Rating</span>
      </div>
    </div>
  );
};

export default function AnalyticsDashboard() {
  const [tiles, setTiles] = useState<TilePosition[]>([
    { col: 1, colSpan: 1, rowSpan: 1 },
    { col: 2, colSpan: 1, rowSpan: 1 },
    { col: 3, colSpan: 1, rowSpan: 1 },
    { col: 4, colSpan: 1, rowSpan: 1 },
    { col: 1, colSpan: 2, rowSpan: 2 },
    { col: 3, colSpan: 2, rowSpan: 2 },
  ]);

  const handleReposition = (e: TileLayoutRepositionEvent) => {
    setTiles(e.value);
  };

  const items: TileLayoutItem[] = [
    {
      body: (
        <div className="bg-white p-4 rounded-xl h-full border border-slate-200 shadow-2xs flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase">System Throughput</span>
          <div className="text-2xl font-extrabold text-emerald-600">98.4%</div>
          <span className="text-[10px] text-emerald-600 font-semibold">▲ +2.3% vs Last Month</span>
        </div>
      ),
    },
    {
      body: (
        <div className="bg-white p-4 rounded-xl h-full border border-slate-200 shadow-2xs flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Active Enterprise Nodes</span>
          <div className="text-2xl font-extrabold text-blue-600">1,482</div>
          <span className="text-[10px] text-blue-600 font-semibold">Fully Operational</span>
        </div>
      ),
    },
    {
      body: (
        <div className="bg-white p-4 rounded-xl h-full border border-slate-200 shadow-2xs flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Avg Response Time</span>
          <div className="text-2xl font-extrabold text-purple-600">42 ms</div>
          <span className="text-[10px] text-purple-600 font-semibold">Fast Sub-second Latency</span>
        </div>
      ),
    },
    {
      body: (
        <div className="bg-white p-4 rounded-xl h-full border border-slate-200 shadow-2xs flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Security Vault Status</span>
          <div className="text-2xl font-extrabold text-emerald-700">Protected</div>
          <span className="text-[10px] text-slate-400 font-semibold">Zero Critical Alerts</span>
        </div>
      ),
    },
    {
      body: (
        <div className="bg-white p-4 rounded-xl h-full border border-slate-200 shadow-2xs flex flex-col justify-between items-center text-center">
          <span className="text-xs font-bold text-slate-700 uppercase mb-2">Overall Plant Efficiency (OEE Gauge)</span>
          <PlantEfficiencyGauge value={87} />
          <span className="text-xs font-bold text-emerald-600 mt-1">87% Optimal Rating</span>
        </div>
      ),
    },
    {
      body: (
        <div className="bg-white p-4 rounded-xl h-full border border-slate-200 shadow-2xs">
          <Chart style={{ height: 280 }}>
            <ChartTitle text="Regional Resource Allocation" font="bold 13px sans-serif" color="#1e293b" />
            <ChartLegend position="bottom" />
            <ChartTooltip />
            <ChartSeries>
              <ChartSeriesItem
                type="pie"
                data={[
                  { category: "North America Hub", value: 40 },
                  { category: "EMEA Region", value: 30 },
                  { category: "APAC Facilities", value: 20 },
                  { category: "LATAM Vaults", value: 10 },
                ]}
                categoryField="category"
                field="value"
              />
            </ChartSeries>
          </Chart>
        </div>
      ),
    },
  ];

  return (
    <AppLayout>
      <ContentLayout title="Executive Analytics" breadcrumbItems={["Reports", "Analytics"]}>
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Key360 Executive Intelligence TileLayout</h3>
              <p className="text-xs text-slate-400">Drag & Drop Tiles to Customize Executive Dashboard View</p>
            </div>
            <span className="bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full border border-purple-200">
              DRAG & DROP TILELAYOUT ACTIVE
            </span>
          </div>

          {/* Interactive TileLayout Container */}
          <TileLayout
            columns={4}
            rowHeight={160}
            gap={{ rows: 16, columns: 16 }}
            positions={tiles}
            onReposition={handleReposition}
            items={items}
          />
        </div>
      </ContentLayout>
    </AppLayout>
  );
}
