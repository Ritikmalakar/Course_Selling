import { createHmac, timingSafeEqual } from "node:crypto";

export function toPaise(price) {
  const amount = Number(price);
  if (!Number.isFinite(amount) || amount <= 0) return null;

  const paise = Math.round(amount * 100);
  return Number.isSafeInteger(paise) && paise > 0 ? paise : null;
}

export function isValidRazorpaySignature({ orderId, paymentId, signature, secret }) {
  if (
    typeof orderId !== "string" ||
    typeof paymentId !== "string" ||
    typeof signature !== "string" ||
    typeof secret !== "string" ||
    !orderId ||
    !paymentId ||
    !secret ||
    !/^[a-f\d]{64}$/i.test(signature)
  ) {
    return false;
  }

  const expected = createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest();
  const received = Buffer.from(signature, "hex");

  return received.length === expected.length && timingSafeEqual(received, expected);
}
