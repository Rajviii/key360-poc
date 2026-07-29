import {
  SignatureAnnotation,
  TextAnnotation,
  HighlightAnnotation,
  PDFComment,
} from "@/modules/document-management/types";

export class PDFEditor {
  static renderAnnotationsToCanvas(
    canvas: HTMLCanvasElement,
    zoom = 1.0,
    signatures: SignatureAnnotation[] = [],
    texts: TextAnnotation[] = [],
    highlights: HighlightAnnotation[] = [],
    comments: PDFComment[] = [],
    formValues: Record<string, any> = {}
  ) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Render Highlights
    highlights.forEach((h) => {
      ctx.fillStyle = h.color || "rgba(250, 204, 21, 0.4)";
      ctx.fillRect(h.x * zoom, h.y * zoom, h.width * zoom, h.height * zoom);
    });

    // Render Form Field Entries onto Document Sheet with Multi-line Text Wrapping
    const formEntries = Object.entries(formValues).filter(
      ([_, v]) => v !== undefined && v !== "" && v !== false
    );
    if (formEntries.length > 0) {
      const startX = 40 * zoom;
      let startY = 510 * zoom;
      const maxTextWidth = 380 * zoom;
      const lineHeight = 16 * zoom;

      let totalLines = 0;
      ctx.font = `${Math.round(10 * zoom)}px sans-serif`;

      const formattedEntries = formEntries.map(([key, val]) => {
        const formattedKey = key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());
        const textVal = typeof val === "boolean" ? (val ? "Yes / Checked" : "No") : String(val);

        const words = textVal.split(" ");
        const lines: string[] = [];
        let currentLine = "";

        words.forEach((w) => {
          const testLine = currentLine ? `${currentLine} ${w}` : w;
          if (ctx.measureText(testLine).width > maxTextWidth && currentLine) {
            lines.push(currentLine);
            currentLine = w;
          } else {
            currentLine = testLine;
          }
        });
        if (currentLine) lines.push(currentLine);

        totalLines += Math.max(1, lines.length);
        return { key: formattedKey, lines };
      });

      const boxHeight = (32 + totalLines * 18) * zoom;

      ctx.save();
      ctx.fillStyle = "#f8fafc";
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 1 * zoom;
      ctx.fillRect(startX, startY, 570 * zoom, boxHeight);
      ctx.strokeRect(startX, startY, 570 * zoom, boxHeight);

      ctx.fillStyle = "#047857";
      ctx.font = `bold ${Math.round(11 * zoom)}px sans-serif`;
      ctx.fillText("📝 RECORDED FORM FIELD VALUES", startX + 12 * zoom, startY + 18 * zoom);

      startY += 34 * zoom;
      formattedEntries.forEach(({ key, lines }) => {
        ctx.fillStyle = "#334155";
        ctx.font = `bold ${Math.round(10 * zoom)}px sans-serif`;
        ctx.fillText(`${key}:`, startX + 15 * zoom, startY);

        ctx.fillStyle = "#0f172a";
        ctx.font = `${Math.round(10 * zoom)}px sans-serif`;
        lines.forEach((line, idx) => {
          ctx.fillText(line, startX + 160 * zoom, startY + idx * lineHeight);
        });

        startY += lines.length * lineHeight + 4 * zoom;
      });
      ctx.restore();
    }

    // Render Text Annotations
    texts.forEach((t) => {
      ctx.fillStyle = t.color || "#0f172a";
      ctx.font = `bold ${Math.round((t.fontSize || 14) * zoom)}px sans-serif`;
      ctx.fillText(t.text, t.x * zoom, t.y * zoom);
    });

    // Render Sticky Comment Badges
    comments.forEach((c) => {
      ctx.fillStyle = "#eab308";
      ctx.beginPath();
      ctx.arc(c.x * zoom, c.y * zoom, 12 * zoom, 0, 2 * Math.PI);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = `bold ${Math.round(10 * zoom)}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("💬", c.x * zoom, c.y * zoom);
    });
  }

  /**
   * Preloads signature images asynchronously and draws them onto the canvas context
   */
  static async renderSignaturesToCanvasAsync(
    canvas: HTMLCanvasElement,
    zoom = 1.0,
    signatures: SignatureAnnotation[] = []
  ): Promise<void> {
    const ctx = canvas.getContext("2d");
    if (!ctx || signatures.length === 0) return;

    const promises = signatures.map((sig) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          ctx.drawImage(img, sig.x * zoom, sig.y * zoom, sig.width * zoom, sig.height * zoom);
          resolve();
        };
        img.onerror = () => resolve();
        img.src = sig.dataUrl;
      });
    });

    await Promise.all(promises);
  }
}
