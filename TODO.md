# TODO

Ordered roughly by what blocks what. Nothing here blocks the site from
building — it builds and looks correct today with placeholders in place.

---

## 1. Content — everything lives in `src/data/site.ts`

- [ ] **Lede paragraph.** The three lines under her name. Currently generic.
      This is the single most important paragraph on the site and it should
      sound like Kristen, not like a template. Two or three sentences: what
      she teaches, who she teaches, and one specific thing that is true of her
      lessons and not of everyone else's.
- [ ] **Session names, blurbs, and prices.** All three currently say `TODO`
      for price. Confirm whether couples are priced differently from solo.
- [ ] **About paragraphs.** Three placeholders. The third one — what she
      actually cares about in a lesson — is the one people decide on.
- [ ] **Email address.** Currently `hello@kristenwallace.com`, invented.
- [ ] **Social links.** Empty array renders nothing, which is a fine
      permanent answer if she'd rather not link out.
- [ ] **Booking section copy.** Worth saying what happens *after* booking:
      where lessons are, what to bring, whether to come with a partner.
- [ ] **Domain.** `kristenwallace.com` is assumed in three places
      (`site.ts`, `wrangler.toml`, `astro.config.mjs`).

---

## 2. Photos — see `public/images/README.md`

- [ ] `hero.jpg` — portrait orientation, 4:5.
- [ ] `portrait.jpg` — the About photo, also 4:5.
- [ ] Alt text for both, in `site.ts`.
- [ ] Open Graph image at `public/og/default.png`, 1200×630.

**Lighting matters more than usual here.** Meadow is a paper-based palette
and a dark ballroom shot punches a visible hole in the page. Daylight,
studio, or social-floor-with-ambient-light only. If the only good photos are
stage-lit comp footage, say so — the palette should switch to the darker
variant rather than the photos being forced to work.

- [ ] Re-tune koala opacities against the real photos. The hero value
      (`--koala-hero: 0.06` in `global.css`) was set against a flat gradient
      and will almost certainly need to change over a busy image.

---

## 3. Booking — Cal.com

Cal.com rather than Calendly: Calendly stopped accepting new iCloud Calendar
connections in August 2024, so it cannot read an Apple calendar at all.

- [ ] Kristen creates the Cal.com account. **Her account, her Apple ID, her
      app-specific password.** Do not set this up under someone else's login —
      it is her booking system and she needs to be able to change it without
      asking anyone.
- [ ] Connect Apple Calendar: Settings → Calendars → Add → Apple Calendar,
      then an app-specific password from appleid.apple.com. Worth telling her
      up front that this stores a credential with Cal.com, and that it is
      revocable from her Apple ID page at any time.
- [ ] Create event types with slugs matching `calSlug` in `site.ts`:
      `private-60`, `tuneup-30`, `video-review`.
- [ ] Set `calUsername` in `site.ts`. Until it is set, the booking section
      falls back to a mailto link rather than rendering an empty widget.
- [ ] Set availability windows.
- [ ] **Date overrides for event weekends.** This is the feature that
      actually replaces the DM back-and-forth: open a bookable block only
      during an event, only in the hours she is not teaching workshops.
- [ ] Decide about payment. Recommend *not* solving it in v1 — Venmo or
      in person, and booking is just booking. Cal.com has a Stripe app if she
      wants it later; check whether it's on the free tier before promising.

---

## 4. Calendar feed

- [ ] Kristen creates a **separate** iCloud calendar for public events —
      not her main one. Everything on it becomes world-readable.
- [ ] Make it public: Calendar app → right-click the calendar → Share
      Calendar → Public Calendar → copy the link.
- [ ] Paste into `PUBLIC_CALENDAR_ICS_URL` in `wrangler.toml`.
- [ ] Recurring items (the weekly class) stay in `seedEvents` in `site.ts`.
      The parser deliberately does not expand `RRULE` — a recurring event
      would otherwise render exactly once, on its first occurrence.
- [ ] Tell her the naming convention. The Teaching / Competing / DJing tag is
      inferred from the event title (see `inferTag` in `src/lib/calendar.ts`),
      so putting "teaching" or "comp" anywhere in the name is enough.
      Unmatched titles fall back to "Attending" rather than guessing.

**Caching caveat:** iCloud public feeds are cached hard on Apple's side and
can lag several hours behind what she sees in her Calendar app. Fine for
announcing an event weekend. Not fine for anything same-day.

---

## 5. Deploy

- [ ] Push to GitHub. Repo should be under an account **Kristen can
      eventually own**, or transferable to one.
- [ ] Cloudflare Pages → Connect to Git → build command `npm run build`,
      output directory `dist`.
- [ ] Point the domain. Registrar should be in her name.
- [ ] Set up the scheduled rebuild so calendar changes appear without a push:
      Cloudflare Pages → Settings → Builds & deployments → Deploy hooks →
      create one, then add the URL as a repo secret named
      `CLOUDFLARE_DEPLOY_HOOK`. The workflow in
      `.github/workflows/rebuild.yml` is already written and will start
      working the moment that secret exists.

---

## 6. Open design decisions

- [ ] **Typography is provisional.** Bricolage Grotesque + Instrument Sans
      was held constant across the palette studies as a control variable, not
      chosen for this brief. It's serviceable but slightly cold for someone
      whose whole ask was "something that fits my personality." Swap in
      `tailwind.config.mjs` and `src/layouts/Base.astro` together.
- [ ] Decide whether the About photo and hero photo should differ in crop or
      treatment. Currently identical 4:5 treatment, which is a bit flat.
- [ ] Five koalas exist: four in the page, one in the favicon. Confirm that
      is the right number and that they are findable-but-not-loud once real
      photos are in.

---

## Explicitly out of scope

Listed so they don't get added by accident:

- No CMS. Content is a TypeScript file; adding a CMS for one page is a
  liability, not a feature.
- No dark mode. Meadow's value relationships do not survive inversion.
- No analytics unless Kristen asks for it.
- No blog.
- No bot-verification gate in front of booking.
