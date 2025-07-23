import localFont from "next/font/local";

const luxe_uno = localFont({
  src: [
    {
      path: "../public/fonts/Luxe-Uno/LuxeUno-Thin.otf",
      weight: "100",
      style: "normal",
    },
    {
      path: "../public/fonts/Luxe-Uno/LuxeUno-ThinItalic.otf",
      weight: "100",
      style: "italic",
    },
    {
      path: "../public/fonts/Luxe-Uno/LuxeUno-UltraLight.otf",
      weight: "200",
      style: "normal",
    },
    {
      path: "../public/fonts/Luxe-Uno/LuxeUno-UltraLightItalic.otf",
      weight: "200",
      style: "italic",
    },
    {
      path: "../public/fonts/Luxe-Uno/LuxeUno-Light.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/fonts/Luxe-Uno/LuxeUno-LightItalic.otf",
      weight: "300",
      style: "italic",
    },
    {
      path: "../public/fonts/Luxe-Uno/LuxeUno-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/Luxe-Uno/LuxeUno-Italic.otf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../public/fonts/Luxe-Uno/LuxeUno-SemiBold.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/Luxe-Uno/LuxeUno-SemiBoldItalic.otf",
      weight: "600",
      style: "italic",
    },
    {
      path: "../public/fonts/Luxe-Uno/LuxeUno-Bold.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/fonts/Luxe-Uno/LuxeUno-BoldItalic.otf",
      weight: "700",
      style: "italic",
    },
    {
      path: "../public/fonts/Luxe-Uno/LuxeUno-Heavy.otf",
      weight: "800",
      style: "normal",
    },
    {
      path: "../public/fonts/Luxe-Uno/LuxeUno-HeavyItalic.otf",
      weight: "800",
      style: "italic",
    },
  ],
  variable: "--font-luxe_uno",
  display: "swap",
});

export { luxe_uno };
