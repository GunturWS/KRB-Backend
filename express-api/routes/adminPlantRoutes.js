// const express = require("express");
// const router = express.Router();
// const adminplantController = require("../controllers/adminPlantController");

// router.post("/admin/plants", adminplantController.adminaddPlant);
// router.get("/admin/plants", adminplantController.admingetAllPlants);
// router.get("/admin/plants/:id", adminplantController.admingetPlantById);
// router.put("/admin/plants/:id", adminplantController.adminupdatePlant);
// router.delete("/admin/plants/:id", adminplantController.admindeletePlant);

// module.exports = router;

// routes/adminPlants.js
const express = require("express");
const router = express.Router();
const adminplantController = require("../controllers/adminPlantController");
const multer = require("multer");
const path = require("path");

// Konfigurasi multer untuk simpan file ke folder 'uploads'
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // folder tempat menyimpan file
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // contoh: 16921123123.jpg
  },
});

const upload = multer({ storage });

// POST tanaman (dengan upload gambar)
router.post("/admin/plants", upload.single("image_path"), adminplantController.adminaddPlant);

// GET semua tanaman
router.get("/admin/plants", adminplantController.admingetAllPlants);

// GET tanaman by ID
router.get("/admin/plants/:id", adminplantController.admingetPlantById);

// UPDATE tanaman (dengan upload gambar opsional)
// router.put("/api/admin/plants/:id", upload.single("image_path"), adminPlantController.adminUpdatePlant);
router.put("/admin/plants/:id", upload.single("image_path"), adminplantController.adminUpdatePlant);
// DELETE tanaman
router.delete("/admin/plants/:id", adminplantController.admindeletePlant);

module.exports = router;
