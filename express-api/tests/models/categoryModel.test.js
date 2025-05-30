const pool = require("../../models/db");
const categoryModel = require("../../models/categoryModel");

jest.mock("../../models/db"); // Mock seluruh pool.query

describe("categoryModel", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllCategories", () => {
    it("should return all categories", async () => {
      const mockRows = [
        { id: 1, nama_kategori: "Tanaman Hias" },
        { id: 2, nama_kategori: "Obat Herbal" },
      ];
      pool.query.mockResolvedValue({ rows: mockRows });

      const result = await categoryModel.getAllCategories();

      expect(pool.query).toHaveBeenCalledWith("SELECT * FROM categories");
      expect(result).toEqual(mockRows);
    });

    it("should throw error when query fails", async () => {
      const error = new Error("DB error");
      pool.query.mockRejectedValue(error);

      await expect(categoryModel.getAllCategories()).rejects.toThrow(error);
    });
  });

  describe("getCategoryById", () => {
    it("should return category by id", async () => {
      const mockRow = { id: 1, nama_kategori: "Tanaman Hias" };
      pool.query.mockResolvedValue({ rows: [mockRow] });

      const result = await categoryModel.getCategoryById(1);

      expect(pool.query).toHaveBeenCalledWith("SELECT * FROM categories WHERE id = $1", [1]);
      expect(result).toEqual(mockRow);
    });
  });

  describe("addCategory", () => {
    it("should add category and return new category", async () => {
      const mockRow = { id: 3, nama_kategori: "Tanaman Langka" };
      pool.query.mockResolvedValue({ rows: [mockRow] });

      const result = await categoryModel.addCategory("Tanaman Langka");

      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining("INSERT INTO categories"), [
        "Tanaman Langka",
      ]);
      expect(result).toEqual(mockRow);
    });
  });

  describe("updateCategory", () => {
    it("should update category and return updated category", async () => {
      const mockRow = { id: 1, nama_kategori: "Tanaman Baru" };
      pool.query.mockResolvedValue({ rows: [mockRow] });

      const result = await categoryModel.updateCategory(1, "Tanaman Baru");

      expect(pool.query).toHaveBeenCalledWith(
        "UPDATE categories SET nama_kategori = $1 WHERE id = $2 RETURNING *",
        ["Tanaman Baru", 1]
      );
      expect(result).toEqual(mockRow);
    });
  });

  describe("deleteCategory", () => {
    it("should delete category and return deleted category", async () => {
      const mockRow = { id: 1, nama_kategori: "Tanaman Hias" };
      pool.query.mockResolvedValue({ rows: [mockRow] });

      const result = await categoryModel.deleteCategory(1);

      expect(pool.query).toHaveBeenCalledWith("DELETE FROM categories WHERE id = $1 RETURNING *", [
        1,
      ]);
      expect(result).toEqual(mockRow);
    });
  });
});

// const pool = require("../../models/db"); // Sesuaikan path jika berbeda
// const categoryModel = require("../../models/categoryModel");

// // Mock pool.query
// jest.mock("../models/db", () => ({
//   query: jest.fn(),
// }));

// describe("Category Model", () => {
//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   describe("getAllCategories", () => {
//     it("should return all categories", async () => {
//       const mockData = {
//         rows: [
//           { id: 1, nama_kategori: "A" },
//           { id: 2, nama_kategori: "B" },
//         ],
//       };
//       pool.query.mockResolvedValue(mockData);

//       const result = await categoryModel.getAllCategories();
//       expect(pool.query).toHaveBeenCalledWith("SELECT * FROM categories");
//       expect(result).toEqual(mockData.rows);
//     });
//   });

//   describe("getCategoryById", () => {
//     it("should return a category by id", async () => {
//       const mockData = { rows: [{ id: 1, nama_kategori: "A" }] };
//       pool.query.mockResolvedValue(mockData);

//       const result = await categoryModel.getCategoryById(1);
//       expect(pool.query).toHaveBeenCalledWith("SELECT * FROM categories WHERE id = $1", [1]);
//       expect(result).toEqual(mockData.rows[0]);
//     });
//   });

//   describe("addCategory", () => {
//     it("should add a new category", async () => {
//       const mockData = { rows: [{ id: 3, nama_kategori: "C" }] };
//       pool.query.mockResolvedValue(mockData);

//       const result = await categoryModel.addCategory("C");
//       expect(pool.query).toHaveBeenCalledWith(expect.stringContaining("INSERT INTO categories"), [
//         "C",
//       ]);
//       expect(result).toEqual(mockData.rows[0]);
//     });
//   });

//   describe("updateCategory", () => {
//     it("should update an existing category", async () => {
//       const mockData = { rows: [{ id: 1, nama_kategori: "Updated" }] };
//       pool.query.mockResolvedValue(mockData);

//       const result = await categoryModel.updateCategory(1, "Updated");
//       expect(pool.query).toHaveBeenCalledWith(
//         "UPDATE categories SET nama_kategori = $1 WHERE id = $2 RETURNING *",
//         ["Updated", 1]
//       );
//       expect(result).toEqual(mockData.rows[0]);
//     });
//   });

//   describe("deleteCategory", () => {
//     it("should delete a category by id", async () => {
//       const mockData = { rows: [{ id: 1, nama_kategori: "To Delete" }] };
//       pool.query.mockResolvedValue(mockData);

//       const result = await categoryModel.deleteCategory(1);
//       expect(pool.query).toHaveBeenCalledWith("DELETE FROM categories WHERE id = $1 RETURNING *", [
//         1,
//       ]);
//       expect(result).toEqual(mockData.rows[0]);
//     });
//   });
// });
