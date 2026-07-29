import { checkCircleIcon, chartLineMarkersIcon, clipboardTextIcon, gearIcon } from "@progress/kendo-svg-icons";
import { resolveModuleConfig } from "./engine";

export const projectPlanningModuleConfig = resolveModuleConfig({
  id: "project-planning",
  extends: "gantt",
  title: "Project Planning (Gantt)",
  breadcrumbs: ["Project Management", "Project Planning (Gantt)"],
  endpoint: "project-planning",
  columnRefs: ["id", "title", "start", "end", "percentComplete"],
  fieldRefs: ["title", "parentId", "start", "end", "percentComplete"],
  kpis: [
    { label: "Total Tasks", type: "count-tree", icon: clipboardTextIcon },
    { label: "Average Progress", type: "average-tree", field: "percentComplete", format: "percent", icon: chartLineMarkersIcon, color: "text-blue-600" },
    { label: "Completed Tasks", type: "count-tree", filter: { percentComplete: { gte: 1.0 } }, icon: checkCircleIcon, color: "text-emerald-600" },
    { label: "In Progress Tasks", type: "count-tree", filter: { percentComplete: { gt: 0, lt: 1.0 } }, icon: gearIcon, color: "text-amber-600" },
  ]
});

export const initialProjectTasks = [
  {
    id: 1,
    title: "Planning",
    parentId: "",
    start: new Date("2026-07-01T08:00:00.000Z"),
    end: new Date("2026-07-10T17:00:00.000Z"),
    percentComplete: 0.85,
    isExpanded: true,
    children: [
      {
        id: 2,
        title: "Requirements",
        parentId: 1,
        start: new Date("2026-07-02T08:00:00.000Z"),
        end: new Date("2026-07-05T17:00:00.000Z"),
        percentComplete: 1.0,
      },
      {
        id: 3,
        title: "Design Approval",
        parentId: 1,
        start: new Date("2026-07-06T08:00:00.000Z"),
        end: new Date("2026-07-10T17:00:00.000Z"),
        percentComplete: 0.7,
      },
    ],
  },
  {
    id: 4,
    title: "Procurement",
    parentId: "",
    start: new Date("2026-07-11T08:00:00.000Z"),
    end: new Date("2026-07-20T17:00:00.000Z"),
    percentComplete: 0.4,
    isExpanded: true,
    children: [
      {
        id: 5,
        title: "Vendor Selection",
        parentId: 4,
        start: new Date("2026-07-11T08:00:00.000Z"),
        end: new Date("2026-07-15T17:00:00.000Z"),
        percentComplete: 0.9,
      },
      {
        id: 6,
        title: "Purchase Orders",
        parentId: 4,
        start: new Date("2026-07-16T08:00:00.000Z"),
        end: new Date("2026-07-20T17:00:00.000Z"),
        percentComplete: 0.1,
      },
    ],
  },
  {
    id: 7,
    title: "Construction",
    parentId: "",
    start: new Date("2026-07-21T08:00:00.000Z"),
    end: new Date("2026-08-20T17:00:00.000Z"),
    percentComplete: 0.15,
    isExpanded: true,
    children: [
      {
        id: 8,
        title: "Foundation",
        parentId: 7,
        start: new Date("2026-07-21T08:00:00.000Z"),
        end: new Date("2026-07-28T17:00:00.000Z"),
        percentComplete: 0.6,
      },
      {
        id: 9,
        title: "Structural Work",
        parentId: 7,
        start: new Date("2026-07-29T08:00:00.000Z"),
        end: new Date("2026-08-10T17:00:00.000Z"),
        percentComplete: 0.05,
      },
      {
        id: 10,
        title: "Electrical Installation",
        parentId: 7,
        start: new Date("2026-08-11T08:00:00.000Z"),
        end: new Date("2026-08-20T17:00:00.000Z"),
        percentComplete: 0.0,
      },
    ],
  },
  {
    id: 11,
    title: "Commissioning",
    parentId: "",
    start: new Date("2026-08-21T08:00:00.000Z"),
    end: new Date("2026-08-25T17:00:00.000Z"),
    percentComplete: 0.0,
  },
  {
    id: 12,
    title: "Handover",
    parentId: "",
    start: new Date("2026-08-26T08:00:00.000Z"),
    end: new Date("2026-08-28T17:00:00.000Z"),
    percentComplete: 0.0,
  },
];

export const initialProjectDependencies = [
  { id: 1, fromId: 2, toId: 3, type: 1 },
  { id: 2, fromId: 3, toId: 5, type: 1 },
  { id: 3, fromId: 5, toId: 6, type: 1 },
  { id: 4, fromId: 6, toId: 8, type: 1 },
  { id: 5, fromId: 8, toId: 9, type: 1 },
  { id: 6, fromId: 9, toId: 10, type: 1 },
  { id: 7, fromId: 10, toId: 11, type: 1 },
  { id: 8, fromId: 11, toId: 12, type: 1 },
];
