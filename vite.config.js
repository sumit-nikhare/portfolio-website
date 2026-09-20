import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { readFileSync, readdirSync } from "node:fs";
import { resolve, relative } from "node:path";
import settings from "./site.config.json";

export function discoverPages(dir = ".", result = {}) {
  for (const item of readdirSync(dir, { withFileTypes: true })) {
    if (
      [
        "node_modules",
        "dist",
        "src",
        "public",
        "templates",
        "artifacts",
        "scripts",
        "tests",
      ].includes(item.name) ||
      item.name.startsWith(".")
    )
      continue;
    const path = resolve(dir, item.name);
    if (item.isDirectory()) discoverPages(path, result);
    else if (item.name.endsWith(".html"))
      result[relative(process.cwd(), path).replace(/[^a-zA-Z0-9_-]/g, "-")] =
        path;
  }
  return result;
}

export default defineConfig({
  base: process.env.BASE_PATH || settings.base,
  plugins: [
    tailwindcss(),
    {
      name: "portfolio-html-partials",
      transformIndexHtml: {
        order: "pre",
        handler(html, ctx) {
          // Set the enhancement flag before first paint to avoid a mobile navigation layout shift.
          // With scripting disabled, the ordinary expanded navigation remains visible.
          html = html.replace(
            "</head>",
            `<script>${readFileSync(resolve("src/boot.js"), "utf8")}</script></head>`,
          );
          html = html.replace(
            /(<body[^>]*>)/,
            `$1${readFileSync(resolve("src/partials/scroll-progress.html"), "utf8")}`,
          );
          html = html.replace(/<!-- include:([a-z-]+) -->/g, (_, name) =>
            readFileSync(resolve("src/partials", `${name}.html`), "utf8"),
          );
          const page = ctx.path.replace(/index\.html$/, "");
          const origin = settings.origin.replace(/\/$/, "");
          const base = process.env.BASE_PATH || settings.base;
          const escapeAttribute = (value) =>
            String(value)
              .replaceAll("&", "&amp;")
              .replaceAll('"', "&quot;")
              .replaceAll("<", "&lt;")
              .replaceAll(">", "&gt;");
          const email = /^[^\s@?&#]+@[^\s@?&#]+\.[^\s@?&#]+$/.test(
            settings.contactEmail || "",
          )
            ? settings.contactEmail
            : "";
          const linkedin = /^https:\/\/([a-z]+\.)?linkedin\.com\//.test(
            settings.linkedinUrl || "",
          )
            ? settings.linkedinUrl
            : "";
          const pdf = /^(assets\/)[a-zA-Z0-9_./-]+\.pdf$/.test(
            settings.resumePdf || "",
          )
            ? settings.resumePdf
            : "";
          const current = page.startsWith("/projects/")
            ? "work"
            : page.split("/").filter(Boolean)[0];
          html = html.replace(
            /data-nav-page="([a-z]+)"/g,
            (attribute, destination) =>
              `${attribute}${destination === current ? ' aria-current="page"' : ""}`,
          );
          html = html
            .replaceAll("{{contact-email}}", escapeAttribute(email))
            .replaceAll(
              "{{contact-link}}",
              email
                ? `<a class="text-link" href="mailto:${escapeAttribute(email)}">${escapeAttribute(email)} <span aria-hidden="true">↗</span></a>`
                : "<p>Email address awaiting content.</p>",
            )
            .replaceAll(
              "{{linkedin-link}}",
              linkedin
                ? `<a class="text-link" href="${escapeAttribute(linkedin)}">LinkedIn <span aria-hidden="true">↗</span></a>`
                : "<p>Professional profile awaiting content.</p>",
            )
            .replaceAll(
              "{{contact-mode-note}}",
              email
                ? "Prepare a message, review it, then open a draft in your email app. You choose when to send."
                : "Contact preview: prepare and copy a message locally. A real contact address has not been added yet.",
            )
            .replaceAll(
              "{{resume-download}}",
              pdf
                ? `<a class="text-link" href="%BASE_URL%${escapeAttribute(pdf)}" download>Download résumé PDF <span aria-hidden="true">↗</span></a>`
                : '<p class="content-note">PDF download awaiting your verified résumé.</p>',
            );
          if (origin) {
            html = html.replace(
              /(<meta\s+property="og:image"\s+content=")%BASE_URL%/g,
              `$1${origin}${base}`,
            );
          }
          return html
            .replaceAll(
              "{{robots}}",
              settings.preview ? "noindex, nofollow" : "index, follow",
            )
            .replaceAll(
              "{{canonical}}",
              origin
                ? `<link rel="canonical" href="${origin}${base}${page.replace(/^\//, "")}"><meta property="og:url" content="${origin}${base}${page.replace(/^\//, "")}">`
                : "",
            );
        },
      },
      handleHotUpdate({ file, server }) {
        if (file.includes("/src/partials/"))
          server.ws.send({ type: "full-reload" });
      },
    },
  ],
  build: {
    rollupOptions: {
      input: discoverPages(),
      output: {
        manualChunks: { motion: ["gsap", "gsap/ScrollTrigger", "gsap/Flip"] },
      },
    },
  },
});
