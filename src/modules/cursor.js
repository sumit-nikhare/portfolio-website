const PROJECT = "[data-project-link], a[data-gallery]";
const EDITABLE =
  'textarea, input:not([type]), input:is([type="text"], [type="email"], [type="search"], [type="url"], [type="tel"], [type="password"], [type="number"]), [contenteditable]:not([contenteditable="false"])';
const INTERACTIVE =
  'a[href], button, summary, select, input, label, [role="button"], [role="tab"], [role="checkbox"], [role="switch"], [tabindex]:not([tabindex="-1"])';

export function cursorStateFor(element) {
  if (!element?.closest) return "default";
  if (element.closest('[disabled], [aria-disabled="true"], [inert]'))
    return "disabled";
  if (element.closest(PROJECT)) return "project";
  if (element.closest(EDITABLE)) return "text";
  if (element.closest(INTERACTIVE)) return "link";
  return "default";
}

export function initCursor() {
  const root = document.documentElement;
  const media = window.matchMedia(
    "(hover: hover) and (pointer: fine) and (forced-colors: none)",
  );
  const cursor = document.createElement("div");
  cursor.className = "site-cursor";
  cursor.hidden = true;
  cursor.setAttribute("aria-hidden", "true");
  cursor.setAttribute("popover", "manual");
  cursor.innerHTML =
    '<span class="cursor-mark"><span class="cursor-ring"></span><span class="cursor-dot"></span><span class="cursor-label">VIEW<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 12 12 4M4 4h8v8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg></span></span>';
  document.body.append(cursor);

  let frame = 0,
    positioned = false,
    destroyed = false,
    x = 0,
    y = 0;
  let enhanced = typeof cursor.showPopover === "function";
  let raised = false;
  const canShow = () =>
    !destroyed && enhanced && media.matches && positioned && !document.hidden;
  const conceal = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    positioned = false;
    delete root.dataset.cursorVisible;
    delete cursor.dataset.pressed;
    if (raised) {
      try {
        cursor.hidePopover();
      } catch {
        /* The browser may have closed it. */
      }
      raised = false;
    }
    cursor.hidden = true;
  };
  const show = () => {
    if (!enhanced) return false;
    try {
      cursor.hidden = false;
      if (!raised || !cursor.matches(":popover-open")) cursor.showPopover();
      raised = true;
      return true;
    } catch {
      enhanced = false;
      conceal();
      return false;
    }
  };
  const draw = () => {
    frame = 0;
    if (!canShow()) return;
    cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    cursor.dataset.state = cursorStateFor(document.elementFromPoint(x, y));
    // Only hide the SVG pointer after the replacement can paint successfully.
    if (show()) root.dataset.cursorVisible = "";
  };
  const queue = () => {
    if (!frame && canShow()) frame = requestAnimationFrame(draw);
  };
  const move = (event) => {
    if (event.pointerType !== "mouse" || !media.matches) {
      conceal();
      return;
    }
    x = event.clientX;
    y = event.clientY;
    positioned = true;
    queue();
  };
  const press = (event) => {
    if (event.pointerType !== "mouse") {
      conceal();
      return;
    }
    move(event);
    if (event.button === 0 && media.matches) cursor.dataset.pressed = "";
  };
  const release = () => {
    delete cursor.dataset.pressed;
    queue();
  };
  const leave = (event) => {
    if (!event.relatedTarget) conceal();
  };
  const keyboard = (event) => {
    if (event.key === "Tab") conceal();
  };
  const configure = () => {
    conceal();
    if (media.matches) root.dataset.cursor = "custom";
    else delete root.dataset.cursor;
  };
  const visibility = () => {
    if (document.hidden) conceal();
  };
  // A manual popover is noninteractive and sits above native modal dialogs.
  // Reinsert it into the top layer when a menu or media dialog opens/closes.
  const overlays = new MutationObserver(() => {
    if (raised) {
      try {
        cursor.hidePopover();
      } catch {
        /* Already hidden. */
      }
      raised = false;
      delete root.dataset.cursorVisible;
    }
    queue();
  });
  document
    .querySelectorAll("dialog")
    .forEach((dialog) =>
      overlays.observe(dialog, { attributes: true, attributeFilter: ["open"] }),
    );

  const events = [
    [window, "pointermove", move],
    [window, "pointerdown", press],
    [window, "pointerup", release],
    [window, "pointercancel", conceal],
    [window, "pointerout", leave],
    [window, "blur", conceal],
    [window, "pagehide", conceal],
    [window, "pageswap", conceal],
    [window, "pageshow", configure],
    [window, "resize", queue],
    [window, "contextmenu", conceal],
    [window, "dragstart", conceal],
    [document, "scroll", queue],
    [document, "keydown", keyboard],
    [document, "visibilitychange", visibility],
  ];
  events.forEach(([target, name, handler]) =>
    target.addEventListener(name, handler, { capture: true, passive: true }),
  );
  media.addEventListener("change", configure);
  configure();
  return () => {
    destroyed = true;
    conceal();
    overlays.disconnect();
    events.forEach(([target, name, handler]) =>
      target.removeEventListener(name, handler, true),
    );
    media.removeEventListener("change", configure);
    delete root.dataset.cursor;
    cursor.remove();
  };
}
