"use client";

import React, { useState } from "react";

interface HighlightLayerProps {
  onAddHighlight: (x: number, y: number, width: number, height: number) => void;
  zoom: number;
}

export function HighlightLayer({ onAddHighlight, zoom }: HighlightLayerProps) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    setStartPos({ x, y });
    setCurrentPos({ x, y });
    setIsDrawing(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    setCurrentPos({ x, y });
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const x = Math.min(startPos.x, currentPos.x);
    const y = Math.min(startPos.y, currentPos.y);
    const width = Math.abs(currentPos.x - startPos.x);
    const height = Math.abs(currentPos.y - startPos.y);

    if (width > 10 && height > 8) {
      onAddHighlight(x, y, width, height);
    }
  };

  const drawX = Math.min(startPos.x, currentPos.x) * zoom;
  const drawY = Math.min(startPos.y, currentPos.y) * zoom;
  const drawW = Math.abs(currentPos.x - startPos.x) * zoom;
  const drawH = Math.abs(currentPos.y - startPos.y) * zoom;

  return (
    <div
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className="absolute inset-0 cursor-crosshair z-30 select-none"
    >
      {isDrawing && (
        <div
          style={{
            left: `${drawX}px`,
            top: `${drawY}px`,
            width: `${drawW}px`,
            height: `${drawH}px`,
          }}
          className="absolute border-2 border-dashed border-amber-500 bg-amber-300/40 rounded"
        />
      )}
    </div>
  );
}
