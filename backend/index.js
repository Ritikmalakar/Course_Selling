import express from 'express'
import dotenv from 'dotenv'
import { connectDb } from './config/db.js';
import userRoutes from './routes/uerRoutes.js'
import userDataRoutes from './routes/userDataROutes.js'
import courseRoutes from './routes/courseRoutes.js'
import orderRoutes from './routes/paymentRoutes.js'
dotenv.config();
import cors from 'cors'
import cookieParser from 'cookie-parser';
import multer from 'multer';
const app = express();
app.use(express.json())
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}))
app.use(cookieParser())


app.use("/api/user", userRoutes)
app.use("/api/userData", userDataRoutes)
app.use("/api/course", courseRoutes)
app.use("/api/order", orderRoutes)
app.use((error, req, res, next) => {
  if (
    req.aborted ||
    res.destroyed ||
    error.message === "Request aborted" ||
    error.message === "Request closed"
  ) {
    console.warn("Client disconnected before the request upload completed");
    return;
  }

  if (error instanceof multer.MulterError) {
    const isFileTooLarge = error.code === "LIMIT_FILE_SIZE";
    return res.status(isFileTooLarge ? 413 : 400).json({
      success: false,
      message: isFileTooLarge
        ? "File is too large. Maximum upload size is 100 MB."
        : error.message
    });
  }

  if (error.message === "Only image and video files are allowed!") {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  return next(error);
});

async function serverStart() {
  try {
    await connectDb();
    app.listen(process.env.PORT, () => {
      console.log("server stated");
    })
  } catch (error) {
    console.log(error)
  }
}
serverStart();