/* Base44 publishes whatever ends up in ./dist, so a site with no build step
   still needs a "build" that puts it there. This copies the shipping files and
   leaves the dev-only ones (docs, tooling, the compose file) behind. */
import { cp, mkdir, rm, stat } from "node:fs/promises";
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
  "accessibility",
  "privacy",
  "resources",
  "thanks",
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

/* the upload refuses a build without a root index.html, so fail here instead */
if (!(await exists(join(dist, "index.html")))) {
  console.error("build-dist: dist/index.html is missing - nothing to publish");
  process.exit(1);
}

console.log("build-dist -> dist/ : " + copied.join(", "));
