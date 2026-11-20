import assert from "node:assert/strict";
import test from "node:test";
import { createPasswordResetToken, hashPasswordResetToken } from "../utils/password-reset.js";

test("password reset tokens are random and only their hash is stored", () => {
  const first = createPasswordResetToken();
  const second = createPasswordResetToken();

  assert.match(first.token, /^[a-f0-9]{64}$/);
  assert.equal(first.tokenHash, hashPasswordResetToken(first.token));
  assert.notEqual(first.token, first.tokenHash);
  assert.notEqual(first.tokenHash, second.tokenHash);
});
