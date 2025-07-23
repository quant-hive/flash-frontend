"use client";

import { createContext, useContext } from "react";
import { useDispatch, useSelector } from "@/lib/store";
import {
  updateSettings as updateSettingsAction,
  updateNotificationSettings as updateNotificationSettingsAction,
  updatePrivacySettings as updatePrivacySettingsAction,
  selectUserSettings,
  UserSettings,
} from "@/lib/store/slices/settings";

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
  const dispatch = useDispatch();
  const settings = useSelector(selectUserSettings);

  // Update all settings at once
  const updateSettings = (newSettings: Partial<UserSettings>) => {
    dispatch(updateSettingsAction(newSettings));
  };

  // Update only notification settings
  const updateNotificationSettings = (
    notificationSettings: Partial<UserSettings["notifications"]>
  ) => {
    dispatch(updateNotificationSettingsAction(notificationSettings));
  };

  // Update only privacy settings
  const updatePrivacySettings = (
    privacySettings: Partial<UserSettings["privacy"]>
  ) => {
    dispatch(updatePrivacySettingsAction(privacySettings));
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
