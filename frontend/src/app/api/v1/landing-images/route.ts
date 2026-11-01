import { NextRequest } from "next/server";
import { db } from "@/lib/server/db";
import { requireAdmin } from "@/lib/server/auth";
import { removeLandingUpload } from "@/lib/server/storage";
import { validateLandingInput } from "@/lib/server/landing";
import { LandingImage, LandingSection } from "@/types";

export const dynamic = "force-dynamic";

const SECTIONS: LandingSection[] = ["hero", "featured", "category"];

export async function GET() {
  try {
    return Response.json({ data: await db.getLandingImages() });
  } catch {
    // The storefront falls back to its built-in photos when this fails.
    return Response.json({ data: [] });
  }
}

export async function POST(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  try {
    const body = (await request.json()) as Partial<LandingImage>;
    const section = body.section as LandingSection;
    if (!SECTIONS.includes(section)) {
      return Response.json({ message: "Unknown landing page section." }, { status: 400 });
    }
    if (!body.imageUrl) return Response.json({ message: "Add an image first." }, { status: 400 });
    if (section === "category" && !body.slot) {
      return Response.json({ message: "Choose a category." }, { status: 400 });
    }
    const invalid = validateLandingInput(body);
    if (invalid) return Response.json({ message: invalid }, { status: 400 });

    const existing = await db.getLandingImages();
    const replaced =
      section === "hero" ? undefined : existing.find((i) => i.section === section && (i.slot ?? null) === (body.slot ?? null));
    const nextOrder = Math.max(-1, ...existing.filter((i) => i.section === section).map((i) => i.sortOrder)) + 1;

    const saved = await db.saveLandingImage({
      section,
      slot: section === "category" ? String(body.slot) : null,
      imageUrl: body.imageUrl,
      title: String(body.title || ""),
      caption: String(body.caption || ""),
      linkUrl: String(body.linkUrl || ""),
      alt: String(body.alt || body.title || ""),
      sortOrder: replaced ? replaced.sortOrder : nextOrder,
    });
    if (replaced && replaced.imageUrl !== saved.imageUrl) await removeLandingUpload(replaced.imageUrl);
    return Response.json({ data: saved }, { status: 201 });
  } catch {
    return Response.json({ message: "Could not save that image." }, { status: 500 });
  }
}
