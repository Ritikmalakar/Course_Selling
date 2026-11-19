# Education API

## Authentication

- `POST /api/user/signUp` accepts `{ "name": "...", "email": "...", "password": "...", "role": "student" }` (or `"educator"`). The password must be at least 8 characters. A profile `description` is optional and defaults to an empty string.

## Render deployment

Deploy the backend as a Render Web Service with the backend directory as its
root, `npm install` as the build command, and `npm start` as the start command.
Set the health check path to `/health`. The service starts only after MongoDB
connects; `/health` returns `503` until the database is ready or if it becomes
unavailable.

Configure these backend environment variables in Render:

- `NODE_ENV=production`
- `MONGO_URL` and `JWT_SECRET`
- `FRONTEND_URLS` as the comma-separated frontend origin(s), without trailing
  slashes (for example, `https://your-frontend.onrender.com`)
- `SMTP_USER` and `SMTP_PASS` for email/OTP features
- `CLOUD_NAME`, `CLOUD_API_KEY`, and `CLOUD_API_SECRET` for media uploads
- `RAZORPAY_KEY_ID` and `RAZORPAY_SECRET` for paid checkout
- `GEMINI_API_KEY` for AI course search

Set `VITE_API_URL` on the frontend Render Static Site to the backend's HTTPS
URL, without a trailing slash. Also set `VITE_FIREBASE_API_KEY` and
`VITE_RAZORPAY_KEY_ID` as needed. Vite embeds these values at build time, so
redeploy the frontend after changing them. See `../frontend/.env.example` for
local frontend configuration and `.env.example` for the backend variable names.
For React Router deep links, add a Render Static Site rewrite from `/*` to
`/index.html`.

`GET /health` is unauthenticated. It returns `200` with
`{ "success": true, "status": "ok", "database": "connected" }` when MongoDB is
ready, or `503` with `{ "success": false, "status": "degraded", "database":
"disconnected" }` otherwise.

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
