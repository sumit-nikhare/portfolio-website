import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
mkdirSync("artifacts/expansion", { recursive: true });
const browser = await chromium.launch({
  executablePath:
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
    deviceScaleFactor: 1,
  });
  page.on("pageerror", (e) => console.log("PAGE ERROR", e.message));
  for (const name of ["about", "contact", "resume", "work", "blogs"]) {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(`http://127.0.0.1:4173/${name}/`, {
      waitUntil: "networkidle",
    });
    await page.screenshot({ path: `artifacts/expansion/${name}-desktop.png` });
    await page
      .locator("img")
      .evaluateAll((images) =>
        images.forEach((img) => (img.loading = "eager")),
      );
    await page.waitForTimeout(200);
    await page.screenshot({
      path: `artifacts/expansion/${name}-full.png`,
      fullPage: true,
    });
    if (name === "resume")
      await page.pdf({
        path: "artifacts/expansion/resume-print-preview.pdf",
        format: "A4",
        printBackground: true,
        preferCSSPageSize: true,
      });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({
      path: `artifacts/expansion/${name}-mobile.png`,
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
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("http://127.0.0.1:4173/blogs/the-next-useful-action/", {
    waitUntil: "networkidle",
  });
  await page.screenshot({
    path: "artifacts/expansion/article-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: "artifacts/expansion/article-mobile.png",
    fullPage: true,
  });
} finally {
  await browser.close();
}
