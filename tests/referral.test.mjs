import test from "node:test";
import assert from "node:assert/strict";
import {
  initialReferral,
  updateReferral,
} from "../src/modules/referral-state.js";
const send = (state, type, value) => updateReferral(state, { type, value });
const review = () => send(send(initialReferral(), "choose", "east"), "review");

test("referral requires a known destination before review or confirmation", () => {
  const start = initialReferral();
  const invalid = send(start, "review");
  assert.equal(invalid.step, "choose");
  assert.match(invalid.error, /Choose a receiving clinic/);
  assert.deepEqual(send(start, "confirm"), start);
  for (const value of ["", "unknown", "toString", "__proto__", null])
    assert.deepEqual(send(start, "choose", value), start);
  assert.equal(send(invalid, "choose", "east").error, "");
});
test("back preserves the selection and allows a different destination", () => {
  const back = send(review(), "back");
  assert.equal(back.step, "choose");
  assert.equal(back.destination, "east");
  assert.equal(
    send(send(back, "choose", "north"), "review").destination,
    "north",
  );
});
test("online confirmation delivers once despite repeated activation", () => {
  const done = send(review(), "confirm");
  assert.equal(done.step, "confirm");
  assert.equal(done.status, "sent");
  assert.equal(done.deliveries, 1);
  for (const type of ["confirm", "reconnect", "back", "review", "offline"])
    assert.deepEqual(send(done, type, true), done);
});
test("offline handoff stays queued until explicitly sent after reconnection", () => {
  const queued = send(send(review(), "offline", true), "confirm");
  assert.equal(queued.status, "queued");
  assert.equal(queued.deliveries, 0);
  assert.deepEqual(send(queued, "confirm"), queued);
  const online = send(queued, "offline", false);
  assert.equal(online.status, "queued");
  const sent = send(online, "reconnect");
  assert.equal(sent.status, "sent");
  assert.equal(sent.offline, false);
  assert.equal(sent.deliveries, 1);
  assert.deepEqual(send(sent, "reconnect"), sent);
});
test("restart resets every stage and independent sessions share no state", () => {
  const other = initialReferral();
  for (const state of [
    initialReferral(),
    review(),
    send(review(), "confirm"),
    send(send(review(), "offline", true), "confirm"),
  ])
    assert.deepEqual(send(state, "restart"), other);
  const first = send(other, "choose", "east");
  assert.equal(other.destination, "");
  assert.equal(first.destination, "east");
  assert.deepEqual(send(other, "not-an-action"), other);
});
