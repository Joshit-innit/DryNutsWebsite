import { StoreSettings } from "@/types";

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: "NutriNation Foods",
  supportEmail: "",
  freeDeliveryMin: 999,
  gstRate: 5,
  enforcePackingChecklist: true,
};

export const STANDARD_DELIVERY_FEE = 99;
export const EXPRESS_DELIVERY_FEE = 99;

export type DeliverySpeed = "standard" | "express";

/** Shared by the cart and the orders API so both always agree on the charge. */
export function getDeliveryFee(subtotal: number, freeDeliveryMin: number, speed: DeliverySpeed = "standard") {
  if (subtotal === 0) return 0;
  if (speed === "express") return EXPRESS_DELIVERY_FEE;
  return subtotal >= freeDeliveryMin ? 0 : STANDARD_DELIVERY_FEE;
}

/** Selling prices already include GST, so this is the tax portion of the amount. */
export function getIncludedGst(amount: number, gstRate: number) {
  return Math.round((amount - amount / (1 + gstRate / 100)) * 100) / 100;
}
