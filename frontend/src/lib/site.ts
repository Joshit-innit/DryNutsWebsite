/** The shop's public address, for sitemaps and link previews. Netlify sets URL itself. */
export const SITE_URL = (process.env.SITE_URL || process.env.URL || "https://nutrination.netlify.app").replace(/\/+$/, "");
