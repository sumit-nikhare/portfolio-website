import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Loader holds are tested separately in motion.spec.js.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem("intent-portfolio-visits", "1"),
  );
});

test("homepage has no overflow at mobile, tablet, desktop, and wide sizes", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const [width, height] of [
    [360, 800],
    [390, 844],
    [834, 1112],
    [1440, 1000],
    [1920, 1080],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
      `horizontal overflow at ${width}px`,
    ).toBe(true);
  }
});

test("3D scene initializes, responds to scroll, and cover distortion has no rendering errors", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  await page.goto("/");
  await expect(page.locator(".sculpture.is-ready canvas")).toBeVisible();
  await page.mouse.move(1050, 430);
  await page.evaluate(() => window.scrollTo(0, 600));
  await expect(page.locator(".pin-spacer")).toBeAttached();
  await page.locator('[data-project-link="chip-2"]').scrollIntoViewIfNeeded();
  await page.locator('[data-project-link="chip-2"]').hover();
  await expect(
    page.locator('[data-project-link="chip-2"] canvas'),
  ).toBeAttached();
  await page.waitForTimeout(300);
  expect(errors).toEqual([]);
  await expect(page.locator('[data-project-link="chip-2"] canvas')).toHaveCount(
    0,
  );
});

test("motion preference disables graphics and persists after navigation", async ({
  page,
}) => {
  await page.goto("/");
  const toggle = page.getByRole("button", { name: /Full motion enabled/ });
  await toggle.click();
  await expect(page.locator("html")).toHaveAttribute("data-motion", "reduced");
  await expect(page.locator(".pin-spacer")).toHaveCount(0);
  await expect(page.locator(".sculpture canvas")).toHaveCount(0);
  await page.goto("/playground/");
  await expect(
    page.getByRole("button", { name: /Reduced motion enabled/ }),
  ).toBeVisible();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-motion", "reduced");
});

test("navigation supports focus previews, Escape, and focus restoration", async ({
  page,
}) => {
  await page.goto("/");
  const opener = page.getByRole("button", { name: "Menu", exact: true });
  await opener.click();
  const dialog = page.getByRole("dialog", { name: "TAKE A LOOK AROUND" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("link", { name: /Playground/ }).focus();
  await expect(dialog.locator("[data-nav-preview]")).toHaveAttribute(
    "src",
    /cho-soft-cover/,
  );
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(opener).toBeFocused();
  await opener.click();
  await dialog.getByRole("link", { name: /Playground/ }).click();
  await expect(page).toHaveURL(/\/playground\/$/);
});

test("all case studies open directly, refresh, and expose working image galleries", async ({
  page,
}) => {
  for (const name of ["chip-2", "samasta", "cho-soft"]) {
    await page.goto(`/projects/${name}/`);
    await page.reload();
    await expect(page.locator(".case-hero h1")).toContainText(
      name === "chip-2"
        ? "CHIP-2"
        : name === "samasta"
          ? "Samasta"
          : "CHO Soft",
    );
    await page.locator(".case-cover").click();
    const viewer = page.getByRole("dialog", {
      name: new RegExp(name === "cho-soft" ? "CHO Soft" : name, "i"),
    });
    await expect(viewer).toBeVisible();
    await expect(
      viewer.getByRole("button", { name: "Previous image" }),
    ).toBeDisabled();
    await viewer.getByRole("button", { name: "Zoom in" }).click();
    await expect(viewer.getByRole("button", { name: "Reset zoom" })).toHaveText(
      "150%",
    );
    await page.keyboard.press("0");
    await expect(viewer.getByRole("button", { name: "Reset zoom" })).toHaveText(
      "100%",
    );
    await page.keyboard.press("ArrowRight");
    await expect(viewer.locator("[data-media-count]")).toContainText("02 /");
    const total = await page.locator('[data-gallery="study"]').count();
    for (let i = 2; i < total; i++)
      await viewer.getByRole("button", { name: "Next image" }).click();
    await expect(
      viewer.getByRole("button", { name: "Next image" }),
    ).toBeDisabled();
    await page.keyboard.press("Escape");
    await expect(viewer).not.toBeVisible();
    await expect(page.locator(".case-cover")).toBeFocused();
  }
});

test("design evolution supports arrows, Home/End, and one visible stage", async ({
  page,
}) => {
  await page.goto("/projects/chip-2/");
  const early = page.getByRole("tab", { name: "Workflow" });
  await expect(page.locator(".site-loader")).not.toBeVisible();
  await early.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Patterns" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(page.locator("#chip-2-wire")).toBeVisible();
  await expect(page.locator("#chip-2-early")).not.toBeVisible();
  await page.keyboard.press("End");
  await expect(page.getByRole("tab", { name: "States" })).toBeFocused();
  await page.keyboard.press("Home");
  await expect(early).toBeFocused();
});

test("onboarding validates, preserves preference on Back, completes, and resets repeatedly", async ({
  page,
}) => {
  await page.goto("/playground/");
  const demo = page.locator("[data-demo]");
  for (let i = 0; i < 2; i++) {
    await demo.getByRole("button", { name: /Let’s begin/ }).click();
    await demo.getByRole("button", { name: /Create my space/ }).click();
    await expect(demo.getByRole("alert")).toHaveText(
      "Choose a focus to continue.",
    );
    await demo.getByRole("radio", { name: /Space for deep work/ }).check();
    await demo.getByRole("button", { name: /Back/ }).click();
    await demo.getByRole("button", { name: /Let’s begin/ }).click();
    await expect(
      demo.getByRole("radio", { name: /Space for deep work/ }),
    ).toBeChecked();
    await demo.getByRole("button", { name: /Create my space/ }).click();
    await expect(demo.locator("[data-demo-summary]")).toHaveText(
      "Your focus: Deep work",
    );
    await expect(
      demo.getByRole("heading", { name: /Good things/ }),
    ).toBeFocused();
    await demo.getByRole("button", { name: /Start again/ }).click();
    await expect(
      demo.getByRole("heading", { name: /Make room/ }),
    ).toBeVisible();
    await expect(
      demo.getByRole("radio", {
        name: /Space for deep work/,
        includeHidden: true,
      }),
    ).not.toBeChecked();
  }
});

test("playground typography, component controls, and SVG playback work", async ({
  page,
}) => {
  await page.goto("/playground/");
  await expect(page.locator(".site-loader")).not.toBeVisible();
  await page.getByRole("textbox", { name: "Your words" }).fill("<hello>");
  await expect(page.locator("[data-type-output]")).toHaveText("<hello>");
  await page.getByRole("slider", { name: "Font weight" }).fill("700");
  await expect(page.locator("[data-weight-value]")).toHaveText("700");
  await page.getByRole("slider", { name: "Corner radius" }).fill("40");
  await expect(page.locator("[data-component-card]")).toHaveCSS(
    "border-radius",
    "40px",
  );
  await page.getByRole("checkbox", { name: /breathing room/ }).check();
  const save = page.getByRole("button", { name: /Save something good/ });
  await save.click();
  await expect(page.locator("[data-save-component]")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.locator("[data-save-component]").click();
  await expect(page.locator("[data-save-component]")).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await page.getByRole("button", { name: /Play \/ Replay/ }).click();
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Resume", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Resume", exact: true }).click();
});

test("project navigation and browser history remain ordinary working links", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.locator('[data-project-link="chip-2"]').click();
  await expect(page).toHaveURL(/\/projects\/chip-2\/$/);
  await page.goBack();
  await expect(page).toHaveURL(/:4173\/$/);
  await page.goForward();
  await expect(page.locator(".case-hero h1")).toHaveText("CHIP-2.");
});

test("no-JavaScript mode preserves content, mobile navigation, media links, and demo explanation", async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:4173/");
  await expect(page.locator(".desktop-nav")).toBeVisible();
  await expect(page.locator(".sculpture-fallback")).toBeVisible();
  await page.goto("http://127.0.0.1:4173/projects/chip-2/");
  await expect(page.locator("#chip-2-early")).toBeVisible();
  await expect(page.locator("#chip-2-wire")).toBeVisible();
  await expect(page.locator("#chip-2-ui")).toBeVisible();
  await page.goto("http://127.0.0.1:4173/playground/");
  await expect(page.locator("[data-demo-static]")).toBeVisible();
  await context.close();
});

test("WebGL unavailable still presents the sculpture artwork and project content", async ({
  browser,
}) => {
  const context = await browser.newContext();
  await context.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      return type.startsWith("webgl")
        ? null
        : original.call(this, type, ...args);
    };
  });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:4173/");
  await expect(page.locator(".sculpture-fallback")).toBeVisible();
  await expect(page.locator("[data-project]")).toHaveCount(3);
  await context.close();
});

test("footer signature returns to its resting layout", async ({ page }) => {
  await page.goto("/playground/");
  await page.getByRole("button", { name: /Play with the signature/ }).click();
  await expect(page.locator("[data-signature-letter]")).toHaveCount(15);
  await expect(page.locator("[data-signature-letter]")).toHaveCount(0);
  await expect(page.locator("[data-signature-word]").first()).toHaveText(
    "MADE",
  );
});

for (const route of [
  "/",
  "/projects/chip-2/",
  "/projects/samasta/",
  "/projects/cho-soft/",
  "/playground/",
]) {
  test(`accessibility audit: ${route}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(route);
    await expect(page.locator(".site-loader")).not.toBeVisible();
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(
      result.violations.map((v) => ({
        id: v.id,
        description: v.description,
        nodes: v.nodes.map((n) => n.target),
      })),
    ).toEqual([]);
  });
}

test("dialog accessibility audit", async ({ page }) => {
  await page.goto("/projects/chip-2/");
  await page.locator(".case-cover").click();
  await expect(page.locator(".site-loader")).not.toBeVisible();
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(
    result.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.target),
    })),
  ).toEqual([]);
});

test("visible labels match accessible names", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".site-loader")).not.toBeVisible();
  const result = await new AxeBuilder({ page })
    .withRules(["label-content-name-mismatch"])
    .analyze();
  expect(
    result.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.target),
    })),
  ).toEqual([]);
});
