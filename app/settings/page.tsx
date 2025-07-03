"use client";

import { useState } from "react";
import { useSettings } from "@/contexts/settings-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { defaultAvatars } from "@/lib/constants";
import { AccountSettings } from "@/components/settings/account-settings";
import { SecuritySettings } from "@/components/settings/security-settings";
import { PreferencesSettings } from "@/components/settings/preferences-settings";
import { NotificationsSettings } from "@/components/settings/notifications-settings";
import { PrivacySettings } from "@/components/settings/privacy-settings";
import { UserSettings } from "@/types/settings-context";

// Local type for security state
const initialSecurityState = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
  twoFactor: false,
};

export default function SettingsPage() {
  const {
    settings,
    updateSettings,
    updateNotificationSettings,
    updatePrivacySettings,
  } = useSettings();
  const [selectedAvatar, setSelectedAvatar] = useState(settings.avatar);

  // Local state for security fields
  const [security, setSecurity] = useState(initialSecurityState);
  // Local state for preferences fields
  const [preferences, setPreferences] = useState({
    language: settings.language,
    currency: settings.currency,
    dateFormat: settings.dateFormat,
    fontSize: settings.fontSize,
    theme: settings.theme,
    layout: settings.layout,
  });

  const handleSaveAccount = () => {
    updateSettings({
      avatar: selectedAvatar,
      fullName: settings.fullName,
      email: settings.email,
      phone: settings.phone,
      timezone: settings.timezone,
    });
    toast.success("Account settings saved successfully");
  };

  const handleSaveNotifications = () => {
    updateNotificationSettings(settings.notifications);
    toast.success("Notification settings saved successfully");
  };

  const handleSavePrivacy = () => {
    updatePrivacySettings(settings.privacy);
    toast.success("Privacy settings saved successfully");
  };

  const handleSaveSecurity = () => {
    // Implement security save logic here
    toast.success("Security settings saved successfully");
  };

  const handleSavePreferences = () => {
    updateSettings(preferences);
    toast.success("Preferences saved successfully");
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      <Tabs defaultValue="account" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>

        {/* Account Tab */}
        <TabsContent value="account">
          <AccountSettings
            settings={settings}
            updateSettings={updateSettings}
            selectedAvatar={selectedAvatar}
            setSelectedAvatar={setSelectedAvatar}
            handleSaveAccount={handleSaveAccount}
            defaultAvatars={defaultAvatars}
          />
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <SecuritySettings
            security={security}
            updateSecurity={(update) =>
              setSecurity((prev) => ({ ...prev, ...update }))
            }
            handleSaveSecurity={handleSaveSecurity}
          />
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences">
          <PreferencesSettings
            preferences={preferences}
            updatePreferences={(update) =>
              setPreferences((prev) => ({ ...prev, ...update }))
            }
            handleSavePreferences={handleSavePreferences}
          />
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <NotificationsSettings
            notifications={settings.notifications}
            updateNotificationSettings={updateNotificationSettings}
            handleSaveNotifications={handleSaveNotifications}
          />
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy">
          <PrivacySettings
            privacy={settings.privacy}
            updatePrivacySettings={updatePrivacySettings}
            handleSavePrivacy={handleSavePrivacy}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
