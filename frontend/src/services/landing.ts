import { LandingImage } from "@/types";
import { backendApi, unwrapData } from "@/lib/api/axios";
import { ACCESS_TOKEN_STORAGE_KEY } from "@/lib/auth-constants";
import { apiErrorMessage } from "@/lib/auth-session";

export const landingService = {
  async getAll(): Promise<LandingImage[]> {
    try {
      return unwrapData<LandingImage[]>(await backendApi.get("/landing-images"));
    } catch {
      return [];
    }
  },

  async create(image: Omit<LandingImage, "id" | "sortOrder">): Promise<LandingImage> {
    return unwrapData<LandingImage>(await backendApi.post("/landing-images", image));
  },

  async update(id: string, updates: Partial<LandingImage>): Promise<LandingImage> {
    return unwrapData<LandingImage>(await backendApi.patch(`/landing-images/${id}`, updates));
  },

  async remove(id: string): Promise<void> {
    await backendApi.delete(`/landing-images/${id}`);
  },

  /** Uploads an image file and returns its public URL. */
  async upload(file: File): Promise<string> {
    const token = sessionStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
    const body = new FormData();
    body.append("file", file);
    const base = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
    const res = await fetch(`${base}/uploads`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body,
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.message || "Could not upload that image.");
    return json.data.url as string;
  },
};

export { apiErrorMessage };
