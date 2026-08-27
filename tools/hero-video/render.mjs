/* Renders scene.html one frame at a time. The page draws from a frame number
   rather than the clock, so every run produces the same 192 images. */
import { chromium } from "/opt/node22/lib/node_modules/playwright/index.mjs";
import { mkdir, rm } from "node:fs/promises";

const OUT = "/tmp/vid/frames";
await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({
  args: ["--no-sandbox", "--force-color-profile=srgb", "--disable-lcd-text"]
});
const page = await browser.newPage({
  viewport: { width: 1280, height: 720 },
  deviceScaleFactor: 1
});
await page.goto("file:///tmp/vid/scene.html");
await page.waitForFunction(() => document.fonts.status === "loaded");

const total = await page.evaluate(() => window.TOTAL);
const stage = page.locator("#stage");

/* start the output inside the resting window so the clip both opens and
   loops on the finished board */
const OFFSET = 169;

for (let f = 0; f < total; f++) {
  await page.evaluate((n) => window.setFrame(n), f + OFFSET);
  await stage.screenshot({ path: `${OUT}/${String(f).padStart(4, "0")}.png` });
}

await browser.close();
console.log("frames:", total);
