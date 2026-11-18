import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: false
  },
  role: {
    type: String,
    enum: ["student", "educator"],
    required: true
  },
  photoUrl: {
    type: String,
    default: ""
  },
  enrollCourses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course"
    }
  ],
  resetOtp: {
    type: String
  },
  otpExpires: {
    type: Date
  },
  isOtpVerifed: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
export default User;