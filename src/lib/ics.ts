/**
 * ICS parsing, shared by the build and the live endpoint.
 *
 * This module is deliberately dependency-free and environment-free: no Astro
 * imports, no `import.meta.env`, no Node built-ins. That is what lets the same
 * code run during `astro build` and inside the Cloudflare Pages Function at
 * functions/api/calendar.ts, which in turn is what guarantees the live list and
 * the baked-in fallback list can never disagree about formatting or ordering.
 *
 * If you add something here, keep it portable. The moment this file imports
 * anything platform-specific, the two renderers drift.
 *
 * KNOWN LIMITATIONS, all intentional:
 *
 *  - RRULE is not expanded. Google emits a recurring event as one VEVENT
 *    carrying an RRULE, so a weekly class would render once, on its first
 *    occurrence. Recurring items go in `seedEvents` in src/data/site.ts.
 *  - TZID is read but not resolved against a timezone database. Times are
 *    treated as wall-clock local. Since this list only ever displays dates,
 *    not times, that is not observable — but it would be if the design ever
 *    shows "7:00 PM".
 */

export type CalendarEvent = {
  start: Date;
  end: Date;
  allDay: boolean;
  name: string;
  location: string;
  tag: string;
  dateLabel?: string;
  recurring?: boolean;
};

/**
 * A row, ready to render. The date is already a string — formatting happens
 * once, wherever the events were assembled, so the browser never needs a copy
 * of the date logic.
 */
export type DisplayEvent = {
  dateLabel: string;
  name: string;
  tag: string;
  location: string;
};

/**
 * Structural shape of a seed event. Matches `SeedEvent` in src/data/site.ts
 * without importing it, so this module stays free of content dependencies.
 */
export type SeedInput = {
  start: string;
  end?: string;
  name: string;
  tag: string;
  location: string;
  recurring?: boolean;
  dateLabel?: string;
};

/**
 * Google's Integrate-calendar panel gives an https:// .ics address, but the
 * same URL gets handed around in webcal:// form by calendar apps and by
 * Google's own "subscribe" links. fetch() does not know that scheme, so
 * normalise it rather than making whoever pastes the URL care which form they
 * happened to copy.
 */
export function normaliseUrl(raw: string): string {
  return raw.trim().replace(/^webcal:\/\//i, "https://");
}

/**
 * ICS folds long lines at 75 octets, continuing them with a leading space or
 * tab. Unfold before doing anything else or property values get truncated
 * mid-word.
 */
function unfold(raw: string): string[] {
  const lines = raw.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  for (const line of lines) {
    if ((line.startsWith(" ") || line.startsWith("\t")) && out.length > 0) {
      out[out.length - 1] += line.slice(1);
    } else {
      out.push(line);
    }
  }
  return out;
}

function unescapeText(value: string): string {
  return value
    .replace(/\\n/gi, " ")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\\\\/g, "\\")
    .trim();
}

/**
 * Handles the three DTSTART/DTEND forms Google emits:
 *   DTSTART;VALUE=DATE:20260828                  (all-day)
 *   DTSTART:20260828T190000Z                     (UTC)
 *   DTSTART;TZID=America/Chicago:20260828T190000 (local wall time)
 */
function parseDate(value: string, params: string): { date: Date; allDay: boolean } | null {
  const allDay = /VALUE=DATE(?!-TIME)/i.test(params) || /^\d{8}$/.test(value);

  const m = value.match(
    /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?$/,
  );
  if (!m) return null;

  const [, y, mo, d, hh = "0", mm = "0", ss = "0", utc] = m;
  const nums = [y, mo, d, hh, mm, ss].map(Number) as [
    number, number, number, number, number, number,
  ];

  const date = utc
    ? new Date(Date.UTC(nums[0], nums[1] - 1, nums[2], nums[3], nums[4], nums[5]))
    : new Date(nums[0], nums[1] - 1, nums[2], nums[3], nums[4], nums[5]);

  if (Number.isNaN(date.getTime())) return null;
  return { date, allDay };
}

/**
 * Infers the Teaching / Competing / DJing label from the event title, since
 * the ICS feed has nowhere to put a structured tag.
 *
 * Kristen controls this by how she names the event: putting "teaching" or
 * "comp" anywhere in the title is enough. Anything unmatched falls back to a
 * neutral label rather than guessing wrong.
 */
function inferTag(summary: string): string {
  const s = summary.toLowerCase();
  if (/\bteach|workshop|camp\b/.test(s)) return "Teaching";
  if (/\bcomp|competing|jack|strictly|classic\b/.test(s)) return "Competing";
  if (/\bdj|deejay\b/.test(s)) return "DJing";
  if (/\bclass|drop-?in\b/.test(s)) return "Drop-in";
  return "Attending";
}

export function parseIcs(raw: string): CalendarEvent[] {
  const lines = unfold(raw);
  const events: CalendarEvent[] = [];

  let current: Record<string, { value: string; params: string }> | null = null;

  for (const line of lines) {
    if (line === "BEGIN:VEVENT") {
      current = {};
      continue;
    }
    if (line === "END:VEVENT") {
      if (current) {
        const built = buildEvent(current);
        if (built) events.push(built);
      }
      current = null;
      continue;
    }
    if (!current) continue;

    const colon = line.indexOf(":");
    if (colon === -1) continue;

    const rawKey = line.slice(0, colon);
    const value = line.slice(colon + 1);
    const semi = rawKey.indexOf(";");
    const key = (semi === -1 ? rawKey : rawKey.slice(0, semi)).toUpperCase();
    const params = semi === -1 ? "" : rawKey.slice(semi + 1);

    current[key] = { value, params };
  }

  return events;
}

function buildEvent(
  props: Record<string, { value: string; params: string }>,
): CalendarEvent | null {
  const dtstart = props["DTSTART"];
  if (!dtstart) return null;

  const start = parseDate(dtstart.value, dtstart.params);
  if (!start) return null;

  const dtend = props["DTEND"];
  const parsedEnd = dtend ? parseDate(dtend.value, dtend.params) : null;

  let end = parsedEnd?.date ?? new Date(start.date);

  // All-day DTEND is exclusive per RFC 5545 — a single-day event on the 28th
  // ends on the 29th. Pull it back a day so ranges display as a human reads
  // them, otherwise every event gains a phantom extra day.
  if (start.allDay && parsedEnd) {
    end = new Date(end.getTime() - 24 * 60 * 60 * 1000);
  }

  const name = unescapeText(props["SUMMARY"]?.value ?? "");
  if (!name) return null;

  return {
    start: start.date,
    end,
    allDay: start.allDay,
    name,
    location: unescapeText(props["LOCATION"]?.value ?? ""),
    tag: inferTag(name),
  };
}

function seedToEvent(seed: SeedInput): CalendarEvent {
  const start = new Date(`${seed.start}T00:00:00`);
  const end = seed.end ? new Date(`${seed.end}T00:00:00`) : new Date(start);
  return {
    start,
    end,
    allDay: true,
    name: seed.name,
    location: seed.location,
    tag: seed.tag,
    dateLabel: seed.dateLabel,
    recurring: seed.recurring,
  };
}

/**
 * "AUG 28–31" for a range inside one month, "AUG 28 – SEP 2" across months,
 * "AUG 28" for a single day. Uppercase is applied in CSS, not here.
 */
export function formatDateRange(event: CalendarEvent): string {
  if (event.dateLabel) return event.dateLabel;

  const mon = (d: Date) => d.toLocaleDateString("en-US", { month: "short" });
  const sameDay = event.start.toDateString() === event.end.toDateString();

  if (sameDay) return `${mon(event.start)} ${event.start.getDate()}`;

  if (event.start.getMonth() === event.end.getMonth()) {
    return `${mon(event.start)} ${event.start.getDate()}–${event.end.getDate()}`;
  }

  return `${mon(event.start)} ${event.start.getDate()} – ${mon(event.end)} ${event.end.getDate()}`;
}

/**
 * Assembles the rendered list: recurring seed items first, then upcoming
 * events from the feed in date order.
 *
 * `icsText` null or unparseable falls back to the one-off seed events, so a
 * calendar outage degrades to a correct-looking page rather than an empty one.
 *
 * Both the build and the live endpoint call this, which is the whole point —
 * the list the browser swaps in is assembled by the same code that produced
 * the HTML it is replacing.
 */
export function buildEventList(
  icsText: string | null,
  seeds: SeedInput[],
  limit = 6,
): DisplayEvent[] {
  const recurring = seeds.filter((e) => e.recurring).map(seedToEvent);
  const oneOff = seeds.filter((e) => !e.recurring).map(seedToEvent);

  let fetched: CalendarEvent[] = [];
  if (icsText) {
    try {
      fetched = parseIcs(icsText);
    } catch {
      fetched = [];
    }
  }

  const source = fetched.length > 0 ? fetched : oneOff;

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const upcoming = source
    .filter((e) => e.end >= startOfToday)
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  return [...recurring, ...upcoming].slice(0, limit).map((e) => ({
    dateLabel: formatDateRange(e),
    name: e.name,
    tag: e.tag,
    location: e.location,
  }));
}
