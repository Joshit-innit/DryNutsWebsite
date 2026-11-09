import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import { Fraunces, Inter_Tight } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/context/StoreContext";
import { Toaster } from "sonner";
import PortalSwitcher from "@/components/layout/PortalSwitcher";
import SmoothScroll from "@/components/animations/SmoothScroll";
import CartDrawer from "@/components/cart/CartDrawer";
import ProductQuickView from "@/components/products/ProductQuickView";
import ImageLoadState from "@/components/ui/ImageLoadState";
import BackendWarmup from "@/components/BackendWarmup";

const sans = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const accent = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["SOFT", "opsz"],
  variable: "--font-accent",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "NutriNation — Nourish Naturally | Premium Dry Fruits",
  description:
    "NutriNation offers cashews, pistachios, almonds, walnuts, raisins, dates, dried apricots, dry figs, prunes, combos, and gift boxes.",
  keywords: [
    "Dry Fruits",
    "Premium Indian Dry Fruits",
  ],
  openGraph: {
    title: "NutriNation — Premium Indian Dry Fruits",
    description: "A focused collection of dry fruits, combos, and gift boxes.",
    url: "/",
    siteName: "NutriNation",
    images: [
      {
        url: "https://images.unsplash.com/photo-1543158181-1274e5362710?auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "NutriNation Luxury Dry Fruits",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sans.variable} ${accent.variable}`}>
      <body className="min-h-screen bg-brand-cream text-brand-dark antialiased font-sans">
        <ImageLoadState />
        <BackendWarmup />
        <StoreProvider>
          <SmoothScroll>
            <PortalSwitcher />
            {children}
            <CartDrawer />
            <ProductQuickView />
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: "#FFFFFF",
                  color: "#1D1C1A",
                  border: "1px solid #E4E0D8",
                  boxShadow: "0 12px 32px -12px rgba(31,26,21,0.18)",
                  borderRadius: "12px",
                  fontFamily: "var(--font-sans)",
                },
              }}
            />
          </SmoothScroll>
        </StoreProvider>
      </body>
    </html>
  );
}
