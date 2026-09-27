import { NextRequest } from "next/server";
import { db } from "@/lib/server/db";
import { normalizeProductImages } from "@/lib/product-images";

export const dynamic = "force-dynamic";

type ProductRouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: NextRequest, context: ProductRouteContext) {
  const { slug } = await context.params;
  const product = db.getProductBySlug(slug);

  if (!product) {
    return Response.json({ message: "Product not found." }, { status: 404 });
  }

  return Response.json({ data: normalizeProductImages(product) });
}

export async function PATCH(request: NextRequest, context: ProductRouteContext) {
  const { slug } = await context.params;

  try {
    const body = await request.json();
    const updated = db.updateProduct(slug, normalizeProductImages(body));

    if (!updated) {
      return Response.json({ message: "Product not found." }, { status: 404 });
    }

    return Response.json({ data: normalizeProductImages(updated) });
  } catch {
    return Response.json({ message: "Could not update product." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: ProductRouteContext) {
  return PATCH(request, context);
}

export async function DELETE(_request: NextRequest, context: ProductRouteContext) {
  const { slug } = await context.params;
  const deleted = db.deleteProduct(slug);

  if (!deleted) {
    return Response.json({ message: "Product not found." }, { status: 404 });
  }

  return Response.json({ data: { deleted: true } });
}
