"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product, CartItem, WeightVariant, Coupon, OrderQuote, UserSession, StoreSettings } from "@/types";
import { toast } from "sonner";
import { couponService } from "@/services/coupons";
import { settingsService } from "@/services/settings";
import { DEFAULT_STORE_SETTINGS, getDeliveryFee } from "@/lib/store-settings";
import { getProductImage } from "@/lib/product-images";
import { getCouponDiscount, getCouponProblem } from "@/lib/order-pricing";
import { endSession, fetchSessionUser } from "@/lib/auth-session";

interface StoreContextType {
  // Saved store settings
  storeSettings: StoreSettings;
  refreshStoreSettings: () => Promise<void>;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, variant?: WeightVariant, quantity?: number) => void;
  removeFromCart: (productId: string, variantId: string) => void;
  updateQuantity: (productId: string, variantId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  cartDiscount: number;
  cartDeliveryFee: number;
  cartTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;

  // Coupon
  appliedCoupon: Coupon | null;
  applyCouponCode: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  /** Takes the server's working of the bill: current prices, and whether the coupon still stands. */
  applyQuote: (quote: OrderQuote) => void;

  // Wishlist
  wishlist: string[]; // product IDs
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;

  // Quick View
  quickViewProduct: Product | null;
  setQuickViewProduct: (product: Product | null) => void;

  // User & Portal Role Switcher
  user: UserSession | null;
  setUser: (user: UserSession | null) => void;
  logout: () => Promise<void>;
  activeRole: "customer" | "admin" | "developer";
  setActiveRole: (role: "customer" | "admin" | "developer") => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  // Wishlist state
  // Each account (and guests) gets its own list, so a new account starts empty.
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [wishlistOwner, setWishlistOwner] = useState<string | null>(null);

  // Quick view modal
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // The server establishes a user session after successful authentication.
  const [user, setUser] = useState<UserSession | null>(null);
  const [activeRole, setActiveRole] = useState<"customer" | "admin" | "developer">("customer");

  const [storeSettings, setStoreSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);

  const refreshStoreSettings = async () => {
    try {
      setStoreSettings(await settingsService.getSettings());
    } catch {
      // Keep what we have; the orders API still applies the saved settings.
    }
  };

  useEffect(() => {
    refreshStoreSettings();
  }, []);

  // Load cart from localStorage on mount (hydration safe)
  useEffect(() => {
    fetchSessionUser().then(setUser);
    try {
      const saved = localStorage.getItem("nn_cart");
      if (saved) {
        setCart(JSON.parse(saved));
      }
      // Drop the old wishlist that was shared by every account on this browser.
      localStorage.removeItem("nn_wishlist");
    } catch {
      // ignore
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("nn_cart", JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart]);

  // Load the signed-in account's wishlist whenever the account changes.
  const wishlistKey = `nn_wishlist:${user?.id ?? "guest"}`;
  useEffect(() => {
    let saved: string[] = [];
    try {
      const raw = localStorage.getItem(wishlistKey);
      const parsed = raw ? JSON.parse(raw) : [];
      saved = Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
    } catch {
      // ignore
    }
    setWishlist(saved);
    setWishlistOwner(wishlistKey);
  }, [wishlistKey]);

  // Save it back under the same account, never under the one that just signed in.
  useEffect(() => {
    if (wishlistOwner !== wishlistKey) return;
    try {
      localStorage.setItem(wishlistKey, JSON.stringify(wishlist));
    } catch {
      // ignore
    }
  }, [wishlist, wishlistKey, wishlistOwner]);

  // Cart operations
  const addToCart = (product: Product, variant?: WeightVariant, quantity = 1) => {
    const selectedVariant = variant || product.variants[0];
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.productId === product.id && item.variantId === selectedVariant.id
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        const newItem: CartItem = {
          productId: product.id,
          variantId: selectedVariant.id,
          name: product.name,
          slug: product.slug,
          category: product.categoryName,
          weight: selectedVariant.weight,
          price: selectedVariant.price,
          mrp: selectedVariant.mrp,
          image: getProductImage(product),
          quantity,
          sku: selectedVariant.sku,
        };
        return [...prev, newItem];
      }
    });

    toast.success(`Added ${product.name} (${selectedVariant.weight}) to cart`, {
      description: "Carefully selected harvest ready for your wellness.",
      action: {
        label: "View Cart",
        onClick: () => setIsCartOpen(true),
      },
    });
  };

  const removeFromCart = (productId: string, variantId: string) => {
    setCart((prev) => prev.filter((i) => !(i.productId === productId && i.variantId === variantId)));
    toast.info("Item removed from cart");
  };

  const updateQuantity = (productId: string, variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, variantId);
      return;
    }
    setCart((prev) =>
      prev.map((i) =>
        i.productId === productId && i.variantId === variantId ? { ...i, quantity } : i
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  // Calculations
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartSubtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  const cartDiscount = appliedCoupon ? getCouponDiscount(appliedCoupon, cartSubtotal) : 0;

  const cartDeliveryFee = getDeliveryFee(cartSubtotal, storeSettings.freeDeliveryMin);
  const cartTotal = Math.max(0, cartSubtotal - cartDiscount + cartDeliveryFee);

  const applyCouponCode = async (code: string): Promise<boolean> => {
    const res = await couponService.validateCoupon(code, cartSubtotal);
    if (res.valid && res.coupon) {
      setAppliedCoupon(res.coupon);
      toast.success(res.message);
      return true;
    } else {
      toast.error(res.message);
      return false;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    toast.info("Coupon removed");
  };

  const applyQuote = (quote: OrderQuote) => {
    const priced = (item: CartItem) =>
      quote.items.find((line) => line.productId === item.productId && line.variantId === item.variantId);
    setCart((prev) => {
      const changed = prev.some((item) => {
        const line = priced(item);
        return line && (line.price !== item.price || line.mrp !== item.mrp);
      });
      return changed ? prev.map((item) => ({ ...item, ...priced(item), quantity: item.quantity })) : prev;
    });
    setAppliedCoupon(quote.coupon);
  };

  // Coupons belong to an account, so one never carries over to the next.
  const userId = user?.id;
  useEffect(() => {
    setAppliedCoupon(null);
  }, [userId]);

  // Taking items out can drop the bag below the coupon's minimum.
  useEffect(() => {
    if (!appliedCoupon || cart.length === 0) return;
    const problem = getCouponProblem(appliedCoupon, cartSubtotal);
    if (problem) {
      setAppliedCoupon(null);
      toast.info(`Coupon ${appliedCoupon.code} removed. ${problem}`);
    }
  }, [appliedCoupon, cart.length, cartSubtotal]);

  // Wishlist operations
  const toggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const exists = prev.includes(product.id);
      if (exists) {
        toast.info(`Removed ${product.name} from wishlist`);
        return prev.filter((id) => id !== product.id);
      } else {
        toast.success(`Saved ${product.name} to wishlist`, {
          description: "View in your customer account.",
        });
        return [...prev, product.id];
      }
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  const logout = async () => {
    await endSession().catch(() => undefined);
    setUser(null);
    setActiveRole("customer");
  };

  return (
    <StoreContext.Provider
      value={{
        storeSettings,
        refreshStoreSettings,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartSubtotal,
        cartDiscount,
        cartDeliveryFee,
        cartTotal,
        isCartOpen,
        setIsCartOpen,
        appliedCoupon,
        applyCouponCode,
        removeCoupon,
        applyQuote,
        wishlist,
        toggleWishlist,
        isInWishlist,
        quickViewProduct,
        setQuickViewProduct,
        user,
        setUser,
        logout,
        activeRole,
        setActiveRole,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
