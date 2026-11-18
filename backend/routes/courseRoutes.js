import express from 'express'
import { createCourse, createLecture, editCourse, editLecture, enrollInFreeCourse, getCourseById, getCourseForLearning, getCourseLecture, getCoursePreviews, getCreaterCourses, getMyCourses, getPublished, getPublishedCourseById, removeCourse, removeLecture, reorderCourseLectures, submitCourseReview } from '../controller/courseController.js';
import { isAuth } from '../middleware/isAuth.js';
import upload from '../middleware/upload.js';
import { searchWithAi } from '../controller/serachController.js';


const router = express.Router();
router.post("/createCourse", isAuth, createCourse);
router.post("/enroll/:courseId", isAuth, enrollInFreeCourse);
router.post("/:courseId/reviews", isAuth, submitCourseReview);
router.get("/myCourses", isAuth, getMyCourses);
router.get("/getPublished/:courseId", getPublishedCourseById);
router.get("/getPublished", getPublished);
router.get("/getcreateCourse", isAuth, getCreaterCourses);
router.post("/editCourse/:courseId", isAuth, upload.single("thumbnail"), editCourse);
router.get("/getCourseById/:courseId", isAuth, getCourseById);
router.delete("/removeCourse/:courseId", isAuth, removeCourse);


router.post("/createLecture/:courseId", isAuth, createLecture);
router.get("/getLecture/:courseId", isAuth, getCourseLecture);
router.get("/learn/:courseId", isAuth, getCourseForLearning);
router.get("/previews/:courseId", getCoursePreviews);
router.put("/reorderLectures/:courseId", isAuth, reorderCourseLectures);
router.post("/updateLecture/:lectureId", isAuth, upload.single("videoUrl"), editLecture);
router.delete("/deleteLecture/:lectureId", isAuth, removeLecture);
router.post("/search", searchWithAi)
export default router;