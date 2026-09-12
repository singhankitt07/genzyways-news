import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isAdminSession } from "@/lib/auth";
import { put } from "@vercel/blob";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

// Uploads a file to Vercel Blob storage and returns its public URL.
// Requires a Blob store connected to your Vercel project (free tier available) —
// Vercel injects BLOB_READ_WRITE_TOKEN automatically once one is attached.
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!isAdminSession(session)) return NextResponse.json({ error: "Owner access required" }, { status: 403 });

  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
  const maxSize = 10 * 1024 * 1024;
  if (!allowedTypes.has(file.type)) {
    return NextResponse.json({ error: "Please choose a JPG, PNG, WEBP, or GIF image." }, { status: 400 });
  }
  if (file.size > maxSize) {
    return NextResponse.json({ error: "Images must be 10 MB or smaller." }, { status: 400 });
  }

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`articles/${Date.now()}-${file.name}`, file, {
      access: "public"
    });

    return NextResponse.json({ url: blob.url });
  }

  if (process.env.VERCEL) {
    return NextResponse.json(
      { error: "Image upload needs a Vercel Blob store. Add BLOB_READ_WRITE_TOKEN in your deployment settings." },
      { status: 501 }
    );
  }

  // Keep local and self-hosted development usable without a cloud storage token.
  const extension = path.extname(file.name).toLowerCase() || ".jpg";
  const fileName = `article-${Date.now()}-${crypto.randomUUID()}${extension}`;
  const uploadDirectory = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDirectory, { recursive: true });
  await writeFile(path.join(uploadDirectory, fileName), Buffer.from(await file.arrayBuffer()));

  return NextResponse.json({ url: `/uploads/${fileName}` });
}
