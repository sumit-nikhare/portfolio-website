import test from "node:test";
import assert from "node:assert/strict";
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  rmSync,
  existsSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { resolveSiteSettings } from "../scripts/site-settings.mjs";
import { checkBuild } from "../scripts/check-build.mjs";

const config = { preview: true, origin: "", base: "/" };
const verified = {
  ...config,
  preview: false,
  origin: "https://portfolio.example",
  identityVerified: true,
  projectsVerified: true,
  testimonialsVerified: true,
  contactVerified: true,
  resumeVerified: true,
  articlesVerified: true,
  contactEmail: "designer@example.com",
  resumePdf: "assets/resume.pdf",
};

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), "portfolio-deployment-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const write = (path, content) => {
    const file = join(root, path);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, content);
  };
  return { root, write };
}

function runScript(script, root, overrides = {}) {
  const env = { ...process.env };
  delete env.BASE_PATH;
  delete env.SITE_ORIGIN;
  return spawnSync(
    process.execPath,
    [fileURLToPath(new URL(`../scripts/${script}.mjs`, import.meta.url))],
    { cwd: root, env: { ...env, ...overrides }, encoding: "utf8" },
  );
}

const page = (content = "", sample = false) =>
  `<!doctype html><html lang="en"><head><meta name="robots" content="noindex, nofollow"></head><body${sample ? ' data-sample-case="continuum"' : ""}>${content}</body></html>`;

function buildFixture(t, base = "/") {
  const result = fixture(t);
  const { write } = result;
  write(
    "index.html",
    page(
      `<a href="${base}work/#project">Work</a><link href="${base}assets/site.css" rel="stylesheet">`,
    ),
  );
  write(
    "work/index.html",
    page(
      '<h1 id="project">Work</h1><img src="../assets/image.svg" alt="Project">',
    ),
  );
  write("404.html", page(`<a href="${base}">Home</a>`));
  write("assets/site.css", 'body { background: url("./image.svg"); }');
  write("assets/image.svg", '<svg xmlns="http://www.w3.org/2000/svg"></svg>');
  write("robots.txt", "User-agent: *\nDisallow: /\n");
  write("_headers", "/*\n  X-Robots-Tag: noindex, nofollow\n");
  write(".nojekyll", "");
  return result;
}

test("hosting settings preserve root defaults and use host-provided GitHub paths consistently", () => {
  assert.deepEqual(resolveSiteSettings(config), config);
  const result = resolveSiteSettings(config, {
    SITE_ORIGIN: "https://sumit-nikhare.github.io/",
    BASE_PATH: "/portfolio-website",
  });
  assert.equal(result.origin, "https://sumit-nikhare.github.io");
  assert.equal(result.base, "/portfolio-website/");
  assert.equal(result.preview, true);
  assert.deepEqual(
    resolveSiteSettings(
      { ...config, origin: "https://old.example", base: "/old/" },
      { SITE_ORIGIN: "", BASE_PATH: "" },
    ),
    config,
  );
});

test("hosting settings reject URLs and paths that would break deployed metadata or asset paths", () => {
  for (const origin of [
    "http://portfolio.example",
    "https://portfolio.example/work/",
    "https://user:password@portfolio.example",
    "https://portfolio.example/?query=1",
    "https://portfolio.example/#work",
    "not-a-url",
  ])
    assert.throws(() => resolveSiteSettings({ ...config, origin }));
  for (const base of [
    "portfolio",
    "//other.example/",
    "/../",
    "/./",
    "/space here/",
    "/?query/",
    "/%2e%2e/",
  ])
    assert.throws(() => resolveSiteSettings({ ...config, base }));
  assert.throws(() => resolveSiteSettings({ ...config, preview: "false" }));
});

test("deployment permits a labeled preview while retaining the final-release content gate", (t) => {
  const { root, write } = fixture(t);
  const draft = { ...verified, ...config, projectsVerified: false };
  write("site.config.json", JSON.stringify(draft));
  write("public/assets/resume.pdf", "%PDF-1.4\n");
  write("index.html", page("<p data-freelance-placeholder>To confirm</p>"));
  const preview = runScript("deploy-check", root);
  assert.equal(preview.status, 0, preview.stderr);
  assert.match(preview.stdout, /Public preview/);
  assert.deepEqual(
    JSON.parse(readFileSync(join(root, "site.config.json"), "utf8")),
    draft,
  );
  write(
    "site.config.json",
    JSON.stringify({ ...verified, projectsVerified: false }),
  );
  const release = runScript("deploy-check", root);
  assert.equal(release.status, 1);
  assert.match(release.stderr, /projectsVerified/);
  assert.match(release.stderr, /Unfilled content/);
});

test("final releases require resolved placeholders even when all verification flags are set", (t) => {
  const { root, write } = fixture(t);
  write("site.config.json", JSON.stringify(verified));
  write("public/assets/resume.pdf", "%PDF-1.4\n");
  for (const marker of [
    "To confirm",
    "data-freelance-placeholder",
    "data-testimonial-placeholder",
  ]) {
    write(
      "index.html",
      page(`<p ${marker.startsWith("data-") ? marker : ""}>${marker}</p>`),
    );
    const result = runScript("deploy-check", root);
    assert.equal(result.status, 1, marker);
    assert.match(result.stderr, /Unfilled content/);
  }
  write("index.html", page("<h1>Reviewed portfolio</h1>"));
  const result = runScript("deploy-check", root);
  assert.equal(result.status, 0, result.stderr);
});

test("deployment rejects a missing résumé instead of shipping a broken download", (t) => {
  const { root, write } = fixture(t);
  write(
    "site.config.json",
    JSON.stringify({ ...config, resumePdf: "assets/missing.pdf" }),
  );
  const result = runScript("deploy-check", root);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /résumé PDF must exist/);
});

test("compiled links, fragments, and CSS assets resolve on root and subdirectory hosting", (t) => {
  for (const base of ["/", "/portfolio-website/"]) {
    const { root } = buildFixture(t, base);
    const result = checkBuild(root, { ...config, base });
    assert.equal(result.pages, 3);
    assert.equal(result.references, 5);
  }
});

test("compiled output checks catch wrong base paths, missing assets, and broken fragments", (t) => {
  const { root, write } = buildFixture(t, "/portfolio-website/");
  const settings = { ...config, base: "/portfolio-website/" };
  write("index.html", page('<a href="/work/">Wrong path</a>'));
  assert.throws(() => checkBuild(root, settings), /escapes BASE_PATH/);
  write("index.html", page('<img src="assets/missing.svg" alt="Missing">'));
  assert.throws(() => checkBuild(root, settings), /Missing local file/);
  write("index.html", page('<a href="work/#missing">Missing anchor</a>'));
  assert.throws(() => checkBuild(root, settings), /Missing fragment/);
});

test("compiled previews require consistent indexing rules and valid accessible references", (t) => {
  const { root, write } = buildFixture(t);
  write("index.html", "<!doctype html><title>No robots policy</title>");
  assert.throws(() => checkBuild(root, config), /Missing noindex/);
  write("index.html", page('<h1 id="same">One</h1><p id="same">Two</p>'));
  assert.throws(() => checkBuild(root, config), /Duplicate IDs/);
  write("index.html", page('<button aria-controls="missing">Open</button>'));
  assert.throws(() => checkBuild(root, config), /Broken ARIA reference/);
  write("index.html", page("<h1>Preview</h1>"));
  write("sitemap.xml", "<urlset></urlset>");
  assert.throws(() => checkBuild(root, config), /must not include a sitemap/);
});

test("postbuild applies the hosting URL, excludes the fictional sample, and removes stale release sitemaps", (t) => {
  const { root, write } = fixture(t);
  const env = {
    SITE_ORIGIN: "https://designer.github.io",
    BASE_PATH: "/portfolio-website/",
  };
  write("site.config.json", JSON.stringify({ ...config, preview: false }));
  write("dist/index.html", page("<h1>Portfolio</h1>"));
  write(
    "dist/projects/sample-continuum/index.html",
    page("<h1>Fictional sample</h1>", true),
  );
  const release = runScript("postbuild", root, env);
  assert.equal(release.status, 0, release.stderr);
  const sitemap = readFileSync(join(root, "dist/sitemap.xml"), "utf8");
  assert.match(sitemap, /https:\/\/designer.github.io\/portfolio-website\//);
  assert.doesNotMatch(sitemap, /sample-continuum|forma/);
  assert.equal(
    readFileSync(join(root, "dist/_headers"), "utf8"),
    "/portfolio-website/projects/sample-continuum/*\n  X-Robots-Tag: noindex, nofollow\n",
  );
  assert.match(
    readFileSync(join(root, "dist/projects/forma/index.html"), "utf8"),
    /href="\/portfolio-website\/projects\/chip-2\/"/,
  );
  write("site.config.json", JSON.stringify(config));
  const preview = runScript("postbuild", root, env);
  assert.equal(preview.status, 0, preview.stderr);
  assert.equal(existsSync(join(root, "dist/sitemap.xml")), false);
  assert.equal(
    readFileSync(join(root, "dist/_headers"), "utf8"),
    "/*\n  X-Robots-Tag: noindex, nofollow\n",
  );
  assert.match(
    readFileSync(join(root, "dist/robots.txt"), "utf8"),
    /Disallow: \//,
  );
});
