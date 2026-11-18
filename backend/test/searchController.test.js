import assert from "node:assert/strict";
import test from "node:test";
import { searchWithAi } from "../controller/serachController.js";

function createResponse() {
  return {
    statusCode: null,
    body: null,
    status(statusCode) {
      this.statusCode = statusCode;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    }
  };
}

test("rejects an empty AI course search query", async () => {
  const res = createResponse();

  await searchWithAi({ body: { input: "   " } }, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.success, false);
});

test("rejects an AI course search query longer than 500 characters", async () => {
  const res = createResponse();

  await searchWithAi({ body: { input: "a".repeat(501) } }, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.success, false);
});

test("reports missing Gemini configuration without making a provider request", async () => {
  const configuredApiKey = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;

  try {
    const res = createResponse();
    await searchWithAi({ body: { input: "beginner JavaScript" } }, res);

    assert.equal(res.statusCode, 503);
    assert.equal(res.body.success, false);
  } finally {
    if (configuredApiKey === undefined) {
      delete process.env.GEMINI_API_KEY;
    } else {
      process.env.GEMINI_API_KEY = configuredApiKey;
    }
  }
});
