/**
 * Meadow — palette tokens for kristenwallace.com
 *
 * Contrast verified against WCAG 2.1 AA (4.5:1 for body text):
 *   ink   on paper ........ 11.19:1  AAA
 *   muted on paper .........  5.11:1  AA
 *   sage.ink on sage .......  5.23:1  AA
 *   clay.ink on clay .......  5.43:1  AA
 *   clay  on paper (link) ..  4.62:1  AA
 *
 * Do not lighten `sage` past #627358 — below that it stops carrying body
 * text at AA, and it starts reading as a wellness template rather than an
 * editorial field. Do not lighten `clay` past #A6522F; the earlier value
 * (#B8674A) failed at 4.14:1 on white.
 *
 * NOTE: typography is provisional. Bricolage/Instrument were held constant
 * across the palette studies as a control, not chosen for this brief.
 *
 * @type {import('tailwindcss').Config}
 */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F5F3EA",
        surface: "#E9E7DB",
        card: "#FFFFFF",
        ink: "#2F362E",
        muted: "#5F675C",

        sage: {
          DEFAULT: "#5A6A51",
          ink: "#F5F3EA",
          muted: "#C3CCBB",
        },

        clay: {
          DEFAULT: "#A6522F",
          ink: "#FFFFFF",
        },

        line: "rgba(47, 54, 46, 0.16)",
        rule: "rgba(47, 54, 46, 0.28)",
        chip: "rgba(47, 54, 46, 0.07)",
      },

      fontFamily: {
        display: ["Bricolage Grotesque", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["Instrument Sans", "ui-sans-serif", "system-ui", "sans-serif"],
      },

      fontSize: {
        eyebrow: ["0.656rem", { lineHeight: "1", letterSpacing: "0.18em" }],
        lede: ["0.906rem", { lineHeight: "1.65" }],
        hero: ["clamp(2.375rem, 5.6vw, 3.875rem)", { lineHeight: "0.95", letterSpacing: "-0.035em" }],
      },

      borderRadius: {
        // Sage plus pill buttons plus soft shadows reads as a wellness
        // template. Keeping corners tight is what prevents that.
        DEFAULT: "3px",
        none: "0",
        full: "9999px",
      },

      boxShadow: {
        // Deliberately minimal. Meadow separates surfaces with value and
        // hairline rules, not elevation.
        hair: "0 1px 0 rgba(47, 54, 46, 0.08)",
      },

      maxWidth: {
        lede: "34ch",
        prose: "64ch",
      },
    },
  },
  plugins: [],
};
