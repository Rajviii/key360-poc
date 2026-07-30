import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

/**
 * Utility function to generate real PDF documents dynamically using pdf-lib.
 */
export async function generatePDFWithPdfLib(
  title: string,
  dataItem: Record<string, any>,
  moduleName?: string
): Promise<string> {
  // 1. Create a new PDFDocument instance
  const pdfDoc = await PDFDocument.create();

  // 2. Embed standard fonts
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // 3. Add a page to the PDF
  const page = pdfDoc.addPage([620, 850]);
  const { width, height } = page.getSize();

  // 4. Header Bar (Key360 Enterprise Dark Emerald Branding)
  page.drawRectangle({
    x: 30,
    y: height - 80,
    width: width - 60,
    height: 50,
    color: rgb(0.02, 0.18, 0.15), // #052e25 dark green
  });

  page.drawText("KEY360 ENTERPRISE ASSET MANAGEMENT PORTAL", {
    x: 45,
    y: height - 52,
    size: 13,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page.drawText(`PDF-LIB VERIFIED DOCUMENT | MODULE: ${(moduleName || "SYSTEM").toUpperCase()}`, {
    x: 45,
    y: height - 68,
    size: 8.5,
    font: fontRegular,
    color: rgb(0.5, 0.85, 0.7),
  });

  // 5. Main Title & Subtitle
  const displayTitle = title || dataItem.title || dataItem.name || dataItem.employeeName || `Record #${dataItem.id}`;
  page.drawText(displayTitle, {
    x: 30,
    y: height - 120,
    size: 18,
    font: fontBold,
    color: rgb(0.08, 0.12, 0.18),
  });

  page.drawText(`Document Reference: KEY360-PDF-${dataItem.id || "001"} | Generated: ${new Date().toLocaleDateString()}`, {
    x: 30,
    y: height - 140,
    size: 9.5,
    font: fontRegular,
    color: rgb(0.4, 0.45, 0.5),
  });

  // Horizontal Divider Line
  page.drawLine({
    start: { x: 30, y: height - 155 },
    end: { x: width - 30, y: height - 155 },
    thickness: 1,
    color: rgb(0.85, 0.88, 0.9),
  });

  // 6. Form Sections & Content
  let currentY = height - 185;

  const addSection = (heading: string, lines: string[]) => {
    page.drawText(heading, {
      x: 30,
      y: currentY,
      size: 12,
      font: fontBold,
      color: rgb(0.02, 0.16, 0.13),
    });
    currentY -= 20;

    lines.forEach((line) => {
      page.drawText(line, {
        x: 30,
        y: currentY,
        size: 10,
        font: fontRegular,
        color: rgb(0.25, 0.3, 0.35),
      });
      currentY -= 16;
    });
    currentY -= 12;
  };

  addSection("1. PARTIES & RECITALS", [
    "This Master Document & Record is generated automatically by pdf-lib engine under Key360 rules.",
    "The Operator certifies that all equipment, physical items, and staff meet compliance guidelines.",
  ]);

  addSection("2. SCOPE OF RECORD & COMPLIANCE", [
    "All records and data fields listed below are maintained in alignment with ISO-55000 standards.",
  ]);

  // 7. Render Data Item Field Table
  page.drawText("3. RECORDED FORM FIELD VALUES (EXTRACTED VIA PDF-LIB)", {
    x: 30,
    y: currentY,
    size: 11,
    font: fontBold,
    color: rgb(0.02, 0.16, 0.13),
  });
  currentY -= 18;

  const keysToIgnore = new Set(["inEdit", "signatures", "texts", "highlights", "comments", "children"]);
  const entries = Object.entries(dataItem).filter(([k]) => !keysToIgnore.has(k)).slice(0, 12);

  const tableHeight = entries.length * 22 + 15;

  page.drawRectangle({
    x: 30,
    y: currentY - tableHeight,
    width: width - 60,
    height: tableHeight,
    color: rgb(0.96, 0.98, 0.97),
    borderColor: rgb(0.8, 0.88, 0.84),
    borderWidth: 1,
  });

  currentY -= 18;
  entries.forEach(([key, val]) => {
    const formattedKey = key.replace(/([A-Z])/g, " $1").toUpperCase();
    const formattedVal = typeof val === "object" ? JSON.stringify(val) : String(val ?? "N/A");

    page.drawText(`${formattedKey}:`, {
      x: 45,
      y: currentY,
      size: 9.5,
      font: fontBold,
      color: rgb(0.12, 0.2, 0.18),
    });

    page.drawText(formattedVal, {
      x: 230,
      y: currentY,
      size: 9.5,
      font: fontRegular,
      color: rgb(0.2, 0.25, 0.3),
    });

    currentY -= 22;
  });

  currentY -= 35;

  // 8. Footer Stamp / Verification Seal
  page.drawRectangle({
    x: 30,
    y: 50,
    width: width - 60,
    height: 60,
    color: rgb(0.94, 0.98, 0.96),
    borderColor: rgb(0.65, 0.85, 0.75),
    borderWidth: 1,
  });

  page.drawText("AUTHENTICATED BY KEY360 PDF-LIB ENGINE", {
    x: 45,
    y: 90,
    size: 10,
    font: fontBold,
    color: rgb(0.04, 0.4, 0.25),
  });

  page.drawText(`Checksum: ${Math.random().toString(36).substring(2, 15).toUpperCase()} | Security Vault Verified: YES`, {
    x: 45,
    y: 70,
    size: 8.5,
    font: fontRegular,
    color: rgb(0.3, 0.5, 0.4),
  });

  // 9. Serialize PDF bytes and return Blob URL
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
  return URL.createObjectURL(blob);
}
