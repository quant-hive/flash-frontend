// Interface for user settings structure
export interface UserSettings {
  avatar: string;
  fullName: string;
  email: string;
  phone: string;
  timezone: string;
  language: string;
  currency: string;
  dateFormat: string;
  fontSize: number;
  theme: "light" | "dark" | "system";
  layout: "default" | "compact" | "expanded";
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    accountActivity: boolean;
    newFeatures: boolean;
    marketing: boolean;
    frequency: "real-time" | "daily" | "weekly";
    quietHoursStart: string;
    quietHoursEnd: string;
  };
  privacy: {
    analyticsSharing: boolean;
    personalizedAds: boolean;
    visibility: "public" | "private";
    dataRetention: "6-months" | "1-year" | "2-years" | "indefinite";
  };
}
