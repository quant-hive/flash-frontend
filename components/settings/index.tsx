import React from "react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/auth";
import { useDispatch, useSelector } from "@/lib/store";
import { updateUser, selectCurrentUser } from "@/lib/store/slices/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Pencil } from "lucide-react";
import { Badge } from "../ui/badge";
import { Switch } from "../custom-switch";

const profileSchema = z
  .object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    newPassword: z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      // Only validate password length if newPassword is not empty
      if (data.newPassword && data.newPassword.length > 0) {
        return data.newPassword.length >= 6;
      }
      return true;
    },
    {
      message: "Password must be at least 6 characters",
      path: ["newPassword"],
    }
  )
  .refine(
    (data) => {
      // Only validate password match if newPassword is not empty
      if (data.newPassword && data.newPassword.length > 0) {
        return data.confirmPassword === data.newPassword;
      }
      return true;
    },
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }
  );

const securitySchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, { message: "Current password is required" }),
    newPassword: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SettingsTab = "profile" | "notifications" | "payment" | "data";

const Settings = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const [tab, setTab] = useState<SettingsTab>("profile");
  const [borderStyle, setBorderStyle] = useState({ left: 0, width: 0 });
  const tabsRef = useRef<HTMLDivElement>(null);
  const [editProfile, setEditProfile] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    browser: true,
    weeklyReport: true,
    newFeatures: false,
  });
  const [dataPreferences, setDataPreferences] = useState({
    saveBacktests: false,
    anonymousAnalytics: false,
    locationTracking: false,
    downloadData: false,
  });
  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const securityForm = useForm<z.infer<typeof securitySchema>>({
    resolver: zodResolver(securitySchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (user) {
      profileForm.reset({
        name: user.name || "",
        email: user.email,
        newPassword: "",
        confirmPassword: "",
      });
    }
  }, [user, profileForm]);

  useEffect(() => {
    const updateBorderPosition = () => {
      if (tabsRef.current) {
        const activeTab = tabsRef.current.querySelector(
          `[data-tab="${tab}"]`
        ) as HTMLElement;
        if (activeTab) {
          const containerRect = tabsRef.current.getBoundingClientRect();
          const tabRect = activeTab.getBoundingClientRect();
          setBorderStyle({
            left: tabRect.left - containerRect.left,
            width: tabRect.width,
          });
        }
      }
    };

    updateBorderPosition();
    window.addEventListener("resize", updateBorderPosition);
    return () => window.removeEventListener("resize", updateBorderPosition);
  }, [tab]);

  // Keyboard navigation handler
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const tabs: SettingsTab[] = ["profile", "notifications", "payment", "data"];
    const currentIndex = tabs.indexOf(tab);
    let newTab: SettingsTab | null = null;

    switch (event.key) {
      case "ArrowLeft":
        event.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
        newTab = tabs[prevIndex];
        break;
      case "ArrowRight":
        event.preventDefault();
        const nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
        newTab = tabs[nextIndex];
        break;
      case "Home":
        event.preventDefault();
        newTab = tabs[0];
        break;
      case "End":
        event.preventDefault();
        newTab = tabs[tabs.length - 1];
        break;
    }

    if (newTab) {
      setTab(newTab);
      // Focus the new tab after state update
      setTimeout(() => {
        const newActiveTab = tabsRef.current?.querySelector(
          `[data-tab="${newTab}"]`
        ) as HTMLElement;
        if (newActiveTab) {
          newActiveTab.focus();
        }
      }, 0);
    }
  };

  const onProfileSubmit = (data: z.infer<typeof profileSchema>) => {
    // Update user in Redux store
    dispatch(updateUser(data));
    toast.success("Profile updated successfully");
  };

  const onSecuritySubmit = (data: z.infer<typeof securitySchema>) => {
    // In a real app, you would make an API call to update the password
    toast.success("Password updated successfully");
    securityForm.reset();
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications((prev) => ({ ...prev, [key]: value }));
    toast.success(`Notification preference updated`);
  };

  const handleDataPreferenceChange = (key: string, value: any) => {
    setDataPreferences((prev) => ({ ...prev, [key]: value }));
    toast.success(`Data preference updated`);
  };

  return (
    <div className="w-full h-full flex flex-col overflow-auto custom-scrollbar pr-2">
      <h1 className="text-2xl font-light">Settings</h1>

      <div className="mt-4">
        <div className="relative mb-12">
          <div className="group flex justify-end w-full h-44 p-3 border-2 border-[#222222] bg-profile_banner bg-cover bg-center">
            <div
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.preventDefault();
                // Open file picker or handle banner change
              }}
              className="opacity-0 shadow-black/55 shadow-[1px_2px_5px] group-hover:opacity-100 focus-visible:opacity-100 relative bg-transparent/25 hover:bg-transparent/50 p-0 m-0 h-fit border-image-gradient-to-br from-[#C8E6FF] hover:from-[#C8E6FF]/[75%] via-[#5DB5FF] hover:via-[#5DB5FF]/[75%] to-[#175D98] hover:to-[#175D98]/[75%] border-slice-1 border-slice-no-fill border-image-width-[1px]"
            >
              <div className="p-[5px]">
                <Pencil className="size-3" color="#C8E6FF" />
              </div>
            </div>
          </div>

          <div className="absolute left-9 bottom-0 translate-y-1/2 flex items-center justify-center rounded-full size-[84px] bg-gradient-to-b from-[#B9DFFF] to-[#4DADFF] border-2 border-[#B3DDFF] text-[#19578C] text-4xl font-semibold select-none">
            {user &&
              (user.name && user.name.trim()
                ? user.name.slice(0, 2).toUpperCase()
                : user.username.slice(0, 2).toUpperCase())}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col pl-8">
        <div className="flex flex-row gap-4 items-center">
          <p className="text-xl select-none">
            {user &&
              (user.name && user.name.trim()
                ? user.name.toUpperCase()
                : user.username.toUpperCase())}
          </p>

          <div className="bg-gradient-to-br from-[#D89A48] to-[#794B0F] rounded-full p-[2px] h-fit">
            <div className="flex items-center justify-center bg-profile_badge_gradient select-none rounded-full px-3 py-0.5 w-full h-full text-[#59370A] text-xs">
              {"Enterprise"}
            </div>
          </div>
        </div>

        <div className="mt-2 flex flex-row gap-1 items-center text-[#838383] text-sm">
          <Mail className="size-[14px]" />
          <p>{user && user.email}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-row items-center relative before:h-full before:border-b-2 before:border-[#333333] before:content-[''] before:w-8 after:h-full after:border-b-2 after:border-[#333333] after:content-[''] after:w-full">
        <div
          ref={tabsRef}
          className="flex relative"
          role="tablist"
          aria-label="Settings navigation"
          onKeyDown={handleKeyDown}
        >
          {/* Animated border */}
          <div
            className="absolute bottom-0 h-0.5 bg-[#B3DDFF] transition-all duration-300 ease-out z-10"
            style={{
              left: `${borderStyle.left}px`,
              width: `${borderStyle.width}px`,
            }}
          />

          <div
            role="tab"
            tabIndex={tab === "profile" ? 0 : -1}
            data-tab="profile"
            aria-selected={tab === "profile"}
            aria-controls="profile-panel"
            onClick={() => setTab("profile")}
            className="border-b-2 border-[#333333] text-lg text-white pr-4 pb-1 pl-2 pt-1 hover:bg-muted-foreground cursor-pointer transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B3DDFF] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Profile
          </div>
          <div
            role="tab"
            tabIndex={tab === "notifications" ? 0 : -1}
            data-tab="notifications"
            aria-selected={tab === "notifications"}
            aria-controls="notifications-panel"
            onClick={() => setTab("notifications")}
            className="border-b-2 border-[#333333] text-lg text-white pr-4 pb-1 pl-2 pt-1 hover:bg-muted-foreground cursor-pointer transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B3DDFF] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Notifications
          </div>
          <div
            role="tab"
            tabIndex={tab === "payment" ? 0 : -1}
            data-tab="payment"
            aria-selected={tab === "payment"}
            aria-controls="payment-panel"
            onClick={() => setTab("payment")}
            className="border-b-2 border-[#333333] text-lg text-white pr-4 pb-1 pl-2 pt-1 hover:bg-muted-foreground cursor-pointer transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B3DDFF] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Payment
          </div>
          <div
            role="tab"
            tabIndex={tab === "data" ? 0 : -1}
            data-tab="data"
            aria-selected={tab === "data"}
            aria-controls="data-panel"
            onClick={() => setTab("data")}
            className="border-b-2 border-[#333333] text-lg text-white pr-4 pb-1 pl-2 pt-1 text-nowrap hover:bg-muted-foreground cursor-pointer transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B3DDFF] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Data & Privacy
          </div>
        </div>
      </div>

      <div className="mt-6 pl-8">
        {tab === "profile" && (
          <div
            role="tabpanel"
            id="profile-panel"
            aria-labelledby="profile-tab"
            className="w-[364px]"
          >
            <form
              onSubmit={profileForm.handleSubmit(onProfileSubmit)}
              className="flex flex-col gap-2"
            >
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  className="bg-[#222222] border-none rounded-none"
                  disabled={!editProfile}
                  {...profileForm.register("name")}
                />
                {profileForm.formState.errors.name && (
                  <p className="text-sm text-red-500">
                    {profileForm.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div className="mt-4 flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  className="bg-[#222222] border-none rounded-none"
                  disabled={!editProfile}
                  {...profileForm.register("email")}
                />
                {profileForm.formState.errors.email && (
                  <p className="text-sm text-red-500">
                    {profileForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="mt-4 flex flex-col gap-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative w-full">
                  <Input
                    id="password"
                    {...(showPassword
                      ? { type: "text" }
                      : { type: "password" })}
                    className="bg-[#222222] border-none rounded-none w-full pr-12"
                    disabled={!editProfile}
                    {...profileForm.register("newPassword")}
                  />
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      setShowPassword((prev) => !prev);
                    }}
                    variant={"ghost"}
                    className="w-fit rounded-none absolute inset-y-0 right-0 flex items-center px-4"
                    disabled={!editProfile}
                  >
                    {showPassword ? (
                      <EyeOff
                        name="eye-off"
                        className="w-5 h-5 text-[#808080]"
                      />
                    ) : (
                      <Eye name="eye" className="w-5 h-5 text-[#808080]" />
                    )}
                  </Button>
                </div>
                {profileForm.formState.errors.newPassword && (
                  <p className="text-sm text-red-500">
                    {profileForm.formState.errors.newPassword.message}
                  </p>
                )}
              </div>

              <div className="mt-4 flex flex-col gap-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <div className="relative w-full">
                  <Input
                    id="confirm-password"
                    {...(showConfirmPassword
                      ? { type: "text" }
                      : { type: "password" })}
                    type="password"
                    className="bg-[#222222] border-none rounded-none w-full pr-12"
                    disabled={!editProfile}
                    {...profileForm.register("confirmPassword")}
                  />
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      setShowConfirmPassword((prev) => !prev);
                    }}
                    variant={"ghost"}
                    className="w-fit rounded-none absolute inset-y-0 right-0 flex items-center px-4"
                    disabled={!editProfile}
                  >
                    {showConfirmPassword ? (
                      <EyeOff
                        name="eye-off"
                        className="w-5 h-5 text-[#808080]"
                      />
                    ) : (
                      <Eye name="eye" className="w-5 h-5 text-[#808080]" />
                    )}
                  </Button>
                </div>
                {profileForm.formState.errors.confirmPassword && (
                  <p className="text-sm text-red-500">
                    {profileForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>
              {editProfile ? (
                <div className="flex flex-row gap-2 mt-6">
                  <Button
                    type="submit"
                    className="w-full rounded-none text-base font-semibold tracking-wider bg-[#EEF7FF] hover:bg-[#EEF7FF]/80 border-2 border-[#C8C8C8] hover:border-[#C8C8C8]/80"
                  >
                    Save
                  </Button>
                  <Button
                    variant={"secondary"}
                    className="w-full rounded-none text-base font-semibold tracking-wider"
                    onClick={() => {
                      profileForm.reset();
                      setEditProfile(false);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  className="mt-6 rounded-none text-base font-semibold tracking-wider w-full bg-[#EEF7FF] hover:bg-[#EEF7FF]/80 border-2 border-[#C8C8C8] hover:border-[#C8C8C8]/80"
                  onClick={() => setEditProfile(true)}
                >
                  Edit
                </Button>
              )}
            </form>
          </div>
        )}

        {tab === "notifications" && (
          <div
            role="tabpanel"
            id="notifications-panel"
            aria-labelledby="notifications-tab"
          >
            <p>Notification settings coming soon...</p>
          </div>
        )}

        {tab === "payment" && (
          <div role="tabpanel" id="payment-panel" aria-labelledby="payment-tab">
            <p>Payment settings coming soon...</p>
          </div>
        )}

        {tab === "data" && (
          <div
            role="tabpanel"
            id="data-panel"
            aria-labelledby="data-tab"
            className="w-[600px]"
          >
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="save-backtests" className="text-base">
                    Save Backtests
                  </Label>
                  <p className="text-sm text-input">
                    Save your backtest results for future reference
                  </p>
                </div>
                <Switch
                  id="save-backtests"
                  checked={dataPreferences.saveBacktests}
                  onCheckedChange={(checked) =>
                    handleDataPreferenceChange("saveBacktests", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="anonymous-analytics" className="text-base">
                    Anonymous Analytics
                  </Label>
                  <p className="text-sm text-input">
                    Help us improve by sharing anonymous usage data
                  </p>
                </div>
                <Switch
                  id="anonymous-analytics"
                  checked={dataPreferences.anonymousAnalytics}
                  onCheckedChange={(checked) =>
                    handleDataPreferenceChange("anonymousAnalytics", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="location-tracking" className="text-base">
                    Location Tracking
                  </Label>
                  <p className="text-sm text-input">
                    Allow location tracking for personalized recommendations
                  </p>
                </div>
                <Switch
                  id="location-tracking"
                  checked={dataPreferences.locationTracking}
                  onCheckedChange={(checked) =>
                    handleDataPreferenceChange("locationTracking", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="download-data" className="text-base">
                    Download your data
                  </Label>
                  <p className="text-sm text-input">
                    Request a copy of your account data.{" "}
                    <a className="underline underline-offset-1">Learn more</a>
                  </p>
                </div>
                <Switch
                  id="download-data"
                  checked={dataPreferences.downloadData}
                  onCheckedChange={(checked) =>
                    handleDataPreferenceChange("downloadData", checked)
                  }
                />
              </div>

              <hr className="bg-[#333333]" />

              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="download-data" className="text-base">
                    Delete Account
                  </Label>
                  <p className="text-sm text-input">
                    Permanently delete your account and data
                  </p>
                </div>
                <Button className="rounded-sm bg-[#FF3D40] hover:bg-[#FF3D40]/80 border-2 border-[#FF7777] text-[#FFCECE]">
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
