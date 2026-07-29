import { useState, useCallback } from "react";
import {
  TextAnnotation,
  HighlightAnnotation,
  PDFComment,
} from "@/modules/document-management/types";

export type AnnotationTool = "none" | "text" | "highlight" | "comment" | "sign";

export function usePDFAnnotations(
  initialTexts: TextAnnotation[] = [],
  initialHighlights: HighlightAnnotation[] = [],
  initialComments: PDFComment[] = []
) {
  const [activeTool, setActiveTool] = useState<AnnotationTool>("none");
  const [texts, setTexts] = useState<TextAnnotation[]>(initialTexts);
  const [highlights, setHighlights] = useState<HighlightAnnotation[]>(initialHighlights);
  const [comments, setComments] = useState<PDFComment[]>(initialComments);
  const [activeCommentPanelOpen, setActiveCommentPanelOpen] = useState(false);

  const addText = useCallback((text: string, x: number, y: number, page = 1) => {
    const newText: TextAnnotation = {
      id: `txt-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      text,
      x,
      y,
      fontSize: 14,
      color: "#0f172a",
      page,
    };
    setTexts((prev) => [...prev, newText]);
    setActiveTool("none");
  }, []);

  const removeText = useCallback((id: string) => {
    setTexts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addHighlight = useCallback(
    (x: number, y: number, width: number, height: number, page = 1) => {
      const newHighlight: HighlightAnnotation = {
        id: `hl-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        x,
        y,
        width,
        height,
        color: "rgba(250, 204, 21, 0.4)", // Yellow semi-transparent
        page,
      };
      setHighlights((prev) => [...prev, newHighlight]);
      setActiveTool("none");
    },
    []
  );

  const removeHighlight = useCallback((id: string) => {
    setHighlights((prev) => prev.filter((h) => h.id !== id));
  }, []);

  const addComment = useCallback(
    (author: string, text: string, x: number, y: number, page = 1) => {
      const newComment: PDFComment = {
        id: `c-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        author: author || "Inspector",
        text,
        timestamp: new Date().toLocaleString([], {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        x,
        y,
        page,
      };
      setComments((prev) => [...prev, newComment]);
      setActiveCommentPanelOpen(true);
      setActiveTool("none");
    },
    []
  );

  const removeComment = useCallback((id: string) => {
    setComments((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return {
    activeTool,
    setActiveTool,
    texts,
    setTexts,
    addText,
    removeText,
    highlights,
    setHighlights,
    addHighlight,
    removeHighlight,
    comments,
    setComments,
    addComment,
    removeComment,
    activeCommentPanelOpen,
    setActiveCommentPanelOpen,
  };
}
