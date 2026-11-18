import dotenv from "dotenv";
import mongoose from "mongoose";
import Razorpay from "razorpay";
import Course from "../models/courseModel.js";
import Payment from "../models/payment.js";
import User from "../models/user.js";
import { isValidRazorpaySignature, toPaise } from "../utils/razorpay.js";

dotenv.config();

function createRazorpayClient() {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_SECRET;

  if (!key_id || !key_secret) {
    throw new Error("Razorpay credentials are not configured");
  }

  return {
    key_id,
    key_secret,
    client: new Razorpay({ key_id, key_secret })
  };
}

export async function razorpayOrder(req, res) {
  try {
    const { courseId } = req.body;

    if (!mongoose.isValidObjectId(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid courseId"
      });
    }

    const user = await User.findById(req.userId).select("role enrollCourses");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.role !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only students can enroll in courses"
      });
    }

    const course = await Course.findOne({ _id: courseId, isPublished: true });
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Published course not found"
      });
    }

    if (course.creater?.toString() === user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Course creators cannot enroll in their own course"
      });
    }

    if (user.enrollCourses.some(id => id.toString() === courseId)) {
      return res.status(409).json({
        success: false,
        message: "You are already enrolled in this course"
      });
    }

    const amount = toPaise(course.price);
    if (!amount) {
      return res.status(400).json({
        success: false,
        message: "This course does not have a valid paid price"
      });
    }

    const { client, key_id } = createRazorpayClient();
    const order = await client.orders.create({
      amount,
      currency: "INR",
      receipt: `${courseId}-${Date.now()}`,
      notes: {
        courseId: courseId.toString(),
        userId: user._id.toString()
      }
    });

    return res.status(201).json({
      success: true,
      keyId: key_id,
      order
    });
  } catch (error) {
    console.error("Razorpay order creation failed:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to start checkout. Please try again."
    });
  }
}

export async function verifyPayment(req, res) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (
      typeof razorpay_order_id !== "string" ||
      typeof razorpay_payment_id !== "string" ||
      typeof razorpay_signature !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Razorpay payment details are required"
      });
    }

    const { client, key_secret } = createRazorpayClient();
    if (!isValidRazorpaySignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
      secret: key_secret
    })) {
      return res.status(400).json({
        success: false,
        message: "Payment signature is invalid"
      });
    }

    const order = await client.orders.fetch(razorpay_order_id);
    if (order.notes?.userId !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "This payment order does not belong to the current user"
      });
    }

    const courseId = order.notes?.courseId;
    if (!mongoose.isValidObjectId(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Payment order does not contain a valid course"
      });
    }

    const [payment, course, user] = await Promise.all([
      client.payments.fetch(razorpay_payment_id),
      Course.findById(courseId),
      User.findById(req.userId).select("role")
    ]);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.role !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only students can enroll in courses"
      });
    }

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    if (
      payment.order_id !== order.id ||
      payment.status !== "captured" ||
      payment.amount !== order.amount ||
      payment.currency !== order.currency ||
      order.currency !== "INR" ||
      order.status !== "paid"
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment has not been successfully captured"
      });
    }

    const paymentDetails = {
      razorpayPaymentId: payment.id,
      razorpayOrderId: order.id,
      student: user._id,
      course: course._id,
      courseCreator: course.creater,
      amountPaise: payment.amount,
      currency: payment.currency,
      status: "captured",
      capturedAt: new Date(payment.created_at * 1000)
    };

    let savedPayment = await Payment.findOne({
      razorpayPaymentId: payment.id
    });

    if (!savedPayment) {
      try {
        savedPayment = await Payment.create(paymentDetails);
      } catch (error) {
        if (error.code !== 11000) throw error;
        savedPayment = await Payment.findOne({
          razorpayPaymentId: payment.id
        });
        if (!savedPayment) throw error;
      }
    }

    if (
      savedPayment.razorpayOrderId !== paymentDetails.razorpayOrderId ||
      savedPayment.student.toString() !== paymentDetails.student.toString() ||
      savedPayment.course.toString() !== paymentDetails.course.toString() ||
      savedPayment.amountPaise !== paymentDetails.amountPaise
    ) {
      return res.status(409).json({
        success: false,
        message: "This payment is already recorded with different order details"
      });
    }

    const [updatedUser, updatedCourse] = await Promise.all([
      User.findByIdAndUpdate(
        req.userId,
        { $addToSet: { enrollCourses: course._id } },
        { new: true }
      ).select("-password"),
      Course.findByIdAndUpdate(
        course._id,
        { $addToSet: { enrolledStudents: req.userId } },
        { new: true }
      )
    ]);

    if (!updatedUser || !updatedCourse) {
      return res.status(500).json({
        success: false,
        message: "Payment was captured, but enrollment could not be completed. Contact support."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified and course enrollment completed",
      user: updatedUser
    });
  } catch (error) {
    console.error("Razorpay payment verification failed:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to verify payment. Please contact support if your payment was charged."
    });
  }
}

export async function getEducatorEarnings(req, res) {
  try {
    const educator = await User.findById(req.userId).select("role");
    if (!educator) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (educator.role !== "educator") {
      return res.status(403).json({
        success: false,
        message: "Only educators can view payment totals"
      });
    }

    const [summary] = await Payment.aggregate([
      {
        $match: {
          courseCreator: educator._id,
          status: "captured",
          currency: "INR"
        }
      },
      {
        $group: {
          _id: null,
          totalAmountPaise: { $sum: "$amountPaise" },
          paymentCount: { $sum: 1 }
        }
      }
    ]);

    return res.status(200).json({
      success: true,
      totalRevenue: (summary?.totalAmountPaise || 0) / 100,
      paymentCount: summary?.paymentCount || 0,
      currency: "INR"
    });
  } catch (error) {
    console.error("Educator earnings lookup failed:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load payment totals"
    });
  }
}
