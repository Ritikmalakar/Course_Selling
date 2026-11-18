
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Create transporter
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Send Email Function
const sendEmail = async (to, otp) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: to,
      subject: "Reset Your Password",
      html: `
        <div>
          <h2>Password Reset</h2>
          <p>Your OTP for password reset is:</p>
          <h1>${otp}</h1>
          <p>It will expire in 5 minutes.</p>
        </div>
      `,
    });

    console.log("Message sent:", info.messageId);

    return true;

  } catch (err) {
    console.error("Error while sending mail:", err);
    return false;
  }
};

export default sendEmail;
