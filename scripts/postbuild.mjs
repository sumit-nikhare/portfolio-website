import { readFileSync, writeFileSync, readdirSync, mkdirSync } from "node:fs";
const settings = JSON.parse(readFileSync("site.config.json", "utf8"));
const base = process.env.BASE_PATH || settings.base || "/";
const origin = settings.origin.replace(/\/$/, "");
const pages = [];
function walk(dir = "dist", prefix = "") {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory() && entry.name !== "assets")
      walk(`${dir}/${entry.name}`, `${prefix}${entry.name}/`);
    else if (entry.name === "index.html")
      pages.push(`${origin}${base}${prefix}`);
  }
}
walk();
// Preserve old preview bookmarks without including aliases in the sitemap.
const redirects = {
  forma: "chip-2",
  trace: "samasta",
  offscript: "cho-soft",
  relay: "ai-enabled",
  fieldnote: "abdm-abha",
  common: "anarock",
  muse: "tarp",
};
for (const [previous, current] of Object.entries(redirects)) {
  const directory = `dist/projects/${previous}`;
  const destination = `${base}projects/${current}/`;
  mkdirSync(directory, { recursive: true });
  writeFileSync(
    `${directory}/index.html`,
    `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0;url=${destination}"><title>Project moved — Sumit Nikhare</title></head><body><p>This project now has a new address. <a href="${destination}">Open the project</a>.</p></body></html>`,
  );
}
writeFileSync("dist/.nojekyll", "");
if (settings.preview || !origin)
  writeFileSync("dist/robots.txt", "User-agent: *\nDisallow: /\n");
else {
  writeFileSync(
    "dist/robots.txt",
    `User-agent: *\nAllow: /\nSitemap: ${origin}${base}sitemap.xml\n`,
  );
  writeFileSync(
    "dist/sitemap.xml",
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.map((url) => `<url><loc>${url}</loc></url>`).join("")}</urlset>`,
  );
}
console.log(
  `Prepared ${pages.length} pages. ${settings.preview ? "Preview is excluded from search indexing." : "Search metadata ready."}`,
);
