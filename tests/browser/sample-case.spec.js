import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
const route = "/projects/sample-continuum/";

test("sample exposes all fourteen brief sections in order, an opt-in guide and ordinary navigation", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(route);
  await expect(page.locator("#sample-title")).toHaveText("Continuum.");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "noindex, nofollow",
  );
  await expect(page.locator(".case-index a")).toHaveCount(5);
  const sectionNames = [
    "PROJECT HERO",
    "EXECUTIVE SNAPSHOT",
    "CONTEXT + SYSTEM",
    "PROBLEM + STAKES",
    "SUCCESS DEFINITION",
    "DESIGNING FOR REALITY",
    "EVIDENCE + REFRAMING",
    "KEY PRODUCT DECISIONS",
    "FINAL EXPERIENCE",
    "SYSTEM DETAILS",
    "VALIDATION + ITERATION",
    "IMPACT",
    "REFLECTION + NEXT BET",
    "NEXT PROJECT",
  ];
  const sections = page.locator("section[data-case-section]");
  await expect(sections).toHaveCount(sectionNames.length);
  for (const [index, name] of sectionNames.entries()) {
    const section = sections.nth(index);
    await expect(section).toHaveAttribute(
      "data-case-section",
      String(index + 1).padStart(2, "0"),
    );
    await expect(section.locator(".sample-section-label")).toContainText(name);
    await expect(section.locator(".sample-section-label")).toBeVisible();
    await expect(section.locator("[data-guide-note]")).toHaveCount(1);
  }
  await expect(page.locator(".sample-notice")).toContainText("not client work");
  await expect(page.locator("[data-guide-note]").first()).toBeHidden();
  const guide = page.getByRole("button", { name: "Explain this structure" });
  await guide.focus();
  const before = await guide.boundingBox();
  await page.keyboard.press("Space");
  await expect(guide).toBeFocused();
  await expect(guide).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("[data-guide-note]").first()).toBeVisible();
  expect(Math.abs((await guide.boundingBox()).y - before.y)).toBeLessThan(2);
  await page.keyboard.press("Space");
  await expect(page.locator("[data-guide-note]").first()).toBeHidden();
  await page.locator('.case-index a[href="#decisions"]').click();
  await expect(page).toHaveURL(/#decisions$/);
  await page.reload();
  await expect(page.locator("#decisions")).toBeInViewport();
  await page.locator(".sample-next").click();
  await expect(page).toHaveURL(/projects\/chip-2\/$/);
  await page.goBack();
  await expect(page.locator("#sample-title")).toBeAttached();
  expect(errors).toEqual([]);
});

test("compact chapter navigation tracks the separately addressable sections", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const [id, group] of [
    ["context-system", "overview"],
    ["success-definition", "problem"],
    ["designing-for-reality", "problem"],
    ["evidence-reframing", "problem"],
    ["system-details", "solution"],
    ["validation-iteration", "solution"],
    ["reflection-next-bet", "impact"],
  ]) {
    await page.goto(`${route}#${id}`);
    await expect(page.locator(`#${id}`)).toBeInViewport();
    await expect(
      page.locator(`.case-index a[href="#${group}"]`),
    ).toHaveAttribute("aria-current", "location");
  }
  await page.reload();
  await expect(page).toHaveURL(/#reflection-next-bet$/);
  await expect(page.locator("#reflection-next-bet")).toBeInViewport();
});

test("referral validates, preserves Back, sends once, and restarts", async ({
  page,
}) => {
  await page.goto(route);
  const app = page.locator("[data-referral-app]");
  await expect(app).toBeVisible();
  await app.getByRole("button", { name: "Review handoff" }).click();
  await expect(app.locator("[data-referral-error]")).toContainText(
    "Choose a receiving clinic",
  );
  await expect(app.getByRole("radio").first()).toBeFocused();
  await app.getByRole("radio", { name: /East Community Clinic/ }).check();
  await app.getByRole("button", { name: "Review handoff" }).click();
  await expect(app.locator('[data-referral-step="review"]')).toBeVisible();
  await app.getByRole("button", { name: "Back", exact: false }).click();
  await expect(
    app.getByRole("radio", { name: /East Community Clinic/ }),
  ).toBeChecked();
  await app.getByRole("button", { name: "Review handoff" }).click();
  await app
    .getByRole("button", { name: "Confirm handoff" })
    .evaluate((button) => {
      button.click();
      button.click();
    });
  await expect(app.locator("[data-referral-result]")).toHaveText(
    "Sent. The next owner is clear.",
  );
  await expect(app.locator("[data-referral-result]")).toBeFocused();
  await expect(
    app.getByRole("checkbox", { name: "Simulate offline" }),
  ).toBeDisabled();
  await app.getByRole("button", { name: "Restart simulation" }).click();
  await expect(app.getByRole("radio").first()).not.toBeChecked();
  await expect(app.getByRole("checkbox")).not.toBeChecked();
});

test("offline queue sends explicitly after reconnection and sample state is isolated", async ({
  page,
}) => {
  await page.goto(route);
  const app = page.locator("[data-referral-app]");
  await app.getByRole("checkbox", { name: "Simulate offline" }).check();
  await app.getByRole("radio", { name: /North Community Clinic/ }).check();
  await app.getByRole("button", { name: "Review handoff" }).click();
  await expect(app.locator("[data-referral-review-status]")).toContainText(
    "queued",
  );
  await app.getByRole("button", { name: "Confirm handoff" }).click();
  await expect(app.locator("[data-referral-result]")).toHaveText(
    "Queued until connected.",
  );
  await app.getByRole("button", { name: "Reconnect & send" }).click();
  await expect(app.locator("[data-referral-result]")).toHaveText(
    "Sent. The next owner is clear.",
  );
  await expect(app.locator('[data-referral-action="reconnect"]')).toBeHidden();
  await page.reload();
  await expect(app.getByRole("radio").first()).not.toBeChecked();
  await expect(app.getByRole("checkbox")).not.toBeChecked();
});

test("sample gallery uses captions, zoom, boundaries, Escape and focus return", async ({
  page,
}) => {
  await page.goto(route);
  await page.locator(".case-cover").click();
  const dialog = page.locator("#media-dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.locator("#media-caption")).toContainText("fictional");
  await expect(
    dialog.getByRole("button", { name: "Previous image" }),
  ).toBeDisabled();
  await page.keyboard.press("+");
  await expect(dialog.locator("[data-zoom-reset]")).toHaveText("150%");
  await page.keyboard.press("0");
  for (let index = 0; index < 3; index++)
    await page.keyboard.press("ArrowRight");
  await expect(
    dialog.getByRole("button", { name: "Next image" }),
  ).toBeDisabled();
  await expect(dialog.locator("#media-caption")).toContainText(
    "delivery states",
  );
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(page.locator(".case-cover")).toBeFocused();
});

test("JavaScript-disabled and failed sample module preserve walkthrough, evidence and guide", async ({
  browser,
  page,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const plain = await context.newPage();
  await plain.goto(route);
  await expect(plain.locator("[data-referral-fallback]")).toBeVisible();
  await expect(plain.locator("[data-referral-app]")).toBeHidden();
  const guide = plain.locator("[data-guide-note]").first();
  await guide.locator("summary").click();
  await expect(guide.locator("p")).toBeVisible();
  await plain
    .getByText("Explore the illustrative evidence", { exact: true })
    .click();
  await expect(
    plain.locator("#evidence-reframing .sample-deep-copy"),
  ).toBeVisible();
  await expect(plain.locator("section[data-case-section]")).toHaveCount(14);
  await expect(plain.locator("#system-details .sample-figure")).toBeVisible();
  await expect(plain.locator(".case-cover")).toHaveAttribute(
    "href",
    /hero\.svg$/,
  );
  await context.close();
  await page.route(/\/assets\/sample-case-[^/]+\.js$/, (request) =>
    request.abort(),
  );
  await page.goto(route);
  await expect(page.locator("[data-referral-fallback]")).toBeVisible();
  await expect(page.locator("[data-guide-toggle]")).toBeHidden();
  await expect(page.locator("[data-guide-note]").first()).toBeVisible();
});

for (const theme of ["dark", "light"]) {
  test(`sample ${theme} layout fits four sizes, supports reduced motion and passes accessibility checks`, async ({
    page,
  }) => {
    await page.addInitScript(
      (value) => localStorage.setItem("intent-portfolio-theme", value),
      theme,
    );
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(route);
    for (const width of [390, 834, 1440, 1920]) {
      await page.setViewportSize({ width, height: 1000 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      ).toBe(true);
      await expect(page.locator("[data-sample-depth]")).toHaveCSS(
        "transform",
        "none",
      );
    }
    const audit = async () => {
      const result = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(
        result.violations.map(({ id, nodes }) => ({
          id,
          targets: nodes.map((node) => node.target),
        })),
      ).toEqual([]);
    };
    await audit();
    await page.getByRole("button", { name: "Explain this structure" }).click();
    await audit();
    await page.locator(".case-cover").click();
    await audit();
  });
}

test("capability-style sample reveal reverses and cleans up on motion and viewport changes", async ({
  page,
}) => {
  await page.goto(route);
  const surface = page.locator("[data-sample-depth]");
  await surface.scrollIntoViewIfNeeded();
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(surface).toHaveCSS("transform", "none");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(surface).toHaveCSS("transform", "none");
  await expect(page.locator(".pin-spacer")).toHaveCount(0);
});
