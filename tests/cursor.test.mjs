import test from "node:test";
import assert from "node:assert/strict";
import { initCursor } from "../src/modules/cursor.js";

// Lifecycle doubles exercise pointer-loss and event ordering without a browser.
// Top-layer rendering, CSS appearance and real hit-testing use browser checks.
function setup(t, options = {}) {
  const root = { dataset: { theme: "dark", motion: "full" } };
  let hovered = null,
    observer,
    nextFrame = 0;
  const frames = new Map();
  const media = Object.assign(new EventTarget(), {
    matches: options.fine ?? true,
  });
  const cursor = {
    dataset: {},
    style: {},
    hidden: false,
    open: false,
    attributes: {},
    raises: 0,
    setAttribute(name, value) {
      this.attributes[name] = value;
    },
    matches: () => cursor.open,
    remove() {
      this.removed = true;
    },
    hidePopover() {
      this.open = false;
    },
  };
  if (!options.unsupported)
    cursor.showPopover = () => {
      if (options.throws) throw new Error("Layer unavailable");
      cursor.open = true;
      cursor.raises++;
    };
  const document = Object.assign(new EventTarget(), {
    documentElement: root,
    hidden: false,
    body: { append() {} },
    createElement: () => cursor,
    querySelectorAll: () => [{}],
    elementFromPoint: () => hovered,
  });
  const window = Object.assign(new EventTarget(), { matchMedia: () => media });
  const globals = {
    window,
    document,
    requestAnimationFrame(callback) {
      frames.set(++nextFrame, callback);
      return nextFrame;
    },
    cancelAnimationFrame(id) {
      frames.delete(id);
    },
    MutationObserver: class {
      constructor(callback) {
        observer = callback;
      }
      observe() {}
      disconnect() {}
    },
  };
  for (const [key, value] of Object.entries(globals)) {
    const previous = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, { configurable: true, value });
    t.after(() => {
      if (previous) Object.defineProperty(globalThis, key, previous);
      else delete globalThis[key];
    });
  }
  const destroy = initCursor();
  const emit = (target, name, properties = {}) =>
    target.dispatchEvent(Object.assign(new Event(name), properties));
  return {
    cursor,
    root,
    window,
    document,
    frames,
    destroy,
    move(x = 100, y = 200, type = "mouse") {
      emit(window, "pointermove", {
        clientX: x,
        clientY: y,
        pointerType: type,
      });
    },
    flush() {
      const pending = [...frames.values()];
      frames.clear();
      pending.forEach((callback) => callback());
    },
    hover(kind) {
      hovered = kind
        ? {
            closest(selector) {
              const matches = {
                disabled: selector.startsWith("[disabled]"),
                project: selector.startsWith("[data-project-link]"),
                text: selector.startsWith("textarea"),
                link: selector.startsWith("a[href]"),
              };
              return matches[kind] ? this : null;
            },
          }
        : null;
    },
    capability(fine) {
      media.matches = fine;
      emit(media, "change");
    },
    overlays() {
      observer();
    },
    emit,
  };
}

test("the custom fallback stays until a visible layer exists; tracking settles after one frame", (t) => {
  const s = setup(t);
  assert.equal(s.root.dataset.cursor, "custom");
  assert.equal(s.root.dataset.cursorVisible, undefined);
  assert.equal(s.cursor.hidden, true);
  s.move(100, 200);
  s.move(320, 240);
  assert.equal(s.frames.size, 1);
  s.flush();
  assert.equal(s.cursor.style.transform, "translate3d(320px, 240px, 0)");
  assert.equal(s.cursor.open, true);
  assert.equal(s.cursor.hidden, false);
  assert.equal(s.root.dataset.cursorVisible, "");
  assert.equal(s.frames.size, 0);
});

test("project, link, text and disabled states follow the content under a stationary pointer on scroll", (t) => {
  const s = setup(t);
  s.move();
  s.flush();
  for (const state of ["project", "link", "text", "disabled", null]) {
    s.hover(state);
    s.emit(s.document, "scroll");
    s.flush();
    assert.equal(s.cursor.dataset.state, state || "default");
  }
});

test("unsupported or failing popovers never remove the fallback pointer", (t) => {
  const s = setup(t, { throws: true });
  s.move();
  s.flush();
  assert.equal(s.root.dataset.cursorVisible, undefined);
  assert.equal(s.cursor.hidden, true);
  s.move();
  assert.equal(s.frames.size, 0);
});

test("browsers without the popover API keep only the SVG cursor", (t) => {
  const s = setup(t, { unsupported: true });
  s.move();
  s.flush();
  assert.equal(s.root.dataset.cursor, "custom");
  assert.equal(s.root.dataset.cursorVisible, undefined);
  assert.equal(s.cursor.hidden, true);
});

test("touch, coarse pointers and loss of window focus clear the layer and click feedback", (t) => {
  const s = setup(t);
  s.move();
  s.flush();
  s.emit(s.window, "pointerdown", {
    pointerType: "mouse",
    button: 0,
    clientX: 100,
    clientY: 200,
  });
  assert.equal(s.cursor.dataset.pressed, "");
  s.emit(s.window, "blur");
  assert.equal(s.cursor.dataset.pressed, undefined);
  assert.equal(s.cursor.open, false);
  assert.equal(s.frames.size, 0);
  s.move();
  s.flush();
  s.move(100, 200, "touch");
  assert.equal(s.root.dataset.cursorVisible, undefined);
  s.capability(false);
  s.move();
  s.flush();
  assert.equal(s.root.dataset.cursor, undefined);
  assert.equal(s.cursor.open, false);
  s.capability(true);
  s.move();
  s.flush();
  assert.equal(s.root.dataset.cursorVisible, "");
});

test("dialog changes raise the cursor again and recheck its hover target", (t) => {
  const s = setup(t);
  s.move();
  s.flush();
  s.hover("link");
  s.overlays();
  assert.equal(s.root.dataset.cursorVisible, undefined);
  s.flush();
  assert.equal(s.cursor.raises, 2);
  assert.equal(s.cursor.dataset.state, "link");
  assert.equal(s.cursor.attributes["aria-hidden"], "true");
  assert.equal(s.cursor.attributes.popover, "manual");
});

test("keyboard navigation, hidden tabs and page restoration do not leave a ghost pointer", (t) => {
  const s = setup(t);
  for (const interrupt of [
    () => s.emit(s.document, "keydown", { key: "Tab" }),
    () => {
      s.document.hidden = true;
      s.emit(s.document, "visibilitychange");
    },
    () => s.emit(s.window, "pagehide"),
    () => s.emit(s.window, "pointerout", { relatedTarget: null }),
  ]) {
    s.document.hidden = false;
    s.move();
    s.flush();
    interrupt();
    assert.equal(s.root.dataset.cursorVisible, undefined);
    assert.equal(s.cursor.hidden, true);
    assert.equal(s.frames.size, 0);
  }
  s.emit(s.window, "pageshow");
  assert.equal(s.root.dataset.cursorVisible, undefined);
  s.document.hidden = false;
  s.move();
  s.flush();
  assert.equal(s.root.dataset.cursorVisible, "");
  s.destroy();
  s.move();
  s.flush();
  assert.equal(s.root.dataset.cursor, undefined);
  assert.equal(s.cursor.removed, true);
  assert.equal(s.frames.size, 0);
});
