"use client";

import React, { useState, useEffect, useMemo } from "react";
import AppLayout from "@/components/layout/AppLayout";
import ContentLayout from "@/components/layout/ContentLayout";
import Link from "next/link";
import { ModuleRegistry } from "@/metadata/registry";
import {
  Chart,
  ChartSeries,
  ChartSeriesItem,
  ChartCategoryAxis,
  ChartCategoryAxisItem,
  ChartValueAxis,
  ChartValueAxisItem,
  ChartTooltip,
} from "@progress/kendo-react-charts";
import { SvgIcon } from "@progress/kendo-react-common";

export default function Dashboard() {
  const [dataMap, setDataMap] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  const activeModules = useMemo(() => {
    return ModuleRegistry.getAllModules().filter((mod) => ModuleRegistry.getService(mod.id) !== undefined);
  }, []);

  useEffect(() => {
    async function loadAllData() {
      setLoading(true);
      const tempMap: Record<string, any> = {};
      try {
        await Promise.all(
          activeModules.map(async (mod) => {
            const service = ModuleRegistry.getService(mod.id);
            if (service) {
              const res = await service.getAll();
              tempMap[mod.id] = res;
            }
          })
        );
        setDataMap(tempMap);
      } catch (err) {
        console.error("Failed to load dashboard metrics:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAllData();
  }, [activeModules]);

  // Compute metrics dynamically from registry and dataMap
  const aggregatedKpis = useMemo(() => {
    const list: any[] = [];

    activeModules.forEach((mod) => {
      const data = dataMap[mod.id];
      if (!data || !mod.kpis) return;

      // Flatten tree helper (e.g. for gantt tasks)
      const getFlatData = (nodes: any[]): any[] => {
        let flat: any[] = [];
        nodes.forEach((n) => {
          flat.push(n);
          if (n.children && n.children.length > 0) {
            flat = flat.concat(getFlatData(n.children));
          }
        });
        return flat;
      };

      const isGantt = mod.views.includes("gantt") && mod.defaultView === "gantt";
      const targetList = isGantt ? getFlatData(data.tasks || []) : data;

      const evaluateFilter = (item: any, filter?: any): boolean => {
        if (!filter) return true;
        return Object.keys(filter).every((key) => {
          const val = item[key];
          const criteria = filter[key];
          if (criteria && typeof criteria === "object") {
            return Object.keys(criteria).every((op) => {
              const limit = criteria[op];
              if (op === "gte") return Number(val) >= Number(limit);
              if (op === "gt") return Number(val) > Number(limit);
              if (op === "lte") return Number(val) <= Number(limit);
              if (op === "lt") return Number(val) < Number(limit);
              if (op === "eq") return val === limit;
              return false;
            });
          }
          return val === criteria;
        });
      };

      mod.kpis.forEach((kpi) => {
        let value: any = 0;
        const isTree = kpi.type.endsWith("-tree");
        const kpiData = isTree ? targetList : (Array.isArray(data) ? data : []);

        if (kpiData.length === 0 && !isTree) return;

        if (kpi.type === "sum" || kpi.type === "sum-tree") {
          const filtered = kpiData.filter((item: any) => evaluateFilter(item, kpi.filter));
          const sum = filtered.reduce((acc: any, item: any) => acc + (Number(item[kpi.field]) || 0), 0);
          value = kpi.suffix ? `${sum.toFixed(1)}${kpi.suffix}` : sum.toFixed(1);
        } else if (kpi.type === "count" || kpi.type === "count-tree") {
          const filtered = kpiData.filter((item: any) => evaluateFilter(item, kpi.filter));
          value = filtered.length;
        } else if (kpi.type === "average" || kpi.type === "average-tree") {
          const filtered = kpiData.filter((item: any) => evaluateFilter(item, kpi.filter));
          const sum = filtered.reduce((acc: any, item: any) => acc + (Number(item[kpi.field]) || 0), 0);
          const avg = sum / (filtered.length || 1);
          value = kpi.format === "percent" ? `${(avg * 100).toFixed(0)}%` : avg.toFixed(1);
        }

        list.push({
          label: kpi.label,
          value,
          moduleTitle: mod.title,
          color: kpi.color || "text-slate-900",
          icon: kpi.icon || null,
        });
      });
    });

    return list;
  }, [dataMap, activeModules]);

  // Compute charts data dynamically from registry and dataMap
  const compiledCharts = useMemo(() => {
    const list: any[] = [];

    activeModules.forEach((mod) => {
      const data = dataMap[mod.id];
      if (!data || !mod.charts) return;

      mod.charts.forEach((chartDef) => {
        // Group and aggregate daily map
        const aggregateMap: Record<string, number> = {};

        // Seed static range for timesheets hours logged trend to maintain visual excellence
        if (mod.id === "timesheets" && chartDef.id === "hours-trend") {
          const days = ["2026-07-18", "2026-07-19", "2026-07-20", "2026-07-21", "2026-07-22", "2026-07-23", "2026-07-24"];
          days.forEach((d) => { aggregateMap[d] = 0; });
        }

        const rawArray = Array.isArray(data) ? data : [];
        rawArray.forEach((item) => {
          const catVal = item[chartDef.categoryField];
          const seriesVal = Number(item[chartDef.seriesField]) || 0;
          if (catVal) {
            aggregateMap[catVal] = (aggregateMap[catVal] || 0) + seriesVal;
          }
        });

        const sortedCategories = Object.keys(aggregateMap).sort();
        const chartPoints = sortedCategories.map((cat) => {
          let label = cat;
          // Format date string nicely if it is indeed a date
          if (cat.match(/^\d{4}-\d{2}-\d{2}$/)) {
            label = new Date(cat).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            });
          }
          return {
            category: label,
            value: aggregateMap[cat],
          };
        });

        list.push({
          id: chartDef.id,
          title: chartDef.title,
          type: chartDef.type,
          color: chartDef.color || "#0b6b0b",
          points: chartPoints,
          moduleTitle: mod.title,
        });
      });
    });

    return list;
  }, [dataMap, activeModules]);

  // Gather recent activities dynamically from all active modules
  const recentActivities = useMemo(() => {
    const list: any[] = [];

    activeModules.forEach((mod) => {
      const data = dataMap[mod.id];
      if (!data) return;

      if (mod.id === "timesheets" && Array.isArray(data)) {
        data.slice(0, 4).forEach((item) => {
          list.push({
            id: `ts-${item.id}`,
            title: item.employeeName,
            subtext: item.taskDescription,
            timestamp: item.date,
            badgeText: item.status,
            badgeStyle:
              item.status === "Approved"
                ? "bg-emerald-50 text-emerald-700 border-emerald-150"
                : item.status === "Pending Approval"
                  ? "bg-amber-50 text-amber-700 border-amber-150"
                  : "bg-slate-50 text-slate-700 border-slate-150",
            route: "/timesheet",
          });
        });
      }

      if (mod.id === "project-planning" && data.tasks) {
        // Flatten list and get active items
        const getFlat = (nodes: any[]): any[] => {
          let flat: any[] = [];
          nodes.forEach((n) => {
            flat.push(n);
            if (n.children) flat = flat.concat(getFlat(n.children));
          });
          return flat;
        };

        const flatTasks = getFlat(data.tasks);
        flatTasks.slice(0, 3).forEach((item) => {
          list.push({
            id: `proj-${item.id}`,
            title: item.title,
            subtext: `Task progress updated to ${(item.percentComplete * 100).toFixed(0)}%`,
            timestamp: item.start ? new Date(item.start).toISOString().split("T")[0] : "",
            badgeText: `${(item.percentComplete * 100).toFixed(0)}% Done`,
            badgeStyle: "bg-blue-50 text-blue-700 border-blue-150",
            route: "/project-planning",
          });
        });
      }
    });

    return list.slice(0, 5); // Return top 5 dynamic actions
  }, [dataMap, activeModules]);

  return (
    <AppLayout>
      <ContentLayout title="Enterprise Dashboard" breadcrumbItems={["Core", "Dashboard"]}>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-10 h-10 border-4 border-green-700 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-semibold text-slate-500 animate-pulse">
              Loading metrics...
            </span>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Greeting */}
            <div className="rounded-2xl bg-gradient-to-r from-[#0B4F3A] via-[#126246] to-[#1D7A57] text-white p-6 md:p-8 shadow-md flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl md:text-2xl font-bold">Welcome back, Rajvi!</h2>
                <p className="text-green-100 text-sm mt-1.5 max-w-xl">
                  Here is a summary of the operations and status logs aggregated dynamically from your registered tenant workspaces.
                </p>
              </div>
              <div className="hidden sm:flex flex-shrink-0 items-center justify-center p-2.5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 shadow-inner">
                <img src="/api/logo" alt="KEY360 Platform Logo" className="w-12 h-12 object-contain" />
              </div>
            </div>

            {/* Dynamic Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {aggregatedKpis.map((kpi, index) => (
                <div key={index} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-200">
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        {kpi.label}
                      </span>
                      {kpi.icon && typeof kpi.icon === "object" ? (
                        <span className={`${kpi.color || "text-slate-500"}`}>
                          <SvgIcon icon={kpi.icon} size="medium" />
                        </span>
                      ) : kpi.icon ? (
                        <span className="text-lg">{kpi.icon}</span>
                      ) : null}
                    </div>
                    <h3 className={`text-3xl font-extrabold mt-2 ${kpi.color}`}>
                      {kpi.value}
                    </h3>
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium mt-4 flex items-center justify-between border-t border-slate-100 pt-2">
                    <span>Module: <strong>{kpi.moduleTitle}</strong></span>
                    <span>Live</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Dynamic Charts Trend Analysis */}
            {compiledCharts.map((chart) => (
              <div key={chart.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition-all duration-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">{chart.title}</h4>
                    <p className="text-xs text-slate-400">Dynamic trend data extracted from the {chart.moduleTitle} module registry.</p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-lg border border-slate-100">
                    <span className="text-[10px] bg-white shadow-sm border border-slate-100 text-green-700 font-bold px-2 py-1 rounded">
                      Registry Graph
                    </span>
                  </div>
                </div>
                <div className="h-64">
                  <Chart style={{ height: "100%" }}>
                    <ChartCategoryAxis>
                      <ChartCategoryAxisItem categories={chart.points.map((p: any) => p.category)} />
                    </ChartCategoryAxis>
                    <ChartValueAxis>
                      <ChartValueAxisItem title={{ text: "Aggregate Values" }} />
                    </ChartValueAxis>
                    <ChartSeries>
                      <ChartSeriesItem
                        type={chart.type as any}
                        data={chart.points.map((p: any) => p.value)}
                        color={chart.color}
                        opacity={0.15}
                        markers={{ visible: true, size: 6, border: { color: chart.color, width: 2 } }}
                        line={{ style: "smooth", width: 3 }}
                      />
                    </ChartSeries>
                    <ChartTooltip render={(props: any) => `${props?.value?.toFixed(1)}`} />
                  </Chart>
                </div>
              </div>
            ))}

            {/* Dashboard Content split layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Dynamic Recent Activity List */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 lg:col-span-2 hover:shadow-md transition-all duration-200">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-slate-900 text-base">Recent Activity Logs</h4>
                </div>
                <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto pr-1">
                  {recentActivities.map((item) => (
                    <div key={item.id} className="py-3 flex justify-between items-center text-sm">
                      <div className="space-y-1 pr-4">
                        <Link href={item.route} className="font-semibold text-slate-800 hover:text-green-700 hover:underline">
                          {item.title}
                        </Link>
                        <p className="text-slate-500 text-xs truncate max-w-sm md:max-w-md">
                          {item.subtext}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        <span className="text-xs text-slate-400 font-medium">{item.timestamp}</span>
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${item.badgeStyle}`}
                        >
                          {item.badgeText}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Navigation Cards */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-all duration-200">
                <div>
                  <h4 className="font-bold text-slate-900 text-base mb-3">Quick Navigation</h4>
                  <p className="text-slate-500 text-xs leading-relaxed mb-4">
                    Access the active modernized modules. The platform loads dynamic screens using compiled metadata blueprints.
                  </p>
                  <div className="space-y-2.5">
                    {ModuleRegistry.getAllModules().map((mod) => {
                      const route = ModuleRegistry.getRoute(mod.id);
                      const isLocked = route === "#";

                      return (
                        <div key={mod.id}>
                          {isLocked ? (
                            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50 text-sm font-semibold text-slate-400 cursor-not-allowed select-none">
                              <span>{mod.title}</span>
                              <span className="text-[10px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded">
                                Locked
                              </span>
                            </div>
                          ) : (
                            <Link
                              href={route}
                              className="flex items-center justify-between p-3 rounded-lg border border-slate-150 hover:border-green-300 hover:bg-green-50/20 transition-all text-sm font-semibold text-slate-800 hover:text-green-700 group cursor-pointer"
                            >
                              <span>{mod.title}</span>
                              <span className="text-slate-400 group-hover:text-green-600 transition-colors">
                                &rarr;
                              </span>
                            </Link>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 mt-6 pt-3 border-t border-slate-100">
                  Key360 Enterprise Metadata-Driven Platform Engine.
                </div>
              </div>
            </div>
          </div>
        )}
      </ContentLayout>
    </AppLayout>
  );
}
