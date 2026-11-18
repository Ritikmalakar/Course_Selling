import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import { isValidRazorpaySignature, toPaise } from "../utils/razorpay.js";

test("converts course prices from rupees to paise", () => {
  assert.equal(toPaise(250), 25000);
  assert.equal(toPaise(12.5), 1250);
  assert.equal(toPaise(0), null);
  assert.equal(toPaise(-1), null);
  assert.equal(toPaise(Number.MAX_SAFE_INTEGER), null);
});

test("accepts only a valid Razorpay order-payment signature", () => {
  const orderId = "order_test123";
  const paymentId = "pay_test456";
  const secret = "test-secret";
  const signature = createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  assert.equal(isValidRazorpaySignature({ orderId, paymentId, signature, secret }), true);
  assert.equal(isValidRazorpaySignature({
    orderId,
    paymentId,
    signature: "0".repeat(64),
    secret
  }), false);
  assert.equal(isValidRazorpaySignature({
    orderId,
    paymentId,
    signature: "not-a-signature",
    secret
  }), false);
});
