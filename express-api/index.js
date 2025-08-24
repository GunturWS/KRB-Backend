import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

import plantRoutes from "./routes/plantRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import predictRoutes from "./routes/predictRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import adminPlantRoutes from "./routes/adminPlantRoutes.js";

dotenv.config();

const app = express();

// Untuk dapatkan __dirname karena pakai ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Static file: akses gambar dari folder 'dataset' yang sejajar dengan express_api
const datasetPath = path.join(__dirname, "..", "dataset");
app.use("/dataset", express.static(datasetPath));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// CORS: Izinkan akses dari frontend (misalnya: React di http://localhost:5173)
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*", // fallback kalau env kosong
    methods: process.env.CORS_METHODS
      ? process.env.CORS_METHODS.split(",")
      : ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: process.env.CORS_ALLOWED_HEADERS
      ? process.env.CORS_ALLOWED_HEADERS.split(",")
      : ["Content-Type", "Authorization"],
  })
);

// Middleware
app.use(express.json());

// Routes
app.use("/api", plantRoutes);
app.use("/api", categoryRoutes);
app.use("/api", predictRoutes);
app.use("/api", adminRoutes);
app.use("/api", adminPlantRoutes);

// Jalankan server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});
