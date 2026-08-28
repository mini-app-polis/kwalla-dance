/**
 * All site content lives in this one file.
 *
 * If Kristen wants to change a word, a price, or a photo, this is the only
 * file she needs to open. Nothing else in src/ contains copy.
 */

export type FindLink = {
  /** Picks the icon in FindMe.astro. Add a new id there before using it here. */
  id: "facebook" | "instagram" | "youtube";
  name: string;
  /** The handle as it reads on that platform, shown under the name. */
  handle: string;
  blurb: string;
  href: string;
  /** Text of the link out, e.g. "Follow on Instagram". */
  cta: string;
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
  /**
   * Recurring items the ICS parser cannot expand — see lib/ics.ts. These are
   * pinned above anything coming from the feed.
   */
  recurring?: boolean;
  /** Free-text override for the date column, e.g. "Tuesdays". */
  dateLabel?: string;
};

export type GalleryImage = {
  src: string;
  alt: string;
};

/**
 * Where she is based. Austin is home; the travelling is the other half of the
 * story, which is why it is a second string rather than baked into `home` —
 * the eyebrow needs the short form, prose needs the long one.
 *
 * Defined here and used everywhere (eyebrow, footer, meta description) so a
 * move is a one-line change instead of a hunt through components.
 */
const home = "Austin, TX";
const reach = "travelling to events year-round";

export const site = {
  name: "Kristen Wallace",
  home,
  reach,
  eyebrow: `West Coast Swing · ${home}`,

  // TODO: replace with Kristen's own words. This is the single most important
  // paragraph on the site and it should sound like her, not like a template.
  /**
   * What she does, in her own order. This is the single source for the tagline:
   * the hero paragraph reads it, and so do the meta description and the
   * structured data in Base.astro. Change it here and it changes everywhere.
   */
  services: [
    "Private lessons",
    "Group lessons",
    "Competition judging",
    "Social DJing",
  ],

  lede:
    "Private lessons, group lessons, competition judging, and social DJing — " +
    "in Austin and wherever the dancing takes me. Booking is one click away " +
    "on my Calendly; if a slot looks open, it's open.",

  // TODO: confirm domain. Nothing depends on this except canonical/OG tags.
  url: "https://kristenwallace.com",

  /** Footer links. Kept in sync with `findMe` below by hand — it is four lines. */
  social: [
    { label: "Facebook", href: "https://www.facebook.com/kristen.wallace.771/" },
    { label: "Instagram", href: "https://www.instagram.com/kwalla.bear/" },
    { label: "YouTube", href: "https://www.youtube.com/@kwalla" },
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

  /**
   * Where to find Kristen. Three is the right number — one per platform she
   * actually posts on. Adding a fourth card breaks the row on desktop.
   */
  findMe: [
    {
      id: "facebook",
      name: "Facebook",
      handle: "Kristen Wallace",
      blurb: "Event announcements, weekend plans, and where the dancing is.",
      href: "https://www.facebook.com/kristen.wallace.771/",
      cta: "Find me on Facebook",
    },
    {
      id: "instagram",
      name: "Instagram",
      handle: "@kwalla.bear",
      blurb: "Clips from the floor, day to day, and the occasional koala.",
      href: "https://www.instagram.com/kwalla.bear/",
      cta: "Follow on Instagram",
    },
    {
      id: "youtube",
      name: "YouTube",
      handle: "@kwalla",
      blurb: "Full routines and comp footage, start to finish.",
      href: "https://www.youtube.com/@kwalla",
      cta: "Watch on YouTube",
    },
  ] satisfies FindLink[],

  /**
   * The highlights playlist, embedded on the page. `playlistId` is the value
   * after `list=` in the YouTube URL — everything else is derived from it,
   * so swapping playlists is a one-line change.
   */
  highlights: {
    heading: "Highlights",
    blurb:
      "A running playlist of routines and competition footage. It plays here, " +
      "or opens on YouTube if you would rather have it full screen.",
    playlistId: "PLF3UGw0Z2hSkV8Gbj1bwfFQB3r-bQug0b",
  },

  /**
   * Hand-written entries, merged with whatever comes off the Google Calendar.
   *
   * Empty on purpose. The calendar is the source of truth for "Where I'll be",
   * so anything listed here shows up on the live site whether or not the feed
   * is working — which is exactly how a placeholder ends up shipping. Add an
   * entry only when you mean it to be permanent.
   *
   * Two things this is still for:
   *
   *  - Recurring items. `recurring: true` pins an entry above the feed events
   *    and lets you write a free-text date ("Tuesdays"). The ICS parser does
   *    not expand RRULE, so a weekly class defined on the calendar will not
   *    repeat here — see the note in README.md.
   *  - A fallback list, shown if the feed is ever unreachable. With this array
   *    empty, an outage shows the "nothing on the calendar right now" copy in
   *    Calendar.astro instead, which is the honest answer.
   *
   * Example:
   *   { start: "2026-09-25", end: "2026-09-28", name: "Autumn Swing Classic",
   *     tag: "Competing", location: "Chicago, IL" },
   */
  seedEvents: [] satisfies SeedEvent[],

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
