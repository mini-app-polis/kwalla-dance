import tailwind from "@astrojs/tailwind";
import { defineConfig } from "astro/config";

// Static output. There is no server runtime, no database, and no API.
// The one piece of live data (Kristen's calendar) is fetched at BUILD time
// and baked into the HTML — see src/lib/calendar.ts.
//
// That means a new event on her phone does not appear until the next build.
// .github/workflows/rebuild.yml pings a Cloudflare deploy hook on a schedule
// to close that gap. See TODO.md.
export default defineConfig({
  site: "https://kristenwallace.com",
  output: "static",
  integrations: [tailwind()],
});
