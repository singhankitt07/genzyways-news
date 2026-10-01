import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, hasStaffRole } from "@/lib/auth";
import { put } from "@vercel/blob";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

// Uploads a file to Vercel Blob storage and returns its public URL.
// Requires a Blob store connected to your Vercel project (free tier available) —
// Vercel injects BLOB_READ_WRITE_TOKEN automatically once one is attached.
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!hasStaffRole(session, ["ADMIN", "EDITOR"])) return NextResponse.json({ error: "Editor access required" }, { status: 403 });

  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const kindValue = form.get("kind");
  const kind = kindValue === "video" ? "video" : kindValue === "ebook" ? "ebook" : "image";
  const extension = path.extname(file.name).toLowerCase();
  const allowedTypes = kind === "video"
    ? new Set(["video/mp4", "video/webm", "video/quicktime"])
    : kind === "ebook"
      ? new Set(["application/pdf", "application/epub+zip", "application/octet-stream", ""])
      : new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
  const validEbookType = kind !== "ebook" || (extension === ".pdf" || extension === ".epub");
  const maxSize = kind === "video" ? 100 * 1024 * 1024 : kind === "ebook" ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
  if (!allowedTypes.has(file.type) || !validEbookType) {
    const error = kind === "video"
      ? "Please choose an MP4, WEBM, or MOV video."
      : kind === "ebook"
        ? "Please choose a PDF or EPUB file."
        : "Please choose a JPG, PNG, WEBP, or GIF image.";
    return NextResponse.json({ error }, { status: 400 });
  }
  if (file.size > maxSize) {
    const limit = kind === "video" ? "100 MB" : kind === "ebook" ? "50 MB" : "10 MB";
    return NextResponse.json({ error: `Files must be ${limit} or smaller.` }, { status: 400 });
  }

  const useBlobStorage = process.env.NODE_ENV === "production" && Boolean(process.env.BLOB_READ_WRITE_TOKEN);
  if (useBlobStorage) {
    const folder = kind === "video" ? "videos" : kind === "ebook" ? "ebooks" : "articles";
    const blob = await put(`${folder}/${Date.now()}-${file.name}`, file, {
      access: "public"
    });

    return NextResponse.json({ url: blob.url });
  }

  if (process.env.VERCEL && process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Image upload needs a Vercel Blob store. Add BLOB_READ_WRITE_TOKEN in your deployment settings." },
      { status: 501 }
    );
  }

  // Keep local and self-hosted development usable without a cloud storage token.
  const safeExtension = extension || ".jpg";
  const fileName = `${kind}-${Date.now()}-${crypto.randomUUID()}${safeExtension}`;
  const uploadDirectory = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDirectory, { recursive: true });
  await writeFile(path.join(uploadDirectory, fileName), Buffer.from(await file.arrayBuffer()));

  return NextResponse.json({ url: `/uploads/${fileName}` });
}
