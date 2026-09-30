import type { Config } from "tailwindcss";

/**
 * Configuration Tailwind — Charte graphique officielle du CCJP
 * (Conseil Consultatif des Jeunes de Podor)
 *
 * Voir PLAN_IMPLEMENTATION.md §4 « Charte graphique ».
 */
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ccjp: {
          /** Couleur principale — boutons, en-têtes, titres de section */
          vert: "#1B5E20",
          /** Accent principal — CTA, badges, soulignements */
          or: "#F9A825",
          /** Accent secondaire — alertes, suppression */
          rouge: "#C62828",
          /** Textes et fonds sombres — navbar, footer */
          marine: "#1A3A5C",
          /** Fonds de sections alternées */
          creme: "#F5F0E8",
          /** Fond de page */
          beige: "#FAF7F2",
        },
        /**
         * Couleurs des 14 commissions (PLAN_IMPLEMENTATION.md §8).
         * marine : 01, 03, 05, 10, 13, 14
         * vert   : 02, 08, 09, 11, 12
         * brun   : 04, 06, 07
         */
        commission: {
          marine: "#1A3A5C",
          vert: "#1B5E20",
          brun: "#7B3F00",
        },
      },
      fontFamily: {
        // Polices auto-hébergées via @fontsource (importées dans globals.css).
        // Aucune dépendance à un CDN externe au moment du build.
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ['"Playfair Display"', "Georgia", "serif"],
      },
      boxShadow: {
        card: "0 2px 12px rgba(26, 58, 92, 0.08)",
        hover: "0 4px 18px rgba(26, 58, 92, 0.14)",
      },
      borderRadius: {
        card: "10px",
      },
      backgroundImage: {
        "ccjp-divider": "linear-gradient(to right, #1B5E20, #F9A825, #C62828)",
        "ccjp-hero": "linear-gradient(135deg, #1A3A5C 0%, #1B5E20 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
