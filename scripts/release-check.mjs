import { readFileSync, readdirSync, existsSync } from "node:fs";
const settings = JSON.parse(readFileSync("site.config.json", "utf8"));
const issues = [];
if (settings.preview) issues.push("The site is still marked as a preview.");
if (!/^https:\/\/[^/]+$/.test(settings.origin))
  issues.push("Set origin to your real HTTPS host, without a trailing path.");
for (const key of [
  "identityVerified",
  "projectsVerified",
  "testimonialsVerified",
  "contactVerified",
  "resumeVerified",
  "articlesVerified",
])
  if (!settings[key])
    issues.push(`${key} must be confirmed after the content is replaced.`);
if (!/^[^\s@?&#]+@[^\s@?&#]+\.[^\s@?&#]+$/.test(settings.contactEmail || ""))
  issues.push("Add your verified contactEmail.");
if (settings.resumePdf && !existsSync("public/" + settings.resumePdf))
  issues.push("The configured résumé PDF does not exist.");
function check(dir = ".") {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (
      [
        "node_modules",
        "dist",
        "public",
        "templates",
        "tests",
        "scripts",
        "artifacts",
      ].includes(entry.name) ||
      entry.name.startsWith(".")
    )
      continue;
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) check(path);
    else if (entry.name.endsWith(".html")) {
      const content = readFileSync(path, "utf8");
      if (
        /YOUR NAME|TESTIMONIAL PLACEHOLDER|awaiting your|awaiting content|Introduction placeholder|CONCEPT PREVIEW|authorship awaiting review|YOUR DATES|Your most recent role|Your qualification/.test(
          content,
        )
      )
        issues.push(`Unfilled content remains in ${path}.`);
    }
  }
}
check();
if (issues.length) {
  console.error(
    "Public release is not ready:\n" +
      issues.map((issue) => `• ${issue}`).join("\n"),
  );
  process.exit(1);
}
console.log("Content readiness checks passed.");
