import {
  ColumnPresets,
  FormPresets,
  ToolbarPresets,
  GanttPresets,
  PermissionPresets,
  ModuleTemplates,
} from "./presets";
import { MetadataCache } from "@/services/caching";

// Standard types mapping to match existing types or extend them
export interface ModuleConfig {
  id: string;
  title: string;
  breadcrumbs: string[];
  endpoint: string;
  extends?: string;
  views: string[];
  defaultView?: string;
  permissions?: any;
  columnRefs?: any[];
  fieldRefs?: any[];
  formLayout?: "standard" | "split-cards";
  formSections?: any[];
  formWidgets?: any[];
  toolbar?: any[];
  ganttConfig?: any;
  kpis?: any[];
  charts?: any[];
  // Compiled output fields
  gridColumns: any[];
  formFields: any[];
  toolbarButtons: any[];
}

// Resolution Helper
export function resolveModuleConfig(minimalConfig: any): ModuleConfig {
  const moduleId = minimalConfig.id;
  
  // 1. Check metadata cache
  const cached = MetadataCache.get(moduleId);
  if (cached) {
    return cached;
  }

  // 2. Load inherited template config (Composition / Inheritance)
  let baseConfig: any = {};
  if (minimalConfig.extends && (ModuleTemplates as any)[minimalConfig.extends]) {
    baseConfig = JSON.parse(JSON.stringify((ModuleTemplates as any)[minimalConfig.extends]));
  }

  // Merge minimalConfig on top of baseConfig
  const merged: any = {
    ...baseConfig,
    ...minimalConfig,
  };

  // Compile default view
  if (!merged.defaultView && merged.views && merged.views.length > 0) {
    merged.defaultView = merged.views[0];
  }

  // Compile Permissions
  let permissions = merged.permissions || "read-write";
  if (typeof permissions === "string") {
    permissions = (PermissionPresets as any)[permissions] || PermissionPresets["read-write"];
  }
  merged.permissions = permissions;

  // Compile Column Configuration with Presets and Conventions
  const columnRefs = merged.columnRefs || [];
  const compiledColumns = columnRefs.map((ref: any) => {
    let colObj: any = {};
    if (typeof ref === "string") {
      colObj = { field: ref, ...(ColumnPresets as any)[ref] };
    } else if (ref && typeof ref === "object") {
      colObj = {
        field: ref.field,
        ...((ColumnPresets as any)[ref.field] || {}),
        ...ref,
      };
    }

    // Apply Convention over Configuration for missing attributes
    const fieldName = colObj.field || "";
    if (!colObj.title) {
      // Inferred Title from camelCase fieldName
      colObj.title = fieldName
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str: string) => str.toUpperCase());
    }

    if (colObj.type === undefined) {
      if (fieldName.toLowerCase().includes("date")) {
        colObj.type = "date";
      } else if (fieldName.toLowerCase() === "status") {
        colObj.type = "badge";
      } else if (fieldName.startsWith("is") || fieldName.startsWith("Is")) {
        colObj.type = "boolean";
      } else if (fieldName.toLowerCase().includes("hours") || fieldName.toLowerCase().includes("percent") || fieldName === "id") {
        colObj.type = "number";
      } else {
        colObj.type = "text";
      }
    }

    if (colObj.filter === undefined) {
      if (colObj.type === "date") colObj.filter = "date";
      else if (colObj.type === "number") colObj.filter = "numeric";
      else if (colObj.type === "boolean") colObj.filter = "boolean";
      else colObj.filter = "text";
    }

    // Set stable default grid behaviors to avoid repeating them in metadata
    colObj.sortable = colObj.sortable ?? true;
    colObj.resizable = colObj.resizable ?? true;
    colObj.reorderable = colObj.reorderable ?? true;

    return colObj;
  });

  // Compile Form Fields Configuration with Presets and Conventions
  const fieldRefs = merged.fieldRefs || [];
  const compiledFields = fieldRefs.map((ref: any) => {
    let formObj: any = {};
    if (typeof ref === "string") {
      formObj = { field: ref, ...(FormPresets as any)[ref] };
    } else if (ref && typeof ref === "object") {
      formObj = {
        field: ref.field,
        ...((FormPresets as any)[ref.field] || {}),
        ...ref,
      };
    }

    // Apply Conventions
    const fieldName = formObj.field || "";
    if (!formObj.label) {
      formObj.label = fieldName
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str: string) => str.toUpperCase());
    }

    if (formObj.type === undefined) {
      if (fieldName.toLowerCase().includes("date")) {
        formObj.type = "date";
      } else if (fieldName.toLowerCase() === "status") {
        formObj.type = "select";
        formObj.options = FormPresets.status.options;
      } else if (fieldName.startsWith("is") || fieldName.startsWith("Is")) {
        formObj.type = "boolean";
      } else if (fieldName.toLowerCase().includes("hours") || fieldName.toLowerCase().includes("percent")) {
        formObj.type = "number";
      } else if (fieldName.toLowerCase().includes("description") || fieldName.toLowerCase().includes("comments") || fieldName.toLowerCase().includes("notes")) {
        formObj.type = "textarea";
      } else {
        formObj.type = "text";
      }
    }

    return formObj;
  });

  // Compile Toolbar Buttons
  const toolbarRefs = merged.toolbar || [];
  const compiledToolbar = toolbarRefs.map((ref: any) => {
    let buttonObj: any = {};
    if (typeof ref === "string") {
      buttonObj = { id: ref, ...(ToolbarPresets as any)[ref] };
    } else if (ref && typeof ref === "object") {
      buttonObj = {
        id: ref.id,
        ...((ToolbarPresets as any)[ref.id] || {}),
        ...ref,
      };
    }
    return buttonObj;
  });

  // Compile Gantt defaults
  if (merged.views.includes("gantt") && !merged.ganttConfig) {
    merged.ganttConfig = GanttPresets;
  }

  // Freeze final configuration for UI composition engine
  const compiled: ModuleConfig = {
    ...merged,
    gridColumns: compiledColumns,
    formFields: compiledFields,
    toolbarButtons: compiledToolbar,
  };

  Object.freeze(compiled);

  // Store in cache
  MetadataCache.set(moduleId, compiled);

  return compiled;
}
