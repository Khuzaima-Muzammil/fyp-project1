const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Admin = require("../models/Admin");
const auth = require("../middleware/authMiddleware");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const { validateRegister, validateLogin, validateProfileUpdate, validateForgotPassword, validateResetPassword } = require('../middleware/validationMiddleware');

// --- 1. REGISTER ---
router.post("/register", validateRegister, async (req, res, next) => {
  console.log("Registration attempt for email:", req.body.email);
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Please enter all fields" });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, message: "User already exists. Please login instead." });
    }

    // Create verification token
    const verificationToken = crypto.randomBytes(20).toString("hex");

    user = new User({ 
      username: name, 
      email, 
      password,
      verificationToken
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    // Create verification url
    const verifyUrl = `http://localhost:5004/api/auth/verify-redirect/${verificationToken}`;
    const message = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #333; text-align: center;">Welcome to our Shop!</h2>
        <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}" style="padding: 12px 25px; background-color: #111; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Verify Email</a>
        </div>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #555;">${verifyUrl}</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #888; text-align: center;">This email was sent to you because you signed up for an account. If you didn't do this, please ignore this email.</p>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: "Email Verification",
        html: message,
      });
    } catch (err) {
      console.error("Verification Email Error:", err.message);
      // We still registered the user, but email failed. 
      // In a real app, you might want to handle this differently.
    }

    const payload = { user: { id: user.id, role: 'user' } };
    
    jwt.sign(
      payload,
      process.env.JWT_SECRET || "mysecrettoken",
      { expiresIn: "1d" },
      (err, token) => {
        if (err) throw err;
        res.json({ token, message: "Registration successful. Please check your email to verify your account." });
      }
    );

  } catch (err) {
    console.error("Register Error:", err.message);
    next(err);
  }
});

// --- VERIFY EMAIL REDIRECT ---
router.get("/verify-redirect/:token", (req, res) => {
  const { token } = req.params;
  // Redirect to frontend verify page
  res.redirect(`http://localhost:5174/verify-email/${token}`);
});

// --- VERIFY EMAIL POST ---
router.post("/verify-email", async (req, res) => {
  const { token } = req.body;
  try {
    if (!token) {
      return res.status(400).json({ message: "No token provided" });
    }

    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired verification token" });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.json({ message: "Email verified successfully! You can now use all features." });
  } catch (err) {
    console.error("Verify Email Error:", err.message);
    res.status(500).send("Server Error");
  }
});

// --- 2. LOGIN (With Updated Error Messages) ---
router.post("/login", validateLogin, async (req, res, next) => {
  const { email, password } = req.body;
  try {
    // Check if user is an admin
    let account = await Admin.findOne({ email });
    let role = 'admin';

    // If not admin, check if user exists
    if (!account) {
      account = await User.findOne({ email });
      role = 'user';
    }

    // --- AGAR ACCOUNT NAHI MILA ---
    if (!account) {
      return res.status(400).json({ success: false, message: "Incorrect username or password" });
    }

    // --- PASSWORD MATCHING ---
    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Incorrect username or password" });
    }

    const payload = { user: { id: account.id, role: role } };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || "mysecrettoken",
      { expiresIn: "1d" },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error("Login Error:", err.message);
    next(err);
  }
});

// --- 3. GET ME (Current User details) ---
router.get("/me", auth, async (req, res, next) => {
  try {
    let account = await Admin.findById(req.user.id).select("-password") || 
                  await User.findById(req.user.id).select("-password");
    
    if (!account) return res.status(404).json({ message: "User not found" });

    const role = req.user.role; 
    res.json({ ...account._doc, role });
  } catch (err) {
    next(err);
  }
});

// --- 4. UPDATE PROFILE ---
router.put('/update', auth, validateProfileUpdate, async (req, res, next) => {
  const { username, email, password, profilePic } = req.body;
  
  try {
    let account = await User.findById(req.user.id) || await Admin.findById(req.user.id);
    if (!account) return res.status(404).json({ message: 'Account not found' });

    if (email && email !== account.email) {
      const emailExists = await User.findOne({ email }) || await Admin.findOne({ email });
      if (emailExists) return res.status(400).json({ message: "Email already in use by another account" });
      account.email = email;
    }

    if (username) {
      if (username.length < 3) return res.status(400).json({ message: "Username must be at least 3 characters" });
      account.username = username;
    }

    if (password && password.trim() !== "") {
      if (password.length < 8) return res.status(400).json({ message: "New password must be at least 8 characters" });
      const salt = await bcrypt.genSalt(10);
      account.password = await bcrypt.hash(password, salt);
    }

    if (profilePic !== undefined) {
      account.profilePic = profilePic;
    }

    await account.save();
    
    const updatedAccount = account.toObject();
    delete updatedAccount.password;

    res.json({ message: "Profile updated successfully", account: updatedAccount });

  } catch (err) {
    console.error("Update Error:", err.message);
    next(err);
  }
});

// --- 6. FORGOT PASSWORD ---
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "There is no user with that email" });
    }

    // Generate token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    // Create reset url - Pointing to backend redirect route to bypass PWA interception
    const resetUrl = `http://localhost:5004/api/auth/reset-redirect/${resetToken}`;
    const message = `
      <h2>Password Reset Request</h2>
      <p>You requested a password reset. Please click the link below to set a new password:</p>
      <a href="${resetUrl}" style="padding: 10px 20px; background-color: #111; color: #fff; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
      <p>If the button doesn't work, copy and paste this link into your browser:</p>
      <p>${resetUrl}</p>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: "Password Reset Token",
        html: message,
      });

      res.json({ message: "Email sent successfully" });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      return res.status(500).json({ message: "Email could not be sent" });
    }
  } catch (err) {
    console.error("Forgot Password Error:", err.message);
    res.status(500).send("Server Error");
  }
});

// --- NEW REDIRECT ROUTE TO BYPASS PWA ---
router.get("/reset-redirect/:token", (req, res) => {
  const { token } = req.params;
  const targetUrl = `http://localhost:5174/reset-password/${token}`;
  
  // Sending a small HTML page instead of a 302 redirect.
  // This is a more reliable way to break out of PWA capture 
  // and fixes the 'Unsafe attempt' security error by staying on localhost.
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Redirecting to Website</title>
      <style>
        body { font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #fcfcfc; }
        .box { text-align: center; padding: 20px; }
        .spinner { border: 3px solid #f3f3f3; border-top: 3px solid #111; border-radius: 50%; width: 24px; height: 24px; animation: spin 1s linear infinite; margin: 0 auto 15px; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      </style>
    </head>
    <body>
      <div class="box">
        <div class="spinner"></div>
        <p>Redirecting to website...</p>
        <p style="font-size: 12px; color: #888;">If you are not redirected, <a href="${targetUrl}">click here</a></p>
      </div>
      <script>
        // Force redirection in the current browser tab
        window.location.replace("${targetUrl}");
      </script>
    </body>
    </html>
  `);
});

// --- 7. RESET PASSWORD ---
router.put("/reset-password/:token", async (req, res) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    const { password } = req.body;
    
    // Password validation regex: Min 8 chars, at least one uppercase, one lowercase, one number and one special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
    
    if (!password || !passwordRegex.test(password)) {
      return res.status(400).json({ 
        message: "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character." 
      });
    }

    // Set new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ message: "Password reset successful! You can now login with your new password." });
  } catch (err) {
    console.error("Reset Password Error:", err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;