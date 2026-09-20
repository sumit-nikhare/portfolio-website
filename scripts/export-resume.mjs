import { chromium } from "@playwright/test";
import { existsSync, mkdirSync, copyFileSync } from "node:fs";

const localChrome =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const browser = await chromium.launch({
  ...(existsSync(localChrome) ? { executablePath: localChrome } : {}),
  headless: true,
});
try {
  const page = await browser.newPage({ reducedMotion: "reduce" });
  await page.goto(
    `${process.env.PREVIEW_URL || "http://127.0.0.1:4173"}/resume/`,
    { waitUntil: "networkidle" },
  );
  await page.evaluate(async () => {
    await document.fonts.ready;
    document.title = "Sumit Nikhare — Product Designer";
    document.querySelector('.resume-contact a[href$="/contact/"]')?.remove();
    // A public portfolio URL is not configured yet. Preserve confirmed external
    // contacts, but avoid baking localhost project links into the downloaded PDF.
    document.querySelectorAll(".resume-paper a").forEach((link) => {
      if (link.origin === location.origin) link.removeAttribute("href");
    });
  });
  mkdirSync("output/pdf", { recursive: true });
  const filename = "Resume-Sumit-Nikhare-Product-Designer.pdf";
  await page.pdf({
    path: `output/pdf/${filename}`,
    format: "A4",
    printBackground: true,
    preferCSSPageSize: true,
    tagged: true,
    outline: true,
  });
  copyFileSync(`output/pdf/${filename}`, `public/assets/${filename}`);
  console.log(
    `Updated output/pdf/${filename} and public/assets/${filename}. Rebuild before deploying.`,
  );
} finally {
  await browser.close();
}
