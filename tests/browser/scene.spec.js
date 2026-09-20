import { test, expect } from "@playwright/test";

test("homepage scene reaches every stage and reverses to the same starting state", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  const scene = page.locator("[data-sculpture]");
  await expect(scene.locator("canvas")).toBeVisible();
  await expect(scene).toHaveClass(/is-ready/);
  const range = await page.locator(".hero").evaluate((hero) => ({
    start: hero.getBoundingClientRect().top + scrollY,
    distance: parseFloat(getComputedStyle(hero.parentElement).paddingBottom),
  }));
  expect(range.distance).toBeGreaterThan(0);
  expect(range.distance).toBeLessThanOrEqual(page.viewportSize().height * 0.8);
  await expect(scene.locator("[data-specialty]")).toHaveCount(3);
  await expect(page.locator("[data-scene-sequence]")).toHaveCount(0);
  for (const [progress, stage] of [
    [0, "assemble"],
    [0.5, "unfold"],
    [1, "resolve"],
    [0.5, "unfold"],
    [0, "assemble"],
  ]) {
    await page.evaluate(({ top }) => scrollTo({ top, behavior: "instant" }), {
      top: range.start + range.distance * progress,
    });
    await expect(scene).toHaveAttribute("data-scene-stage", stage);
    await expect
      .poll(async () => {
        const actual = await scene.evaluate((element) =>
          Number(element.dataset.sceneProgress),
        );
        return Math.abs(actual - progress);
      })
      .toBeLessThan(0.002);
  }
  await page.locator("#work").scrollIntoViewIfNeeded();
  await expect(page.locator("#work .project-card")).toHaveCount(3);
  expect(errors).toEqual([]);
});

test("sculpture entrance starts without a blocking overlay", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".site-loader")).toHaveCount(0);
  await expect(page.locator("#main")).toHaveJSProperty("inert", false);
  await expect(page.locator(".sculpture.is-ready canvas")).toHaveCount(1);
  await expect(page.locator("[data-sculpture]")).toHaveAttribute(
    "data-scene-stage",
    "assemble",
  );
});

test("height, mobile and motion changes remove pins and leave one current scene", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".sculpture.is-ready canvas")).toHaveCount(1);
  for (let repeat = 0; repeat < 2; repeat++) {
    await page.setViewportSize({ width: 1440, height: 620 });
    await expect(page.locator(".pin-spacer")).toHaveCount(0);
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(page.locator(".pin-spacer")).toHaveCount(1);
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.locator(".sculpture canvas")).toHaveCount(0);
    await expect(page.locator("[data-depth-surface]")).toHaveCount(0);
    await expect(page.locator(".pin-spacer")).toHaveCount(0);
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(page.locator(".sculpture.is-ready canvas")).toHaveCount(1);
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".sculpture canvas")).toHaveCount(0);
  await expect(page.locator("[data-depth-surface]")).toHaveCount(0);
  await expect(page.locator(".pin-spacer")).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(page.locator(".sculpture.is-ready canvas")).toHaveCount(1);
});

test("context loss restores readable static artwork without a pinned blank scene", async ({
  page,
}) => {
  await page.goto("/");
  const canvas = page.locator(".sculpture.is-ready canvas");
  await expect(canvas).toBeVisible();
  await canvas.evaluate((element) =>
    element.dispatchEvent(new Event("webglcontextlost", { cancelable: true })),
  );
  await expect(page.locator(".sculpture canvas")).toHaveCount(0);
  await expect(page.locator(".sculpture-fallback")).toHaveCSS("opacity", "1");
  await expect(page.locator("[data-specialty-title]")).toHaveText([
    "Product & UX design",
    "Interaction design",
    "Design systems",
  ]);
  await expect(page.locator(".pin-spacer")).toHaveCount(0);
});

test("project entrances clear their masks and pointer tilt returns to rest", async ({
  page,
}) => {
  await page.goto("/");
  const card = page.locator(".project-card").first();
  await card.scrollIntoViewIfNeeded();
  const image = card.locator(".project-image");
  await expect
    .poll(() => image.evaluate((element) => element.style.clipPath))
    .toBe("");
  await expect
    .poll(() => image.evaluate((element) => element.style.transform))
    .toBe("");
  await card.hover({ position: { x: 40, y: 40 } });
  await page.mouse.move(0, 0);
  await expect
    .poll(() =>
      card
        .locator(".project-depth")
        .evaluate((element) =>
          parseFloat(element.style.getPropertyValue("--depth-yaw")),
        ),
    )
    .toBe(0);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(card.locator(".project-depth")).toHaveCSS("transform", "none");
  await expect(image).toHaveCSS("opacity", "1");
});

test("homepage follows the nine-part brief and retains typography controls and menu-only navigation", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.locator("html")).toHaveClass(/menu-ready/);
  await expect(page.locator(".site-header .desktop-nav")).toHaveCount(0);
  await expect(page.locator(".static-menu")).toBeHidden();
  await expect(page.locator("#main > section")).toHaveCount(8);
  expect(
    await page
      .locator("#main > section, body > .site-footer")
      .evaluateAll((sections) =>
        sections.map((section) => section.id || "hero"),
      ),
  ).toEqual([
    "hero",
    "work",
    "overview",
    "philosophy",
    "playground",
    "testimonials",
    "about",
    "contact",
    "footer",
  ]);
  await expect(page.locator(".project-contribution")).toHaveCount(3);
  await expect(page.locator("[data-home-experiment]")).toHaveCount(3);
  await expect(page.locator("[data-project-year]")).toHaveText([
    "2026 · Sample",
    "To confirm",
    "To confirm",
  ]);
  await expect(page.locator("[data-project]").first()).toHaveAttribute(
    "data-project",
    "sample-continuum",
  );
  await expect(page.locator('[data-project="sample-continuum"]')).toContainText(
    "FICTIONAL SAMPLE",
  );
  await expect(page.locator("#testimonials-note")).toContainText(
    "not quotes or endorsements",
  );
  await expect(page.locator("[data-testimonial-placeholder]")).toHaveCount(2);
  await expect(page.locator("#testimonials blockquote")).toHaveCount(0);
  await expect(page.locator("#overview")).not.toContainText("Permute");
  await expect(page.locator("#about")).toContainText("anime");
  await page.locator("#playground").scrollIntoViewIfNeeded();
  const weight = page.getByRole("slider", { name: "Font weight" });
  await weight.focus();
  await page.keyboard.press("End");
  await expect(weight).toHaveValue("700");
  await expect(page.locator("[data-type-output]")).toHaveCSS(
    "font-weight",
    "700",
  );
  await expect(page.locator("[data-weight-value]")).toHaveText("700");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await weight.focus();
  await page.keyboard.press("Home");
  await expect(page.locator("[data-type-output]")).toHaveCSS(
    "font-weight",
    "300",
  );
  expect(errors).toEqual([]);
});

test("homepage previews lead to real experiments and contact links remain usable", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const id of ["typography", "components", "svg-motion"]) {
    await page.goto("/");
    await page.locator(`[data-home-experiment="${id}"] h3 a`).click();
    await expect(page).toHaveURL(new RegExp(`/playground/#${id}$`));
    await expect(page.locator(`#${id}`)).toBeInViewport();
  }
  await page.goto("/");
  await expect(page.locator('#contact a[href^="mailto:"]')).toHaveAttribute(
    "href",
    "mailto:sumit.v.nikhare@gmail.com",
  );
  await expect(page.locator("#contact a[download]")).toHaveAttribute(
    "href",
    /Resume-Sumit-Nikhare-Product-Designer\.pdf$/,
  );
  await expect(page.locator('#footer a[href^="mailto:"]')).toHaveAttribute(
    "href",
    "mailto:sumit.v.nikhare@gmail.com",
  );
  await expect(page.locator('#footer a[href*="linkedin.com"]')).toHaveCount(1);
  await page.locator(".back-top").click();
  await expect(page.locator("#hero")).toBeInViewport();
});

test("snapshot and philosophy depth clean up when motion and viewport change", async ({
  page,
}) => {
  await page.goto("/");
  const principles = page.locator(".home-principle-grid article");
  await expect(page.locator("[data-principle-depth]")).toHaveCount(3);
  await page.locator("#philosophy").scrollIntoViewIfNeeded();
  await page.locator("#overview").scrollIntoViewIfNeeded();
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const principle of await principles.all())
    await expect(principle).toHaveCSS("transform", "none");
  await expect(page.locator("[data-principle-depth]")).toHaveCount(0);
  await expect(page.locator("[data-fact-depth]")).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(page.locator("[data-principle-depth]")).toHaveCount(3);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator("[data-principle-depth]")).toHaveCount(0);
  await expect(page.locator(".pin-spacer")).toHaveCount(0);
});
