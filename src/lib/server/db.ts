/**
 * Server-side persistent database for NutriNation.
 * All products added via the Admin portal are stored here and served
 * dynamically to the customer storefront — zero hardcoding in UI components.
 *
 * Uses a JSON file on disk so data survives server restarts.
 * In production, replace with a real database (Postgres, MongoDB, etc.)
 */

import fs from "fs";
import path from "path";
import { Product, Category, Order, Coupon } from "@/types";

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------
const DATA_DIR = path.join(process.cwd(), "src", "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

// ---------------------------------------------------------------------------
// DB Schema
// ---------------------------------------------------------------------------
interface DBSchema {
  products: Product[];
  categories: Category[];
  orders: Order[];
  coupons: Coupon[];
  lastUpdated: string;
}

// ---------------------------------------------------------------------------
// Seed data (imported lazily to avoid circular deps at build time)
// ---------------------------------------------------------------------------
function getSeedData(): DBSchema {
  // We do a dynamic require here so this only runs server-side
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { PRODUCTS, CATEGORIES, MOCK_ORDERS, COUPONS } = require("@/data/mockData");
  return {
    products: PRODUCTS,
    categories: CATEGORIES,
    orders: MOCK_ORDERS,
    coupons: COUPONS,
    lastUpdated: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Read / Write helpers
// ---------------------------------------------------------------------------
function readDB(): DBSchema {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const seed = getSeedData();
      writeDB(seed);
      return seed;
    }
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(raw) as DBSchema;
  } catch {
    const seed = getSeedData();
    writeDB(seed);
    return seed;
  }
}

function writeDB(data: DBSchema): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  data.lastUpdated = new Date().toISOString();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
}

// ---------------------------------------------------------------------------
// Product operations
// ---------------------------------------------------------------------------
export const db = {
  // ---- Products ----
  getProducts(): Product[] {
    return readDB().products;
  },

  getProductBySlug(slug: string): Product | undefined {
    return readDB().products.find((p) => p.slug === slug || p.id === slug);
  },

  createProduct(product: Product): Product {
    const data = readDB();
    // Remove any existing product with same id/slug to prevent dupes
    data.products = data.products.filter(
      (p) => p.id !== product.id && p.slug !== product.slug
    );
    data.products.unshift(product);
    writeDB(data);
    return product;
  },

  updateProduct(id: string, updates: Partial<Product>): Product | null {
    const data = readDB();
    const idx = data.products.findIndex((p) => p.id === id || p.slug === id);
    if (idx === -1) return null;
    data.products[idx] = { ...data.products[idx], ...updates };
    writeDB(data);
    return data.products[idx];
  },

  deleteProduct(id: string): boolean {
    const data = readDB();
    const before = data.products.length;
    data.products = data.products.filter((p) => p.id !== id && p.slug !== id);
    writeDB(data);
    return data.products.length < before;
  },

  // ---- Categories ----
  getCategories(): Category[] {
    return readDB().categories;
  },

  // ---- Orders ----
  getOrders(): Order[] {
    return readDB().orders;
  },

  getOrderById(id: string): Order | undefined {
    return readDB().orders.find((o) => o.id === id || o.orderNumber === id);
  },

  createOrder(order: Order): Order {
    const data = readDB();
    data.orders.unshift(order);
    writeDB(data);
    return order;
  },

  updateOrder(id: string, updates: Partial<Order>): Order | null {
    const data = readDB();
    const idx = data.orders.findIndex((o) => o.id === id);
    if (idx === -1) return null;
    data.orders[idx] = { ...data.orders[idx], ...updates };
    writeDB(data);
    return data.orders[idx];
  },

  // ---- Coupons ----
  getCoupons(): Coupon[] {
    return readDB().coupons;
  },

  getCouponByCode(code: string): Coupon | undefined {
    return readDB().coupons.find(
      (c) => c.code.toUpperCase() === code.toUpperCase()
    );
  },

  createCoupon(coupon: Coupon): Coupon {
    const data = readDB();
    data.coupons.unshift(coupon);
    writeDB(data);
    return coupon;
  },
};
