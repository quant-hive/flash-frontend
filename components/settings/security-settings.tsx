import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

// Local type for security state
interface SecurityState {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  twoFactor: boolean;
}

interface SecuritySettingsProps {
  security: SecurityState;
  updateSecurity: (settings: Partial<SecurityState>) => void;
  handleSaveSecurity: () => void;
}

export function SecuritySettings({
  security,
  updateSecurity,
  handleSaveSecurity,
}: SecuritySettingsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Security Settings</CardTitle>
          <CardDescription>
            Manage your account's security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Security form fields */}
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input
              id="current-password"
              type="password"
              value={security.currentPassword}
              onChange={(e) =>
                updateSecurity({ currentPassword: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              value={security.newPassword}
              onChange={(e) => updateSecurity({ newPassword: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={security.confirmPassword}
              onChange={(e) =>
                updateSecurity({ confirmPassword: e.target.value })
              }
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="two-factor"
              checked={security.twoFactor}
              onCheckedChange={(checked) =>
                updateSecurity({ twoFactor: checked })
              }
            />
            <Label htmlFor="two-factor">Enable Two-Factor Authentication</Label>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSaveSecurity}>Save Security Settings</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Login History</CardTitle>
          <CardDescription>
            Recent login activities on your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Login history list */}
          {/* ... */}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>
            Currently active sessions on your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Active sessions list */}
          {/* ... */}
        </CardContent>
        <CardFooter>
          <Button variant="outline">Log Out All Other Sessions</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
