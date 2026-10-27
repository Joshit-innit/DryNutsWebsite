export type CategorySlug =
  | "cashews"
  | "pistachios"
  | "almonds"
  | "walnuts"
  | "raisins"
  | "dates"
  | "dried-apricots"
  | "dry-figs"
  | "prunes"
  | "combos"
  | "gift-boxes";

export interface WeightVariant {
  id: string;
  weight: string; // e.g. "250g", "500g", "1kg"
  price: number;
  mrp: number;
  stock: number;
  sku: string;
}

export interface NutritionInfo {
  servingSize: string;
  calories: string;
  protein: string;
  healthyFats: string;
  carbs: string;
  fiber: string;
  calcium?: string;
  iron?: string;
  potassium?: string;
  magnesium?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: CategorySlug;
  categoryName: string;
  tagline: string;
  shortDescription: string;
  description: string;
  origin: string;
  grade?: string;
  images: string[];
  variants: WeightVariant[];
  selectedVariantIndex?: number;
  rating: number;
  reviewCount: number;
  status: "published" | "draft" | "archived";
  isFeatured: boolean;
  isBestSeller: boolean;
  isNew: boolean;
  tags: string[];
  benefits: string[];
  storageInfo: string;
  nutrition: NutritionInfo;
  ingredients: string;
  faqs?: { question: string; answer: string }[];
}

export interface Category {
  id: string;
  name: string;
  slug: CategorySlug;
  tagline: string;
  description: string;
  image: string;
  bannerImage: string;
  itemCount: number;
  benefits: string[];
  originHighlight: string;
}

export interface CartItem {
  productId: string;
  variantId: string;
  name: string;
  slug: string;
  category: string;
  weight: string;
  price: number;
  mrp: number;
  image: string;
  quantity: number;
  sku: string;
}

export interface Address {
  id: string;
  name: string;
  phone: string;
  street: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
  type: "home" | "work" | "other";
}

export type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Packed"
  | "Shipped"
  | "Out for Delivery"
  | "Delivered"
  | "Cancelled"
  | "Refunded";

export interface OrderTimelineStep {
  status: OrderStatus;
  label: string;
  description: string;
  timestamp?: string;
  isCompleted: boolean;
  isCurrent: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  paymentMethod: "UPI" | "Card" | "NetBanking" | "COD";
  paymentStatus: "Paid" | "Pending" | "Failed" | "Refunded";
  shippingAddress: Address;
  estimatedDelivery: string;
  trackingNumber?: string;
  timeline: OrderTimelineStep[];
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  totalOrders: number;
  totalSpend: number;
  lastOrderDate?: string;
  addresses: Address[];
  joinedDate: string;
  status: "active" | "suspended";
}

export interface Coupon {
  code: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  expiryDate: string;
  usageCount: number;
  usageLimit?: number;
  status: "active" | "expired" | "disabled";
}

export interface Review {
  id: string;
  productId: string;
  customerName: string;
  location: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  likes: number;
}

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: "customer" | "admin" | "developer";
  avatar?: string;
}

/* =========================================================================
   CMD & SYSTEM TYPES
   ========================================================================= */

export interface SystemServiceStatus {
  name: string;
  type: string;
  status: "HEALTHY" | "DEGRADED" | "DOWN";
  latencyMs: number;
  version: string;
  uptime: string;
  lastChecked: string;
  endpoint?: string;
}

export interface SystemMetrics {
  cpuUsage: number; // percentage
  memoryUsage: number; // percentage
  diskUsage: number; // percentage
  activeConnections: number;
  requestsPerSecond: number;
  avgLatencyMs: number;
  errorRate: number; // percentage
  cacheHitRatio: number; // percentage
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: "INFO" | "WARN" | "ERROR" | "DEBUG";
  service: string;
  message: string;
  requestId?: string;
  ip?: string;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  role: "customer" | "admin" | "developer";
  action: string;
  resource: string;
  environment: "development" | "staging" | "production";
  status: "SUCCESS" | "DENIED" | "FAILED";
  requestId: string;
}

export interface DeploymentRecord {
  id: string;
  version: string;
  environment: "development" | "staging" | "production";
  commitHash: string;
  commitMessage: string;
  author: string;
  deployedAt: string;
  status: "SUCCESS" | "FAILED" | "IN_PROGRESS" | "ROLLED_BACK";
}
