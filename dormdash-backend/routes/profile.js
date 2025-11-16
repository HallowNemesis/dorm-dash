const express = require("express");
const router = express.Router();

// TEMP: in-memory storage (replace with SQL later)
const profiles = {};

// TEMP: replace with real userId from token later
const DEMO_USER_ID = "user123";

// GET /api/profile/me
router.get("/me", (req, res) => {
  const profile = profiles[DEMO_USER_ID] || null;
  res.json(profile);
});

// POST /api/profile/me  (create/update)
router.post("/me", (req, res) => {
  const { fullName, phone, role, carMake, carModel, carColor } = req.body;

  const profileData = {
    fullName: fullName || "",
    phone: phone || "",
    role: role || "rider",
    carMake: carMake || "",
    carModel: carModel || "",
    carColor: carColor || "",
  };

  profiles[DEMO_USER_ID] = profileData;

  res.json(profileData);
});

// DELETE /api/profile/me
router.delete("/me", (req, res) => {
  delete profiles[DEMO_USER_ID];
  res.json({ message: "Profile deleted" });
});

module.exports = router;
