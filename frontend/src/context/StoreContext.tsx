"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product, CartItem, WeightVariant, Coupon, UserSession } from "@/types";
import { toast } from "sonner";
import { couponService } from "@/services/coupons";
import { getProductImage } from "@/lib/product-images";
import { clearSession, loadSessionUser } from "@/lib/auth-session";

interface StoreContextType {
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
  logout: () => void;
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
  const [wishlist, setWishlist] = useState<string[]>(["prod-cashew-1", "prod-almond-1"]);

  // Quick view modal
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // The server establishes a user session after successful authentication.
  const [user, setUser] = useState<UserSession | null>(null);
  const [activeRole, setActiveRole] = useState<"customer" | "admin" | "developer">("customer");

  // Load cart from localStorage on mount (hydration safe)
  useEffect(() => {
    setUser(loadSessionUser());
    try {
      const saved = localStorage.getItem("nn_cart");
      if (saved) {
        setCart(JSON.parse(saved));
      }
      const savedWishlist = localStorage.getItem("nn_wishlist");
      if (savedWishlist) {
        setWishlist(JSON.parse(savedWishlist));
      }
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

  // Save wishlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("nn_wishlist", JSON.stringify(wishlist));
    } catch {
      // ignore
    }
  }, [wishlist]);

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

  // Discount calculation
  let cartDiscount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === "percentage") {
      cartDiscount = Math.round((cartSubtotal * appliedCoupon.discountValue) / 100);
      if (appliedCoupon.maxDiscount && cartDiscount > appliedCoupon.maxDiscount) {
        cartDiscount = appliedCoupon.maxDiscount;
      }
    } else {
      cartDiscount = appliedCoupon.discountValue;
    }
  }

  // Free delivery over ₹999
  const cartDeliveryFee = cartSubtotal >= 999 || cartSubtotal === 0 ? 0 : 99;
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

  const logout = () => {
    clearSession();
    setUser(null);
    setActiveRole("customer");
  };

  return (
    <StoreContext.Provider
      value={{
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
