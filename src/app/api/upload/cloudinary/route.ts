import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import fs from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Check Cloudinary environment configuration
    const cloudName =
      process.env.CLOUDINARY_CLOUD_NAME ||
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const uploadPreset =
      process.env.CLOUDINARY_UPLOAD_PRESET ||
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // If Cloudinary credentials are configured, upload to Cloudinary API
    if (cloudName && (uploadPreset || (apiKey && apiSecret))) {
      const cloudinaryFormData = new FormData();
      const blob = new Blob([buffer], { type: file.type });
      cloudinaryFormData.append("file", blob, file.name);

      if (uploadPreset) {
        cloudinaryFormData.append("upload_preset", uploadPreset);
      } else if (apiKey && apiSecret) {
        const timestamp = Math.round(new Date().getTime() / 1000).toString();
        const strToSign = `timestamp=${timestamp}${apiSecret}`;
        const signature = crypto.createHash("sha1").update(strToSign).digest("hex");
        cloudinaryFormData.append("api_key", apiKey);
        cloudinaryFormData.append("timestamp", timestamp);
        cloudinaryFormData.append("signature", signature);
      }

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: cloudinaryFormData,
        }
      );

      if (!res.ok) {
        const errText = await res.text();
        console.error("[Cloudinary Upload Error]", errText);
        // Fallback to local save if Cloudinary rejects
      } else {
        const data = await res.json();
        return NextResponse.json({
          success: true,
          url: data.secure_url || data.url,
          public_id: data.public_id,
        });
      }
    }

    // Local fallback when Cloudinary is not configured or offline in development
    const uploadDir = path.join(process.cwd(), "public", "uploads", "instructors");
    await fs.mkdir(uploadDir, { recursive: true });

    const ext = path.extname(file.name) || ".jpg";
    const filename = `faculty_${Date.now()}_${crypto.randomBytes(4).toString("hex")}${ext}`;
    const filePath = path.join(uploadDir, filename);

    await fs.writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      url: `/uploads/instructors/${filename}`,
      isLocalFallback: true,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Upload failed";
    console.error("[Upload Route Error]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
