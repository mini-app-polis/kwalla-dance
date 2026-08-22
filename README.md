# kristenwallace.com

Single-page site for Kristen Wallace — West Coast Swing instruction, event
coaching, and video review.

## Running it

```bash
npm install
npm run dev      # http://localhost:4321
npm run build
npm run preview
```

Node 20+.

`astro dev` does **not** serve `/api/calendar` — Pages Functions are not part
of the Astro dev server. The page falls back to its build-time list, which is
usually what you want while working on styling. To exercise the live endpoint:

```bash
npm run build
npx wrangler pages dev dist
```

## Where things are

```
src/data/site.ts        All copy, prices, and seed events. The only file
                        you need to open to change what the page says.
src/lib/ics.ts          ICS parsing and list assembly. Shared by the build
                        and the live endpoint — keep it portable.
src/lib/calendar.ts     Build-time fetch of the public Google Calendar feed.
functions/api/calendar.ts
                        Cloudflare Pages Function behind /api/calendar. The
                        live half.
src/components/         One component per page section.
src/styles/global.css   Base styles + the koala opacity scale.
tailwind.config.mjs     The Meadow palette. Read the header comment before
                        changing any colour.
TODO.md                 Launch checklist.
```

## Architecture, in one paragraph

Static Astro site on Cloudflare Pages. No database, no adapter, no SSR.
Booking is a link out to Calendly, which owns availability, confirmations, and
reminders; the site never manages any of it.

The "Where I'll be" list is **live**. It renders twice:

1. At build time, baked into the HTML by `src/lib/calendar.ts`. This is what
   crawlers index, what a visitor with JavaScript off sees, and what paints
   before any network request.
2. In the browser, from `/api/calendar` — a Cloudflare Pages Function in
   `functions/api/calendar.ts` that re-fetches the feed on request. This is
   what makes a new event show up without a rebuild.

Both call `buildEventList` in `src/lib/ics.ts`, so the two renderings cannot
disagree about ordering or date formatting. The browser only overwrites the
list when the endpoint reports genuinely live data; if it is slow, erroring, or
absent, the baked list simply stays. There is no spinner and no error state
because the visitor never sees a page worse than the one that already painted.

The function exists for exactly one reason: Google's `.ics` endpoint sends no
CORS headers, so the page cannot fetch the feed directly. Everything else about
the site stayed static.

**Caching lives in exactly one place**, and it should stay that way. The
endpoint sends `max-age=0, s-maxage=60`: browsers must ask every time, and
Cloudflare's edge answers from a copy at most a minute old. Giving the browser
a non-zero `max-age` is tempting and wrong — a reload does *not* bypass the
browser's HTTP cache, so someone who just added an event and refreshed would
sit looking at a stale list. Tune freshness via `EDGE_TTL_SECONDS`, never
`BROWSER_TTL_SECONDS`.

The calendar is Google, not iCloud. The feed URL is the "Public address in
iCal format" from **Settings for my calendars → Integrate calendar**, and it
only resolves while that calendar's Access permissions include **Make
available to public**. Turn that off and both halves fall back to the seed
events in `site.ts` — `calendar.ts` logs a specific warning for the 404 so it
is findable in the build log.

## Two things that will bite you

**Colour floors.** `sage` cannot go lighter than `#627358` and `clay` cannot
go lighter than `#A6522F` without dropping below WCAG AA. Those values are
also roughly where the palette starts looking like a stock wellness template,
so the accessibility floor and the taste floor happen to coincide. Ratios are
documented in the `tailwind.config.mjs` header.

**Recurring events.** `src/lib/ics.ts` does not expand `RRULE`. Google emits a
recurring event as a single VEVENT carrying a recurrence rule, so a weekly
class renders exactly once, on its first occurrence. Recurring items belong in
`seedEvents` in `site.ts` instead — those are pinned to the top of the list,
above anything from the feed. This is deliberate: expanding recurrence rules
correctly is a genuinely hard problem and this site does not need it.

## Deploying

Cloudflare Pages, connected to this repo. Build command `npm run build`,
output directory `dist`. Environment variables live in `wrangler.toml`.

`/functions` needs no configuration — Cloudflare Pages compiles it
automatically and routes `/api/calendar` to it.

Calendar changes no longer need a deploy at all; they arrive through the
endpoint. The scheduled rebuild in `.github/workflows/rebuild.yml` now serves
only to keep the *baked fallback* from drifting, so it runs once a day rather
than twice. It stays inert until the repo secret `CLOUDFLARE_DEPLOY_HOOK`
exists.
