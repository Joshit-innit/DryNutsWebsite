/**
 * Server-side data access for NutriNation, backed by Supabase Postgres.
 * Schema: supabase/migrations. Seed: supabase/seed.sql.
 *
 * Rows are stored in snake_case and mapped to the camelCase API types here,
 * so route handlers and UI keep the same shapes they had with db.json.
 */

import { getSupabase } from "@/lib/server/supabase";
import { Product, Category, Order, Coupon, Review, Customer } from "@/types";

type Row = Record<string, any>;

function check<T>(result: { data: T; error: { message: string } | null }): T {
  if (result.error) throw new Error(`Supabase: ${result.error.message}`);
  return result.data;
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
    discount: "discount", deliveryFee: "delivery_fee", total: "total", status: "status",
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
    const row = check(
      await getSupabase().from("orders").insert(fromOrder({ ...order, customerId })).select("*").single()
    );
    return toOrder(row);
  },

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order | null> {
    const { id: _id, ...rest } = updates;
    const rows = check(
      await getSupabase().from("orders").update(fromOrder(rest)).eq("id", id).select("*")
    );
    return rows?.[0] ? toOrder(rows[0]) : null;
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
};
