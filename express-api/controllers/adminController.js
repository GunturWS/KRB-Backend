const bcrypt = require("bcryptjs");
const pool = require("../models/db");
const jwt = require("jsonwebtoken");

const registerAdmin = async (req, res) => {
  const { fullname, username, password, confirmPassword } = req.body;

  if (!fullname || !username || !password || !confirmPassword) {
    return res
      .status(400)
      .json({ message: "Full name, username, password, dan konfirmasi password wajib diisi" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Password dan konfirmasi password tidak sama" });
  }

  try {
    // cek apakah username sudah digunakan
    const existing = await pool.query("SELECT * FROM admins WHERE username = $1", [username]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: "Username sudah digunakan" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // simpan ke database
    const result = await pool.query(
      "INSERT INTO admins (fullname, username, password) VALUES ($1, $2, $3) RETURNING id, fullname, username, created_at",
      [fullname, username, hashedPassword]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("Error register:", err);
    res.status(500).json({ message: "Gagal mendaftarkan admin" });
  }
};

const loginAdmin = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ message: "Username dan password wajib diisi" });

  try {
    // Cek admin ada atau tidak
    const result = await pool.query("SELECT * FROM admins WHERE username = $1", [username]);
    const admin = result.rows[0];

    if (!admin) {
      return res.status(401).json({ message: "Username tidak ditemukan" });
    }

    // Cocokkan password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Password salah" });
    }

    // Buat token
    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      process.env.JWT_SECRET || "RAHASIA", // pakai env kalau bisa
      { expiresIn: "1d" }
    );

    res.json({ success: true, token });
  } catch (err) {
    console.error("Error login:", err);
    res.status(500).json({ message: "Gagal login admin" });
  }
};

const logoutAdmin = async (req, res) => {
  try {
    res.clearCookie("token"); // kalau token kamu simpan di cookies
    return res.json({ success: true, message: "Logout berhasil" });
  } catch (err) {
    console.error("Error logout:", err);
    res.status(500).json({ message: "Gagal logout admin" });
  }
};

const getProfile = async (req, res) => {
  try {
    // ambil token dari header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token tidak ditemukan" });
    }

    const token = authHeader.split(" ")[1];

    // verifikasi token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "RAHASIA");

    // ambil data user dari database
    const result = await pool.query(
      "SELECT id, fullname, username, created_at FROM admins WHERE id = $1",
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("Error get profile:", err);
    res.status(500).json({ message: "Gagal mengambil profile" });
  }
};

module.exports = {
  registerAdmin,
  loginAdmin,
  logoutAdmin,
  getProfile,
};
