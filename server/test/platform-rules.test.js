import assert from "node:assert/strict";
import test from "node:test";
import {
  calculatePaymentSplit,
  canReceiveMissions,
  DISPATCH_RADII_METERS,
  DISPATCH_RESPONSE_TIMEOUT_SECONDS,
  getVerificationRequirements
} from "../services/platform-rules.js";
import { getSearchTerms } from "../services/search.js";

test("calculates 10% commission on service and travel in XOF", () => {
  assert.deepEqual(calculatePaymentSplit(25000, 1500), {
    providerNetXof: 26500,
    platformFeeXof: 2650,
    totalAmountXof: 29150
  });
});

test("rounds commission to the nearest whole XOF", () => {
  assert.deepEqual(calculatePaymentSplit(5), {
    providerNetXof: 5,
    platformFeeXof: 1,
    totalAmountXof: 6
  });
});

test("rejects invalid payment amounts", () => {
  assert.throws(() => calculatePaymentSplit(0), TypeError);
  assert.throws(() => calculatePaymentSplit(100, -1), TypeError);
  assert.throws(() => calculatePaymentSplit(100.5), TypeError);
});

test("exposes the requested emergency dispatch tiers and timeout", () => {
  assert.deepEqual(DISPATCH_RADII_METERS, [5000, 10000, 20000]);
  assert.equal(DISPATCH_RESPONSE_TIMEOUT_SECONDS, 45);
});

test("requires the KYC and KYB evidence specified for each profile", () => {
  assert.deepEqual(getVerificationRequirements("kyc"), [
    "identity_document",
    "live_selfie",
    "qualification_or_references"
  ]);
  assert.deepEqual(getVerificationRequirements("kyb"), [
    "rccm",
    "nif_or_dfe",
    "manager_identity",
    "portfolio"
  ]);
  assert.throws(() => getVerificationRequirements("unknown"), TypeError);
});

test("mission eligibility requires approval of both provider and verification case", () => {
  assert.equal(canReceiveMissions({ verificationStatus: "approved" }, { status: "approved" }), true);
  assert.equal(canReceiveMissions({ verificationStatus: "approved" }, { status: "in_review" }), false);
  assert.equal(canReceiveMissions({ verificationStatus: "pending" }, { status: "approved" }), false);
  assert.equal(canReceiveMissions(null, null), false);
});

test("extracts service and place from natural-language searches", () => {
  assert.deepEqual(getSearchTerms("Besoin d'un infirmier à la maison à Cocody"), ["infirmier", "cocody"]);
  assert.deepEqual(getSearchTerms("Pharmacie de garde ouverte vers Riviera"), ["pharmacie", "riviera"]);
});
