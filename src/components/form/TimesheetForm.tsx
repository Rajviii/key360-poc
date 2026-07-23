"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Stepper } from "@progress/kendo-react-layout";
import { Notification } from "@progress/kendo-react-notification";
import { Card, CardHeader, CardTitle, CardBody } from "@progress/kendo-react-layout";
import { Input, NumericTextBox, TextArea } from "@progress/kendo-react-inputs";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { DropDownList } from "@progress/kendo-react-dropdowns";
import { Grid, GridColumn as Column } from "@progress/kendo-react-grid";

interface TimesheetFormProps {
  initialValues?: Record<string, any>;
  onSubmit: (values: Record<string, any>) => void;
  onCancel: () => void;
}

const employeeOptions = [
  "Rajvi Test",
  "Babariya, Dhruv",
  "John Doe",
  "Alice Smith",
];

const projectOptions = [
  { label: "DIW001 - Training / Demo Work", value: "DIW001" },
  { label: "PRJ-902 - Core UI Refactoring", value: "PRJ-902" },
  { label: "PRJ-504 - Backend Cloud Caching", value: "PRJ-504" },
  { label: "OPS-100 - General Admin Operations", value: "OPS-100" },
];

const statusOptions = [
  { label: "Draft", value: "Draft" },
  { label: "Pending Approval", value: "Pending Approval" },
  { label: "Approved", value: "Approved" },
  { label: "Rejected", value: "Rejected" },
];

const workflowSteps = [
  { label: "Draft" },
  { label: "Submitted" },
  { label: "PM Approved" },
  { label: "Finance Check" },
  { label: "Paid" },
];

export default function TimesheetForm({
  initialValues = {},
  onSubmit,
  onCancel,
}: TimesheetFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize data
  useEffect(() => {
    setFormData({
      id: initialValues.id || "",
      employeeName: initialValues.employeeName || employeeOptions[0],
      date: initialValues.date || new Date().toISOString().split("T")[0],
      projectCode: initialValues.projectCode || "DIW001",
      hours: initialValues.hours !== undefined ? Number(initialValues.hours) : 8.0,
      status: initialValues.status || "Draft",
      taskDescription: initialValues.taskDescription || "",
      comments: initialValues.comments || "",
    });
    setErrors({});
  }, [initialValues]);

  // Handle changes
  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  // Stepper step calculations
  const currentStep = useMemo(() => {
    const status = formData.status || "Draft";
    switch (status) {
      case "Draft":
        return 0;
      case "Pending Approval":
        return 1;
      case "Approved":
        return 2;
      case "Finance Check":
        return 3;
      case "Paid":
        return 4;
      case "Rejected":
        return 1; // Mark at Submitted phase where rejection happened
      default:
        return 0;
    }
  }, [formData.status]);

  // Generate dynamic mock history list
  const historyData = useMemo(() => {
    const dateStr = formData.date || new Date().toISOString().split("T")[0];
    const employee = formData.employeeName || "User";
    const status = formData.status || "Draft";

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
      comment: formData.taskDescription || "Timesheet submitted for PM review.",
      recipient: "Project Manager (Yash)",
    });

    if (status === "Pending Approval") {
      return baseHistory.reverse();
    }

    if (status === "Approved") {
      baseHistory.push({
        id: 3,
        user: "Project Manager (Yash)",
        date: `${dateStr} 02:45 PM`,
        status: "Approved",
        comment: formData.comments || "Great work! Approved.",
        recipient: "Finance Team",
      });
    } else if (status === "Rejected") {
      baseHistory.push({
        id: 3,
        user: "Project Manager (Yash)",
        date: `${dateStr} 02:45 PM`,
        status: "Rejected",
        comment: formData.comments || "Please provide details.",
        recipient: employee,
      });
    }

    return baseHistory.reverse();
  }, [formData.date, formData.employeeName, formData.status, formData.taskDescription, formData.comments]);

  // Submit handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.employeeName) newErrors.employeeName = "Employee Name is required";
    if (!formData.date) newErrors.date = "Work Date is required";
    if (!formData.taskDescription) newErrors.taskDescription = "Task Description is required";
    if (formData.hours === undefined || formData.hours === null || formData.hours <= 0) {
      newErrors.hours = "Valid hours worked is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
  };

  // Notification configuration
  const notificationConfig = useMemo(() => {
    const status = formData.status || "Draft";
    switch (status) {
      case "Approved":
        return {
          type: "success" as const,
          message: "💡 PM Approved: This timesheet record has been reviewed and approved.",
        };
      case "Rejected":
        return {
          type: "error" as const,
          message: `⚠️ Rejected: Needs revision. Manager Comment: "${formData.comments || "No comment provided."}"`,
        };
      case "Pending Approval":
        return {
          type: "warning" as const,
          message: "🕒 Pending: Awaiting PM review and approval.",
        };
      default:
        return {
          type: "info" as const,
          message: "📝 Draft: Timesheet details are editable. Submit for PM approval.",
        };
    }
  }, [formData.status, formData.comments]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Top Status Notification Alert */}
      <div className="rounded-lg overflow-hidden shadow-sm">
        <Notification
          type={{
            style: notificationConfig.type,
            icon: true,
          }}
          className="w-full !p-3.5 text-sm font-medium border-l-4"
          style={{
            borderColor:
              notificationConfig.type === "success"
                ? "#059669"
                : notificationConfig.type === "error"
                  ? "#DC2626"
                  : notificationConfig.type === "warning"
                    ? "#D97706"
                    : "#2563EB",
          }}
        >
          <span>{notificationConfig.message}</span>
        </Notification>
      </div>

      {/* Stepper Workflow Visualiser */}
      <Card className="border border-slate-200 shadow-sm p-4 bg-slate-50/50">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Workflow Process Visualiser
        </div>
        <Stepper
          items={workflowSteps}
          value={currentStep}
          onChange={(e) => {
            // Map selected index back to status to simulate workflow interaction
            const stepsMap = ["Draft", "Pending Approval", "Approved", "Finance Check", "Paid"];
            handleChange("status", stepsMap[e.value]);
          }}
          className="k-stepper-custom py-2"
        />
      </Card>

      {/* Grid containing details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Timesheet Detail */}
        <Card className="border border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-50 border-b border-slate-100 p-4">
            <CardTitle className="text-sm font-bold text-slate-700">Timesheet Detail</CardTitle>
          </CardHeader>
          <CardBody className="p-4 space-y-4">
            {/* Employee DropDownList */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600">Employee Name *</label>
              <DropDownList
                data={employeeOptions}
                value={formData.employeeName || null}
                onChange={(e) => handleChange("employeeName", e.value)}
                className={`w-full ${errors.employeeName ? "k-state-invalid border-red-500" : ""}`}
              />
              {errors.employeeName && (
                <span className="text-xs text-rose-500 font-semibold">{errors.employeeName}</span>
              )}
            </div>

            {/* Date and Hours */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600">Work Date *</label>
                <DatePicker
                  value={formData.date ? new Date(formData.date) : null}
                  onChange={(e) => {
                    const val = e.value;
                    handleChange("date", val ? val.toISOString().split("T")[0] : "");
                  }}
                  format="yyyy-MM-dd"
                  className={errors.date ? "k-state-invalid border-red-500" : ""}
                />
                {errors.date && (
                  <span className="text-xs text-rose-500 font-semibold">{errors.date}</span>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600">Total Hours *</label>
                <NumericTextBox
                  value={formData.hours !== undefined && formData.hours !== "" ? Number(formData.hours) : null}
                  onChange={(e) => handleChange("hours", e.value)}
                  format="0.00"
                  className={errors.hours ? "k-state-invalid border-red-500" : ""}
                />
                {errors.hours && (
                  <span className="text-xs text-rose-500 font-semibold">{errors.hours}</span>
                )}
              </div>
            </div>

            {/* Project Code Dropdown */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600">Project *</label>
              <DropDownList
                data={projectOptions}
                textField="label"
                dataItemKey="value"
                value={projectOptions.find((opt) => opt.value === formData.projectCode) || null}
                onChange={(e) => handleChange("projectCode", e.value?.value)}
              />
            </div>

            {/* Status Dropdown */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600">Status *</label>
              <DropDownList
                data={statusOptions}
                textField="label"
                dataItemKey="value"
                value={statusOptions.find((opt) => opt.value === formData.status) || null}
                onChange={(e) => handleChange("status", e.value?.value)}
              />
            </div>
          </CardBody>
        </Card>

        {/* Card 2: Comments & Tasks */}
        <Card className="border border-slate-200 shadow-sm flex flex-col justify-between">
          <CardHeader className="bg-slate-50 border-b border-slate-100 p-4">
            <CardTitle className="text-sm font-bold text-slate-700">Activity and Comments</CardTitle>
          </CardHeader>
          <CardBody className="p-4 space-y-4 flex-1">
            {/* Task Description */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600">Activity Description *</label>
              <TextArea
                value={formData.taskDescription || ""}
                onChange={(e) => handleChange("taskDescription", e.value)}
                placeholder="Describe your tasks completed..."
                rows={4}
                className={`w-full ${errors.taskDescription ? "k-state-invalid border-red-500" : ""}`}
              />
              {errors.taskDescription && (
                <span className="text-xs text-rose-500 font-semibold">{errors.taskDescription}</span>
              )}
            </div>

            {/* Comments / PM Notes */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600">Manager Notes / Comments</label>
              <TextArea
                value={formData.comments || ""}
                onChange={(e) => handleChange("comments", e.value)}
                placeholder="Optional notes or rejection reasons..."
                rows={3}
                className="w-full"
              />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Grid 3: Status History Sub-Table */}
      <Card className="border border-slate-200 shadow-sm">
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

      {/* Actions */}
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
