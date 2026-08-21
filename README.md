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

## Where things are

```
src/data/site.ts        All copy, prices, and seed events. The only file
                        you need to open to change what the page says.
src/lib/calendar.ts     Fetches and parses Kristen's public Google Calendar
                        iCal feed.
src/components/         One component per page section.
src/styles/global.css   Base styles + the koala opacity scale.
tailwind.config.mjs     The Meadow palette. Read the header comment before
                        changing any colour.
TODO.md                 Launch checklist.
```

## Architecture, in one paragraph

Static Astro site on Cloudflare Pages. No database, no API, no server
runtime. Booking is a link out to Calendly, which owns availability,
confirmations, and reminders; the site never manages any of it. The "Where
I'll be" list is fetched from the public iCal feed of a Google Calendar **at
build time** and baked into the HTML, with a scheduled deploy hook to pick up
changes. If the feed is unreachable the page falls back to seed events in
`site.ts` and still builds correctly — a calendar outage should never take
down a page whose actual job is the booking button.

The calendar is Google, not iCloud. The feed URL is the "Public address in
iCal format" from **Settings for my calendars → Integrate calendar**, and it
only resolves while that calendar's Access permissions include **Make
available to public**. Turn that off and every build silently falls back to
seed events — `calendar.ts` logs a specific warning for the 404 so it is
findable in the build log.

## Two things that will bite you

**Colour floors.** `sage` cannot go lighter than `#627358` and `clay` cannot
go lighter than `#A6522F` without dropping below WCAG AA. Those values are
also roughly where the palette starts looking like a stock wellness template,
so the accessibility floor and the taste floor happen to coincide. Ratios are
documented in the `tailwind.config.mjs` header.

**Recurring events.** `src/lib/calendar.ts` does not expand `RRULE`. A weekly
class defined as a recurring calendar event renders exactly once, on its
first occurrence. Recurring items belong in `seedEvents` in `site.ts`
instead. This is deliberate — expanding recurrence rules correctly is a
genuinely hard problem and this site does not need it.

## Deploying

Cloudflare Pages, connected to this repo. Build command `npm run build`,
output directory `dist`. Environment variables live in `wrangler.toml`.

To pick up calendar changes without pushing a commit, create a Cloudflare
deploy hook and store its URL as the repo secret `CLOUDFLARE_DEPLOY_HOOK`.
`.github/workflows/rebuild.yml` handles the rest.
