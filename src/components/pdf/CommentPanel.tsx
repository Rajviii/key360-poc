"use client";

import React, { useState } from "react";
import { PDFComment } from "@/modules/document-management/types";

interface CommentPanelProps {
  comments: PDFComment[];
  onAddComment: (author: string, text: string, x: number, y: number) => void;
  onDeleteComment: (id: string) => void;
  onClose: () => void;
}

export function CommentPanel({
  comments,
  onAddComment,
  onDeleteComment,
  onClose,
}: CommentPanelProps) {
  const [newText, setNewText] = useState("");
  const [author, setAuthor] = useState("Rajvi (Asset Mgr)");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newText.trim()) {
      onAddComment(author, newText.trim(), 200, 300);
      setNewText("");
    }
  };

  return (
    <div className="w-80 bg-white border-l border-slate-200 h-full flex flex-col shadow-lg z-30 flex-shrink-0 font-sans">
      {/* Header */}
      <div className="p-3.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-amber-500 font-bold">💬</span>
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Document Comments ({comments.length})
          </h3>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 font-bold text-xs p-1"
        >
          ✕
        </button>
      </div>

      {/* Comment List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs italic">
            No sticky comments added yet. Click on the document sheet or add a comment below.
          </div>
        ) : (
          comments.map((c) => (
            <div
              key={c.id}
              className="bg-amber-50/60 border border-amber-200 rounded-lg p-3 space-y-1.5 shadow-2xs"
            >
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-slate-800">{c.author}</span>
                <span className="text-[10px] text-slate-400">{c.timestamp}</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">{c.text}</p>
              <div className="flex justify-between items-center text-[10px] text-slate-400 border-t border-amber-200/60 pt-1.5 mt-1">
                <span>Page {c.page}</span>
                <button
                  onClick={() => onDeleteComment(c.id)}
                  className="text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Comment Input */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-slate-100 bg-slate-50 space-y-2">
        <input
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Author Name"
          className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white font-semibold text-slate-700"
        />
        <textarea
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="Type sticky comment..."
          rows={2}
          className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
        <button
          type="submit"
          className="w-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold py-1.5 rounded cursor-pointer transition-colors"
        >
          Post Comment
        </button>
      </form>
    </div>
  );
}
