import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const KEY = "intent-portfolio-theme";
const routes = [
  "/",
  "/about/",
  "/contact/",
  "/resume/",
  "/work/",
  "/blogs/",
  "/playground/",
  ...[
    "chip-2",
    "samasta",
    "cho-soft",
    "ai-enabled",
    "abdm-abha",
    "anarock",
    "tarp",
  ].map((slug) => `/projects/${slug}/`),
  ...[
    "the-next-useful-action",
    "motion-with-a-purpose",
    "show-the-design-decisions",
  ].map((slug) => `/blogs/${slug}/`),
  "/404.html",
];
const skipLoader = (page) =>
  page.addInitScript(() =>
    localStorage.setItem("intent-portfolio-visits", "1"),
  );
const lightTheme = async (page) => {
  await skipLoader(page);
  await page.addInitScript(() =>
    localStorage.setItem("intent-portfolio-theme", "light"),
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
};
const audit = async (page) => {
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(
    result.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        summary: n.failureSummary,
      })),
    })),
  ).toEqual([]);
};

test("theme control sits beside motion, supports the keyboard, and preserves graphics", async ({
  page,
}) => {
  await skipLoader(page);
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator(".sculpture.is-ready canvas")).toBeVisible();
  const canvas = await page.locator(".sculpture canvas").elementHandle();
  const group = page.getByRole("group", { name: "Display preferences" });
  await expect(group.getByRole("button")).toHaveCount(2);
  const theme = group.locator("[data-theme-toggle]");
  await theme.scrollIntoViewIfNeeded();
  await theme.focus();
  await page.keyboard.press("Space");
  await expect(theme).toBeFocused();
  await expect(theme).toHaveAttribute("aria-pressed", "true");
  await expect(theme).toHaveAccessibleName(
    "Light theme enabled. Switch to dark theme.",
  );
  await expect(page.locator("html")).toHaveCSS(
    "background-color",
    "rgb(242, 240, 233)",
  );
  await expect(page.locator("html")).toHaveAttribute("data-motion", "full");
  expect(await canvas.evaluate((node) => node.isConnected)).toBe(true);
  await expect(page.locator(".pin-spacer")).toBeAttached();
  await group.locator("[data-motion-toggle]").click();
  await expect(page.locator("html")).toHaveAttribute("data-motion", "reduced");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await theme.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("html")).toHaveCSS(
    "background-color",
    "rgb(16, 16, 16)",
  );
  await expect(page.locator("html")).toHaveAttribute("data-motion", "reduced");
});

test("theme survives navigation, reload, history, and synchronizes open tabs", async ({
  page,
  context,
}) => {
  await skipLoader(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/about/");
  await page.locator("[data-theme-toggle]").click();
  await page.goto("/work/");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.goBack();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  const second = await context.newPage();
  await skipLoader(second);
  await second.goto("/contact/");
  await expect(second.locator("html")).toHaveAttribute("data-theme", "light");
  await second.locator("[data-theme-toggle]").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("[data-theme-label]")).toHaveText("Dark theme");
  expect(await page.evaluate((key) => localStorage.getItem(key), KEY)).toBe(
    "dark",
  );
  await second.close();
});

test("saved light palette reaches the loader before the app and retains the five-second hold", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem("intent-portfolio-theme", "light");
    localStorage.setItem("intent-portfolio-visits", "0");
  });
  await page.route(/\/assets\/main-[^/]+\.js$/, (route) => route.abort());
  await page.goto("/about/");
  await expect(page.locator(".site-loader")).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute(
    "content",
    "#f2f0e9",
  );
  await expect(page.locator(".loader-shutters span").first()).toHaveCSS(
    "background-color",
    "rgb(242, 240, 233)",
  );
  await expect(page.locator("#main")).toHaveJSProperty("inert", true);
  await expect(page.locator(".site-loader")).toBeHidden();
  expect(
    await page.evaluate(
      () => performance.now() - window.portfolioIntro.startedAt,
    ),
  ).toBeGreaterThanOrEqual(5000);
  await expect(page.locator("#main")).toHaveJSProperty("inert", false);
});

test("theme remains usable with unavailable storage and static pages work without JavaScript", async ({
  page,
  browser,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() =>
    Object.defineProperty(window, "localStorage", {
      get: () => {
        throw new Error("Storage blocked");
      },
    }),
  );
  await page.goto("/about/");
  await expect(page.locator(".site-loader")).toBeHidden();
  await page.locator("[data-theme-toggle]").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  expect(errors).toEqual([]);
  const staticPage = await browser.newPage({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  await staticPage.goto("http://127.0.0.1:4173/about/");
  await expect(staticPage.locator(".footer-preferences")).toBeHidden();
  await expect(staticPage.locator(".desktop-nav")).toBeVisible();
  await expect(staticPage.locator("h1")).toBeVisible();
  await staticPage.close();
});

test("light theme fits narrow, tablet and wide screens with adjacent footer controls", async ({
  page,
}) => {
  await lightTheme(page);
  for (const width of [360, 390, 834, 1440, 1920]) {
    await page.setViewportSize({ width, height: 950 });
    for (const route of [
      "/",
      "/contact/",
      "/playground/",
      "/projects/ai-enabled/",
    ]) {
      await page.goto(route);
      const group = page.locator(".footer-preferences");
      await group.scrollIntoViewIfNeeded();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
        `${route} at ${width}`,
      ).toBe(true);
      const motion = await group.locator("[data-motion-toggle]").boundingBox();
      const theme = await group.locator("[data-theme-toggle]").boundingBox();
      expect(Math.abs(motion.y - theme.y)).toBeLessThan(2);
      expect(theme.x).toBeGreaterThan(motion.x);
      expect(theme.x + theme.width).toBeLessThanOrEqual(width);
    }
  }
});

test("light menu, media dialog, explorer and résumé print remain usable", async ({
  page,
}) => {
  await lightTheme(page);
  await page.goto("/projects/ai-enabled/");
  await page.getByRole("button", { name: "Menu", exact: true }).click();
  await audit(page);
  await page.keyboard.press("Escape");
  await page.locator(".case-cover").click();
  await audit(page);
  await page.getByRole("button", { name: "Zoom in", exact: true }).click();
  await expect(page.locator("[data-zoom-reset]")).toHaveText("150%");
  await page.keyboard.press("Escape");
  await page.getByRole("tab", { name: "Patterns", exact: true }).click();
  await expect(page.locator("#ai-enabled-wire")).toBeVisible();
  await page.goto("/resume/");
  await page.emulateMedia({ media: "print" });
  await expect(page.locator(".resume-paper")).toHaveCSS(
    "background-color",
    "rgb(255, 255, 255)",
  );
  await expect(page.locator(".site-footer")).toBeHidden();
});

for (const route of routes) {
  test(`light theme accessibility: ${route}`, async ({ page }) => {
    await lightTheme(page);
    await page.goto(route);
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await audit(page);
  });
}
