
import { useState } from 'react';
import { toast } from 'react-toastify';
import { Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';

import logo from '../assets/logo.jpg';
import google from '../assets/google.jpg';
import { serverUrl } from '../lib/api';
import { useDispatch } from 'react-redux';
import { setUserData } from '../redux/slice';
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../utils/firebase';

function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch=useDispatch();
  const navigate = useNavigate();

  // Login Function
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      return toast.error("Please fill all fields");
    }

    try {
      setLoading(true);

      const result = await axios.post(
        `${serverUrl}/api/user/login`,
        {
          email,
          password
        },
        {
          withCredentials: true
        }
      );
      dispatch(setUserData(result.data.user))

      toast.success(result.data?.message || "Login successful!");

      navigate("/");

    } catch (error) {
      console.log("Login Error:", error);
      console.log("Backend Response:", error?.response?.data);

      toast.error(
        error?.response?.data?.message || "Login failed. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };


  const googleSignIn = async () => {
      try {
        setLoading(true);
  
        const response = await signInWithPopup(auth, provider);
  
        const user = response.user;
  
        const Gname = user.displayName;
        const Gemail = user.email;
  
        const result = await axios.post(
          `${serverUrl}/api/user/google-login`,
          {
            name: Gname,
            email: Gemail,
            
          },
          {
            withCredentials: true
          }
        );
  
        dispatch(setUserData(result.data.user));
  
        toast.success(
          result.data.message || "Google Signup Successful!"
        );
  
        navigate("/");
  
      } catch (error) {
        console.log(error);
  
        toast.error(
          error?.response?.data?.message || "Google Signup Failed!"
        );
      } finally {
        setLoading(false);
      }
    };
  

  return (

    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">

      {/* Left Section */}
      <div className="w-full md:w-[55%] min-h-screen flex items-center justify-center px-6 py-12">

        <div className="w-full max-w-md">

          <h1 className="text-3xl font-bold text-blue-950 mb-2">
            Welcome Back!
          </h1>

          <p className="text-slate-500 mb-8">
            Login to your account
          </p>

          <form onSubmit={handleLogin}>

            {/* Email */}
            <div className="mb-5">

              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email Address
              </label>

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 px-4 border border-slate-300 rounded-lg outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition"
              />

            </div>

            {/* Password */}
            <div className="mb-5">

              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Password
              </label>

              <div className="relative">

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 px-4 pr-12 border border-slate-300 rounded-lg outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-indigo-600"
                >
                  {showPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>

              </div>

            </div>

            {/* Forgot Password */}
            <div className="flex justify-end mb-6">

              <Link
                to="/forgot-password"
                className="text-sm text-indigo-600 font-semibold hover:underline"
              >
                Forgot Password?
              </Link>

            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold rounded-lg transition duration-300 shadow-md flex items-center justify-center"
            >
              {loading ? (
                <ClipLoader color="#ffffff" size={22} />
              ) : (
                "Login"
              )}
            </button>

          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-7">

            <div className="flex-1 h-px bg-slate-200"></div>

            <span className="text-sm text-slate-400">
              Or continue with
            </span>

            <div className="flex-1 h-px bg-slate-200"></div>

          </div>

          {/* Google Button */}
          <button onClick={googleSignIn}
            type="button"
            className="w-full h-12 bg-white border border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-100 transition flex items-center justify-center gap-3"
          >

            <img
              src={google}
              alt="Google"
              className="w-6 h-6 object-contain"
            />

            <span>Continue with Google</span>

          </button>

          {/* Signup Link */}
          <p className="text-center text-sm text-slate-500 mt-7">

            Don't have an account?

            <Link
              to="/signup"
              className="text-indigo-600 font-semibold ml-1 hover:underline"
            >
              Sign Up
            </Link>

          </p>

        </div>

      </div>

      {/* Right Section */}
      <div className="w-full md:w-[45%] min-h-[350px] md:min-h-screen flex items-center justify-center p-10 bg-gradient-to-br from-indigo-700 to-purple-600 text-white">

        <div className="text-center max-w-sm">

          <img
            src={logo}
            alt="Virtual Courses"
            className="w-36 h-36 object-cover rounded-2xl mx-auto mb-7 shadow-xl"
          />

          <h1 className="text-4xl font-bold mb-4">
            Virtual Courses
          </h1>

          <p className="text-indigo-100 text-base leading-7">
            Learn new skills, grow your knowledge
            and build your future with us.
          </p>

        </div>

      </div>

    </div>
  );
}

export default Login;
