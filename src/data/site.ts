/**
 * All site content lives in this one file.
 *
 * If Kristen wants to change a word, a price, or a photo, this is the only
 * file she needs to open. Nothing else in src/ contains copy.
 *
 * Anything marked TODO is a placeholder written to be structurally correct
 * but factually invented. Replace before launch.
 */

export type SessionType = {
  id: string;
  name: string;
  blurb: string;
  price: string;
  duration: string;
  /** Cal.com event-type slug, e.g. "private-60". Empty = button disabled. */
  calSlug: string;
};

export type SeedEvent = {
  /** ISO date, YYYY-MM-DD. */
  start: string;
  /** ISO date, inclusive. Omit for single-day events. */
  end?: string;
  name: string;
  /** Short label: Teaching, Competing, Drop-in, DJing... */
  tag: string;
  location: string;
  /** Recurring items the ICS parser cannot expand. See lib/calendar.ts. */
  recurring?: boolean;
  /** Free-text override for the date column, e.g. "Tuesdays". */
  dateLabel?: string;
};

export const site = {
  name: "Kristen Wallace",
  // TODO: confirm how she wants to be described. "Instructor" vs "coach" vs
  // just the location line. This sits directly above her name in the hero.
  eyebrow: "West Coast Swing · Minneapolis",

  // TODO: replace with Kristen's own words. This is the single most important
  // paragraph on the site and it should sound like her, not like a template.
  // Two or three sentences. What she teaches, who she teaches, and one
  // specific thing that is true of her lessons and not of everyone else's.
  lede:
    "Private lessons in the Twin Cities, coaching at events, and video review " +
    "for competitors. Booking runs straight off my calendar — if a slot looks " +
    "open, it's open.",

  // TODO: confirm domain. Nothing depends on this except canonical/OG tags.
  url: "https://kristenwallace.com",

  // TODO: real contact address, or delete and rely on the booking form.
  email: "hello@kristenwallace.com",

  social: [
    // TODO: fill in or delete. Empty array renders nothing.
    // { label: "Instagram", href: "https://instagram.com/..." },
  ] as { label: string; href: string }[],

  /** Cal.com username, e.g. "kristenwallace". Empty = booking is a mailto. */
  calUsername: "", // TODO

  about: {
    heading: "About",
    // TODO: Kristen's bio. Suggested shape — how she started, what she's
    // competed in or won, what she cares about teaching. Three short
    // paragraphs maximum. Long bios do not get read.
    paragraphs: [
      "TODO: How Kristen got into West Coast Swing, in her own voice.",
      "TODO: Competitive and teaching background — divisions, results, where she's taught.",
      "TODO: What she actually cares about in a lesson. This is the paragraph people decide on.",
    ],
    // TODO: swap for a real photo. See public/images/README.md for what to shoot.
    photo: "/images/portrait.jpg",
    photoAlt: "TODO: describe the photo for screen readers",
  },

  sessions: [
    {
      id: "private-60",
      name: "Private lesson",
      // TODO: confirm blurb and whether couples are priced differently.
      blurb: "60 minutes, one-on-one or as a couple.",
      price: "TODO", // TODO: e.g. "$95"
      duration: "60 min",
      calSlug: "private-60",
    },
    {
      id: "tuneup-30",
      name: "Tune-up",
      blurb: "30 minutes on one thing — a pattern, a habit, a routine section.",
      price: "TODO",
      duration: "30 min",
      calSlug: "tuneup-30",
    },
    {
      id: "video-review",
      name: "Video review",
      blurb: "Send a comp video, get it back marked up with notes and drills.",
      price: "TODO",
      duration: "Remote",
      calSlug: "video-review",
    },
  ] satisfies SessionType[],

  /**
   * Fallback events, used when PUBLIC_CALENDAR_ICS_URL is empty or the fetch
   * fails at build time. Also the right home for recurring items — the ICS
   * parser deliberately does not expand RRULE, so a weekly class belongs here
   * rather than on the synced calendar.
   */
  seedEvents: [
    {
      start: "2026-08-28",
      end: "2026-08-31",
      name: "TODO: event name",
      tag: "Teaching",
      location: "Minneapolis, MN",
    },
    {
      start: "2026-09-25",
      end: "2026-09-28",
      name: "TODO: event name",
      tag: "Competing",
      location: "TODO",
    },
    {
      start: "2026-01-01",
      name: "TODO: weekly class name",
      tag: "Drop-in",
      location: "TODO: venue",
      recurring: true,
      dateLabel: "Tuesdays",
    },
  ] satisfies SeedEvent[],

  /**
   * Koala placements. Four is the right number — enough that finding one
   * suggests there are others, few enough that the page stays quiet.
   * Opacities are tuned per context in global.css, not set here.
   */
  koalas: {
    hero: true,
    band: true,
    calendar: true,
    footer: true,
  },
};

export type Site = typeof site;
