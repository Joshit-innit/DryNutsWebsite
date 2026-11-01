import { Order, OrderStatus, CartItem, Address } from "@/types";
import { backendApi, unwrapData } from "@/lib/api/axios";

export const orderService = {
  async getOrders(): Promise<Order[]> {
    try {
      const res = await backendApi.get("/orders");
      return unwrapData<Order[]>(res);
    } catch {
      return [];
    }
  },

  async getOrderById(id: string): Promise<Order | null> {
    try {
      const res = await backendApi.get(`/orders/${encodeURIComponent(id)}`);
      return unwrapData<Order>(res);
    } catch {
      return null;
    }
  },

  async createOrder(data: {
    items: CartItem[];
    subtotal: number;
    discount: number;
    deliveryFee: number;
    total: number;
    paymentMethod: "UPI" | "Card" | "NetBanking" | "COD";
    shippingAddress: Address;
  }): Promise<Order> {
    const res = await backendApi.post("/orders", data);
    return unwrapData<Order>(res);
  },

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order | null> {
    try {
      const res = await backendApi.patch(`/orders/${encodeURIComponent(orderId)}/status`, { status });
      return unwrapData<Order>(res);
    } catch {
      return null;
    }
  },
};
