const express = require("express");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const { predictController } = require("../controllers/predictController"); // <--- Perhatikan destructuring ini

const router = express.Router();

router.post("/predict", upload.single("image"), predictController);

module.exports = router;
