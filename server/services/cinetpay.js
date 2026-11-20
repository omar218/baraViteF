import AppError from "../utils/AppError.js";

const defaultEndpoint = "https://api-checkout.cinetpay.com/v2";

function getCredentials() {
  const { CINETPAY_API_KEY: apiKey, CINETPAY_SITE_ID: siteId } = process.env;
  if (!apiKey || !siteId) throw new AppError(503, "Le paiement Mobile Money n'est pas configuré.");
  return { apiKey, siteId };
}

export function assertCinetpayConfigured() {
  getCredentials();
  if (!process.env.CINETPAY_RETURN_URL || !process.env.CINETPAY_NOTIFY_URL) {
    throw new AppError(503, "Les URL de retour et de notification du paiement ne sont pas configurées.");
  }
  try {
    const returnUrl = new URL(process.env.CINETPAY_RETURN_URL);
    const notifyUrl = new URL(process.env.CINETPAY_NOTIFY_URL);
    if (!["http:", "https:"].includes(returnUrl.protocol) || !["http:", "https:"].includes(notifyUrl.protocol)) {
      throw new Error("HTTP(S) URLs required");
    }
    if (process.env.NODE_ENV === "production" && (returnUrl.protocol !== "https:" || notifyUrl.protocol !== "https:")) {
      throw new Error("HTTPS required");
    }
  } catch {
    throw new AppError(500, "Les URL de retour et de notification du paiement doivent être valides.");
  }
}

async function postJson(url, payload) {
  let response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15000)
    });
  } catch {
    throw new AppError(502, "La passerelle de paiement est momentanément inaccessible.");
  }
  if (!response.ok) throw new AppError(502, "La passerelle de paiement a refusé la requête.");
  let result;
  try {
    result = await response.json();
  } catch {
    throw new AppError(502, "La passerelle de paiement a renvoyé une réponse invalide.");
  }
  if (String(result.code) !== "201" && String(result.code) !== "00") {
    throw new AppError(502, "L'initialisation ou la vérification du paiement a échoué.");
  }
  return result;
}

export async function initializeCinetpay(payment, client) {
  assertCinetpayConfigured();
  const { apiKey, siteId } = getCredentials();
  const returnUrl = process.env.CINETPAY_RETURN_URL;
  const notifyUrl = process.env.CINETPAY_NOTIFY_URL;

  let redirect;
  try {
    redirect = new URL(returnUrl);
  } catch {
    throw new AppError(500, "CINETPAY_RETURN_URL doit être une URL valide.");
  }
  redirect.searchParams.set("transaction_id", payment.transactionId);

  const endpoint = (process.env.CINETPAY_API_URL || defaultEndpoint).replace(/\/$/, "");
  const [customerName, ...surnameParts] = client.name.trim().split(/\s+/);
  const result = await postJson(`${endpoint}/payment`, {
    apikey: apiKey,
    site_id: siteId,
    transaction_id: payment.transactionId,
    amount: payment.amount,
    currency: payment.currency,
    description: "Déblocage du contact professionnel — Barra Rapide",
    return_url: redirect.toString(),
    notify_url: notifyUrl,
    channels: "ALL",
    customer_id: String(client._id),
    customer_name: customerName,
    customer_surname: surnameParts.join(" ") || customerName,
    customer_email: client.email,
    customer_phone_number: client.phone,
    metadata: JSON.stringify({ proId: String(payment.proId) })
  });

  const paymentUrl = result.data?.payment_url;
  let paymentHost;
  try {
    paymentHost = new URL(paymentUrl).hostname.toLowerCase();
  } catch {
    paymentHost = "";
  }
  if (
    typeof paymentUrl !== "string" || paymentUrl.length > 2048 ||
    !/^https:\/\//i.test(paymentUrl) ||
    !(paymentHost === "cinetpay.com" || paymentHost.endsWith(".cinetpay.com"))
  ) {
    throw new AppError(502, "La passerelle n'a pas fourni d'URL de paiement sécurisée.");
  }
  return { paymentUrl, providerRef: result.data?.transaction_id || "" };
}

export async function checkCinetpay(transactionId, expectedAmount, expectedCurrency = "XOF") {
  const { apiKey, siteId } = getCredentials();
  const endpoint = (process.env.CINETPAY_API_URL || defaultEndpoint).replace(/\/$/, "");
  const result = await postJson(`${endpoint}/payment/check`, {
    apikey: apiKey,
    site_id: siteId,
    transaction_id: transactionId
  });
  const data = result.data || {};
  const returnedId = data.transaction_id || data.cpm_trans_id;
  if (returnedId !== transactionId) {
    throw new AppError(502, "La transaction vérifiée ne correspond pas à la demande.");
  }
  if (data.status === "ACCEPTED") {
    if (!Number.isSafeInteger(Number(data.amount)) || Number(data.amount) !== expectedAmount) {
      throw new AppError(502, "Le montant confirmé par la passerelle ne correspond pas au montant attendu.");
    }
    if (data.currency !== expectedCurrency) {
      throw new AppError(502, "La devise confirmée par la passerelle ne correspond pas à XOF.");
    }
    return { status: "SUCCESS", providerRef: String(returnedId || "") };
  }
  if (["REFUSED", "CANCELLED", "EXPIRED"].includes(data.status)) {
    return { status: "FAILED", providerRef: String(returnedId || "") };
  }
  return { status: "PENDING", providerRef: String(returnedId || "") };
}
