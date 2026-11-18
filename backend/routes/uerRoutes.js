import express from 'express'
import { googleLogin, login, logout, resetPassword, sendOtp, signUp, verifyOtp } from '../controller/userController.js';

const router = express.Router();
router.post("/signUp", signUp)
router.post("/login", login);
router.get("/logout", logout);
router.post("/sendOtp", sendOtp);
router.post("/verifyOtp", verifyOtp);
router.post("/resetPassword", resetPassword)
router.post("/google-login", googleLogin)
export default router;