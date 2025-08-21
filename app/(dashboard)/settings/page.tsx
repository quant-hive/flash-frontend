"use client";

import { useState, useEffect } from "react";
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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const profileSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
});

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

export default function SettingsPage() {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const [notifications, setNotifications] = useState({
    email: true,
    browser: true,
    weeklyReport: true,
    newFeatures: false,
  });
  const [dataPreferences, setDataPreferences] = useState({
    saveBacktests: true,
    anonymousAnalytics: true,
    dataRetention: "1-year",
  });

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
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
      });
    }
  }, [user, profileForm]);

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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="data">Data & Privacy</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                Manage your personal information
              </CardDescription>
            </CardHeader>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" {...profileForm.register("name")} />
                  {profileForm.formState.errors.name && (
                    <p className="text-sm text-red-500">
                      {profileForm.formState.errors.name.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...profileForm.register("email")}
                  />
                  {profileForm.formState.errors.email && (
                    <p className="text-sm text-red-500">
                      {profileForm.formState.errors.email.message}
                    </p>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit">Save Changes</Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Update your password</CardDescription>
            </CardHeader>
            <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    {...securityForm.register("currentPassword")}
                  />
                  {securityForm.formState.errors.currentPassword && (
                    <p className="text-sm text-red-500">
                      {securityForm.formState.errors.currentPassword.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    {...securityForm.register("newPassword")}
                  />
                  {securityForm.formState.errors.newPassword && (
                    <p className="text-sm text-red-500">
                      {securityForm.formState.errors.newPassword.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    {...securityForm.register("confirmPassword")}
                  />
                  {securityForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-red-500">
                      {securityForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit">Update Password</Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Manage how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">
                    Email Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={notifications.email}
                  onCheckedChange={(checked) =>
                    handleNotificationChange("email", checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="browser-notifications">
                    Browser Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications in your browser
                  </p>
                </div>
                <Switch
                  id="browser-notifications"
                  checked={notifications.browser}
                  onCheckedChange={(checked) =>
                    handleNotificationChange("browser", checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="weekly-report">Weekly Report</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive a weekly summary of your backtests
                  </p>
                </div>
                <Switch
                  id="weekly-report"
                  checked={notifications.weeklyReport}
                  onCheckedChange={(checked) =>
                    handleNotificationChange("weeklyReport", checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="new-features">New Features</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified about new features and updates
                  </p>
                </div>
                <Switch
                  id="new-features"
                  checked={notifications.newFeatures}
                  onCheckedChange={(checked) =>
                    handleNotificationChange("newFeatures", checked)
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data">
          <Card>
            <CardHeader>
              <CardTitle>Data & Privacy</CardTitle>
              <CardDescription>
                Manage your data and privacy preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="save-backtests">Save Backtests</Label>
                  <p className="text-sm text-muted-foreground">
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
                <div className="space-y-0.5">
                  <Label htmlFor="anonymous-analytics">
                    Anonymous Analytics
                  </Label>
                  <p className="text-sm text-muted-foreground">
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
              <div className="space-y-2">
                <Label htmlFor="data-retention">Data Retention</Label>
                <Select
                  value={dataPreferences.dataRetention}
                  onValueChange={(value) =>
                    handleDataPreferenceChange("dataRetention", value)
                  }
                >
                  <SelectTrigger id="data-retention">
                    <SelectValue placeholder="Select data retention period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3-months">3 Months</SelectItem>
                    <SelectItem value="6-months">6 Months</SelectItem>
                    <SelectItem value="1-year">1 Year</SelectItem>
                    <SelectItem value="forever">Forever</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  How long we keep your backtest data
                </p>
              </div>
              <div className="pt-4">
                <Button variant="destructive">Delete All My Data</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
