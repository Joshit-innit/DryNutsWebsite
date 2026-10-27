"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, ExternalLink, Loader2, Plus, Save, Trash2, X } from "lucide-react";
import { backendApi, unwrapData } from "@/lib/api/axios";
import { apiErrorMessage } from "@/lib/auth-session";
import { getCategoryImages } from "@/lib/product-images";
import { cn, slugify } from "@/lib/utils";
import { CategorySlug, Product } from "@/types";

export const CATEGORY_OPTIONS: { slug: CategorySlug; name: string }[] = [
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
  { slug: "gift-boxes", name: "Gift & Festival Boxes" },
];

interface VariantDraft {
  id?: string;
  weight: string;
  price: string;
  mrp: string;
  stock: string;
  sku: string;
}

const NUTRITION_FIELDS = [
  { key: "servingSize", label: "Serving size", placeholder: "30g" },
  { key: "calories", label: "Calories", placeholder: "160 kcal" },
  { key: "protein", label: "Protein", placeholder: "5g" },
  { key: "healthyFats", label: "Healthy fats", placeholder: "12g" },
  { key: "carbs", label: "Carbs", placeholder: "9g" },
  { key: "fiber", label: "Fiber", placeholder: "2g" },
] as const;

type NutritionKey = (typeof NUTRITION_FIELDS)[number]["key"];

const fieldClass =
  "w-full p-3 text-xs bg-brand-cream border border-brand-border rounded-xl focus:outline-none focus:border-brand-green focus:bg-white";
const labelClass = "block text-xs font-bold text-brand-dark mb-1";

function skuFor(name: string, weight: string) {
  return `NN-${name.toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 10)}-${weight.toUpperCase().replace(/\s+/g, "")}`;
}

export default function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const isEdit = Boolean(product);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Identity
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [category, setCategory] = useState<CategorySlug>(product?.category ?? "cashews");
  const [status, setStatus] = useState<Product["status"]>(product?.status ?? "published");
  const [grade, setGrade] = useState(product?.grade ?? "");
  const [origin, setOrigin] = useState(product?.origin ?? "India");

  // Description
  const [tagline, setTagline] = useState(product?.tagline ?? "");
  const [shortDescription, setShortDescription] = useState(product?.shortDescription ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [ingredients, setIngredients] = useState(product?.ingredients ?? "");
  const [storageInfo, setStorageInfo] = useState(
    product?.storageInfo ?? "Store in a cool, dry place in an airtight container after opening."
  );

  // Media, variants, extras
  const [imageUrls, setImageUrls] = useState((product?.images ?? []).join("\n"));
  const [variants, setVariants] = useState<VariantDraft[]>(
    product?.variants.map((v) => ({
      id: v.id,
      weight: v.weight,
      price: String(v.price),
      mrp: String(v.mrp),
      stock: String(v.stock),
      sku: v.sku,
    })) ?? [
      { weight: "250g", price: "", mrp: "", stock: "", sku: "" },
      { weight: "500g", price: "", mrp: "", stock: "", sku: "" },
    ]
  );
  const [benefits, setBenefits] = useState<string[]>(product?.benefits?.length ? product.benefits : ["", "", ""]);
  const [tags, setTags] = useState((product?.tags ?? []).join(", "));
  const [nutrition, setNutrition] = useState<Record<NutritionKey, string>>({
    servingSize: product?.nutrition?.servingSize ?? "30g",
    calories: product?.nutrition?.calories ?? "",
    protein: product?.nutrition?.protein ?? "",
    healthyFats: product?.nutrition?.healthyFats ?? "",
    carbs: product?.nutrition?.carbs ?? "",
    fiber: product?.nutrition?.fiber ?? "",
  });
  const [isFeatured, setIsFeatured] = useState(product?.isFeatured ?? false);
  const [isBestSeller, setIsBestSeller] = useState(product?.isBestSeller ?? false);
  const [isNew, setIsNew] = useState(product?.isNew ?? true);

  const images = imageUrls
    .split(/[\n,]/)
    .map((u) => u.trim())
    .filter(Boolean);
  const previewImages = images.length ? images : getCategoryImages(category);

  const updateVariant = (index: number, field: keyof VariantDraft, value: string) => {
    setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, [field]: value } : v)));
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (name.trim().length < 3) next.name = "Product name must be at least 3 characters.";
    if (description.trim().length < 20) next.description = "Write a description of at least 20 characters.";
    if (shortDescription.trim().length < 10) next.shortDescription = "Short description must be at least 10 characters.";

    const complete = variants.filter((v) => v.weight.trim() && v.price && v.stock !== "");
    if (!complete.length) next.variants = "Add at least one pack size with weight, price and stock.";
    if (complete.some((v) => Number(v.price) <= 0)) next.variants = "Prices must be greater than zero.";
    if (complete.some((v) => v.mrp && Number(v.mrp) < Number(v.price))) next.variants = "MRP cannot be lower than the selling price.";
    if (complete.some((v) => Number(v.stock) < 0)) next.variants = "Stock cannot be negative.";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) {
      toast.error("Please fix the highlighted fields.");
      return;
    }

    const categoryName = CATEGORY_OPTIONS.find((c) => c.slug === category)?.name ?? category;
    const payload = {
      name: name.trim(),
      ...(isEdit && slug.trim() ? { slug: slugify(slug) } : {}),
      category,
      categoryName,
      status,
      grade: grade.trim() || undefined,
      origin: origin.trim() || "India",
      tagline: tagline.trim() || shortDescription.trim(),
      shortDescription: shortDescription.trim(),
      description: description.trim(),
      ingredients: ingredients.trim() || `100% ${name.trim()}.`,
      storageInfo: storageInfo.trim(),
      images,
      variants: variants
        .filter((v) => v.weight.trim() && v.price && v.stock !== "")
        .map((v) => ({
          id: v.id || `${slugify(slug || name)}-${slugify(v.weight)}`,
          weight: v.weight.trim(),
          price: Number(v.price),
          mrp: Number(v.mrp) || Number(v.price),
          stock: Number(v.stock),
          sku: (v.sku.trim() || skuFor(name, v.weight)).toUpperCase(),
        })),
      benefits: benefits.map((b) => b.trim()).filter(Boolean),
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      nutrition,
      isFeatured,
      isBestSeller,
      isNew,
    };

    setSaving(true);
    try {
      if (isEdit && product) {
        const saved = unwrapData<Product>(await backendApi.patch(`/products/${product.id}`, payload));
        toast.success(`"${saved.name}" updated`, { description: "Changes are live on the storefront." });
      } else {
        const saved = unwrapData<Product>(
          await backendApi.post("/products", { ...payload, rating: 4.5, reviewCount: 0 })
        );
        toast.success(`"${saved.name}" created`, {
          description: saved.status === "published" ? "Customers can find it in the catalog now." : "Saved as a draft.",
        });
      }
      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      toast.error(isEdit ? "Could not save changes." : "Could not create product.", {
        description: apiErrorMessage(error, "Please try again."),
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!product) return;
    setDeleting(true);
    try {
      await backendApi.delete(`/products/${product.id}`);
      toast.success(`"${product.name}" deleted`);
      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      toast.error("Could not delete product.", { description: apiErrorMessage(error, "Please try again.") });
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-brand-border pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2 rounded-xl border border-brand-border bg-white text-brand-dark hover:bg-brand-beige transition-colors"
            aria-label="Back to products"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <span className="text-xs uppercase font-semibold tracking-[0.08em] text-brand-muted">
              {isEdit ? "Edit product" : "Harvest catalog"}
            </span>
            <h1 className="font-serif text-2xl text-brand-dark">{isEdit ? product!.name : "Add New Product"}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEdit && product!.status === "published" && (
            <Link
              href={`/products/${product!.slug}`}
              target="_blank"
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border border-brand-border bg-white rounded-xl hover:bg-brand-cream"
            >
              <ExternalLink className="w-3.5 h-3.5" /> View in store
            </Link>
          )}
          <button
            form="product-form"
            type="submit"
            disabled={saving}
            className="bg-brand-dark hover:bg-black text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving..." : isEdit ? "Save changes" : "Create product"}
          </button>
        </div>
      </div>

      <form id="product-form" onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* 1. Identity */}
        <Section title="1. Product identity">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelClass} htmlFor="pf-name">Product name *</label>
              <input
                id="pf-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Kashmiri Organic Mamra Almonds"
                className={cn(fieldClass, "font-serif text-sm", errors.name && "border-red-300")}
              />
              <FieldError message={errors.name} />
            </div>
            {isEdit && (
              <div className="sm:col-span-2">
                <label className={labelClass} htmlFor="pf-slug">URL slug</label>
                <div className="flex items-center rounded-xl border border-brand-border bg-brand-cream text-xs focus-within:border-brand-green">
                  <span className="pl-3 text-brand-muted">/products/</span>
                  <input
                    id="pf-slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="flex-1 bg-transparent p-3 pl-0.5 font-mono focus:outline-none"
                  />
                </div>
              </div>
            )}
            <div>
              <label className={labelClass} htmlFor="pf-category">Category *</label>
              <select id="pf-category" value={category} onChange={(e) => setCategory(e.target.value as CategorySlug)} className={cn(fieldClass, "font-semibold cursor-pointer")}>
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c.slug} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor="pf-status">Visibility</label>
              <select id="pf-status" value={status} onChange={(e) => setStatus(e.target.value as Product["status"])} className={cn(fieldClass, "font-semibold cursor-pointer")}>
                <option value="published">Published (visible in store)</option>
                <option value="draft">Draft (hidden)</option>
                <option value="archived">Archived (hidden)</option>
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor="pf-origin">Origin</label>
              <input id="pf-origin" value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="e.g. Pahalgam, Kashmir" className={fieldClass} />
            </div>
            <div>
              <label className={labelClass} htmlFor="pf-grade">Grade</label>
              <input id="pf-grade" value={grade} onChange={(e) => setGrade(e.target.value)} placeholder="e.g. W-180, Premium Reserve" className={fieldClass} />
            </div>
          </div>
          <div className="flex flex-wrap gap-5 pt-1 text-xs">
            {[
              { label: "Featured on homepage", value: isFeatured, set: setIsFeatured },
              { label: "Bestseller badge", value: isBestSeller, set: setIsBestSeller },
              { label: "New arrival badge", value: isNew, set: setIsNew },
            ].map((flag) => (
              <label key={flag.label} className="flex items-center gap-2 cursor-pointer font-semibold text-brand-dark">
                <input type="checkbox" checked={flag.value} onChange={(e) => flag.set(e.target.checked)} className="w-4 h-4 accent-brand-green" />
                {flag.label}
              </label>
            ))}
          </div>
        </Section>

        {/* 2. Description */}
        <Section title="2. Description">
          <div>
            <label className={labelClass} htmlFor="pf-tagline">Tagline</label>
            <input id="pf-tagline" value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="One memorable line shown under the title" className={fieldClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="pf-short">Short description *</label>
            <textarea
              id="pf-short"
              rows={2}
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="A 1–2 sentence summary shown on product cards"
              className={cn(fieldClass, errors.shortDescription && "border-red-300")}
            />
            <FieldError message={errors.shortDescription} />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className={labelClass} htmlFor="pf-description">Full description *</label>
              <span className="text-[10px] text-brand-muted">{description.length} characters</span>
            </div>
            <textarea
              id="pf-description"
              rows={8}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the harvest, taste, texture, grading and best ways to enjoy it..."
              className={cn(fieldClass, "leading-relaxed", errors.description && "border-red-300")}
            />
            <FieldError message={errors.description} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass} htmlFor="pf-ingredients">Ingredients</label>
              <textarea id="pf-ingredients" rows={2} value={ingredients} onChange={(e) => setIngredients(e.target.value)} placeholder="e.g. 100% raw almonds. No added salt or oil." className={fieldClass} />
            </div>
            <div>
              <label className={labelClass} htmlFor="pf-storage">Storage instructions</label>
              <textarea id="pf-storage" rows={2} value={storageInfo} onChange={(e) => setStorageInfo(e.target.value)} className={fieldClass} />
            </div>
          </div>
        </Section>

        {/* 3. Images */}
        <Section title="3. Images">
          <p className="text-xs text-brand-muted">One image URL per line. Leave empty to use the category&apos;s default photography.</p>
          <textarea
            rows={3}
            value={imageUrls}
            onChange={(e) => setImageUrls(e.target.value)}
            placeholder="https://images.unsplash.com/..."
            className={cn(fieldClass, "font-mono text-[11px]")}
          />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {previewImages.slice(0, 4).map((image, index) => (
              <div key={`${image}-${index}`} className="aspect-[4/3] rounded-2xl overflow-hidden border border-brand-border bg-brand-cream">
                <img
                  src={image}
                  alt={`Preview ${index + 1}`}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = getCategoryImages(category)[0];
                  }}
                />
              </div>
            ))}
          </div>
        </Section>

        {/* 4. Variants */}
        <Section
          title="4. Pack sizes, pricing & stock *"
          action={
            <button
              type="button"
              onClick={() => setVariants((prev) => [...prev, { weight: "", price: "", mrp: "", stock: "", sku: "" }])}
              className="text-xs text-brand-green font-bold hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add pack size
            </button>
          }
        >
          <div className="space-y-3">
            {variants.map((v, i) => (
              <div key={v.id ?? i} className="grid grid-cols-2 sm:grid-cols-[1fr_1fr_1fr_1fr_1.4fr_auto] gap-2 items-end text-xs">
                <VariantInput label="Weight" value={v.weight} onChange={(val) => updateVariant(i, "weight", val)} placeholder="500g" />
                <VariantInput label="Price (₹)" type="number" value={v.price} onChange={(val) => updateVariant(i, "price", val)} placeholder="499" />
                <VariantInput label="MRP (₹)" type="number" value={v.mrp} onChange={(val) => updateVariant(i, "mrp", val)} placeholder="599" />
                <VariantInput label="Stock" type="number" value={v.stock} onChange={(val) => updateVariant(i, "stock", val)} placeholder="100" />
                <VariantInput label="SKU" value={v.sku} onChange={(val) => updateVariant(i, "sku", val)} placeholder={name && v.weight ? skuFor(name, v.weight) : "Auto"} mono />
                <button
                  type="button"
                  onClick={() => setVariants((prev) => prev.filter((_, idx) => idx !== i))}
                  disabled={variants.length === 1}
                  className="p-2.5 mb-0.5 text-brand-muted hover:text-red-500 disabled:opacity-30 disabled:hover:text-brand-muted"
                  aria-label="Remove pack size"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <FieldError message={errors.variants} />
        </Section>

        {/* 5. Benefits & tags */}
        <Section title="5. Benefits & search tags">
          <div className="space-y-2">
            {benefits.map((b, i) => (
              <div key={i} className="flex gap-2 items-center text-xs">
                <span className="text-brand-green font-bold w-5 text-right flex-shrink-0">{i + 1}.</span>
                <input
                  value={b}
                  onChange={(e) => setBenefits((prev) => prev.map((x, idx) => (idx === i ? e.target.value : x)))}
                  placeholder="e.g. Rich in vitamin E for skin and heart health"
                  className={fieldClass}
                />
                <button
                  type="button"
                  onClick={() => setBenefits((prev) => prev.filter((_, idx) => idx !== i))}
                  className="p-2 text-brand-muted hover:text-red-500"
                  aria-label="Remove benefit"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button type="button" onClick={() => setBenefits((prev) => [...prev, ""])} className="text-xs text-brand-green font-bold hover:underline flex items-center gap-1">
              <Plus className="w-3 h-3" /> Add benefit
            </button>
          </div>
          <div>
            <label className={labelClass} htmlFor="pf-tags">Tags (comma separated)</label>
            <input id="pf-tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="almonds, organic, kashmir" className={fieldClass} />
          </div>
        </Section>

        {/* 6. Nutrition */}
        <Section title="6. Nutrition facts">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {NUTRITION_FIELDS.map((f) => (
              <div key={f.key}>
                <label className={labelClass} htmlFor={`pf-n-${f.key}`}>{f.label}</label>
                <input
                  id={`pf-n-${f.key}`}
                  value={nutrition[f.key]}
                  onChange={(e) => setNutrition((prev) => ({ ...prev, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  className={fieldClass}
                />
              </div>
            ))}
          </div>
        </Section>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 pb-8">
          {isEdit ? (
            confirmDelete ? (
              <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs">
                <span className="font-semibold text-red-700">Delete this product permanently?</span>
                <button type="button" onClick={handleDelete} disabled={deleting} className="rounded-lg bg-red-600 px-3 py-1.5 font-bold text-white hover:bg-red-700 disabled:opacity-60">
                  {deleting ? "Deleting..." : "Delete"}
                </button>
                <button type="button" onClick={() => setConfirmDelete(false)} className="px-2 py-1.5 font-bold text-brand-muted hover:text-brand-dark">
                  Cancel
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => setConfirmDelete(true)} className="flex items-center gap-1.5 px-4 py-3 text-xs font-bold text-red-500 rounded-xl hover:bg-red-50">
                <Trash2 className="w-4 h-4" /> Delete product
              </button>
            )
          ) : (
            <span />
          )}
          <div className="flex gap-3">
            <Link href="/admin/products" className="px-6 py-3 border border-brand-border bg-white text-xs font-bold text-brand-muted rounded-xl hover:bg-brand-cream">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="bg-brand-dark hover:bg-black text-white text-xs font-bold px-8 py-3 rounded-xl shadow-sm transition-colors flex items-center gap-2 disabled:opacity-60"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? "Saving..." : isEdit ? "Save changes" : "Create product"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function Section({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-3xl border border-brand-border p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-brand-border pb-3">
        <h2 className="font-serif text-base text-brand-dark">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function FieldError({ message }: { message?: string }) {
  return message ? <p role="alert" className="text-xs text-red-600 mt-1">{message}</p> : null;
}

function VariantInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  mono,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  mono?: boolean;
}) {
  return (
    <label className="block">
      <span className="block font-bold mb-1 text-brand-dark">{label}</span>
      <input
        type={type}
        min={type === "number" ? 0 : undefined}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "w-full p-2.5 bg-brand-cream border border-brand-border rounded-xl focus:outline-none focus:border-brand-green focus:bg-white",
          mono && "font-mono text-[11px]"
        )}
      />
    </label>
  );
}
