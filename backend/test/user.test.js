import assert from "node:assert/strict";
import test from "node:test";
import User from "../models/user.js";

test("user description is optional and defaults to an empty string", async (t) => {
  for (const account of [
    { name: "Student", email: "student@example.com", password: "password123", role: "student" },
    { name: "Educator", email: "educator@example.com", role: "educator" }
  ]) {
    await t.test(`validates ${account.role} account without a description`, async () => {
      const user = new User(account);

      await user.validate();

      assert.equal(user.description, "");
    });
  }
});
