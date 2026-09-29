import type { Metadata } from "next";
import { Cinzel, Plus_Jakarta_Sans, Marcellus } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { StoreProvider } from "@/context/StoreContext";
import { Toaster } from "sonner";
import PortalSwitcher from "@/components/layout/PortalSwitcher";
import SmoothScroll from "@/components/animations/SmoothScroll";
import CartDrawer from "@/components/cart/CartDrawer";
import ProductQuickView from "@/components/products/ProductQuickView";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

const serif = Cinzel({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
  variable: "--font-serif",
  display: "swap",
});

const marcellus = Marcellus({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-marcellus",
  display: "swap",
});

const casanova = localFont({
  src: "../../public/fonts/Casanova.otf",
  variable: "--font-casanova",
  display: "swap",
});

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
        url: "https://images.unsplash.com/photo-1606923829579-0cb981a83e2e?auto=format&fit=crop&w=1200&q=80",
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
    <html lang="en" className={`${sans.variable} ${serif.variable} ${marcellus.variable} ${casanova.variable}`}>
      <body className="min-h-screen bg-brand-cream text-brand-dark antialiased font-sans">
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
                  background: "#FBF7F1",
                  color: "#1A1612",
                  border: "1px solid #E5DCD0",
                  boxShadow: "0 18px 40px rgba(26,22,18,0.08)",
                  borderRadius: "16px",
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
