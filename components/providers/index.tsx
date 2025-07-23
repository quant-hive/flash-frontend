"use client";
import { AuthProvider } from "@/context/auth";
import { ReduxProvider } from "./redux-provider";
import { ThemeProvider } from "./theme-provider";
import { SettingsProvider } from "@/context/settings";
import { TooltipProvider } from "../ui/tooltip";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ReduxProvider>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <SettingsProvider>
              <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
            </SettingsProvider>
          </ThemeProvider>
        </AuthProvider>
      </ReduxProvider>
    </>
  );
}
