import express from 'express'
import { getCurrentUser, updateProfile } from '../controller/userDatacontroller.js';
import { isAuth } from '../middleware/isAuth.js';
import upload from '../middleware/upload.js';
import { getCreatorById } from '../controller/courseController.js';

const router = express.Router();
router.get("/getCurrentuser", isAuth, getCurrentUser);
router.post("/updateUser", isAuth, upload.single("photo"), updateProfile);
router.get('/getCreatorById', getCreatorById)
export default router;