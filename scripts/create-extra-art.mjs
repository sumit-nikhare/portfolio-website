import { createCanvas, GlobalFonts } from "@napi-rs/canvas";
import { writeFileSync } from "node:fs";
try {
  GlobalFonts.registerFromPath(
    "/System/Library/Fonts/Supplemental/Arial.ttf",
    "ArtSans",
  );
} catch {}
const c = createCanvas(1200, 800),
  x = c.getContext("2d");
const R = (a, b, w, h, color, r = 0) => {
  x.fillStyle = color;
  x.beginPath();
  x.roundRect(a, b, w, h, r);
  x.fill();
};
const T = (s, a, b, size = 16, color = "#222429", weight = "normal") => {
  x.fillStyle = color;
  x.font = `${weight} ${size}px ArtSans, sans-serif`;
  x.fillText(s, a, b);
};
const C = (a, b, r, color) => {
  x.fillStyle = color;
  x.beginPath();
  x.arc(a, b, r, 0, Math.PI * 2);
  x.fill();
};
const L = (a, b, d, e, color = "#d7d9d4", width = 1) => {
  x.strokeStyle = color;
  x.lineWidth = width;
  x.beginPath();
  x.moveTo(a, b);
  x.lineTo(d, e);
  x.stroke();
};
function save(name, source = c) {
  writeFileSync(
    `public/assets/${name}.webp`,
    source.toBuffer("image/webp", 84),
  );
  const small = createCanvas(600, Math.round(source.height / 2));
  small.getContext("2d").drawImage(source, 0, 0, 600, small.height);
  writeFileSync(
    `public/assets/${name}-600.webp`,
    small.toBuffer("image/webp", 82),
  );
}
const projects = [
  ["relay", "#bcb2d8"],
  ["fieldnote", "#c8c3a1"],
  ["common", "#93b6b0"],
  ["muse", "#be8a79"],
];
function relay() {
  R(0, 0, 1200, 800, "#f2f1f6");
  R(0, 0, 205, 800, "#e6e3ed");
  T("relay", 27, 55, 29, "#423258", "bold");
  ["Inbox", "Assigned to me", "Team views", "Knowledge", "Settings"].forEach(
    (s, i) => {
      if (!i) R(18, 97, 168, 39, "#c4b5fd", 9);
      T(s, 31, 122 + i * 50, 14, "#514663");
    },
  );
  T("A little more human.", 240, 63, 31, "#2e2639", "bold");
  T("Customer support / Original concept", 241, 94, 12, "#756980");
  R(238, 125, 910, 623, "#fff", 15);
  L(545, 125, 545, 748);
  T("OPEN CONVERSATIONS", 259, 163, 11, "#756980");
  [
    "A question about my order",
    "Finding the right plan",
    "A little help getting started",
    "Changing my workspace",
  ].forEach((s, i) => {
    R(250, 188 + i * 109, 282, 95, i === 0 ? "#efeafa" : "#fff", 8);
    C(276, 216 + i * 109, 11, ["#bcacd9", "#e7cdb1", "#c6d5cd", "#e8c6cd"][i]);
    T("Visitor " + (104 + i), 300, 215 + i * 109, 12, "#685676");
    T(s, 265, 244 + i * 109, 13, "#34293f", "bold");
    T("Preview conversation", 265, 264 + i * 109, 10, "#87798f");
  });
  T("A question about my order", 579, 168, 21, "#34293f", "bold");
  T("OPEN  /  SAMPLE CONTENT", 579, 195, 10, "#87798f");
  R(582, 242, 383, 98, "#f1eff5", 11);
  T("Where can I find my order details?", 603, 278, 15);
  T("I would like to check the next step.", 603, 304, 15);
  R(690, 374, 424, 102, "#ded3f5", 11);
  T("Let’s find that together.", 712, 410, 15);
  T("Your order overview is a good place to start.", 712, 437, 14);
  R(579, 566, 535, 145, "#f9f8fb", 10);
  T("A thoughtful reply starts here…", 599, 599, 15, "#81738d");
  R(970, 651, 120, 38, "#49355f", 19);
  T("Send reply", 991, 676, 12, "#fff");
  T("Illustrative interface • No real customer data", 579, 737, 10, "#87798f");
}
function fieldnote() {
  R(0, 0, 1200, 800, "#e8e4d6");
  T("fieldnote", 55, 72, 39, "#444c36", "bold");
  T("A LITTLE LESS PLANNING. A LITTLE MORE WANDERING.", 56, 103, 11, "#727760");
  R(57, 158, 634, 575, "#d1d4b7", 18);
  for (let i = 0; i < 9; i++) {
    L(65, 180 + i * 65, 680, 280 + i * 43, "#b9bda1", 3);
    L(95 + i * 74, 160, 40 + i * 81, 730, "#f3f1df", 12);
  }
  x.strokeStyle = "#6f7850";
  x.lineWidth = 5;
  x.setLineDash([10, 9]);
  x.beginPath();
  x.moveTo(150, 589);
  x.bezierCurveTo(620, 665, 118, 153, 586, 282);
  x.stroke();
  x.setLineDash([]);
  [
    [150, 589, "01"],
    [331, 452, "02"],
    [586, 282, "03"],
  ].forEach(([a, b, s]) => {
    C(a, b, 22, "#414b32");
    T(s, a - 8, b + 5, 13, "#fff");
  });
  R(756, 146, 300, 595, "#353a2e", 37);
  R(765, 155, 282, 577, "#f8f5e9", 30);
  R(867, 168, 78, 17, "#353a2e", 10);
  T("Your Saturday,", 788, 231, 25, "#424a32", "bold");
  T("a little less scripted.", 788, 262, 23, "#424a32");
  T("SAMPLE ROUTE / 3 STOPS", 790, 301, 10, "#7c806b");
  ["A slow coffee", "A quiet gallery", "The long way home"].forEach((s, i) => {
    R(787, 322 + i * 102, 238, 88, ["#e5dfc1", "#d2d8bb", "#e4d7c8"][i], 12);
    T("0" + (i + 1), 801, 350 + i * 102, 11, "#6c7257");
    T(s, 801, 378 + i * 102, 17, "#424a32", "bold");
  });
  R(788, 650, 237, 48, "#424a32", 24);
  T("Keep this route   >", 822, 680, 14, "#f5f2e4");
  T("ORIGINAL TRAVEL CONCEPT · FICTIONAL ROUTE", 57, 770, 11, "#727760");
}
function common() {
  R(0, 0, 1200, 800, "#172b2b");
  T("common", 55, 78, 44, "#d3eee5", "bold");
  T("A SMALL SYSTEM. ROOM TO GROW.", 57, 113, 12, "#8cabaa");
  R(57, 161, 512, 274, "#294341", 15);
  T("Aa", 80, 318, 144, "#d3eee5", "bold");
  T("TYPE / SPACE GROTESK", 84, 406, 11, "#91bcb7");
  R(598, 161, 544, 274, "#e7eee7", 15);
  T("Color with a purpose.", 627, 206, 23, "#243936", "bold");
  ["#263d37", "#679a8d", "#9bd0ba", "#cce6b9", "#eaddb1"].forEach((v, i) => {
    R(625 + i * 97, 235, 82, 130, v, 9);
    T("0" + (i + 1), 637 + i * 97, 395, 11, "#546c5e");
  });
  R(57, 463, 512, 282, "#d5e9df", 15);
  T("A familiar next step.", 84, 508, 24, "#28433b", "bold");
  R(83, 540, 214, 48, "#2d5045", 24);
  T("Primary action   >", 106, 570, 14, "#fff");
  R(83, 612, 214, 48, "#b1d3c3", 24);
  T("Secondary action", 106, 642, 14, "#28433b");
  R(323, 540, 215, 120, "#eef5eb", 12);
  T("Status", 342, 570, 12, "#526b5e");
  C(347, 606, 5, "#508674");
  T("Ready to explore", 362, 612, 14, "#28433b");
  R(598, 463, 544, 282, "#294341", 15);
  T("Spacing is a language.", 627, 508, 24, "#d3eee5", "bold");
  [16, 28, 44, 66, 96].forEach((n, i) => {
    R(628 + i * 98, 644 - n, 60, n, "#90d8d0", 4);
    T(String(n), 646 + i * 98, 676, 13, "#91bcb7");
  });
  T(
    "ORIGINAL DESIGN SYSTEM STUDY / NOT A SHIPPED LIBRARY",
    628,
    722,
    10,
    "#91bcb7",
  );
}
function muse() {
  R(0, 0, 1200, 800, "#ecd8c8");
  T("muse", 55, 75, 45, "#593b31", "bold");
  T("MAKE A LITTLE ROOM FOR LEARNING.", 57, 109, 12, "#926d5a");
  R(58, 157, 545, 580, "#bb6f56", 17);
  T("Small lessons.", 87, 225, 47, "#ffead6", "bold");
  T("Long afterthoughts.", 87, 283, 42, "#ffead6", "bold");
  for (let i = 0; i < 33; i++) {
    const h = 25 + Math.sin(i * 0.33) ** 2 * 150;
    R(88 + i * 14, 492 - h / 2, 6, h, "#f4cbb1", 3);
  }
  T("THE ART OF PAYING ATTENTION", 88, 662, 13, "#fbe2cc");
  T("An illustrative audio lesson", 88, 692, 13, "#f4cbb1");
  R(699, 149, 311, 596, "#422f29", 36);
  R(708, 158, 293, 578, "#f6eee4", 29);
  R(813, 170, 78, 16, "#422f29", 10);
  T("A little every day.", 732, 242, 27, "#593b31", "bold");
  T("SAMPLE LESSON LIBRARY", 732, 276, 10, "#987663");
  R(731, 304, 246, 177, "#d6ac96", 12);
  for (let i = 0; i < 6; i++) {
    x.strokeStyle = "#8c5341";
    x.lineWidth = 2;
    x.beginPath();
    x.arc(854, 391, 20 + i * 11, 0, Math.PI * 2);
    x.stroke();
  }
  T("Notice the ordinary", 733, 520, 19, "#593b31", "bold");
  T("Lesson 01 / 08 min / Concept", 733, 548, 11, "#987663");
  L(734, 584, 975, 584, "#d3b8a5", 3);
  L(734, 584, 816, 584, "#7d5140", 3);
  C(854, 647, 31, "#724a3b");
  T("▶", 847, 654, 18, "#ffead6");
  T("ORIGINAL LEARNING CONCEPT / NO REAL COURSES", 57, 773, 11, "#926d5a");
}
for (const [name, bg] of projects) {
  ({ relay, fieldnote, common, muse })[name]();
  save(name + "-ui");
  const cover = createCanvas(1200, 900),
    p = cover.getContext("2d");
  p.fillStyle = bg;
  p.fillRect(0, 0, 1200, 900);
  p.save();
  p.translate(600, 450);
  p.rotate(-0.035);
  p.shadowColor = "#00000045";
  p.shadowBlur = 50;
  p.shadowOffsetY = 30;
  p.drawImage(c, -528, -352, 1056, 704);
  p.restore();
  save(name + "-cover", cover);
  for (const stage of ["early", "wire"]) {
    R(0, 0, 1200, 800, stage === "early" ? "#eeeadf" : "#e9eeea");
    T(
      name.toUpperCase() +
        " / " +
        (stage === "early" ? "EARLY DIRECTIONS" : "STRUCTURAL STUDY"),
      58,
      71,
      15,
      "#677264",
    );
    T(
      stage === "early"
        ? "What deserves attention?"
        : "Give the idea a rhythm.",
      57,
      132,
      43,
      "#343f35",
      "bold",
    );
    for (let i = 0; i < 3; i++) {
      R(58 + i * 375, 183, 337, 536, ["#dce3d3", "#d5dcd8", "#e1ddd0"][i], 8);
      T(
        ["01 / Orientation", "02 / The next action", "03 / A clear return"][i],
        80 + i * 375,
        225,
        16,
        "#53604f",
      );
      for (let j = 0; j < 5; j++) {
        R(
          80 + i * 375,
          268 + j * 70,
          290 - (stage === "early" ? j * 13 : 0),
          17,
          "#aab7a2",
          3,
        );
        R(80 + i * 375, 296 + j * 70, 235, 14, "#c0cabc", 3);
      }
    }
    T(
      "Original exploration / " + name + " / illustrative layout",
      59,
      766,
      12,
      "#778171",
    );
    save(name + "-" + stage);
  }
}
console.log(
  "Created responsive artwork for Relay, Fieldnote, Common, and Muse.",
);
