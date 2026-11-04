import { StoreSettings } from "@/types";
import { backendApi, unwrapData } from "@/lib/api/axios";

export const settingsService = {
  async getSettings(): Promise<StoreSettings> {
    return unwrapData<StoreSettings>(await backendApi.get("/settings"));
  },

  async saveSettings(settings: StoreSettings): Promise<StoreSettings> {
    return unwrapData<StoreSettings>(await backendApi.put("/settings", settings));
  },
};
