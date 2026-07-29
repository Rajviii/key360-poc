"use client";

import React, { useState } from "react";
import {
  SignatureAnnotation,
  TextAnnotation,
  HighlightAnnotation,
} from "@/modules/document-management/types";

interface AnnotationLayerProps {
  zoom: number;
  signatures: SignatureAnnotation[];
  onUpdateSignaturePos: (id: string, x: number, y: number) => void;
  onUpdateSignatureSize: (id: string, w: number, h: number) => void;
  onDeleteSignature: (id: string) => void;
  selectedSignatureId: string | null;
  onSelectSignature: (id: string | null) => void;
  texts: TextAnnotation[];
  onDeleteText: (id: string) => void;
  highlights: HighlightAnnotation[];
  onDeleteHighlight: (id: string) => void;
}

export function AnnotationLayer({
  zoom,
  signatures,
  onUpdateSignaturePos,
  onUpdateSignatureSize,
  onDeleteSignature,
  selectedSignatureId,
  onSelectSignature,
  texts,
  onDeleteText,
  highlights,
  onDeleteHighlight,
}: AnnotationLayerProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent, id: string, x: number, y: number) => {
    e.stopPropagation();
    onSelectSignature(id);
    setDraggingId(id);
    setDragOffset({
      x: e.clientX - x * zoom,
      y: e.clientY - y * zoom,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingId) return;
    const newX = (e.clientX - dragOffset.x) / zoom;
    const newY = (e.clientY - dragOffset.y) / zoom;
    onUpdateSignaturePos(draggingId, Math.max(0, newX), Math.max(0, newY));
  };

  const handleMouseUp = () => {
    setDraggingId(null);
  };

  return (
    <div
      className="absolute inset-0 pointer-events-auto"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onClick={() => onSelectSignature(null)}
    >
      {/* Highlights */}
      {highlights.map((h) => (
        <div
          key={h.id}
          style={{
            left: `${h.x * zoom}px`,
            top: `${h.y * zoom}px`,
            width: `${h.width * zoom}px`,
            height: `${h.height * zoom}px`,
            backgroundColor: h.color || "rgba(250, 204, 21, 0.4)",
          }}
          className="absolute rounded group cursor-pointer border border-transparent hover:border-amber-400"
          onClick={(e) => {
            e.stopPropagation();
            if (confirm("Delete this highlight?")) onDeleteHighlight(h.id);
          }}
        >
          <span className="hidden group-hover:inline absolute -top-5 left-0 bg-slate-800 text-white text-[9px] px-1 rounded">
            Click to remove
          </span>
        </div>
      ))}

      {/* Text Annotations */}
      {texts.map((t) => (
        <div
          key={t.id}
          style={{
            left: `${t.x * zoom}px`,
            top: `${t.y * zoom}px`,
            fontSize: `${(t.fontSize || 14) * zoom}px`,
            color: t.color || "#0f172a",
          }}
          className="absolute font-bold bg-white/80 px-1 py-0.5 border border-slate-300 rounded shadow-xs group cursor-pointer hover:border-rose-400"
          onClick={(e) => {
            e.stopPropagation();
            if (confirm(`Delete text annotation "${t.text}"?`)) onDeleteText(t.id);
          }}
        >
          {t.text}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteText(t.id);
            }}
            className="hidden group-hover:inline-block ml-1.5 text-rose-600 font-bold text-xs hover:text-rose-800"
          >
            ✕
          </button>
        </div>
      ))}

      {/* Signature Annotations (Draggable, Resizable, Deletable) */}
      {signatures.map((sig) => {
        const isSelected = selectedSignatureId === sig.id;
        const width = sig.width * zoom;
        const height = sig.height * zoom;

        return (
          <div
            key={sig.id}
            style={{
              left: `${sig.x * zoom}px`,
              top: `${sig.y * zoom}px`,
              width: `${width}px`,
              height: `${height}px`,
            }}
            onMouseDown={(e) => handleMouseDown(e, sig.id, sig.x, sig.y)}
            className={`absolute cursor-move group border-2 ${
              isSelected ? "border-emerald-500 shadow-lg bg-emerald-50/20" : "border-emerald-400/60 hover:border-emerald-500"
            } rounded p-1 transition-shadow`}
          >
            <img src={sig.dataUrl} alt="Placed Signature" className="w-full h-full object-contain pointer-events-none" />

            {/* Prominent Red Delete Badge (Always clickable on hover or selection) */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteSignature(sig.id);
              }}
              className={`absolute -top-2.5 -right-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full w-5 h-5 flex items-center justify-center font-bold text-[10px] shadow-md z-40 cursor-pointer border border-white ${
                isSelected ? "flex" : "hidden group-hover:flex"
              }`}
              title="Remove Signature"
            >
              ✕
            </button>

            {/* Action Bar Overlay */}
            <div className={`absolute top-0 left-0 bg-slate-900/90 text-white rounded-tl rounded-br px-1.5 py-0.5 z-30 text-[10px] items-center gap-1 ${isSelected ? "flex" : "hidden group-hover:flex"}`}>
              <span className="font-semibold text-emerald-400 text-[9px]">Sig</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateSignatureSize(sig.id, Math.min(300, sig.width + 20), Math.min(130, sig.height + 10));
                }}
                className="hover:text-emerald-300 font-bold px-0.5 text-xs"
                title="Enlarge"
              >
                +
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateSignatureSize(sig.id, Math.max(80, sig.width - 20), Math.max(35, sig.height - 10));
                }}
                className="hover:text-emerald-300 font-bold px-0.5 text-xs"
                title="Shrink"
              >
                -
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
