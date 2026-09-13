import { createCanvas, GlobalFonts } from "@napi-rs/canvas";
import { mkdirSync, writeFileSync } from "node:fs";
mkdirSync("public/assets", { recursive: true });
try {
  GlobalFonts.registerFromPath(
    "/System/Library/Fonts/Supplemental/Arial.ttf",
    "ArtSans",
  );
} catch {}
const W = 1200,
  H = 800;
const c = createCanvas(W, H),
  x = c.getContext("2d");
function rect(a, b, w, h, color, r = 0) {
  x.fillStyle = color;
  x.beginPath();
  x.roundRect(a, b, w, h, r);
  x.fill();
}
function text(s, a, b, size = 16, color = "#172016", weight = "normal") {
  x.font = `${weight} ${size}px ArtSans, sans-serif`;
  x.fillStyle = color;
  x.fillText(s, a, b);
}
function line(a, b, d, e, color = "#e0e1d9", width = 1) {
  x.beginPath();
  x.moveTo(a, b);
  x.lineTo(d, e);
  x.strokeStyle = color;
  x.lineWidth = width;
  x.stroke();
}
function circle(a, b, r, color) {
  x.beginPath();
  x.arc(a, b, r, 0, Math.PI * 2);
  x.fillStyle = color;
  x.fill();
}
function saveResponsive(name, source = c) {
  writeFileSync(
    `public/assets/${name}.webp`,
    source.toBuffer("image/webp", 84),
  );
  const small = createCanvas(
    600,
    Math.round((source.height * 600) / source.width),
  );
  small.getContext("2d").drawImage(source, 0, 0, small.width, small.height);
  writeFileSync(
    `public/assets/${name}-600.webp`,
    small.toBuffer("image/webp", 82),
  );
}
function save(name) {
  saveResponsive(name);
}
function label(s, a, b, color = "#d2ff5a") {
  rect(a, b, 72, 24, color, 12);
  text(s, a + 12, b + 16, 10, "#182013");
}
function base(name, bg = "#f5f5f0", dark = false) {
  rect(0, 0, W, H, bg);
  rect(0, 0, 202, H, dark ? "#171d1b" : "#eaece4");
  text("✳ " + name, 30, 50, 27, dark ? "#d2ff5a" : "#293529", "bold");
  ["Overview", "My workspace", "Projects", "Calendar", "Insights"].forEach(
    (s, i) => {
      if (i === 0)
        rect(18, 101 + i * 52, 166, 39, dark ? "#2a3930" : "#d2ff5a", 8);
      text(s, 42, 126 + i * 52, 14, dark ? "#bbc8bc" : "#475044");
    },
  );
  line(25, 430, 177, 430, dark ? "#3b423e" : "#cdd0c6");
  text("YOUR SPACE", 30, 467, 10, dark ? "#909c92" : "#737d71");
  ["Design team", "Product studio", "Personal"].forEach((s, i) => {
    circle(36, 503 + i * 40, 4, ["#c1cfb0", "#dcbba4", "#bcc9dd"][i]);
    text(s, 50, 508 + i * 40, 13, dark ? "#c4cec5" : "#666d60");
  });
  text("Original interface concept", 25, 760, 10, dark ? "#92a192" : "#707969");
}
function forma() {
  base("forma");
  text("Workspace / Overview", 238, 42, 12, "#7f8779");
  circle(1143, 35, 16, "#ccd8b4");
  text("Make room for your best work.", 240, 114, 31, "#243122", "bold");
  text("A little clarity. A lot of possibility.", 240, 147, 14, "#7d8476");
  rect(1010, 82, 148, 42, "#243122", 8);
  text("+  New project", 1031, 109, 13, "#f5f5ee");
  [
    ["In progress", "12", "A little momentum"],
    ["Completed", "28", "Moving things forward"],
    ["Focus time", "16.5h", "Space to think"],
  ].forEach((q, i) => {
    const a = 240 + i * 311;
    rect(a, 184, 295, 128, i === 0 ? "#d2ff5a" : "#ffffff", 13);
    text(q[0], a + 22, 216, 12, "#68735d");
    text(q[1], a + 20, 266, 40, "#243122", "bold");
    text(q[2], a + 20, 291, 11, "#647157");
  });
  text("Your projects", 240, 363, 20, "#243122", "bold");
  text("View all  →", 1085, 361, 12, "#788071");
  ["Website refresh", "The next chapter", "A better onboarding"].forEach(
    (s, i) => {
      const a = 240 + i * 311;
      rect(a, 389, 295, 246, "#fff", 13);
      rect(a + 17, 407, 261, 110, ["#e5e8df", "#dedccf", "#d9e1d6"][i], 8);
      for (let j = 0; j < 4; j++)
        rect(
          a + 38 + j * 47,
          438 - j * 5,
          30,
          56 + j * 5,
          ["#c5ccb9", "#879c72", "#b6bf9f", "#eaf0df"][j],
          4,
        );
      text(s, a + 20, 550, 17, "#243122", "bold");
      text("Design exploration  ·  4 members", a + 20, 575, 11, "#7d8476");
      line(a + 20, 596, a + 274, 596);
      circle(a + 29, 614, 8, "#c0cbae");
      circle(a + 45, 614, 8, "#e0baa3");
      text("8 tasks", a + 218, 618, 10, "#68735d");
    },
  );
  rect(240, 665, 917, 89, "#e9ecdf", 12);
  circle(278, 708, 18, "#d2ff5a");
  text("↗", 270, 715, 20);
  text("Small steps. Meaningful progress.", 313, 704, 16, "#35432b", "bold");
  text(
    "Your next good idea starts with a little space.",
    313,
    727,
    12,
    "#6f7965",
  );
  text("Explore workspace  →", 973, 715, 12, "#45513d");
  save("forma-ui");
}
function trace() {
  base("trace", "#111916", true);
  text("Impact / Dashboard", 239, 40, 12, "#91a297");
  text("A clearer picture of your impact.", 239, 110, 29, "#f0f1e8", "bold");
  text(
    "Illustrative data · Original dashboard concept",
    239,
    143,
    12,
    "#8ca191",
  );
  rect(993, 83, 161, 38, "#26352b", 7);
  text("This month   ⌄", 1013, 107, 12, "#c8d7ca");
  [
    ["Energy mix", "72%", "renewable sources"],
    ["Emissions", "8.4t", "illustrative estimate"],
    ["Active sites", "24", "connected locations"],
  ].forEach((q, i) => {
    const a = 239 + i * 313;
    rect(a, 180, 297, 120, "#1c2821", 10);
    text(q[0], a + 19, 210, 12, "#94ab98");
    text(q[1], a + 18, 261, 38, i === 0 ? "#d2ff5a" : "#f0f1e8");
    text(q[2], a + 109, 261, 10, "#94ab98");
  });
  rect(239, 326, 601, 337, "#1b2720", 10);
  text("The bigger picture", 260, 357, 17, "#e3e9df");
  text("A network of small changes.", 260, 381, 11, "#829b88");
  for (let a = 278; a < 800; a += 13)
    for (let b = 416; b < 612; b += 13) {
      const u = (a - 530) / 255,
        v = (b - 510) / 100;
      const shape =
        Math.sin(u * 7 + v * 2) +
        Math.cos(v * 4 - u * 2) +
        Math.sin(u * 13 + v * 9);
      if (shape > 0.2 && u * u + v * v < 1)
        circle(a, b, 2.5, shape > 1.7 ? "#d2ff5a" : "#496850");
    }
  circle(415, 470, 7, "#d2ff5a");
  circle(680, 495, 7, "#d2ff5a");
  circle(555, 554, 7, "#d2ff5a");
  rect(860, 326, 297, 337, "#1c2821", 10);
  text("Energy over time", 880, 357, 16, "#e3e9df");
  for (let i = 0; i < 9; i++) {
    rect(
      882 + i * 28,
      587 - [90, 127, 115, 158, 146, 180, 162, 185, 212][i],
      16,
      [90, 127, 115, 158, 146, 180, 162, 185, 212][i],
      i > 6 ? "#d2ff5a" : "#42684a",
      3,
    );
  }
  text("MON", 882, 614, 10, "#8aa38c");
  text("SUN", 1100, 614, 10, "#8aa38c");
  rect(239, 686, 918, 72, "#d2ff5a", 10);
  text(
    "Better decisions start with better visibility.",
    262,
    728,
    17,
    "#1b2916",
    "bold",
  );
  text("Explore insights  ↗", 987, 729, 12, "#1b2916");
  save("trace-ui");
}
function offscript() {
  rect(0, 0, W, H, "#efe5d8");
  text("offscript", 60, 75, 44, "#34281e", "bold");
  text("GET LOST. FIND SOMETHING.", 62, 112, 12, "#806d5b");
  const phones = [
    {
      a: 190,
      b: 171,
      title: "A different kind",
      sub: "of getting out.",
      bg: "#ef6c42",
    },
    { a: 497, b: 118, title: "Follow your", sub: "curiosity.", bg: "#efe5d8" },
    { a: 804, b: 174, title: "Meet you", sub: "somewhere new.", bg: "#b7c3f5" },
  ];
  phones.forEach((p, i) => {
    rect(p.a - 7, p.b - 7, 256, 520, "#322a24", 32);
    rect(p.a, p.b, 242, 506, p.bg, 27);
    text("9:41", p.a + 19, p.b + 27, 10, "#30271f", "bold");
    rect(p.a + 94, p.b + 12, 56, 13, "#30271f", 9);
    text("offscript", p.a + 19, p.b + 70, 20, "#34281e", "bold");
    text(p.title, p.a + 19, p.b + 126, 27, "#30271f", "bold");
    text(p.sub, p.a + 19, p.b + 158, 27, "#30271f", "bold");
    if (i === 0) {
      circle(p.a + 125, p.b + 292, 84, "#f1c9a1");
      for (let j = 0; j < 8; j++) {
        x.save();
        x.translate(p.a + 125, p.b + 292);
        x.rotate((j * Math.PI) / 4);
        rect(-7, -75, 14, 150, "#ae3d2b", 7);
        x.restore();
      }
      circle(p.a + 125, p.b + 292, 28, "#f5be66");
    }
    if (i === 1) {
      rect(p.a + 18, p.b + 186, 205, 158, "#b6bf9d", 13);
      for (let j = 0; j < 6; j++) {
        x.save();
        x.translate(p.a + 120, p.b + 267);
        x.rotate(j * 0.5);
        x.strokeStyle = "#44523b";
        x.lineWidth = 2;
        x.strokeRect(-55, -48, 110, 96);
        x.restore();
      }
      text(
        "An afternoon, unplanned.",
        p.a + 19,
        p.b + 375,
        15,
        "#34281e",
        "bold",
      );
      text("Art spaces · 1.2 km away", p.a + 19, p.b + 399, 11, "#716556");
    }
    if (i === 2) {
      rect(p.a + 19, p.b + 192, 204, 156, "#ddddeb", 14);
      for (let j = 0; j < 10; j++)
        rect(
          p.a + 35 + j * 17,
          p.b + 219 + (j % 2) * 16,
          10,
          110 - (j % 2) * 32,
          "#4b5797",
          5,
        );
      text(
        "Something worth finding.",
        p.a + 19,
        p.b + 384,
        14,
        "#34281e",
        "bold",
      );
    }
    rect(p.a + 18, p.b + 442, 207, 43, "#30271f", 22);
    text(
      ["Find your next detour  ↗", "Explore nearby  ↗", "Save this place  ↗"][
        i
      ],
      p.a + 37,
      p.b + 469,
      12,
      "#f8ebdf",
    );
  });
  text("ORIGINAL MOBILE EXPERIENCE / CONCEPT", 61, 758, 12, "#806d5b");
  save("offscript-ui");
}
function variant(name, stage) {
  const source = x.getImageData(0, 0, W, H);
  if (stage === "early") {
    rect(0, 0, W, H, "#ede8dd");
    text("EXPLORATION / " + name.toUpperCase(), 60, 67, 14, "#7c7b70");
    text("Finding the signal.", 60, 135, 43, "#35392d", "bold");
    for (let i = 0; i < 3; i++) {
      let a = 60 + i * 375;
      rect(a, 198, 340, 500, ["#dfe3d3", "#e3d8c5", "#d5dcca"][i], 5);
      text(
        ["01 / Structure", "02 / Hierarchy", "03 / Focus"][i],
        a + 25,
        238,
        15,
        "#606950",
      );
      for (let j = 0; j < 5; j++) {
        line(
          a + 27,
          295 + j * 65,
          a + 260 - (j % 2) * 60,
          295 + j * 65,
          "#9aa18b",
          2,
        );
        rect(a + 27, 311 + j * 65, 280, 26, "#ced4c0", 3);
      }
      text("What needs attention first?", a + 25, 664, 13, "#66715c");
    }
  } else {
    rect(0, 0, W, H, "#f4f4ee");
    rect(0, 0, 195, H, "#e3e6dd");
    for (let i = 0; i < 6; i++) rect(25, 80 + i * 60, 140, 18, "#cbd0c3", 3);
    text("WIREFRAME / " + name.toUpperCase(), 232, 65, 13, "#76806c");
    rect(232, 103, 670, 42, "#d6dbce", 4);
    for (let i = 0; i < 3; i++)
      rect(232 + i * 315, 183, 290, 123, "#e3e7dc", 8);
    rect(232, 342, 610, 370, "#e5e8df", 8);
    rect(872, 342, 292, 370, "#dde2d5", 8);
    for (let j = 0; j < 5; j++)
      rect(265, 385 + j * 60, 525 - j * 30, 19, "#c9d1be", 3);
  }
  save(name + "-" + stage);
  x.putImageData(source, 0, 0);
}
for (const [name, fn] of [
  ["forma", forma],
  ["trace", trace],
  ["offscript", offscript],
]) {
  fn();
  const original = x.getImageData(0, 0, W, H);
  variant(name, "early");
  variant(name, "wire");
  x.putImageData(original, 0, 0);
  const cover = createCanvas(1200, 900),
    p = cover.getContext("2d");
  p.fillStyle = { forma: "#bcc8aa", trace: "#293c30", offscript: "#d07755" }[
    name
  ];
  p.fillRect(0, 0, 1200, 900);
  p.save();
  p.translate(600, 450);
  p.rotate(name === "offscript" ? -0.07 : -0.045);
  p.shadowColor = "#00000045";
  p.shadowBlur = 55;
  p.shadowOffsetY = 35;
  p.drawImage(c, -530, -354, 1060, 707);
  p.restore();
  saveResponsive(name + "-cover", cover);
}
// A code-drawn social card uses the actual site typography and concept identity.
const og = createCanvas(1200, 630),
  o = og.getContext("2d");
o.fillStyle = "#101010";
o.fillRect(0, 0, 1200, 630);
o.fillStyle = "#d2ff5a";
o.font = "20px ArtSans";
o.fillText("PRODUCT DESIGN / ORIGINAL CONCEPT PORTFOLIO", 60, 73);
o.fillStyle = "#f2f0e9";
o.font = "bold 137px ArtSans";
o.fillText("DESIGN,", 50, 251);
o.fillText("WITH INTENT.", 50, 391);
o.fillStyle = "#777971";
o.font = "20px ArtSans";
o.fillText("Thoughtful products. Playful experiences.", 60, 539);
o.fillStyle = "#d2ff5a";
o.fillRect(1070, 515, 68, 68);
writeFileSync("public/og.png", og.toBuffer("image/png"));
console.log(
  "Created 24 responsive original concept images and the social preview.",
);
