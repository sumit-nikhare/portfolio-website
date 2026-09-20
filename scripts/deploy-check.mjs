import { existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { readSiteSettings } from "./site-settings.mjs";

try {
  const settings = readSiteSettings();
  if (
    settings.resumePdf &&
    (!/^assets\/[a-zA-Z0-9_./-]+\.pdf$/.test(settings.resumePdf) ||
      settings.resumePdf.split("/").includes("..") ||
      !existsSync(`public/${settings.resumePdf}`))
  )
    throw new Error(
      "The configured résumé PDF must exist inside public/assets/.",
    );
  if (settings.preview) {
    console.log(
      "Public preview deployment is ready. Search indexing stays disabled; content verification flags remain unchanged.",
    );
  } else {
    // A final release keeps the existing content gate; preview is not a bypass
    // for publishing unverified work as a finished portfolio.
    execFileSync(
      process.execPath,
      [fileURLToPath(new URL("./release-check.mjs", import.meta.url))],
      { stdio: "inherit" },
    );
  }
} catch (error) {
  if (!error.status) console.error(error.message);
  process.exit(error.status || 1);
}
