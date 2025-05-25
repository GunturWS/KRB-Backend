import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

import plantRoutes from "./routes/plantRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import predictRoutes from "./routes/predictRoutes.js";

dotenv.config();

const app = express();

// Untuk dapatkan __dirname karena pakai ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Static file: akses gambar dari folder 'dataset' yang sejajar dengan express_api
const datasetPath = path.join(__dirname, "..", "dataset");
app.use("/dataset", express.static(datasetPath));

// CORS: Izinkan akses dari frontend (misalnya: React di http://localhost:5173)
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type, Authorization",
  })
);

// Middleware
app.use(express.json());

// Routes
app.use("/api", plantRoutes);
app.use("/api", categoryRoutes);
app.use("/api", predictRoutes);

// Jalankan server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});
