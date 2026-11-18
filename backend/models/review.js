import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    validate: Number.isInteger
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  }
}, { timestamps: true });

reviewSchema.index({ course: 1, user: 1 }, { unique: true });

const Review = mongoose.model("Reviews", reviewSchema);
export default Review;
