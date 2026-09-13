import lighthouse from "lighthouse";
import { launch } from "chrome-launcher";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
mkdirSync("artifacts/audits", { recursive: true });
const macChrome =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const chrome = await launch({
  chromePath: existsSync(macChrome) ? macChrome : undefined,
  chromeFlags: ["--headless", "--no-sandbox", "--disable-dev-shm-usage"],
});
try {
  const summary = [];
  const requested = process.argv.slice(2);
  const routes = requested.length
    ? requested.map((route) => [
        route === "/" ? "home" : route.split("/").filter(Boolean).join("-"),
        route,
      ])
    : [
        ["home", "/"],
        ["case-study", "/projects/forma/"],
        ["playground", "/playground/"],
      ];
  for (const [name, route] of routes) {
    const result = await lighthouse(`http://127.0.0.1:4173${route}`, {
      port: chrome.port,
      output: "html",
      logLevel: "error",
      onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
    });
    writeFileSync(`artifacts/audits/${name}.html`, result.report);
    writeFileSync(
      `artifacts/audits/${name}.json`,
      JSON.stringify(result.lhr, null, 2),
    );
    const record = {
      page: name,
      scores: Object.fromEntries(
        Object.entries(result.lhr.categories).map(([id, category]) => [
          id,
          Math.round(category.score * 100),
        ]),
      ),
      findings: Object.values(result.lhr.audits)
        .filter(
          (audit) =>
            audit.score !== null &&
            audit.score < 1 &&
            audit.scoreDisplayMode !== "informative",
        )
        .map((audit) => ({
          id: audit.id,
          score: audit.score,
          title: audit.title,
          value: audit.displayValue,
        })),
    };
    summary.push(record);
    console.log(JSON.stringify(record, null, 2));
  }
  writeFileSync(
    `artifacts/audits/summary${requested.length ? "-expansion" : ""}.json`,
    JSON.stringify(summary, null, 2),
  );
} finally {
  await chrome.kill();
}
