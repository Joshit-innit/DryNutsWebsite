import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Marcellus } from "next/font/google";
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
    "NutriNation offers cashews, pistachios, almonds, walnuts, raisins, dates, dried apricots, dry figs, prunes, combos, and gift boxes.",
  keywords: [
    "Dry Fruits",
    "Premium Indian Dry Fruits",
  ],
  openGraph: {
    title: "NutriNation — Premium Indian Dry Fruits",
    description: "A focused collection of dry fruits, combos, and gift boxes.",
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
    <html lang="en" className={`${sans.variable} ${marcellus.variable} ${casanova.variable}`}>
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
                  background: "#FFFAF2",
                  color: "#202020",
                  border: "1px solid #E9E9E9",
                  boxShadow: "0 8px 24px rgba(32,32,32,0.08)",
                  borderRadius: "8px",
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
