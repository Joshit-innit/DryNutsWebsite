#!/usr/bin/env node
/**
 * Generates supabase/seed.sql from the legacy local data:
 *   - src/data/db.json    → categories, products, orders, coupons
 *   - src/data/mockData.ts → reviews, customers
 *
 * Usage (from frontend/): node scripts/generate-supabase-seed.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const ts = require("typescript");

const frontendDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outFile = path.resolve(frontendDir, "..", "supabase", "seed.sql");

// --- Load data ---------------------------------------------------------------
const db = JSON.parse(fs.readFileSync(path.join(frontendDir, "src/data/db.json"), "utf-8"));

const mockSource = fs.readFileSync(path.join(frontendDir, "src/data/mockData.ts"), "utf-8");
const { outputText } = ts.transpileModule(mockSource, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
});
const mockModule = { exports: {} };
new Function("module", "exports", "require", outputText)(mockModule, mockModule.exports, () => ({}));
const { REVIEWS, SAMPLE_CUSTOMERS } = mockModule.exports;

// --- SQL helpers -------------------------------------------------------------
const lit = (v) => (v === undefined || v === null ? "null" : `'${String(v).replace(/'/g, "''")}'`);
const num = (v) => (v === undefined || v === null || v === "" ? "null" : String(Number(v)));
const bool = (v) => (v ? "true" : "false");
const json = (v) => `${lit(JSON.stringify(v ?? null))}::jsonb`;
const arr = (v) => (Array.isArray(v) && v.length ? `array[${v.map(lit).join(", ")}]::text[]` : "'{}'::text[]");
// Preserve listing order: first item in the file is the newest.
const ts_ = (i) => `now() - interval '${i} seconds'`;

function insert(table, rows) {
  if (!rows.length) return "";
  const cols = Object.keys(rows[0]);
  const values = rows.map((r) => `  (${cols.map((c) => r[c]).join(", ")})`).join(",\n");
  return `insert into public.${table} (${cols.join(", ")}) values\n${values}\non conflict do nothing;\n`;
}

// --- Build rows ---------------------------------------------------------------
const categories = db.categories.map((c, i) => ({
  id: lit(c.id), slug: lit(c.slug), name: lit(c.name), tagline: lit(c.tagline ?? ""),
  description: lit(c.description ?? ""), image: lit(c.image ?? ""), banner_image: lit(c.bannerImage ?? ""),
  item_count: num(c.itemCount ?? 0), benefits: arr(c.benefits), origin_highlight: lit(c.originHighlight ?? ""),
  sort_order: num(i),
}));

const products = db.products.map((p, i) => ({
  id: lit(p.id), slug: lit(p.slug), name: lit(p.name), category: lit(p.category),
  category_name: lit(p.categoryName ?? ""), tagline: lit(p.tagline ?? ""),
  short_description: lit(p.shortDescription ?? ""), description: lit(p.description ?? ""),
  origin: lit(p.origin ?? ""), grade: lit(p.grade), images: arr(p.images), variants: json(p.variants ?? []),
  rating: num(p.rating ?? 0), review_count: num(p.reviewCount ?? 0), status: lit(p.status ?? "published"),
  is_featured: bool(p.isFeatured), is_best_seller: bool(p.isBestSeller), is_new: bool(p.isNew),
  tags: arr(p.tags), benefits: arr(p.benefits), storage_info: lit(p.storageInfo ?? ""),
  nutrition: json(p.nutrition ?? {}), ingredients: lit(p.ingredients ?? ""), faqs: json(p.faqs ?? []),
  created_at: ts_(i),
}));

const orders = db.orders.map((o, i) => ({
  id: lit(o.id), order_number: lit(o.orderNumber), order_date: lit(o.date), items: json(o.items ?? []),
  subtotal: num(o.subtotal), discount: num(o.discount ?? 0), delivery_fee: num(o.deliveryFee ?? 0),
  total: num(o.total), status: lit(o.status), payment_method: lit(o.paymentMethod),
  payment_status: lit(o.paymentStatus), shipping_address: json(o.shippingAddress ?? {}),
  estimated_delivery: lit(o.estimatedDelivery), tracking_number: lit(o.trackingNumber),
  timeline: json(o.timeline ?? []), created_at: ts_(i),
}));

const coupons = db.coupons.map((c, i) => ({
  code: lit(String(c.code).toUpperCase()), description: lit(c.description ?? ""),
  discount_type: lit(c.discountType), discount_value: num(c.discountValue),
  min_order_value: num(c.minOrderValue ?? 0), max_discount: num(c.maxDiscount),
  expiry_date: lit(c.expiryDate), usage_count: num(c.usageCount ?? 0), usage_limit: num(c.usageLimit),
  status: lit(c.status ?? "active"), created_at: ts_(i),
}));

const productIds = new Set(db.products.map((p) => p.id));
const reviews = REVIEWS.filter((r) => productIds.has(r.productId)).map((r, i) => ({
  id: lit(r.id), product_id: lit(r.productId), customer_name: lit(r.customerName),
  location: lit(r.location ?? ""), rating: num(r.rating), review_date: lit(r.date),
  title: lit(r.title ?? ""), comment: lit(r.comment ?? ""), verified_purchase: bool(r.verifiedPurchase),
  likes: num(r.likes ?? 0), created_at: ts_(i),
}));

const customers = SAMPLE_CUSTOMERS.map((c, i) => ({
  id: lit(c.id), name: lit(c.name), email: lit(String(c.email).toLowerCase()), phone: lit(c.phone ?? ""),
  avatar: lit(c.avatar), total_orders: num(c.totalOrders ?? 0), total_spend: num(c.totalSpend ?? 0),
  last_order_date: lit(c.lastOrderDate), addresses: json(c.addresses ?? []), joined_date: lit(c.joinedDate),
  status: lit(c.status ?? "active"), created_at: ts_(i),
}));

// --- Write --------------------------------------------------------------------
const sql = [
  "-- Generated by frontend/scripts/generate-supabase-seed.mjs — do not edit by hand.",
  `-- Source: src/data/db.json (${db.products.length} products, ${db.categories.length} categories, ${db.orders.length} orders, ${db.coupons.length} coupons)`,
  `--         src/data/mockData.ts (${reviews.length} reviews, ${customers.length} customers)`,
  "",
  insert("categories", categories),
  insert("products", products),
  insert("customers", customers),
  insert("orders", orders),
  insert("coupons", coupons),
  insert("reviews", reviews),
].join("\n");

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, sql, "utf-8");
console.log(`Wrote ${outFile}`);
console.log({ categories: categories.length, products: products.length, orders: orders.length,
  coupons: coupons.length, reviews: reviews.length, customers: customers.length,
  skippedReviews: REVIEWS.length - reviews.length });
