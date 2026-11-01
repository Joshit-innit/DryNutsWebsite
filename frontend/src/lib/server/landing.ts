import { LandingImage } from "@/types";

/** Returns an error message for invalid admin input, or null when it is fine. */
export function validateLandingInput(body: Partial<LandingImage>): string | null {
  if (body.imageUrl !== undefined) {
    try {
      if (new URL(body.imageUrl).protocol !== "https:") return "Image URLs must start with https://";
    } catch {
      return "Enter a valid image URL.";
    }
  }
  if (body.linkUrl && !body.linkUrl.startsWith("/") && !/^https:\/\//.test(body.linkUrl)) {
    return "Links must be a site path like /products or an https:// URL.";
  }
  for (const key of ["title", "caption", "alt"] as const) {
    if (body[key] && String(body[key]).length > 200) return `The ${key} must be 200 characters or fewer.`;
  }
  return null;
}
