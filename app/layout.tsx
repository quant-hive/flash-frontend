import "./globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SettingsProvider } from "@/contexts/settings-context";
import { AuthProvider } from "@/contexts/auth-context";
import { ReduxProvider } from "@/components/providers/redux-provider";
import type React from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "QuantHive Dashboard",
  description: "A modern, responsive financial dashboard",
  generator: "v0.dev",
  icons: {
    icon: "/favicon.jpeg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ReduxProvider>
          <AuthProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <SettingsProvider>
                <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
              </SettingsProvider>
            </ThemeProvider>
          </AuthProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
