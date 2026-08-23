import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { CategorySlug, Product } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") as CategorySlug | null;
  const search = (searchParams.get("search") || "").toLowerCase();
  const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined;
  const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined;
  const rating = searchParams.get("rating") ? Number(searchParams.get("rating")) : undefined;
  const inStockOnly = searchParams.get("inStockOnly") === "true";
  const sortBy = searchParams.get("sortBy") || "popularity";

  let products = db.getProducts();

  // Category filter
  if (category && category !== "all") {
    products = products.filter(
      (p) => p.categorySlug === category || p.categoryName?.toLowerCase() === category
    );
  }

  // Search filter
  if (search) {
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(search) ||
        p.description.toLowerCase().includes(search) ||
        p.categoryName.toLowerCase().includes(search) ||
        p.tags?.some((t) => t.toLowerCase().includes(search))
    );
  }

  // Price filter (based on lowest variant price)
  if (minPrice !== undefined || maxPrice !== undefined) {
    products = products.filter((p) => {
      const minVariantPrice = Math.min(...p.variants.map((v) => v.price));
      if (minPrice !== undefined && minVariantPrice < minPrice) return false;
      if (maxPrice !== undefined && minVariantPrice > maxPrice) return false;
      return true;
    });
  }

  // Rating filter
  if (rating !== undefined) {
    products = products.filter((p) => (p.rating || 0) >= rating);
  }

  // Stock filter
  if (inStockOnly) {
    products = products.filter((p) => p.variants.some((v) => v.stock > 0));
  }

  // Sorting
  switch (sortBy) {
    case "price-asc":
      products.sort((a, b) => Math.min(...a.variants.map((v) => v.price)) - Math.min(...b.variants.map((v) => v.price)));
      break;
    case "price-desc":
      products.sort((a, b) => Math.min(...b.variants.map((v) => v.price)) - Math.min(...a.variants.map((v) => v.price)));
      break;
    case "rating":
      products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      break;
    case "discount":
      products.sort((a, b) => {
        const discA = a.variants[0]?.mrp ? ((a.variants[0].mrp - a.variants[0].price) / a.variants[0].mrp) * 100 : 0;
        const discB = b.variants[0]?.mrp ? ((b.variants[0].mrp - b.variants[0].price) / b.variants[0].mrp) * 100 : 0;
        return discB - discA;
      });
      break;
    case "newest":
      // Preserve insertion order (newest first from db.createProduct which unshifts)
      break;
    default: // popularity
      products.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
  }

  return NextResponse.json({
    status: 200,
    count: products.length,
    data: products,
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name || !body.categorySlug) {
      return NextResponse.json(
        { status: 422, message: "Validation: Product name and categorySlug are required." },
        { status: 422 }
      );
    }

    // Generate slug and ID if not provided
    const slug =
      body.slug ||
      body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const product: Product = {
      id: body.id || `prod-${Date.now()}`,
      slug,
      name: body.name,
      categoryName: body.categoryName || body.categorySlug,
      categorySlug: body.categorySlug,
      shortDescription: body.shortDescription || "",
      description: body.description || "",
      ingredients: body.ingredients || "",
      images: body.images?.length ? body.images : [
        "https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&w=800&q=80",
      ],
      variants: body.variants?.length
        ? body.variants
        : [
            {
              weight: "500g",
              price: Number(body.price) || 599,
              mrp: Number(body.mrp) || Number(body.price) || 599,
              stock: Number(body.stock) || 50,
              sku: `${slug.toUpperCase().slice(0, 8)}-500G`,
            },
          ],
      rating: body.rating || 4.5,
      reviewCount: body.reviewCount || 0,
      isOrganic: body.isOrganic || false,
      isBestSeller: body.isBestSeller || false,
      isFeatured: body.isFeatured || false,
      originCountry: body.originCountry || "India",
      originRegion: body.originRegion || "",
      tags: body.tags || [body.categorySlug],
      benefits: body.benefits || [],
      nutritionInfo: body.nutritionInfo || {
        servingSize: "30g",
        calories: "160 kcal",
        protein: "5g",
        healthyFats: "12g",
        carbs: "9g",
        fiber: "1g",
      },
      shelfLife: body.shelfLife || "12 months",
      storageInstructions: body.storageInstructions || "Store in a cool, dry place.",
      packagingType: body.packagingType || "Nitrogen-Flushed Zip-Lock Pouch",
    };

    const saved = db.createProduct(product);

    return NextResponse.json(
      { status: 201, message: "Product created and live on storefront.", data: saved },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ status: 500, message: err.message }, { status: 500 });
  }
}
