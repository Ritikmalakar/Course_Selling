import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  razorpayPaymentId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  razorpayOrderId: {
    type: String,
    required: true,
    trim: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true
  },
  courseCreator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  amountPaise: {
    type: Number,
    required: true,
    min: 1
  },
  currency: {
    type: String,
    required: true,
    enum: ["INR"]
  },
  status: {
    type: String,
    required: true,
    enum: ["captured"],
    default: "captured"
  },
  capturedAt: {
    type: Date,
    required: true
  }
}, { timestamps: true });

paymentSchema.index({ courseCreator: 1, status: 1, currency: 1 });

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
