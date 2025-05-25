const express = require("express");
const router = express.Router();
const plantController = require("../controllers/plantController");

// Route untuk mendapatkan semua tanaman
router.get("/plants", plantController.getPlants);

// Route untuk mendapatkan tanaman berdasarkan ID
router.get("/plants/:id", plantController.getPlantById);

// Route untuk mendapatkan tanaman berdasarkan ID
router.post("/plants/add", plantController.addPlant);

// Route untuk update tanaman
router.put("/plants/:id", plantController.updatePlant);

module.exports = router;
