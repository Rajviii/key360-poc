"use client";

import React, { useRef, useEffect, useState } from "react";
import { Window } from "@progress/kendo-react-dialogs";
import { ViewerOptions, EditorOptions, FormOptions, DocumentItem } from "@/modules/document-management/types";
import { usePDFViewer } from "@/hooks/pdf/usePDFViewer";
import { usePDFAnnotations, AnnotationTool } from "@/hooks/pdf/usePDFAnnotations";
import { useSignature } from "@/hooks/pdf/useSignature";
import { usePDFForm } from "@/hooks/pdf/usePDFForm";
import { usePDFExport } from "@/hooks/pdf/usePDFExport";
import { PDFToolbar } from "./PDFToolbar";
import { SignatureDialog } from "./SignatureDialog";
import { AnnotationLayer } from "./AnnotationLayer";
import { TextEditor } from "./TextEditor";
import { HighlightLayer } from "./HighlightLayer";
import { CommentPanel } from "./CommentPanel";
import { PDFLoader } from "./PDFLoader";
import { PDFEditor } from "./PDFEditor";
import { PDFExporter } from "./PDFExporter";
import { useNotification } from "@/context/NotificationContext";

interface PDFViewerProps {
  isOpen: boolean;
  onClose: () => void;
  documentItem: DocumentItem;
  viewerOptions?: ViewerOptions;
  editorOptions?: EditorOptions;
  formOptions?: FormOptions;
  onSaveDocument?: (id: string | number, updates: Partial<DocumentItem>) => void;
}

export function PDFViewer({
  isOpen,
  onClose,
  documentItem,
  viewerOptions = {},
  editorOptions = {},
  formOptions = {},
  onSaveDocument,
}: PDFViewerProps) {
  const { showSuccess, showInfo } = useNotification();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Custom Hooks
  const pdfViewer = usePDFViewer(3);
  const pdfAnnotations = usePDFAnnotations(
    documentItem.texts || [],
    documentItem.highlights || [],
    documentItem.comments || []
  );
  const signature = useSignature(documentItem.signatures || []);
  const pdfForm = usePDFForm(formOptions.fields || [], documentItem.formValues || {});
  const pdfExport = usePDFExport();

  // Floating text editor state
  const [stagedTextPos, setStagedTextPos] = useState<{ x: number; y: number } | null>(null);

  // Render Canvas Document
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;

    // 1. Draw base sheet and text layout onto canvas
    PDFLoader.renderPageToCanvas(
      canvasRef.current,
      pdfViewer.currentPage,
      pdfViewer.zoom,
      pdfViewer.rotation,
      documentItem.title
    );

    // 2. Render static annotations & form values onto canvas
    PDFEditor.renderAnnotationsToCanvas(
      canvasRef.current,
      pdfViewer.zoom,
      signature.signatures,
      pdfAnnotations.texts,
      pdfAnnotations.highlights,
      pdfAnnotations.comments,
      pdfForm.formValues
    );
  }, [
    isOpen,
    pdfViewer.currentPage,
    pdfViewer.zoom,
    pdfViewer.rotation,
    documentItem.title,
    signature.signatures,
    pdfAnnotations.texts,
    pdfAnnotations.highlights,
    pdfAnnotations.comments,
    pdfForm.formValues,
  ]);

  if (!isOpen) return null;

  // Click handler on Document Sheet for Signature placement, Text addition, or Comment creation
  const handleSheetClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) / pdfViewer.zoom;
    const clickY = (e.clientY - rect.top) / pdfViewer.zoom;

    if (signature.isPlacementActive) {
      signature.placeSignature(clickX, clickY, pdfViewer.currentPage);
      showSuccess("Digital signature placed! You can drag or resize it.");
      return;
    }

    if (pdfAnnotations.activeTool === "text") {
      setStagedTextPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      return;
    }

    if (pdfAnnotations.activeTool === "comment") {
      pdfAnnotations.addComment("Inspector", "Review required on this section.", clickX, clickY, pdfViewer.currentPage);
      showInfo("Sticky comment placed.");
    }
  };

  const handleSave = () => {
    if (onSaveDocument) {
      onSaveDocument(documentItem.id, {
        signatures: signature.signatures,
        texts: pdfAnnotations.texts,
        highlights: pdfAnnotations.highlights,
        comments: pdfAnnotations.comments,
        formValues: pdfForm.formValues,
        status: formOptions.enableFormFilling ? "Filled" : "Pending Sign",
      });
    }
    showSuccess(`Document (${documentItem.id}) changes saved successfully.`);
  };

  const handleExport = async () => {
    await PDFExporter.exportDocument({
      fileName: documentItem.title,
      signatures: signature.signatures,
      texts: pdfAnnotations.texts,
      highlights: pdfAnnotations.highlights,
      comments: pdfAnnotations.comments,
      formValues: pdfForm.formValues,
    });
    showInfo("PDF export generated successfully.");
  };

  return (
    <Window
      title={`Key360 Enterprise Document Viewer - ${documentItem.title} (${documentItem.id})`}
      onClose={onClose}
      initialHeight={760}
      initialWidth={1150}
      resizable={true}
    >
      <div className="flex flex-col h-full bg-slate-900 overflow-hidden font-sans">
        {/* Toolbar */}
        <PDFToolbar
          viewerOptions={viewerOptions}
          editorOptions={editorOptions}
          zoom={pdfViewer.zoom}
          onZoomIn={pdfViewer.zoomIn}
          onZoomOut={pdfViewer.zoomOut}
          onRotate={pdfViewer.rotateClockwise}
          currentPage={pdfViewer.currentPage}
          totalPages={pdfViewer.totalPages}
          onNextPage={pdfViewer.nextPage}
          onPrevPage={pdfViewer.prevPage}
          searchQuery={pdfViewer.searchQuery}
          onSearchChange={pdfViewer.handleSearch}
          activeTool={pdfAnnotations.activeTool}
          onSelectTool={pdfAnnotations.setActiveTool}
          onOpenSignature={signature.openSignatureDialog}
          onToggleComments={() => pdfAnnotations.setActiveCommentPanelOpen((prev) => !prev)}
          commentCount={pdfAnnotations.comments.length}
          onSave={handleSave}
          onExport={handleExport}
          onPrint={pdfViewer.triggerPrint}
          onDownload={handleExport}
        />

        {/* Status Notification Banner for Placement Mode */}
        {signature.isPlacementActive && (
          <div className="bg-emerald-600 text-white text-xs py-1.5 px-4 font-bold flex items-center justify-between shadow-sm animate-pulse z-20">
            <span>✍️ Signature Placement Mode: Click anywhere on the document sheet to place your signature.</span>
            <button
              onClick={signature.cancelPlacement}
              className="bg-emerald-800 hover:bg-emerald-900 text-white text-[11px] px-2 py-0.5 rounded cursor-pointer"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Main Document Workspace Area */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Scrollable Document Viewport */}
          <div className="flex-1 bg-slate-800 overflow-auto p-6 flex justify-center items-start select-none relative">
            <div
              style={{
                width: `${650 * pdfViewer.zoom}px`,
                height: `${850 * pdfViewer.zoom}px`,
              }}
              onClick={handleSheetClick}
              className="relative bg-white shadow-2xl rounded-sm overflow-hidden border border-slate-700"
            >
              {/* Document Canvas Sheet */}
              <canvas ref={canvasRef} className="block w-full h-full pointer-events-none" />

              {/* Interactive Highlight Layer */}
              {pdfAnnotations.activeTool === "highlight" && (
                <HighlightLayer
                  zoom={pdfViewer.zoom}
                  onAddHighlight={(x, y, w, h) =>
                    pdfAnnotations.addHighlight(x, y, w, h, pdfViewer.currentPage)
                  }
                />
              )}

              {/* Interactive Annotation & Signature Overlay Layer */}
              <AnnotationLayer
                zoom={pdfViewer.zoom}
                signatures={signature.signatures.filter((s) => s.page === pdfViewer.currentPage)}
                onUpdateSignaturePos={signature.updateSignaturePosition}
                onUpdateSignatureSize={signature.updateSignatureSize}
                onDeleteSignature={signature.removeSignature}
                selectedSignatureId={signature.selectedSignatureId}
                onSelectSignature={signature.setSelectedSignatureId}
                texts={pdfAnnotations.texts.filter((t) => t.page === pdfViewer.currentPage)}
                onDeleteText={pdfAnnotations.removeText}
                highlights={pdfAnnotations.highlights.filter((h) => h.page === pdfViewer.currentPage)}
                onDeleteHighlight={pdfAnnotations.removeHighlight}
              />

              {/* Floating Inline Text Editor */}
              {stagedTextPos && (
                <TextEditor
                  x={stagedTextPos.x}
                  y={stagedTextPos.y}
                  onSave={(txt) => {
                    pdfAnnotations.addText(
                      txt,
                      stagedTextPos.x / pdfViewer.zoom,
                      stagedTextPos.y / pdfViewer.zoom,
                      pdfViewer.currentPage
                    );
                    setStagedTextPos(null);
                  }}
                  onCancel={() => setStagedTextPos(null)}
                />
              )}
            </div>
          </div>

          {/* Module 2: Interactive PDF Form Fields Drawer */}
          {formOptions.enableFormFilling && (
            <div className="w-80 bg-slate-900 border-l border-slate-800 h-full flex flex-col p-4 space-y-4 text-white overflow-y-auto z-20 flex-shrink-0">
              <div className="border-b border-slate-800 pb-2">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">
                  Interactive PDF Form Fields
                </h3>
                <p className="text-[10px] text-slate-400">
                  Fill out values to update document records and exports.
                </p>
              </div>

              {formOptions.fields?.map((field) => (
                <div key={field.id} className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    {field.label} {field.required && <span className="text-rose-400">*</span>}
                  </label>

                  {field.type === "text" && (
                    <input
                      type="text"
                      value={pdfForm.formValues[field.id] || ""}
                      onChange={(e) => pdfForm.setFieldValue(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full text-xs px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded text-white focus:border-emerald-500 focus:outline-none"
                    />
                  )}

                  {field.type === "select" && (
                    <select
                      value={pdfForm.formValues[field.id] || ""}
                      onChange={(e) => pdfForm.setFieldValue(field.id, e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded text-white focus:border-emerald-500 focus:outline-none"
                    >
                      {field.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  )}

                  {field.type === "date" && (
                    <input
                      type="date"
                      value={pdfForm.formValues[field.id] || ""}
                      onChange={(e) => pdfForm.setFieldValue(field.id, e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded text-white focus:border-emerald-500 focus:outline-none"
                    />
                  )}

                  {field.type === "radio" && (
                    <div className="space-y-1 pt-1">
                      {field.options?.map((opt) => (
                        <label key={opt.value} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                          <input
                            type="radio"
                            name={field.id}
                            value={opt.value}
                            checked={pdfForm.formValues[field.id] === opt.value}
                            onChange={() => pdfForm.setFieldValue(field.id, opt.value)}
                            className="accent-emerald-500"
                          />
                          {opt.label}
                        </label>
                      ))}
                    </div>
                  )}

                  {field.type === "checkbox" && (
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={!!pdfForm.formValues[field.id]}
                        onChange={(e) => pdfForm.setFieldValue(field.id, e.target.checked)}
                        className="accent-emerald-500 rounded"
                      />
                      {field.label}
                    </label>
                  )}

                  {field.type === "textarea" && (
                    <textarea
                      rows={3}
                      value={pdfForm.formValues[field.id] || ""}
                      onChange={(e) => pdfForm.setFieldValue(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full text-xs px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded text-white focus:border-emerald-500 focus:outline-none"
                    />
                  )}

                  {field.type === "signature" && (
                    <button
                      onClick={signature.openSignatureDialog}
                      className="w-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold py-1.5 rounded cursor-pointer"
                    >
                      ✍️ Sign Inspection Form
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Sticky Comment Side Panel */}
          {pdfAnnotations.activeCommentPanelOpen && (
            <CommentPanel
              comments={pdfAnnotations.comments}
              onAddComment={pdfAnnotations.addComment}
              onDeleteComment={pdfAnnotations.removeComment}
              onClose={() => pdfAnnotations.setActiveCommentPanelOpen(false)}
            />
          )}
        </div>
      </div>

      {/* Signature Canvas Dialog */}
      <SignatureDialog
        isOpen={signature.isDialogOpen}
        onClose={signature.closeSignatureDialog}
        onSave={signature.handleSaveSignature}
      />
    </Window>
  );
}
