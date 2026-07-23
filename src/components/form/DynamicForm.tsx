"use client";

import React, { useState, useEffect } from "react";
import { FormField } from "@/types/metadata";
import { Input, NumericTextBox, TextArea } from "@progress/kendo-react-inputs";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { DropDownList } from "@progress/kendo-react-dropdowns";

interface DynamicFormProps {
  fields: FormField[];
  initialValues?: Record<string, any>;
  onSubmit: (values: Record<string, any>) => void;
  onCancel: () => void;
}

export default function DynamicForm({
  fields,
  initialValues = {},
  onSubmit,
  onCancel,
}: DynamicFormProps) {
  // Initialize form state
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Populate initial values on mount/update
  useEffect(() => {
    const defaultData: Record<string, any> = {};
    fields.forEach((f) => {
      // Prioritize: 1. initial value, 2. default metadata value, 3. empty fallback
      defaultData[f.field] =
        initialValues[f.field] !== undefined
          ? initialValues[f.field]
          : f.defaultValue !== undefined
            ? f.defaultValue
            : "";
    });
    setFormData(defaultData);
    setErrors({});
  }, [fields, initialValues]);

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

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {fields.map((f) => {
          const hasError = !!errors[f.field];
          const val = formData[f.field];

          return (
            <div
              key={f.field}
              className={`flex flex-col gap-1.5 ${f.type === "textarea" ? "md:col-span-2" : ""
                }`}
            >
              <label className="text-sm font-semibold text-slate-700">
                {f.label} {f.required && <span className="text-red-500">*</span>}
              </label>

              {/* Text Inputs */}
              {f.type === "text" && (
                <Input
                  value={val || ""}
                  onChange={(e) => handleChange(f.field, e.value)}
                  placeholder={f.placeholder}
                  className={`w-full rounded-md border-slate-300 focus:border-green-500 focus:ring-green-500 ${hasError ? "k-state-invalid border-red-500" : ""
                    }`}
                />
              )}

              {/* Numeric Inputs */}
              {f.type === "number" && (
                <NumericTextBox
                  value={val !== undefined && val !== "" ? Number(val) : null}
                  onChange={(e) => handleChange(f.field, e.value)}
                  placeholder={f.placeholder}
                  format="0.0"
                  className={`w-full rounded-md border-slate-300 focus:border-green-500 focus:ring-green-500 ${hasError ? "k-state-invalid border-red-500" : ""
                    }`}
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
                  className={`w-full rounded-md border-slate-300 focus:border-green-500 focus:ring-green-500 ${hasError ? "k-state-invalid border-red-500" : ""
                    }`}
                />
              )}

              {/* Dropdowns */}
              {f.type === "select" && (
                <DropDownList
                  data={f.options || []}
                  textField="label"
                  dataItemKey="value"
                  value={f.options?.find((opt) => opt.value === val) || null}
                  onChange={(e) => handleChange(f.field, e.value?.value)}
                  className={`w-full rounded-md border-slate-300 focus:border-green-500 focus:ring-green-500 ${hasError ? "k-state-invalid border-red-500" : ""
                    }`}
                />
              )}

              {/* Textareas */}
              {f.type === "textarea" && (
                <TextArea
                  value={val || ""}
                  onChange={(e) => handleChange(f.field, e.value)}
                  placeholder={f.placeholder}
                  rows={3}
                  className={`w-full rounded-md border-slate-300 focus:border-green-500 focus:ring-green-500 ${hasError ? "k-state-invalid border-red-500" : ""
                    }`}
                />
              )}

              {hasError && (
                <span className="text-xs text-rose-500 font-medium">
                  {errors[f.field]}
                </span>
              )}
            </div>
          );
        })}
      </div>

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
          className="px-4 py-2 bg-green-700 text-white hover:bg-green-800 font-semibold rounded-lg shadow-sm text-sm transition-colors cursor-pointer"
        >
          Submit
        </button>
      </div>
    </form>
  );
}
