import "./globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SettingsProvider } from "@/context/settings";
import { AuthProvider } from "@/context/auth";
import { ReduxProvider } from "@/components/providers/redux-provider";
import type React from "react";
import { luxe_uno } from "@/lib/fonts";
import Providers from "@/components/providers";

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
      <body className={`${luxe_uno.variable} relative`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
