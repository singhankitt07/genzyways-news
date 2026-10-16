# GenzyWays News

> A modern, multilingual digital newsroom for current affairs, technology, AI, business, culture, and more.

**Live site:** [genzyway-news-alpha-seven.vercel.app](https://genzyway-news-alpha-seven.vercel.app)

**Repository:** [github.com/singhankitt07/genzyways-news](https://github.com/singhankitt07/genzyways-news)
**Deployment:** Vercel · Next.js 16 · PostgreSQL · Prisma

## What the platform provides

### For readers

- Fast, responsive news homepage with breaking-news ticker and category browsing.
- English and Hindi editions with independent publication controls.
- Search, author pages, related stories, trending stories, and source attribution.
- Article trust panels with summaries, publication/update timestamps, and original-source links.
- Reader accounts, profiles, bookmarks, reactions, comments, follows, and reading preferences.
- Dark, light, sepia, and automatic themes with adjustable reading tools.
- Newsroom RSS feed at `/rss.xml`, standard sitemap, dedicated 48-hour News sitemap, and robots rules for discoverability.
- Articles, videos, shorts, guides, ebooks, newsletter signup, and contact pages.
- Consent-aware analytics and advertising integration.

### For editors and administrators

- Secure staff authentication with administrator, editor, and moderator roles.
- Rich English/Hindi article editor with images, video media, SEO fields, and publication controls.
- Draft, publish, unpublish, breaking-news, live-story, and subscriber-only workflows.
- RSS/Atom draft import with duplicate detection and mandatory editorial review.
- AI-assisted editing for existing drafts; AI output is always kept unpublished until reviewed.
- Media library backed by Vercel Blob when configured.
- Comment moderation, staff management, newsletter campaigns, and activity tracking.

## AI newsroom automation

The protected newsroom workspace is available at `/admin/ai-news` for administrators and editors.

```text
Trusted sources → ingestion → deduplication → story clustering
       → research → claim verification → draft generation → human approval → publishing
```

The pipeline supports:

- Official RSS and Atom feeds.
- NewsAPI.org sources using the server-only `NEWS_API_KEY`.
- Source categories, credibility types, polling intervals, and per-source status history.
- SSRF-safe HTTP fetching, redirect validation, timeouts, response-size limits, and rate-limit handling.
- Story grouping, freshness/importance scoring, risk detection, and duplicate prevention.
- Claim-level verification as `SUPPORTED`, `SINGLE_SOURCE`, or `CONFLICTING`.
- Original English and Hindi drafts grounded only in collected source material.
- AI provider retries, cooldowns, budget limits, and ordered provider failover.
- Human approval gates for drafts and high-risk stories.
- Idempotent jobs with retry/backoff so repeated cron calls do not duplicate work.

Published articles expose `NewsArticle` structured data, canonical metadata, Open Graph fields, author information, publication/update timestamps, and source links. The `/news-sitemap.xml` endpoint includes only published stories from the latest 48 hours for Google News discovery.

Automation is controlled from newsroom settings. Vercel Cron runs `/api/cron/newsroom` daily at 03:00 UTC; editors can also use **Fetch & group now** for an on-demand ingestion run.

## Local development

### Requirements

- Node.js 18 or newer.
- A PostgreSQL database for the current Prisma schema.
- Optional: an OpenAI-compatible AI provider, NewsAPI, email, Blob, analytics, or advertising credentials.

### Setup

```bash
npm install
Copy-Item .env.example .env.local
```

Fill in the required values in `.env.local`, then run:

```bash
npx prisma migrate dev
npm run seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The staff login is at `/admin/login`.

### Useful commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Run migrations, generate Prisma Client, seed, and build Next.js |
| `npm start` | Start the production server |
| `npm test` | Run the newsroom unit tests |
| `npx prisma studio` | Inspect the PostgreSQL database locally |

## Environment variables

Copy `.env.example` to `.env.local`. Never commit real values to GitHub.

| Variable | Required for | Notes |
| --- | --- | --- |
| `DATABASE_URL` | Database | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Authentication | Long random server secret |
| `NEXTAUTH_URL` | Authentication | Current site URL |
| `NEXT_PUBLIC_SITE_URL` | Public URLs | Canonical site URL |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Initial seed | Used to create the first administrator |
| `CRON_SECRET` | Scheduled newsroom | Bearer secret used by Vercel Cron |
| `NEWS_API_KEY` | NewsAPI sources | Server-only NewsAPI.org credential |
| `AI_API_KEY` / `AI_BASE_URL` / `AI_MODEL` | AI newsroom | Legacy single-provider configuration |
| `AI_PROVIDERS` and `AI_<NAME>_*` | AI failover | Optional ordered provider chain |
| `RESEND_API_KEY` / `NEWSLETTER_FROM` | Newsletter | Optional email delivery |
| `BLOB_READ_WRITE_TOKEN` | Media uploads | Optional Vercel Blob storage |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Analytics | Optional Google Analytics 4 |
| `NEXT_PUBLIC_ADSENSE_CLIENT` | Advertising | Optional Google AdSense |

The production `NEWS_API_KEY` is stored as a hidden Vercel environment variable and is read only by the server-side provider in `lib/newsroom/providers/newsapi.ts`. It must never be placed in source code, README files, browser code, or Git history.

## Deployment

The project is linked to the Vercel project `genzywaynews` and deploys from the `main` branch.

```bash
npx vercel --prod
```

Production deployment requirements:

1. Add production environment variables in Vercel Project Settings.
2. Ensure `DATABASE_URL` points to the production PostgreSQL database.
3. Ensure `CRON_SECRET` matches the scheduled request configuration.
4. Add `NEWS_API_KEY` only as a Vercel Secret when NewsAPI sources are used.
5. Redeploy after changing environment variables; existing deployments do not automatically receive new values.

The build entry point is `scripts/build.mjs`. It runs Prisma migrations and seed when `DATABASE_URL` is available, generates Prisma Client, and then builds Next.js. The repository also contains an optional Netlify scheduled-function adapter for installations that use Netlify instead of Vercel.

## Editorial and security principles

- AI never publishes directly.
- Every AI draft is based on collected source material and remains reviewable by staff.
- High-risk stories require human review regardless of newsroom settings.
- Source URLs are validated and private network targets are blocked before fetching.
- Provider keys and authentication secrets stay server-side.
- Published stories should retain accurate attribution, links, dates, and clear distinction between fact, analysis, and uncertainty.

## Project structure

```text
app/                    Next.js pages, layouts, API routes, and cron endpoint
components/             Reader, editor, admin, and newsroom UI
lib/newsroom/           Ingestion, providers, clustering, research, drafting, and jobs
lib/ai/                 AI provider contracts, sanitisation, retries, and failover
prisma/                 PostgreSQL schema, migrations, and seed data
public/                 Brand assets, icons, and public files
scripts/build.mjs       Production build orchestration
tests/newsroom.test.ts  Newsroom unit tests
```

## License and content

This repository is private application software for GenzyWays News. Source material belongs to its original publishers. The newsroom should use feeds and APIs according to their terms, preserve attribution, and publish original editorial wording.
