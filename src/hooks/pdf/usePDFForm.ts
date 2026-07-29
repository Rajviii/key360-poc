import { useState, useCallback } from "react";
import { FormFieldDef } from "@/modules/document-management/types";

export function usePDFForm(
  fields: FormFieldDef[] = [],
  initialValues: Record<string, any> = {}
) {
  const [formValues, setFormValues] = useState<Record<string, any>>(() => {
    const defaults: Record<string, any> = { ...initialValues };
    fields.forEach((f) => {
      if (defaults[f.id] === undefined && f.defaultValue !== undefined) {
        defaults[f.id] = f.defaultValue;
      }
    });
    return defaults;
  });

  const [formSignatures, setFormSignatures] = useState<Record<string, string>>({});

  const setFieldValue = useCallback((fieldId: string, value: any) => {
    setFormValues((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  }, []);

  const setFormSignatureValue = useCallback((fieldId: string, dataUrl: string) => {
    setFormSignatures((prev) => ({
      ...prev,
      [fieldId]: dataUrl,
    }));
  }, []);

  const resetForm = useCallback(() => {
    const defaults: Record<string, any> = {};
    fields.forEach((f) => {
      if (f.defaultValue !== undefined) {
        defaults[f.id] = f.defaultValue;
      }
    });
    setFormValues(defaults);
    setFormSignatures({});
  }, [fields]);

  return {
    formValues,
    setFormValues,
    setFieldValue,
    formSignatures,
    setFormSignatureValue,
    resetForm,
  };
}
