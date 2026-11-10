const isDev = process.env.NODE_ENV === "development";

// The Render services the page pings so sign-in is awake by the time it's needed.
const warmUrls = (
  process.env.NEXT_PUBLIC_AUTH_WARM_URLS ??
  "https://nutrination-gateway.onrender.com,https://nutrination-customer.onrender.com"
)
  .split(",")
  .map((url) => url.trim())
  .filter(Boolean)
  .map((url) => new URL(url).origin);

// Google's sign-in button: its script, its stylesheet, and the frame it draws in.
const GOOGLE_SIGN_IN = "https://accounts.google.com/gsi/";

/**
 * What the browser may load. Next.js inlines small scripts and styles, hence
 * 'unsafe-inline'; everything else must come from this site or the named hosts.
 * frame-ancestors 'none' stops other sites framing the shop to trick clicks.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} ${GOOGLE_SIGN_IN}client`,
  `style-src 'self' 'unsafe-inline' ${GOOGLE_SIGN_IN}style`,
  "img-src 'self' blob: data: https://images.unsplash.com https://*.supabase.co",
  "font-src 'self' data:",
  `connect-src 'self' ${warmUrls.join(" ")} ${GOOGLE_SIGN_IN}`,
  `frame-src ${GOOGLE_SIGN_IN}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Receipt links are private, so other sites never see the full address of a page.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        // Photos uploaded through the admin console (Supabase Storage).
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
