const request = require("supertest");
const express = require("express");

// Buat mock controller agar tidak menjalankan logic asli
const categoryController = {
  getAllCategories: jest.fn((req, res) => res.status(200).send("getAllCategories")),
  getCategoryById: jest.fn((req, res) => res.status(200).send(`getCategoryById ${req.params.id}`)),
  addCategory: jest.fn((req, res) => res.status(201).send("addCategory")),
  updateCategory: jest.fn((req, res) => res.status(200).send(`updateCategory ${req.params.id}`)),
  deleteCategory: jest.fn((req, res) => res.status(200).send(`deleteCategory ${req.params.id}`)),
};

// Buat express app dan pasang router dengan controller mock
const router = require("express").Router();

router.get("/categories", categoryController.getAllCategories);
router.get("/categories/:id", categoryController.getCategoryById);
router.post("/categories/add", categoryController.addCategory);
router.put("/categories/:id", categoryController.updateCategory);
router.delete("/categories/:id", categoryController.deleteCategory);

const app = express();
app.use(express.json());
app.use("/", router);

describe("Category Routes", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("GET /categories should call getAllCategories", async () => {
    const response = await request(app).get("/categories");
    expect(response.status).toBe(200);
    expect(response.text).toBe("getAllCategories");
    expect(categoryController.getAllCategories).toHaveBeenCalledTimes(1);
  });

  test("GET /categories/:id should call getCategoryById", async () => {
    const response = await request(app).get("/categories/123");
    expect(response.status).toBe(200);
    expect(response.text).toBe("getCategoryById 123");
    expect(categoryController.getCategoryById).toHaveBeenCalledTimes(1);
  });

  test("POST /categories/add should call addCategory", async () => {
    const response = await request(app).post("/categories/add").send({ name: "New Category" });
    expect(response.status).toBe(201);
    expect(response.text).toBe("addCategory");
    expect(categoryController.addCategory).toHaveBeenCalledTimes(1);
  });

  test("PUT /categories/:id should call updateCategory", async () => {
    const response = await request(app).put("/categories/456").send({ name: "Updated" });
    expect(response.status).toBe(200);
    expect(response.text).toBe("updateCategory 456");
    expect(categoryController.updateCategory).toHaveBeenCalledTimes(1);
  });

  test("DELETE /categories/:id should call deleteCategory", async () => {
    const response = await request(app).delete("/categories/789");
    expect(response.status).toBe(200);
    expect(response.text).toBe("deleteCategory 789");
    expect(categoryController.deleteCategory).toHaveBeenCalledTimes(1);
  });
});

// const request = require("supertest");
// const express = require("express");

// // Mock controller
// const categoryController = {
//   getAllCategories: jest.fn((req, res) => res.status(200).json({ message: "getAllCategories" })),
//   getCategoryById: jest.fn((req, res) =>
//     res.status(200).json({ message: `getCategoryById ${req.params.id}` })
//   ),
//   addCategory: jest.fn((req, res) => res.status(201).json({ message: "addCategory" })),
//   updateCategory: jest.fn((req, res) =>
//     res.status(200).json({ message: `updateCategory ${req.params.id}` })
//   ),
//   deleteCategory: jest.fn((req, res) =>
//     res.status(200).json({ message: `deleteCategory ${req.params.id}` })
//   ),
// };

// // Buat app express dengan route yang ingin dites
// const router = require("express").Router();

// router.get("/categories", categoryController.getAllCategories);
// router.get("/categories/:id", categoryController.getCategoryById);
// router.post("/categories/add", categoryController.addCategory);
// router.put("/categories/:id", categoryController.updateCategory);
// router.delete("/categories/:id", categoryController.deleteCategory);

// const app = express();
// app.use(express.json());
// app.use(router);

// describe("Category Routes", () => {
//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   test("GET /categories - should call getAllCategories", async () => {
//     const res = await request(app).get("/categories");
//     expect(categoryController.getAllCategories).toHaveBeenCalled();
//     expect(res.statusCode).toBe(200);
//     expect(res.body).toEqual({ message: "getAllCategories" });
//   });

//   test("GET /categories/:id - should call getCategoryById", async () => {
//     const res = await request(app).get("/categories/123");
//     expect(categoryController.getCategoryById).toHaveBeenCalled();
//     expect(res.statusCode).toBe(200);
//     expect(res.body).toEqual({ message: "getCategoryById 123" });
//   });

//   test("POST /categories/add - should call addCategory", async () => {
//     const res = await request(app).post("/categories/add").send({ name: "New Category" });
//     expect(categoryController.addCategory).toHaveBeenCalled();
//     expect(res.statusCode).toBe(201);
//     expect(res.body).toEqual({ message: "addCategory" });
//   });

//   test("PUT /categories/:id - should call updateCategory", async () => {
//     const res = await request(app).put("/categories/456").send({ name: "Updated Category" });
//     expect(categoryController.updateCategory).toHaveBeenCalled();
//     expect(res.statusCode).toBe(200);
//     expect(res.body).toEqual({ message: "updateCategory 456" });
//   });

//   test("DELETE /categories/:id - should call deleteCategory", async () => {
//     const res = await request(app).delete("/categories/789");
//     expect(categoryController.deleteCategory).toHaveBeenCalled();
//     expect(res.statusCode).toBe(200);
//     expect(res.body).toEqual({ message: "deleteCategory 789" });
//   });
// });
