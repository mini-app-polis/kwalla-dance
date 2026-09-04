import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

// Static output, and it stays that way. No database, no adapter, no SSR.
//
// The one piece of live data — Kristen's calendar — is handled in two passes.
// It is fetched at BUILD time and baked into the HTML (src/lib/calendar.ts),
// then refreshed in the browser from /api/calendar, a Cloudflare Pages Function
// at functions/api/calendar.ts. Pages compiles anything under /functions by
// itself, which is why going live cost no adapter and no change to this file.
//
// So a new event on her phone appears within the endpoint's cache window
// without a rebuild, and the baked copy is the floor underneath that: it is
// what crawlers index, what a no-JS visitor sees, and what paints first.
//
// Tailwind is wired in as a Vite plugin, not an Astro integration. The
// @astrojs/tailwind integration is abandoned — 6.0.2 is its last release and it
// peers on astro ^3 || ^4 || ^5, so keeping it would have pinned this site to
// Astro 5. @tailwindcss/vite is Tailwind 4's own first-party entry point and
// carries no Astro peer at all.
export default defineConfig({
  site: "https://kristenwallace.com",
  output: "static",
  vite: {
    plugins: [tailwindcss()],
  },
});
