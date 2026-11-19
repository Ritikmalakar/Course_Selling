import mongoose from "mongoose"

export async function connectDb() {
  if (!process.env.MONGO_URL) {
    throw new Error("MONGO_URL is not configured");
  }

  await mongoose.connect(process.env.MONGO_URL)
  console.log("Database connected successfully")
}