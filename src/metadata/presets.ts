export const ColumnPresets = {
  id: { field: "id", title: "ID", width: 70, type: "number", filter: "numeric" },
  employeeName: { field: "employeeName", title: "Employee Name", width: 200, type: "text", filter: "text" },
  date: { field: "date", title: "Date", width: 150, type: "date", filter: "date" },
  projectCode: { field: "projectCode", title: "Project", width: 140, type: "text", filter: "text" },
  hours: { field: "hours", title: "Hours Worked", width: 140, type: "number", filter: "numeric" },
  status: { field: "status", title: "Approval Status", width: 160, type: "badge", filter: "text" },
  taskDescription: { field: "taskDescription", title: "Task Description", type: "text", filter: "text" },
  comments: { field: "comments", title: "Manager Comments", type: "text", filter: "text" },
  title: { field: "title", title: "Task Title", width: 220, type: "text", filter: "text" },
  start: { field: "start", title: "Start Date", width: 130, type: "date", filter: "date" },
  end: { field: "end", title: "End Date", width: 130, type: "date", filter: "date" },
  percentComplete: { field: "percentComplete", title: "% Done", width: 90, type: "number", filter: "numeric" },
  physicalItemId: { field: "physicalItemId", title: "Physical Item ID", width: 140, type: "text", filter: "text" },
  copyChildItemsFrom: { field: "copyChildItemsFrom", title: "Copy Child Items From", width: 180, type: "text", filter: "text" },
  commodity: { field: "commodity", title: "Commodity", width: 120, type: "text", filter: "text" },
  customId: { field: "customId", title: "Custom ID", width: 120, type: "text", filter: "text" },
  name: { field: "name", title: "Name", width: 160, type: "text", filter: "text" },
  serialNo: { field: "serialNo", title: "Serial No", width: 120, type: "text", filter: "text" },
  totalStock: { field: "totalStock", title: "Total Stock", width: 110, type: "number", filter: "numeric" },
  batchNo: { field: "batchNo", title: "Batch No", width: 110, type: "text", filter: "text" },
  revision: { field: "revision", title: "Revision", width: 100, type: "text", filter: "text" },
  version: { field: "version", title: "Version", width: 100, type: "text", filter: "text" },
  type: { field: "type", title: "Type", width: 110, type: "text", filter: "text" },
  class: { field: "class", title: "Class", width: 110, type: "text", filter: "text" },
  category: { field: "category", title: "Category", width: 125, type: "text", filter: "text" },
  software: { field: "software", title: "Software", width: 120, type: "text", filter: "text" },
  lastStatusComment: { field: "lastStatusComment", title: "Last Status Comment", width: 200, type: "text", filter: "text" },
  nextDueDate: { field: "nextDueDate", title: "Next Due Date", width: 145, type: "date", filter: "date" },
  nextResponsiblePerson: { field: "nextResponsiblePerson", title: "Next Responsible Per:", width: 180, type: "text", filter: "text" },
  statusHistory: { field: "statusHistory", title: "Status History", width: 180, type: "text", filter: "text" },
};

export const FormPresets = {
  employeeName: { field: "employeeName", label: "Employee Name", type: "text", required: true, placeholder: "Enter full name" },
  date: { field: "date", label: "Work Date", type: "date", required: true },
  projectCode: {
    field: "projectCode",
    label: "Project Allocation",
    type: "select",
    required: true,
    options: [
      { label: "DIW001 - Training / Demo Work", value: "DIW001" },
      { label: "PRJ-902 - Core UI Refactoring", value: "PRJ-902" },
      { label: "PRJ-504 - Backend Cloud Caching", value: "PRJ-504" },
      { label: "OPS-100 - General Admin Operations", value: "OPS-100" },
    ],
    defaultValue: "DIW001",
  },
  hours: { field: "hours", label: "Hours Worked", type: "number", required: true, placeholder: "e.g. 8.0", defaultValue: 8.0 },
  status: {
    field: "status",
    label: "Status",
    type: "select",
    required: true,
    options: [
      { label: "Draft", value: "Draft" },
      { label: "Pending Approval", value: "Pending Approval" },
      { label: "Approved", value: "Approved" },
      { label: "Rejected", value: "Rejected" },
    ],
    defaultValue: "Draft",
  },
  taskDescription: { field: "taskDescription", label: "Activity Description", type: "textarea", required: true, placeholder: "Describe the tasks completed..." },
  comments: { field: "comments", label: "Manager Notes / Comments", type: "textarea", required: false, placeholder: "Optional notes..." },
  title: { field: "title", label: "Task Name", type: "text", required: true, placeholder: "Enter task name" },
  start: { field: "start", label: "Start Date", type: "date", required: true },
  end: { field: "end", label: "End Date", type: "date", required: true },
  percentComplete: { field: "percentComplete", label: "Progress (0.0 to 1.0)", type: "number", required: true, defaultValue: 0.0, placeholder: "e.g., 0.5 for 50%" },
  physicalItemId: { field: "physicalItemId", label: "Physical Item ID", type: "text", required: true, placeholder: "e.g. PI-001" },
  copyChildItemsFrom: { field: "copyChildItemsFrom", label: "Copy Child Items From", type: "text", placeholder: "e.g. PI-100" },
  commodity: { field: "commodity", label: "Commodity", type: "text", placeholder: "Enter commodity" },
  customId: { field: "customId", label: "Custom ID", type: "text", placeholder: "Enter custom ID" },
  name: { field: "name", label: "Name", type: "text", required: true, placeholder: "Enter item name" },
  serialNo: { field: "serialNo", label: "Serial No", type: "text", placeholder: "Enter serial number" },
  totalStock: { field: "totalStock", label: "Total Stock", type: "number", defaultValue: 0, placeholder: "Enter stock count" },
  batchNo: { field: "batchNo", label: "Batch No", type: "text", placeholder: "Enter batch number" },
  revision: { field: "revision", label: "Revision", type: "text", placeholder: "Enter revision" },
  version: { field: "version", label: "Version", type: "text", placeholder: "Enter version" },
  type: { field: "type", label: "Type", type: "text", placeholder: "Enter type" },
  class: { field: "class", label: "Class", type: "text", placeholder: "Enter class" },
  category: { field: "category", label: "Category", type: "text", placeholder: "Enter category" },
  software: { field: "software", label: "Software", type: "text", placeholder: "Enter software" },
  lastStatusComment: { field: "lastStatusComment", label: "Last Status Comment", type: "textarea", placeholder: "Enter status comment" },
  nextDueDate: { field: "nextDueDate", label: "Next Due Date", type: "date" },
  nextResponsiblePerson: { field: "nextResponsiblePerson", label: "Next Responsible Person", type: "text", placeholder: "Enter responsible person name" },
  statusHistory: { field: "statusHistory", label: "Status History", type: "textarea", placeholder: "Audit log of status updates..." },
};

export const ToolbarPresets = {
  add: { id: "add", label: "Add Record", themeColor: "primary", actionType: "add" },
  refresh: { id: "refresh", label: "Refresh", themeColor: "none", actionType: "refresh" },
  delete: { id: "delete", label: "Delete", themeColor: "error", actionType: "delete" },
  export: { id: "export", label: "Export to Excel", themeColor: "success", actionType: "export" },
};

export const GanttPresets = {
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
};

export const PermissionPresets = {
  "read-write": { read: true, create: true, update: true, delete: true },
  "read-only": { read: true, create: false, update: false, delete: false },
  "admin": { read: true, create: true, update: true, delete: true, adminOnly: true },
};

export const ThemePresets = {
  statusColors: {
    "Approved": { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-150", hex: "#059669" },
    "Pending Approval": { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-150", hex: "#D97706" },
    "Draft": { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-150", hex: "#2563EB" },
    "Rejected": { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-150", hex: "#DC2626" },
  } as Record<string, { bg: string; text: string; border: string; hex: string }>
};

export const ModuleTemplates = {
  base: {
    views: ["grid"],
    permissions: "read-write",
    toolbar: ["refresh"],
  },
  crud: {
    views: ["grid"],
    permissions: "read-write",
    toolbar: ["add", "refresh", "delete", "export"],
  },
  approval: {
    views: ["grid", "dashboard"],
    permissions: "read-write",
    toolbar: ["add", "refresh", "delete", "export"],
    formLayout: "split-cards",
    formSections: [
      {
        title: "Timesheet Detail",
        fields: ["employeeName", "date", "hours", "projectCode", "status"]
      },
      {
        title: "Activity and Comments",
        fields: ["taskDescription", "comments"]
      }
    ],
    formWidgets: [
      { type: "status-notification", field: "status" },
      { type: "workflow-stepper", field: "status", steps: ["Draft", "Pending Approval", "Approved", "Finance Check", "Paid"] },
      { type: "history-log", field: "status", auditField: "statusHistory" }
    ]
  },
  gantt: {
    views: ["gantt", "grid"],
    permissions: "read-write",
    toolbar: ["add", "refresh"],
    ganttConfig: GanttPresets,
  }
};
