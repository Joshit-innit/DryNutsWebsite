import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/server/auth";
import { UploadError, uploadLandingImage } from "@/lib/server/storage";

export const dynamic = "force-dynamic";

/** Admin image upload (multipart/form-data, field "file"). Returns the public URL. */
export async function POST(request: NextRequest) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return Response.json({ message: "Choose an image to upload." }, { status: 400 });
    }
    const url = await uploadLandingImage(file);
    return Response.json({ data: { url } }, { status: 201 });
  } catch (error) {
    if (error instanceof UploadError) {
      return Response.json({ message: error.message }, { status: error.status });
    }
    return Response.json({ message: "Could not upload that image." }, { status: 500 });
  }
}
