import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { resolve, relative, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { readSiteSettings } from "./site-settings.mjs";

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};
const decode = (value) =>
  value
    .replaceAll("&amp;", "&")
    .replace(/&#(x[\da-f]+|\d+);/gi, (_, code) =>
      String.fromCodePoint(
        code[0].toLowerCase() === "x"
          ? parseInt(code.slice(1), 16)
          : Number(code),
      ),
    );

export function checkBuild(directory, settings) {
  const root = resolve(directory);
  assert(existsSync(root), "Build output is missing. Run npm run build first.");
  const files = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = resolve(dir, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (entry.isFile()) files.push(path);
    }
  };
  walk(root);
  for (const required of [
    "index.html",
    "404.html",
    "robots.txt",
    ".nojekyll",
    "_headers",
  ])
    assert(
      existsSync(resolve(root, required)),
      `Missing deployment file: ${required}`,
    );
  const pages = new Map();
  for (const file of files.filter((path) => extname(path) === ".html")) {
    const html = readFileSync(file, "utf8");
    assert(
      !html.includes("%BASE_URL%") && !html.includes("{{"),
      `Unresolved template in ${relative(root, file)}`,
    );
    const ids = [...html.matchAll(/(?<![\w-])id=["']([^"']+)["']/g)].map(
      (match) => match[1],
    );
    assert(
      ids.length === new Set(ids).size,
      `Duplicate IDs in ${relative(root, file)}`,
    );
    if (settings.preview || html.includes('data-sample-case="continuum"'))
      assert(
        /<meta\b[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(
          html,
        ),
        `Missing noindex in ${relative(root, file)}`,
      );
    for (const match of html.matchAll(
      /aria-(?:labelledby|describedby|controls)=["']([^"']+)["']/g,
    ))
      assert(
        match[1].split(/\s+/).every((id) => ids.includes(id)),
        `Broken ARIA reference in ${relative(root, file)}: ${match[1]}`,
      );
    pages.set(file, { html, ids });
  }
  const host = settings.origin || "https://build.invalid";
  let references = 0;
  for (const file of files.filter((path) =>
    [".html", ".css"].includes(extname(path)),
  )) {
    const source = readFileSync(file, "utf8");
    const refs =
      extname(file) === ".html"
        ? [...source.matchAll(/(?<![\w-])(?:href|src)=["']([^"']+)["']/g)].map(
            (match) => match[1],
          )
        : [...source.matchAll(/url\(\s*["']?([^\s"')]+)["']?\s*\)/g)].map(
            (match) => match[1],
          );
    if (extname(file) === ".html")
      for (const match of source.matchAll(/(?<![\w-])srcset=["']([^"']+)["']/g))
        refs.push(
          ...match[1].split(",").map((item) => item.trim().split(/\s+/)[0]),
        );
    for (const ref of refs) {
      const url = new URL(
        decode(ref),
        `${host}${settings.base}${relative(root, file).split("\\").join("/")}`,
      );
      if (url.origin !== host) continue;
      assert(
        url.pathname.startsWith(settings.base),
        `Link escapes BASE_PATH in ${relative(root, file)}: ${ref}`,
      );
      let target = resolve(
        root,
        decodeURIComponent(url.pathname.slice(settings.base.length)),
      );
      assert(
        !relative(root, target).startsWith(".."),
        `Link escapes build output: ${ref}`,
      );
      if (existsSync(target) && statSync(target).isDirectory())
        target = resolve(target, "index.html");
      assert(
        existsSync(target),
        `Missing local file in ${relative(root, file)}: ${ref}`,
      );
      if (url.hash && pages.has(target))
        assert(
          pages.get(target).ids.includes(decodeURIComponent(url.hash.slice(1))),
          `Missing fragment in ${relative(root, file)}: ${ref}`,
        );
      references++;
    }
  }
  const robots = readFileSync(resolve(root, "robots.txt"), "utf8");
  const headers = readFileSync(resolve(root, "_headers"), "utf8");
  if (settings.preview) {
    assert(robots.includes("Disallow: /"), "Preview robots policy is missing.");
    assert(
      headers.includes("/*\n  X-Robots-Tag: noindex, nofollow"),
      "Preview response header is missing.",
    );
    assert(
      !existsSync(resolve(root, "sitemap.xml")),
      "A preview must not include a sitemap.",
    );
  } else {
    assert(settings.origin, "An indexed release needs SITE_ORIGIN.");
    const sitemap = readFileSync(resolve(root, "sitemap.xml"), "utf8");
    assert(
      !sitemap.includes("sample-continuum"),
      "The fictional sample must stay outside the sitemap.",
    );
    assert(
      robots.includes(`Sitemap: ${settings.origin}${settings.base}sitemap.xml`),
      "Sitemap host/base differs from the build.",
    );
  }
  return { pages: pages.size, references, files: files.length };
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    const result = checkBuild("dist", readSiteSettings());
    console.log(
      `Deployment output checked: ${result.pages} HTML pages, ${result.references} local references, ${result.files} files; paths and indexing rules pass.`,
    );
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
