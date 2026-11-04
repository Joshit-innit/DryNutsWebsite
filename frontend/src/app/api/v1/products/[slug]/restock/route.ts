import { NextRequest } from "next/server";
import { db, StockError } from "@/lib/server/db";
import { requireAdmin } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

type RestockRouteContext = { params: Promise<{ slug: string }> };

export async function POST(request: NextRequest, context: RestockRouteContext) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const { slug: productId } = await context.params;

  try {
    const { variantId, quantity } = (await request.json()) as { variantId?: string; quantity?: number };
    if (!variantId || !Number.isInteger(quantity) || quantity! <= 0) {
      return Response.json({ message: "Choose a pack size and a whole number of units." }, { status: 400 });
    }
    const stock = await db.restockVariant(productId, variantId, quantity!);
    return Response.json({ data: { stock } });
  } catch (error) {
    if (error instanceof StockError) {
      return Response.json({ message: error.message }, { status: 409 });
    }
    return Response.json({ message: "Could not update stock." }, { status: 500 });
  }
}
