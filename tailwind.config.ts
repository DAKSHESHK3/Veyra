import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
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
      colors: {
        background: "#090909",
        surface: "#131313",
        "surface-container-lowest": "#0e0e0e",
        "surface-container-low": "#1c1b1b",
        "surface-container": "#201f1f",
        "surface-container-high": "#2a2a2a",
        "surface-container-highest": "#353534",
        "on-surface": "#e5e2e1",
        "on-surface-variant": "#c9c7bd",
        outline: "#929189",
        "outline-variant": "#474740",
        border: "#222220",
        secondary: "#e3c283",
        "secondary-container": "#5c4612",
        "on-secondary": "#402d00",
        "on-secondary-container": "#d4b476",
        "secondary-fixed": "#ffdea1",
        "on-secondary-fixed": "#261900",
        tertiary: "#ffffff",
        "on-primary": "#31312b",
        "tertiary-container": "#e4e3dc",
        error: "#ffb4ab",
        "error-container": "#93000a",
        "on-error": "#690005",
        // Semantic overrides
        primary: {
          DEFAULT: "#ffffff",
          foreground: "#131313",
        },
        muted: {
          DEFAULT: "#1c1b1b",
          foreground: "#9a9a94",
        },
        card: {
          DEFAULT: "#0e0e0e",
          foreground: "#f3f0e8",
        },
        popover: {
          DEFAULT: "#131313",
          foreground: "#f3f0e8",
        },
        accent: {
          DEFAULT: "#e3c283",
          foreground: "#402d00",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist)", "Geist", "Inter", "sans-serif"],
        mono: ["var(--font-space-mono)", "Space Mono", "monospace"],
        "body-md": ["var(--font-geist)", "Geist", "sans-serif"],
        "body-lg": ["var(--font-geist)", "Geist", "sans-serif"],
        "body-sm": ["var(--font-geist)", "Geist", "sans-serif"],
        "label-technical": ["var(--font-space-mono)", "Space Mono", "monospace"],
        "label-micro": ["var(--font-space-mono)", "Space Mono", "monospace"],
        "display-hero": ["var(--font-geist)", "Geist", "sans-serif"],
        "headline-lg": ["var(--font-geist)", "Geist", "sans-serif"],
        "headline-md": ["var(--font-geist)", "Geist", "sans-serif"],
        "headline-sm": ["var(--font-geist)", "Geist", "sans-serif"],
      },
      fontSize: {
        "label-micro": ["9px", { lineHeight: "12px", letterSpacing: "0.2em", fontWeight: "400" }],
        "body-md": ["14px", { lineHeight: "22px", letterSpacing: "0em", fontWeight: "400" }],
        "label-technical": ["11px", { lineHeight: "14px", letterSpacing: "0.14em", fontWeight: "400" }],
        "headline-md": ["24px", { lineHeight: "30px", letterSpacing: "-0.02em", fontWeight: "500" }],
        "display-hero-mobile": ["36px", { lineHeight: "42px", letterSpacing: "-0.03em", fontWeight: "400" }],
        "display-hero": ["64px", { lineHeight: "72px", letterSpacing: "-0.04em", fontWeight: "400" }],
        "headline-lg": ["32px", { lineHeight: "38px", letterSpacing: "-0.03em", fontWeight: "500" }],
        "body-lg": ["16px", { lineHeight: "26px", letterSpacing: "-0.01em", fontWeight: "400" }],
        "body-sm": ["12px", { lineHeight: "18px", letterSpacing: "0.01em", fontWeight: "400" }],
        "headline-sm": ["18px", { lineHeight: "24px", letterSpacing: "-0.015em", fontWeight: "500" }],
      },
      spacing: {
        "space-xs": "0.25rem",
        "space-sm": "0.5rem",
        "space-md": "1rem",
        "space-lg": "1.5rem",
        "space-xl": "2.5rem",
        "space-2xl": "4rem",
        gutter: "1.5rem",
        "gutter-mobile": "1rem",
        margin: "3rem",
        "margin-mobile": "1.25rem",
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-subtle": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.85" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-subtle": "pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
