const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController"); // Pastikan impor ini benar

// Route untuk mendapatkan semua kategori
router.get("/categories", categoryController.getAllCategories);

// Route untuk mendapatkan kategori berdasarkan ID
router.get("/categories/:id", categoryController.getCategoryById);

// Route untuk membuat kategori baru
router.post("/categories/add", categoryController.addCategory);

// Route untuk update kategori
router.put("/categories/:id", categoryController.updateCategory);

// Route untuk delete kategori
router.delete("/categories/:id", categoryController.deleteCategory);

module.exports = router;
