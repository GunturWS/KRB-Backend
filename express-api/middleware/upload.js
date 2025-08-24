// middlewares/upload.js
import multer from "multer";
import path from "path";

// Simpan file ke folder 'uploads'
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // ex: 16921123123.jpg
  },
});

export const upload = multer({ storage });
