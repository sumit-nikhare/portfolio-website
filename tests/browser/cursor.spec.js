import { test, expect } from "@playwright/test";

test("custom pointer tracks directly on open space, links and project covers", async ({
  page,
}) => {
  await page.goto("/about/");
  await expect(page.locator("html")).toHaveAttribute("data-cursor", "custom");
  const cursor = page.locator(".site-cursor");
  await page.mouse.move(12, 240);
  await expect(cursor).toHaveAttribute("data-state", "default");
  await expect(page.locator("body")).toHaveCSS("cursor", "none");
  await expect(cursor).toHaveCSS("transform", "matrix(1, 0, 0, 1, 12, 240)");
  await page.locator("[data-menu-open]").hover();
  await expect(cursor).toHaveAttribute("data-state", "link");
  await expect(cursor.locator(".cursor-ring")).toHaveCSS("width", "30px");
  await page.goto("/work/");
  await page.locator("[data-project-link]").first().hover();
  await expect(cursor).toHaveAttribute("data-state", "project");
  await expect(cursor.locator(".cursor-label")).toHaveCSS("opacity", "1");
  await expect(cursor.locator(".cursor-ring")).toHaveCSS("width", "70px");
  await page.mouse.down();
  await expect(cursor).toHaveAttribute("data-pressed", "");
  await page.mouse.move(12, 240);
  await page.mouse.up();
  await expect(cursor).not.toHaveAttribute("data-pressed");
});

test("cursor stays above modal menus and galleries without taking focus or intercepting Escape", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/projects/chip-2/");
  const cursor = page.locator(".site-cursor");
  const menu = page.locator("#navigation-dialog");
  await page.locator("[data-menu-open]").click();
  await expect(menu).toBeVisible();
  await menu.locator("[data-close-dialog]").hover();
  await expect(cursor).toHaveAttribute("data-state", "link");
  await expect(cursor.locator(".cursor-ring")).toBeVisible();
  expect(await cursor.evaluate((node) => node.matches(":popover-open"))).toBe(
    true,
  );
  expect(
    await page.evaluate(() => document.activeElement.closest("dialog")?.id),
  ).toBe("navigation-dialog");
  await page.keyboard.press("Escape");
  await expect(menu).not.toBeVisible();
  await expect(page.locator("[data-menu-open]")).toBeFocused();
  await page.locator("[data-gallery]").first().click();
  const gallery = page.locator("#media-dialog");
  await expect(gallery).toBeVisible();
  await gallery.locator("[data-close-dialog]").hover();
  await expect(cursor.locator(".cursor-ring")).toBeVisible();
  expect(await cursor.evaluate((node) => node.matches(":popover-open"))).toBe(
    true,
  );
  await page.keyboard.press("Escape");
  await expect(gallery).not.toBeVisible();
});

test("custom caret permits text editing and the pointer follows theme and motion choices", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/contact/");
  const cursor = page.locator(".site-cursor");
  const name = page.locator("#contact-name");
  await name.hover();
  await expect(cursor).toHaveAttribute("data-state", "text");
  await name.click();
  await page.keyboard.type("Cursor check");
  await expect(name).toHaveValue("Cursor check");
  await expect(cursor.locator(".cursor-ring")).toHaveCSS("width", "1px");
  await expect(cursor.locator(".cursor-ring")).toHaveCSS(
    "transition-duration",
    "0s",
  );
  await page.locator("[data-theme-toggle]").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(cursor).toHaveCSS("color", "rgb(32, 37, 27)");
  await expect(page.locator("html")).toHaveAttribute("data-cursor", "custom");
  await page.keyboard.press("Tab");
  await expect(page.locator("html")).not.toHaveAttribute("data-cursor-visible");
  await page.mouse.move(12, 240);
  await expect(cursor.locator(".cursor-ring")).toBeVisible();
});

test("an unavailable overlay uses the custom SVG rather than hiding the pointer", async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(HTMLElement.prototype, "showPopover", {
      configurable: true,
      value: undefined,
    }),
  );
  await page.goto("/about/");
  await expect(page.locator("html")).toHaveAttribute("data-cursor", "custom");
  await page.mouse.move(200, 240);
  await expect(page.locator("html")).not.toHaveAttribute("data-cursor-visible");
  await expect(page.locator(".site-cursor")).toBeHidden();
  await expect(page.locator("body")).toHaveCSS("cursor", /cursor-dark\.svg/);
});

test("touch devices have no custom layer and desktop navigation restores one cursor", async ({
  browser,
  page,
}) => {
  const context = await browser.newContext({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 844 },
  });
  const mobile = await context.newPage();
  await mobile.goto("http://127.0.0.1:4173/about/");
  await expect(mobile.locator(".site-cursor")).toBeHidden();
  await expect(mobile.locator("html")).not.toHaveAttribute("data-cursor");
  await context.close();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/work/");
  await page.locator("[data-project-link]").first().click();
  await expect(page).toHaveURL(/\/projects\/chip-2\/$/);
  await page.goBack();
  await page.locator("[data-project-link]").first().hover();
  await expect(page.locator(".site-cursor")).toHaveCount(1);
  await expect(page.locator(".site-cursor")).toHaveAttribute(
    "data-state",
    "project",
  );
});
