import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";

const source = readFileSync(
  new URL("../src/modules/playground.js", import.meta.url),
  "utf8",
)
  .replace(/^import .+;\n/gm, "")
  .replace("export function", "function");
function setup() {
  const element = () =>
    Object.assign(new EventTarget(), {
      style: {},
      attributes: {},
      textContent: "",
      disabled: false,
      setAttribute(key, value) {
        this.attributes[key] = value;
      },
    });
  const path = Object.assign(element(), {
    getTotalLength: () => 100,
    getPointAtLength: (value) => ({ x: value, y: value / 2 }),
  });
  const dot = element(),
    replay = element(),
    pause = element();
  const nodes = {
    "[data-svg-path]": path,
    "[data-svg-dot]": dot,
    "[data-svg-replay]": replay,
    "[data-svg-pause]": pause,
  };
  const document = Object.assign(new EventTarget(), {
    hidden: false,
    querySelector: (key) => nodes[key] || null,
  });
  const window = new EventTarget();
  const state = { mode: "full", tweens: [] };
  runInNewContext(`${source}\ninitPlayground(() => state.mode);`, {
    document,
    window,
    state,
    Flip: {},
    motion: { svgTrace: 4 },
    gsap: {
      registerPlugin() {},
      to(target, options) {
        let paused = false;
        const tween = {
          killed: false,
          kill() {
            this.killed = true;
          },
          paused(value) {
            if (value !== undefined) paused = value;
            return paused;
          },
          pause() {
            paused = true;
          },
          isActive() {
            return !paused && !this.killed;
          },
          finish() {
            target.progress = 1;
            options.onUpdate();
            options.onComplete();
          },
        };
        state.tweens.push(tween);
        return tween;
      },
    },
  });
  return { path, dot, replay, pause, document, window, state };
}

test("motion changes and page exit settle SVG playback without starting another animation", () => {
  const s = setup();
  assert.equal(s.path.style.strokeDashoffset, "0");
  assert.equal(s.pause.disabled, true);
  s.replay.dispatchEvent(new Event("click"));
  assert.equal(s.path.style.strokeDashoffset, "100");
  s.state.mode = "reduced";
  s.document.dispatchEvent(new Event("portfolio:motion"));
  assert.equal(s.state.tweens[0].killed, true);
  assert.equal(s.path.style.strokeDashoffset, "0");
  s.state.mode = "full";
  s.document.dispatchEvent(new Event("portfolio:motion"));
  assert.equal(s.state.tweens.length, 1);
  s.replay.dispatchEvent(new Event("click"));
  s.window.dispatchEvent(new Event("pagehide"));
  assert.equal(s.state.tweens[1].killed, true);
  assert.equal(s.pause.disabled, true);
  assert.equal(s.pause.attributes["aria-pressed"], "false");
  assert.equal(s.dot.attributes.cx, 100);
});

test("SVG playback pauses in a hidden tab and explicit replay and completion keep controls consistent", () => {
  const s = setup();
  s.replay.dispatchEvent(new Event("click"));
  s.document.hidden = true;
  s.document.dispatchEvent(new Event("visibilitychange"));
  assert.equal(s.state.tweens[0].paused(), true);
  assert.equal(s.pause.textContent, "Resume");
  s.document.hidden = false;
  s.document.dispatchEvent(new Event("visibilitychange"));
  assert.equal(s.state.tweens[0].paused(), true);
  s.pause.dispatchEvent(new Event("click"));
  assert.equal(s.pause.attributes["aria-pressed"], "false");
  s.state.tweens[0].finish();
  assert.equal(s.pause.disabled, true);
  assert.equal(s.path.style.strokeDashoffset, "0");
  s.state.mode = "reduced";
  s.replay.dispatchEvent(new Event("click"));
  assert.equal(s.state.tweens.length, 1);
  assert.equal(s.path.style.strokeDashoffset, "0");
});
