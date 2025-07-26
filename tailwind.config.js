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
        input: "hsl(var(--input))",
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
          foreground: "hsl(var(--muted-foreground))",
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
        profile_gradient:
          "linear-gradient(180deg, #94C6FF 0%, #5A9BE6 31%, #94C6FF 67%, #477AB5 100%)",
        user_head_gradient:
          "linear-gradient(180deg, #94C6FF 0%, #5A9BE6 31%, #94C6FF 67%, #477AB5 100%)",
        pro_text_gradient:
          "linear-gradient(90deg, #659CD6 0%, #A3CEFF 34%, #8FC3FF 66%, #4F6782 100%)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
