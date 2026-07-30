"use client";

import React, { useEffect, useState } from "react";
import { Window } from "@progress/kendo-react-dialogs";
import { Button } from "@progress/kendo-react-buttons";
import { downloadIcon, printIcon, hyperlinkOpenIcon } from "@progress/kendo-svg-icons";
import { generatePDFWithPdfLib } from "@/utils/pdfLibGenerator";
import { useNotification } from "@/context/NotificationContext";

interface StandardPDFLibViewerProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
  moduleTitle?: string;
}

export function StandardPDFLibViewer({
  isOpen,
  onClose,
  item,
  moduleTitle = "Standard Record",
}: StandardPDFLibViewerProps) {
  const { showSuccess } = useNotification();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !item) return;

    let isMounted = true;
    setLoading(true);

    const title = item.title || item.name || item.employeeName || `Record #${item.id}`;

    generatePDFWithPdfLib(title, item, moduleTitle)
      .then((url) => {
        if (isMounted) {
          setPdfUrl(url);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to generate PDF via pdf-lib:", err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [isOpen, item, moduleTitle]);

  if (!isOpen) return null;

  const displayTitle = item?.title || item?.name || item?.employeeName || `Record #${item?.id}`;

  const handleDownload = () => {
    if (!pdfUrl) return;
    const a = document.createElement("a");
    a.href = pdfUrl;
    a.download = `key360_${item.id || "document"}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showSuccess("PDF downloaded successfully.");
  };

  const handlePrint = () => {
    if (!pdfUrl) return;
    const win = window.open(pdfUrl, "_blank");
    if (win) {
      win.focus();
      win.print();
    }
  };

  const handleOpenNewTab = () => {
    if (!pdfUrl) return;
    window.open(pdfUrl, "_blank");
  };

  return (
    <Window
      title={`Key360 Document Viewer (pdf-lib) - ${displayTitle}`}
      onClose={onClose}
      initialHeight={760}
      initialWidth={1050}
      resizable={true}
    >
      <div className="flex flex-col h-full bg-slate-900 overflow-hidden font-sans">
        {/* Top Header Bar matching Key360 Design Aesthetics */}
        <div className="bg-[#052e25] border-b border-[#03231c] text-white px-4 py-2.5 flex items-center justify-between gap-3 shrink-0 flex-wrap shadow-md z-20">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/20 text-emerald-300 text-[11px] font-bold px-2.5 py-1 rounded border border-emerald-500/30 uppercase tracking-wide">
              PDF-LIB ENGINE
            </span>
            <span className="text-xs font-semibold text-slate-200 max-w-[280px] truncate">
              {displayTitle}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              svgIcon={downloadIcon}
              size="small"
              themeColor="success"
              onClick={handleDownload}
              className="font-bold text-xs shadow-sm cursor-pointer"
            >
              Download PDF
            </Button>
            <Button
              svgIcon={printIcon}
              size="small"
              onClick={handlePrint}
              className="bg-[#03231c] border-[#094d3f] text-slate-200 hover:text-white cursor-pointer"
            >
              Print
            </Button>
            <Button
              svgIcon={hyperlinkOpenIcon}
              size="small"
              onClick={handleOpenNewTab}
              className="bg-[#03231c] border-[#094d3f] text-slate-200 hover:text-white cursor-pointer"
            >
              Open Full
            </Button>
          </div>
        </div>

        {/* Viewer Workspace */}
        <div className="flex-1 bg-slate-900 relative">
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-300">
              <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs font-semibold animate-pulse">Generating PDF with pdf-lib...</span>
            </div>
          ) : pdfUrl ? (
            <iframe
              src={pdfUrl}
              title="PDF Document Viewer"
              className="w-full h-full border-none block bg-slate-800"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-rose-400 text-sm font-semibold">
              Failed to load PDF document.
            </div>
          )}
        </div>
      </div>
    </Window>
  );
}
