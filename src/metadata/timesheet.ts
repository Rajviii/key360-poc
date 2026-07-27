import { resolveModuleConfig } from "./engine";

export const timesheetModuleConfig = resolveModuleConfig({
  id: "timesheets",
  extends: "approval",
  title: "Timesheets",
  breadcrumbs: ["Human Resources", "Timesheets"],
  endpoint: "timesheets",
  columnRefs: [
    "employeeName",
    "date",
    "projectCode",
    "hours",
    "status",
    "taskDescription"
  ],
  fieldRefs: [
    "employeeName",
    "date",
    "projectCode",
    "hours",
    "status",
    "taskDescription",
    "comments"
  ],
  kpis: [
    { label: "Total Hours Logged", type: "sum", field: "hours", suffix: " hrs", icon: "🕒" },
    { label: "Pending Approvals", type: "count", filter: { status: "Pending Approval" }, icon: "⏳", color: "text-amber-600" },
    { label: "Approved Records", type: "count", filter: { status: "Approved" }, icon: "✅", color: "text-emerald-600" },
    { label: "Total Submissions", type: "count", icon: "📊", color: "text-blue-600" },
  ],
  charts: [
    {
      id: "hours-trend",
      title: "Hours Logged Trend",
      type: "area",
      seriesField: "hours",
      categoryField: "date",
      color: "#0b6b0b",
    }
  ]
});