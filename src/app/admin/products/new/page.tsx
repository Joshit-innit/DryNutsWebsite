"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Save, Plus, X, Loader2 } from "lucide-react";

const CATEGORY_OPTIONS = [
  { slug: "cashews", name: "Cashews" },
  { slug: "pistachios", name: "Pistachios" },
  { slug: "almonds", name: "Almonds" },
  { slug: "walnuts", name: "Walnuts" },
  { slug: "raisins", name: "Raisins" },
  { slug: "dates", name: "Dates" },
  { slug: "dried-apricots", name: "Dried Apricots" },
  { slug: "dry-figs", name: "Dry Figs" },
  { slug: "prunes", name: "Prunes" },
  { slug: "combos", name: "Curated Combos" },
  { slug: "gift-boxes", name: "Festive Gift Boxes" },
];

interface Variant {
  weight: string;
  price: string;
  mrp: string;
  stock: string;
  sku: string;
}

export default function AdminNewProductPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  // Core Fields
  const [name, setName] = useState("");
  const [categorySlug, setCategorySlug] = useState("cashews");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [originCountry, setOriginCountry] = useState("India");
  const [originRegion, setOriginRegion] = useState("");
  const [shelfLife, setShelfLife] = useState("12 months");
  const [storageInstructions, setStorageInstructions] = useState("Store in a cool, dry place.");
  const [packagingType, setPackagingType] = useState("Nitrogen-Flushed Zip-Lock Pouch");
  const [isOrganic, setIsOrganic] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);

  // Benefits (dynamic list)
  const [benefits, setBenefits] = useState<string[]>(["", "", ""]);

  // Variants
  const [variants, setVariants] = useState<Variant[]>([
    { weight: "250g", price: "", mrp: "", stock: "", sku: "" },
    { weight: "500g", price: "", mrp: "", stock: "", sku: "" },
    { weight: "1kg", price: "", mrp: "", stock: "", sku: "" },
  ]);

  // Nutrition
  const [calories, setCalories] = useState("160 kcal");
  const [protein, setProtein] = useState("5g");
  const [healthyFats, setHealthyFats] = useState("12g");
  const [carbs, setCarbs] = useState("9g");
  const [fiber, setFiber] = useState("1g");

  // Images (comma-separated URLs)
  const [imageUrls, setImageUrls] = useState("");

  const handleVariantChange = (index: number, field: keyof Variant, value: string) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    updated[index].sku =
      updated[index].sku ||
      `${name.toUpperCase().replace(/\s+/g, "-").slice(0, 8)}-${updated[index].weight.toUpperCase()}`;
    setVariants(updated);
  };

  const addVariant = () => {
    setVariants([...variants, { weight: "", price: "", mrp: "", stock: "", sku: "" }]);
  };

  const removeVariant = (i: number) => {
    if (variants.length === 1) return;
    setVariants(variants.filter((_, idx) => idx !== i));
  };

  const handleBenefitChange = (i: number, value: string) => {
    const b = [...benefits];
    b[i] = value;
    setBenefits(b);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const filledVariants = variants.filter((v) => v.weight && v.price && v.stock);
    if (!filledVariants.length) {
      toast.error("Add at least one complete variant (weight, price, stock).");
      return;
    }

    setSaving(true);

    const cat = CATEGORY_OPTIONS.find((c) => c.slug === categorySlug);

    const payload = {
      name,
      category: categorySlug,           // matches Product.category field
      categoryName: cat?.name || categorySlug,
      tagline: shortDescription,
      shortDescription,
      description,
      ingredients,
      originCountry,
      originRegion,
      storageInfo: storageInstructions, // matches Product.storageInfo field
      shelfLife,
      packagingType,
      isOrganic,
      isBestSeller,
      isFeatured,
      benefits: benefits.filter(Boolean),
      images: imageUrls
        .split(",")
        .map((u) => u.trim())
        .filter(Boolean),
      variants: filledVariants.map((v) => ({
        weight: v.weight,
        price: Number(v.price),
        mrp: Number(v.mrp) || Number(v.price),
        stock: Number(v.stock),
        sku: v.sku || `${name.toUpperCase().replace(/\s+/g, "-").slice(0, 8)}-${v.weight.toUpperCase()}`,
      })),
      nutrition: {                       // matches Product.nutrition field
        servingSize: "30g",
        calories,
        protein,
        healthyFats,
        carbs,
        fiber,
      },
      tags: [categorySlug],
      rating: 4.5,
      reviewCount: 0,
    };

    try {
      const res = await fetch("/api/v1/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(`"${name}" is now live on the storefront!`, {
          description: "Customers can discover it in the catalog right now.",
        });
        router.push("/admin/products");
      } else {
        toast.error(data.message || "Failed to create product.");
      }
    } catch {
      toast.error("Network error — please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-brand-border pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2 rounded-xl border border-brand-border bg-white hover:bg-slate-50 text-brand-dark transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-brand-green">
              HARVEST CATALOG
            </span>
            <h1 className="font-serif font-black text-2xl text-brand-dark">
              Add New Product
            </h1>
            <p className="text-xs text-brand-muted">
              Published instantly to the customer storefront.
            </p>
          </div>
        </div>

        <button
          form="product-form"
          type="submit"
          disabled={saving}
          className="bg-brand-green hover:bg-brand-green-dark text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-60"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{saving ? "Publishing..." : "Publish to Storefront"}</span>
        </button>
      </div>

      <form id="product-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Core Identity */}
        <div className="bg-white rounded-3xl border border-brand-border p-6 space-y-4 shadow-xs">
          <h3 className="font-serif font-bold text-base text-brand-dark border-b border-brand-border pb-3">
            1. Product Identity
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="sm:col-span-2">
              <label className="block font-bold mb-1 text-brand-dark">Product Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Premium Kashmiri Mamra Almonds"
                required
                className="w-full p-3 bg-slate-50 border border-brand-border rounded-xl focus:outline-none focus:border-brand-green text-brand-dark font-serif font-bold text-sm"
              />
            </div>

            <div>
              <label className="block font-bold mb-1 text-brand-dark">Category *</label>
              <select
                value={categorySlug}
                onChange={(e) => setCategorySlug(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-brand-border rounded-xl focus:outline-none focus:border-brand-green font-semibold cursor-pointer"
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold mb-1 text-brand-dark">Origin Country</label>
              <input
                type="text"
                value={originCountry}
                onChange={(e) => setOriginCountry(e.target.value)}
                placeholder="e.g. India, Iran, USA"
                className="w-full p-3 bg-slate-50 border border-brand-border rounded-xl focus:outline-none focus:border-brand-green"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold mb-1 text-brand-dark">Origin Region / Farm</label>
              <input
                type="text"
                value={originRegion}
                onChange={(e) => setOriginRegion(e.target.value)}
                placeholder="e.g. Pahalgam, Kashmiri Valleys"
                className="w-full p-3 bg-slate-50 border border-brand-border rounded-xl focus:outline-none focus:border-brand-green"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold mb-1 text-brand-dark">Short Description (one-line tagline)</label>
              <input
                type="text"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="e.g. Cold-harvested organic Mamra almonds from the valleys of Kashmir"
                className="w-full p-3 bg-slate-50 border border-brand-border rounded-xl focus:outline-none focus:border-brand-green"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold mb-1 text-brand-dark">Full Product Description *</label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the harvest process, taste profile, texture, and culinary uses..."
                required
                className="w-full p-3 bg-slate-50 border border-brand-border rounded-xl focus:outline-none focus:border-brand-green leading-relaxed"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold mb-1 text-brand-dark">Ingredients / Composition</label>
              <input
                type="text"
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                placeholder="e.g. 100% Organic Kashmiri Mamra Almonds. No added salt, oil or preservatives."
                className="w-full p-3 bg-slate-50 border border-brand-border rounded-xl focus:outline-none focus:border-brand-green"
              />
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-4 pt-2 text-xs">
            {[
              { label: "Organic Certified", value: isOrganic, setter: setIsOrganic },
              { label: "Bestseller Badge", value: isBestSeller, setter: setIsBestSeller },
              { label: "Featured on Homepage", value: isFeatured, setter: setIsFeatured },
            ].map((b) => (
              <label key={b.label} className="flex items-center gap-2 cursor-pointer font-semibold text-brand-dark">
                <input
                  type="checkbox"
                  checked={b.value}
                  onChange={(e) => b.setter(e.target.checked)}
                  className="w-4 h-4 accent-brand-green rounded"
                />
                {b.label}
              </label>
            ))}
          </div>
        </div>

        {/* Section 2: Product Images */}
        <div className="bg-white rounded-3xl border border-brand-border p-6 space-y-3 shadow-xs">
          <h3 className="font-serif font-bold text-base text-brand-dark border-b border-brand-border pb-3">
            2. Product Images
          </h3>
          <p className="text-xs text-brand-muted">
            Paste comma-separated direct image URLs (Unsplash, Pexels, or your CDN). Leave blank to use a default category image.
          </p>
          <textarea
            rows={2}
            value={imageUrls}
            onChange={(e) => setImageUrls(e.target.value)}
            placeholder="https://images.unsplash.com/..., https://images.pexels.com/..."
            className="w-full p-3 bg-slate-50 border border-brand-border rounded-xl text-xs focus:outline-none focus:border-brand-green font-mono"
          />
        </div>

        {/* Section 3: Weight Variants & Pricing */}
        <div className="bg-white rounded-3xl border border-brand-border p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-brand-border pb-3">
            <h3 className="font-serif font-bold text-base text-brand-dark">
              3. Pack Weights, Pricing & Stock *
            </h3>
            <button
              type="button"
              onClick={addVariant}
              className="text-xs text-brand-green font-bold hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Pack Size
            </button>
          </div>

          <div className="space-y-3">
            {variants.map((v, i) => (
              <div key={i} className="grid grid-cols-2 sm:grid-cols-5 gap-2 items-end text-xs">
                <div>
                  <label className="block font-bold mb-1 text-brand-dark">Weight</label>
                  <input
                    type="text"
                    value={v.weight}
                    onChange={(e) => handleVariantChange(i, "weight", e.target.value)}
                    placeholder="e.g. 500g"
                    className="w-full p-2 bg-slate-50 border border-brand-border rounded-xl focus:outline-none focus:border-brand-green font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1 text-brand-dark">Sale Price (₹)</label>
                  <input
                    type="number"
                    value={v.price}
                    onChange={(e) => handleVariantChange(i, "price", e.target.value)}
                    placeholder="499"
                    className="w-full p-2 bg-slate-50 border border-brand-border rounded-xl focus:outline-none focus:border-brand-green font-bold text-brand-green"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1 text-brand-dark">MRP (₹)</label>
                  <input
                    type="number"
                    value={v.mrp}
                    onChange={(e) => handleVariantChange(i, "mrp", e.target.value)}
                    placeholder="599"
                    className="w-full p-2 bg-slate-50 border border-brand-border rounded-xl focus:outline-none focus:border-brand-green"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1 text-brand-dark">Stock (Units)</label>
                  <input
                    type="number"
                    value={v.stock}
                    onChange={(e) => handleVariantChange(i, "stock", e.target.value)}
                    placeholder="100"
                    className="w-full p-2 bg-slate-50 border border-brand-border rounded-xl focus:outline-none focus:border-brand-green"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <label className="block font-bold mb-1 text-brand-dark">SKU</label>
                    <input
                      type="text"
                      value={v.sku}
                      onChange={(e) => handleVariantChange(i, "sku", e.target.value)}
                      placeholder="AUTO-SKU"
                      className="w-full p-2 bg-slate-50 border border-brand-border rounded-xl focus:outline-none focus:border-brand-green font-mono text-[11px]"
                    />
                  </div>
                  {variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVariant(i)}
                      className="p-2 text-red-400 hover:text-red-600 mb-0.5"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Packaging & Shelf Life */}
        <div className="bg-white rounded-3xl border border-brand-border p-6 space-y-4 shadow-xs">
          <h3 className="font-serif font-bold text-base text-brand-dark border-b border-brand-border pb-3">
            4. Packaging & Quality Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold mb-1 text-brand-dark">Packaging Type</label>
              <input
                type="text"
                value={packagingType}
                onChange={(e) => setPackagingType(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-brand-border rounded-xl focus:outline-none focus:border-brand-green"
              />
            </div>
            <div>
              <label className="block font-bold mb-1 text-brand-dark">Shelf Life</label>
              <input
                type="text"
                value={shelfLife}
                onChange={(e) => setShelfLife(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-brand-border rounded-xl focus:outline-none focus:border-brand-green"
              />
            </div>
            <div>
              <label className="block font-bold mb-1 text-brand-dark">Storage Instructions</label>
              <input
                type="text"
                value={storageInstructions}
                onChange={(e) => setStorageInstructions(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-brand-border rounded-xl focus:outline-none focus:border-brand-green"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Health Benefits */}
        <div className="bg-white rounded-3xl border border-brand-border p-6 space-y-3 shadow-xs">
          <h3 className="font-serif font-bold text-base text-brand-dark border-b border-brand-border pb-3">
            5. Health Benefits
          </h3>
          <div className="space-y-2">
            {benefits.map((b, i) => (
              <div key={i} className="flex gap-2 items-center text-xs">
                <span className="text-brand-green font-bold w-5 text-right flex-shrink-0">{i + 1}.</span>
                <input
                  type="text"
                  value={b}
                  onChange={(e) => handleBenefitChange(i, e.target.value)}
                  placeholder={`e.g. Rich in Omega-3 for cardiovascular support`}
                  className="flex-1 p-2.5 bg-slate-50 border border-brand-border rounded-xl focus:outline-none focus:border-brand-green"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => setBenefits([...benefits, ""])}
              className="text-xs text-brand-green font-bold hover:underline flex items-center gap-1 mt-1"
            >
              <Plus className="w-3 h-3" /> Add Benefit
            </button>
          </div>
        </div>

        {/* Section 6: Nutrition */}
        <div className="bg-white rounded-3xl border border-brand-border p-6 space-y-4 shadow-xs">
          <h3 className="font-serif font-bold text-base text-brand-dark border-b border-brand-border pb-3">
            6. Nutrition Facts (per 30g serving)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-xs">
            {[
              { label: "Calories", value: calories, setter: setCalories, placeholder: "160 kcal" },
              { label: "Protein", value: protein, setter: setProtein, placeholder: "5g" },
              { label: "Healthy Fats", value: healthyFats, setter: setHealthyFats, placeholder: "12g" },
              { label: "Carbs", value: carbs, setter: setCarbs, placeholder: "9g" },
              { label: "Fiber", value: fiber, setter: setFiber, placeholder: "1g" },
            ].map((n) => (
              <div key={n.label}>
                <label className="block font-bold mb-1 text-brand-dark">{n.label}</label>
                <input
                  type="text"
                  value={n.value}
                  onChange={(e) => n.setter(e.target.value)}
                  placeholder={n.placeholder}
                  className="w-full p-2.5 bg-slate-50 border border-brand-border rounded-xl focus:outline-none focus:border-brand-green font-semibold"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex justify-end gap-3 pt-2 pb-8">
          <Link
            href="/admin/products"
            className="px-6 py-3 border border-brand-border text-xs font-bold text-brand-muted rounded-xl hover:bg-slate-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="bg-brand-green hover:bg-brand-green-dark text-white text-xs font-bold px-8 py-3 rounded-xl shadow-sm transition-colors flex items-center gap-2 disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Publishing to Storefront..." : "Publish Product Live"}
          </button>
        </div>
      </form>
    </div>
  );
}
