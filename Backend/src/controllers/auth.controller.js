import userModel from "../model/user.model.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../services/mail.service.js";

/**
 * @desc Register a new user
 * @route POST /api/auth/register
 */
export async function register(req, res) {
  const { username, email, password } = req.body;

  const isUserAlreadyExists = await userModel.findOne({
    $or: [{ email }, { username }],
  });

  if (isUserAlreadyExists) {
    return res.status(400).json({
      message: "User already exists",
      success: false,
    });
  }

  const user = await userModel.create({ username, email, password });

  const emailVerificationToken = jwt.sign(
    {
      email: user.email,
    },
    process.env.JWT_SECRET,
  );

  try {
    await sendEmail({
      to: email,
      subject: "Verify your email • Neurovia AI",
      html: `
      <div style="font-family: Arial, sans-serif; background-color: #0f172a; padding: 40px; color: #e2e8f0;">
        
        <div style="max-width: 600px; margin: auto; background: #020617; border-radius: 12px; padding: 30px; border: 1px solid #1e293b;">
          
          <h2 style="color: #38bdf8; margin-bottom: 10px;">Welcome to Neurovia AI 🤖</h2>
          
          <p style="font-size: 15px; color: #94a3b8;">
            Hi <strong>${username}</strong>,
          </p>

          <p style="font-size: 15px; color: #94a3b8;">
            Thanks for signing up! Please confirm your email address to activate your account and start using Neurovia AI.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.BASE_URL}/api/auth/verify-email?token=${emailVerificationToken}" 
              style="background: #38bdf8; color: #020617; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
              Verify Email
            </a>
          </div>

          <p style="font-size: 13px; color: #64748b;">
            If the button doesn't work, copy and paste this link into your browser:
          </p>

          <p style="font-size: 12px; word-break: break-all; color: #38bdf8;">
            ${process.env.BASE_URL}/api/auth/verify-email?token=${emailVerificationToken}
          </p>

          <hr style="border: 0; border-top: 1px solid #1e293b; margin: 25px 0;" />

          <p style="font-size: 12px; color: #64748b;">
            If you didn’t create this account, you can safely ignore this email.
          </p>

          <p style="font-size: 13px; margin-top: 20px;">
            — Team Neurovia AI 🚀
          </p>

        </div>
      </div>
    `,
    });

    console.log("✅ Email sent successfully");
  } catch (err) {
    console.error("❌ Email error:", err.message);
  }

  res.status(201).json({
    message: "User registered successfully",
    success: true,
    user: {
      id: user._id,
      name: user.username,
      email: user.email,
    },
  });
}

/**
 * @desc Login user and return JWT token
 * @route POST /api/auth/login
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    if (!user.verified) {
      return res.status(403).json({
        message: "Please verify your email before logging in",
      });
    }

    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * @desc Get current logged in user's details
 * @route GET /api/auth/get-me
 * @access Private
 */
export async function getMe(req, res) {
  const userId = req.user.id;

  const user = await userModel.findById(userId).select("-password");

  if (!user) {
    return res.status(404).json({
      message: "User not found",
      success: false,
      err: "User not found",
    });
  }

  res.status(200).json({
    message: "User details fetched successfully",
    success: true,
    user: {
      id: user._id,
      name: user.username,
      email: user.email,
    },
  });
}

/**
 * @desc Verify user's email address
 * @route GET /api/auth/verify-email
 */
export async function verifyEmail(req, res) {
  const { token } = req.query;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await userModel.findOne({ email: decoded.email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid token",
        success: false,
        err: "User not found",
      });
    }

    user.verified = true;

    await user.save();

    const html = `
        <h1>Email Verified Successfully!</h1>
        <p>Your email has been verified. You can now log in to your account.</p>
        <a href="${process.env.CLIENT_URL}/login">Go to Login</a>
    `;

    return res.send(html);
  } catch (err) {
    return res.status(400).json({
      message: "Invalid or expired token",
      success: false,
      err: err.message,
    });
  }
}

/**
 * logout functionality
 * @route DELETE /api/auth/logout
 */
export async function logout(req, res) {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });

    return res.status(200).json({
      message: "Logged out successfully",
      success: true,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Logout failed",
      success: false,
    });
  }
}
