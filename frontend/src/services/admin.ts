import { Product, Customer, Order } from "@/types";
import { backendApi, unwrapData } from "@/lib/api/axios";
import { computeRevenueAnalytics, RevenueAnalytics } from "@/lib/analytics";

async function fetchList<T>(endpoint: string): Promise<T[]> {
  try {
    return unwrapData<T[]>(await backendApi.get(endpoint));
  } catch {
    return [];
  }
}

export const adminService = {
  /** All revenue figures come from delivered orders in the database. */
  async getRevenueAnalytics(): Promise<RevenueAnalytics> {
    return computeRevenueAnalytics(await fetchList<Order>("/orders"));
  },

  async getDashboardMetrics() {
    const [orders, customers, products] = await Promise.all([
      fetchList<Order>("/orders"),
      fetchList<Customer>("/customers"),
      fetchList<Product>("/products?scope=all"),
    ]);
    const analytics = computeRevenueAnalytics(orders);
    const lowStockItems = products.filter((p) => p.variants.some((v) => v.stock < 25));

    return {
      analytics,
      totalRevenue: analytics.deliveredRevenue,
      totalOrders: orders.length,
      totalCustomers: customers.length,
      totalProducts: products.length,
      lowStockCount: lowStockItems.length,
      averageOrderValue: analytics.averageOrderValue,
    };
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
