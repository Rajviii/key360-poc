import { ModuleConfig } from "@/metadata/engine";
import { ViewerOptions, FormOptions } from "../types";

export interface PDFFormModuleConfig extends ModuleConfig {
  viewerOptions: ViewerOptions;
  formOptions: FormOptions;
}

export const pdfFormsModuleConfig: PDFFormModuleConfig = {
  id: "pdf-forms",
  extends: "base",
  title: "PDF Forms",
  moduleName: "PDF Forms",
  breadcrumbs: ["Document Management", "PDF Forms"],
  endpoint: "/api/pdf-forms",
  dataItemKey: "id",
  columnRefs: ["id", "title", "department", "status"],
  fieldRefs: ["title", "department", "status"],
  gridColumns: [
    { field: "id", title: "Form ID", width: 140 },
    { field: "title", title: "Form Name", width: 280 },
    { field: "department", title: "Department", width: 200 },
    { field: "status", title: "Status", width: 140 },
  ],
  toolbarButtons: [
    { id: "add", label: "New Inspection Form", actionType: "add", primary: true },
    { id: "refresh", label: "Refresh", actionType: "refresh" },
    { id: "export", label: "Export List", actionType: "export" },
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
    export: true,
  },
  formOptions: {
    enableFormFilling: true,
    fields: [
      {
        id: "employeeName",
        label: "Employee Name",
        type: "text",
        required: true,
        placeholder: "Enter full name",
      },
      {
        id: "designation",
        label: "Designation",
        type: "text",
        placeholder: "Senior Asset Inspector",
      },
      {
        id: "department",
        label: "Department",
        type: "select",
        options: [
          { label: "Engineering & Maintenance", value: "Engineering & Maintenance" },
          { label: "Health, Safety & Environment", value: "Health, Safety & Environment" },
          { label: "Operations & Logistics", value: "Operations & Logistics" },
          { label: "Quality Assurance", value: "Quality Assurance" },
        ],
      },
      {
        id: "inspectionDate",
        label: "Inspection Date",
        type: "date",
      },
      {
        id: "complianceStatus",
        label: "Compliance Status",
        type: "radio",
        options: [
          { label: "Compliant", value: "Compliant" },
          { label: "Requires Maintenance", value: "Requires Maintenance" },
          { label: "Critical Risk", value: "Critical Risk" },
        ],
        defaultValue: "Compliant",
      },
      {
        id: "checkPassed",
        label: "Safety Checklist Passed",
        type: "checkbox",
        defaultValue: true,
      },
      {
        id: "comments",
        label: "Inspector Comments",
        type: "textarea",
        placeholder: "Enter observations, risk scores, and equipment health notes...",
      },
      {
        id: "inspectorSignature",
        label: "Inspector Digital Signature",
        type: "signature",
      },
    ],
  },
  formFields: [
    { field: "title", name: "title", label: "Form Title", type: "text", required: true },
    {
      field: "department",
      name: "department",
      label: "Department",
      type: "select",
      options: [
        { label: "Engineering & Maintenance", value: "Engineering & Maintenance" },
        { label: "Health, Safety & Environment", value: "Health, Safety & Environment" },
        { label: "Operations & Logistics", value: "Operations & Logistics" },
        { label: "Quality Assurance", value: "Quality Assurance" },
      ],
    },
    {
      field: "status",
      name: "status",
      label: "Form Status",
      type: "select",
      options: [
        { label: "Draft", value: "Draft" },
        { label: "Filled", value: "Filled" },
        { label: "Approved", value: "Approved" },
      ],
    },
  ],
};
