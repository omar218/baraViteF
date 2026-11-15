import assert from "node:assert/strict";
import test from "node:test";
import { isValidGeoPoint, parseGeoPoint } from "../services/geolocation.js";

test("parses client latitude and longitude into GeoJSON coordinate order", () => {
  assert.deepEqual(parseGeoPoint("5.36", "-4.0083"), {
    point: { type: "Point", coordinates: [-4.0083, 5.36] }
  });
  assert.deepEqual(parseGeoPoint(undefined, undefined), { point: null });
});

test("rejects incomplete or out-of-range client coordinates", () => {
  assert.ok(parseGeoPoint("5.36", undefined).error);
  assert.ok(parseGeoPoint("91", "0").error);
  assert.ok(parseGeoPoint("not-a-number", "0").error);
});

test("validates professional GeoJSON points", () => {
  assert.equal(isValidGeoPoint({ type: "Point", coordinates: [-4.0083, 5.36] }), true);
  assert.equal(isValidGeoPoint({ type: "Point", coordinates: [181, 5.36] }), false);
  assert.equal(isValidGeoPoint({ type: "Point", coordinates: [-4.0083] }), false);
});
