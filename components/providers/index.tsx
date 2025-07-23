"use client";
import { AuthProvider } from "@/context/auth";
import { ReduxProvider } from "./redux";
import { ThemeProvider } from "./theme";
import { SettingsProvider } from "@/context/settings";
import { TooltipProvider } from "../ui/tooltip";
import { CursorProvider } from "./cursor";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CursorProvider>
        <ReduxProvider>
          <AuthProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <SettingsProvider>
                <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
              </SettingsProvider>
            </ThemeProvider>
          </AuthProvider>
        </ReduxProvider>
      </CursorProvider>
    </>
  );
}
