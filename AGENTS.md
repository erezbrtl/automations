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
- `assets/css/site.css` — styling for every page except the home page.
- `assets/css/home.css`, `assets/js/home.js` — the home page's own styling and
  GSAP motion (GSAP 3.13 loads from jsDelivr). Its form is still sent by site.js.
- `v1/index.html` — the previous home page, kept unindexed for rollback.
- `privacy/`, `accessibility/`, `thanks/`, `resources/` — secondary static pages.

## Form submission
The form posts to `formEndpoint` in `config.js` (currently a public FormSubmit
URL that emails leads to the owner). Fallbacks: WhatsApp, then email. No
credentials are required for the site to boot or render.

## No secrets needed
There are no external-service credentials required to run this site locally.

## Deploying (Base44 hosts the live site)
The live site, automations.erezb.pro, is served by a Base44 app
(`6a8fcdc5c0560c83beae1ea5`). That app is **not** connected to this repo: it
has its own file tree (with extra `src/`, `base44/` and its own `AGENTS.md`;
never copy this repo's `AGENTS.md` there). GitHub `main` is the source of
truth; Base44 is updated from it by hand, through the Base44 MCP tools.

1. Work on a branch, open a PR. The owner merges. Nothing goes live before
   the merge.
2. In the Base44 sandbox (`run_command`), shallow-clone `main` to `/tmp/ghN`
   and `diff -rq` it against the app root. Copy only the changed site files.
3. `timeout 40 npm run build` there (runs `tools/build-dist.mjs`, which hashes
   asset names into `dist/`). Pages are shipped from an allowlist in that
   script: a new top-level folder or page must be added to its `ship` array.
4. Wait for the sandbox auto-commit (~20s), then `create_checkpoint`. If the
   returned `git_commit_hash` did not change, wait and checkpoint again.
5. `execute_api` `POST /api/apps/{app_id}/deploy` with body
   `{"checkpoint_id": "..."}`.
6. Check the live site with `curl` from inside the Base44 sandbox (this
   container's proxy blocks automations.erezb.pro and hook.eu1.make.com).

`run_command` can time out on a cold sandbox or answer "busy saving
background changes": wait a minute and retry. A session only sees connectors
that were connected when it started.

## Lead pipeline (Make)
The forms post to `formEndpoint` in `assets/js/config.js`, a Make webhook
(team 1150576, hook 3628998, scenario 7151406 "לידים מהאתר - סיווג, גיליון
ומשימה"). The sheet is "Claude Automation Showcase" / Sheet1; column L holds
`lead_id`.

- The home form sends the lead at once (`stage=contact`, a new `lead_id`),
  then moves to `/resources/processes.html`. What is ticked there is sent as
  `stage=processes` with the same `lead_id`. If the first send failed, the
  checklist (or a beacon on `pagehide`) sends the whole lead instead.
- The scenario runs sequentially. It looks up `lead_id` in column L:
  - not found (or no id): AI classification, a new sheet row, a Google Task
    for tomorrow;
  - found, no processes: update name, phone, email on that row;
  - found, with processes: classify again with the processes and update the
    row (topic, urgency, needs-human, draft). The task is not updated.
- Classification is Claude Haiku 5.5 over raw HTTP, with a JSON schema output
  format. Both AI calls and both JSON parses have Resume error handlers, so a
  failed AI call still writes the lead (topic "לא סווג", needs-human "כן").
- A run that errors without a handler stops the scenario; leads then wait in
  the webhook queue until it is switched back on.

To test without side effects, send a request with no name (it stops before
the AI), or point a request at a temporary row you add and then clear.
Real test leads create a row and a task, so ask the owner first.
