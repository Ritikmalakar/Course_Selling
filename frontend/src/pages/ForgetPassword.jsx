
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ShieldCheck, ArrowLeft, KeyRound } from 'lucide-react';
import axios from 'axios';
import { serverUrl } from '../App';
import { toast } from 'react-toastify';

function ForgetPassword() {
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // STEP 1: SEND OTP
  const sendEmailOtp = async () => {
    if (!email) {
      toast.error("Please enter email");
      return;
    }

    try {
      setLoading(true);

      const result = await axios.post(
        `${serverUrl}/api/user/sendOtp`,
        { email },
        { withCredentials: true }
      );

      toast.success(result.data.message);
      setStep(2);

    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };


  // STEP 2: VERIFY OTP
  const verifyOtp = async () => {
    if (otp.length !== 4) {
      toast.error("Please enter 4 digit OTP");
      return;
    }

    try {
      setLoading(true);

      const result = await axios.post(
        `${serverUrl}/api/user/verifyOtp`,
        { email, otp },
        { withCredentials: true }
      );

      toast.success(result.data.message);
      setStep(3);

    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };


  // STEP 3: RESET PASSWORD
  const changePassword = async () => {
    if (!password) {
      toast.error("Please enter new password");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    try {
      setLoading(true);

      const result = await axios.post(
        `${serverUrl}/api/user/resetPassword`,
        { email, password },
        { withCredentials: true }
      );

      toast.success(result.data.message);

      setEmail("");
      setOtp("");
      setPassword("");
      setStep(1);

      navigate("/login");

    } catch (error) {
      toast.error(error.response?.data?.message || "Password reset failed");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-purple-100 px-4 py-10">

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
            <KeyRound size={30} className="text-indigo-600" />
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            {step === 1 && "Forgot Password?"}
            {step === 2 && "Verify OTP"}
            {step === 3 && "Create New Password"}
          </h1>

          <p className="text-gray-500 mt-2 text-sm">
            {step === 1 && "Enter your registered email to receive an OTP"}
            {step === 2 && `Enter the OTP sent to ${email}`}
            {step === 3 && "Create a new password for your account"}
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className={`h-2 w-12 rounded-full ${
                step >= item ? "bg-indigo-600" : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <div>
            <label className="text-sm font-semibold text-gray-700">
              Email Address
            </label>

            <div className="relative mt-2">
              <Mail className="absolute left-4 top-3.5 text-gray-400" size={20} />

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <button
              onClick={sendEmailOtp}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl mt-6 transition"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div>
            <label className="text-sm font-semibold text-gray-700">
              Enter 4 Digit OTP
            </label>

            <div className="relative mt-2">
              <ShieldCheck className="absolute left-4 top-3.5 text-gray-400" size={20} />

              <input
                type="text"
                inputMode="numeric"
                placeholder="Enter 4 digit OTP"
                maxLength={4}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="w-full border border-gray-300 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 tracking-widest"
              />
            </div>

            <button
              onClick={verifyOtp}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl mt-6 transition"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <button
              onClick={() => {
                setOtp("");
                setStep(1);
              }}
              className="w-full text-indigo-600 font-medium mt-4"
            >
              Change Email
            </button>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div>
            <label className="text-sm font-semibold text-gray-700">
              New Password
            </label>

            <div className="relative mt-2">
              <Lock className="absolute left-4 top-3.5 text-gray-400" size={20} />

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-xl py-3 pl-12 pr-16 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3 text-sm text-indigo-600 font-medium"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <button
              onClick={changePassword}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl mt-6 transition"
            >
              {loading ? "Updating..." : "Change Password"}
            </button>
          </div>
        )}

        {/* Back to Login */}
        <div className="mt-8 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-indigo-600 font-medium text-sm"
          >
            <ArrowLeft size={16} />
            Back to Login
          </Link>
        </div>

      </div>
    </div>
  );
}

export default ForgetPassword;
