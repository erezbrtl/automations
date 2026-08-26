# Base44 Dev Environment

## What this is
A static marketing landing page (Hebrew, RTL) for Erez Bartal's AI & Automation
training service. Plain HTML + CSS + JS — **no build step, no backend, no
database, no framework**. The whole repo is served as-is.

## Running it
```
docker compose -f docker-compose.base44.yml up -d
```
nginx serves the repo root on host port **3000**. The source is bind-mounted
(read-only), so editing any HTML/CSS/JS file is reflected immediately in the
preview — no rebuild or restart needed.

## Key files
- `index.html` — the landing page (entry point).
- `assets/js/config.js` — site config: YouTube id, portrait image, form
  endpoint, contact email, WhatsApp number, GA4 id. Edit this before going live.
- `assets/js/site.js` — all interactivity (form submission, video facade, etc.).
- `assets/css/site.css` — styling.
- `privacy/`, `accessibility/`, `thanks/`, `resources/` — secondary static pages.

## Form submission
The form posts to `formEndpoint` in `config.js` (currently a public FormSubmit
URL that emails leads to the owner). Fallbacks: WhatsApp, then email. No
credentials are required for the site to boot or render.

## No secrets needed
There are no external-service credentials required to run this site locally.
