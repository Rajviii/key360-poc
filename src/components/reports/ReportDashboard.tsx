"use client";

import React, { useRef } from "react";
import AppLayout from "@/components/layout/AppLayout";
import ContentLayout from "@/components/layout/ContentLayout";
import {
  Chart,
  ChartSeries,
  ChartSeriesItem,
  ChartCategoryAxis,
  ChartCategoryAxisItem,
  ChartTitle,
  ChartLegend,
  ChartTooltip,
} from "@progress/kendo-react-charts";
import { Grid, GridColumn as Column } from "@progress/kendo-react-grid";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import { savePDF } from "@progress/kendo-react-pdf";
import { Button } from "@progress/kendo-react-buttons";
import { fileExcelIcon, filePdfIcon, printIcon } from "@progress/kendo-svg-icons";
import { useNotification } from "@/context/NotificationContext";

// Mock Report Dataset
const reportData = [
  { id: 101, period: "Q1 2026", category: "Heavy Equipment", revenue: 145000, workOrders: 42, failureRate: 1.2, status: "Active" },
  { id: 102, period: "Q2 2026", category: "Turbine Systems", revenue: 210000, workOrders: 58, failureRate: 0.8, status: "Active" },
  { id: 103, period: "Q3 2026", category: "HVAC & Cooling", revenue: 180000, workOrders: 35, failureRate: 2.1, status: "Under Review" },
  { id: 104, period: "Q4 2026", category: "Piping & Valves", revenue: 295000, workOrders: 84, failureRate: 0.5, status: "Active" },
  { id: 105, period: "Q1 2027 (Est)", category: "Electrical Vaults", revenue: 320000, workOrders: 91, failureRate: 0.4, status: "Planned" },
];

const revenueTrend = [
  { month: "Jan", revenue: 45000 },
  { month: "Feb", revenue: 52000 },
  { month: "Mar", revenue: 48000 },
  { month: "Apr", revenue: 68000 },
  { month: "May", revenue: 74000 },
  { month: "Jun", revenue: 89000 },
];

const assetStatusDonut = [
  { category: "Active & Operational", share: 65, color: "#10b981" },
  { category: "Scheduled Maintenance", share: 20, color: "#f59e0b" },
  { category: "Critical Repair", share: 10, color: "#ef4444" },
  { category: "Decommissioned", share: 5, color: "#64748b" },
];

const workOrdersBar = [
  { dept: "Mechanical", count: 120 },
  { dept: "Electrical", count: 95 },
  { dept: "Civil / Facilities", count: 64 },
  { dept: "Instrumentation", count: 88 },
];

const failureRateArea = [
  { week: "W1", rate: 2.4 },
  { week: "W2", rate: 1.9 },
  { week: "W3", rate: 1.5 },
  { week: "W4", rate: 0.8 },
  { week: "W5", rate: 0.6 },
];

export default function ReportDashboard() {
  const { showSuccess } = useNotification();
  const excelExportRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleExportExcel = () => {
    if (excelExportRef.current) {
      excelExportRef.current.save();
      showSuccess("Excel report generated successfully.");
    }
  };

  const handleExportPdf = () => {
    if (containerRef.current) {
      savePDF(containerRef.current, {
        paperSize: "A4",
        margin: "1cm",
        fileName: `Key360_Enterprise_Report_${new Date().toISOString().split("T")[0]}.pdf`,
      });
      showSuccess("PDF report generated successfully.");
    }
  };

  return (
    <AppLayout>
      <ContentLayout title="Reports Dashboard" breadcrumbItems={["Reports", "Report Dashboard"]}>
        <div ref={containerRef} className="space-y-6">
          {/* Action Toolbar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Key360 Executive Report Suite</h3>
              <p className="text-xs text-slate-400">Integrated Financial & Maintenance Metrics</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                svgIcon={fileExcelIcon}
                themeColor="success"
                size="small"
                onClick={handleExportExcel}
                className="font-bold text-xs cursor-pointer"
              >
                Export Excel
              </Button>
              <Button
                svgIcon={filePdfIcon}
                themeColor="primary"
                size="small"
                onClick={handleExportPdf}
                className="font-bold text-xs cursor-pointer"
              >
                Export PDF
              </Button>
            </div>
          </div>

          {/* Charts Grid - 2x2 Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Revenue Trend Line Chart */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <Chart style={{ height: 260 }}>
                <ChartTitle text="Revenue Trend ($USD)" font="bold 14px sans-serif" color="#1e293b" />
                <ChartTooltip />
                <ChartCategoryAxis>
                  <ChartCategoryAxisItem categories={revenueTrend.map((d) => d.month)} />
                </ChartCategoryAxis>
                <ChartSeries>
                  <ChartSeriesItem
                    type="line"
                    data={revenueTrend.map((d) => d.revenue)}
                    color="#059669"
                    markers={{ visible: true, size: 6 }}
                  />
                </ChartSeries>
              </Chart>
            </div>

            {/* 2. Asset Status Donut Chart */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <Chart style={{ height: 260 }}>
                <ChartTitle text="Asset Operational Status" font="bold 14px sans-serif" color="#1e293b" />
                <ChartLegend position="right" />
                <ChartTooltip />
                <ChartSeries>
                  <ChartSeriesItem
                    type="donut"
                    data={assetStatusDonut}
                    categoryField="category"
                    field="share"
                  />
                </ChartSeries>
              </Chart>
            </div>

            {/* 3. Work Orders Bar Chart */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <Chart style={{ height: 260 }}>
                <ChartTitle text="Work Orders by Department" font="bold 14px sans-serif" color="#1e293b" />
                <ChartTooltip />
                <ChartCategoryAxis>
                  <ChartCategoryAxisItem categories={workOrdersBar.map((d) => d.dept)} />
                </ChartCategoryAxis>
                <ChartSeries>
                  <ChartSeriesItem
                    type="column"
                    data={workOrdersBar.map((d) => d.count)}
                    color="#3b82f6"
                  />
                </ChartSeries>
              </Chart>
            </div>

            {/* 4. Failure Rate Area Chart */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <Chart style={{ height: 260 }}>
                <ChartTitle text="Equipment Failure Rate (%)" font="bold 14px sans-serif" color="#1e293b" />
                <ChartTooltip />
                <ChartCategoryAxis>
                  <ChartCategoryAxisItem categories={failureRateArea.map((d) => d.week)} />
                </ChartCategoryAxis>
                <ChartSeries>
                  <ChartSeriesItem
                    type="area"
                    data={failureRateArea.map((d) => d.rate)}
                    color="#8b5cf6"
                  />
                </ChartSeries>
              </Chart>
            </div>
          </div>

          {/* Detailed Report Table Grid & Excel Export */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-4 space-y-3">
            <h4 className="text-sm font-bold text-slate-800">Quarterly Asset & Financial Breakdown</h4>

            <ExcelExport data={reportData} ref={excelExportRef} fileName="Key360_Quarterly_Report.xlsx">
              <Grid data={reportData} style={{ height: 280 }}>
                <Column field="id" title="Report ID" width={100} />
                <Column field="period" title="Period" width={120} />
                <Column field="category" title="Category" width={180} />
                <Column
                  field="revenue"
                  title="Revenue ($)"
                  width={140}
                  cells={{
                    data: (props) => (
                      <td className="px-4 py-2 text-right font-semibold text-emerald-700">
                        ${props.dataItem.revenue.toLocaleString()}
                      </td>
                    ),
                  }}
                />
                <Column field="workOrders" title="Work Orders" width={120} />
                <Column
                  field="failureRate"
                  title="Failure Rate"
                  width={130}
                  cells={{
                    data: (props) => (
                      <td className="px-4 py-2 text-purple-700 font-bold">
                        {props.dataItem.failureRate}%
                      </td>
                    ),
                  }}
                />
                <Column field="status" title="Status" width={140} />
              </Grid>
            </ExcelExport>
          </div>
        </div>
      </ContentLayout>
    </AppLayout>
  );
}
