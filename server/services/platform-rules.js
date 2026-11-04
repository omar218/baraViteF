export const DISPATCH_RADII_METERS = Object.freeze([5000, 10000, 20000]);
export const DISPATCH_RESPONSE_TIMEOUT_SECONDS = 45;
export const PLATFORM_COMMISSION_BASIS_POINTS = 1000;

export function calculatePlatformFeeXof(amountXof) {
  if (!Number.isSafeInteger(amountXof) || amountXof < 0) {
    throw new TypeError("Le montant doit être un entier positif ou nul en XOF.");
  }
  return Math.round(amountXof * PLATFORM_COMMISSION_BASIS_POINTS / 10000);
}

export function calculatePaymentSplit(serviceAmountXof, travelFeeXof = 0) {
  if (!Number.isSafeInteger(serviceAmountXof) || serviceAmountXof < 1) {
    throw new TypeError("Le montant du service doit être un entier positif en XOF.");
  }
  if (!Number.isSafeInteger(travelFeeXof) || travelFeeXof < 0) {
    throw new TypeError("Les frais de déplacement doivent être un entier positif ou nul en XOF.");
  }

  const providerNetXof = serviceAmountXof + travelFeeXof;
  const platformFeeXof = calculatePlatformFeeXof(providerNetXof);
  const totalAmountXof = providerNetXof + platformFeeXof;
  if (!Number.isSafeInteger(totalAmountXof)) {
    throw new RangeError("Le montant calculé dépasse la capacité de traitement.");
  }

  return { providerNetXof, platformFeeXof, totalAmountXof };
}

export function getVerificationRequirements(kind) {
  if (kind === "kyc") return ["identity_document", "live_selfie", "qualification_or_references"];
  if (kind === "kyb") return ["rccm", "nif_or_dfe", "manager_identity", "portfolio"];
  throw new TypeError("Le type de vérification doit être kyc ou kyb.");
}

export function canReceiveMissions(professional, verification) {
  return professional?.verificationStatus === "approved" && verification?.status === "approved";
}
