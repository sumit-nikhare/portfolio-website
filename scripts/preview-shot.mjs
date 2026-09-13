import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
mkdirSync("artifacts", { recursive: true });
const browser = await chromium.launch({
  executablePath:
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 1,
});
page.on("pageerror", (error) => console.log("PAGE ERROR:", error.message));
page.on("console", (msg) => {
  if (msg.type() === "error") console.log("CONSOLE:", msg.text());
});
await page.goto("http://127.0.0.1:4173/", { waitUntil: "networkidle" });
await page.waitForTimeout(1600);
await page.screenshot({ path: "artifacts/home-desktop.png" });
console.log(
  await page.evaluate(() => ({
    title: document.title,
    width: innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    canvas: !!document.querySelector(".sculpture.is-ready"),
    links: document.links.length,
  })),
);
await page.getByRole("button", { name: /motion enabled/ }).click();
await page.screenshot({ path: "artifacts/home-full.png", fullPage: true });
await page.setViewportSize({ width: 390, height: 844 });
await page.goto("http://127.0.0.1:4173/", { waitUntil: "networkidle" });
await page.screenshot({ path: "artifacts/home-mobile.png" });
await page.goto("http://127.0.0.1:4173/playground/", {
  waitUntil: "networkidle",
});
await page.screenshot({
  path: "artifacts/playground-mobile.png",
  fullPage: true,
});
for (const [name, route] of [
  ["case", "/projects/forma/"],
  ["playground", "/playground/"],
]) {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("http://127.0.0.1:4173" + route, {
    waitUntil: "networkidle",
  });
  await page
    .locator(".evolution-panel:not([hidden]) img")
    .evaluateAll((images) => images.forEach((img) => (img.loading = "eager")));
  await page.waitForTimeout(300);
  await page.screenshot({
    path: `artifacts/${name}-desktop.png`,
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: `artifacts/${name}-mobile.png`,
    fullPage: true,
  });
  console.log(
    name,
    await page.evaluate(() => ({
      width: innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
    })),
  );
}
await browser.close();
