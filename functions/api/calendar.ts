/**
 * GET /api/calendar — the live "Where I'll be" list.
 *
 * A Cloudflare Pages Function, which is the only moving part this feature
 * adds. It exists for one reason: Google's .ics endpoint sends no CORS
 * headers, so the browser cannot fetch the feed directly. This runs the fetch
 * server-side at the edge and hands back JSON the page can render.
 *
 * It returns rows already formatted for display, assembled by the same
 * `buildEventList` the build uses, so the live list and the baked-in fallback
 * are byte-identical in shape and ordering.
 *
 * Deployment: Cloudflare Pages picks up /functions automatically. There is no
 * adapter to configure, no key to manage, and `output: "static"` in
 * astro.config.mjs stays exactly as it is.
 *
 * Note for local dev: `astro dev` does not serve this route, so the page keeps
 * its build-time list and logs nothing. Use `npx wrangler pages dev dist` to
 * exercise the real thing.
 */

import { site } from "../../src/data/site";
import { buildEventList, normaliseUrl } from "../../src/lib/ics";

type Env = {
  /** Set in wrangler.toml [vars]. */
  PUBLIC_CALENDAR_ICS_URL?: string;
};

/**
 * How long the edge may serve a stored copy. Google caches the public ICS on
 * its own side anyway, so polling harder than this mostly re-fetches an
 * identical body. Fifteen minutes keeps the site comfortably fresh for
 * announcing an event weekend without hammering anyone.
 */
const EDGE_TTL_SECONDS = 900;

/** Shorter, so a visitor who leaves a tab open does not sit on a stale list. */
const BROWSER_TTL_SECONDS = 300;

export async function onRequestGet(context: {
  request: Request;
  env: Env;
  waitUntil: (promise: Promise<unknown>) => void;
}): Promise<Response> {
  const { request, env } = context;

  // `caches.default` is a Workers extension and is absent under plain Node,
  // so treat it as optional rather than assuming the runtime provides it.
  const cache: Cache | undefined = (globalThis as any).caches?.default;
  const cacheKey = new Request(new URL(request.url).toString(), {
    method: "GET",
  });

  if (cache) {
    const hit = await cache.match(cacheKey);
    if (hit) return hit;
  }

  const feedUrl = env.PUBLIC_CALENDAR_ICS_URL;
  let icsText: string | null = null;
  let status: "live" | "seed" = "seed";

  if (feedUrl) {
    try {
      const upstream = await fetch(normaliseUrl(feedUrl), {
        headers: { Accept: "text/calendar" },
      });
      if (upstream.ok) {
        icsText = await upstream.text();
        status = "live";
      }
      // Any non-OK response falls through to the seed events below. A 404 here
      // almost always means the calendar's Access permissions no longer include
      // "Make available to public" rather than a wrong URL.
    } catch {
      // Network failure upstream. Same fallback.
    }
  }

  const events = buildEventList(icsText, site.seedEvents, 6);

  const response = Response.json(
    { status, events },
    {
      headers: {
        "cache-control": `public, max-age=${BROWSER_TTL_SECONDS}, s-maxage=${EDGE_TTL_SECONDS}`,
      },
    },
  );

  // Only store a genuinely live answer. Caching the seed fallback for fifteen
  // minutes would turn a momentary blip at Google into a visible outage.
  if (cache && status === "live") {
    context.waitUntil?.(cache.put(cacheKey, response.clone()));
  }

  return response;
}
