import "./globals.css";
import type React from "react";
import { luxe_uno } from "@/lib/fonts";
import Providers from "@/components/providers";

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
      <body
        className={`${luxe_uno.variable} font-luxe_uno tracking-wide relative`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
