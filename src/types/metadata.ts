export type FieldType = "text" | "number" | "date" | "textarea" | "select" | "upload" | "editor" | "richtext";

export interface FormField {
  field: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  defaultValue?: any;
  options?: { label: string; value: any }[]; // Used for dropdowns
}

export interface GridColumn {
  field: string;
  title: string;
  width?: number;
  filter?: "text" | "numeric" | "boolean" | "date";
  sortable?: boolean;
  resizable?: boolean;
  reorderable?: boolean;
  format?: string; // date formats or currency formats
  type?: "text" | "number" | "date" | "badge" | "actions" | "pdf" | "editor" | "richtext";
}

export interface ToolbarButton {
  id: string;
  label: string;
  icon?: string;
  themeColor?: "primary" | "secondary" | "tertiary" | "info" | "success" | "warning" | "error" | "none";
  actionType: "add" | "refresh" | "delete" | "export" | "exportPdf" | "custom";
}

export type ModuleViewType = "grid" | "gantt" | "dashboard" | "calendar";

export interface ModuleConfig {
  id: string;
  title: string;
  breadcrumbs: string[];
  gridColumns: GridColumn[];
  formFields: FormField[];
  toolbarButtons: ToolbarButton[];
  viewType?: ModuleViewType;
  ganttConfig?: {
    taskModelFields: Record<string, string>;
    dependencyModelFields: Record<string, string>;
  };
  performance?: {
    virtualization?: boolean;
    pageSize?: number;
    diagnostics?: boolean;
    cache?: boolean;
  };
}
