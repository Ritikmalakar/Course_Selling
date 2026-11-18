import express from 'express'
import { getEducatorEarnings, razorpayOrder, verifyPayment } from '../controller/orderController.js';
import { isAuth } from '../middleware/isAuth.js';

const router = express.Router()
router.post("/razorpay-order", isAuth, razorpayOrder)
router.post("/verifyPayment", isAuth, verifyPayment)
router.get("/educator-earnings", isAuth, getEducatorEarnings)

export default router;