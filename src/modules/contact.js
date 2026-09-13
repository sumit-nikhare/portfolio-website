export function composeMessage({ name, email, intent, message }) {
  return `Hello,\n\n${message.trim()}\n\nAbout: ${intent || "A conversation"}\n\n${name.trim()}\n${email.trim()}`;
}
export function emailDraftUrl(recipient, subject, body) {
  return `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
export function initContact() {
  const form = document.querySelector("[data-contact-form]");
  if (!form) return;
  const preview = document.querySelector("[data-message-preview]");
  const message = document.querySelector("[data-message-text]");
  const copyStatus = document.querySelector("[data-copy-status]");
  const draft = document.querySelector("[data-send-email]");
  const name = form.elements.namedItem("name");
  const context = form.elements.namedItem("message");
  const validate = () => {
    name.setCustomValidity(name.value.trim() ? "" : "Please enter your name.");
    context.setCustomValidity(
      context.value.trim().length >= 20
        ? ""
        : "Please add at least 20 characters of context.",
    );
  };
  form.addEventListener("input", () => {
    name.setCustomValidity("");
    context.setCustomValidity("");
    preview.hidden = true;
    copyStatus.textContent = "";
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    validate();
    if (!form.reportValidity()) return;
    const data = Object.fromEntries(new FormData(form));
    message.textContent = composeMessage(data);
    const recipient = form.dataset.recipient;
    draft.hidden = !recipient;
    if (recipient)
      draft.href = emailDraftUrl(
        recipient,
        `Portfolio enquiry — ${data.intent}`,
        message.textContent,
      );
    document.querySelector("[data-message-status]").textContent = recipient
      ? "Nothing has been sent. Review your message, then copy it or open a draft in your email app."
      : "Preview mode: a contact address has not been added. You can review and copy your draft; nothing has been sent.";
    copyStatus.textContent = "";
    preview.hidden = false;
    document.querySelector("#message-preview-title").focus();
  });
  form.addEventListener("reset", () => {
    preview.hidden = true;
    message.textContent = "";
    copyStatus.textContent = "";
    draft.removeAttribute("href");
    name.setCustomValidity("");
    context.setCustomValidity("");
  });
  document
    .querySelector("[data-copy-message]")
    .addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(message.textContent);
        copyStatus.textContent = "Message copied. Nothing has been sent.";
      } catch {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(message);
        selection.removeAllRanges();
        selection.addRange(range);
        copyStatus.textContent =
          "Copy is unavailable. The message is selected so you can copy it manually.";
      }
    });
}
