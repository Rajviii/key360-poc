"use client";

import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import ContentLayout from "@/components/layout/ContentLayout";
import { timesheetService } from "@/services/timesheetService";
import { Timesheet } from "@/types/timesheet";
import Link from "next/link";
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

export default function Dashboard() {
  const [data, setData] = useState<Timesheet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const records = await timesheetService.getAll();
        setData(records);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Compute metrics dynamically from the mock data
  const metrics = React.useMemo(() => {
    const totalHours = data.reduce((sum, item) => sum + item.hours, 0);
    const pendingCount = data.filter((item) => item.status === "Pending Approval").length;
    const draftCount = data.filter((item) => item.status === "Draft").length;

    // Unique employees
    const employees = new Set(data.map((item) => item.employeeName));
    const activeEmployees = employees.size;

    return {
      totalHours,
      pendingCount,
      draftCount,
      activeEmployees,
    };
  }, [data]);

  // Group and compute chart trend data
  const chartData = React.useMemo(() => {
    const dailyMap: Record<string, number> = {};

    // Seed standard range of dates to make a beautiful smooth line chart
    const days = ["2026-07-18", "2026-07-19", "2026-07-20", "2026-07-21", "2026-07-22", "2026-07-23", "2026-07-24"];
    days.forEach(d => { dailyMap[d] = 0; });

    data.forEach((item) => {
      const dateStr = item.date;
      if (dateStr) {
        dailyMap[dateStr] = (dailyMap[dateStr] || 0) + (Number(item.hours) || 0);
      }
    });

    const sortedDates = Object.keys(dailyMap).sort();
    return sortedDates.map((date) => {
      const formattedDate = new Date(date).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
      return {
        date: formattedDate,
        hours: dailyMap[date],
      };
    });
  }, [data]);

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
            <div className="bg-gradient-to-r from-green-800 to-green-750 text-white rounded-2xl p-6 md:p-8 shadow-md">
              <h2 className="text-xl md:text-2xl font-bold">Welcome back, Rajvi!</h2>
              <p className="text-green-100 text-sm mt-1.5 max-w-xl">
                Here is a summary of the operations and timesheet submissions across your current tenant workspaces.
              </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Stat 1 */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Total Hours Logged
                  </span>
                  <h3 className="text-3xl font-extrabold text-slate-900 mt-2">
                    {metrics.totalHours.toFixed(1)} hrs
                  </h3>
                </div>
                <div className="text-xs text-green-600 font-medium mt-4 flex items-center gap-1">
                  <span>&bull;</span> Updated in real-time
                </div>
              </div>

              {/* Stat 2 */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Pending Approvals
                  </span>
                  <h3 className="text-3xl font-extrabold text-amber-600 mt-2">
                    {metrics.pendingCount}
                  </h3>
                </div>
                <div className="text-xs text-slate-500 font-medium mt-4">
                  Awaiting manager action
                </div>
              </div>

              {/* Stat 3 */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Draft Submissions
                  </span>
                  <h3 className="text-3xl font-extrabold text-blue-600 mt-2">
                    {metrics.draftCount}
                  </h3>
                </div>
                <div className="text-xs text-slate-500 font-medium mt-4">
                  In progress by employees
                </div>
              </div>

              {/* Stat 4 */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Active Collaborators
                  </span>
                  <h3 className="text-3xl font-extrabold text-slate-900 mt-2">
                    {metrics.activeEmployees}
                  </h3>
                </div>
                <div className="text-xs text-slate-500 font-medium mt-4">
                  Across DIW001 workspaces
                </div>
              </div>
            </div>

            {/* Premium Chart Trend Analysis */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-slate-900 text-base">Hours Logged Trend</h4>
                  <p className="text-xs text-slate-400">Daily aggregate of operational hours recorded across your workspaces</p>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-lg border border-slate-100">
                  <span className="text-[10px] bg-white shadow-sm border border-slate-100 text-green-700 font-bold px-2 py-1 rounded">
                    Trend Analysis
                  </span>
                </div>
              </div>
              <div className="h-64">
                <Chart style={{ height: "100%" }}>
                  <ChartCategoryAxis>
                    <ChartCategoryAxisItem categories={chartData.map((d) => d.date)} />
                  </ChartCategoryAxis>
                  <ChartValueAxis>
                    <ChartValueAxisItem title={{ text: "Hours" }} />
                  </ChartValueAxis>
                  <ChartSeries>
                    <ChartSeriesItem
                      type="area"
                      data={chartData.map((d: { hours: number; date: string }) => d.hours)}
                      color="#0b6b0b"
                      opacity={0.15}
                      markers={{ visible: true, size: 6, border: { color: "#0b6b0b", width: 2 } }}
                      line={{ style: "smooth", width: 3 }}
                    />
                  </ChartSeries>
                  <ChartTooltip render={(props: any) => `${props?.value?.toFixed(1)} hours`} />
                </Chart>
              </div>
            </div>

            {/* Dashboard Content split layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Activity List */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 lg:col-span-2">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-slate-900 text-base">Recent Activity Logs</h4>
                  <Link
                    href="/timesheet"
                    className="text-xs font-semibold text-green-700 hover:text-green-900 hover:underline"
                  >
                    View All Timesheets &rarr;
                  </Link>
                </div>
                <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto pr-1">
                  {data.slice(0, 4).map((item) => (
                    <div key={item.id} className="py-3 flex justify-between items-center text-sm">
                      <div className="space-y-1 pr-4">
                        <p className="font-semibold text-slate-800">{item.employeeName}</p>
                        <p className="text-slate-500 text-xs truncate max-w-sm md:max-w-md">
                          {item.taskDescription}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        <span className="text-xs text-slate-400 font-medium">{item.date}</span>
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${item.status === "Approved"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-150"
                            : item.status === "Pending Approval"
                              ? "bg-amber-50 text-amber-700 border-amber-150"
                              : "bg-slate-50 text-slate-700 border-slate-150"
                            }`}
                        >
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Navigation Cards */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-base mb-3">Quick Navigation</h4>
                  <p className="text-slate-500 text-xs leading-relaxed mb-4">
                    Access the interactive modernized modules. The POC highlights modular structure where each section inherits generic schemas.
                  </p>
                  <div className="space-y-2.5">
                    <Link
                      href="/timesheet"
                      className="flex items-center justify-between p-3 rounded-lg border border-slate-150 hover:border-green-300 hover:bg-green-50/20 transition-all text-sm font-semibold text-slate-800 hover:text-green-700 group cursor-pointer"
                    >
                      <span>Timesheets Module</span>
                      <span className="text-slate-400 group-hover:text-green-600 transition-colors">
                        &rarr;
                      </span>
                    </Link>
                    <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50 text-sm font-semibold text-slate-400 cursor-not-allowed select-none">
                      <span>Assets (Future)</span>
                      <span className="text-[10px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded">
                        Locked
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50 text-sm font-semibold text-slate-400 cursor-not-allowed select-none">
                      <span>Vendors (Future)</span>
                      <span className="text-[10px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded">
                        Locked
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 mt-6 pt-3 border-t border-slate-100">
                  Key360 modernized interface developed with React & KendoReact.
                </div>
              </div>
            </div>
          </div>
        )}
      </ContentLayout>
    </AppLayout>
  );
}
