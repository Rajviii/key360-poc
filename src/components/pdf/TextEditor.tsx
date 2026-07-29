"use client";

import React, { useState } from "react";

interface TextEditorProps {
  x: number;
  y: number;
  onSave: (text: string) => void;
  onCancel: () => void;
}

export function TextEditor({ x, y, onSave, onCancel }: TextEditorProps) {
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSave(text.trim());
    } else {
      onCancel();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ left: `${x}px`, top: `${y}px` }}
      className="absolute bg-white border border-emerald-500 rounded-lg shadow-xl p-2 z-40 flex items-center gap-1.5 min-w-[220px]"
    >
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type text annotation..."
        autoFocus
        className="text-xs px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 w-full"
      />
      <button
        type="submit"
        className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs px-2.5 py-1 rounded font-bold cursor-pointer"
      >
        Add
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="text-slate-400 hover:text-slate-600 text-xs px-1 font-bold cursor-pointer"
      >
        ✕
      </button>
    </form>
  );
}
