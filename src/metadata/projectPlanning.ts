import { ModuleConfig } from "@/types/metadata";

export const projectPlanningModuleConfig: ModuleConfig = {
  id: "project-planning",
  title: "Project Planning (Gantt)",
  breadcrumbs: ["Project Management", "Project Planning (Gantt)"],
  viewType: "gantt",
  gridColumns: [
    { field: "id", title: "ID", width: 70 },
    { field: "title", title: "Task Title", width: 220 },
    { field: "start", title: "Start Date", width: 130, type: "date" },
    { field: "end", title: "End Date", width: 130, type: "date" },
    { field: "percentComplete", title: "% Done", width: 90, type: "number" },
  ],
  formFields: [
    {
      field: "title",
      label: "Task Name",
      type: "text",
      required: true,
      placeholder: "Enter task name",
    },
    {
      field: "start",
      label: "Start Date",
      type: "date",
      required: true,
    },
    {
      field: "end",
      label: "End Date",
      type: "date",
      required: true,
    },
    {
      field: "percentComplete",
      label: "Progress (0.0 to 1.0)",
      type: "number",
      required: true,
      defaultValue: 0.0,
      placeholder: "e.g., 0.5 for 50%",
    },
  ],
  toolbarButtons: [
    {
      id: "add",
      label: "Add Task",
      actionType: "add",
      themeColor: "primary",
    },
    {
      id: "refresh",
      label: "Refresh",
      actionType: "refresh",
    },
  ],
  ganttConfig: {
    taskModelFields: {
      id: "id",
      start: "start",
      end: "end",
      title: "title",
      percentComplete: "percentComplete",
      isRollup: "isRollup",
      isExpanded: "isExpanded",
      isInEdit: "isInEdit",
      children: "children",
    },
    dependencyModelFields: {
      id: "id",
      fromId: "fromId",
      toId: "toId",
      type: "type",
    },
  },
};

export const initialProjectTasks = [
  {
    id: 1,
    title: "Planning",
    start: new Date("2026-07-01T08:00:00.000Z"),
    end: new Date("2026-07-10T17:00:00.000Z"),
    percentComplete: 0.85,
    isExpanded: true,
    children: [
      {
        id: 2,
        title: "Requirements",
        start: new Date("2026-07-01T08:00:00.000Z"),
        end: new Date("2026-07-05T17:00:00.000Z"),
        percentComplete: 1.0,
      },
      {
        id: 3,
        title: "Design Approval",
        start: new Date("2026-07-06T08:00:00.000Z"),
        end: new Date("2026-07-10T17:00:00.000Z"),
        percentComplete: 0.7,
      },
    ],
  },
  {
    id: 4,
    title: "Procurement",
    start: new Date("2026-07-11T08:00:00.000Z"),
    end: new Date("2026-07-20T17:00:00.000Z"),
    percentComplete: 0.4,
    isExpanded: true,
    children: [
      {
        id: 5,
        title: "Vendor Selection",
        start: new Date("2026-07-11T08:00:00.000Z"),
        end: new Date("2026-07-15T17:00:00.000Z"),
        percentComplete: 0.9,
      },
      {
        id: 6,
        title: "Purchase Orders",
        start: new Date("2026-07-16T08:00:00.000Z"),
        end: new Date("2026-07-20T17:00:00.000Z"),
        percentComplete: 0.1,
      },
    ],
  },
  {
    id: 7,
    title: "Construction",
    start: new Date("2026-07-21T08:00:00.000Z"),
    end: new Date("2026-08-20T17:00:00.000Z"),
    percentComplete: 0.15,
    isExpanded: true,
    children: [
      {
        id: 8,
        title: "Foundation",
        start: new Date("2026-07-21T08:00:00.000Z"),
        end: new Date("2026-07-28T17:00:00.000Z"),
        percentComplete: 0.6,
      },
      {
        id: 9,
        title: "Structural Work",
        start: new Date("2026-07-29T08:00:00.000Z"),
        end: new Date("2026-08-10T17:00:00.000Z"),
        percentComplete: 0.05,
      },
      {
        id: 10,
        title: "Electrical Installation",
        start: new Date("2026-08-11T08:00:00.000Z"),
        end: new Date("2026-08-20T17:00:00.000Z"),
        percentComplete: 0.0,
      },
    ],
  },
  {
    id: 11,
    title: "Commissioning",
    start: new Date("2026-08-21T08:00:00.000Z"),
    end: new Date("2026-08-25T17:00:00.000Z"),
    percentComplete: 0.0,
  },
  {
    id: 12,
    title: "Handover",
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
