"use client";

import React, { useState, useEffect, useMemo } from "react";
import { FormField } from "@/types/metadata";
import { Input, NumericTextBox, TextArea } from "@progress/kendo-react-inputs";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { DropDownList } from "@progress/kendo-react-dropdowns";
import { Stepper, Card, CardHeader, CardTitle, CardBody } from "@progress/kendo-react-layout";
import { Notification } from "@progress/kendo-react-notification";
import { Grid, GridColumn as Column } from "@progress/kendo-react-grid";
import { Upload, UploadOnAddEvent } from "@progress/kendo-react-upload";
import { Editor, EditorTools } from "@progress/kendo-react-editor";

const {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Subscript,
  Superscript,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Indent,
  Outdent,
  OrderedList,
  UnorderedList,
  Undo,
  Redo,
  FontSize,
  FontName,
  FormatBlock,
  Link,
  Unlink,
  InsertImage,
  ViewHtml,
  InsertTable,
  AddRowBefore,
  AddRowAfter,
  AddColumnBefore,
  AddColumnAfter,
  DeleteRow,
  DeleteColumn,
  DeleteTable,
  MergeCells,
  SplitCell,
} = EditorTools;

interface DynamicFormProps {
  fields: FormField[];
  initialValues?: Record<string, any>;
  onSubmit: (values: Record<string, any>) => void;
  onCancel: () => void;
  formLayout?: "standard" | "split-cards";
  formSections?: Array<{ title: string; fields: string[] }>;
  formWidgets?: Array<{ type: string; field: string; steps?: string[]; auditField?: string }>;
}

export default function DynamicForm({
  fields,
  initialValues = {},
  onSubmit,
  onCancel,
  formLayout = "standard",
  formSections,
  formWidgets,
}: DynamicFormProps) {
  // Initialize form state
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Memoize initialValues to stabilize its reference when an empty object or identical object is passed
  const memoizedInitialValues = useMemo(() => {
    return initialValues;
  }, [JSON.stringify(initialValues)]);

  // Populate initial values on mount/update
  useEffect(() => {
    const defaultData: Record<string, any> = {};
    fields.forEach((f) => {
      // Prioritize: 1. initial value, 2. default metadata value, 3. empty fallback
      defaultData[f.field] =
        memoizedInitialValues[f.field] !== undefined
          ? memoizedInitialValues[f.field]
          : f.defaultValue !== undefined
            ? f.defaultValue
            : "";
    });
    setFormData(defaultData);
    setErrors({});
  }, [fields, memoizedInitialValues]);

  // Form Field Change Handler
  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Remove error when user makes correction
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  // Form Submission & Validation
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    fields.forEach((f) => {
      if (f.required && (formData[f.field] === undefined || formData[f.field] === "")) {
        newErrors[f.field] = `${f.label} is required`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
  };

  // Generate dynamic mock history list if needed by the history log widget
  const historyData = useMemo(() => {
    const dateStr = formData.date || new Date().toISOString().split("T")[0];
    const employee = formData.employeeName || "Rajvi Test";
    const status = formData.status || "Draft";
    const desc = formData.taskDescription || "";
    const comms = formData.comments || "";

    const baseHistory = [
      {
        id: 1,
        user: employee,
        date: `${dateStr} 09:00 AM`,
        status: "Draft",
        comment: "Initial entry created.",
        recipient: "Self",
      },
    ];

    if (status === "Draft") {
      return baseHistory;
    }

    baseHistory.push({
      id: 2,
      user: employee,
      date: `${dateStr} 10:09 AM`,
      status: "Submitted",
      comment: desc || "Timesheet submitted for PM review.",
      recipient: "Project Manager (Yash)",
    });

    if (status === "Pending Approval") {
      return [...baseHistory].reverse();
    }

    if (status === "Approved") {
      baseHistory.push({
        id: 3,
        user: "Project Manager (Yash)",
        date: `${dateStr} 02:45 PM`,
        status: "Approved",
        comment: comms || "Great work! Approved.",
        recipient: "Finance Team",
      });
    } else if (status === "Rejected") {
      baseHistory.push({
        id: 3,
        user: "Project Manager (Yash)",
        date: `${dateStr} 02:45 PM`,
        status: "Rejected",
        comment: comms || "Please provide details.",
        recipient: employee,
      });
    }

    return [...baseHistory].reverse();
  }, [formData.date, formData.employeeName, formData.status, formData.taskDescription, formData.comments]);

  // Widget Renderers
  const renderWidgets = () => {
    if (!formWidgets || formWidgets.length === 0) return null;

    return formWidgets.map((w, idx) => {
      const val = formData[w.field] || "Draft";

      // 1. Status Notification
      if (w.type === "status-notification") {
        let notificationStyle: "info" | "success" | "warning" | "error" = "info";
        let message = "📝 Draft: Timesheet details are editable. Submit for PM approval.";
        let color = "#2563EB";

        if (val === "Approved") {
          notificationStyle = "success";
          message = "💡 PM Approved: This timesheet record has been reviewed and approved.";
          color = "#059669";
        } else if (val === "Rejected") {
          notificationStyle = "error";
          message = `⚠️ Rejected: Needs revision. Manager Comment: "${formData.comments || "No comment provided."}"`;
          color = "#DC2626";
        } else if (val === "Pending Approval") {
          notificationStyle = "warning";
          message = "🕒 Pending: Awaiting PM review and approval.";
          color = "#D97706";
        }

        return (
          <div key={`widget-${idx}`} className="rounded-lg overflow-hidden shadow-sm mb-5">
            <Notification
              type={{ style: notificationStyle, icon: true }}
              className="w-full !p-3.5 text-sm font-medium border-l-4"
              style={{ borderColor: color }}
            >
              <span>{message}</span>
            </Notification>
          </div>
        );
      }

      // 2. Workflow Stepper
      if (w.type === "workflow-stepper" && w.steps) {
        const steps = w.steps.map((s) => ({ label: s }));
        let stepIndex = w.steps.indexOf(val);
        if (stepIndex === -1) {
          stepIndex = val === "Rejected" ? 1 : 0; // Rejected shown at index 1
        }

        return (
          <Card key={`widget-${idx}`} className="border border-slate-200 shadow-sm p-4 bg-slate-50/50 mb-5">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Workflow Process Visualiser
            </div>
            <Stepper
              items={steps}
              value={stepIndex}
              onChange={(e) => {
                const stepVal = w.steps![e.value];
                handleChange(w.field, stepVal);
              }}
              className="k-stepper-custom py-2"
            />
          </Card>
        );
      }

      // 3. History Log Audit Grid
      if (w.type === "history-log") {
        return (
          <Card key={`widget-${idx}`} className="border border-slate-200 shadow-sm mb-5">
            <CardHeader className="bg-slate-50 border-b border-slate-100 p-4 flex justify-between items-center">
              <CardTitle className="text-sm font-bold text-slate-700">Status History Log</CardTitle>
              <span className="text-[10px] bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Audit Trails Active
              </span>
            </CardHeader>
            <CardBody className="p-0">
              <Grid
                data={historyData}
                style={{ maxHeight: "220px" }}
                className="border-none"
              >
                <Column field="user" title="User Name" width={160} />
                <Column field="date" title="Action Timestamp" width={180} />
                <Column
                  field="status"
                  title="State Change"
                  width={130}
                  cells={{
                    data: (props: any) => {
                      const status = props.dataItem.status;
                      let badge = "bg-slate-100 text-slate-700";
                      if (status === "Approved") badge = "bg-green-100 text-green-800";
                      else if (status === "Rejected") badge = "bg-red-100 text-red-800";
                      else if (status === "Submitted") badge = "bg-blue-100 text-blue-800";
                      return (
                        <td {...props.tdProps} className="px-4 py-2 font-medium">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${badge}`}>
                            {status}
                          </span>
                        </td>
                      );
                    },
                  }}
                />
                <Column field="comment" title="Audit Comment / Description" />
                <Column field="recipient" title="Assigned To" width={180} />
              </Grid>
            </CardBody>
          </Card>
        );
      }

      return null;
    });
  };

  // Helper to render an individual form field component
  const renderField = (f: FormField) => {
    const hasError = !!errors[f.field];
    const val = formData[f.field];

    return (
      <div
        key={f.field}
        className={`flex flex-col gap-1.5 ${f.type === "textarea" || f.type === "editor" || f.type === "richtext" || f.type === "upload" ? "md:col-span-2" : ""}`}
      >
        <label className="text-xs font-bold text-slate-600">
          {f.label} {f.required && <span className="text-red-500">*</span>}
        </label>

        {/* Text Inputs */}
        {f.type === "text" && (
          <Input
            value={val || ""}
            onChange={(e) => handleChange(f.field, e.value)}
            placeholder={f.placeholder}
            className={`w-full rounded-md border-slate-300 focus:border-green-500 focus:ring-green-500 ${hasError ? "k-state-invalid border-red-500" : ""}`}
          />
        )}

        {/* Numeric Inputs */}
        {f.type === "number" && (
          <NumericTextBox
            value={val !== undefined && val !== "" ? Number(val) : null}
            onChange={(e) => handleChange(f.field, e.value)}
            placeholder={f.placeholder}
            format="0.0"
            className={`w-full rounded-md border-slate-300 focus:border-green-500 focus:ring-green-500 ${hasError ? "k-state-invalid border-red-500" : ""}`}
          />
        )}

        {/* Date Pickers */}
        {f.type === "date" && (
          <DatePicker
            value={val ? new Date(val) : null}
            onChange={(e) => {
              const dateVal = e.value;
              const dateStr = dateVal ? dateVal.toISOString().split("T")[0] : "";
              handleChange(f.field, dateStr);
            }}
            format="yyyy-MM-dd"
            className={`w-full rounded-md border-slate-300 focus:border-green-500 focus:ring-green-500 ${hasError ? "k-state-invalid border-red-500" : ""}`}
          />
        )}

        {/* Dropdowns */}
        {f.type === "select" && (
          <DropDownList
            data={f.options || []}
            textField="label"
            dataItemKey="value"
            value={f.options?.find((opt) => opt.value === val) || (typeof val === "string" ? { label: val, value: val } : null)}
            onChange={(e) => handleChange(f.field, e.value?.value ?? e.value)}
            className={`w-full rounded-md border-slate-300 focus:border-green-500 focus:ring-green-500 ${hasError ? "k-state-invalid border-red-500" : ""}`}
          />
        )}

        {/* Textareas */}
        {f.type === "textarea" && (
          <TextArea
            value={val || ""}
            onChange={(e) => handleChange(f.field, e.value)}
            placeholder={f.placeholder}
            rows={3}
            className={`w-full rounded-md border-slate-300 focus:border-green-500 focus:ring-green-500 ${hasError ? "k-state-invalid border-red-500" : ""}`}
          />
        )}

        {/* Kendo Rich Text Editor */}
        {(f.type === "editor" || f.type === "richtext") && (
          <div className="w-full">
            <Editor
              tools={[
                [Bold, Italic, Underline, Strikethrough],
                [Subscript, Superscript],
                [AlignLeft, AlignCenter, AlignRight, AlignJustify],
                [Indent, Outdent],
                [OrderedList, UnorderedList],
                FontSize,
                FontName,
                FormatBlock,
                [Undo, Redo],
                [Link, Unlink, InsertImage, ViewHtml],
                [InsertTable],
                [AddRowBefore, AddRowAfter, AddColumnBefore, AddColumnAfter],
                [DeleteRow, DeleteColumn, DeleteTable],
                [MergeCells, SplitCell],
              ]}
              contentStyle={{ height: 260 }}
              defaultContent={val || ""}
              value={val || ""}
              onChange={(e) => handleChange(f.field, e.html)}
              className={`w-full rounded-md border-slate-300 ${hasError ? "k-state-invalid border-red-500" : ""}`}
            />
          </div>
        )}

        {/* PDF/File Upload field */}
        {f.type === "upload" && (
          <div className="space-y-2">
            {val && (
              <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded p-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-semibold">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Existing PDF Document Attached
                </span>
                <span className="text-[10px] text-slate-400">Holds Base64 Data</span>
              </div>
            )}
            <Upload
              batch={false}
              multiple={false}
              autoUpload={false}
              onAdd={(e: UploadOnAddEvent) => {
                const fileObj = e.newState[0]?.getRawFile?.();
                if (fileObj) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    if (reader.result) {
                      const base64String = reader.result.toString().split(",")[1];
                      handleChange(f.field, base64String);
                    }
                  };
                  reader.readAsDataURL(fileObj);
                }
              }}
              className={`w-full rounded-md ${hasError ? "border-red-500" : ""}`}
            />
          </div>
        )}

        {hasError && (
          <span className="text-xs text-rose-500 font-medium">
            {errors[f.field]}
          </span>
        )}
      </div>
    );
  };

  // Helper to render form fields inside sections or standard layout
  const renderFormFieldsLayout = () => {
    if (formSections && formSections.length > 0) {
      // Group fields by section title
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
          {formSections.map((sec, sIdx) => (
            <Card key={`sec-${sIdx}`} className="border border-slate-200 shadow-sm flex flex-col justify-between">
              <CardHeader className="bg-slate-50 border-b border-slate-100 p-4">
                <CardTitle className="text-sm font-bold text-slate-700">{sec.title}</CardTitle>
              </CardHeader>
              <CardBody className="p-4 space-y-4">
                {sec.fields.map((fName) => {
                  const fieldDef = fields.find((f) => f.field === fName);
                  return fieldDef ? renderField(fieldDef) : null;
                })}
              </CardBody>
            </Card>
          ))}
        </div>
      );
    }

    // Standard Grid layout
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        {fields.map((f) => renderField(f))}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Dynamic Widgets */}
      {renderWidgets()}

      {/* Form Fields Layout */}
      {renderFormFieldsLayout()}

      {/* Form Action Controls */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 font-semibold rounded-lg shadow-sm text-sm transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-5 py-2 bg-green-700 text-white hover:bg-green-800 font-semibold rounded-lg shadow-sm text-sm transition-colors cursor-pointer"
        >
          Save Entry
        </button>
      </div>
    </form>
  );
}
