import { Product, Customer, Order } from "@/types";
import { backendApi, unwrapData } from "@/lib/api/axios";

async function fetchList<T>(endpoint: string): Promise<T[]> {
  try {
    return unwrapData<T[]>(await backendApi.get(endpoint));
  } catch {
    return [];
  }
}

export const adminService = {
  async getDashboardMetrics() {
    const [orders, customers, products] = await Promise.all([
      fetchList<Order>("/orders"),
      fetchList<Customer>("/customers"),
      fetchList<Product>("/products?scope=all"),
    ]);
    const billable = orders.filter((o) => o.status !== "Cancelled" && o.status !== "Refunded");
    const totalRevenue = billable.reduce((sum, o) => sum + o.total, 0);
    const lowStockItems = products.filter((p) => p.variants.some((v) => v.stock < 25));

    return {
      totalRevenue,
      totalOrders: orders.length,
      totalCustomers: customers.length,
      totalProducts: products.length,
      lowStockCount: lowStockItems.length,
      averageOrderValue: billable.length ? Math.round(totalRevenue / billable.length) : 0,
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
    return fetchList<Product>("/products?scope=all");
  },

  async getProductById(id: string): Promise<Product | null> {
    try {
      return unwrapData<Product>(await backendApi.get(`/products/${encodeURIComponent(id)}`));
    } catch {
      return null;
    }
  },

  async saveProduct(product: Product): Promise<Product> {
    const existing = await adminService.getProductById(product.id);
    const res = existing
      ? await backendApi.patch(`/products/${encodeURIComponent(product.id)}`, product)
      : await backendApi.post("/products", product);
    return unwrapData<Product>(res);
  },

  async deleteProduct(id: string): Promise<boolean> {
    try {
      await backendApi.delete(`/products/${encodeURIComponent(id)}`);
      return true;
    } catch {
      return false;
    }
  },

  async getCustomers(): Promise<Customer[]> {
    return fetchList<Customer>("/customers");
  },

  async toggleCustomerStatus(id: string): Promise<Customer | null> {
    const customers = await adminService.getCustomers();
    const current = customers.find((c) => c.id === id);
    if (!current) return null;
    try {
      const res = await backendApi.patch(`/customers/${encodeURIComponent(id)}/status`, {
        status: current.status === "active" ? "suspended" : "active",
      });
      return unwrapData<Customer>(res);
    } catch {
      return null;
    }
  },
};
