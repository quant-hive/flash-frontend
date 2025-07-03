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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface AccountSettingsProps {
  settings: any;
  updateSettings: (s: any) => void;
  selectedAvatar: string;
  setSelectedAvatar: (a: string) => void;
  handleSaveAccount: () => void;
  defaultAvatars: string[];
}

export function AccountSettings({
  settings,
  updateSettings,
  selectedAvatar,
  setSelectedAvatar,
  handleSaveAccount,
  defaultAvatars,
}: AccountSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Settings</CardTitle>
        <CardDescription>Manage your account information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar selection and upload */}
        <div className="space-y-4">
          <Label>Current Avatar</Label>
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={selectedAvatar} alt={settings.fullName} />
              <AvatarFallback>
                {settings.fullName
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
          </div>
          <Label>Choose a new avatar</Label>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {defaultAvatars.map((avatar, index) => (
              <Avatar
                key={index}
                className={`h-20 w-20 rounded-lg cursor-pointer hover:ring-2 hover:ring-primary shrink-0 ${
                  selectedAvatar === avatar ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setSelectedAvatar(avatar)}
              >
                <AvatarImage
                  src={avatar}
                  alt={`Avatar ${index + 1}`}
                  className="object-cover"
                />
                <AvatarFallback>{index + 1}</AvatarFallback>
              </Avatar>
            ))}
          </div>
          <div>
            <Label htmlFor="custom-avatar">Or upload a custom avatar</Label>
            <Input
              id="custom-avatar"
              type="file"
              accept="image/*"
              className="mt-1"
            />
          </div>
        </div>
        {/* Account details form */}
        <div className="space-y-2">
          <Label htmlFor="full-name">Full Name</Label>
          <Input
            id="full-name"
            value={settings.fullName}
            onChange={(e) => updateSettings({ fullName: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={settings.email}
            onChange={(e) => updateSettings({ email: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            value={settings.phone}
            onChange={(e) => updateSettings({ phone: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="timezone">Timezone</Label>
          <Select
            value={settings.timezone}
            onValueChange={(value) => updateSettings({ timezone: value })}
          >
            <SelectTrigger id="timezone">
              <SelectValue placeholder="Select Timezone" />
            </SelectTrigger>
            <SelectContent>
              {/* ...timezone options... */}
              <SelectItem value="utc-12">
                International Date Line West (UTC-12)
              </SelectItem>
              <SelectItem value="utc-11">
                Samoa Standard Time (UTC-11)
              </SelectItem>
              <SelectItem value="utc-10">
                Hawaii-Aleutian Standard Time (UTC-10)
              </SelectItem>
              <SelectItem value="utc-9">
                Alaska Standard Time (UTC-9)
              </SelectItem>
              <SelectItem value="utc-8">Pacific Time (UTC-8)</SelectItem>
              <SelectItem value="utc-7">Mountain Time (UTC-7)</SelectItem>
              <SelectItem value="utc-6">Central Time (UTC-6)</SelectItem>
              <SelectItem value="utc-5">Eastern Time (UTC-5)</SelectItem>
              <SelectItem value="utc-4">Atlantic Time (UTC-4)</SelectItem>
              <SelectItem value="utc-3">
                Argentina Standard Time (UTC-3)
              </SelectItem>
              <SelectItem value="utc-2">South Georgia Time (UTC-2)</SelectItem>
              <SelectItem value="utc-1">Azores Time (UTC-1)</SelectItem>
              <SelectItem value="utc+0">Greenwich Mean Time (UTC+0)</SelectItem>
              <SelectItem value="utc+1">
                Central European Time (UTC+1)
              </SelectItem>
              <SelectItem value="utc+2">
                Eastern European Time (UTC+2)
              </SelectItem>
              <SelectItem value="utc+3">Moscow Time (UTC+3)</SelectItem>
              <SelectItem value="utc+4">Gulf Standard Time (UTC+4)</SelectItem>
              <SelectItem value="utc+5">
                Pakistan Standard Time (UTC+5)
              </SelectItem>
              <SelectItem value="utc+5.5">
                Indian Standard Time (UTC+5:30)
              </SelectItem>
              <SelectItem value="utc+6">
                Bangladesh Standard Time (UTC+6)
              </SelectItem>
              <SelectItem value="utc+7">Indochina Time (UTC+7)</SelectItem>
              <SelectItem value="utc+8">China Standard Time (UTC+8)</SelectItem>
              <SelectItem value="utc+9">Japan Standard Time (UTC+9)</SelectItem>
              <SelectItem value="utc+10">
                Australian Eastern Standard Time (UTC+10)
              </SelectItem>
              <SelectItem value="utc+11">
                Solomon Islands Time (UTC+11)
              </SelectItem>
              <SelectItem value="utc+12">
                New Zealand Standard Time (UTC+12)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSaveAccount}>Save Account Settings</Button>
      </CardFooter>
    </Card>
  );
}
