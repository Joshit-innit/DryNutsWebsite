import { NextRequest } from "next/server";
import { db } from "@/lib/server/db";
import { requireAdmin } from "@/lib/server/auth";
import { removeLandingUpload } from "@/lib/server/storage";
import { LandingImage } from "@/types";
import { validateLandingInput } from "@/lib/server/landing";

export const dynamic = "force-dynamic";

type LandingRouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: LandingRouteContext) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const { id } = await context.params;
  try {
    const body = (await request.json()) as Partial<LandingImage>;
    const invalid = validateLandingInput(body);
    if (invalid) return Response.json({ message: invalid }, { status: 400 });

    const current = await db.getLandingImage(id);
    if (!current) return Response.json({ message: "Image not found." }, { status: 404 });

    const updated = await db.updateLandingImage(id, body);
    if (updated && body.imageUrl && body.imageUrl !== current.imageUrl) {
      await removeLandingUpload(current.imageUrl);
    }
    return Response.json({ data: updated });
  } catch {
    return Response.json({ message: "Could not update that image." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: LandingRouteContext) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const { id } = await context.params;
  try {
    const deleted = await db.deleteLandingImage(id);
    if (!deleted) return Response.json({ message: "Image not found." }, { status: 404 });
    await removeLandingUpload(deleted.imageUrl);
    return Response.json({ data: { deleted: true } });
  } catch {
    return Response.json({ message: "Could not delete that image." }, { status: 500 });
  }
}
