import { readFileSync } from "node:fs";

// One URL configuration for Vite, deployment checks, and generated metadata.
// Keep root hosting as the default; GitHub Actions supplies its project path.
export function resolveSiteSettings(config, env = {}) {
  if (typeof config.preview !== "boolean")
    throw new Error("site.config.json preview must be true or false.");
  let origin = env.SITE_ORIGIN ?? config.origin ?? "";
  if (typeof origin !== "string") throw new Error("SITE_ORIGIN must be a URL.");
  origin = origin.trim();
  if (origin) {
    const url = new URL(origin);
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.pathname !== "/" ||
      url.search ||
      url.hash
    )
      throw new Error(
        "SITE_ORIGIN must be an HTTPS host without a path, credentials, query, or fragment.",
      );
    origin = url.origin;
  }
  let base = env.BASE_PATH ?? config.base ?? "/";
  if (typeof base !== "string") throw new Error("BASE_PATH must be a path.");
  if (!base.endsWith("/")) base += "/";
  if (
    !/^\/(?:[a-zA-Z0-9._~-]+\/)*$/.test(base) ||
    base.split("/").some((part) => [".", ".."].includes(part))
  )
    throw new Error(
      "BASE_PATH must be / or a site path such as /portfolio-website/.",
    );
  return { ...config, origin, base };
}

export function readSiteSettings(env = process.env) {
  return resolveSiteSettings(
    JSON.parse(readFileSync("site.config.json", "utf8")),
    env,
  );
}
