import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
mkdirSync("artifacts/motion", { recursive: true });
const browser = await chromium.launch({
  executablePath:
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "no-preference",
  });
  page.on("pageerror", (error) => console.log("PAGE ERROR", error.message));
  await page.route(/\/assets\/main-.*\.js$/, async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1400));
    await route.continue();
  });
  await page.goto("http://127.0.0.1:4173/about/", { waitUntil: "commit" });
  await page.locator(".site-loader").waitFor({ state: "visible" });
  await page.screenshot({ path: "artifacts/motion/loader-desktop.png" });
  await page.locator(".site-loader").waitFor({ state: "hidden" });
  await page.getByRole("button", { name: "Menu", exact: true }).click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: "artifacts/motion/menu-desktop.png" });
  await page.keyboard.press("Escape");
  await page.locator("#navigation-dialog").waitFor({ state: "hidden" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => localStorage.removeItem("intent-portfolio-visits"));
  await page.goto("http://127.0.0.1:4173/about/", { waitUntil: "commit" });
  await page.locator(".site-loader").waitFor({ state: "visible" });
  await page.screenshot({ path: "artifacts/motion/loader-mobile.png" });
  await page.locator(".site-loader").waitFor({ state: "hidden" });
  await page.getByRole("button", { name: "Menu", exact: true }).click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: "artifacts/motion/menu-mobile.png" });
  await page.keyboard.press("Escape");
  await page.locator("#navigation-dialog").waitFor({ state: "hidden" });
  await page.unrouteAll({ behavior: "wait" });
  await page.goto("http://127.0.0.1:4173/contact/");
  const summary = page.locator(".faq-list summary").first();
  await summary.scrollIntoViewIfNeeded();
  await summary.click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: "artifacts/motion/accordion-mobile.png" });
  console.log("Saved loader, menu, and accordion visual checks.");
} finally {
  await browser.close();
}
