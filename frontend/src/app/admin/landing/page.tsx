"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  ImagePlus,
  Loader2,
  Pencil,
  RotateCcw,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { landingService, apiErrorMessage } from "@/services/landing";
import { productService } from "@/services/products";
import { categoryService } from "@/services/categories";
import { Category, LandingImage, LandingSection, Product } from "@/types";
import { categoryPhoto, featuredPhoto, productSlide, sized, topProducts } from "@/lib/landing";

/* -------------------------------------------------------------------------- */
/* Editor modal                                                                */
/* -------------------------------------------------------------------------- */

type Draft = {
  id?: string;
  section: LandingSection;
  slot: string | null;
  imageUrl: string;
  title: string;
  caption: string;
  linkUrl: string;
  alt: string;
};

const SECTION_COPY: Record<LandingSection, { heading: string; hint: string }> = {
  hero: { heading: "Hero carousel slide", hint: "Shown in the curved reel at the top of the home page. Portrait photos (about 3:4) look best." },
  featured: { heading: "Harvest of the Day banner", hint: "The wide banner under the hero. Landscape photos (about 21:9) look best." },
  category: { heading: "Category photo", hint: "Shown on the category tile. Landscape photos (about 4:3) look best." },
};

function ImageEditor({
  draft,
  onClose,
  onSaved,
}: {
  draft: Draft;
  onClose: () => void;
  onSaved: (image: LandingImage) => void;
}) {
  const [form, setForm] = useState<Draft>(draft);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewFailed, setPreviewFailed] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const copy = SECTION_COPY[form.section];
  const set = (patch: Partial<Draft>) => setForm((current) => ({ ...current, ...patch }));

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await landingService.upload(file);
      set({ imageUrl: url });
      setPreviewFailed(false);
      toast.success("Photo uploaded.");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.imageUrl) {
      toast.error("Upload a photo or paste an image URL first.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        imageUrl: form.imageUrl.trim(),
        title: form.title.trim(),
        caption: form.caption.trim(),
        linkUrl: form.linkUrl.trim(),
        alt: form.alt.trim() || form.title.trim(),
      };
      const saved = form.id
        ? await landingService.update(form.id, payload)
        : await landingService.create({ ...payload, section: form.section, slot: form.slot });
      onSaved(saved);
    } catch (error) {
      toast.error(apiErrorMessage(error, "Could not save that photo."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="landing-editor-title"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <form
        onSubmit={save}
        className="max-h-[92vh] w-full max-w-2xl space-y-5 overflow-y-auto rounded-3xl border border-brand-border bg-white p-6 shadow-2xl sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 id="landing-editor-title" className="text-xl font-semibold tracking-[-0.025em] text-brand-dark">
              {form.id ? "Edit" : "Add"} {copy.heading.toLowerCase()}
            </h3>
            <p className="mt-1 text-xs text-brand-muted">{copy.hint}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-brand-muted hover:bg-brand-cream hover:text-brand-dark" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Preview + upload */}
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-brand-border bg-brand-cream">
            {form.imageUrl && !previewFailed ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={sized(form.imageUrl, 900)} alt="" className="h-full w-full object-cover" onError={() => setPreviewFailed(true)} />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center text-xs text-brand-muted">
                <ImagePlus className="h-7 w-7 text-brand-green" />
                {previewFailed ? "That URL didn't load as an image." : "No photo yet"}
              </div>
            )}
            {uploading && (
              <div className="absolute inset-0 grid place-items-center bg-white/70">
                <Loader2 className="h-6 w-6 animate-spin text-brand-green" />
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center gap-3 text-xs">
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="hidden"
              onChange={(event) => handleFile(event.target.files?.[0])}
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
              className="flex items-center justify-center gap-2 rounded-xl bg-brand-dark px-4 py-3 font-bold text-white transition-colors hover:bg-black disabled:opacity-60"
            >
              <Upload className="h-4 w-4" />
              {uploading ? "Uploading…" : form.imageUrl ? "Upload a different photo" : "Upload photo"}
            </button>
            <p className="text-center text-[11px] text-brand-muted">JPG, PNG, WebP or AVIF · up to 5 MB</p>
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.08em] text-brand-muted">
              <span className="h-px flex-1 bg-brand-border" /> or paste a link <span className="h-px flex-1 bg-brand-border" />
            </div>
            <input
              type="url"
              value={form.imageUrl}
              onChange={(event) => {
                set({ imageUrl: event.target.value });
                setPreviewFailed(false);
              }}
              placeholder="https://…"
              className="w-full rounded-xl border border-brand-border bg-brand-cream p-2.5 focus:border-brand-green focus:outline-none"
            />
          </div>
        </div>

        {/* Text fields */}
        <div className="grid gap-3 text-xs sm:grid-cols-2">
          {form.section === "hero" && (
            <>
              <label className="block">
                <span className="mb-1 block font-bold">Title on the card</span>
                <input
                  value={form.title}
                  onChange={(event) => set({ title: event.target.value })}
                  maxLength={200}
                  placeholder="e.g. Jumbo Cashews"
                  className="w-full rounded-xl border border-brand-border bg-brand-cream p-2.5 focus:border-brand-green focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="mb-1 block font-bold">Small caption</span>
                <input
                  value={form.caption}
                  onChange={(event) => set({ caption: event.target.value })}
                  maxLength={200}
                  placeholder="e.g. from ₹649"
                  className="w-full rounded-xl border border-brand-border bg-brand-cream p-2.5 focus:border-brand-green focus:outline-none"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1 block font-bold">Opens when clicked</span>
                <input
                  value={form.linkUrl}
                  onChange={(event) => set({ linkUrl: event.target.value })}
                  placeholder="/products/royal-jumbo-cashews-w180 or /best-sellers"
                  className="w-full rounded-xl border border-brand-border bg-brand-cream p-2.5 focus:border-brand-green focus:outline-none"
                />
              </label>
            </>
          )}
          <label className="block sm:col-span-2">
            <span className="mb-1 block font-bold">Description for screen readers</span>
            <input
              value={form.alt}
              onChange={(event) => set({ alt: event.target.value })}
              maxLength={200}
              placeholder="e.g. A bowl of roasted cashews on a linen cloth"
              className="w-full rounded-xl border border-brand-border bg-brand-cream p-2.5 focus:border-brand-green focus:outline-none"
            />
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-1 text-xs">
          <button type="button" onClick={onClose} className="rounded-xl px-4 py-2.5 font-bold text-brand-muted hover:bg-brand-cream hover:text-brand-dark">
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || uploading}
            className="flex items-center gap-2 rounded-xl bg-brand-green px-5 py-2.5 font-bold text-white transition-colors hover:bg-brand-green-dark disabled:opacity-60"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save photo
          </button>
        </div>
      </form>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Page                                                                        */
/* -------------------------------------------------------------------------- */

function ConfirmDelete({ onConfirm, label }: { onConfirm: () => void; label: string }) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return;
    const timer = window.setTimeout(() => setArmed(false), 3000);
    return () => window.clearTimeout(timer);
  }, [armed]);
  return (
    <button
      type="button"
      onClick={() => (armed ? onConfirm() : setArmed(true))}
      className={`flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-bold transition-colors ${
        armed ? "bg-red-600 text-white" : "text-red-600 hover:bg-red-50"
      }`}
      aria-label={armed ? `Confirm: ${label}` : label}
    >
      <Trash2 className="h-3.5 w-3.5" />
      {armed ? "Confirm" : "Remove"}
    </button>
  );
}

export default function AdminLandingPage() {
  const [images, setImages] = useState<LandingImage[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    Promise.all([landingService.getAll(), productService.getAllProducts(), categoryService.getAllCategories()]).then(
      ([landing, catalogue, cats]) => {
        setImages(landing);
        setProducts(catalogue);
        setCategories(cats);
        setLoading(false);
      }
    );
  }, []);

  const ranked = useMemo(() => topProducts(products), [products]);
  const hero = useMemo(() => images.filter((i) => i.section === "hero").sort((a, b) => a.sortOrder - b.sortOrder), [images]);
  const featuredRow = images.find((i) => i.section === "featured");
  const featuredProduct = ranked[0];

  const upsertLocal = (saved: LandingImage) =>
    setImages((current) => [...current.filter((i) => i.id !== saved.id && !(saved.section !== "hero" && i.section === saved.section && i.slot === saved.slot)), saved]);

  const handleSaved = (saved: LandingImage) => {
    upsertLocal(saved);
    setEditing(null);
    toast.success("Saved. The home page now shows this photo.");
  };

  const remove = async (image: LandingImage, message: string) => {
    try {
      await landingService.remove(image.id);
      setImages((current) => current.filter((i) => i.id !== image.id));
      toast.success(message);
    } catch (error) {
      toast.error(apiErrorMessage(error, "Could not remove that photo."));
    }
  };

  const move = async (index: number, direction: -1 | 1) => {
    const a = hero[index];
    const b = hero[index + direction];
    if (!a || !b || busy) return;
    setBusy(true);
    try {
      // Normalise orders first so equal values can't make a swap a no-op.
      const [updatedA, updatedB] = await Promise.all([
        landingService.update(a.id, { sortOrder: index + direction }),
        landingService.update(b.id, { sortOrder: index }),
      ]);
      upsertLocal(updatedA);
      upsertLocal(updatedB);
    } catch (error) {
      toast.error(apiErrorMessage(error, "Could not reorder the slides."));
    } finally {
      setBusy(false);
    }
  };

  /** Turns the automatic product reel into editable slides. */
  const copyProductsIntoSlides = async () => {
    setBusy(true);
    try {
      const created: LandingImage[] = [];
      for (const product of ranked) {
        const slide = productSlide(product);
        created.push(
          await landingService.create({
            section: "hero",
            slot: null,
            imageUrl: slide.image,
            title: slide.title,
            caption: slide.caption || "",
            linkUrl: slide.href,
            alt: product.name,
          })
        );
      }
      setImages((current) => [...current, ...created]);
      toast.success(`Added ${created.length} slides you can now edit.`);
    } catch (error) {
      toast.error(apiErrorMessage(error, "Could not create the slides."));
    } finally {
      setBusy(false);
    }
  };

  const newHeroDraft = (): Draft => ({ section: "hero", slot: null, imageUrl: "", title: "", caption: "", linkUrl: "/products", alt: "" });
  const draftFrom = (image: LandingImage): Draft => ({ ...image });

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-20 text-sm text-brand-muted">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading home page photos…
      </div>
    );
  }

  return (
    <div className="max-w-7xl space-y-10">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-muted">STOREFRONT</span>
          <h1 className="text-2xl font-semibold tracking-[-0.035em] text-brand-dark sm:text-3xl">Home Page Photos</h1>
          <p className="mt-0.5 text-xs text-brand-muted">Add, replace, reorder or remove the photos customers see on the home page. Changes go live straight away.</p>
        </div>
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-1.5 self-start rounded-xl border border-brand-border bg-white px-4 py-2.5 text-xs font-bold text-brand-dark hover:border-brand-dark sm:self-auto"
        >
          <ExternalLink className="h-4 w-4" /> View home page
        </Link>
      </div>

      {/* ---------------------------------------------------------------- Hero */}
      <section className="space-y-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-lg font-semibold tracking-[-0.02em] text-brand-dark">Hero carousel · {hero.length || "automatic"}</h2>
            <p className="text-xs text-brand-muted">
              {hero.length
                ? "Slides appear in this order. Use the arrows to reorder."
                : "No custom slides yet, so the carousel shows your top products automatically."}
            </p>
          </div>
          <div className="flex gap-2">
            {!hero.length && ranked.length > 0 && (
              <button
                type="button"
                disabled={busy}
                onClick={copyProductsIntoSlides}
                className="rounded-xl border border-brand-border bg-white px-4 py-2.5 text-xs font-bold text-brand-dark hover:border-brand-dark disabled:opacity-60"
              >
                Edit the current slides
              </button>
            )}
            <button
              type="button"
              onClick={() => setEditing(newHeroDraft())}
              className="flex items-center gap-1.5 rounded-xl bg-brand-dark px-4 py-2.5 text-xs font-bold text-white hover:bg-black"
            >
              <ImagePlus className="h-4 w-4" /> Add slide
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {(hero.length ? hero : []).map((image, index) => (
            <article key={image.id} className="group overflow-hidden rounded-2xl border border-brand-border bg-white">
              <div className="relative aspect-[3/4] bg-brand-cream">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={sized(image.imageUrl, 500)} alt={image.alt} className="h-full w-full object-cover" loading="lazy" />
                <span className="absolute left-2 top-2 rounded-md bg-black/60 px-2 py-0.5 text-[11px] font-bold text-white">{index + 1}</span>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-10 text-white">
                  <p className="truncate text-sm font-semibold">{image.title || "Untitled"}</p>
                  {image.caption && <p className="truncate text-[11px] text-white/80">{image.caption}</p>}
                </div>
              </div>
              <div className="flex items-center justify-between gap-1 p-2">
                <div className="flex">
                  <button type="button" disabled={index === 0 || busy} onClick={() => move(index, -1)} className="rounded-lg p-1.5 text-brand-muted hover:bg-brand-cream hover:text-brand-dark disabled:opacity-30" aria-label="Move earlier">
                    <ArrowLeft className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" disabled={index === hero.length - 1 || busy} onClick={() => move(index, 1)} className="rounded-lg p-1.5 text-brand-muted hover:bg-brand-cream hover:text-brand-dark disabled:opacity-30" aria-label="Move later">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="flex">
                  <button type="button" onClick={() => setEditing(draftFrom(image))} className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-bold text-brand-dark hover:bg-brand-cream">
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </button>
                  <ConfirmDelete label={`Remove slide ${image.title}`} onConfirm={() => remove(image, "Slide removed.")} />
                </div>
              </div>
            </article>
          ))}

          {!hero.length &&
            ranked.map((product) => (
              <div key={product.id} className="overflow-hidden rounded-2xl border border-dashed border-brand-border bg-white opacity-80">
                <div className="aspect-[3/4] bg-brand-cream">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={sized(productSlide(product).image, 500)} alt="" className="h-full w-full object-cover" loading="lazy" />
                </div>
                <p className="truncate p-2 text-[11px] text-brand-muted">Auto · {productSlide(product).title}</p>
              </div>
            ))}

          <button
            type="button"
            onClick={() => setEditing(newHeroDraft())}
            className="flex aspect-[3/4] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-brand-border text-xs font-bold text-brand-muted transition-colors hover:border-brand-green hover:text-brand-green"
          >
            <ImagePlus className="h-6 w-6" /> Add slide
          </button>
        </div>
      </section>

      {/* ------------------------------------------------------------ Featured */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold tracking-[-0.02em] text-brand-dark">Harvest of the Day banner</h2>
          <p className="text-xs text-brand-muted">
            {featuredRow ? "Using your custom photo." : `Using the product photo of ${featuredProduct?.name ?? "the top product"}.`}
          </p>
        </div>
        <div className="overflow-hidden rounded-2xl border border-brand-border bg-white">
          <div className="aspect-[21/9] bg-brand-cream">
            {featuredProduct && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={sized(featuredPhoto(images, featuredProduct), 1600)} alt="" className="h-full w-full object-cover" />
            )}
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2 p-3">
            {featuredRow && (
              <button
                type="button"
                onClick={() => remove(featuredRow, "Banner reset to the product photo.")}
                className="flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-bold text-brand-muted hover:bg-brand-cream hover:text-brand-dark"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Use product photo
              </button>
            )}
            <button
              type="button"
              onClick={() =>
                setEditing(
                  featuredRow
                    ? draftFrom(featuredRow)
                    : { section: "featured", slot: null, imageUrl: "", title: "", caption: "", linkUrl: "", alt: featuredProduct?.name ?? "" }
                )
              }
              className="flex items-center gap-1.5 rounded-xl bg-brand-dark px-4 py-2 text-xs font-bold text-white hover:bg-black"
            >
              <Pencil className="h-3.5 w-3.5" /> {featuredRow ? "Change photo" : "Use a custom photo"}
            </button>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- Categories */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold tracking-[-0.02em] text-brand-dark">Category tiles</h2>
          <p className="text-xs text-brand-muted">One photo per category. Gift Boxes and Curated Combos also appear on the dark gifting cards.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const row = images.find((i) => i.section === "category" && i.slot === category.slug);
            return (
              <article key={category.slug} className="overflow-hidden rounded-2xl border border-brand-border bg-white">
                <div className="relative aspect-[4/3] bg-brand-cream">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={sized(categoryPhoto(images, category.slug), 700)} alt="" className="h-full w-full object-cover" loading="lazy" />
                  <span className={`absolute right-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-bold ${row ? "bg-brand-green text-white" : "bg-white/85 text-brand-muted"}`}>
                    {row ? "Custom" : "Default"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 p-3">
                  <p className="truncate text-sm font-semibold text-brand-dark">{category.name}</p>
                  <div className="flex shrink-0">
                    {row && (
                      <button
                        type="button"
                        onClick={() => remove(row, `${category.name} reset to the default photo.`)}
                        className="rounded-lg p-1.5 text-brand-muted hover:bg-brand-cream hover:text-brand-dark"
                        aria-label={`Reset ${category.name} photo`}
                        title="Reset to default"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        setEditing(
                          row
                            ? draftFrom(row)
                            : { section: "category", slot: category.slug, imageUrl: "", title: "", caption: "", linkUrl: "", alt: category.name }
                        )
                      }
                      className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-bold text-brand-dark hover:bg-brand-cream"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Change
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {editing && <ImageEditor draft={editing} onClose={() => setEditing(null)} onSaved={handleSaved} />}
    </div>
  );
}
