/**
 * PDF Loader utility for parsing and preparing document pages
 */
export class PDFLoader {
  static async loadDocument(source: string | Blob): Promise<{ totalPages: number; title: string }> {
    // Standard mock document meta loader
    return {
      totalPages: 3,
      title: typeof source === "string" ? source : "Document",
    };
  }

  static renderPageToCanvas(
    canvas: HTMLCanvasElement,
    pageNumber: number,
    zoom = 1.0,
    rotation = 0,
    title = "Enterprise Document"
  ) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const baseWidth = 650;
    const baseHeight = 850;

    const width = baseWidth * zoom;
    const height = baseHeight * zoom;

    canvas.width = width;
    canvas.height = height;

    ctx.save();

    // Background sheet page
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    // Apply rotation transformation centered
    ctx.translate(width / 2, height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-width / 2, -height / 2);

    // Draw document page borders
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 1 * zoom;
    ctx.strokeRect(0, 0, width, height);

    // Header bar on canvas
    ctx.fillStyle = "#052e25";
    ctx.fillRect(20 * zoom, 20 * zoom, (baseWidth - 40) * zoom, 50 * zoom);

    ctx.fillStyle = "#ffffff";
    ctx.font = `bold ${Math.round(14 * zoom)}px sans-serif`;
    ctx.fillText("KEY360 ENTERPRISE ASSET MANAGEMENT PORTAL", 35 * zoom, 50 * zoom);

    // Document Title
    ctx.fillStyle = "#1e293b";
    ctx.font = `bold ${Math.round(18 * zoom)}px sans-serif`;
    ctx.fillText(`${title} (Page ${pageNumber} of 3)`, 40 * zoom, 110 * zoom);

    // Decorative document lines mimicking real contract / inspection form layout
    ctx.fillStyle = "#64748b";
    ctx.font = `${Math.round(11 * zoom)}px sans-serif`;
    ctx.fillText(`Document Reference: KEY360-DOC-2026-v2.0 | Page ${pageNumber}`, 40 * zoom, 130 * zoom);

    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(40 * zoom, 145 * zoom);
    ctx.lineTo((baseWidth - 40) * zoom, 145 * zoom);
    ctx.stroke();

    // Mock contract/form body text lines
    ctx.fillStyle = "#334155";
    ctx.font = `${Math.round(12 * zoom)}px sans-serif`;

    const sampleParagraphs = [
      "1. PARTIES & RECITALS",
      "This Master Agreement & Inspection Record is entered into pursuant to key360 enterprise framework rules.",
      "The Vendor / Operator certifies that all equipment, physical items, and staff meet compliance guidelines.",
      "",
      "2. SCOPE OF SERVICES & ASSET STANDARDS",
      "All heavy machinery, turbine systems, and HVAC units specified under this agreement shall be maintained",
      "in strict alignment with ISO-55000 Asset Management standards and local regulatory protocols.",
      "",
      "3. WARRANTIES, LIABILITIES & SAFETY AUDIT",
      "Neither party shall be liable for indirect or consequential damages. Inspection records must be digitally signed",
      "by an authorized Asset Inspector and retained in the Key360 Document Management vault for auditing.",
      "",
      "4. AUTHORIZED EXECUTION & DIGITAL STAMP",
      "Signatures affixed below confirm complete approval of the contract terms and inspection findings.",
    ];

    let startY = 175 * zoom;
    sampleParagraphs.forEach((line) => {
      if (line.startsWith("1.") || line.startsWith("2.") || line.startsWith("3.") || line.startsWith("4.")) {
        ctx.fillStyle = "#042820";
        ctx.font = `bold ${Math.round(13 * zoom)}px sans-serif`;
      } else {
        ctx.fillStyle = "#475569";
        ctx.font = `${Math.round(11 * zoom)}px sans-serif`;
      }
      ctx.fillText(line, 40 * zoom, startY);
      startY += 24 * zoom;
    });

    ctx.restore();
  }
}
