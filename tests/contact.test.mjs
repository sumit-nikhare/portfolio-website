import test from "node:test";
import assert from "node:assert/strict";
import { composeMessage, emailDraftUrl } from "../src/modules/contact.js";
test("email draft preserves Unicode and encodes text that resembles URL parameters", () => {
  const body = composeMessage({
    name: " A visitor ",
    email: "visitor@example.com",
    intent: "A project",
    message: " Résumé & design? A new idea #1 + detail. ",
  });
  const url = emailDraftUrl("owner@example.com", "Design & résumé", body);
  const parsed = new URL(url);
  assert.equal(parsed.pathname, "owner@example.com");
  assert.equal(parsed.searchParams.get("subject"), "Design & résumé");
  assert.equal(parsed.searchParams.get("body"), body);
  assert.equal(parsed.searchParams.size, 2);
  assert.match(body, /A visitor\nvisitor@example.com$/);
});
