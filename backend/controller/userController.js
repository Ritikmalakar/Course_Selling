
import User from "../models/user.js";
import validator from "validator";
import bcrypt from "bcryptjs";
import { genToken } from "../config/token.js";
import sendEmail from "../config/sendMail.js";


export async function signUp(req, res) {
  try {
    const { name, email, password, role } = req.body;

    // 1. Check all fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    // 2. Validate email
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid email"
      });
    }

    // 3. Validate password
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters"
      });
    }

    // 4. Validate role
    const allowedRoles = ["student", "educator"];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role"
      });
    }

    // 5. Check existing user
    const existUser = await User.findOne({
      email: email.toLowerCase()
    });

    if (existUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists"
      });
    }

    // 6. Hash password
    const hashPassword = await bcrypt.hash(password, 10);

    // 7. Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashPassword,
      role
    });

    // 8. Generate token
    const token = await genToken(user._id);

    // 9. Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    // 10. Remove password from response
    const safeUser = user.toObject();
    delete safeUser.password;

    return res.status(201).json({
      success: true,
      message: "Registration successfully",
      user: safeUser
    });

  } catch (error) {
    console.log("Signup Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

// LOGIN API
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid email"
      });
    }

    // Find user
    const user = await User.findOne({
      email: email.toLowerCase()
    });

    if (!user || !user.password) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // Generate token
    const token = await genToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    const safeUser = user.toObject();
    delete safeUser.password;

    return res.status(200).json({
      success: true,
      message: "Login successfully",
      user: safeUser
    });

  } catch (error) {
    console.log("Login Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}


// LOGOUT API
export async function logout(req, res) {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict"
    });

    return res.status(200).json({
      success: true,
      message: "Logout successfully"
    });

  } catch (error) {
    console.log("Logout Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}



export async function sendOtp(req, res) {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).send({
        success: false,
        message: "Invalid Email Address"
      });
    }

    // Generate 4 digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    user.resetOtp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    user.isOtpVerifed = false;

    await user.save();

    await sendEmail(email, otp);

    res.status(200).send({
      success: true,
      message: "OTP sent successfully"
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}


// VERIFY OTP
export async function verifyOtp(req, res) {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (
      !user ||
      !user.resetOtp ||
      user.resetOtp !== otp ||
      !user.otpExpires ||
      user.otpExpires.getTime() < Date.now()
    ) {
      return res.status(400).send({
        success: false,
        message: "Invalid OTP"
      });
    }

    user.isOtpVerifed = true;
    user.resetOtp = undefined;
    user.otpExpires = undefined;

    await user.save();

    res.status(200).send({
      success: true,
      message: "OTP verified successfully"
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}


// RESET PASSWORD
export async function resetPassword(req, res) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user || !user.isOtpVerifed) {
      return res.status(400).send({
        success: false,
        message: "OTP verification required"
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    user.password = hashPassword;
    user.isOtpVerifed = false;

    await user.save();

    res.status(200).send({
      success: true,
      message: "Reset password successfully"
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}



export async function googleLogin(req, res) {
  try {
    const { name, email, role } = req.body;
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        email, name, role
      })
    }
    const token = await genToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    const safeUser = user.toObject();
    delete safeUser.password;

    res.status(200).send({
      success: true,
      message: "Login successfully",
      user: safeUser
    })
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message
    })
  }
}



