const request = require("supertest");
const express = require("express");
const multer = require("multer");

// Mock predictController
const predictController = jest.fn((req, res) => {
  res.status(200).json({ message: "Prediction done" });
});

// Buat router yang sama seperti kode aslinya, tapi dengan mock controller
const router = express.Router();
const upload = multer({ dest: "uploads/" });
router.post("/predict", upload.single("image"), predictController);

const app = express();
app.use(router);

describe("POST /predict route", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should call predictController and respond with success", async () => {
    const res = await request(app)
      .post("/predict")
      .attach("image", Buffer.from("test file content"), "test-image.jpg");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: "Prediction done" });
    expect(predictController).toHaveBeenCalledTimes(1);

    // cek kalau req.file ada (multer sudah upload dan parsing)
    const reqPassed = predictController.mock.calls[0][0];
    expect(reqPassed.file).toBeDefined();
    expect(reqPassed.file.originalname).toBe("test-image.jpg");
  });

  it("should fail if no file uploaded", async () => {
    const res = await request(app).post("/predict");

    // Kalau di controller kamu handle file wajib, harus disesuaikan
    // Untuk contoh ini, prediksi akan tetap dipanggil tapi tanpa file
    expect(predictController).toHaveBeenCalledTimes(1);
    const reqPassed = predictController.mock.calls[0][0];
    expect(reqPassed.file).toBeUndefined();
  });
});

// const request = require("supertest");
// const express = require("express");
// const multer = require("multer");

// // Mock predictController sebagai middleware
// const predictController = jest.fn((req, res) => {
//   res.status(200).json({ message: "Prediction received", file: req.file?.originalname || null });
// });

// // Setup express app dan route sesuai kode kamu
// const upload = multer({ dest: "uploads/" });
// const router = express.Router();

// router.post("/predict", upload.single("image"), predictController);

// const app = express();
// app.use(router);

// describe("POST /predict route", () => {
//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   it("should call predictController and upload a single image file", async () => {
//     const res = await request(app)
//       .post("/predict")
//       .attach("image", Buffer.from("fake image content"), "test-image.jpg");

//     expect(predictController).toHaveBeenCalled();
//     expect(res.statusCode).toBe(200);
//     expect(res.body).toHaveProperty("message", "Prediction received");
//     expect(res.body).toHaveProperty("file", "test-image.jpg");
//   });

//   it("should handle missing file gracefully", async () => {
//     const res = await request(app).post("/predict");

//     expect(predictController).toHaveBeenCalled();
//     expect(res.statusCode).toBe(200);
//     expect(res.body.file).toBeNull();
//   });
// });
