const pool = require("./db"); // Koneksi ke database

// Fungsi untuk mendapatkan semua kategori
const getAllCategories = async () => {
  try {
    const result = await pool.query("SELECT * FROM categories");
    return result.rows;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

const getCategoryById = async (id) => {
  const query = "SELECT * FROM categories WHERE id = $1";
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

// Tambah kategori baru
const addCategory = async (nama_kategori) => {
  const query = `
    INSERT INTO categories (nama_kategori)
    VALUES ($1)
    ON CONFLICT (nama_kategori) DO NOTHING
    RETURNING *;
  `;
  const result = await pool.query(query, [nama_kategori]);
  return result.rows[0];
};

// Update kategori
const updateCategory = async (id, nama_kategori) => {
  const query = "UPDATE categories SET nama_kategori = $1 WHERE id = $2 RETURNING *";
  const result = await pool.query(query, [nama_kategori, id]);
  return result.rows[0];
};

// Delete kategori
const deleteCategory = async (id) => {
  const query = "DELETE FROM categories WHERE id = $1 RETURNING *";
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

module.exports = {
  getAllCategories,
  getCategoryById,
  addCategory,
  updateCategory,
  deleteCategory,
};
