import { test, expect } from "@playwright/test";

// This is a browser check, not a substitute for visual inspection.
test("pale-surface focus is visible in either theme and mobile controls stay readable and usable", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  for (const theme of ["dark", "light"]) {
    await page.goto("/playground/");
    if ((await page.locator("html").getAttribute("data-theme")) !== theme)
      await page.locator("[data-theme-toggle]").click();
    await page.keyboard.press("Tab");
    await page.locator("[data-demo-next]").focus();
    const ratios = await page.locator(".demo-card").evaluate((card) => {
      const luminance = (color) => {
        const channels = color
          .match(/[\d.]+/g)
          .slice(0, 3)
          .map(Number)
          .map((value) => {
            const unit = value / 255;
            return unit <= 0.04045
              ? unit / 12.92
              : ((unit + 0.055) / 1.055) ** 2.4;
          });
        return channels.reduce(
          (sum, value, i) => sum + value * [0.2126, 0.7152, 0.0722][i],
          0,
        );
      };
      const background = luminance(getComputedStyle(card).backgroundColor);
      const ratio = (color) => {
        const foreground = luminance(color);
        return (
          (Math.max(foreground, background) + 0.05) /
          (Math.min(foreground, background) + 0.05)
        );
      };
      return {
        focus: ratio(getComputedStyle(document.activeElement).outlineColor),
        label: ratio(getComputedStyle(card.querySelector(".eyebrow")).color),
        note: ratio(
          getComputedStyle(card.querySelector(".content-note")).color,
        ),
      };
    });
    expect(ratios.focus).toBeGreaterThanOrEqual(3);
    expect(ratios.label).toBeGreaterThanOrEqual(4.5);
    expect(ratios.note).toBeGreaterThanOrEqual(4.5);
    expect(
      await page
        .locator("[data-type-text]")
        .evaluate((node) => parseFloat(getComputedStyle(node).fontSize)),
    ).toBeGreaterThanOrEqual(16);
    await page.goto("/contact/");
    const sizes = await page
      .locator(
        '.contact-form input:not([type="radio"]), .contact-form textarea',
      )
      .evaluateAll((fields) =>
        fields.map((field) => parseFloat(getComputedStyle(field).fontSize)),
      );
    expect(sizes.every((size) => size >= 16)).toBe(true);
    await page.goto("/projects/chip-2/");
    await page.locator(".case-cover").click();
    for (const button of await page.locator(".media-toolbar button").all()) {
      const rect = await button.boundingBox();
      expect(rect.width).toBeGreaterThanOrEqual(44);
      expect(rect.height).toBeGreaterThanOrEqual(44);
    }
    await page.keyboard.press("Escape");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
  }
});
