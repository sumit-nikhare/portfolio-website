// Original code-authored illustrations for a clearly fictional teaching case.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
const dir = "public/assets/continuum";
mkdirSync(dir, { recursive: true });
const fonts = [
  ["Inter", "inter"],
  ["Space Grotesk", "space-grotesk"],
]
  .map(
    ([name, file]) =>
      `@font-face{font-family:'${name}';src:url(data:font/woff2;base64,${readFileSync(`public/fonts/${file}.woff2`).toString("base64")}) format('woff2');font-weight:100 900}`,
  )
  .join("");
const c = {
  ink: "#101010",
  paper: "#f2f0e9",
  lime: "#d2ff5a",
  muted: "#96988f",
  line: "#32332e",
  ui: "#20251b",
  quiet: "#62675a",
  rule: "#cdd0c4",
  sage: "#e6e9dc",
  green: "#4c641c",
};
const esc = (s) => String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;");
const text = (
  x,
  y,
  s,
  size = 16,
  color = c.paper,
  display = false,
  weight = 400,
) =>
  `<text x="${x}" y="${y}" font-family="${display ? "Space Grotesk" : "Inter"},sans-serif" font-size="${size}" font-weight="${weight}" fill="${color}">${esc(s)}</text>`;
const rect = (x, y, w, h, fill, stroke = "none", r = 0) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}"/>`;
const rule = (x, y, w, color = c.rule) =>
  `<path d="M${x} ${y}h${w}" stroke="${color}" fill="none"/>`;
const label = (x, y, s, color = c.quiet) =>
  `<text x="${x}" y="${y}" font-family="Inter,sans-serif" font-size="10" letter-spacing="1.1" fill="${color}">${esc(s)}</text>`;
function svg(name, w, h, title, body) {
  writeFileSync(
    `${dir}/${name}.svg`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="title"><title id="title">${esc(title)} — fictional concept; synthetic records</title><defs><style>${fonts}</style><marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M1 1L6 4L1 7" fill="none" stroke="${c.lime}"/></marker></defs>${body}</svg>`,
  );
}
function mobile(x, y, scale = 1) {
  return `<g transform="translate(${x} ${y}) scale(${scale})">${rect(0, 0, 330, 560, c.paper, c.rule, 8)}${label(24, 32, "CONTINUUM / FIELD WORKSPACE")}${rule(24, 48, 282)}${label(24, 83, "REFERRAL · DEMO-014")}${text(24, 121, "One clear", 31, c.ui, true, 500)}${text(24, 156, "next step.", 31, c.ui, true, 500)}${text(24, 190, "Review the handoff before sending.", 12, c.quiet)}${rule(24, 214, 282)}${label(24, 244, "RECEIVING CLINIC")}${text(24, 270, "East Community Clinic", 18, c.ui, true, 500)}${label(24, 311, "NEXT OWNER AFTER DELIVERY")}${text(24, 339, "Clinic coordinator", 18, c.ui, true, 500)}${rect(24, 364, 282, 70, c.sage)}${text(40, 391, "Ready to send", 13, c.green, false, 500)}${text(40, 414, "The field worker still owns this step.", 10, c.quiet)}${rect(24, 460, 282, 47, c.ui, "none", 3)}${text(42, 489, "Confirm handoff", 13, c.paper, false, 500)}${text(271, 490, "→", 19, c.lime)}${label(24, 537, "SIMULATION / NOT A LIVE SERVICE")}</g>`;
}
function dashboard(x, y) {
  let s =
    rect(x, y, 830, 500, c.paper, c.rule, 5) +
    text(x + 25, y + 38, "Continuum", 20, c.ui, true, 500) +
    label(x + 620, y + 35, "CLINIC WORKSPACE") +
    rule(x, y + 60, 830);
  s +=
    rect(x, y + 61, 160, 439, c.sage) +
    label(x + 22, y + 94, "WORK QUEUES") +
    rect(x + 12, y + 112, 136, 38, c.ui, "none", 2) +
    text(x + 26, y + 137, "Incoming", 12, c.paper) +
    text(x + 125, y + 137, "03", 12, c.lime) +
    text(x + 26, y + 181, "Follow-up", 12, c.quiet) +
    text(x + 26, y + 222, "Exceptions", 12, c.quiet) +
    rule(x + 22, y + 385, 116) +
    label(x + 22, y + 411, "SYNTHETIC DATA");
  s +=
    label(x + 190, y + 96, "YOUR NEXT ACTION") +
    text(x + 190, y + 136, "Pick up the handoff.", 30, c.ui, true, 500) +
    text(
      x + 190,
      y + 167,
      "Every received referral has an owner.",
      13,
      c.quiet,
    ) +
    rule(x + 190, y + 193, 610) +
    label(x + 190, y + 217, "REFERRAL") +
    label(x + 320, y + 217, "DESTINATION") +
    label(x + 510, y + 217, "STATE") +
    label(x + 660, y + 217, "NEXT ACTION");
  [
    ["DEMO-014", "East Clinic", "Received", "Accept referral"],
    ["DEMO-028", "East Clinic", "In progress", "View follow-up"],
    ["DEMO-036", "North Clinic", "Received", "Accept referral"],
  ].forEach((r, i) => {
    const yy = y + 254 + i * 64;
    s +=
      rule(x + 190, yy - 22, 610) +
      text(x + 190, yy + 7, r[0], 12, c.ui, false, 500) +
      text(x + 320, yy + 7, r[1], 12, c.quiet) +
      text(x + 510, yy + 7, r[2], 12, i === 1 ? c.quiet : c.green) +
      text(x + 660, yy + 7, r[3], 12, c.ui);
  });
  return (
    s +
    rule(x + 190, y + 429, 610) +
    text(x + 190, y + 461, "Visible owner: clinic coordinator", 11, c.quiet) +
    text(x + 657, y + 461, "View exceptions ↗", 11, c.green)
  );
}
svg(
  "hero",
  1440,
  900,
  "Continuum: field-worker handoff and coordinator queue",
  rect(0, 0, 1440, 900, c.ink) +
    rule(64, 70, 1312, c.line) +
    label(64, 109, "CONTINUUM / PRODUCT EXPLORATION", c.muted) +
    text(64, 169, "A handoff, not a dead end.", 46, c.paper, true, 500) +
    label(1050, 109, "MOBILE + WEB · SYNTHETIC DATA", c.muted) +
    dashboard(515, 288) +
    `<g transform="rotate(-4 280 530)">${mobile(125, 244)}</g>` +
    text(64, 854, "01 / Prepare", 13, c.muted) +
    text(510, 854, "02 / Transfer ownership", 13, c.muted) +
    text(1110, 854, "03 / Follow through", 13, c.lime),
);
svg(
  "hero-mobile",
  540,
  650,
  "Continuum mobile handoff",
  rect(0, 0, 540, 650, c.ink) +
    label(35, 38, "CONTINUUM / FICTIONAL PRODUCT", c.muted) +
    mobile(108, 62, 0.98) +
    label(35, 636, "A CLEAR DESTINATION. A VISIBLE NEXT OWNER.", c.muted),
);
let system =
  rect(0, 0, 1200, 520, c.ink) +
  label(
    40,
    49,
    "CONTEXT / THE REFERRAL IS SHARED. THE NEXT ACTION IS OWNED.",
    c.muted,
  );
const actors = [
  ["01", "Field worker", "Prepare + send", "Owns drafts and unsent work."],
  [
    "02",
    "Clinic coordinator",
    "Receive + follow up",
    "Owns acknowledged referrals.",
  ],
  ["03", "Supervisor", "Monitor + unblock", "Sees exceptions across roles."],
];
actors.forEach((a, i) => {
  const x = 40 + i * 390;
  system +=
    rect(x, 112, 340, 245, "#171a14", c.line, 3) +
    label(x + 24, 149, a[0] + " / ROLE", c.lime) +
    text(x + 24, 194, a[1], 25, c.paper, true, 500) +
    text(x + 24, 238, a[2], 16, c.paper) +
    rule(x + 24, 270, 292, c.line) +
    text(x + 24, 306, a[3], 13, c.muted);
  if (i < 2)
    system += `<path d="M${x + 347} 234h34" stroke="${c.lime}" marker-end="url(#arrow)"/>`;
});
system +=
  rule(40, 408, 1120, c.line) +
  text(
    40,
    445,
    "Ownership transfers when delivery is acknowledged.",
    22,
    c.paper,
    true,
  ) +
  text(
    40,
    479,
    "A local save alone does not hand responsibility to the clinic.",
    14,
    c.muted,
  );
svg("system", 1200, 520, "Illustrative system map", system);
let compare =
  rect(0, 0, 1200, 660, c.ink) +
  label(40, 48, "ILLUSTRATIVE BEFORE / AFTER", c.muted);
compare +=
  rect(40, 80, 540, 520, "#171a14", c.line, 3) +
  label(66, 116, "BEFORE / AN AMBIGUOUS ENDING", c.muted) +
  text(66, 172, "Saved.", 44, c.paper, true) +
  text(66, 213, "A completed form. An unanswered question.", 17, c.muted) +
  rule(66, 249, 488, c.line);
[
  ["Receiving clinic", "Not shown"],
  ["Next owner", "Not shown"],
  ["Delivery state", "Not distinguished"],
].forEach(([a, b], i) => {
  compare +=
    label(66, 295 + i * 80, a.toUpperCase(), c.muted) +
    text(66, 324 + i * 80, b, 18, c.paper);
});
compare +=
  rect(620, 80, 540, 520, c.paper, c.rule, 3) +
  label(646, 116, "AFTER / AN EXPLICIT HANDOFF") +
  text(646, 172, "Review the handoff.", 33, c.ui, true, 500) +
  text(646, 211, "Know who acts next, before you send.", 17, c.quiet) +
  rule(646, 249, 488);
compare +=
  label(646, 285, "RECEIVING CLINIC") +
  text(646, 312, "East Community Clinic", 22, c.ui, true, 500) +
  label(646, 357, "NEXT OWNER AFTER DELIVERY") +
  text(646, 384, "Clinic coordinator", 22, c.ui, true, 500) +
  rect(646, 414, 488, 66, c.sage) +
  text(664, 441, "Ready to send", 14, c.green, false, 500) +
  text(664, 463, "Saved locally. Not delivered yet.", 12, c.quiet) +
  rect(646, 508, 488, 52, c.ui, "none", 3) +
  text(666, 540, "Confirm handoff", 15, c.paper) +
  text(1095, 541, "→", 22, c.lime);
svg("comparison", 1200, 660, "Before and after handoff review", compare);
let states =
  rect(0, 0, 1200, 580, c.ink) +
  label(40, 50, "SYSTEM DETAIL / THREE STATES, TWO OWNERS", c.muted);
const steps = [
  ["DRAFT", "Saved here", "Field worker", "Can edit or discard."],
  [
    "QUEUED",
    "Waiting for connection",
    "Field worker",
    "Can reconnect and retry.",
  ],
  [
    "SENT",
    "Delivery acknowledged",
    "Clinic coordinator",
    "Can accept and follow up.",
  ],
];
steps.forEach((s, i) => {
  const x = 40 + i * 390;
  states +=
    rect(x, 190, 340, 230, "#171a14", c.line, 3) +
    label(x + 24, 226, s[0], c.lime) +
    text(x + 24, 266, s[1], 22, c.paper, true, 500) +
    label(x + 24, 307, "CURRENT OWNER", c.muted) +
    text(x + 24, 335, s[2], 17, c.paper) +
    text(x + 24, 386, s[3], 13, c.muted);
  if (i < 2)
    states += `<path d="M${x + 347} 298h34" stroke="${c.lime}" marker-end="url(#arrow)"/>`;
});
states +=
  `<path d="M210 180V125H990V180" fill="none" stroke="${c.lime}" marker-end="url(#arrow)"/>` +
  label(456, 111, "ONLINE / SEND WITH ACKNOWLEDGEMENT", c.muted) +
  text(
    40,
    483,
    "Offline keeps the handoff with its sender.",
    25,
    c.paper,
    true,
  ) +
  text(
    40,
    526,
    "Illustrative state model. The live demo simulates delivery in memory; it does not store or transmit records.",
    13,
    c.muted,
  );
svg("states", 1200, 580, "Illustrative delivery and ownership states", states);
console.log(
  "Generated five editable SVG illustrations for the fictional Continuum sample.",
);
