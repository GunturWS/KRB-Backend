const categoryController = require("../../controllers/categoryController");
const categoryModel = require("../../models/categoryModel");

jest.mock("../../models/categoryModel"); // Mock module model

describe("Category Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe("getAllCategories", () => {
    it("should return 200 with categories", async () => {
      const fakeCategories = [{ id: 1, nama_kategori: "Tanaman" }];
      categoryModel.getAllCategories.mockResolvedValue(fakeCategories);

      await categoryController.getAllCategories(req, res);

      expect(categoryModel.getAllCategories).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(fakeCategories);
    });

    it("should return 500 if model throws error", async () => {
      categoryModel.getAllCategories.mockRejectedValue(new Error("DB error"));

      await categoryController.getAllCategories(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Internal Server Error",
      });
    });
  });

  describe("getCategoryById", () => {
    it("should return 200 and category data if found", async () => {
      const fakeCategory = { id: 1, nama_kategori: "Tanaman" };
      req.params = { id: "1" };
      categoryModel.getCategoryById.mockResolvedValue(fakeCategory);

      await categoryController.getCategoryById(req, res);

      expect(categoryModel.getCategoryById).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: fakeCategory,
      });
    });

    it("should return 404 if category not found", async () => {
      req.params = { id: "999" };
      categoryModel.getCategoryById.mockResolvedValue(null);

      await categoryController.getCategoryById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Kategori tidak ditemukan",
      });
    });

    it("should return 500 if error occurs", async () => {
      req.params = { id: "abc" };
      categoryModel.getCategoryById.mockRejectedValue(new Error("DB error"));

      await categoryController.getCategoryById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Terjadi kesalahan pada server",
      });
    });
  });

  describe("addCategory", () => {
    it("should return 400 if nama_kategori is missing", async () => {
      req.body = {};

      await categoryController.addCategory(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "nama_kategori wajib diisi",
      });
    });

    it("should return 201 and new category if success", async () => {
      req.body = { nama_kategori: "Buah" };
      const newCategory = { id: 2, nama_kategori: "Buah" };
      categoryModel.addCategory.mockResolvedValue(newCategory);

      await categoryController.addCategory(req, res);

      expect(categoryModel.addCategory).toHaveBeenCalledWith("Buah");
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: newCategory,
      });
    });

    it("should return 409 if category already exists", async () => {
      req.body = { nama_kategori: "Buah" };
      categoryModel.addCategory.mockResolvedValue(null);

      await categoryController.addCategory(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Kategori sudah ada",
      });
    });

    it("should return 500 if error", async () => {
      req.body = { nama_kategori: "Buah" };
      categoryModel.addCategory.mockRejectedValue(new Error("DB error"));

      await categoryController.addCategory(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Terjadi kesalahan di server",
      });
    });
  });

  describe("updateCategory", () => {
    it("should return 200 and updated category if success", async () => {
      req.params = { id: "1" };
      req.body = { nama_kategori: "Sayur" };
      const updatedCategory = { id: 1, nama_kategori: "Sayur" };
      categoryModel.updateCategory.mockResolvedValue(updatedCategory);

      await categoryController.updateCategory(req, res);

      expect(categoryModel.updateCategory).toHaveBeenCalledWith(1, "Sayur");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: updatedCategory,
      });
    });

    it("should return 404 if category not found", async () => {
      req.params = { id: "1" };
      req.body = { nama_kategori: "Sayur" };
      categoryModel.updateCategory.mockResolvedValue(null);

      await categoryController.updateCategory(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Kategori tidak ditemukan",
      });
    });

    it("should return 500 if error", async () => {
      req.params = { id: "1" };
      req.body = { nama_kategori: "Sayur" };
      categoryModel.updateCategory.mockRejectedValue(new Error("DB error"));

      await categoryController.updateCategory(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Terjadi kesalahan pada server",
      });
    });
  });

  describe("deleteCategory", () => {
    it("should return 200 if delete success", async () => {
      req.params = { id: "1" };
      categoryModel.deleteCategory.mockResolvedValue(true);

      await categoryController.deleteCategory(req, res);

      expect(categoryModel.deleteCategory).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Kategori berhasil dihapus",
      });
    });

    it("should return 404 if category not found", async () => {
      req.params = { id: "1" };
      categoryModel.deleteCategory.mockResolvedValue(false);

      await categoryController.deleteCategory(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Kategori tidak ditemukan",
      });
    });

    it("should return 500 if error", async () => {
      req.params = { id: "1" };
      categoryModel.deleteCategory.mockRejectedValue(new Error("DB error"));

      await categoryController.deleteCategory(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Terjadi kesalahan pada server",
      });
    });
  });
});
