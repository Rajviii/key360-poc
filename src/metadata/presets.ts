export const ColumnPresets = {
  id: { field: "id", title: "ID", width: 70, type: "number", filter: "numeric" },
  employeeName: { field: "employeeName", title: "Employee Name", width: 200, type: "text", filter: "text" },
  date: { field: "date", title: "Date", width: 150, type: "date", filter: "date" },
  projectCode: { field: "projectCode", title: "Project", width: 140, type: "text", filter: "text" },
  hours: { field: "hours", title: "Hours Worked", width: 140, type: "number", filter: "numeric" },
  status: { field: "status", title: "Approval Status", width: 160, type: "badge", filter: "text" },
  taskDescription: { field: "taskDescription", title: "Task Description", type: "editor", filter: "text" },
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
  documentPdf: { field: "documentPdf", title: "Document", width: 140, type: "pdf", filter: "text" },
  empId: { field: "empId", title: "Employee ID", width: 130, type: "text", filter: "text" },
  department: { field: "department", title: "Department", width: 170, type: "text", filter: "text" },
  designation: { field: "designation", title: "Designation", width: 190, type: "text", filter: "text" },
  manager: { field: "manager", title: "Reporting Manager", width: 160, type: "text", filter: "text" },
  email: { field: "email", title: "Email Address", width: 220, type: "text", filter: "text" },
  phone: { field: "phone", title: "Phone Number", width: 140, type: "text", filter: "text" },
  joinDate: { field: "joinDate", title: "Join Date", width: 130, type: "date", filter: "date" },
  salaryGrade: { field: "salaryGrade", title: "Salary Grade", width: 120, type: "text", filter: "text" },
  location: { field: "location", title: "Work Location", width: 160, type: "text", filter: "text" },
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
  taskDescription: { field: "taskDescription", label: "Activity Description", type: "editor", required: true, placeholder: "Describe the tasks completed..." },
  comments: { field: "comments", label: "Manager Notes / Comments", type: "textarea", required: false, placeholder: "Optional notes..." },
  title: { field: "title", label: "Task Name", type: "text", required: true, placeholder: "Enter task name" },
  parentId: {
    field: "parentId",
    label: "Parent Task / Phase",
    type: "select",
    required: false,
    options: [
      { label: "-- Top-Level Task / Phase --", value: "" },
      { label: "Planning", value: 1 },
      { label: "Procurement", value: 4 },
      { label: "Construction", value: 7 },
      { label: "Commissioning", value: 11 },
      { label: "Handover", value: 12 },
    ],
    defaultValue: "",
  },
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
  documentPdf: { field: "documentPdf", label: "Upload Document (PDF)", type: "upload", placeholder: "Choose PDF document" },
  empId: { field: "empId", label: "Employee ID", type: "text", required: true, placeholder: "e.g. EMP-100001" },
  department: {
    field: "department",
    label: "Department",
    type: "select",
    required: true,
    options: [
      { label: "Engineering", value: "Engineering" },
      { label: "Product Management", value: "Product Management" },
      { label: "Human Resources", value: "Human Resources" },
      { label: "Finance & Accounting", value: "Finance & Accounting" },
      { label: "Sales & Marketing", value: "Sales & Marketing" },
      { label: "Operations & Logistics", value: "Operations & Logistics" },
      { label: "Legal & Compliance", value: "Legal & Compliance" },
      { label: "Customer Success", value: "Customer Success" },
    ],
    defaultValue: "Engineering",
  },
  designation: { field: "designation", label: "Designation", type: "text", required: true, placeholder: "e.g. Senior Software Engineer" },
  manager: { field: "manager", label: "Reporting Manager", type: "text", required: true, placeholder: "e.g. Yash Viradia" },
  email: { field: "email", label: "Email Address", type: "text", required: true, placeholder: "e.g. john.doe@key360.com" },
  phone: { field: "phone", label: "Phone Number", type: "text", required: false, placeholder: "e.g. +1-555-0192" },
  joinDate: { field: "joinDate", label: "Join Date", type: "date", required: true },
  salaryGrade: {
    field: "salaryGrade",
    label: "Salary Grade",
    type: "select",
    options: [
      { label: "E-1 (Junior Specialist)", value: "E-1" },
      { label: "E-2 (Specialist)", value: "E-2" },
      { label: "E-3 (Senior Specialist)", value: "E-3" },
      { label: "M-1 (Manager)", value: "M-1" },
      { label: "M-2 (Senior Manager)", value: "M-2" },
      { label: "D-1 (Director)", value: "D-1" },
      { label: "VP-1 (Vice President)", value: "VP-1" },
    ],
    defaultValue: "E-3",
  },
  location: { field: "location", label: "Location", type: "text", required: true, placeholder: "e.g. New York, USA" },
};

export const ToolbarPresets = {
  add: { id: "add", label: "Add Record", themeColor: "primary", actionType: "add" },
  refresh: { id: "refresh", label: "Refresh", themeColor: "none", actionType: "refresh" },
  delete: { id: "delete", label: "Delete", themeColor: "error", actionType: "delete" },
  export: { id: "export", label: "Export to Excel", themeColor: "success", actionType: "export" },
  exportPdf: { id: "exportPdf", label: "Export PDF", themeColor: "tertiary", actionType: "exportPdf" },
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
    toolbar: ["refresh", "exportPdf"],
  },
  crud: {
    views: ["grid"],
    permissions: "read-write",
    toolbar: ["add", "refresh", "delete", "export", "exportPdf"],
  },
  approval: {
    views: ["grid", "dashboard"],
    permissions: "read-write",
    toolbar: ["add", "refresh", "delete", "export", "exportPdf"],
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
