import { NextRequest } from "next/server";
import { db } from "@/lib/server/db";
import { getRequestUser, requireAdmin } from "@/lib/server/auth";
import { normalizeProductImages } from "@/lib/product-images";
import { slugify } from "@/lib/utils";
import { Product } from "@/types";

export const dynamic = "force-dynamic";

type ProductRouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(request: NextRequest, context: ProductRouteContext) {
  const { slug } = await context.params;
  const product = db.getProductBySlug(slug);
  const isAdmin = getRequestUser(request)?.role === "ADMIN";

  if (!product || (product.status !== "published" && !isAdmin)) {
    return Response.json({ message: "Product not found." }, { status: 404 });
  }

  return Response.json({ data: normalizeProductImages(product) });
}

export async function PATCH(request: NextRequest, context: ProductRouteContext) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const { slug } = await context.params;

  try {
    const { id: _ignoredId, ...body } = (await request.json()) as Partial<Product>;
    const updates: Partial<Product> = { ...body };

    if (body.slug !== undefined) {
      const nextSlug = slugify(body.slug);
      const current = db.getProductBySlug(slug);
      const clash = db.getProducts().some((p) => p.slug === nextSlug && p.id !== current?.id);
      if (!nextSlug || clash) {
        return Response.json({ message: "That URL slug is already used by another product." }, { status: 409 });
      }
      updates.slug = nextSlug;
    }

    if (body.variants !== undefined && !body.variants.length) {
      return Response.json({ message: "Add at least one product variant." }, { status: 400 });
    }

    const updated = db.updateProduct(slug, updates);

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

export async function DELETE(request: NextRequest, context: ProductRouteContext) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const { slug } = await context.params;
  const deleted = db.deleteProduct(slug);

  if (!deleted) {
    return Response.json({ message: "Product not found." }, { status: 404 });
  }

  return Response.json({ data: { deleted: true } });
}
