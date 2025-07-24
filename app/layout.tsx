import "./globals.css";
import type React from "react";
import { luxe_uno } from "@/lib/fonts";
import Providers from "@/components/providers";
import Navbar from "@/components/navbar";

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
        className={`${luxe_uno.variable} font-luxe_uno tracking-wide relative min-h-screen bg-[#030303]`}
      >
        <Providers>
          <>
            <div className="absolute top-0 left-0 w-7 h-7 md:w-9 md:h-9 bg-[#111111]" />
            <div className="absolute top-0 right-0 w-7 h-7 md:w-9 md:h-9 bg-[#111111]" />
            <div className="absolute bottom-0 left-0 w-7 h-7 md:w-9 md:h-9 bg-[#111111]" />
            <div className="absolute bottom-0 right-0 w-7 h-7 md:w-9 md:h-9 bg-[#111111]" />
          </>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
