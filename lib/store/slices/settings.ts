import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UserSettings {
  theme: "light" | "dark" | "system";
  notifications: {
    email: boolean;
    push: boolean;
    marketing: boolean;
  };
  privacy: {
    profileVisibility: "public" | "private";
    dataSharing: boolean;
  };
  preferences: {
    language: string;
    timezone: string;
    currency: string;
  };
}

interface SettingsState {
  userSettings: UserSettings;
}

const initialState: SettingsState = {
  userSettings: {
    theme: "system",
    notifications: {
      email: true,
      push: true,
      marketing: false,
    },
    privacy: {
      profileVisibility: "private",
      dataSharing: false,
    },
    preferences: {
      language: "en",
      timezone: "UTC",
      currency: "USD",
    },
  },
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    updateSettings: (state, action: PayloadAction<Partial<UserSettings>>) => {
      state.userSettings = { ...state.userSettings, ...action.payload };
    },
    updateNotificationSettings: (
      state,
      action: PayloadAction<Partial<UserSettings["notifications"]>>
    ) => {
      state.userSettings.notifications = {
        ...state.userSettings.notifications,
        ...action.payload,
      };
    },
    updatePrivacySettings: (
      state,
      action: PayloadAction<Partial<UserSettings["privacy"]>>
    ) => {
      state.userSettings.privacy = {
        ...state.userSettings.privacy,
        ...action.payload,
      };
    },
    updatePreferences: (
      state,
      action: PayloadAction<Partial<UserSettings["preferences"]>>
    ) => {
      state.userSettings.preferences = {
        ...state.userSettings.preferences,
        ...action.payload,
      };
    },
    resetSettings: (state) => {
      state.userSettings = initialState.userSettings;
    },
  },
});

export const {
  updateSettings,
  updateNotificationSettings,
  updatePrivacySettings,
  updatePreferences,
  resetSettings,
} = settingsSlice.actions;

export default settingsSlice.reducer;

// Selectors - Updated to work with Redux Persist
export const selectUserSettings = (state: any) =>
  state.settings?.userSettings || initialState.userSettings;
export const selectNotificationSettings = (state: any) =>
  state.settings?.userSettings?.notifications ||
  initialState.userSettings.notifications;
export const selectPrivacySettings = (state: any) =>
  state.settings?.userSettings?.privacy || initialState.userSettings.privacy;
export const selectPreferences = (state: any) =>
  state.settings?.userSettings?.preferences ||
  initialState.userSettings.preferences;
