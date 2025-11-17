import express from "express";
import pool from "../db.js";
import jwt from "jsonwebtoken";

const router = express.Router();

function auth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Missing token" });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

router.get("/my-rides", auth, async (req, res) => {
  const userId = req.user.id;
  const [rows] = await pool.query(
    `SELECT * FROM ride_requests 
     WHERE rider_id=? OR matched_driver_id=?`,
    [userId, userId]
  );
  res.json(rows);
});

export default router;
