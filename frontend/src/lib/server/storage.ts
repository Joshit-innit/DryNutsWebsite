import crypto from "crypto";
import { getSupabase } from "@/lib/server/supabase";

export const LANDING_BUCKET = "landing-images";
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

export class UploadError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/** Uploads an image to the public landing bucket and returns its public URL. */
export async function uploadLandingImage(file: File): Promise<string> {
  const ext = EXTENSIONS[file.type];
  if (!ext) throw new UploadError(415, "Upload a JPG, PNG, WebP or AVIF image.");
  if (file.size > MAX_UPLOAD_BYTES) throw new UploadError(413, "Images must be 5 MB or smaller.");

  const path = `landing/${Date.now()}-${crypto.randomBytes(6).toString("hex")}.${ext}`;
  const storage = getSupabase().storage.from(LANDING_BUCKET);
  const { error } = await storage.upload(path, Buffer.from(await file.arrayBuffer()), {
    contentType: file.type,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw new Error(`Supabase storage: ${error.message}`);
  return storage.getPublicUrl(path).data.publicUrl;
}

/** Deletes a previously uploaded file. URLs from anywhere else (e.g. Unsplash) are left alone. */
export async function removeLandingUpload(url: string | undefined | null): Promise<void> {
  if (!url) return;
  const marker = `/storage/v1/object/public/${LANDING_BUCKET}/`;
  const index = url.indexOf(marker);
  if (index === -1) return;
  const path = decodeURIComponent(url.slice(index + marker.length).split("?")[0]);
  await getSupabase().storage.from(LANDING_BUCKET).remove([path]);
}
