import assert from "node:assert/strict";
import test from "node:test";
import { createAccentInsensitiveRegex } from "../utils/search.js";

test("profession search matches accented and unaccented French terms", () => {
  const trade = createAccentInsensitiveRegex("Électricien", true);
  assert.match("Électricien", trade);
  assert.match("electricien", trade);
  assert.doesNotMatch("électriciens", trade);
});

test("search text treats user input as literal text", () => {
  const search = createAccentInsensitiveRegex("électricien.*");
  assert.match("offre électricien.* à Abidjan", search);
  assert.doesNotMatch("offre électricien compétent à Abidjan", search);
});
