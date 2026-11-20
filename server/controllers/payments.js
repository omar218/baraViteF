import { randomUUID } from "node:crypto";
import mongoose from "mongoose";
import ConnectionUnlock from "../models/ConnectionUnlock.js";
import Payment from "../models/Payment.js";
import Professional from "../models/Professionals.js";
import { assertCinetpayConfigured, checkCinetpay, initializeCinetpay } from "../services/cinetpay.js";
import { reconcilePayment } from "../services/payments.js";
import AppError from "../utils/AppError.js";

function configuredPrice() {
  const amount = Number(process.env.CONTACT_UNLOCK_PRICE_XOF);
  if (!Number.isSafeInteger(amount) || amount < 1) {
    throw new AppError(503, "Le tarif de mise en relation n'est pas configuré.");
  }
  return amount;
}

export async function initUnlock(req, res, next) {
  const { proId } = req.body || {};
  if (!mongoose.isValidObjectId(proId)) return next(new AppError(400, "Identifiant de professionnel invalide."));

  try {
    const professional = await Professional.findById(proId);
    if (!professional) throw new AppError(404, "Professionnel introuvable.");
    if (!professional.available) throw new AppError(409, "Ce professionnel n'est pas actuellement disponible.");
    if (professional.userId && String(professional.userId) === String(req.user._id)) {
      throw new AppError(403, "Vous ne pouvez pas débloquer votre propre contact.");
    }
    if (await ConnectionUnlock.exists({ clientId: req.user._id, proId: professional._id })) {
      throw new AppError(409, "Ce contact est déjà débloqué.");
    }

    const amount = configuredPrice();
    assertCinetpayConfigured();
    const pendingPayment = await Payment.findOne({
      clientId: req.user._id,
      proId: professional._id,
      status: "PENDING"
    });
    if (pendingPayment) {
      const current = await updateFromProvider(pendingPayment);
      if (current.status === "SUCCESS") {
        throw new AppError(409, "Ce contact vient d'être débloqué.");
      }
      if (current.status === "PENDING") {
        const initialized = pendingPayment.metadata?.paymentUrl
          ? { paymentUrl: pendingPayment.metadata.paymentUrl, providerRef: pendingPayment.providerRef }
          : await initializeCinetpay(pendingPayment, req.user);
        pendingPayment.providerRef = initialized.providerRef;
        pendingPayment.metadata = { ...pendingPayment.metadata, paymentUrl: initialized.paymentUrl };
        await pendingPayment.save();
        return res.json({
          transactionId: pendingPayment.transactionId,
          paymentUrl: initialized.paymentUrl,
          amount: pendingPayment.amount,
          currency: pendingPayment.currency
        });
      }
    }
    let payment;
    try {
      payment = await Payment.create({
        transactionId: randomUUID(),
        clientId: req.user._id,
        proId: professional._id,
        amount,
        currency: "XOF",
        metadata: { purpose: "contact_unlock" }
      });
    } catch (error) {
      if (error.code === 11000) throw new AppError(409, "Un paiement est déjà en cours pour ce contact.");
      throw error;
    }

    const initialized = await initializeCinetpay(payment, req.user);
    payment.providerRef = initialized.providerRef;
    payment.metadata = { ...payment.metadata, paymentUrl: initialized.paymentUrl };
    await payment.save();
    res.status(201).json({
      transactionId: payment.transactionId,
      paymentUrl: initialized.paymentUrl,
      amount: payment.amount,
      currency: payment.currency
    });
  } catch (error) {
    next(error);
  }
}

async function updateFromProvider(payment) {
  const verified = await checkCinetpay(payment.transactionId, payment.amount, payment.currency);
  return reconcilePayment(payment.transactionId, verified);
}

export async function paymentWebhook(req, res, next) {
  const transactionId = req.body?.cpm_trans_id || req.body?.transaction_id;
  if (typeof transactionId !== "string" || transactionId.length > 100) {
    return next(new AppError(400, "Identifiant de transaction manquant ou invalide."));
  }
  try {
    const payment = await Payment.findOne({ transactionId });
    if (!payment) throw new AppError(404, "Transaction introuvable.");
    await updateFromProvider(payment);
    res.status(200).json({ received: true });
  } catch (error) {
    next(error);
  }
}

export async function paymentStatus(req, res, next) {
  try {
    const payment = await Payment.findOne({
      transactionId: req.params.transactionId,
      clientId: req.user._id
    });
    if (!payment) throw new AppError(404, "Transaction introuvable.");

    if (payment.status === "PENDING") await updateFromProvider(payment);
    const refreshed = await Payment.findOne({ _id: payment._id, clientId: req.user._id });
    res.json({
      transactionId: refreshed.transactionId,
      status: refreshed.status,
      proId: String(refreshed.proId),
      amount: refreshed.amount,
      currency: refreshed.currency
    });
  } catch (error) {
    next(error);
  }
}

export async function paymentHistory(req, res, next) {
  try {
    const payments = await Payment.find({ clientId: req.user._id })
      .select("transactionId proId amount currency status providerRef createdAt")
      .populate("proId", "name trade city")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    res.json(payments);
  } catch (error) {
    next(error);
  }
}

export async function unlockPrice(_req, res, next) {
  try {
    res.json({ amount: configuredPrice(), currency: "XOF" });
  } catch (error) {
    next(error);
  }
}
