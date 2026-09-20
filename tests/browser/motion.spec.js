import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("motion choice synchronizes across tabs and history without replaying SVG motion", async ({
  page,
  context,
}) => {
  await page.goto("/playground/");
  await page.locator("[data-svg-replay]").click();
  const other = await context.newPage();
  await other.goto("/contact/");
  await other.locator("[data-motion-toggle]").click();
  await expect(page.locator("html")).toHaveAttribute("data-motion", "reduced");
  await expect(page.locator("[data-svg-pause]")).toBeDisabled();
  await expect(page.locator("[data-svg-path]")).toHaveCSS(
    "stroke-dashoffset",
    "0px",
  );
  await other.locator("[data-motion-toggle]").click();
  await expect(page.locator("html")).toHaveAttribute("data-motion", "full");
  await expect(page.locator("[data-svg-pause]")).toBeDisabled();
  await page.locator("[data-svg-replay]").click();
  await page.goto("/about/");
  await page.locator("[data-motion-toggle]").click();
  await page.goBack();
  await expect(page.locator("html")).toHaveAttribute("data-motion", "reduced");
  await expect(page.locator("[data-svg-pause]")).toBeDisabled();
  await other.close();
});

test("fresh and repeated visits remain interactive without the old loader", async ({
  page,
}) => {
  await page.goto("/about/");
  await expect(page.locator(".site-loader")).toHaveCount(0);
  for (const value of ["0", "5", "10"]) {
    await page.evaluate(
      (visit) => localStorage.setItem("intent-portfolio-visits", visit),
      value,
    );
    await page.reload();
    await expect(page.locator(".site-loader")).toHaveCount(0);
    await expect(page.locator("#main")).toHaveJSProperty("inert", false);
    expect(
      await page.evaluate(() =>
        localStorage.getItem("intent-portfolio-visits"),
      ),
    ).toBe(value);
    await page.getByRole("button", { name: "Menu", exact: true }).click();
    await expect(page.locator("#navigation-dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator("#navigation-dialog")).not.toBeVisible();
  }
});

test("failed app and blocked storage still leave navigation and content accessible", async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new Error("Storage unavailable");
      },
    }),
  );
  await page.route(/\/assets\/main-.*\.js$/, (route) => route.abort());
  await page.goto("/about/");
  await expect(page.locator("#main")).toHaveJSProperty("inert", false);
  await expect(page.locator(".site-loader")).toHaveCount(0);
  await page.keyboard.press("Tab");
  await expect(page.locator(".skip-link")).toBeFocused();
  await page.locator(".static-menu > summary").click();
  await expect(page.locator(".static-menu nav")).toBeVisible();
});

test("brand entrance clears and reduced motion or history return leave no transform", async ({
  page,
}) => {
  await page.goto("/about/");
  const brand = page.locator(".site-header .brand-mark");
  await expect
    .poll(() => brand.evaluate((node) => node.style.transform))
    .toBe("");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(brand).toHaveCSS("transform", "none");
  await expect(page.locator("#main")).toHaveJSProperty("inert", false);
  await page.goto("/contact/");
  await page.goBack();
  await expect(brand).toHaveCSS("transform", "none");
  await expect(page.locator(".site-loader")).toHaveCount(0);
});

test("menu tolerates interrupted entrances, repeated closing, and live motion changes", async ({
  page,
}) => {
  await page.goto("/about/");
  const opener = page.getByRole("button", { name: "Menu", exact: true });
  const menu = page.locator("#navigation-dialog");
  for (let attempt = 0; attempt < 3; attempt++) {
    await opener.click();
    await page.keyboard.press("Escape");
    await page.keyboard.press("Escape");
    await expect(menu).not.toBeVisible();
    await expect(opener).toBeFocused();
    await expect(opener).toHaveAttribute("aria-expanded", "false");
  }
  await opener.click();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(menu).toHaveCSS("clip-path", "none");
  const link = menu.getByRole("link", { name: /Contact me/ });
  await link.focus();
  await expect(menu.locator("[data-nav-preview]")).toHaveAttribute(
    "src",
    /tarp-cover/,
  );
  await expect(page.locator(".site-loader")).not.toBeVisible();
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(result.violations.map((v) => v.id)).toEqual([]);
  await menu.getByRole("button", { name: "Close navigation" }).click();
  await expect(opener).toBeFocused();
});

test("accordion reverses mid-transition, expands with keyboard, resizes, and settles on reduced motion", async ({
  page,
}) => {
  await page.goto("/contact/");
  await expect(page.locator(".site-loader")).not.toBeVisible();
  const details = page.locator(".faq-list details").first();
  const summary = details.locator("summary");
  await summary.scrollIntoViewIfNeeded();
  // Dispatch closely spaced real activation events without waiting for animation stability.
  await summary.evaluate((element) => {
    element.click();
    setTimeout(() => element.click(), 80);
  });
  await expect(details).not.toHaveAttribute("open", "");
  await summary.focus();
  await page.keyboard.press("Enter");
  await expect(details).toHaveAttribute("open", "");
  await expect
    .poll(() => details.evaluate((element) => element.style.height))
    .toBe("");
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await details.evaluate(
      (element) => element.scrollHeight <= element.clientHeight + 2,
    ),
  ).toBe(true);
  await summary.evaluate((element) => element.click());
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(details).not.toHaveAttribute("open", "");
  await expect
    .poll(() => details.evaluate((element) => element.style.height))
    .toBe("");
  await page.keyboard.press("Space");
  await expect(details).toHaveAttribute("open", "");
});

test("scroll reveals and progress survive filtering and a switch to reduced motion", async ({
  page,
}) => {
  await page.goto("/work/");
  await page.locator(".work-card").last().scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      page
        .locator(".site-scroll-progress > span")
        .evaluate(
          (element) => new DOMMatrix(getComputedStyle(element).transform).a,
        ),
    )
    .toBeGreaterThan(0.3);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".site-scroll-progress")).not.toBeVisible();
  await expect(
    page.locator(".work-card").last().locator(".work-meta"),
  ).toHaveCSS("opacity", "1");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.locator('[data-filter="data"]').click();
  await expect(page.locator(".work-card:visible")).toHaveCount(1);
  await expect(page.locator(".work-card:visible .work-meta")).toHaveCSS(
    "opacity",
    "1",
  );
  await page.locator('[data-filter="all"]').click();
  await expect(page.locator(".work-card:visible")).toHaveCount(7);
});

test("every page type settles after entrance and history navigation", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const route of [
    "/",
    "/about/",
    "/contact/",
    "/resume/",
    "/work/",
    "/blogs/",
    "/blogs/motion-with-a-purpose/",
    "/playground/",
    "/projects/anarock/",
    "/404.html",
  ]) {
    await page.goto(route);
    await expect(page.locator(".site-loader")).not.toBeVisible();
    await expect(page.locator("#main h1")).toHaveCSS("opacity", "1");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
  }
  await page.goBack();
  await expect(page.locator("#main h1")).toHaveCSS("opacity", "1");
  await page.goForward();
  await expect(page.locator("#main h1")).toHaveCSS("opacity", "1");
  expect(errors).toEqual([]);
});

test("native accordions and content remain usable with JavaScript disabled", async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:4173/contact/");
  await expect(page.locator(".site-loader")).not.toBeVisible();
  const details = page.locator(".faq-list details").first();
  await details.locator("summary").click();
  await expect(details.locator("p")).toBeVisible();
  await details.locator("summary").click();
  await expect(details.locator("p")).not.toBeVisible();
  await context.close();
});
