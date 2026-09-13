import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const theme = process.env.PORTFOLIO_THEME;
const output =
  theme === "light" ? "artifacts/theme-review" : "artifacts/profile-review";
mkdirSync(output, { recursive: true });
const browser = await chromium.launch({
  executablePath:
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
try {
  const page = await browser.newPage({
    reducedMotion: "reduce",
    deviceScaleFactor: 1,
  });
  await page.addInitScript(() =>
    localStorage.setItem("intent-portfolio-visits", "1"),
  );
  if (["light", "dark"].includes(theme)) {
    await page.addInitScript(
      (value) => localStorage.setItem("intent-portfolio-theme", value),
      theme,
    );
  }
  page.on("pageerror", (error) => console.log("PAGE ERROR", error.message));
  const defaultRoutes = [
    "/",
    "/about/",
    "/contact/",
    "/resume/",
    "/work/",
    "/projects/ai-enabled/",
    "/projects/tarp/",
  ];
  const routes =
    process.argv.length > 2 ? process.argv.slice(2) : defaultRoutes;
  for (const route of routes) {
    const name = route.replaceAll("/", "-").replace(/^-|-$/g, "") || "home";
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
      await page.goto(`http://127.0.0.1:4173${route}`, {
        waitUntil: "networkidle",
      });
      await page.locator(".site-loader").waitFor({ state: "hidden" });
      await page.evaluate(async () => {
        document
          .querySelectorAll("img")
          .forEach((img) => (img.loading = "eager"));
        await Promise.all(
          [...document.images].map((img) => img.decode().catch(() => {})),
        );
        await document.fonts.ready;
      });
      await page.screenshot({
        path: `${output}/${name}-${width}.png`,
        fullPage: true,
      });
      await page.screenshot({
        path: `${output}/${name}-${width}-viewport.png`,
      });
      if (route === "/") {
        await page
          .locator(".footer-bottom")
          .screenshot({ path: `${output}/preferences-${width}.png` });
        await page.getByRole("button", { name: "Menu", exact: true }).click();
        await page.screenshot({ path: `${output}/menu-${width}.png` });
        await page.keyboard.press("Escape");
      }
      console.log(
        route,
        width,
        await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          images: [...document.querySelectorAll("img[src]")].every(
            (img) => img.complete && img.naturalWidth > 0,
          ),
        })),
      );
    }
  }
} finally {
  await browser.close();
}
