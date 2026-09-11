# GenzyWayNews — News Portal

A working Next.js news site for genzywaynews.com: public site (breaking ticker, categories, article pages)
+ a password-protected admin panel to write, edit, publish, and delete articles.

## What's actually in here
- Public site: homepage, category pages, article pages, mobile-first, breaking-news ticker
- `/admin/login`: staff login
- `/admin`: dashboard — list, publish/unpublish, edit, delete articles
- `/admin/articles/new` and `/admin/articles/[id]`: article editor
- Database: Prisma (SQLite for local dev, swap to Postgres for production — see below)
- Auth: NextAuth credentials login, bcrypt-hashed password, JWT session

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

## 2. Deploy it live (free tier works to start)

**git 

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
1. Go to https://vercel.com, sign up, click "Add New Project", import your GitHub repo.
2. In the project's Environment Variables, add:
   - `DATABASE_URL` — your Neon connection string
   - `NEXTAUTH_SECRET` — a random 32-byte string (`openssl rand -base64 32`)
   - `NEXTAUTH_URL` — your production URL, e.g. `https://yoursite.vercel.app`
   - `ADMIN_EMAIL` / `ADMIN_PASSWORD` — your real login (only needed once, for seeding)
3. Deploy.
4. After the first deploy, run the migration + seed against production once, from your
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
- **Google AdSense**: apply once you have real traffic and content; drop the ad script
  into `app/layout.tsx`.
- **Paywall**: the `published` field on each article is a start — a real paywall needs a
  payments provider (Razorpay/Stripe) and a subscription check, which I can build next.
- **Affiliate/sponsored posts**: just author them as normal articles.

## What's new in this update
- **Rebranded** to GenzyWayNews (update `NEXTAUTH_URL` in your `.env`/Vercel settings to
  `https://genzywaynews.com` once your domain is connected).
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
- **Basic rich text** — B / I / Link buttons in the article editor wrap your selected text
  with `**bold**`, `*italic*`, `[text](url)`, which render properly formatted on the
  published article page.

## What's new in this update (v3)
- **More sample articles** — now 3 per category across Current Affairs, Tech News, AI
  World, Business, and Opinion (11 total), so the site doesn't look empty out of the box.
  Run `npm run seed` again to pull these in (safe to re-run — it won't duplicate existing
  ones, matched by slug).
- **Social sharing** — every article page has WhatsApp, X, Facebook, LinkedIn, and Copy
  Link buttons. These build the share URL from whatever domain the site is actually
  running on, so no config needed — they'll automatically use genzywaynews.com once
  that's your live domain.
- **Save as PDF / print** — a "Save as PDF" button on every article uses the browser's
  built-in print dialog with a print-specific stylesheet (header, footer, ticker, and
  buttons are hidden), so readers can save a clean, article-only PDF to read offline.
  This needs no extra library or paid service.
- **Contact Us page** (`/contact`) — a form that opens the visitor's email client with
  their message pre-filled, addressed to `hello@genzywaynews.com`. **Change that email
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
