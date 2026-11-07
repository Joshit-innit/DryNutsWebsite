import { LandingImage } from "@/types";
import { backendApi, unwrapData } from "@/lib/api/axios";
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
    const body = new FormData();
    body.append("file", file);
    const res = await fetch("/api/v1/uploads", {
      method: "POST",
      body,
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.message || "Could not upload that image.");
    return json.data.url as string;
  },
};

export { apiErrorMessage };
