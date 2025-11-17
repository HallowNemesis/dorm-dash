// routes/profile.js
import express from 'express';

const router = express.Router();

function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: "No token" });

  const token = header.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Invalid auth header" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // contains id + email
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}


// GET /api/profile/me
router.get('/me', async (req, res) => {
 try {
    const userId = req.user.id;

    const [rows] = await pool.query(
      `SELECT id, full_name, email, role, phone, bio, avatar_url
       FROM users WHERE id=?`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Profile not found" });
    }

    let profile = rows[0];

    // If user is a driver, load driver profile fields too
    if (profile.role === "driver") {
      const [driverRows] = await pool.query(
        `SELECT vehicle_make, vehicle_model, vehicle_plate, seats, license_number
         FROM driver_profiles WHERE user_id=?`,
        [userId]
      );

      if (driverRows.length > 0) {
        profile = { ...profile, ...driverRows[0] };
      }
    }

    res.json(profile);
  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(500).json({ message: "Failed to load profile" });
  }
});

// POST /api/profile/me
router.post('/me', async (req, res) => {
const {
    full_name,
    phone,
    bio,
    avatar_url,
    role,
    vehicle_make,
    vehicle_model,
    vehicle_plate,
    seats,
    license_number,
  } = req.body;

  const userId = req.user.id;


  const profileData = {
    fullName: fullName || '',
    phone: phone || '',
    role: role || 'rider',
    carMake: carMake || '',
    carModel: carModel || '',
    carColor: carColor || '',
  };
try {
    // Update users table
    await pool.query(
      `UPDATE users
       SET full_name=?, phone=?, bio=?, avatar_url=?, role=?
       WHERE id=?`,
      [full_name, phone, bio, avatar_url, role, userId]
    );

    // If user selected driver role — update driver_profiles
    if (role === "driver") {
      await pool.query(
        `INSERT INTO driver_profiles
           (user_id, vehicle_make, vehicle_model, vehicle_plate, seats, license_number)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           vehicle_make=VALUES(vehicle_make),
           vehicle_model=VALUES(vehicle_model),
           vehicle_plate=VALUES(vehicle_plate),
           seats=VALUES(seats),
           license_number=VALUES(license_number)`,
        [
          userId,
          vehicle_make || null,
          vehicle_model || null,
          vehicle_plate || null,
          seats || 4,
          license_number || null,
        ]
      );
    }

    res.json({ message: "Profile updated successfully!" });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ message: "Failed to update profile" });
  }
});

// DELETE /api/profile/me
router.delete('/me', async (req, res) => {
  const userId = req.user.id;

  try {
    await pool.query("DELETE FROM users WHERE id=?", [userId]);
    res.json({ message: "Profile deleted" });
  } catch (err) {
    console.error("Profile delete error:", err);
    res.status(500).json({ message: "Failed to delete profile" });
  }
});

export default router;
