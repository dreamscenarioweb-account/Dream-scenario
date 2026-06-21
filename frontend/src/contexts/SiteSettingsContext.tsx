/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { fetchPublicSettings } from "@/lib/publicApi";

const SETTINGS_STORAGE_KEY = "site-settings-cache";

// Public-facing defaults used only after settings have finished loading.
export const SETTING_DEFAULTS: Record<string, string> = {
  site_name: "Your Photography Studio",
  contact_email: "hello@yourstudio.com",
  contact_phone: "+1 (555) 000-0000",
  address: "City, Country",
  instagram_url: "https://www.instagram.com/dream.scenario__weddings?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==",
  facebook_url: "#",
  about_title: "More Than a Photographer - A Storyteller",
  about_tagline: "Capturing the moments that take your breath away",
  about_description: "",
  about_description_2: "",
  about_image_url: "",
  stat_weddings: "200+",
  stat_happy_couples: "200+",
  stat_years: "8",
  stat_countries: "15",
  slogan_title: "DESTINY HAS GOT YOU TOGETHER, ALLOW US TO TAKE YOU BEYOND",
  slogan_subtitle: "BEYOND DESTINY",
  slogan_description: "We at Beyond Destiny look forward to making your special day a unique one. We guarantee you a stress free, laid back and fun experience with a great crew. Capturing the perfect poise or smile can only be done by having a smile...",
  slogan_description_full: "We at Beyond Destiny look forward to making your special day a unique one. We guarantee you a stress free, laid back and fun experience with a great crew. Capturing the perfect poise or smile can only be done by having a professional photographer, therefore we ensure all our staff are properly trained and dispatched to photographic assignments fully equipped with the latest cameras, thereby ensuring we capture and immortalize your precious memories on photographs by using young, idiosyncratic and professional wedding photographers, bonded by talent, driven by passion to carry you Beyond your Destiny!\"",
  slogan_image_url: "",
  site_logo_url: "",
  site_logo_enabled: "false",
  hero_image_services: "",
  hero_image_about: "",
  hero_image_portfolio: "",
  hero_image_contact: "",
};

interface SiteSettingsContextType {
  settings: Record<string, string>;
  isLoaded: boolean;
  getSetting: (key: string) => string;
  refreshSettings: () => Promise<void>;
}

const readCachedSettings = (): Record<string, string> => {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const cached = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!cached) {
      return {};
    }

    const parsed = JSON.parse(cached);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }

    return parsed as Record<string, string>;
  } catch {
    return {};
  }
};

const SiteSettingsContext = createContext<SiteSettingsContextType | undefined>(undefined);

export const SiteSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<Record<string, string>>(() => readCachedSettings());
  const [isLoaded, setIsLoaded] = useState(false);

  const loadSettings = useCallback(async () => {
    try {
      const res = await fetchPublicSettings();
      if (res.data && typeof res.data === "object" && !Array.isArray(res.data)) {
        const nextSettings = res.data as Record<string, string>;
        setSettings(nextSettings);

        if (typeof window !== "undefined") {
          window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(nextSettings));
        }
      }
    } catch {
      // Ignore request failures and fall back to cached or default values.
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const getSetting = (key: string): string => {
    const val = settings[key];
    if (val && val.trim()) {
      return val;
    }

    return isLoaded ? (SETTING_DEFAULTS[key] ?? "") : "";
  };

  return (
    <SiteSettingsContext.Provider value={{ settings, isLoaded, getSetting, refreshSettings: loadSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  );
};

export const useSiteSettings = () => {
  const ctx = useContext(SiteSettingsContext);
  if (!ctx) {
    throw new Error("useSiteSettings must be used within SiteSettingsProvider");
  }
  return ctx;
};
