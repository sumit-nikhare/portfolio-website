import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("mandatory loader lasts five seconds and returns on visits 6 and 11", async ({
  page,
}) => {
  test.setTimeout(40000);
  await page.goto("/about/");
  const loader = page.locator(".site-loader");
  await expect(loader).toBeVisible();
  await page.mouse.click(100, 100);
  await page.keyboard.press("Escape");
  await page.keyboard.press("Tab");
  await expect(loader).toBeVisible();
  await expect(page.locator("#main")).toHaveJSProperty("inert", true);
  await page.waitForFunction(
    () => performance.now() - window.portfolioIntro.startedAt >= 4700,
  );
  await expect(loader).toBeVisible();
  await expect(loader).not.toBeVisible();
  expect(
    await page.evaluate(
      () => performance.now() - window.portfolioIntro.startedAt,
    ),
  ).toBeGreaterThanOrEqual(5000);
  await expect(page.locator("#main")).toHaveJSProperty("inert", false);
  for (let visit = 2; visit <= 11; visit++) {
    await page.goto(visit % 2 ? "/about/" : "/contact/");
    expect(
      await page.evaluate(() =>
        localStorage.getItem("intent-portfolio-visits"),
      ),
    ).toBe(String(visit));
    if ([6, 11].includes(visit)) {
      await expect(loader).toBeVisible();
      await expect(loader).not.toBeVisible();
      expect(
        await page.evaluate(
          () => performance.now() - window.portfolioIntro.startedAt,
        ),
      ).toBeGreaterThanOrEqual(5000);
    } else {
      await expect(loader).not.toBeVisible();
      await expect(page.locator("#main")).toHaveJSProperty("inert", false);
    }
  }
});

test("visit count persists in a new tab and refreshes count as visits", async ({
  page,
  context,
}) => {
  await page.goto("/about/");
  await expect(page.locator(".site-loader")).not.toBeVisible();
  for (let visit = 2; visit <= 5; visit++) await page.reload();
  const next = await context.newPage();
  await next.goto("http://127.0.0.1:4173/contact/");
  await expect(next.locator(".site-loader")).toBeVisible();
  expect(
    await next.evaluate(() => localStorage.getItem("intent-portfolio-visits")),
  ).toBe("6");
  await expect(next.locator(".site-loader")).not.toBeVisible();
  await expect(
    next.getByRole("button", { name: "Menu", exact: true }),
  ).toBeEnabled();
  await next.close();
});

test("five-second release works when the app and browser storage are unavailable", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new DOMException("Blocked", "SecurityError");
      },
    });
  });
  await page.route(/\/assets\/main-.*\.js$/, (route) => route.abort());
  await page.goto("/about/");
  await expect(page.locator(".site-loader")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator(".site-loader")).toBeVisible();
  await expect(page.locator(".site-loader")).not.toBeVisible();
  expect(
    await page.evaluate(
      () => performance.now() - window.portfolioIntro.startedAt,
    ),
  ).toBeGreaterThanOrEqual(5000);
  await expect(page.locator("#main")).toHaveJSProperty("inert", false);
  await page.keyboard.press("Tab");
  await expect(page.locator(".skip-link")).toBeFocused();
});

test("reduced motion retains a static mandatory loader and releases after five seconds", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/projects/ai-enabled/");
  await expect(page.locator("html")).toHaveAttribute("data-motion", "reduced");
  await expect(page.locator(".site-loader")).toBeVisible();
  await expect(page.locator(".loader-mark")).toHaveCSS("transform", "none");
  expect(
    await page
      .locator(".loader-line")
      .evaluate(
        (element) => getComputedStyle(element, "::after").animationName,
      ),
  ).toBe("none");
  await expect(page.locator(".site-loader")).not.toBeVisible();
  expect(
    await page.evaluate(
      () => performance.now() - window.portfolioIntro.startedAt,
    ),
  ).toBeGreaterThanOrEqual(5000);
  await expect(page.locator(".site-scroll-progress")).not.toBeVisible();
  await expect(page.locator("#main h1")).toHaveCSS("opacity", "1");
});

test("switching motion mode during the hold does not dismiss the loader", async ({
  page,
}) => {
  await page.goto("/about/");
  await expect(page.locator(".site-loader")).toBeVisible();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".site-loader")).toBeVisible();
  await expect(page.locator(".loader-mark")).toHaveCSS("transform", "none");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(page.locator(".site-loader")).toBeVisible();
  await expect(page.locator(".site-loader")).not.toBeVisible();
  expect(
    await page.evaluate(
      () => performance.now() - window.portfolioIntro.startedAt,
    ),
  ).toBeGreaterThanOrEqual(5000);
  await page.getByRole("button", { name: "Menu", exact: true }).click();
  await expect(page.locator("#navigation-dialog")).toBeVisible();
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
