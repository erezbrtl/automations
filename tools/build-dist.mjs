/* Base44 publishes whatever ends up in ./dist, so a site with no build step
   still needs a "build" that puts it there. This copies the shipping files and
   leaves the dev-only ones (docs, tooling, the compose file) behind. */
import { cp, mkdir, readdir, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");

/* an allowlist, so a new dev-only file never leaks into a publish by accident */
const ship = [
  "index.html",
  "robots.txt",
  "sitemap.xml",
  "CNAME",
  "assets",
  "accessibility.html",
  "privacy.html",
  "thanks.html",
  "resources",
];

const exists = async (p) => {
  try { await stat(p); return true; } catch { return false; }
};

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

const copied = [];
for (const entry of ship) {
  const from = join(root, entry);
  if (!(await exists(from))) { continue; }
  await cp(from, join(dist, entry), { recursive: true });
  copied.push(entry);
}

/* A CDN caches /assets/js/site.js by name, so a publish could leave a fresh
   page pulling a stale script - or the reverse. Giving every stylesheet and
   script a name derived from its own bytes means a changed file is a new URL
   and an unchanged one still hits the cache. */
const fingerprint = ["assets/css/fonts.css", "assets/css/site.css",
                     "assets/js/config.js", "assets/js/site.js"];

const renamed = new Map();
for (const asset of fingerprint) {
  const file = join(dist, asset);
  if (!(await exists(file))) { continue; }
  const body = await readFile(file);
  const hash = createHash("sha256").update(body).digest("hex").slice(0, 10);
  const dot = asset.lastIndexOf(".");
  const hashed = asset.slice(0, dot) + "." + hash + asset.slice(dot);
  await rename(file, join(dist, hashed));
  renamed.set("/" + asset, "/" + hashed);
}

/* rewrite every reference, in the HTML and inside the stylesheets themselves */
const rewritable = new Set([".html", ".css"]);
async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) { yield* walk(full); }
    else { yield full; }
  }
}
for await (const file of walk(dist)) {
  const dot = file.lastIndexOf(".");
  if (!rewritable.has(file.slice(dot))) { continue; }
  let text = await readFile(file, "utf8");
  let touched = false;
  for (const [from, to] of renamed) {
    if (text.includes(from)) { text = text.split(from).join(to); touched = true; }
  }
  if (touched) { await writeFile(file, text, "utf8"); }
}

/* the upload refuses a build without a root index.html, so fail here instead */
if (!(await exists(join(dist, "index.html")))) {
  console.error("build-dist: dist/index.html is missing - nothing to publish");
  process.exit(1);
}

/* a reference the rewrite missed would 404 on the live site, so catch it here */
for await (const file of walk(dist)) {
  if (!file.endsWith(".html") && !file.endsWith(".css")) { continue; }
  const text = await readFile(file, "utf8");
  for (const from of renamed.keys()) {
    if (text.includes(from)) {
      console.error("build-dist: " + file + " still points at " + from);
      process.exit(1);
    }
  }
}

console.log("build-dist -> dist/ : " + copied.join(", "));
console.log("build-dist    hashed: " + [...renamed.values()].join(", "));
