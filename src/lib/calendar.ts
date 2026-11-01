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
import { logger } from "./logger";

export type { CalendarEvent, DisplayEvent } from "./ics";
export { formatDateRange } from "./ics";

/**
 * Returns the events to bake into the HTML, plus whether they actually came
 * from the calendar.
 *
 * `status` is the honest answer to "did the feed work", and the component uses
 * it for the little label in the section header. Do not infer that from the
 * presence of PUBLIC_CALENDAR_ICS_URL — a configured URL that 404s would
 * happily claim the list was straight from her calendar when it was not.
 *
 * Never throws. A failed fetch, an unreachable feed, or malformed ICS all
 * degrade to the seed list, because a calendar outage should not fail a build
 * whose real job is the booking button.
 */
export async function getUpcomingEvents(
  limit = 6,
): Promise<{ status: "live" | "seed"; events: DisplayEvent[] }> {
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
        // permissions do not include "Make available to public", not that
        // the URL is wrong. Say so, because the two look identical otherwise.
        logger.warn({
          event: "calendar_feed_not_public",
          category: "data",
          context: {
            status: 404,
            message:
              "Google returned 404 — the calendar is probably not public. Using seed events.",
          },
        });
      } else {
        logger.warn({
          event: "calendar_feed_failed",
          category: "data",
          context: { status: res.status, message: "Using seed events." },
        });
      }
    } catch (err) {
      logger.warn({
        event: "calendar_fetch_failed",
        category: "data",
        context: { message: "Using seed events." },
        error: err,
      });
    }
  } else {
    // The single most common local symptom is a page full of seed events with
    // no explanation. Astro reads .env, never .env.example, so a fresh clone
    // has no feed URL at all until someone copies one across.
    logger.warn({
      event: "calendar_feed_url_missing",
      category: "infra",
      context: {
        message:
          "PUBLIC_CALENDAR_ICS_URL is not set — copy .env.example to .env for local dev. Using seed events.",
      },
    });
  }

  return {
    status: icsText ? "live" : "seed",
    events: buildEventList(icsText, site.seedEvents, limit),
  };
}
