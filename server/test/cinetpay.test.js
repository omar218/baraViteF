import assert from "node:assert/strict";
import test from "node:test";
import { checkCinetpay, initializeCinetpay } from "../services/cinetpay.js";

const envKeys = [
  "CINETPAY_API_KEY",
  "CINETPAY_SITE_ID",
  "CINETPAY_RETURN_URL",
  "CINETPAY_NOTIFY_URL",
  "CINETPAY_API_URL",
  "CONTACT_UNLOCK_PRICE_XOF",
  "NODE_ENV"
];

function configure(t) {
  const saved = Object.fromEntries(envKeys.map((key) => [key, process.env[key]]));
  Object.assign(process.env, {
    CINETPAY_API_KEY: "test-key",
    CINETPAY_SITE_ID: "test-site",
    CINETPAY_RETURN_URL: "https://app.example/paiement/retour",
    CINETPAY_NOTIFY_URL: "https://app.example/api/payments/webhook",
    CONTACT_UNLOCK_PRICE_XOF: "1250",
    NODE_ENV: "test"
  });
  t.after(() => {
    for (const [key, value] of Object.entries(saved)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });
}

function mockResponse(t, data) {
  const savedFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
  t.after(() => { globalThis.fetch = savedFetch; });
}

test("CinetPay status is accepted only when amount and currency match", async (t) => {
  configure(t);
  mockResponse(t, {
    code: "00",
    data: { transaction_id: "txn-1", status: "ACCEPTED", amount: 1250, currency: "XOF" }
  });
  assert.deepEqual(await checkCinetpay("txn-1", 1250), {
    status: "SUCCESS",
    providerRef: "txn-1"
  });
});

test("CinetPay status rejects a mismatched amount", async (t) => {
  configure(t);
  mockResponse(t, {
    code: "00",
    data: { transaction_id: "txn-2", status: "ACCEPTED", amount: 1251, currency: "XOF" }
  });
  await assert.rejects(checkCinetpay("txn-2", 1250), { status: 502 });
});

test("CinetPay status rejects a mismatched transaction reference", async (t) => {
  configure(t);
  mockResponse(t, {
    code: "00",
    data: { transaction_id: "another-txn", status: "ACCEPTED", amount: 1250, currency: "XOF" }
  });
  await assert.rejects(checkCinetpay("txn-2", 1250), { status: 502 });
});

test("CinetPay status rejects a currency other than XOF", async (t) => {
  configure(t);
  mockResponse(t, {
    code: "00",
    data: { transaction_id: "txn-2", status: "ACCEPTED", amount: 1250, currency: "EUR" }
  });
  await assert.rejects(checkCinetpay("txn-2", 1250), { status: 502 });
});

test("payment initialization rejects URLs outside CinetPay", async (t) => {
  configure(t);
  mockResponse(t, {
    code: "201",
    data: { payment_url: "https://payments.example/checkout", transaction_id: "txn-3" }
  });
  await assert.rejects(
    initializeCinetpay(
      { transactionId: "txn-3", amount: 1250, currency: "XOF", proId: "pro-1" },
      { _id: "client-1", name: "Client", phone: "+2250700000000" }
    ),
    { status: 502 }
  );
});
