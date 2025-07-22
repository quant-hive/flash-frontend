"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { UserSettings } from "@/types/settings-context";

// Default user settings
const defaultSettings: UserSettings = {
  avatar:
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/38184074.jpg-M4vCjTSSWVw5RwWvvmrxXBcNVU8MBU.jpeg",
  fullName: "Dollar Singh",
  email: "dollar.singh@example.com",
  phone: "+1 (555) 123-4567",
  timezone: "utc-8",
  language: "en",
  currency: "usd",
  dateFormat: "mm-dd-yyyy",
  fontSize: 16,
  theme: "system",
  layout: "default",
  notifications: {
    email: true,
    push: true,
    sms: false,
    accountActivity: true,
    newFeatures: true,
    marketing: false,
    frequency: "real-time",
    quietHoursStart: "22:00",
    quietHoursEnd: "07:00",
  },
  privacy: {
    analyticsSharing: true,
    personalizedAds: false,
    visibility: "public",
    dataRetention: "1-year",
  },
};

// Context type for settings
interface SettingsContextType {
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  updateNotificationSettings: (
    settings: Partial<UserSettings["notifications"]>
  ) => void;
  updatePrivacySettings: (settings: Partial<UserSettings["privacy"]>) => void;
}

// Create the settings context
const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

// Provider component to wrap the app and provide settings state
export function SettingsProvider({ children }: { children: React.ReactNode }) {
  // State for user settings, initialized from localStorage if available
  const [settings, setSettings] = useState<UserSettings>(() => {
    // Try to load settings from localStorage during initialization
    if (typeof window !== "undefined") {
      const savedSettings = localStorage.getItem("userSettings");
      if (savedSettings) {
        return JSON.parse(savedSettings);
      }
    }
    return defaultSettings;
  });

  // Uncomment to persist settings to localStorage on change
  // useEffect(() => {
  //   localStorage.setItem("userSettings", JSON.stringify(settings))
  // }, [settings])

  // Update all settings at once
  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // Update only notification settings
  const updateNotificationSettings = (
    notificationSettings: Partial<UserSettings["notifications"]>
  ) => {
    setSettings((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, ...notificationSettings },
    }));
  };

  // Update only privacy settings
  const updatePrivacySettings = (
    privacySettings: Partial<UserSettings["privacy"]>
  ) => {
    setSettings((prev) => ({
      ...prev,
      privacy: { ...prev.privacy, ...privacySettings },
    }));
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        updateNotificationSettings,
        updatePrivacySettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

// Custom hook to use the SettingsContext
export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
