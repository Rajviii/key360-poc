import { ModuleConfig } from "@/metadata/engine";
import { ViewerOptions, EditorOptions } from "../types";

export interface AgreementModuleConfig extends ModuleConfig {
  viewerOptions: ViewerOptions;
  editorOptions: EditorOptions;
}

export const agreementModuleConfig: AgreementModuleConfig = {
  id: "agreements",
  extends: "base",
  title: "Agreement Documents",
  moduleName: "Agreement Documents",
  breadcrumbs: ["Document Management", "Agreement Documents"],
  endpoint: "/api/agreements",
  dataItemKey: "id",
  columnRefs: ["id", "title", "vendor", "status", "createdDate"],
  fieldRefs: ["title", "vendor", "status", "createdDate"],
  gridColumns: [
    { field: "id", title: "Agreement ID", width: 140 },
    { field: "title", title: "Title", width: 260 },
    { field: "vendor", title: "Vendor", width: 220 },
    { field: "status", title: "Status", width: 130 },
    { field: "createdDate", title: "Created Date", width: 160 },
  ],
  toolbarButtons: [
    { id: "add", label: "New Agreement", actionType: "add", primary: true },
    { id: "refresh", label: "Refresh", actionType: "refresh" },
    { id: "export", label: "Export Excel", actionType: "export" },
  ],
  permissions: {
    read: true,
    create: true,
    update: true,
    delete: true,
  },
  viewerOptions: {
    zoom: true,
    rotate: true,
    search: true,
    download: true,
    print: true,
    signature: true,
    annotations: true,
    highlight: true,
    comments: true,
    export: true,
  },
  editorOptions: {
    enableSign: true,
    enableText: true,
    enableHighlight: true,
    enableComments: true,
    enableSave: true,
    enableExport: true,
  },
  formFields: [
    { field: "title", name: "title", label: "Agreement Title", type: "text", required: true },
    { field: "vendor", name: "vendor", label: "Vendor Name", type: "text", required: true },
    {
      field: "status",
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { label: "Draft", value: "Draft" },
        { label: "Pending Sign", value: "Pending Sign" },
        { label: "Fully Executed", value: "Fully Executed" },
        { label: "Archived", value: "Archived" },
      ],
    },
    { field: "createdDate", name: "createdDate", label: "Created Date", type: "date" },
  ],
};
