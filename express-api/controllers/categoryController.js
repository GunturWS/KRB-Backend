const categoryModel = require("../models/categoryModel");

// Fungsi untuk handle request GET all categories
const getAllCategories = async (req, res) => {
  try {
    const categories = await categoryModel.getAllCategories();
    return res.status(200).json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const category = await categoryModel.getCategoryById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Kategori tidak ditemukan",
      });
    }

    return res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error("Error fetching category by id:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
    });
  }
};

const addCategory = async (req, res) => {
  try {
    const { nama_kategori } = req.body;
    if (!nama_kategori) {
      return res.status(400).json({ success: false, message: "nama_kategori wajib diisi" });
    }

    const newCategory = await categoryModel.addCategory(nama_kategori);

    if (!newCategory) {
      return res.status(409).json({ success: false, message: "Kategori sudah ada" });
    }

    return res.status(201).json({ success: true, data: newCategory });
  } catch (error) {
    console.error("❌ Error adding category:", error);
    return res.status(500).json({ success: false, message: "Terjadi kesalahan di server" });
  }
};

const updateCategory = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { nama_kategori } = req.body;

    const updated = await categoryModel.updateCategory(id, nama_kategori);

    if (!updated) {
      return res.status(404).json({ success: false, message: "Kategori tidak ditemukan" });
    }

    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating category:", error);
    return res.status(500).json({ success: false, message: "Terjadi kesalahan pada server" });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = await categoryModel.deleteCategory(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Kategori tidak ditemukan" });
    }

    return res.status(200).json({ success: true, message: "Kategori berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting category:", error);
    return res.status(500).json({ success: false, message: "Terjadi kesalahan pada server" });
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  addCategory,
  updateCategory,
  deleteCategory,
};
