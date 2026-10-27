import { SAMPLE_ORDERS } from "@/data/mockData";
import { Order, OrderStatus, CartItem, Address } from "@/types";
import { backendApi, unwrapData } from "@/lib/api/axios";

let currentOrders = [...SAMPLE_ORDERS];

export const orderService = {
  async getOrders(): Promise<Order[]> {
    try {
      const res = await backendApi.get("/orders");
      return unwrapData<Order[]>(res);
    } catch {
      return [...currentOrders];
    }
  },

  async getOrderById(id: string): Promise<Order | null> {
    try {
      const res = await backendApi.get(`/orders/${id}`);
      return unwrapData<Order>(res);
    } catch {
      const order = currentOrders.find((o) => o.id === id || o.orderNumber === id);
      return order || null;
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
    try {
      const res = await backendApi.post("/orders", data);
      return unwrapData<Order>(res);
    } catch {
      await new Promise((res) => setTimeout(res, 60));
    }
    const orderNum = `NN-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: orderNum,
      date: new Date().toISOString().split("T")[0],
      items: data.items,
      subtotal: data.subtotal,
      discount: data.discount,
      deliveryFee: data.deliveryFee,
      total: data.total,
      status: "Confirmed",
      paymentMethod: data.paymentMethod,
      paymentStatus: data.paymentMethod === "COD" ? "Pending" : "Paid",
      shippingAddress: data.shippingAddress,
      estimatedDelivery: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      trackingNumber: `EXP-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      timeline: [
        { status: "Pending", label: "Order Placed", description: "Order received successfully", timestamp: "Just now", isCompleted: true, isCurrent: false },
        { status: "Confirmed", label: "Confirmed & Verified", description: "Harvest inventory reserved", timestamp: "Just now", isCompleted: true, isCurrent: true },
        { status: "Packed", label: "Clean-room Packing", description: "Vacuum nitrogen sealing", isCompleted: false, isCurrent: false },
        { status: "Shipped", label: "Express Dispatch", description: "Air logistics partner pickup", isCompleted: false, isCurrent: false },
        { status: "Out for Delivery", label: "Out for Delivery", description: "Last-mile courier", isCompleted: false, isCurrent: false },
        { status: "Delivered", label: "Delivered", description: "Delivered to doorstep", isCompleted: false, isCurrent: false },
      ],
    };

    currentOrders = [newOrder, ...currentOrders];
    return newOrder;
  },

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order | null> {
    try {
      const res = await backendApi.patch(`/orders/${orderId}/status`, { status });
      return unwrapData<Order>(res);
    } catch {
      await new Promise((res) => setTimeout(res, 40));
      const index = currentOrders.findIndex((o) => o.id === orderId);
      if (index === -1) return null;

      const order = { ...currentOrders[index], status };
      currentOrders[index] = order;
      return order;
    }
  },
};
