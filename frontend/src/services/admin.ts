import { PRODUCTS, SAMPLE_ORDERS, SAMPLE_CUSTOMERS, COUPONS } from "@/data/mockData";
import { Product, Order, Customer, Coupon } from "@/types";

let adminProducts = [...PRODUCTS];
let adminCustomers = [...SAMPLE_CUSTOMERS];

export const adminService = {
  async getDashboardMetrics() {
    await new Promise((res) => setTimeout(res, 30));
    const totalRevenue = SAMPLE_ORDERS.reduce((sum, o) => sum + o.total, 458900);
    const totalOrders = SAMPLE_ORDERS.length + 184;
    const totalCustomers = adminCustomers.length + 420;
    const totalProducts = adminProducts.length;

    const lowStockItems = adminProducts.filter((p) =>
      p.variants.some((v) => v.stock < 25)
    );

    return {
      totalRevenue,
      totalOrders,
      totalCustomers,
      totalProducts,
      lowStockCount: lowStockItems.length,
      averageOrderValue: Math.round(totalRevenue / totalOrders),
      revenueGrowth: "+18.4% vs last month",
      ordersGrowth: "+12.2% vs last month",
      customersGrowth: "+24.5% vs last month",
    };
  },

  async getRevenueChartData() {
    return [
      { month: "Jan", revenue: 245000, orders: 120 },
      { month: "Feb", revenue: 280000, orders: 142 },
      { month: "Mar", revenue: 320000, orders: 165 },
      { month: "Apr", revenue: 310000, orders: 158 },
      { month: "May", revenue: 390000, orders: 198 },
      { month: "Jun", revenue: 430000, orders: 215 },
      { month: "Jul", revenue: 480000, orders: 240 },
      { month: "Aug", revenue: 560000, orders: 284 },
    ];
  },

  async getCategoryShareData() {
    return [
      { name: "Cashews", value: 28, fill: "#2D4A33" },
      { name: "Almonds", value: 24, fill: "#6F8F4E" },
      { name: "Walnuts", value: 18, fill: "#B9853C" },
      { name: "Pistachios", value: 14, fill: "#9C5B33" },
      { name: "Dates & Figs", value: 10, fill: "#D2A866" },
      { name: "Combos & Gifts", value: 6, fill: "#1D1C1A" },
    ];
  },

  async getAdminProducts(): Promise<Product[]> {
    await new Promise((res) => setTimeout(res, 30));
    return [...adminProducts];
  },

  async getProductById(id: string): Promise<Product | null> {
    await new Promise((res) => setTimeout(res, 20));
    return adminProducts.find((p) => p.id === id) || null;
  },

  async saveProduct(product: Product): Promise<Product> {
    await new Promise((res) => setTimeout(res, 40));
    const index = adminProducts.findIndex((p) => p.id === product.id);
    if (index >= 0) {
      adminProducts[index] = product;
    } else {
      adminProducts = [product, ...adminProducts];
    }
    return product;
  },

  async deleteProduct(id: string): Promise<boolean> {
    await new Promise((res) => setTimeout(res, 30));
    adminProducts = adminProducts.filter((p) => p.id !== id);
    return true;
  },

  async getCustomers(): Promise<Customer[]> {
    await new Promise((res) => setTimeout(res, 20));
    return [...adminCustomers];
  },

  async toggleCustomerStatus(id: string): Promise<Customer | null> {
    await new Promise((res) => setTimeout(res, 20));
    const cust = adminCustomers.find((c) => c.id === id);
    if (!cust) return null;
    cust.status = cust.status === "active" ? "suspended" : "active";
    return { ...cust };
  },
};
