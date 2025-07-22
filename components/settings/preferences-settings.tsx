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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { UserSettings } from "@/types/settings-context";

interface PreferencesSettingsProps {
  preferences: Pick<
    UserSettings,
    "language" | "currency" | "dateFormat" | "fontSize" | "theme" | "layout"
  >;
  updatePreferences: (
    settings: Partial<PreferencesSettingsProps["preferences"]>
  ) => void;
  handleSavePreferences: () => void;
}

export function PreferencesSettings({
  preferences,
  updatePreferences,
  handleSavePreferences,
}: PreferencesSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferences</CardTitle>
        <CardDescription>Customize your dashboard experience</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Example: Language preference */}
        <div className="space-y-2">
          <Label htmlFor="language">Language</Label>
          <Select
            value={preferences.language}
            onValueChange={(value) => updatePreferences({ language: value })}
          >
            <SelectTrigger id="language">
              <SelectValue placeholder="Select Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Spanish</SelectItem>
              <SelectItem value="fr">French</SelectItem>
              {/* Add more languages as needed */}
            </SelectContent>
          </Select>
        </div>
        {/* Add more preferences fields as needed */}
      </CardContent>
      <CardFooter>
        <Button onClick={handleSavePreferences}>Save Preferences</Button>
      </CardFooter>
    </Card>
  );
}
