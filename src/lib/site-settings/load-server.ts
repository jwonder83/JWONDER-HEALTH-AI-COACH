import { createClient } from "@/lib/supabase/server";
import type { SiteSettingsMerged } from "@/types/site-settings";
import { cache } from "react";
import { mergeSiteSettingsFromDb } from "./merge";

export const getSiteSettings = cache(async (): Promise<SiteSettingsMerged> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("site_settings").select("settings").eq("id", 1).maybeSingle();
    if (error) {
      return mergeSiteSettingsFromDb(null);
    }
    return mergeSiteSettingsFromDb(data?.settings ?? null);
  } catch {
    return mergeSiteSettingsFromDb(null);
  }
});
