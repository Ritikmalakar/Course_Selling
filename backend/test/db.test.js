import assert from "node:assert/strict";
import test from "node:test";
import { connectDb } from "../config/db.js";

test("requires MONGO_URL instead of continuing without a database", async () => {
  const configuredMongoUrl = process.env.MONGO_URL;
  delete process.env.MONGO_URL;

  try {
    await assert.rejects(connectDb(), /MONGO_URL is not configured/);
  } finally {
    if (configuredMongoUrl === undefined) {
      delete process.env.MONGO_URL;
    } else {
      process.env.MONGO_URL = configuredMongoUrl;
    }
  }
});
