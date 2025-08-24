const express = require("express");
const router = express.Router();
const { registerAdmin, loginAdmin, logoutAdmin, getProfile } = require("../controllers/adminController");

// Endpoint register admin
router.post("/admin/register", registerAdmin);
router.post("/admin/login", loginAdmin);
router.post("/admin/logout", logoutAdmin);
router.get("/admin/profile", getProfile);

module.exports = router;
