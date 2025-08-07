const { text } = require("stream/consumers");

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx,js,jsx,mdx}",
    "./components/**/*.{ts,tsx,js,jsx,mdx}",
    "./app/**/*.{ts,tsx,js,jsx,mdx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        luxe_uno: ["var(--font-luxe_uno)"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: {
          DEFAULT: "hsl(var(--input))",
          background: "hsl(var(--input-background))",
          placeholder: "hsl(var(--input-placeholder))",
        },
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        button: {
          DEFAULT: "hsl(var(--button))",
          foreground: "hsl(var(--button-foreground))",
          focus: "hsl(var(--button-focus))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          text: "hsl(var(--muted-text))",
          foreground: "hsl(var(--muted-foreground))",
          "text-foreground": "hsl(var(--muted-text-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
          background: "hsl(var(--popover-background))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
          border: "hsl(var(--card-border))",
        },
        radio: {
          background: "hsl(var(--radio-background))",
          border: "hsl(var(--radio-border))",
          "active-foreground": "var(--radio-active-foreground)",
          "active-border": "var(--radio-active-border)",
        },
        draggable: {
          border: "var(--draggable-border)",
          "up-arrow": "var(--draggable-up-arrow)",
          "down-arrow": "var(--draggable-down-arrow)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "fade-in": {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        "fade-out": {
          from: { opacity: 1 },
          to: { opacity: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "fade-out": "fade-out 0.3s ease-out",
      },
      backgroundImage: {
        tooltip_bg_gradient:
          "linear-gradient(90deg, #00254F , #003F87 , #004CA3 , #003470 100%)",
        tooltip_text_gradient:
          "linear-gradient(90deg, #B5D8FF , #96C7FF , #A3CEFF 100%)",
        blue_accent_gradient:
          "linear-gradient(180deg, #93C6FF 0%, #599BE6 31%, #93C6FF 67%, #467AB5 100%)",
        blue_accent_gradient_90deg:
          "linear-gradient(90deg, #93C6FF 0%, #599BE6 31%, #93C6FF 67%, #467AB5 100%)",
        pro_text_gradient:
          "linear-gradient(90deg, #659CD6 0%, #A3CEFF 34%, #8FC3FF 66%, #4F6782 100%)",
        logout_gradient:
          "linear-gradient(90deg, #A3CEFF20 0%, #599BE620 31%, #A3CEFF20 67%, #467AB520 100%)",
        logout_gradient_light:
          "linear-gradient(90deg, #A3CEFF30 0%, #599BE630 31%, #A3CEFF30 67%, #467AB530 100%)",
        new_chat_text_accent_gradient:
          "linear-gradient(135deg, #5293DD 14%, #5293DD20 16%, #6BB0FF 29%, #6BB0FF20 49%, #3F8BE0 62%, #3F8BE020 75%, #8BC2FF 92%)",
        text_accent_gradient:
          "linear-gradient(135deg, #B9DAFF 0%, #75ACEA 100%)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
