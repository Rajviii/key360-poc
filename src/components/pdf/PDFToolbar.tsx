"use client";

import React from "react";
import { Button, ButtonGroup } from "@progress/kendo-react-buttons";
import { Input } from "@progress/kendo-react-inputs";
import {
  zoomInIcon,
  zoomOutIcon,
  arrowRotateCwIcon,
  pencilIcon,
  filePdfIcon,
  saveIcon,
  printIcon,
  downloadIcon,
  commentIcon,
  searchIcon,
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
    <div className="bg-[#052e25] border-b border-[#03231c] text-white p-2 flex flex-wrap items-center justify-between gap-2 shadow-md z-20 select-none">
      {/* Left Tools: Zoom, Rotate, Page Navigation */}
      <div className="flex items-center gap-2">
        {viewerOptions.zoom !== false && (
          <div className="flex items-center bg-[#03231c] rounded-lg p-0.5 border border-[#094d3f]">
            <Button
              svgIcon={zoomOutIcon}
              title="Zoom Out"
              size="small"
              onClick={onZoomOut}
              className="text-slate-300 hover:text-white"
            />
            <span className="text-[11px] font-bold px-2 text-[#7ea198]">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              svgIcon={zoomInIcon}
              title="Zoom In"
              size="small"
              onClick={onZoomIn}
              className="text-slate-300 hover:text-white"
            />
          </div>
        )}

        {viewerOptions.rotate !== false && (
          <Button
            svgIcon={arrowRotateCwIcon}
            title="Rotate Clockwise (90°)"
            size="small"
            onClick={onRotate}
            className="bg-[#03231c] border-[#094d3f] text-slate-300 hover:text-white"
          >
            Rotate
          </Button>
        )}

        {/* Page Switcher */}
        <div className="flex items-center gap-1 bg-[#03231c] px-2 py-1 rounded-lg border border-[#094d3f] text-xs font-semibold text-[#7ea198]">
          <button
            onClick={onPrevPage}
            disabled={currentPage <= 1}
            className="disabled:opacity-40 hover:text-white transition-colors"
          >
            ◀
          </button>
          <span>
            Page {currentPage} / {totalPages}
          </span>
          <button
            onClick={onNextPage}
            disabled={currentPage >= totalPages}
            className="disabled:opacity-40 hover:text-white transition-colors"
          >
            ▶
          </button>
        </div>
      </div>

      {/* Middle Tools: Search, Sign, Text, Highlight, Comments */}
      <div className="flex items-center gap-2">
        {viewerOptions.search !== false && (
          <div className="relative w-40 sm:w-48">
            <Input
              value={searchQuery}
              onChange={(e) => onSearchChange(e.value)}
              placeholder="Search document..."
              className="bg-[#03231c] text-white border-[#094d3f] text-xs rounded-md"
            />
          </div>
        )}

        {viewerOptions.signature !== false && editorOptions.enableSign !== false && (
          <Button
            themeColor="primary"
            size="small"
            onClick={onOpenSignature}
            className="font-bold text-xs shadow-sm cursor-pointer"
          >
            ✍️ Sign
          </Button>
        )}

        {viewerOptions.annotations !== false && editorOptions.enableText !== false && (
          <Button
            size="small"
            fillMode={activeTool === "text" ? "solid" : "outline"}
            themeColor={activeTool === "text" ? "info" : "base"}
            onClick={() => onSelectTool(activeTool === "text" ? "none" : "text")}
            className="text-xs"
          >
            Add Text
          </Button>
        )}

        {viewerOptions.highlight !== false && editorOptions.enableHighlight !== false && (
          <Button
            size="small"
            fillMode={activeTool === "highlight" ? "solid" : "outline"}
            themeColor={activeTool === "highlight" ? "warning" : "base"}
            onClick={() => onSelectTool(activeTool === "highlight" ? "none" : "highlight")}
            className="text-xs"
          >
            Highlight
          </Button>
        )}

        {viewerOptions.comments !== false && editorOptions.enableComments !== false && (
          <Button
            svgIcon={commentIcon}
            size="small"
            fillMode={activeTool === "comment" ? "solid" : "outline"}
            onClick={onToggleComments}
            className="text-xs"
          >
            Comments ({commentCount})
          </Button>
        )}
      </div>

      {/* Right Tools: Save, Print, Download, Export PDF */}
      <div className="flex items-center gap-2">
        {editorOptions.enableSave !== false && (
          <Button
            svgIcon={saveIcon}
            size="small"
            themeColor="success"
            onClick={onSave}
            className="font-bold text-xs"
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
            className="bg-[#03231c] border-[#094d3f]"
          />
        )}

        {viewerOptions.export !== false && editorOptions.enableExport !== false && (
          <Button
            svgIcon={filePdfIcon}
            size="small"
            themeColor="primary"
            onClick={onExport}
            className="font-bold text-xs"
          >
            Export PDF
          </Button>
        )}
      </div>
    </div>
  );
}
