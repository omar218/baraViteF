import mongoose from "mongoose";
import ConnectionUnlock from "../models/ConnectionUnlock.js";
import Payment from "../models/Payment.js";
import AppError from "../utils/AppError.js";

export async function reconcilePayment(transactionId, providerStatus) {
  const session = await mongoose.startSession();
  let result;
  try {
    await session.withTransaction(async () => {
      const payment = await Payment.findOne({ transactionId }).session(session);
      if (!payment) throw new AppError(404, "Transaction introuvable.");

      if (payment.status === "PENDING" || providerStatus.status === "SUCCESS") {
        payment.status = providerStatus.status;
        if (providerStatus.providerRef) payment.providerRef = providerStatus.providerRef;
        await payment.save({ session });
      }

      if (payment.status === "SUCCESS") {
        await ConnectionUnlock.updateOne(
          { clientId: payment.clientId, proId: payment.proId },
          {
            $setOnInsert: {
              clientId: payment.clientId,
              proId: payment.proId,
              paymentId: payment._id,
              unlockedAt: new Date()
            }
          },
          { upsert: true, session }
        );
      }
      result = { status: payment.status, proId: String(payment.proId), transactionId: payment.transactionId };
    });
  } finally {
    await session.endSession();
  }
  return result;
}
