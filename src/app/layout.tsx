import type { Metadata } from "next";
import "./globals.css";
import { StoreProvider } from "@/context/StoreContext";
import { Toaster } from "sonner";
import PortalSwitcher from "@/components/layout/PortalSwitcher";
import SmoothScroll from "@/components/animations/SmoothScroll";
import CartDrawer from "@/components/cart/CartDrawer";
import ProductQuickView from "@/components/products/ProductQuickView";

export const metadata: Metadata = {
  title: "NutriNation — Nourish Naturally | Premium Dry Fruits",
  description:
    "NutriNation brings you the top 1% harvest of dry fruits — Cashews, Pistachios, Mamra Almonds, Kashmiri Walnuts, Medjool Dates, Figs, Apricots, Raisins & Prunes.",
  keywords: [
    "Dry Fruits",
    "Mamra Almonds",
    "Kashmiri Walnuts",
    "W-180 Cashews",
    "Iranian Pistachios",
    "Medjool Dates",
    "Afghani Anjeer",
    "Premium Indian Dry Fruits",
  ],
  openGraph: {
    title: "NutriNation — Premium Dry Fruits. Naturally Better.",
    description: "Cold-cracked Kashmiri almonds, jumbo king cashews, and mountain-cured dry fruits.",
    url: "https://nutrination.in",
    siteName: "NutriNation",
    images: [
      {
        url: "https://images.unsplash.com/photo-1599785209707-a456fc1337bb?auto=format&fit=crop&w=1200&q=80",
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
    <html lang="en">
      <body className="min-h-screen bg-brand-cream text-brand-dark antialiased">
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
                  color: "#202020",
                  border: "1px solid #E9E9E9",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
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
