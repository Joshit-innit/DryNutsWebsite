import { NextRequest } from "next/server";
import { db } from "@/lib/server/db";
import { requireAdmin } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

/** Public: the storefront needs these to work out delivery and GST. */
export async function GET() {
  try {
    return Response.json({ data: await db.getSettings() });
  } catch {
    return Response.json({ message: "Could not load store settings." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  try {
    const body = await request.json();
    const storeName = String(body.storeName || "").trim();
    const supportEmail = String(body.supportEmail || "").trim();
    const freeDeliveryMin = Number(body.freeDeliveryMin);
    const gstRate = Number(body.gstRate);

    if (!storeName) {
      return Response.json({ message: "Brand name is required." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supportEmail)) {
      return Response.json({ message: "Enter a valid support email." }, { status: 400 });
    }
    if (!Number.isFinite(freeDeliveryMin) || freeDeliveryMin < 0) {
      return Response.json({ message: "Free delivery minimum cannot be negative." }, { status: 400 });
    }
    if (!Number.isFinite(gstRate) || gstRate < 0 || gstRate > 100) {
      return Response.json({ message: "GST rate must be between 0 and 100." }, { status: 400 });
    }

    const data = await db.saveSettings({
      storeName,
      supportEmail,
      freeDeliveryMin,
      gstRate,
      enforcePackingChecklist: Boolean(body.enforcePackingChecklist),
    });
    return Response.json({ data });
  } catch {
    return Response.json({ message: "Could not save store settings." }, { status: 500 });
  }
}
