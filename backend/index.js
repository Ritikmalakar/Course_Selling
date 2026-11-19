import 'dotenv/config';
import express from 'express'
import { connectDb } from './config/db.js';
import mongoose from 'mongoose';
import userRoutes from './routes/uerRoutes.js'
import userDataRoutes from './routes/userDataROutes.js'
import courseRoutes from './routes/courseRoutes.js'
import orderRoutes from './routes/paymentRoutes.js'
import cors from 'cors'
import cookieParser from 'cookie-parser';
import multer from 'multer';
const app = express();
const allowedOrigins = (
  process.env.FRONTEND_URLS ||
  process.env.FRONTEND_URL ||
  "http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
<<<<<<< HEAD
  origin: allowedOrigins,
=======
  origin: "https://course-selling-1-mgse.onrender.com",
>>>>>>> f4515c9d64ec911ec3ffbd405150874392ae5c0f
  credentials: true
}))
app.use(express.json())
app.use(cookieParser())

app.get("/health", (_req, res) => {
  const databaseReady = mongoose.connection.readyState === 1;
  return res.status(databaseReady ? 200 : 503).json({
    success: databaseReady,
    status: databaseReady ? "ok" : "degraded",
    database: databaseReady ? "connected" : "disconnected"
  });
});

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
  await connectDb();
  const port = process.env.PORT || 1112;
  app.listen(port, "0.0.0.0", () => {
    console.log(`Server listening on port ${port}`);
  }).on("error", (error) => {
    console.error("Server failed to listen:", error.message);
    process.exit(1);
  });
}
<<<<<<< HEAD
serverStart().catch((error) => {
  console.error("Server startup failed:", error.message);
  process.exit(1);
});
=======
serverStart();
>>>>>>> f4515c9d64ec911ec3ffbd405150874392ae5c0f
