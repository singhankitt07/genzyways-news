# GenzyWays News — News Portal

A working Next.js news site for GenzyWays News.com: public site (breaking ticker, categories, article pages)
+ a password-protected admin panel to write, edit, publish, and delete articles.

## What's actually in here
- Public site: homepage, category pages, article pages, mobile-first, breaking-news ticker
- `/admin/login`: staff login
- `/admin`: dashboard — list, publish/unpublish, edit, delete articles
- `/admin/articles/new` and `/admin/articles/[id]`: article editor
- `/admin`: RSS draft import and optional AI-assisted editing for imported stories
- Database: Prisma (SQLite for local dev, swap to Postgres for production — see below)
- Auth: NextAuth credentials login, bcrypt-hashed password, JWT session
- Staff roles: administrators manage the newsroom, editors manage articles, moderators review comment reports
- Newsletter: Resend double opt-in, admin campaign sending, and unsubscribe links
- Article writing: visual rich-text editor for English and Hindi; older Markdown stories remain supported

## 1. Run it locally
You'll need Node.js 18+ installed.

```bash
npm install
cp .env.example .env
# edit .env: set ADMIN_EMAIL / ADMIN_PASSWORD to your real login,
# and generate NEXTAUTH_SECRET with: openssl rand -base64 32

npx prisma migrate dev --name init
npm run seed        # creates your admin login + 3 sample articles
npm run dev
```

Open http://localhost:3000 for the site, http://localhost:3000/admin/login to sign in.

For newsletter confirmation and campaign delivery, set `RESEND_API_KEY` and `NEWSLETTER_FROM`
to a verified sender in Resend. If `NEWSLETTER_FROM` is unset, the app reuses `SMTP_FROM`,
`EMAIL_FROM`, or `SMTP_USER`. Subscribers must confirm by email before they appear in the
send list. Administrators can compose a campaign at `/admin/newsletter`; every campaign
includes a per-subscriber unsubscribe link.

### News automation

From `/admin`, paste a public RSS or Atom feed URL to import up to 10 stories as
unpublished drafts. Duplicate source URLs are skipped. Imported stories must be reviewed
and edited before publication.

The article editor also includes **Enhance with AI** for existing drafts. Configure an
OpenAI-compatible provider in the server environment with `AI_API_KEY`, `AI_BASE_URL`, and
`AI_MODEL`. The key is used only on the server and is never sent to the browser. AI output
is always saved as an unpublished draft; editors remain responsible for fact-checking,
source attribution, copyright, and publication.

## AI newsroom (admin only)

Admins manage this at `/admin/ai-news`. Flow: **collect -> group -> research -> verify -> draft -> human approval -> publish**. AI never publishes anything.

- **Setup:** add `CRON_SECRET` (required for the schedule) and, for AI steps, `AI_API_KEY` (+ optional `AI_BASE_URL`, `AI_MODEL`). `NEWS_API_KEY` is optional (NewsAPI provider). Vercel Cron calls `/api/cron/newsroom` once a day at 03:00 UTC (the Vercel Hobby plan only allows daily crons; see `vercel.json`). Use **Fetch & group now** in the admin for on-demand runs.
- **Safe by default:** automation is OFF until you turn it on in Settings. Auto-research and auto-drafting are separate switches. HIGH-risk stories (deaths, arrests, courts, elections, health claims...) always need a human, regardless of settings.
- **Cost limits:** daily AI request and token caps (Settings) are enforced from the activity log.
- **Housekeeping:** the 03:00 UTC run prunes logs older than 30 days, finished jobs older than 7 days and stale unreviewed items older than 60 days.
- **Trending** uses recent views (a small anonymous per-day counter), reactions, bookmarks and comments, and falls back to the newest stories.
- **Tests:** `npm test` runs the newsroom unit tests.

## Complete change log (everything built so far)

### Brand, design and responsive layout (29-30 Sep 2026)
- Rebranded to **GenzyWays News**; supplied logo assets integrated, circular Devanagari badge and geometric "G" explorations, consistent asset paths and metadata.
- Refreshed homepage and subscription experience; responsive layouts for phone, tablet and laptop.
- Responsive slide-down **mega menu**, laptop navigation drawer, fixed header scroll, search focus and mobile drawer/viewport bugs, tappable mobile header controls, dark-mode drawer contrast.
- Live **weather with icons and AQI** (and a Vercel IP-based location fallback), shown on mobile too.

### Reader features
- Reader accounts, sign-in renamed to "Login", improved account identity, OAuth flows, name-change history, reader preferences.
- Email-link **password reset**.
- Reader engagement: reactions, bookmarks, comments (with moderation), improved article reading experience.
- Search with filters, author profiles and author pages, article source transparency, newsroom **RSS feed** (`/rss.xml`).
- Separate **Hindi newsroom** (`/hindi`) with independent English/Hindi publication of each story.
- Guides and **ebooks** publishing, shorts and videos sections, article media.
- Newsletter with Resend double opt-in, unsubscribe links, and admin campaigns.
- Plans and subscriptions via **Razorpay** and **Stripe**, paywall-ready article access.

### Admin / newsroom tools
- Staff roles (administrator, editor, moderator), responsive admin panel with unified mobile navigation.
- Rich-text editor (English and Hindi), media library, comment moderation, RSS draft import, "Enhance with AI" for drafts.
- Editorial-trust pages (about, editorial policy, contact, privacy, terms) for ad review.
- **Consent-aware Google AdSense** ads (non-personalized by default, subscribers excluded).

### 3 Oct 2026 - Videos, animations, AI newsroom
- **Videos fix:** media cards now open an in-site watch page at `/videos/[id]` (previously clicking a video article did nothing).
- **Animations:** Framer Motion transitions across the site, with reduced-motion support.
- **AI News Automation System** (admin only, `/admin/ai-news`), built in 8 phases:
  1. **Sources** - add RSS/Atom, NewsAPI and other providers; per-source poll interval, status and error tracking.
  2. **Ingestion** - fetches items, de-duplicates, stores them in the database.
  3. **Clustering** - groups items about the same event into story clusters, scores importance and flags risk (LOW / MEDIUM / HIGH).
  4. **Research and verification** - the AI extracts atomic claims from the sources; each claim is marked SUPPORTED (2+ publishers), SINGLE_SOURCE or CONFLICTING, giving an overall verdict and confidence.
  5. **Drafting** - original-wording English and Hindi drafts with SEO fields, using only verified claims (single-source claims are attributed, conflicts shown as disputed). Stories with no verifiable claims are refused.
  6. **Human approval** - drafts land as IN_REVIEW; an admin edits, approves or rejects at `/admin/ai-news/drafts/[id]`. Editing resets approval. HIGH-risk stories always need a human.
  7. **Publish** - only APPROVED drafts can be published, by an admin, and they are saved as an **unpublished article** by default. The AI never publishes.
  8. **Operations** - Settings (enable, poll interval, categories, auto-research/auto-draft switches, daily request and token caps), activity log, idempotent jobs with retry/backoff, scheduled cron endpoint (`CRON_SECRET`), housekeeping, and a trending score (views, reactions, bookmarks, comments).
- New database tables (migrations `20261003130000` to `20261003170000`): ingested items, story clusters, research reports, article drafts, article views.
- **Production fixes and hardening:**
  - Cron changed to daily for the Vercel Hobby plan.
  - Fixed a job-claim bug where "Fetch & group now" did nothing because the database clock was ahead of the server clock (`runAt` is now backdated by 60 s).
  - AI client retries on 429/5xx (3 attempts) for free-tier providers.
  - Cron endpoint returns 401 without the secret and 503 if `CRON_SECRET` is missing; admin APIs return 401 without a session; manual run is rate limited.
- **AI provider:** switched from OpenAI (no credit) to **Google Gemini** through its OpenAI-compatible endpoint. Production env vars: `AI_API_KEY`, `AI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai`, `AI_MODEL=gemini-3.5-flash`. Any OpenAI-compatible provider (OpenAI, Groq, OpenRouter...) works by changing these three values. Gemini model names are retired often, so if you see 404/503 errors, check the models list and pick a stable one.
- **Tested end to end on production:** collect (8 RSS feeds, 242 items) -> group -> research -> draft -> approve -> publish. Unit tests: `npm test` (9 pass).

### Deployment
- Hosted on **Vercel** (`genzywaynews`), code on GitHub (`singhankitt07/genzyways-news`, branch `main`), database on **Neon Postgres**.
- Build command runs `prisma migrate deploy`, `prisma generate`, the seed, then `next build`.
- Secrets (`DATABASE_URL`, `NEXTAUTH_SECRET`, `CRON_SECRET`, `AI_API_KEY`, payment and email keys) live only in Vercel environment variables, never in git.

## 2. Deploy it live (free tier works to start)

**Step 1 - Prepare the project for Vercel.**

1. Create or sign in to your Vercel account at https://vercel.com.
2. Create a new Vercel project and connect this application to it.
3. Keep the project root set to this folder and use the default Next.js build settings.

**Step 2 — Create a production database (Neon, free tier).**
1. Go to https://neon.tech, sign up, create a project.
2. Copy the connection string it gives you (starts with `postgresql://`).
3. In `prisma/schema.prisma`, change:
   ```
   provider = "sqlite"
   ```
   to:
   ```
   provider = "postgresql"
   ```
4. Commit that change.

**Step 3 — Deploy on Vercel.**
1. In the Vercel project's Environment Variables, add:
   - `DATABASE_URL` — your Neon connection string
   - `NEXTAUTH_SECRET` — a random 32-byte string (`openssl rand -base64 32`)
   - `NEXTAUTH_URL` — your production URL, e.g. `https://yoursite.vercel.app`
   - `ADMIN_EMAIL` / `ADMIN_PASSWORD` — your real login (only needed once, for seeding)
2. Click **Deploy**.
3. After the first deploy, run the migration + seed against production once, from your
   local machine, by temporarily pointing your local `.env`'s `DATABASE_URL` at the Neon
   URL and running:
   ```bash
   npx prisma migrate deploy
   npm run seed
   ```

**Step 4 — Connect your domain.** In Vercel → Project → Settings → Domains, add your
domain and follow the DNS instructions it gives you (usually one A record or CNAME at
your domain registrar — GoDaddy, Namecheap, whoever you bought it from).

Vercel handles CDN, SSL, and traffic scaling automatically — you don't need to manage
servers, and it comfortably handles traffic spikes on the free/Pro tier.

## 3. Get discovered (Google News / Discover)
1. Publish at least 10–20 real articles first — thin sites get rejected.
2. Go to Google Publisher Center (https://publishercenter.google.com) and register your
   site. You'll need an `About` page and consistent bylines/dates (already included here).
3. Add a sitemap. Simplest option: add `app/sitemap.ts` (Next.js auto-generates
   `sitemap.xml`) — ask me to add this once you're ready to launch.
4. Submit the sitemap in Google Search Console (https://search.google.com/search-console).

## 4. Monetize
- **Google AdSense**: set `NEXT_PUBLIC_ADSENSE_CLIENT` and enable Auto ads in the AdSense
  dashboard. The site loads ads for non-premium visitors; active paid subscribers are
  excluded. Ads are requested as non-personalized until a visitor accepts optional
  personalization. Non-personalized ads may still use storage for frequency capping and
  aggregate reporting where permitted. Fixed ad units can also use the optional home/article
  slot environment variables.
- **Consent setup**: this site's preference UI is not an IAB TCF-certified CMP. For visitors
  in the EEA, UK, or Switzerland, configure Google's certified CMP through AdSense Privacy &
  Messaging and review local consent requirements before serving ads there.
- **Paywall**: the `published` field on each article is a start — a real paywall needs a
  payments provider (Razorpay/Stripe) and a subscription check, which I can build next.
- **Affiliate/sponsored posts**: just author them as normal articles.

## What's new in this update
- **Rebranded** to GenzyWays News (update `NEXTAUTH_URL` in your `.env`/Vercel settings to
  `https://GenzyWays News.com` once your domain is connected).
- **Language switcher** (top right of every page): English / हिंदी / Hinglish. It
  translates all site chrome — nav, category names, breaking-news label, buttons, empty
  states — instantly, no reload, and remembers the visitor's choice.
  Article **content itself is not auto-translated** — you write each article once, in
  whichever language you choose. If you want true multi-language articles (separate
  Hindi/English versions of the same story), that's a bigger feature — tell me and I'll
  add a translated-fields option to the editor.
- **New categories**, focused on your brief: Current Affairs, Tech News, AI World,
  Business, Opinion.

### If you already ran `npm run seed` before this update
Your local database has old sample articles tagged with the old categories (National,
International, Technology). Either:
- run `npx prisma migrate reset` then `npm run seed` again for a clean slate (this wipes
  all articles), or
- open each old article in `/admin`, and re-pick its category from the dropdown (now
  shows the new 5) — nothing else needs to change.


- **Sitemap & robots.txt** — auto-generated at `/sitemap.xml` and `/robots.txt` from your
  published articles. This is what you submit to Google Search Console (step 4 above).
- **Image upload** — the editor has an "Upload file" button, in addition to pasting a URL.
  It uses Vercel Blob storage. To activate it in production: in your Vercel project go to
  Storage → Create Database → Blob, connect it to this project, and redeploy — Vercel
  injects the required token automatically. Until you do that, pasting an image URL still
  works fine.
- **Rich text editor** — visually format article bodies with headings, lists, quotes,
  emphasis, and links in English or Hindi. Existing Markdown articles remain supported.

## What's new in this update (v3)
- **More sample articles** — now 3 per category across Current Affairs, Tech News, AI
  World, Business, and Opinion (11 total), so the site doesn't look empty out of the box.
  Run `npm run seed` again to pull these in (safe to re-run — it won't duplicate existing
  ones, matched by slug).
- **Social sharing** — every article page has WhatsApp, X, Facebook, LinkedIn, and Copy
  Link buttons. These build the share URL from whatever domain the site is actually
  running on, so no config needed — they'll automatically use GenzyWays News.com once
  that's your live domain.
- **Save as PDF / print** — a "Save as PDF" button on every article uses the browser's
  built-in print dialog with a print-specific stylesheet (header, footer, ticker, and
  buttons are hidden), so readers can save a clean, article-only PDF to read offline.
  This needs no extra library or paid service.
- **Contact Us page** (`/contact`) — a form that opens the visitor's email client with
  their message pre-filled, addressed to `hello@GenzyWays News.com`. **Change that email
  address** in `app/contact/page.tsx` (top of the file, `CONTACT_EMAIL`) to your real
  inbox before you launch. If you'd rather the form submit silently in the background
  instead of opening an email client, tell me and I'll wire it to a database + a simple
  admin inbox.
- **Privacy Policy page** (`/privacy`) — a starter template. It's written to be accurate
  for exactly what this codebase currently does (language preference in local storage,
  optional contact form). It is **not legal advice** — have it reviewed before relying on
  it, especially once you add ads or analytics.
- **Visual polish** — sticky header with shadow, hover states on article cards, category
  pages with an accent underline, a fuller dark footer with section/contact/privacy links,
  refined ticker styling.

## What's new in this update (v4)
**Important — this update changed the database schema** (added a table for newsletter
subscribers). If you already ran `npx prisma migrate dev` before, run this once more
after replacing your files:
```bash
npx prisma migrate dev --name add_newsletter
```
This just adds the new table — it won't touch your existing articles or admin login.

- **Per-article SEO tags** — every article and category page now generates its own
  title, meta description, and Open Graph/Twitter card image, pulled from the article's
  own summary and cover image. This is what makes Google search results and WhatsApp/
  X/Facebook link previews show the actual headline and image instead of a generic site
  title. Before you deploy, set `NEXTAUTH_URL` to your real domain — the metadata uses it
  to build correct absolute URLs.
- **Newsletter signup** — a form (bottom of the homepage and every article) that stores
  emails in the database. There's no email-sending service connected yet — this only
  *collects* addresses. When you're ready to actually send newsletters, connect it to a
  provider like Mailchimp, Brevo, or Resend and I'll wire up the integration.
- **Related articles** — every article page now shows up to 3 more stories from the same
  category underneath the story, so readers have a reason to click deeper into the site.

## Notes / what to build next
- Multiple admin users / roles.
- Comments, newsletter signup, RSS feed.
- A full WYSIWYG editor (current one is lightweight markdown-style, on purpose — fast and
  has no extra dependencies to break).

Tell me which of these you want next and I'll build it directly into this codebase.