import { NextRequest } from "next/server";
import { db } from "@/lib/server/db";
import { normalizeProductImages } from "@/lib/product-images";
import { slugify } from "@/lib/utils";
import { CategorySlug, Product } from "@/types";

export const dynamic = "force-dynamic";

const CATEGORY_NAMES: Record<CategorySlug, string> = {
  cashews: "Cashews",
  pistachios: "Pistachios",
  almonds: "Almonds",
  walnuts: "Walnuts",
  raisins: "Raisins",
  dates: "Dates",
  "dried-apricots": "Dried Apricots",
  "dry-figs": "Dry Figs",
  prunes: "Prunes",
  combos: "Curated Combos",
  "gift-boxes": "Gift & Festival Boxes",
};

function byLowestPrice(product: Product) {
  return Math.min(...product.variants.map((variant) => variant.price));
}

function applyFilters(products: Product[], request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const category = params.get("category");
  const maxPrice = Number(params.get("maxPrice") || 0);
  const minPrice = Number(params.get("minPrice") || 0);
  const rating = Number(params.get("rating") || 0);
  const inStockOnly = params.get("inStockOnly") === "true";
  const search = (params.get("search") || "").trim().toLowerCase();
  const sortBy = params.get("sortBy") || "popularity";

  const filtered = products.filter((product) => {
    const price = byLowestPrice(product);
    const stock = product.variants.reduce((sum, variant) => sum + variant.stock, 0);
    const haystack = [
      product.name,
      product.categoryName,
      product.shortDescription,
      product.description,
      product.origin,
      product.tags.join(" "),
    ]
      .join(" ")
      .toLowerCase();

    return (
      product.status !== "archived" &&
      (!category || category === "all" || product.category === category) &&
      (!minPrice || price >= minPrice) &&
      (!maxPrice || price <= maxPrice) &&
      (!rating || product.rating >= rating) &&
      (!inStockOnly || stock > 0) &&
      (!search || haystack.includes(search))
    );
  });

  return filtered.sort((a, b) => {
    if (sortBy === "price-asc") return byLowestPrice(a) - byLowestPrice(b);
    if (sortBy === "price-desc") return byLowestPrice(b) - byLowestPrice(a);
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "discount") {
      const discount = (p: Product) => Math.max(...p.variants.map((v) => v.mrp - v.price));
      return discount(b) - discount(a);
    }
    if (sortBy === "newest") return Number(b.isNew) - Number(a.isNew);
    return Number(b.isBestSeller) - Number(a.isBestSeller) || b.reviewCount - a.reviewCount;
  });
}

export async function GET(request: NextRequest) {
  const products = db.getProducts().map(normalizeProductImages);
  return Response.json({ data: applyFilters(products, request) });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    const category = String(body.category || "cashews") as CategorySlug;

    if (!name) {
      return Response.json({ message: "Product name is required." }, { status: 400 });
    }

    if (!body.variants?.length) {
      return Response.json({ message: "Add at least one product variant." }, { status: 400 });
    }

    const slug = slugify(body.slug || name);
    const origin = [body.originRegion, body.originCountry].filter(Boolean).join(", ") || "India";

    const product: Product = normalizeProductImages({
      id: `prod-${Date.now()}`,
      name,
      slug,
      category,
      categoryName: body.categoryName || CATEGORY_NAMES[category] || "Dry Fruits",
      tagline: body.tagline || body.shortDescription || name,
      shortDescription: body.shortDescription || body.tagline || "Premium dry fruit harvest, packed fresh.",
      description: body.description || body.shortDescription || "Premium dry fruit harvest, packed fresh.",
      origin,
      grade: body.grade || "Premium Reserve",
      images: Array.isArray(body.images) ? body.images : [],
      variants: body.variants.map((variant: any, index: number) => ({
        id: variant.id || `${slug}-${variant.weight || index}`,
        weight: String(variant.weight || "250g"),
        price: Number(variant.price || 0),
        mrp: Number(variant.mrp || variant.price || 0),
        stock: Number(variant.stock || 0),
        sku: String(variant.sku || `${slug}-${index + 1}`).toUpperCase(),
      })),
      rating: Number(body.rating || 4.6),
      reviewCount: Number(body.reviewCount || 0),
      status: body.status || "published",
      isFeatured: Boolean(body.isFeatured),
      isBestSeller: Boolean(body.isBestSeller),
      isNew: body.isNew ?? true,
      tags: Array.isArray(body.tags) ? body.tags : [category],
      benefits: Array.isArray(body.benefits) && body.benefits.length
        ? body.benefits
        : ["Naturally nutrient dense", "Packed fresh for daily snacking", "No artificial colors or preservatives"],
      storageInfo: body.storageInfo || "Store in a cool, dry place in an airtight container after opening.",
      nutrition: {
        servingSize: body.nutrition?.servingSize || "30g",
        calories: body.nutrition?.calories || "160 kcal",
        protein: body.nutrition?.protein || "5g",
        healthyFats: body.nutrition?.healthyFats || "12g",
        carbs: body.nutrition?.carbs || "9g",
        fiber: body.nutrition?.fiber || "2g",
      },
      ingredients: body.ingredients || `100% ${name}.`,
      faqs: body.faqs || [],
    });

    return Response.json({ data: db.createProduct(product) }, { status: 201 });
  } catch {
    return Response.json({ message: "Could not create product." }, { status: 500 });
  }
}
