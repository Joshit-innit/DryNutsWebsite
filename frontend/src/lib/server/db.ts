/**
 * Server-side data access for NutriNation, backed by Supabase Postgres.
 * Schema: supabase/migrations. Seed: supabase/seed.sql.
 *
 * Rows are stored in snake_case and mapped to the camelCase API types here,
 * so route handlers and UI keep the same shapes they had with db.json.
 */

import { getSupabase } from "@/lib/server/supabase";
import { SUPPORT_EMAIL } from "@/lib/support";
import { DEFAULT_STORE_SETTINGS } from "@/lib/store-settings";
import { Product, Category, Order, Coupon, Review, Customer, LandingImage, StoreSettings } from "@/types";

type Row = Record<string, any>;

function check<T>(result: { data: T; error: { message: string } | null }): T {
  if (result.error) throw new Error(`Supabase: ${result.error.message}`);
  return result.data;
}

/** Raised for problems a person can act on, such as an item running out. */
export class StockError extends Error {}

const STOCK_ERROR_CODE = "NN001";

function checkStock<T>(result: { data: T; error: { message: string; code?: string } | null }): T {
  if (result.error?.code === STOCK_ERROR_CODE) throw new StockError(result.error.message);
  return check(result);
}

const num = (v: unknown) => (v === null || v === undefined ? 0 : Number(v));
const optNum = (v: unknown) => (v === null || v === undefined ? undefined : Number(v));
const optStr = (v: unknown) => (v === null || v === undefined ? undefined : String(v));

// ---------------------------------------------------------------------------
// Mappers
// ---------------------------------------------------------------------------
function toProduct(r: Row): Product {
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    category: r.category,
    categoryName: r.category_name,
    tagline: r.tagline,
    shortDescription: r.short_description,
    description: r.description,
    origin: r.origin,
    grade: optStr(r.grade),
    images: r.images ?? [],
    variants: r.variants ?? [],
    rating: num(r.rating),
    reviewCount: num(r.review_count),
    status: r.status,
    isFeatured: r.is_featured,
    isBestSeller: r.is_best_seller,
    isNew: r.is_new,
    tags: r.tags ?? [],
    benefits: r.benefits ?? [],
    storageInfo: r.storage_info,
    nutrition: r.nutrition ?? {},
    ingredients: r.ingredients,
    faqs: r.faqs ?? [],
  };
}

function fromProduct(p: Partial<Product>): Row {
  const map: Record<string, string> = {
    id: "id", name: "name", slug: "slug", category: "category", categoryName: "category_name",
    tagline: "tagline", shortDescription: "short_description", description: "description",
    origin: "origin", grade: "grade", images: "images", variants: "variants", rating: "rating",
    reviewCount: "review_count", status: "status", isFeatured: "is_featured",
    isBestSeller: "is_best_seller", isNew: "is_new", tags: "tags", benefits: "benefits",
    storageInfo: "storage_info", nutrition: "nutrition", ingredients: "ingredients", faqs: "faqs",
  };
  const row: Row = {};
  for (const [key, column] of Object.entries(map)) {
    const value = (p as Row)[key];
    if (value !== undefined) row[column] = value;
  }
  return row;
}

function toCategory(r: Row): Category {
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    tagline: r.tagline,
    description: r.description,
    image: r.image,
    bannerImage: r.banner_image,
    itemCount: num(r.item_count),
    benefits: r.benefits ?? [],
    originHighlight: r.origin_highlight,
  };
}

function toOrder(r: Row): Order {
  return {
    id: r.id,
    orderNumber: r.order_number,
    date: r.order_date,
    items: r.items ?? [],
    subtotal: num(r.subtotal),
    discount: num(r.discount),
    deliveryFee: num(r.delivery_fee),
    gstRate: num(r.gst_rate),
    total: num(r.total),
    status: r.status,
    paymentMethod: r.payment_method,
    paymentStatus: r.payment_status,
    shippingAddress: r.shipping_address,
    estimatedDelivery: r.estimated_delivery ?? "",
    trackingNumber: optStr(r.tracking_number),
    timeline: r.timeline ?? [],
  };
}

function fromOrder(o: Partial<Order> & { customerId?: string | null }): Row {
  const map: Record<string, string> = {
    id: "id", orderNumber: "order_number", date: "order_date", items: "items", subtotal: "subtotal",
    discount: "discount", deliveryFee: "delivery_fee", gstRate: "gst_rate", total: "total", status: "status",
    paymentMethod: "payment_method", paymentStatus: "payment_status",
    shippingAddress: "shipping_address", estimatedDelivery: "estimated_delivery",
    trackingNumber: "tracking_number", timeline: "timeline", customerId: "customer_id",
  };
  const row: Row = {};
  for (const [key, column] of Object.entries(map)) {
    const value = (o as Row)[key];
    if (value !== undefined) row[column] = value;
  }
  return row;
}

function toSettings(r: Row): StoreSettings {
  return {
    storeName: r.store_name,
    supportEmail: r.support_email || SUPPORT_EMAIL,
    freeDeliveryMin: num(r.free_delivery_min),
    gstRate: num(r.gst_rate),
    enforcePackingChecklist: r.enforce_packing_checklist,
  };
}

function toCoupon(r: Row): Coupon {
  return {
    code: r.code,
    description: r.description,
    discountType: r.discount_type,
    discountValue: num(r.discount_value),
    minOrderValue: num(r.min_order_value),
    maxDiscount: optNum(r.max_discount),
    expiryDate: r.expiry_date,
    usageCount: num(r.usage_count),
    usageLimit: optNum(r.usage_limit),
    status: r.status,
  };
}

function fromCoupon(c: Coupon): Row {
  return {
    code: c.code.trim().toUpperCase(),
    description: c.description ?? "",
    discount_type: c.discountType,
    discount_value: c.discountValue,
    min_order_value: c.minOrderValue ?? 0,
    max_discount: c.maxDiscount ?? null,
    expiry_date: c.expiryDate,
    usage_count: c.usageCount ?? 0,
    usage_limit: c.usageLimit ?? null,
    status: c.status ?? "active",
  };
}

function toReview(r: Row): Review {
  return {
    id: r.id,
    productId: r.product_id,
    customerName: r.customer_name,
    location: r.location,
    rating: num(r.rating),
    date: r.review_date,
    title: r.title,
    comment: r.comment,
    verifiedPurchase: r.verified_purchase,
    likes: num(r.likes),
  };
}

function toCustomer(r: Row): Customer {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    phone: r.phone,
    avatar: optStr(r.avatar),
    totalOrders: num(r.total_orders),
    totalSpend: num(r.total_spend),
    lastOrderDate: optStr(r.last_order_date),
    addresses: r.addresses ?? [],
    joinedDate: r.joined_date,
    status: r.status,
  };
}

function toLandingImage(r: Row): LandingImage {
  return {
    id: r.id,
    section: r.section,
    slot: r.slot ?? null,
    imageUrl: r.image_url,
    title: r.title,
    caption: r.caption,
    linkUrl: r.link_url,
    alt: r.alt,
    sortOrder: num(r.sort_order),
  };
}

function fromLandingImage(l: Partial<LandingImage>): Row {
  const map: Record<string, string> = {
    section: "section", slot: "slot", imageUrl: "image_url", title: "title", caption: "caption",
    linkUrl: "link_url", alt: "alt", sortOrder: "sort_order",
  };
  const row: Row = {};
  for (const [key, column] of Object.entries(map)) {
    const value = (l as Row)[key];
    if (value !== undefined) row[column] = value;
  }
  return row;
}

// Escape a value for use inside a PostgREST `or=(...)` filter.
const orValue = (v: string) => `"${v.replace(/"/g, '\\"')}"`;

// ---------------------------------------------------------------------------
// Data access
// ---------------------------------------------------------------------------
export const db = {
  // ---- Products ----
  async getProducts(): Promise<Product[]> {
    const rows = check(
      await getSupabase().from("products").select("*").order("created_at", { ascending: false })
    );
    return (rows ?? []).map(toProduct);
  },

  async getProductBySlug(slugOrId: string): Promise<Product | undefined> {
    const rows = check(
      await getSupabase()
        .from("products")
        .select("*")
        .or(`slug.eq.${orValue(slugOrId)},id.eq.${orValue(slugOrId)}`)
        .limit(1)
    );
    return rows?.[0] ? toProduct(rows[0]) : undefined;
  },

  async createProduct(product: Product): Promise<Product> {
    const row = check(
      await getSupabase().from("products").insert(fromProduct(product)).select("*").single()
    );
    return toProduct(row);
  },

  async updateProduct(slugOrId: string, updates: Partial<Product>): Promise<Product | null> {
    const current = await db.getProductBySlug(slugOrId);
    if (!current) return null;
    const { id: _id, ...rest } = updates;
    const row = check(
      await getSupabase().from("products").update(fromProduct(rest)).eq("id", current.id).select("*").single()
    );
    return toProduct(row);
  },

  async deleteProduct(slugOrId: string): Promise<boolean> {
    const rows = check(
      await getSupabase()
        .from("products")
        .delete()
        .or(`slug.eq.${orValue(slugOrId)},id.eq.${orValue(slugOrId)}`)
        .select("id")
    );
    return (rows?.length ?? 0) > 0;
  },

  async restockVariant(productId: string, variantId: string, quantity: number): Promise<number> {
    return checkStock(
      await getSupabase().rpc("change_variant_stock", {
        p_product_id: productId,
        p_variant_id: variantId,
        p_delta: quantity,
      })
    ) as number;
  },

  // ---- Store settings ----
  async getSettings(): Promise<StoreSettings> {
    const rows = check(await getSupabase().from("store_settings").select("*").limit(1));
    return rows?.[0] ? toSettings(rows[0]) : DEFAULT_STORE_SETTINGS;
  },

  async saveSettings(settings: StoreSettings): Promise<StoreSettings> {
    const row = check(
      await getSupabase()
        .from("store_settings")
        .upsert({
          id: true,
          store_name: settings.storeName,
          support_email: settings.supportEmail,
          free_delivery_min: settings.freeDeliveryMin,
          gst_rate: settings.gstRate,
          enforce_packing_checklist: settings.enforcePackingChecklist,
        })
        .select("*")
        .single()
    );
    return toSettings(row);
  },

  // ---- Categories ----
  async getCategories(): Promise<Category[]> {
    const rows = check(
      await getSupabase().from("categories").select("*").order("sort_order", { ascending: true })
    );
    return (rows ?? []).map(toCategory);
  },

  // ---- Orders ----
  async getOrders(customerId?: string): Promise<Order[]> {
    let query = getSupabase().from("orders").select("*").order("created_at", { ascending: false });
    if (customerId) query = query.eq("customer_id", customerId);
    return (check(await query) ?? []).map(toOrder);
  },

  async getOrderById(idOrNumber: string): Promise<(Order & { customerId?: string }) | undefined> {
    const rows = check(
      await getSupabase()
        .from("orders")
        .select("*")
        .or(`id.eq.${orValue(idOrNumber)},order_number.eq.${orValue(idOrNumber)}`)
        .limit(1)
    );
    if (!rows?.[0]) return undefined;
    return { ...toOrder(rows[0]), customerId: optStr(rows[0].customer_id) };
  },

  async createOrder(order: Order, customerId?: string | null): Promise<Order> {
    const row = checkStock(
      await getSupabase().rpc("place_order", { p_order: fromOrder({ ...order, customerId: customerId ?? null }) })
    );
    return toOrder(row);
  },

  async updateOrderStatus(id: string, status: Order["status"], timeline: Order["timeline"]): Promise<Order> {
    const row = checkStock(
      await getSupabase().rpc("update_order_status", { p_order_id: id, p_status: status, p_timeline: timeline })
    );
    return toOrder(row);
  },

  // ---- Coupons ----
  async getCoupons(): Promise<Coupon[]> {
    const rows = check(
      await getSupabase().from("coupons").select("*").order("created_at", { ascending: false })
    );
    return (rows ?? []).map(toCoupon);
  },

  async getCouponByCode(code: string): Promise<Coupon | undefined> {
    const rows = check(
      await getSupabase().from("coupons").select("*").eq("code", code.trim().toUpperCase()).limit(1)
    );
    return rows?.[0] ? toCoupon(rows[0]) : undefined;
  },

  async createCoupon(coupon: Coupon): Promise<Coupon> {
    const row = check(await getSupabase().from("coupons").insert(fromCoupon(coupon)).select("*").single());
    return toCoupon(row);
  },

  // ---- Reviews ----
  async getReviews(productId?: string): Promise<Review[]> {
    let query = getSupabase().from("reviews").select("*").order("created_at", { ascending: false });
    if (productId) query = query.eq("product_id", productId);
    return (check(await query) ?? []).map(toReview);
  },

  async createReview(review: Omit<Review, "id" | "date" | "likes">): Promise<Review> {
    const row = check(
      await getSupabase()
        .from("reviews")
        .insert({
          id: `rev-${Date.now()}`,
          product_id: review.productId,
          customer_name: review.customerName,
          location: review.location ?? "",
          rating: review.rating,
          title: review.title ?? "",
          comment: review.comment ?? "",
          verified_purchase: Boolean(review.verifiedPurchase),
        })
        .select("*")
        .single()
    );
    return toReview(row);
  },

  // ---- Customers ----
  async getCustomers(): Promise<Customer[]> {
    const rows = check(
      await getSupabase().from("customers").select("*").order("created_at", { ascending: false })
    );
    return (rows ?? []).map(toCustomer);
  },

  async upsertCustomer(customer: { id: string; name: string; email: string }): Promise<void> {
    check(
      await getSupabase()
        .from("customers")
        .upsert({ id: customer.id, name: customer.name, email: customer.email }, { onConflict: "email", ignoreDuplicates: true })
    );
  },

  async setCustomerStatus(id: string, status: Customer["status"]): Promise<Customer | null> {
    const rows = check(await getSupabase().from("customers").update({ status }).eq("id", id).select("*"));
    return rows?.[0] ? toCustomer(rows[0]) : null;
  },

  // ---- Landing page media ----
  async getLandingImages(): Promise<LandingImage[]> {
    const rows = check(
      await getSupabase()
        .from("landing_images")
        .select("*")
        .order("section", { ascending: true })
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true })
    );
    return (rows ?? []).map(toLandingImage);
  },

  async getLandingImage(id: string): Promise<LandingImage | undefined> {
    const rows = check(await getSupabase().from("landing_images").select("*").eq("id", id).limit(1));
    return rows?.[0] ? toLandingImage(rows[0]) : undefined;
  },

  /** Inserts, or for single-slot sections (featured/category) replaces the existing row. */
  async saveLandingImage(image: Omit<LandingImage, "id">): Promise<LandingImage> {
    const supabase = getSupabase();
    if (image.section !== "hero") {
      let query = supabase.from("landing_images").select("id").eq("section", image.section);
      query = image.slot ? query.eq("slot", image.slot) : query.is("slot", null);
      const existing = check(await query.limit(1));
      if (existing?.[0]) {
        const row = check(
          await supabase.from("landing_images").update(fromLandingImage(image)).eq("id", existing[0].id).select("*").single()
        );
        return toLandingImage(row);
      }
    }
    const row = check(await supabase.from("landing_images").insert(fromLandingImage(image)).select("*").single());
    return toLandingImage(row);
  },

  async updateLandingImage(id: string, updates: Partial<LandingImage>): Promise<LandingImage | null> {
    const { id: _id, section: _section, slot: _slot, ...rest } = updates;
    const rows = check(
      await getSupabase().from("landing_images").update(fromLandingImage(rest)).eq("id", id).select("*")
    );
    return rows?.[0] ? toLandingImage(rows[0]) : null;
  },

  async deleteLandingImage(id: string): Promise<LandingImage | null> {
    const rows = check(await getSupabase().from("landing_images").delete().eq("id", id).select("*"));
    return rows?.[0] ? toLandingImage(rows[0]) : null;
  },
};
