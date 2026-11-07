import { Order, OrderStatus, CartItem, Address } from "@/types";
import { backendApi, unwrapData } from "@/lib/api/axios";
import { DeliverySpeed } from "@/lib/store-settings";

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
    couponCode?: string;
    deliverySpeed: DeliverySpeed;
    /** The total the customer saw. The server prices the order itself and compares. */
    total: number;
    paymentMethod: "UPI" | "Card" | "NetBanking" | "COD";
    shippingAddress: Address;
  }): Promise<Order> {
    const res = await backendApi.post("/orders", data);
    return unwrapData<Order>(res);
  },

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    const res = await backendApi.patch(`/orders/${encodeURIComponent(orderId)}/status`, { status });
    return unwrapData<Order>(res);
  },
};
