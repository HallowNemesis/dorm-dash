import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db.js';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

// SIGNUP
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log("Signup request:", req.body);

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // Ensures only .edu emails are used
    const eduEmailRegex = /^[a-zA-Z0-9_]+@[a-zA-Z0-9]+\.edu$/;
    if (!eduEmailRegex.test(email)) {
      return res
        .status(400)
        .json({ error: "Only valid .edu email addresses are allowed." });
    }

    // Check if user exists
    const [existingUser] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: "Email already registered." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert into database
    await pool.query("INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)", [
      name,
      email,
      hashedPassword,
    ]);
    //Create a token... There is probably a easier way to get user.id from the last query? But this should work
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '2h' });
    res.status(201).json({ message: "User registered successfully!", token: token });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
});
//Automatic / token-based login
router.post('/token-auth', async (req, res) => {
  const { token } = req.body;

  jwt.verify(token, process.env.JWT_SECRET, async function (err, decoded) {
    if (err) {
      return res.status(401).json({ message: 'Expired or invalid token' });
    }

    const { id, email } = decoded;
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({ message: 'Login successful', token });
  });
});
// LOGIN
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log("Login request:", req.body);

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(401).json({ message: 'Invalid credentials' });

    const user = rows[0];
    // Fix column name: your signup saves to `password`, not `password_hash`
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '2h' });
    res.json({ message: 'Login successful', token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/reset-password-request', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    //Check if user exists
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "No account found with that email." });
    }

    // token for password reset with duration
    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "15m" });
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}&email=${email}`;
   
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
    
    await transporter.sendMail({
      from: `"DormDash Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset Request",
      html: `
        <p>Hello,</p>
        <p>You requested a password reset. Click the link below to reset your password.</p>
        <p><a href="${resetLink}">${resetLink}</a></p>
        <p>This link will expire in 15 minutes.</p>
        <p>If you didn’t request this, please ignore this email.</p>
      `,
    });

    res.json({ message: "Password reset successfully!" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Internal Server Error", details: err.message });
  }
});

router.post("/reset-password-confirm", async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword)
      return res.status(400).json({ message: "Token and new password are required." });

    // Verify token (throws if invalid/expired)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.email;

    // Hash and update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password_hash = ? WHERE email = ?", [
      hashedPassword,
      email,
    ]);

    res.json({ message: "Password reset successfully." });
  } catch (err) {
    console.error("Reset password confirm error:", err);

    if (err.name === "TokenExpiredError") {
      return res.status(400).json({ message: "Reset link has expired." });
    }
    if (err.name === "JsonWebTokenError") {
      return res.status(400).json({ message: "Invalid reset token." });
    }

    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;
