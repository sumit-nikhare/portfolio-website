// Recreated workflow diagrams, intentionally not presented as production screenshots.
import { createCanvas, GlobalFonts, loadImage } from "@napi-rs/canvas";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
const projects = JSON.parse(
  readFileSync(new URL("./project-art.json", import.meta.url), "utf8"),
);
GlobalFonts.registerFromPath(
  "public/fonts/space-grotesk.woff2",
  "PortfolioDisplay",
);
GlobalFonts.registerFromPath("public/fonts/inter.woff2", "PortfolioSans");
mkdirSync("public/assets", { recursive: true });
function save(canvas, name) {
  writeFileSync(
    `public/assets/${name}.webp`,
    canvas.toBuffer("image/webp", 86),
  );
  const small = createCanvas(
    600,
    Math.round((canvas.height / canvas.width) * 600),
  );
  small.getContext("2d").drawImage(canvas, 0, 0, small.width, small.height);
  writeFileSync(
    `public/assets/${name}-600.webp`,
    small.toBuffer("image/webp", 82),
  );
}
for (const [index, project] of projects.entries()) {
  for (const [variant, labels] of [
    ["cover", project.steps],
    ["early", project.steps],
    ["wire", project.patterns],
    ["ui", project.states],
  ]) {
    const c = createCanvas(1200, variant === "cover" ? 900 : 800),
      x = c.getContext("2d");
    const rect = (a, b, w, h, color, r = 0) => {
      x.fillStyle = color;
      x.beginPath();
      x.roundRect(a, b, w, h, r);
      x.fill();
    };
    const text = (
      s,
      a,
      b,
      size = 16,
      color = "#f2f0e9",
      font = "PortfolioSans",
    ) => {
      x.fillStyle = color;
      x.font = `${size}px ${font}`;
      x.fillText(s, a, b);
    };
    const line = (a, b, d, e, color = "#41483c") => {
      x.strokeStyle = color;
      x.lineWidth = 1;
      x.beginPath();
      x.moveTo(a, b);
      x.lineTo(d, e);
      x.stroke();
    };
    rect(0, 0, c.width, c.height, project.accent);
    rect(38, 38, 1124, c.height - 76, "#151813", 20);
    text(
      `SUMIT NIKHARE / ${String(index + 1).padStart(2, "0")}`,
      78,
      90,
      12,
      "#bdc6b4",
    );
    text(
      variant === "cover"
        ? "PROJECT FIELD NOTES"
        : { early: "WORKFLOW", wire: "PATTERNS", ui: "STATES" }[variant],
      865,
      90,
      12,
      project.accent,
    );
    line(78, 118, 1122, 118);
    text(project.title, 78, 202, 54, project.accent, "PortfolioDisplay");
    text("A clear path through a complex task.", 80, 239, 18, "#cad0c3");
    const ypos = variant === "cover" ? 343 : 310;
    labels.forEach((label, i) => {
      const left = 78 + i * 355;
      if (i < 2) {
        line(left + 294, ypos + 104, left + 350, ypos + 104, project.accent);
        text("→", left + 321, ypos + 111, 25, project.accent);
      }
      rect(
        left,
        ypos,
        302,
        220,
        variant === "wire" ? "#e9eade" : "#242b20",
        14,
      );
      rect(left + 24, ypos + 24, 44, 44, project.accent, 22);
      text(String(i + 1).padStart(2, "0"), left + 36, ypos + 52, 15, "#151813");
      const words = label.split(" "),
        rows = [""];
      for (const word of words) {
        const last = rows.length - 1;
        if ((rows[last] + " " + word).length > 22) rows.push(word);
        else rows[last] += (rows[last] ? " " : "") + word;
      }
      rows.forEach((row, j) =>
        text(
          row,
          left + 24,
          ypos + 109 + j * 30,
          23,
          variant === "wire" ? "#20251c" : "#f2f0e9",
          "PortfolioDisplay",
        ),
      );
      for (let bar = 0; bar < 3; bar++)
        rect(
          left + 24,
          ypos + 167 + bar * 10,
          bar === 2 ? 122 : 235,
          3,
          variant === "wire" ? "#b2b8a8" : "#47513f",
          2,
        );
    });
    const bottom = ypos + 268;
    text(
      variant === "early"
        ? "CONNECT THE TASKS"
        : variant === "wire"
          ? "REUSE WHAT WORKS"
          : variant === "ui"
            ? "MAKE EACH STATE UNDERSTANDABLE"
            : "THINK IN WORKFLOWS. DESIGN THE DETAILS.",
      80,
      bottom,
      12,
      project.accent,
    );
    line(78, c.height - 127, 1122, c.height - 127);
    text(
      "WORKFLOW ILLUSTRATION / RECREATED FOR THIS PORTFOLIO",
      78,
      c.height - 85,
      11,
      "#bdc6b4",
    );
    text("NOT A PRODUCTION CAPTURE", 859, c.height - 85, 10, "#bdc6b4");
    save(c, `${project.slug}-${variant}`);
  }
}
if (process.argv[2]) {
  const portrait = await loadImage(process.argv[2]);
  const c = createCanvas(
    768,
    Math.round((portrait.height / portrait.width) * 768),
  );
  c.getContext("2d").drawImage(portrait, 0, 0, c.width, c.height);
  save(c, "sumit-nikhare");
}
// Social preview is composed from the site's identity, without external assets.
const og = createCanvas(1200, 630),
  context = og.getContext("2d");
context.fillStyle = "#101010";
context.fillRect(0, 0, 1200, 630);
context.fillStyle = "#d2ff5a";
context.font = "22px PortfolioSans";
context.fillText("SUMIT NIKHARE / PRODUCT DESIGNER", 70, 90);
context.fillStyle = "#f2f0e9";
context.font = "94px PortfolioDisplay";
context.fillText("Design,", 65, 250);
context.fillText("with intent.", 65, 350);
context.fillStyle = "#d2ff5a";
context.font = "22px PortfolioSans";
context.fillText("PUBLIC HEALTH · PLATFORMS · DESIGN SYSTEMS", 70, 530);
writeFileSync("public/og.png", og.toBuffer("image/png"));
console.log(
  "Created 7 sets of labeled workflow illustrations, responsive images, and the social preview.",
);
