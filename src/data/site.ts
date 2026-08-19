/**
 * All site content lives in this one file.
 *
 * If Kristen wants to change a word, a price, or a photo, this is the only
 * file she needs to open. Nothing else in src/ contains copy.
 */

export type SessionType = {
  id: string;
  name: string;
  blurb: string;
  /** Display price, e.g. "$95". Empty string = only duration is shown. */
  price: string;
  duration: string;
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

export type GalleryImage = {
  src: string;
  alt: string;
};

export const site = {
  name: "Kristen Wallace",
  eyebrow: "West Coast Swing · Minneapolis",

  // TODO: replace with Kristen's own words. This is the single most important
  // paragraph on the site and it should sound like her, not like a template.
  lede:
    "Private lessons in the Twin Cities, coaching at events, and video review " +
    "for competitors. Booking is one click away on my Calendly — if a slot " +
    "looks open, it's open.",

  // TODO: confirm domain. Nothing depends on this except canonical/OG tags.
  url: "https://kristenwallace.com",

  // TODO: real contact address, or delete and rely on the booking link.
  email: "hello@kristenwallace.com",

  social: [
    // TODO: fill in or delete. Empty array renders nothing.
    // { label: "Instagram", href: "https://instagram.com/..." },
  ] as { label: string; href: string }[],

  /** All lesson booking happens here — the site never manages availability. */
  bookingUrl: "https://calendly.com/kwallawcs/",

  hero: {
    photo: "/images/hero.jpeg",
    photoAlt:
      "Kristen mid-dance with a partner on a ballroom floor beneath a chandelier, " +
      "leaning away in a stretched two-hand connection",
  },

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
    photo: "/images/portrait.jpeg",
    photoAlt: "Kristen Wallace smiling outdoors on a sunny sidewalk",
  },

  gallery: [
    {
      src: "/images/performance-01.jpeg",
      alt: "A dramatic dip on stage at The Open Swing Dance Championships",
    },
    {
      src: "/images/performance-02.jpeg",
      alt: "A supported lean mid-routine at Summer Spectacular 2026",
    },
    {
      src: "/images/performance-03.jpeg",
      alt: "Two dancers in a spotlight surrounded by a seated crowd at a West Coast Swing event",
    },
  ] satisfies GalleryImage[],

  sessions: [
    {
      id: "private-60",
      name: "Private lesson",
      // TODO: confirm blurb and whether couples are priced differently.
      blurb: "60 minutes, one-on-one or as a couple.",
      price: "", // TODO: e.g. "$95" — empty shows duration only
      duration: "60 min",
    },
    {
      id: "tuneup-30",
      name: "Tune-up",
      blurb: "30 minutes on one thing — a pattern, a habit, a routine section.",
      price: "", // TODO
      duration: "30 min",
    },
    {
      id: "video-review",
      name: "Video review",
      blurb: "Send a comp video, get it back marked up with notes and drills.",
      price: "", // TODO
      duration: "Remote",
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
