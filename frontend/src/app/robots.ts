import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Staff consoles, accounts, receipts, checkout and the API have nothing to index.
      disallow: ["/admin", "/cmd", "/api", "/api-docs", "/account", "/checkout", "/cart", "/login", "/register"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
