# Education API

## Course enrollment and payment

Enrollment endpoints require the authenticated `token` cookie. The browser
requests must send credentials.

- `POST /api/course/enroll/:courseId` enrolls the signed-in student in a
  published free course. The server rejects paid courses and non-student users.
- `GET /api/course/myCourses` returns the signed-in user's enrolled, published
  courses so the frontend can reload the list after navigation or refresh.
- `POST /api/course/:courseId/reviews` lets an enrolled student submit or update
  one 1-to-5-star review (comment up to 1000 characters). Published course
  responses include reviews with student names, ratings, and comments for the
  course cards and course detail page.
- `POST /api/order/razorpay-order` accepts `{ "courseId": "..." }` for a
  published paid course. The server determines the INR amount from the course
  price and returns `{ success, keyId, order }`; amounts sent to Razorpay are
  expressed in paise.
- `POST /api/order/verifyPayment` accepts Razorpay's
  `razorpay_order_id`, `razorpay_payment_id`, and `razorpay_signature` values.
  The server verifies the signature, confirms the captured payment belongs to
  the signed-in user and course, records the captured payment once, and then
  enrolls the student.
- `GET /api/order/educator-earnings` returns the authenticated educator's
  verified captured INR payment total and payment count. It reports gross
  captured amounts; gateway fees and refunds are not deducted. Only payments
  verified after payment recording is added are included; historical payments
  are not backfilled automatically.

Set `RAZORPAY_KEY_ID` and `RAZORPAY_SECRET` in the backend environment before
using paid checkout. Never expose or commit `RAZORPAY_SECRET`; the key ID is
returned by the order endpoint for the browser checkout.

## AI course search

Set `GEMINI_API_KEY` in the backend environment to enable AI course search.
Never commit the key.

- `POST /api/course/search` accepts `{ "input": "..." }` and returns
  `{ success, message, recommendation }`.
- The search uses AI-generated keywords to match published courses by title,
  subtitle, description, category, or level. At most 20 matching courses are
  returned.
- Empty or over-500-character queries are rejected with `400`. If Gemini is
  not configured, the endpoint responds with `503`.
