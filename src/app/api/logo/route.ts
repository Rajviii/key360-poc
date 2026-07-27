import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const srcPath = path.join(process.cwd(), "src", "constants", "favicon.ico");
    
    // Ensure app/favicon.ico and public/favicon.ico are also kept in sync
    const appFaviconPath = path.join(process.cwd(), "src", "app", "favicon.ico");
    const publicFaviconPath = path.join(process.cwd(), "public", "favicon.ico");

    if (fs.existsSync(srcPath)) {
      try {
        fs.copyFileSync(srcPath, appFaviconPath);
        fs.copyFileSync(srcPath, publicFaviconPath);
      } catch {
        // Silently catch write permission or locking errors if already in use
      }

      const fileBuffer = fs.readFileSync(srcPath);
      return new NextResponse(fileBuffer, {
        headers: {
          "Content-Type": "image/x-icon",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    return new NextResponse("Icon not found", { status: 404 });
  } catch (error) {
    console.error("Error serving logo favicon:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
