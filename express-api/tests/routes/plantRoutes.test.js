const request = require("supertest");
const express = require("express");

// Mock plantController
const plantController = {
  getPlants: jest.fn((req, res) => res.status(200).send("getPlants")),
  getPlantById: jest.fn((req, res) => res.status(200).send(`getPlantById ${req.params.id}`)),
  addPlant: jest.fn((req, res) => res.status(201).send("addPlant")),
  updatePlant: jest.fn((req, res) => res.status(200).send(`updatePlant ${req.params.id}`)),
};

// Setup express app dengan router dan controller mock
const router = require("express").Router();

router.get("/plants", plantController.getPlants);
router.get("/plants/:id", plantController.getPlantById);
router.post("/plants/add", plantController.addPlant);
router.put("/plants/:id", plantController.updatePlant);

const app = express();
app.use(express.json());
app.use("/", router);

describe("Plant Routes", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("GET /plants should call getPlants", async () => {
    const res = await request(app).get("/plants");
    expect(res.status).toBe(200);
    expect(res.text).toBe("getPlants");
    expect(plantController.getPlants).toHaveBeenCalledTimes(1);
  });

  test("GET /plants/:id should call getPlantById", async () => {
    const res = await request(app).get("/plants/42");
    expect(res.status).toBe(200);
    expect(res.text).toBe("getPlantById 42");
    expect(plantController.getPlantById).toHaveBeenCalledTimes(1);
  });

  test("POST /plants/add should call addPlant", async () => {
    const res = await request(app).post("/plants/add").send({ nama: "Bunga" });
    expect(res.status).toBe(201);
    expect(res.text).toBe("addPlant");
    expect(plantController.addPlant).toHaveBeenCalledTimes(1);
  });

  test("PUT /plants/:id should call updatePlant", async () => {
    const res = await request(app).put("/plants/7").send({ nama: "Tanaman Updated" });
    expect(res.status).toBe(200);
    expect(res.text).toBe("updatePlant 7");
    expect(plantController.updatePlant).toHaveBeenCalledTimes(1);
  });
});

// const request = require("supertest");
// const express = require("express");

// // Mock controller
// const plantController = {
//   getPlants: jest.fn((req, res) => res.status(200).json({ message: "getPlants" })),
//   getPlantById: jest.fn((req, res) =>
//     res.status(200).json({ message: `getPlantById ${req.params.id}` })
//   ),
//   addPlant: jest.fn((req, res) => res.status(201).json({ message: "addPlant" })),
//   updatePlant: jest.fn((req, res) =>
//     res.status(200).json({ message: `updatePlant ${req.params.id}` })
//   ),
// };

// // Setup express app dan routes
// const router = require("express").Router();

// router.get("/plants", plantController.getPlants);
// router.get("/plants/:id", plantController.getPlantById);
// router.post("/plants/add", plantController.addPlant);
// router.put("/plants/:id", plantController.updatePlant);

// const app = express();
// app.use(express.json());
// app.use(router);

// describe("Plant Routes", () => {
//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   test("GET /plants - should call getPlants", async () => {
//     const res = await request(app).get("/plants");
//     expect(plantController.getPlants).toHaveBeenCalled();
//     expect(res.statusCode).toBe(200);
//     expect(res.body).toEqual({ message: "getPlants" });
//   });

//   test("GET /plants/:id - should call getPlantById", async () => {
//     const res = await request(app).get("/plants/42");
//     expect(plantController.getPlantById).toHaveBeenCalled();
//     expect(res.statusCode).toBe(200);
//     expect(res.body).toEqual({ message: "getPlantById 42" });
//   });

//   test("POST /plants/add - should call addPlant", async () => {
//     const res = await request(app).post("/plants/add").send({ name: "Test Plant" });
//     expect(plantController.addPlant).toHaveBeenCalled();
//     expect(res.statusCode).toBe(201);
//     expect(res.body).toEqual({ message: "addPlant" });
//   });

//   test("PUT /plants/:id - should call updatePlant", async () => {
//     const res = await request(app).put("/plants/100").send({ name: "Updated Plant" });
//     expect(plantController.updatePlant).toHaveBeenCalled();
//     expect(res.statusCode).toBe(200);
//     expect(res.body).toEqual({ message: "updatePlant 100" });
//   });
// });
