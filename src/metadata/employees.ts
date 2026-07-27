import { userIcon, checkCircleIcon, gearIcon, chartLineMarkersIcon } from "@progress/kendo-svg-icons";
import { resolveModuleConfig } from "./engine";

export const employeeModuleConfig = resolveModuleConfig({
  id: "employees",
  extends: "crud",
  title: "Employee Directory",
  breadcrumbs: ["Human Resources", "Employee Directory"],
  endpoint: "employees",
  performance: {
    virtualization: true,
    pageSize: 100,
    diagnostics: true,
    cache: true,
  },
  columnRefs: [
    "empId",
    "employeeName",
    "department",
    "designation",
    "manager",
    "status",
    "email",
    "phone",
    "joinDate",
    "salaryGrade",
    "location",
  ],
  fieldRefs: [
    "empId",
    "employeeName",
    "department",
    "designation",
    "manager",
    "status",
    "email",
    "phone",
    "joinDate",
    "salaryGrade",
    "location",
  ],
  kpis: [
    { label: "Total Workforce", type: "count", icon: userIcon },
    { label: "Active Personnel", type: "count", filter: { status: "Active" }, icon: checkCircleIcon, color: "text-emerald-600" },
    { label: "Engineering Staff", type: "count", filter: { department: "Engineering" }, icon: gearIcon, color: "text-blue-600" },
    { label: "On Leave / Inactive", type: "count", filter: { status: "On Leave" }, icon: chartLineMarkersIcon, color: "text-amber-600" },
  ],
});
