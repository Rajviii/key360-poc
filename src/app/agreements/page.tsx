"use client";

import React, { useState } from "react";
import ModuleRenderer from "@/modules/ModuleRenderer";
import { agreementModuleConfig } from "@/modules/document-management/config/agreement.config";
import { agreementsService, documentStore } from "@/services/documentManagementService";
import { PDFViewer } from "@/components/pdf/PDFViewer";
import { DocumentItem } from "@/modules/document-management/types";

export default function AgreementsPage() {
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const handleCustomAction = (action: string, item: any) => {
    if (action === "view" || action === "open") {
      setSelectedDoc(item);
      setIsViewerOpen(true);
    }
  };

  const handleSaveDoc = async (id: string | number, updates: Partial<DocumentItem>) => {
    await documentStore.updateAgreement(id, updates);
    if (selectedDoc && String(selectedDoc.id) === String(id)) {
      setSelectedDoc((prev) => (prev ? { ...prev, ...updates } : null));
    }
  };

  return (
    <>
      <ModuleRenderer
        config={agreementModuleConfig}
        service={agreementsService}
        onCustomAction={handleCustomAction}
      />

      {selectedDoc && (
        <PDFViewer
          isOpen={isViewerOpen}
          onClose={() => setIsViewerOpen(false)}
          documentItem={selectedDoc}
          viewerOptions={agreementModuleConfig.viewerOptions}
          editorOptions={agreementModuleConfig.editorOptions}
          onSaveDocument={handleSaveDoc}
        />
      )}
    </>
  );
}
