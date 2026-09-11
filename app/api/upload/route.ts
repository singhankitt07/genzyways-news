import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { put } from "@vercel/blob";

// Uploads a file to Vercel Blob storage and returns its public URL.
// Requires a Blob store connected to your Vercel project (free tier available) —
// Vercel injects BLOB_READ_WRITE_TOKEN automatically once one is attached.
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "Image upload isn't configured yet. Add a Blob store in your Vercel project settings, or paste an image URL instead." },
      { status: 501 }
    );
  }

  const blob = await put(`articles/${Date.now()}-${file.name}`, file, {
    access: "public"
  });

  return NextResponse.json({ url: blob.url });
}
