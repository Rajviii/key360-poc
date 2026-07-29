import { useState, useCallback } from "react";
import {
  SignatureAnnotation,
  TextAnnotation,
  HighlightAnnotation,
  PDFComment,
} from "@/modules/document-management/types";
import { PDFExporter } from "@/components/pdf/PDFExporter";

export interface PDFExportOptions {
  fileName?: string;
  signatures?: SignatureAnnotation[];
  texts?: TextAnnotation[];
  highlights?: HighlightAnnotation[];
  comments?: PDFComment[];
  formValues?: Record<string, any>;
}

export function usePDFExport() {
  const [isExporting, setIsExporting] = useState(false);

  const exportDocument = useCallback(
    async (options: PDFExportOptions) => {
      setIsExporting(true);
      try {
        await PDFExporter.exportDocument(options);
      } catch (err) {
        console.error("Failed to export PDF:", err);
      } finally {
        setIsExporting(false);
      }
    },
    []
  );

  return {
    isExporting,
    exportDocument,
  };
}
