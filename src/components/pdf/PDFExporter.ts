import { PDFExportOptions } from "@/hooks/pdf/usePDFExport";
import { PDFLoader } from "./PDFLoader";
import { PDFEditor } from "./PDFEditor";

export class PDFExporter {
  /**
   * Generates a 100% valid PDF 1.4 binary file embedding the rendered document canvas image
   */
  static async exportDocument(options: PDFExportOptions) {
    const title = options.fileName || "Document_Export";
    const exportZoom = 1.5;

    // Create a fresh off-screen canvas for export
    const exportCanvas = document.createElement("canvas");
    PDFLoader.renderPageToCanvas(exportCanvas, 1, exportZoom, 0, title);

    // Render highlights, form values with text wrapping, text annotations, comments
    PDFEditor.renderAnnotationsToCanvas(
      exportCanvas,
      exportZoom,
      options.signatures || [],
      options.texts || [],
      options.highlights || [],
      options.comments || [],
      options.formValues || {}
    );

    // Preload signature images asynchronously and draw onto export canvas
    await PDFEditor.renderSignaturesToCanvasAsync(
      exportCanvas,
      exportZoom,
      options.signatures || []
    );

    try {
      const imgDataUrl = exportCanvas.toDataURL("image/jpeg", 0.95);
      const base64Data = imgDataUrl.split(",")[1];
      const binaryImg = atob(base64Data);
      const imgLength = binaryImg.length;

      const imgWidth = exportCanvas.width || 975;
      const imgHeight = exportCanvas.height || 1275;
      const pdfPageWidth = 612; // 8.5 inches at 72 dpi
      const pdfPageHeight = Math.round((imgHeight / imgWidth) * pdfPageWidth);

      // Standard PDF 1.4 Objects
      const header = `%PDF-1.4\n`;
      const obj1 = `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`;
      const obj2 = `2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n`;
      const obj3 = `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pdfPageWidth} ${pdfPageHeight}] /Resources << /XObject << /Img1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n`;
      const obj4Header = `4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${imgWidth} /Height ${imgHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imgLength} >>\nstream\n`;
      const obj4Footer = `\nendstream\nendobj\n`;

      const contentStream = `q\n${pdfPageWidth} 0 0 ${pdfPageHeight} 0 0 cm\n/Img1 Do\nQ\n`;
      const obj5 = `5 0 obj\n<< /Length ${contentStream.length} >>\nstream\n${contentStream}endstream\nendobj\n`;

      // Calculate exact byte offsets for PDF cross-reference (xref) table
      let offset = header.length;
      const offsets: number[] = [0];

      offsets.push(offset); // Obj 1
      offset += obj1.length;

      offsets.push(offset); // Obj 2
      offset += obj2.length;

      offsets.push(offset); // Obj 3
      offset += obj3.length;

      offsets.push(offset); // Obj 4
      offset += obj4Header.length + imgLength + obj4Footer.length;

      offsets.push(offset); // Obj 5
      const xrefOffset = offset + obj5.length;

      let xref = `xref\n0 6\n0000000000 65535 f \n`;
      for (let i = 1; i <= 5; i++) {
        xref += String(offsets[i]).padStart(10, "0") + " 00000 n \n";
      }

      const trailer = `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

      // Encode binary buffer
      const encoder = new TextEncoder();
      const part1 = encoder.encode(header + obj1 + obj2 + obj3 + obj4Header);
      const imgBytes = new Uint8Array(imgLength);
      for (let i = 0; i < imgLength; i++) {
        imgBytes[i] = binaryImg.charCodeAt(i);
      }
      const part2 = encoder.encode(obj4Footer + obj5 + xref + trailer);

      const pdfBuffer = new Uint8Array(part1.length + imgBytes.length + part2.length);
      pdfBuffer.set(part1, 0);
      pdfBuffer.set(imgBytes, part1.length);
      pdfBuffer.set(part2, part1.length + imgBytes.length);

      const blob = new Blob([pdfBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, "_")}_exported.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to export PDF binary:", err);
    }
  }
}
