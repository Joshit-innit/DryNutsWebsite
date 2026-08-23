"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { productService } from "@/services/products";
import { reviewService } from "@/services/reviews";
import { Product, WeightVariant, Review } from "@/types";
import { useStore } from "@/context/StoreContext";
import { formatPrice, calculateDiscount } from "@/lib/utils";
import ProductCard from "@/components/products/ProductCard";
import { toast } from "sonner";
import {
  Star,
  ShoppingBag,
  Heart,
  Truck,
  ShieldCheck,
  Award,
  Leaf,
  Check,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  MapPin,
  Clock,
  HelpCircle,
  MessageSquare,
} from "lucide-react";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const { addToCart, toggleWishlist, isInWishlist, setIsCartOpen } = useStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"story" | "nutrition" | "reviews" | "faqs">("story");
  const [pincode, setPincode] = useState("");
  const [pincodeChecked, setPincodeChecked] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  // New review form
  const [newReviewName, setNewReviewName] = useState("");
  const [newReviewComment, setNewReviewComment] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(5);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const prod = await productService.getProductBySlug(slug);
      if (prod) {
        setProduct(prod);
        const related = await productService.getRelatedProducts(prod.category, prod.slug);
        setRelatedProducts(related);
        const revs = await reviewService.getReviewsForProduct(prod.id);
        setReviews(revs);
      }
      setLoading(false);
    }
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 animate-pulse space-y-8">
        <div className="h-6 bg-white rounded w-1/4" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="aspect-square bg-white rounded-3xl" />
          <div className="space-y-4">
            <div className="h-8 bg-white rounded w-3/4" />
            <div className="h-4 bg-white rounded w-1/2" />
            <div className="h-12 bg-white rounded w-1/3" />
            <div className="h-24 bg-white rounded w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="font-serif font-bold text-3xl text-brand-dark mb-4">Product Not Found</h1>
        <p className="text-sm text-brand-muted mb-6">The requested product could not be located in our harvest catalog.</p>
        <Link href="/products" className="bg-brand-green text-white px-6 py-3 rounded-xl font-semibold text-xs">
          Explore All Dry Fruits
        </Link>
      </div>
    );
  }

  const currentVariant = product.variants[selectedVariantIndex] || product.variants[0];
  const discountPercent = calculateDiscount(currentVariant.mrp, currentVariant.price);
  const wishlisted = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(product, currentVariant, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const handleBuyNow = () => {
    addToCart(product, currentVariant, quantity);
    router.push("/checkout");
  };

  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincode.length === 6) {
      setPincodeChecked(true);
      toast.success("Delivery available to " + pincode, {
        description: "Standard delivery: 2-3 business days. Express next-day available.",
      });
    } else {
      toast.error("Please enter a valid 6-digit Indian PIN code");
    }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewName || !newReviewComment) {
      toast.error("Please fill in your name and review comment.");
      return;
    }
    const created = await reviewService.addReview({
      productId: product.id,
      customerName: newReviewName,
      location: "Verified Buyer",
      rating: newReviewRating,
      title: "Gourmet Quality Harvest",
      comment: newReviewComment,
      verifiedPurchase: true,
    });
    setReviews([created, ...reviews]);
    setNewReviewName("");
    setNewReviewComment("");
    toast.success("Review submitted! Thank you for sharing your feedback.");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-brand-muted">
        <Link href="/" className="hover:text-brand-green">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/products" className="hover:text-brand-green">Shop</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href={`/category/${product.category}`} className="hover:text-brand-green">{product.categoryName}</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-brand-dark font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Product Presentation Hero (Gallery + Buy Box) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left: Gallery (Sticky on desktop) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="aspect-square rounded-3xl overflow-hidden bg-white border border-brand-border shadow-card relative group">
            <img
              src={product.images[activeImageIndex] || product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {discountPercent > 0 && (
              <span className="absolute top-4 left-4 bg-brand-green text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                {discountPercent}% OFF
              </span>
            )}
            {product.grade && (
              <span className="absolute top-4 right-4 bg-brand-dark/80 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full">
                {product.grade}
              </span>
            )}
          </div>

          {/* Thumbnail row */}
          {product.images.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 bg-white transition-all ${
                    activeImageIndex === idx
                      ? "border-brand-green scale-105 shadow-sm"
                      : "border-brand-border opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Buy Box & Product Details */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="uppercase font-bold tracking-widest text-brand-green">
                {product.categoryName} • {product.origin.split(",")[0]}
              </span>
              <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-full border border-brand-border font-semibold text-brand-dark">
                <Star className="w-3.5 h-3.5 fill-brand-saffron text-brand-saffron" />
                <span>{product.rating.toFixed(1)}</span>
                <span className="text-brand-muted">({product.reviewCount} reviews)</span>
              </div>
            </div>

            <h1 className="font-serif font-black text-2xl sm:text-4xl text-brand-dark mb-2">
              {product.name}
            </h1>

            <p className="text-sm text-brand-muted leading-relaxed">
              {product.shortDescription}
            </p>
          </div>

          {/* Price Block */}
          <div className="p-5 rounded-2xl bg-white border border-brand-border shadow-xs space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-brand-dark">
                {formatPrice(currentVariant.price)}
              </span>
              {currentVariant.mrp > currentVariant.price && (
                <span className="text-base text-brand-muted line-through">
                  {formatPrice(currentVariant.mrp)}
                </span>
              )}
              {discountPercent > 0 && (
                <span className="text-xs font-bold text-brand-green bg-brand-green/10 px-2 py-0.5 rounded-full">
                  Save {formatPrice(currentVariant.mrp - currentVariant.price)} ({discountPercent}%)
                </span>
              )}
            </div>
            <p className="text-[11px] text-brand-muted">
              Inclusive of all taxes • Free express shipping on orders over ₹999
            </p>
          </div>

          {/* Weight Variant Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark mb-2.5">
              Select Package Weight:
            </label>
            <div className="grid grid-cols-3 gap-3">
              {product.variants.map((v, idx) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVariantIndex(idx)}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    selectedVariantIndex === idx
                      ? "border-brand-green bg-brand-green/10 text-brand-dark font-bold shadow-xs"
                      : "border-brand-border bg-white text-brand-dark hover:border-brand-muted"
                  }`}
                >
                  <span className="block text-xs font-bold">{v.weight}</span>
                  <span className="block text-[11px] text-brand-muted mt-0.5">
                    {formatPrice(v.price)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Quantity and Actions */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-brand-border rounded-xl bg-white overflow-hidden shadow-xs">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-12 flex items-center justify-center text-brand-dark hover:bg-brand-cream font-bold"
                >
                  -
                </button>
                <span className="w-10 text-center text-sm font-bold">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-10 h-12 flex items-center justify-center text-brand-dark hover:bg-brand-cream font-bold"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={currentVariant.stock <= 0}
                className={`flex-1 py-3.5 px-6 rounded-xl font-bold text-sm text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 ${
                  isAdded ? "bg-brand-green-dark" : "bg-brand-green hover:bg-brand-green-dark"
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Harvest Bag</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Bag • {formatPrice(currentVariant.price * quantity)}</span>
                  </>
                )}
              </button>

              <button
                onClick={() => toggleWishlist(product)}
                className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-colors ${
                  wishlisted
                    ? "bg-red-50 border-red-200 text-red-500"
                    : "border-brand-border bg-white text-brand-dark hover:bg-brand-cream"
                }`}
                aria-label="Wishlist"
              >
                <Heart className={`w-5 h-5 ${wishlisted ? "fill-red-500" : ""}`} />
              </button>
            </div>

            <button
              onClick={handleBuyNow}
              className="w-full py-3.5 bg-brand-orange hover:bg-brand-orange-dark text-white font-bold text-sm rounded-xl shadow-sm transition-colors"
            >
              Instant Buy Now
            </button>
          </div>

          {/* Delivery Pincode Checker */}
          <div className="p-4 rounded-2xl bg-white border border-brand-border space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-brand-dark uppercase tracking-wider">
              <Truck className="w-4 h-4 text-brand-green" />
              <span>Check Delivery Speed in Your Area</span>
            </div>
            <form onSubmit={handleCheckPincode} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter 6-digit Pincode (e.g. 560038)"
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="flex-1 text-xs px-3 py-2 border border-brand-border rounded-xl focus:outline-none focus:border-brand-green"
              />
              <button
                type="submit"
                className="bg-brand-dark hover:bg-brand-dark-light text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors"
              >
                Check
              </button>
            </form>
            {pincodeChecked && (
              <p className="text-xs text-brand-green font-medium flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Express 24-48h Delivery Available to {pincode}
              </p>
            )}
          </div>

          {/* Trust Highlights */}
          <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-brand-muted">
            <div className="flex items-center gap-2">
              <Leaf className="w-4 h-4 text-brand-green" />
              <span>100% Raw & Unadulterated</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-brand-saffron" />
              <span>Direct Orchard Sourcing</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-orange" />
              <span>Nitrogen-Sealed Freshness</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-green" />
              <span>Quality Grade Certified</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section: Sourcing Story, Nutrition, Verified Reviews, FAQs */}
      <div className="bg-white rounded-3xl border border-brand-border p-6 sm:p-10 shadow-subtle">
        <div className="flex border-b border-brand-border gap-6 sm:gap-10 mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab("story")}
            className={`pb-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${
              activeTab === "story"
                ? "border-brand-green text-brand-green"
                : "border-transparent text-brand-muted hover:text-brand-dark"
            }`}
          >
            Sourcing & Description
          </button>
          <button
            onClick={() => setActiveTab("nutrition")}
            className={`pb-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${
              activeTab === "nutrition"
                ? "border-brand-green text-brand-green"
                : "border-transparent text-brand-muted hover:text-brand-dark"
            }`}
          >
            Health & Nutrition
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`pb-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${
              activeTab === "reviews"
                ? "border-brand-green text-brand-green"
                : "border-transparent text-brand-muted hover:text-brand-dark"
            }`}
          >
            Customer Reviews ({reviews.length})
          </button>
          <button
            onClick={() => setActiveTab("faqs")}
            className={`pb-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${
              activeTab === "faqs"
                ? "border-brand-green text-brand-green"
                : "border-transparent text-brand-muted hover:text-brand-dark"
            }`}
          >
            Storage & FAQs
          </button>
        </div>

        {/* Tab 1: Story & Description */}
        {activeTab === "story" && (
          <div className="space-y-6 max-w-4xl text-sm leading-relaxed text-brand-dark">
            <div>
              <h3 className="font-serif font-bold text-xl text-brand-dark mb-2">The Harvest Origin</h3>
              <p className="text-brand-muted">{product.description}</p>
            </div>

            <div>
              <h4 className="font-bold text-sm text-brand-dark mb-2">Key Health Benefits:</h4>
              <ul className="space-y-2">
                {product.benefits.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-brand-muted">
                    <CheckCircle2 className="w-4 h-4 text-brand-green flex-shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-brand-cream/70 border border-brand-border">
              <h4 className="font-bold text-xs uppercase tracking-wider text-brand-dark mb-1">Ingredients:</h4>
              <p className="text-xs text-brand-muted">{product.ingredients}</p>
            </div>
          </div>
        )}

        {/* Tab 2: Nutrition Facts */}
        {activeTab === "nutrition" && (
          <div className="max-w-xl space-y-6">
            <div>
              <h3 className="font-serif font-bold text-xl text-brand-dark mb-1">Nutritional Values</h3>
              <p className="text-xs text-brand-muted">Serving size: {product.nutrition.servingSize}</p>
            </div>

            <div className="border border-brand-border rounded-2xl overflow-hidden divide-y divide-brand-border">
              <div className="flex justify-between p-3 text-xs font-bold bg-brand-cream/50">
                <span>Energy / Calories</span>
                <span>{product.nutrition.calories}</span>
              </div>
              <div className="flex justify-between p-3 text-xs">
                <span>Plant Protein</span>
                <span className="font-semibold">{product.nutrition.protein}</span>
              </div>
              <div className="flex justify-between p-3 text-xs">
                <span>Healthy Monounsaturated Fats</span>
                <span className="font-semibold">{product.nutrition.healthyFats}</span>
              </div>
              <div className="flex justify-between p-3 text-xs">
                <span>Dietary Carbohydrates</span>
                <span className="font-semibold">{product.nutrition.carbs}</span>
              </div>
              <div className="flex justify-between p-3 text-xs">
                <span>Natural Dietary Fiber</span>
                <span className="font-semibold">{product.nutrition.fiber}</span>
              </div>
              {product.nutrition.calcium && (
                <div className="flex justify-between p-3 text-xs">
                  <span>Calcium</span>
                  <span className="font-semibold">{product.nutrition.calcium}</span>
                </div>
              )}
              {product.nutrition.iron && (
                <div className="flex justify-between p-3 text-xs">
                  <span>Iron</span>
                  <span className="font-semibold">{product.nutrition.iron}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Customer Reviews */}
        {activeTab === "reviews" && (
          <div className="space-y-8 max-w-3xl">
            {/* Reviews summary */}
            <div className="flex items-center gap-6 p-6 rounded-2xl bg-brand-cream/50 border border-brand-border">
              <div className="text-center">
                <span className="font-serif font-black text-4xl text-brand-dark block">
                  {product.rating.toFixed(1)}
                </span>
                <div className="flex text-brand-saffron justify-center my-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-brand-saffron" />
                  ))}
                </div>
                <span className="text-[11px] text-brand-muted">{reviews.length} Verified Reviews</span>
              </div>
              <div className="flex-1 border-l border-brand-border pl-6 text-xs text-brand-muted">
                <p>100% of reviewers recommend this harvest for its exceptional flavor and vacuum crunch freshness.</p>
              </div>
            </div>

            {/* Review Form */}
            <form onSubmit={handleAddReview} className="p-6 rounded-2xl border border-brand-border bg-white space-y-4">
              <h4 className="font-serif font-bold text-base text-brand-dark">Write a Customer Review</h4>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold">Your Rating:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setNewReviewRating(s)}
                      className="p-0.5 text-brand-saffron"
                    >
                      <Star className={`w-4 h-4 ${s <= newReviewRating ? "fill-brand-saffron" : "text-gray-300"}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Your Full Name"
                  value={newReviewName}
                  onChange={(e) => setNewReviewName(e.target.value)}
                  className="text-xs p-3 border border-brand-border rounded-xl focus:outline-none focus:border-brand-green"
                />
              </div>
              <textarea
                placeholder="Share your experience with this dry fruit harvest..."
                rows={3}
                value={newReviewComment}
                onChange={(e) => setNewReviewComment(e.target.value)}
                className="w-full text-xs p-3 border border-brand-border rounded-xl focus:outline-none focus:border-brand-green"
              />
              <button
                type="submit"
                className="bg-brand-green hover:bg-brand-green-dark text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-colors"
              >
                Submit Verified Review
              </button>
            </form>

            {/* Reviews list */}
            <div className="space-y-4">
              {reviews.map((rev) => (
                <div key={rev.id} className="p-4 rounded-2xl border border-brand-border bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-brand-dark">{rev.customerName}</span>
                      <span className="text-[10px] text-brand-green font-semibold bg-brand-green/10 px-2 py-0.5 rounded-full">
                        Verified Purchase
                      </span>
                    </div>
                    <span className="text-[10px] text-brand-muted">{rev.date}</span>
                  </div>
                  <div className="flex text-brand-saffron">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-brand-saffron" />
                    ))}
                  </div>
                  <h5 className="font-bold text-xs text-brand-dark">{rev.title}</h5>
                  <p className="text-xs text-brand-muted leading-relaxed">{rev.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Storage & FAQs */}
        {activeTab === "faqs" && (
          <div className="space-y-6 max-w-3xl">
            <div className="p-4 rounded-2xl bg-brand-cream/60 border border-brand-border">
              <h4 className="font-serif font-bold text-base text-brand-dark mb-1">Storage Instructions</h4>
              <p className="text-xs text-brand-muted leading-relaxed">{product.storageInfo}</p>
            </div>

            {product.faqs && (
              <div className="space-y-3">
                <h4 className="font-serif font-bold text-base text-brand-dark">Frequently Asked Questions</h4>
                {product.faqs.map((faq, i) => (
                  <div key={i} className="p-4 rounded-2xl border border-brand-border bg-white space-y-1">
                    <h5 className="font-bold text-xs text-brand-dark flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-brand-green" />
                      <span>{faq.question}</span>
                    </h5>
                    <p className="text-xs text-brand-muted pl-5">{faq.answer}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cross-Sell: Related Pairings */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-black text-2xl text-brand-dark">
              CURATED PAIRINGS & SIMILAR HARVESTS
            </h3>
            <Link href="/products" className="text-xs font-bold text-brand-green hover:underline">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
