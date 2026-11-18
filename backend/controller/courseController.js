
import mongoose from "mongoose";
import Course from "../models/courseModel.js";
import Lecture from "../models/lectorModel.js";
import Review from "../models/review.js";
import User from "../models/user.js";

export async function createCourse(req, res) {
  try {
    const { title, category, description } = req.body;

    if (!title || !category) {
      return res.status(400).send({
        success: false,
        message: "category is required"
      });
    }

    const course = await Course.create({
      title,
      description,
      category,
      creater: req.userId,
    });

    res.status(200).send({
      success: true,
      message: "course created successfully",
      course
    });

  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message,
      error
    });
  }
}


export async function getPublished(req, res) {
  try {
    const courses = await Course.find({ isPublished: true })
      .populate({
        path: "lectures",
        select: "lectureTitle isPreviewFree"
      })
      .populate({
        path: "reviews",
        select: "rating comment createdAt user",
        populate: { path: "user", select: "name photoUrl" }
      });

    res.status(200).send({
      success: true,
      message: "course get",
      courses
    });

  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message,
      error
    });
  }
}

export async function getPublishedCourseById(req, res) {
  try {
    const { courseId } = req.params;

    if (!mongoose.isValidObjectId(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid courseId"
      });
    }

    const course = await Course.findOne({
      _id: courseId,
      isPublished: true
    }).populate({
      path: "lectures",
      select: "lectureTitle isPreviewFree"
    }).populate({
      path: "reviews",
      select: "rating comment createdAt user",
      populate: { path: "user", select: "name photoUrl" }
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Published course not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Published course fetched successfully",
      course
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

export async function submitCourseReview(req, res) {
  try {
    const { courseId } = req.params;
    const rating = Number(req.body.rating);
    const comment = typeof req.body.comment === "string"
      ? req.body.comment.trim()
      : "";

    if (!mongoose.isValidObjectId(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid courseId"
      });
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be a whole number from 1 to 5"
      });
    }

    if (!comment || comment.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Review comment must be between 1 and 1000 characters"
      });
    }

    const [course, user] = await Promise.all([
      Course.findOne({ _id: courseId, isPublished: true }).select("enrolledStudents"),
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
        message: "Only students can review courses"
      });
    }

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Published course not found"
      });
    }

    const isEnrolled = course.enrolledStudents.some(
      studentId => studentId.toString() === req.userId.toString()
    );
    if (!isEnrolled) {
      return res.status(403).json({
        success: false,
        message: "Enroll in this course before submitting a review"
      });
    }

    let savedReview;
    try {
      savedReview = await Review.findOneAndUpdate(
        { course: course._id, user: req.userId },
        { $set: { rating, comment } },
        {
          new: true,
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true
        }
      );
    } catch (error) {
      if (error.code !== 11000) throw error;
      savedReview = await Review.findOneAndUpdate(
        { course: course._id, user: req.userId },
        { $set: { rating, comment } },
        { new: true, runValidators: true }
      );
      if (!savedReview) throw error;
    }

    await Course.updateOne(
      { _id: course._id },
      { $addToSet: { reviews: savedReview._id } }
    );

    const populatedReview = await Review.findById(savedReview._id)
      .select("rating comment createdAt user")
      .populate("user", "name photoUrl");

    return res.status(200).json({
      success: true,
      message: "Review saved successfully",
      review: populatedReview
    });
  } catch (error) {
    console.error("Course review submission failed:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to save this review"
    });
  }
}

export async function enrollInFreeCourse(req, res) {
  try {
    const { courseId } = req.params;

    if (!mongoose.isValidObjectId(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid courseId"
      });
    }

    const user = await User.findById(req.userId);

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

    const course = await Course.findOne({
      _id: courseId,
      isPublished: true
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Published course not found"
      });
    }

    if (course.price !== 0) {
      return res.status(402).json({
        success: false,
        message: "This course requires payment. Paid enrollment is not available yet."
      });
    }

    if (course.creater?.toString() === user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Course creators cannot enroll in their own course"
      });
    }

    const alreadyEnrolled = user.enrollCourses.some(
      enrolledCourseId => enrolledCourseId.toString() === courseId
    );

    await Promise.all([
      User.updateOne(
        { _id: user._id },
        { $addToSet: { enrollCourses: course._id } }
      ),
      Course.updateOne(
        { _id: course._id },
        { $addToSet: { enrolledStudents: user._id } }
      )
    ]);

    return res.status(alreadyEnrolled ? 200 : 201).json({
      success: true,
      message: alreadyEnrolled
        ? "You are already enrolled in this course"
        : "Successfully enrolled in course",
      alreadyEnrolled: alreadyEnrolled || undefined
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

export async function getMyCourses(req, res) {
  try {
    const user = await User.findById(req.userId)
      .select("enrollCourses")
      .populate({
        path: "enrollCourses",
        match: { isPublished: true },
        select: "title subTitle category level price thumbnail lectures"
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      courses: user.enrollCourses
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}


export async function getCreaterCourses(req, res) {
  try {
    const userId = req.userId;

    const courses = await Course.find({ creater: userId });

    res.status(200).send({
      success: true,
      message: "course get",
      courses
    });

  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message,
      error
    });
  }
}


export async function editCourse(req, res) {
  try {
    const { courseId } = req.params;

    const course = await Course.findOne({
      _id: courseId,
      creater: req.userId
    }).populate("lectures");

    if (!course) {
      return res.status(404).send({
        success: false,
        message: "course not found"
      });
    }

    const { title, subTitle, description, category, level, isPublished, price } = req.body;
    const updateData = {};

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).send({
          success: false,
          message: "title is required"
        });
      }
      updateData.title = title.trim();
    }

    if (category !== undefined) {
      if (!category.trim()) {
        return res.status(400).send({
          success: false,
          message: "category is required"
        });
      }
      updateData.category = category.trim();
    }

    if (subTitle !== undefined) updateData.subTitle = subTitle;
    if (description !== undefined) updateData.description = description;
    if (level !== undefined) updateData.level = level || undefined;

    if (price !== undefined) {
      if (price === "") {
        updateData.price = undefined;
      } else {
        const parsedPrice = Number(price);
        if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
          return res.status(400).send({
            success: false,
            message: "price must be a non-negative number"
          });
        }
        updateData.price = parsedPrice;
      }
    }

    if (isPublished !== undefined) {
      updateData.isPublished = isPublished === true || isPublished === "true";
    }

    if (req.file) {
      updateData.thumbnail = req.file.path;
    }

    Object.assign(course, updateData);
    const updatedCourse = await course.save();

    res.status(200).send({
      success: true,
      message: "update successfully",
      course: updatedCourse
    });

  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message,
      error
    });
  }
}


export async function getCourseById(req, res) {
  try {
    const { courseId } = req.params;

    const course = await Course.findOne({ _id: courseId, creater: req.userId });

    if (!course) {
      return res.status(404).send({
        success: false,
        message: "course not found"
      });
    }

    res.status(200).send({
      success: true,
      message: "course get",
      course
    });

  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message,
      error
    });
  }
}


export async function removeCourse(req, res) {
  try {
    const { courseId } = req.params;

    const course = await Course.findOne({ _id: courseId, creater: req.userId });

    if (!course) {
      return res.status(404).send({
        success: false,
        message: "course not found"
      });
    }

    const deletedCourse = await Course.findOneAndDelete({
      _id: courseId,
      creater: req.userId
    });

    res.status(200).send({
      success: true,
      message: "delete successfully",
      course: deletedCourse
    });

  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message,
      error
    });
  }
}





// CREATE LECTURE
export async function createLecture(req, res) {
  try {
    const { lectureTitle } = req.body;
    const { courseId } = req.params;

    if (!lectureTitle || !courseId) {
      return res.status(400).json({
        success: false,
        message: "Lecture title and courseId are required"
      });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    const lecture = await Lecture.create({
      lectureTitle
    });

    course.lectures.push(lecture._id);

    await course.save();

    await course.populate("lectures");

    return res.status(201).json({
      success: true,
      message: "Lecture created successfully",
      lecture,
      course
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}


// GET COURSE LECTURES
export async function getCourseLecture(req, res) {
  try {
    const { courseId } = req.params;

    const course = await Course.findOne({
      _id: courseId,
      creater: req.userId
    }).populate("lectures");

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found or you do not have permission to manage it"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Lectures fetched successfully",
      course
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

// GET COURSE CONTENT FOR ENROLLED STUDENTS OR COURSE CREATOR
export async function getCourseForLearning(req, res) {
  try {
    const { courseId } = req.params;

    if (!mongoose.isValidObjectId(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid courseId"
      });
    }

    const [user, course] = await Promise.all([
      User.findById(req.userId).select("role enrollCourses"),
      Course.findById(courseId)
    ]);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    const isCreator = course.creater?.toString() === req.userId.toString();
    const isEnrolled = user.role === "student" && (
      user.enrollCourses.some(id => id.toString() === courseId) ||
      course.enrolledStudents.some(id => id.toString() === req.userId.toString())
    );

    if (!isCreator && (!course.isPublished || !isEnrolled)) {
      return res.status(403).json({
        success: false,
        message: "Enroll in this course to access its videos"
      });
    }

    await course.populate("lectures");

    return res.status(200).json({
      success: true,
      message: "Course content fetched successfully",
      course
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

// GET PUBLISHED COURSE PREVIEWS WITHOUT EXPOSING LOCKED VIDEO URLS
export async function getCoursePreviews(req, res) {
  try {
    const { courseId } = req.params;

    if (!mongoose.isValidObjectId(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid courseId"
      });
    }

    const course = await Course.findOne({
      _id: courseId,
      isPublished: true
    }).populate("lectures");

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Published course not found"
      });
    }

    const courseData = course.toObject();
    courseData.lectures = courseData.lectures.map(lecture => {
      if (!lecture.isPreviewFree) {
        delete lecture.videoUrl;
      }
      return lecture;
    });

    return res.status(200).json({
      success: true,
      message: "Course previews fetched successfully",
      course: courseData
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

// REORDER COURSE LECTURES
export async function reorderCourseLectures(req, res) {
  try {
    const { courseId } = req.params;
    const { lectureIds } = req.body;

    if (!mongoose.isValidObjectId(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid courseId"
      });
    }

    if (
      !Array.isArray(lectureIds) ||
      lectureIds.some(id => typeof id !== "string" || !mongoose.isValidObjectId(id)) ||
      new Set(lectureIds).size !== lectureIds.length
    ) {
      return res.status(400).json({
        success: false,
        message: "lectureIds must be an array of unique valid lecture IDs"
      });
    }

    const course = await Course.findOne({
      _id: courseId,
      creater: req.userId
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    const currentLectureIds = course.lectures.map(id => id.toString());
    const requestedIds = new Set(lectureIds);

    if (
      lectureIds.length !== currentLectureIds.length ||
      currentLectureIds.some(id => !requestedIds.has(id))
    ) {
      return res.status(400).json({
        success: false,
        message: "lectureIds must contain every lecture in this course exactly once"
      });
    }

    course.lectures = lectureIds;
    await course.save();
    await course.populate("lectures");

    return res.status(200).json({
      success: true,
      message: "Lecture order updated successfully",
      lectures: course.lectures
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}


// EDIT LECTURE
export async function editLecture(req, res) {
  try {
    const { lectureId } = req.params;
    const { isPreviewFree, lectureTitle } = req.body;

    const lecture = await Lecture.findById(lectureId);

    if (!lecture) {
      return res.status(404).json({
        success: false,
        message: "Lecture not found"
      });
    }

    if (lectureTitle !== undefined) {
      lecture.lectureTitle = lectureTitle;
    }

    if (req.file) {
      lecture.videoUrl = req.file.path;
    }

    if (isPreviewFree !== undefined) {
      lecture.isPreviewFree = isPreviewFree;
    }

    await lecture.save();

    return res.status(200).json({
      success: true,
      message: "Lecture updated successfully",
      lecture
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}


// DELETE LECTURE
export async function removeLecture(req, res) {
  try {
    const { lectureId } = req.params;

    const lecture = await Lecture.findByIdAndDelete(lectureId);

    if (!lecture) {
      return res.status(404).json({
        success: false,
        message: "Lecture not found"
      });
    }

    await Course.updateOne(
      { lectures: lectureId },
      { $pull: { lectures: lectureId } }
    );

    return res.status(200).json({
      success: true,
      message: "Lecture removed successfully"
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}




export async function getCreatorById(req, res) {
  try {
    const { userId } = req.query;

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId"
      });
    }

    const user = await User.findById(userId).select("name description photoUrl role");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Creator not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Creator profile fetched successfully",
      user
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}