"use client";
import { AuthProvider } from "@/context/auth";
import { ReduxProvider } from "./redux";
import { ThemeProvider } from "./theme";
import { SettingsProvider } from "@/context/settings";
import { CursorProvider } from "./cursor";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CursorProvider>
        <ReduxProvider>
          <AuthProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <SettingsProvider> {children}</SettingsProvider>
            </ThemeProvider>
          </AuthProvider>
        </ReduxProvider>
      </CursorProvider>
    </>
  );
}
