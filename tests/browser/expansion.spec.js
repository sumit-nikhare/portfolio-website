import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Loader holds are tested separately in motion.spec.js.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem("intent-portfolio-visits", "1"),
  );
});
const mainPages = ["/about/", "/contact/", "/resume/", "/work/", "/blogs/"];
const newCases = ["ai-enabled", "abdm-abha", "anarock", "tarp"];
const articles = [
  "the-next-useful-action",
  "motion-with-a-purpose",
  "show-the-design-decisions",
];

test("new pages fit mobile, tablet, desktop, and wide screens", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [360, 834, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [...mainPages, "/blogs/the-next-useful-action/"]) {
      await page.goto(route);
      await expect(page.locator("h1")).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
        `${route} at ${width}px`,
      ).toBe(true);
    }
  }
});
test("About has six sections and links to résumé and contact", async ({
  page,
}) => {
  await page.goto("/about/");
  await expect(page.locator("main > section")).toHaveCount(6);
  await page.getByRole("link", { name: "The résumé version" }).click();
  await expect(page).toHaveURL(/\/resume\/$/);
  await page.getByRole("link", { name: "Contact page", exact: true }).click();
  await expect(page).toHaveURL(/\/contact\/$/);
});
test("seven-project filters, list view, URL state and case links work", async ({
  page,
}) => {
  await page.goto("/work/");
  await expect(page.locator("[data-collection-item]")).toHaveCount(7);
  for (const [category, count] of [
    ["mobile", 2],
    ["systems", 2],
    ["data", 1],
    ["product", 2],
    ["all", 7],
  ]) {
    await page.locator(`[data-filter="${category}"]`).click();
    await expect(page.locator("[data-collection-item]:visible")).toHaveCount(
      count,
    );
  }
  await page.getByRole("button", { name: "List view", exact: true }).click();
  await expect(page.locator("[data-collection-grid]")).toHaveClass(/is-list/);
  await page.reload();
  await expect(
    page.getByRole("button", { name: "List view", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.locator('[data-filter="systems"]').click();
  await page.locator('[data-project-link="anarock"]').click();
  await expect(page).toHaveURL(/\/projects\/anarock\/$/);
  await page.goBack();
  await expect(page.locator("[data-collection-item]:visible")).toHaveCount(2);
});
test("all seven case studies form one navigation chain and new galleries work", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const names = ["chip-2", "samasta", "cho-soft", ...newCases];
  for (let i = 0; i < names.length; i++) {
    const route = `/projects/${names[i]}/`;
    await page.goto(route);
    await page.reload();
    await expect(page.locator(".next-project")).toHaveAttribute(
      "href",
      `/projects/${names[(i + 1) % 7]}/`,
    );
    if (newCases.includes(names[i])) {
      await page.locator(".case-cover").click();
      await expect(page.locator("#media-dialog")).toBeVisible();
      await expect
        .poll(() =>
          page
            .locator("[data-media-image]")
            .evaluate((img) => img.complete && img.naturalWidth > 0),
        )
        .toBe(true);
      await page.getByRole("button", { name: "Zoom in", exact: true }).click();
      await expect(page.locator("[data-zoom-reset]")).toHaveText("150%");
      await page.keyboard.press("Escape");
      await page.getByRole("tab", { name: "States" }).click();
      await expect(page.locator(`#${names[i]}-ui`)).toBeVisible();
    }
  }
});
test("contact validates, composes safely, invalidates edited drafts, copies and resets", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const sent = [];
  page.on("request", (r) => {
    if (r.method() === "POST") sent.push(r.url());
  });
  await page.goto("/contact/");
  await page.getByRole("button", { name: "Prepare message" }).click();
  await expect(page.locator("[data-message-preview]")).toBeHidden();
  await page
    .getByRole("textbox", { name: "Your name (required)", exact: true })
    .fill("A visitor");
  await page
    .getByLabel("Email address", { exact: false })
    .fill("visitor@example.com");
  await page.getByLabel("A little context", { exact: false }).fill("   ");
  await page.getByRole("button", { name: "Prepare message" }).click();
  await expect(page.locator("[data-message-preview]")).toBeHidden();
  await page
    .getByLabel("A little context", { exact: false })
    .fill("We are exploring a new product. <script>alert(1)</script>");
  await page.getByRole("button", { name: "Prepare message" }).click();
  await expect(page.locator("[data-message-text]")).toContainText(
    "<script>alert(1)</script>",
  );
  await expect(page.locator("[data-message-text] script")).toHaveCount(0);
  await expect(page.locator("[data-send-email]")).toBeVisible();
  await expect(page.locator("[data-send-email]")).toHaveAttribute(
    "href",
    /^mailto:sumit\.v\.nikhare@gmail\.com\?subject=/,
  );
  await page.getByRole("button", { name: "Copy message", exact: true }).click();
  await expect(page.locator("[data-copy-status]")).toContainText(
    "Message copied",
  );
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    "A visitor",
  );
  await page
    .getByRole("textbox", { name: "Your name (required)", exact: true })
    .fill("Updated visitor");
  await expect(page.locator("[data-message-preview]")).toBeHidden();
  await page.getByRole("button", { name: "Prepare message" }).click();
  await expect(page.locator("[data-message-text]")).toContainText(
    "Updated visitor",
  );
  await page.getByRole("button", { name: "Clear form", exact: true }).click();
  await expect(page.locator("#contact-name")).toHaveValue("");
  await expect(page.locator("[data-message-preview]")).toBeHidden();
  expect(sent).toEqual([]);
});
test("resume print action, paper layout, and PDF download work", async ({
  page,
}) => {
  await page.goto("/resume/");
  await page.evaluate(() => {
    window.print = () => {
      window.printRequested = true;
    };
  });
  await page.getByRole("button", { name: "Print résumé" }).click();
  expect(await page.evaluate(() => window.printRequested)).toBe(true);
  await expect(
    page.getByRole("link", { name: "Download résumé PDF" }),
  ).toHaveAttribute(
    "href",
    "/assets/Resume-Sumit-Nikhare-Product-Designer.pdf",
  );
  await page.emulateMedia({ media: "print" });
  await expect(page.locator(".site-header")).toBeHidden();
  await expect(page.locator(".resume-paper")).toBeVisible();
  expect(
    await page
      .locator(".resume-paper")
      .evaluate((el) => getComputedStyle(el).backgroundColor),
  ).toBe("rgb(255, 255, 255)");
});
test("blog search, filters, empty state and article copy link work", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/blogs/");
  await expect(page.locator(".site-loader")).not.toBeVisible();
  await page.getByLabel("Search articles", { exact: true }).fill("motion");
  await expect(page.locator("[data-collection-item]:visible")).toHaveCount(1);
  await page.reload();
  await expect(page.getByLabel("Search articles", { exact: true })).toHaveValue(
    "motion",
  );
  await page.locator('[data-filter="product"]').click();
  await expect(page.locator("[data-collection-empty]")).toBeVisible();
  await page.getByRole("button", { name: "Reset search and filters" }).click();
  await expect(page.locator("[data-collection-item]:visible")).toHaveCount(3);
  for (const slug of articles) {
    await page.goto(`/blogs/${slug}/`);
    await page.reload();
    await expect(page.locator(".article-chapter")).toHaveCount(5);
    await page.getByRole("button", { name: "Copy article link" }).click();
    await expect(page.locator("[data-share-status]")).toHaveText(
      "Article link copied.",
    );
    await expect(page.locator(".article-next a")).toHaveAttribute(
      "href",
      /\/blogs\/.+\//,
    );
  }
});
test("all new content stays available without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:4173/work/");
  await expect(page.locator("[data-collection-item]:visible")).toHaveCount(7);
  await expect(page.locator(".footer-page-nav a")).toHaveCount(6);
  await page.goto("http://127.0.0.1:4173/blogs/");
  await expect(page.locator("[data-collection-item]:visible")).toHaveCount(3);
  await page.goto("http://127.0.0.1:4173/contact/");
  await expect(
    page.getByText("The message builder needs JavaScript.", { exact: false }),
  ).toBeVisible();
  await page.goto("http://127.0.0.1:4173/projects/ai-enabled/");
  await expect(page.locator(".evolution-panel:visible")).toHaveCount(3);
  await context.close();
});
for (const route of [
  ...mainPages,
  ...newCases.map((n) => `/projects/${n}/`),
  ...articles.map((n) => `/blogs/${n}/`),
]) {
  test(`new page accessibility and runtime: ${route}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(route);
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
    expect(errors).toEqual([]);
  });
}

test("new page heading structure and visible labels are consistent", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const route of ["/work/", "/blogs/", "/resume/"]) {
    await page.goto(route);
    await expect(page.locator(".site-loader")).not.toBeVisible();
    const result = await new AxeBuilder({ page })
      .withRules(["heading-order", "label-content-name-mismatch"])
      .analyze();
    expect(
      result.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => n.target),
      })),
    ).toEqual([]);
  }
});
