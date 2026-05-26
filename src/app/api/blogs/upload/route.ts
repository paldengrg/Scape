import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { auth } from "@/auth";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    let buffer: Buffer;
    let filename: string;

    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const body = await request.json();
      const { file, filename: providedFilename } = body;
      if (!file) {
        return new NextResponse("No file uploaded", { status: 400 });
      }
      const base64Data = file.split(";base64,").pop();
      buffer = Buffer.from(base64Data, "base64");
      filename = providedFilename || "uploaded_image.png";
    } else {
      const formData = await request.formData();
      const file = formData.get("file") as File;
      if (!file) {
        return new NextResponse("No file uploaded", { status: 400 });
      }
      buffer = Buffer.from(await file.arrayBuffer());
      filename = file.name;
    }

    // Create upload directory in public if it doesn't exist
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    // Generate unique name
    const uniqueFilename = `${Date.now()}-${filename.replace(/\s+/g, "_")}`;
    const filePath = path.join(uploadDir, uniqueFilename);
    
    await writeFile(filePath, buffer);

    return NextResponse.json({ url: `/uploads/${uniqueFilename}` });
  } catch (error) {
    console.error("UPLOAD_ERROR", error);
    return new NextResponse("Upload failed", { status: 500 });
  }
}
