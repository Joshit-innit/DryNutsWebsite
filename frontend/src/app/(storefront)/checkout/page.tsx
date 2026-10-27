"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import { orderService } from "@/services/orders";
import { formatPrice } from "@/lib/utils";
import { Address, Order } from "@/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import {
  Check,
  ChevronRight,
  ShoppingBag,
  MapPin,
  Truck,
  CreditCard,
  CheckCircle2,
  ShieldCheck,
  Lock,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Download,
  Calendar,
} from "lucide-react";

const addressSchema = z.object({
  name: z.string().min(2, "Full name is required"),
  phone: z.string().min(10, "Valid 10-digit mobile number required"),
  street: z.string().min(5, "Street address & house/flat number required"),
  landmark: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().regex(/^[1-9][0-9]{5}$/, "Valid 6-digit PIN code required"),
  type: z.enum(["home", "work", "other"]),
});

type AddressFormData = z.infer<typeof addressSchema>;

export default function CheckoutPage() {
  const { cart, cartSubtotal, cartDiscount, cartDeliveryFee, cartTotal, clearCart } = useStore();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Address State
  const [selectedAddress, setSelectedAddress] = useState<Address>({
    id: "addr-1",
    name: "Chandu Tammana",
    phone: "+91 98765 43210",
    street: "Flat 402, Silver Oak Residency, 14th Main, Indiranagar",
    landmark: "Near 100ft Road Club",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560038",
    type: "home",
  });
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);

  // Delivery Speed State
  const [deliverySpeed, setDeliverySpeed] = useState<"standard" | "express">("standard");

  // Payment Method State
  const [paymentMethod, setPaymentMethod] = useState<"UPI" | "Card" | "NetBanking" | "COD">("UPI");
  const [upiId, setUpiId] = useState("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // React Hook Form for new address
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      name: "Chandu Tammana",
      phone: "9876543210",
      street: "Flat 402, Silver Oak Residency, 14th Main",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560038",
      type: "home",
    },
  });

  const onSaveAddress = (data: AddressFormData) => {
    const newAddr: Address = {
      id: `addr-${Date.now()}`,
      ...data,
      phone: `+91 ${data.phone}`,
    };
    setSelectedAddress(newAddr);
    setIsAddingNewAddress(false);
    toast.success("Shipping address saved");
  };

  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true);
    try {
      const order = await orderService.createOrder({
        items: cart,
        subtotal: cartSubtotal,
        discount: cartDiscount,
        deliveryFee: deliverySpeed === "express" ? 99 : cartDeliveryFee,
        total: cartTotal + (deliverySpeed === "express" ? 99 : 0),
        paymentMethod,
        shippingAddress: selectedAddress,
      });

      setConfirmedOrder(order);
      clearCart();
      setCurrentStep(5);

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }

      toast.success("Order Placed Successfully!", {
        description: `Order #${order.orderNumber} is confirmed.`,
      });
    } catch {
      toast.error("Failed to place order. Please try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const finalDeliveryFee = deliverySpeed === "express" ? 99 : cartDeliveryFee;
  const finalTotal = cartTotal + (deliverySpeed === "express" ? 99 : 0);

  const steps = [
    { num: 1, label: "Bag Review" },
    { num: 2, label: "Shipping" },
    { num: 3, label: "Delivery" },
    { num: 4, label: "Payment" },
    { num: 5, label: "Confirmation" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Step Progress Stepper */}
      <div className="bg-white rounded-3xl border border-brand-border p-4 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          {steps.map((s, idx) => {
            const isCompleted = currentStep > s.num;
            const isCurrent = currentStep === s.num;
            return (
              <React.Fragment key={s.num}>
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isCompleted
                        ? "bg-brand-green text-white"
                        : isCurrent
                        ? "bg-brand-saffron text-brand-dark ring-4 ring-brand-saffron/20 font-black"
                        : "bg-brand-cream text-brand-muted border border-brand-border"
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4" /> : s.num}
                  </div>
                  <span
                    className={`text-[11px] font-semibold hidden sm:inline ${
                      isCurrent ? "text-brand-dark font-bold" : "text-brand-muted"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 transition-all ${
                      currentStep > s.num ? "bg-brand-green" : "bg-brand-border"
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Main Checkout Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Interactive Step Form */}
        <div className="lg:col-span-8 space-y-6">
          {/* STEP 1: BAG REVIEW */}
          {currentStep === 1 && (
            <div className="bg-white rounded-3xl border border-brand-border p-6 sm:p-8 shadow-xs space-y-6">
              <h2 className="font-serif font-bold text-xl text-brand-dark">
                1. Review Items in Your Harvest Bag
              </h2>
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-brand-muted">Your bag is empty.</p>
                  <Link href="/products" className="text-xs text-brand-green font-bold hover:underline mt-2 inline-block">
                    Explore Harvest Catalog
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-brand-border">
                  {cart.map((item) => (
                    <div key={`${item.productId}-${item.variantId}`} className="py-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-xl bg-brand-cream overflow-hidden border border-brand-border">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h4 className="font-marcellus font-normal text-sm sm:text-base text-brand-dark line-clamp-1 tracking-[0.015em]">
                            {item.name}
                          </h4>
                          <p className="text-xs text-brand-muted">{item.weight} • Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <span className="font-bold text-sm text-brand-dark">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {cart.length > 0 && (
                <div className="pt-4 border-t border-brand-border flex justify-end">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="bg-brand-green hover:bg-brand-green-dark text-white font-semibold text-xs px-8 py-3.5 rounded-xl shadow-sm transition-all flex items-center gap-2"
                  >
                    <span>Proceed to Shipping Address</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: SHIPPING ADDRESS */}
          {currentStep === 2 && (
            <div className="bg-white rounded-3xl border border-brand-border p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-serif font-bold text-xl text-brand-dark">
                  2. Select Delivery Address
                </h2>
                <button
                  onClick={() => setIsAddingNewAddress(!isAddingNewAddress)}
                  className="text-xs font-bold text-brand-green hover:underline"
                >
                  {isAddingNewAddress ? "Use Saved Address" : "+ Add New Address"}
                </button>
              </div>

              {!isAddingNewAddress ? (
                <div className="space-y-3">
                  <div className="p-5 rounded-2xl border-2 border-brand-green bg-brand-green/5 space-y-2 relative">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-brand-green" />
                        <span className="font-bold text-sm text-brand-dark">{selectedAddress.name}</span>
                        <span className="text-[10px] uppercase font-bold bg-brand-green text-white px-2 py-0.5 rounded-full">
                          {selectedAddress.type}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-brand-green">Selected</span>
                    </div>
                    <p className="text-xs text-brand-muted leading-relaxed">
                      {selectedAddress.street}, {selectedAddress.landmark && `${selectedAddress.landmark}, `}
                      {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
                    </p>
                    <p className="text-xs text-brand-dark font-medium">Contact: {selectedAddress.phone}</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSaveAddress)} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-brand-dark mb-1">Full Name</label>
                      <input
                        {...register("name")}
                        className="w-full text-xs p-3 border border-brand-border rounded-xl focus:outline-none focus:border-brand-green"
                      />
                      {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-brand-dark mb-1">Mobile Number (10 digits)</label>
                      <input
                        {...register("phone")}
                        className="w-full text-xs p-3 border border-brand-border rounded-xl focus:outline-none focus:border-brand-green"
                      />
                      {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-brand-dark mb-1">Street Address, House/Flat No.</label>
                    <input
                      {...register("street")}
                      className="w-full text-xs p-3 border border-brand-border rounded-xl focus:outline-none focus:border-brand-green"
                    />
                    {errors.street && <p className="text-xs text-red-500 mt-1">{errors.street.message}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-brand-dark mb-1">City</label>
                      <input
                        {...register("city")}
                        className="w-full text-xs p-3 border border-brand-border rounded-xl focus:outline-none focus:border-brand-green"
                      />
                      {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city.message}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-brand-dark mb-1">State</label>
                      <input
                        {...register("state")}
                        className="w-full text-xs p-3 border border-brand-border rounded-xl focus:outline-none focus:border-brand-green"
                      />
                      {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state.message}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-brand-dark mb-1">PIN Code</label>
                      <input
                        {...register("pincode")}
                        className="w-full text-xs p-3 border border-brand-border rounded-xl focus:outline-none focus:border-brand-green"
                      />
                      {errors.pincode && <p className="text-xs text-red-500 mt-1">{errors.pincode.message}</p>}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="bg-brand-dark text-white text-xs font-bold px-6 py-3 rounded-xl hover:bg-brand-dark-light transition-colors"
                  >
                    Save & Use This Address
                  </button>
                </form>
              )}

              <div className="pt-4 border-t border-brand-border flex items-center justify-between">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="text-xs text-brand-muted hover:text-brand-dark flex items-center gap-1 font-medium"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Bag
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="bg-brand-green hover:bg-brand-green-dark text-white font-semibold text-xs px-8 py-3.5 rounded-xl shadow-sm transition-all flex items-center gap-2"
                >
                  <span>Continue to Delivery Speed</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: DELIVERY METHOD */}
          {currentStep === 3 && (
            <div className="bg-white rounded-3xl border border-brand-border p-6 sm:p-8 shadow-xs space-y-6">
              <h2 className="font-serif font-bold text-xl text-brand-dark">
                3. Choose Delivery Speed
              </h2>

              <div className="space-y-3">
                {/* Standard Free Delivery */}
                <label
                  onClick={() => setDeliverySpeed("standard")}
                  className={`p-5 rounded-2xl border-2 flex items-start justify-between cursor-pointer transition-all ${
                    deliverySpeed === "standard"
                      ? "border-brand-green bg-brand-green/5"
                      : "border-brand-border hover:border-brand-muted"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="deliverySpeed"
                      checked={deliverySpeed === "standard"}
                      onChange={() => setDeliverySpeed("standard")}
                      className="mt-1 text-brand-green accent-brand-green"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-brand-dark">Standard Insured Ground/Air</span>
                        <span className="text-[10px] bg-brand-green/20 text-brand-green font-bold px-2 py-0.5 rounded-full">
                          FREE
                        </span>
                      </div>
                      <p className="text-xs text-brand-muted mt-1">
                        Estimated delivery: 2-3 business days. Sealed in temperature-controlled transit.
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-sm text-brand-green">₹0</span>
                </label>

                {/* Express Priority Air */}
                <label
                  onClick={() => setDeliverySpeed("express")}
                  className={`p-5 rounded-2xl border-2 flex items-start justify-between cursor-pointer transition-all ${
                    deliverySpeed === "express"
                      ? "border-brand-green bg-brand-green/5"
                      : "border-brand-border hover:border-brand-muted"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="deliverySpeed"
                      checked={deliverySpeed === "express"}
                      onChange={() => setDeliverySpeed("express")}
                      className="mt-1 text-brand-green accent-brand-green"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-brand-dark">Priority Next-Day Air Express</span>
                        <span className="text-[10px] bg-brand-saffron/30 text-brand-dark font-bold px-2 py-0.5 rounded-full">
                          FASTEST
                        </span>
                      </div>
                      <p className="text-xs text-brand-muted mt-1">
                        Guaranteed delivery within 24 hours. Hand-sorted & priority dispatched.
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-sm text-brand-dark">₹99</span>
                </label>
              </div>

              <div className="pt-4 border-t border-brand-border flex items-center justify-between">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="text-xs text-brand-muted hover:text-brand-dark flex items-center gap-1 font-medium"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Shipping
                </button>
                <button
                  onClick={() => setCurrentStep(4)}
                  className="bg-brand-green hover:bg-brand-green-dark text-white font-semibold text-xs px-8 py-3.5 rounded-xl shadow-sm transition-all flex items-center gap-2"
                >
                  <span>Proceed to Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: PAYMENT SELECTION */}
          {currentStep === 4 && (
            <div className="bg-white rounded-3xl border border-brand-border p-6 sm:p-8 shadow-xs space-y-6">
              <h2 className="font-serif font-bold text-xl text-brand-dark">
                4. Select Payment Method
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: "UPI", label: "UPI / QR", icon: Sparkles },
                  { id: "Card", label: "Cards", icon: CreditCard },
                  { id: "NetBanking", label: "Net Banking", icon: ShieldCheck },
                  { id: "COD", label: "Cash on Delivery", icon: Truck },
                ].map((pm) => (
                  <button
                    key={pm.id}
                    onClick={() => setPaymentMethod(pm.id as any)}
                    className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-2 ${
                      paymentMethod === pm.id
                        ? "border-brand-green bg-brand-green/10 text-brand-dark font-bold shadow-xs"
                        : "border-brand-border bg-white text-brand-dark hover:border-brand-muted"
                    }`}
                  >
                    <pm.icon className={`w-5 h-5 ${paymentMethod === pm.id ? "text-brand-green" : "text-brand-muted"}`} />
                    <span className="text-xs font-semibold">{pm.label}</span>
                  </button>
                ))}
              </div>

              {/* UPI Form */}
              {paymentMethod === "UPI" && (
                <div className="p-5 rounded-2xl bg-brand-cream/60 border border-brand-border space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-dark block">
                    Enter Virtual Payment Address (VPA / UPI ID)
                  </span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. yourname@oksbi or mobile@paytm"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="flex-1 text-xs p-3 bg-white border border-brand-border rounded-xl focus:outline-none focus:border-brand-green"
                    />
                  </div>
                  <p className="text-[11px] text-brand-muted">
                    Instant app notification will be sent to your PhonePe / GPay / BHIM app.
                  </p>
                </div>
              )}

              {/* Card Form */}
              {paymentMethod === "Card" && (
                <div className="p-5 rounded-2xl bg-brand-cream/60 border border-brand-border space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-brand-dark mb-1">Card Number</label>
                    <input
                      type="text"
                      placeholder="4532 •••• •••• 8921"
                      className="w-full text-xs p-3 bg-white border border-brand-border rounded-xl focus:outline-none focus:border-brand-green"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-brand-dark mb-1">Expiry (MM/YY)</label>
                      <input
                        type="text"
                        placeholder="12/28"
                        className="w-full text-xs p-3 bg-white border border-brand-border rounded-xl focus:outline-none focus:border-brand-green"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-brand-dark mb-1">CVV</label>
                      <input
                        type="password"
                        placeholder="•••"
                        maxLength={4}
                        className="w-full text-xs p-3 bg-white border border-brand-border rounded-xl focus:outline-none focus:border-brand-green"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === "COD" && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                  <p className="font-bold">Cash on Delivery Notice:</p>
                  <p>Please keep exact cash ready of <strong>{formatPrice(finalTotal)}</strong> at the time of delivery.</p>
                </div>
              )}

              <div className="pt-4 border-t border-brand-border flex items-center justify-between">
                <button
                  onClick={() => setCurrentStep(3)}
                  className="text-xs text-brand-muted hover:text-brand-dark flex items-center gap-1 font-medium"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Delivery
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder}
                  className="bg-brand-green hover:bg-brand-green-dark text-white font-bold text-sm px-10 py-4 rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                >
                  {isPlacingOrder ? (
                    <span>Securing Order...</span>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>PAY & PLACE ORDER • {formatPrice(finalTotal)}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: ORDER CONFIRMATION */}
          {currentStep === 5 && confirmedOrder && (
            <div className="bg-white rounded-3xl border border-brand-border p-8 sm:p-12 shadow-card text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-brand-green/20 text-brand-green flex items-center justify-center mx-auto shadow-sm animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-brand-green">
                  THANK YOU FOR NOURISHING NATURALLY
                </span>
                <h2 className="font-serif font-black text-3xl sm:text-4xl text-brand-dark">
                  Order Successfully Confirmed!
                </h2>
                <p className="text-xs sm:text-sm text-brand-muted max-w-md mx-auto">
                  We have allocated your harvest reserve and dispatched a confirmation SMS & email to your inbox.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-brand-cream/60 border border-brand-border max-w-md mx-auto text-left space-y-3 text-xs">
                <div className="flex justify-between font-bold text-brand-dark pb-2 border-b border-brand-border">
                  <span>Order Reference:</span>
                  <span className="text-brand-green font-mono">{confirmedOrder.orderNumber}</span>
                </div>
                <div className="flex justify-between text-brand-muted">
                  <span>Payment Method:</span>
                  <span className="text-brand-dark font-medium">{confirmedOrder.paymentMethod}</span>
                </div>
                <div className="flex justify-between text-brand-muted">
                  <span>Estimated Delivery:</span>
                  <span className="text-brand-dark font-medium">{confirmedOrder.estimatedDelivery}</span>
                </div>
                <div className="flex justify-between text-brand-dark font-bold pt-2 border-t border-brand-border text-sm">
                  <span>Amount Paid:</span>
                  <span className="text-brand-green">{formatPrice(confirmedOrder.total)}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                <Link
                  href={`/account/orders/${confirmedOrder.id}`}
                  className="w-full sm:w-auto bg-brand-green hover:bg-brand-green-dark text-white text-xs font-bold px-8 py-3.5 rounded-xl transition-all shadow-sm"
                >
                  Track Live Delivery Timeline
                </Link>
                <Link
                  href="/products"
                  className="w-full sm:w-auto bg-white hover:bg-brand-cream text-brand-dark border border-brand-border text-xs font-bold px-8 py-3.5 rounded-xl transition-colors"
                >
                  Explore More Dry Fruits
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Right Sticky Checkout Summary */}
        {currentStep < 5 && (
          <div className="lg:col-span-4 bg-white rounded-3xl border border-brand-border p-6 sm:p-8 shadow-card space-y-6 sticky top-28">
            <h3 className="font-serif font-bold text-lg text-brand-dark border-b border-brand-border pb-3">
              Order Breakdown
            </h3>

            <div className="space-y-2 text-xs text-brand-muted">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="text-brand-dark font-semibold">{formatPrice(cartSubtotal)}</span>
              </div>
              {cartDiscount > 0 && (
                <div className="flex justify-between text-brand-green font-semibold">
                  <span>Coupon Discount</span>
                  <span>-{formatPrice(cartDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span className="text-brand-dark font-medium">
                  {finalDeliveryFee === 0 ? "FREE" : formatPrice(finalDeliveryFee)}
                </span>
              </div>
              <div className="flex justify-between text-base font-black text-brand-dark pt-3 border-t border-brand-border">
                <span>Total Amount</span>
                <span className="text-xl text-brand-green">{formatPrice(finalTotal)}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-brand-cream/60 border border-brand-border space-y-2 text-[11px] text-brand-muted">
              <div className="flex items-center gap-1.5 text-brand-green font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>NutriNation Freshness Guarantee</span>
              </div>
              <p>
                Every dry fruit kernel is vacuum inspected and nitrogen sealed for maximum natural crunch.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
