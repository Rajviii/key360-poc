"use client";

import React from "react";
import { Button } from "@progress/kendo-react-buttons";
import { Input } from "@progress/kendo-react-inputs";
import {
  zoomInIcon,
  zoomOutIcon,
  arrowRotateCcwIcon,
  filePdfIcon,
  saveIcon,
  printIcon,
  commentIcon,
} from "@progress/kendo-svg-icons";
import { ViewerOptions, EditorOptions } from "@/modules/document-management/types";
import { AnnotationTool } from "@/hooks/pdf/usePDFAnnotations";

interface PDFToolbarProps {
  viewerOptions?: ViewerOptions;
  editorOptions?: EditorOptions;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRotate: () => void;
  currentPage: number;
  totalPages: number;
  onNextPage: () => void;
  onPrevPage: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeTool: AnnotationTool;
  onSelectTool: (tool: AnnotationTool) => void;
  onOpenSignature: () => void;
  onToggleComments: () => void;
  commentCount: number;
  onSave: () => void;
  onExport: () => void;
  onPrint: () => void;
  onDownload: () => void;
}

export function PDFToolbar({
  viewerOptions = {},
  editorOptions = {},
  zoom,
  onZoomIn,
  onZoomOut,
  onRotate,
  currentPage,
  totalPages,
  onNextPage,
  onPrevPage,
  searchQuery,
  onSearchChange,
  activeTool,
  onSelectTool,
  onOpenSignature,
  onToggleComments,
  commentCount,
  onSave,
  onExport,
  onPrint,
  onDownload,
}: PDFToolbarProps) {
  return (
    <div className="bg-[#052e25] border-b border-[#03231c] text-white px-3 py-2 flex flex-wrap items-center justify-between gap-2.5 shadow-md z-20 select-none">
      {/* Left Tools: Zoom, Rotate, Page Switcher */}
      <div className="flex items-center gap-2 flex-wrap">
        {viewerOptions.zoom !== false && (
          <div className="flex items-center bg-[#03231c] rounded-lg p-0.5 border border-[#094d3f]">
            <Button
              svgIcon={zoomOutIcon}
              title="Zoom Out"
              size="small"
              onClick={onZoomOut}
              className="text-slate-300 hover:text-white border-none bg-transparent cursor-pointer"
            />
            <span className="text-[11px] font-extrabold px-2 text-emerald-300">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              svgIcon={zoomInIcon}
              title="Zoom In"
              size="small"
              onClick={onZoomIn}
              className="text-slate-300 hover:text-white border-none bg-transparent cursor-pointer"
            />
          </div>
        )}

        {viewerOptions.rotate !== false && (
          <Button
            svgIcon={arrowRotateCcwIcon}
            title="Rotate Document (90°)"
            size="small"
            onClick={onRotate}
            className="bg-[#03231c] border-[#094d3f] text-slate-200 hover:text-white text-xs font-semibold rounded-lg px-2.5 py-1 cursor-pointer"
          >
            Rotate
          </Button>
        )}

        {/* Page Switcher */}
        <div className="flex items-center gap-1.5 bg-[#03231c] px-2.5 py-1 rounded-lg border border-[#094d3f] text-xs font-bold text-slate-200">
          <button
            onClick={onPrevPage}
            disabled={currentPage <= 1}
            className="disabled:opacity-30 hover:text-emerald-300 transition-colors px-1 cursor-pointer"
          >
            ◄
          </button>
          <span>
            Page {currentPage} / {totalPages}
          </span>
          <button
            onClick={onNextPage}
            disabled={currentPage >= totalPages}
            className="disabled:opacity-30 hover:text-emerald-300 transition-colors px-1 cursor-pointer"
          >
            ►
          </button>
        </div>
      </div>

      {/* Middle Tools: Search bar, Sign, Text, Highlight, Comments */}
      <div className="flex items-center gap-2 flex-wrap">
        {viewerOptions.search !== false && (
          <div className="relative w-36 sm:w-44">
            <Input
              value={searchQuery}
              onChange={(e) => onSearchChange(e.value)}
              placeholder="Search document..."
              className="bg-[#03231c] text-white border-[#094d3f] text-xs rounded-lg placeholder-slate-400 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        )}

        {viewerOptions.signature !== false && editorOptions.enableSign !== false && (
          <button
            type="button"
            onClick={onOpenSignature}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-[#047857] hover:bg-[#059669] text-white border border-emerald-400/40 shadow-sm transition-all cursor-pointer"
          >
            <span className="text-amber-300 text-sm">✍️</span>
            Sign
          </button>
        )}

        {viewerOptions.annotations !== false && editorOptions.enableText !== false && (
          <button
            type="button"
            onClick={() => onSelectTool(activeTool === "text" ? "none" : "text")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
              activeTool === "text"
                ? "bg-blue-600 text-white border-blue-400"
                : "bg-[#03231c] text-slate-300 border-[#094d3f] hover:text-white"
            }`}
          >
            Add Text
          </button>
        )}

        {viewerOptions.highlight !== false && editorOptions.enableHighlight !== false && (
          <button
            type="button"
            onClick={() => onSelectTool(activeTool === "highlight" ? "none" : "highlight")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
              activeTool === "highlight"
                ? "bg-amber-600 text-white border-amber-400"
                : "bg-[#03231c] text-slate-300 border-[#094d3f] hover:text-white"
            }`}
          >
            Highlight
          </button>
        )}

        {viewerOptions.comments !== false && editorOptions.enableComments !== false && (
          <Button
            svgIcon={commentIcon}
            size="small"
            onClick={onToggleComments}
            className={`text-xs font-semibold rounded-lg px-2.5 py-1 border ${
              activeTool === "comment"
                ? "bg-purple-600 text-white border-purple-400"
                : "bg-[#03231c] text-slate-300 border-[#094d3f] hover:text-white"
            }`}
          >
            Comments ({commentCount})
          </Button>
        )}
      </div>

      {/* Right Tools: Save, Print, Export PDF */}
      <div className="flex items-center gap-2">
        {editorOptions.enableSave !== false && (
          <Button
            svgIcon={saveIcon}
            size="small"
            themeColor="success"
            onClick={onSave}
            className="font-bold text-xs shadow-sm cursor-pointer"
          >
            Save
          </Button>
        )}

        {viewerOptions.print !== false && (
          <Button
            svgIcon={printIcon}
            size="small"
            onClick={onPrint}
            title="Print Document"
            className="bg-[#03231c] border-[#094d3f] text-slate-200 hover:text-white cursor-pointer"
          />
        )}

        {viewerOptions.export !== false && editorOptions.enableExport !== false && (
          <Button
            svgIcon={filePdfIcon}
            size="small"
            themeColor="primary"
            onClick={onExport}
            className="font-bold text-xs cursor-pointer"
          >
            Export PDF
          </Button>
        )}
      </div>
    </div>
  );
}
