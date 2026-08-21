/**
 * Build-time half of the calendar.
 *
 * The list is rendered twice by design:
 *
 *   1. Here, during `astro build`, so the HTML that ships already contains the
 *      events. That is what search engines index, what a visitor with
 *      JavaScript off sees, and what paints before any network request.
 *   2. Live in the browser, from /api/calendar, which re-fetches the feed on
 *      request. See functions/api/calendar.ts and the script in
 *      src/components/Calendar.astro.
 *
 * Step 2 is the one that makes the site automatic — a new event on Kristen's
 * calendar shows up without a rebuild. Step 1 is the floor underneath it: if
 * the endpoint is slow, blocked, or broken, the page still reads correctly.
 *
 * Both call `buildEventList` in src/lib/ics.ts, so the two renderings cannot
 * disagree about ordering or date formatting.
 *
 * The feed is that calendar's "Public address in iCal format": Google Calendar
 * → Settings for my calendars → <calendar> → Integrate calendar. It only
 * resolves once the calendar is set to "Make available to public" under Access
 * permissions — without that Google answers 404 and both halves fall back to
 * the seed events in src/data/site.ts.
 */

import { site } from "../data/site";
import { buildEventList, normaliseUrl, type DisplayEvent } from "./ics";

export type { CalendarEvent, DisplayEvent } from "./ics";
export { formatDateRange } from "./ics";

/**
 * Returns the events to bake into the HTML. Never throws — a failed fetch, an
 * unreachable feed, or malformed ICS all degrade to the seed list, because a
 * calendar outage should not fail a build whose real job is the booking button.
 */
export async function getUpcomingEvents(limit = 6): Promise<DisplayEvent[]> {
  const feedUrl = import.meta.env.PUBLIC_CALENDAR_ICS_URL;
  let icsText: string | null = null;

  if (feedUrl) {
    try {
      const res = await fetch(normaliseUrl(feedUrl), {
        headers: { Accept: "text/calendar" },
      });
      if (res.ok) {
        icsText = await res.text();
      } else if (res.status === 404) {
        // Google's 404 here almost always means the calendar's Access
        // permissions no longer include "Make available to public", not that
        // the URL is wrong. Say so, because the two look identical otherwise.
        console.warn(
          "[calendar] Google returned 404 — the calendar is probably no longer " +
            "public. Using seed events.",
        );
      } else {
        console.warn(`[calendar] feed returned ${res.status}; using seed events`);
      }
    } catch (err) {
      console.warn("[calendar] fetch failed; using seed events:", err);
    }
  }

  return buildEventList(icsText, site.seedEvents, limit);
}
