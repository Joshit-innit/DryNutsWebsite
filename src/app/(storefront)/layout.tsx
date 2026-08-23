import React from "react";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MobileNav from "@/components/layout/MobileNav";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-brand-cream text-brand-dark">
      <AnnouncementBar />
      <Navbar />
      <main className="flex-1 pb-16 lg:pb-0">{children}</main>
      <Footer />
      <MobileNav />
    </div>
  );
}
