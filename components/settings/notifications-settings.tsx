import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { UserSettings } from "@/types/settings-context";

interface NotificationsSettingsProps {
  notifications: UserSettings["notifications"];
  updateNotificationSettings: (
    settings: Partial<UserSettings["notifications"]>
  ) => void;
  handleSaveNotifications: () => void;
}

export function NotificationsSettings({
  notifications,
  updateNotificationSettings,
  handleSaveNotifications,
}: NotificationsSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
        <CardDescription>Manage your notification preferences</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="email">Email Notifications</Label>
          <Switch
            id="email"
            checked={notifications.email}
            onCheckedChange={(checked) =>
              updateNotificationSettings({ email: checked })
            }
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="push">Push Notifications</Label>
          <Switch
            id="push"
            checked={notifications.push}
            onCheckedChange={(checked) =>
              updateNotificationSettings({ push: checked })
            }
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="sms">SMS Notifications</Label>
          <Switch
            id="sms"
            checked={notifications.sms}
            onCheckedChange={(checked) =>
              updateNotificationSettings({ sms: checked })
            }
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="account-activity">Account Activity</Label>
          <Switch
            id="account-activity"
            checked={notifications.accountActivity}
            onCheckedChange={(checked) =>
              updateNotificationSettings({ accountActivity: checked })
            }
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="new-features">New Features</Label>
          <Switch
            id="new-features"
            checked={notifications.newFeatures}
            onCheckedChange={(checked) =>
              updateNotificationSettings({ newFeatures: checked })
            }
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="marketing">Marketing</Label>
          <Switch
            id="marketing"
            checked={notifications.marketing}
            onCheckedChange={(checked) =>
              updateNotificationSettings({ marketing: checked })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="frequency">Notification Frequency</Label>
          <Select
            value={notifications.frequency}
            onValueChange={(value) =>
              updateNotificationSettings({
                frequency: value as UserSettings["notifications"]["frequency"],
              })
            }
          >
            <SelectTrigger id="frequency">
              <SelectValue placeholder="Select Frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="real-time">Real-Time</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="quiet-hours-start">Quiet Hours Start</Label>
          <input
            id="quiet-hours-start"
            type="time"
            value={notifications.quietHoursStart}
            onChange={(e) =>
              updateNotificationSettings({ quietHoursStart: e.target.value })
            }
            className="input"
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="quiet-hours-end">Quiet Hours End</Label>
          <input
            id="quiet-hours-end"
            type="time"
            value={notifications.quietHoursEnd}
            onChange={(e) =>
              updateNotificationSettings({ quietHoursEnd: e.target.value })
            }
            className="input"
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSaveNotifications}>
          Save Notification Settings
        </Button>
      </CardFooter>
    </Card>
  );
}
