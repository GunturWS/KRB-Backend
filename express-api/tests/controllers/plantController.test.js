const {
  getPlants,
  getPlantById,
  addPlant,
  updatePlant,
} = require("../../controllers/plantController");

const PlantModel = require("../../models/plantModel");

const baseUrl = process.env.PUBLIC_BASE_URL;

// Mock response & request
const mockRequest = (params = {}, body = {}) => ({
  params,
  body,
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// Mock seluruh fungsi PlantModel
jest.mock("../../models/plantModel");

describe("Plant Controller", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getPlants", () => {
    it("should return 200 and list of plants with full image_path", async () => {
      const plants = [
        { id: 1, nama_indonesia: "Mawar", image_path: "mawar.jpg" },
        { id: 2, nama_indonesia: "Melati", image_path: "melati.jpg" },
      ];
      PlantModel.getAllPlants.mockResolvedValue(plants);

      const req = mockRequest();
      const res = mockResponse();

      await getPlants(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        plants.map((p) => ({ ...p, image_path: `${baseUrl}/${p.image_path}` }))
      );
    });

    it("should return 500 if error occurs", async () => {
      PlantModel.getAllPlants.mockRejectedValue(new Error("DB error"));

      const req = mockRequest();
      const res = mockResponse();

      await getPlants(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Internal server error" });
    });
  });

  describe("getPlantById", () => {
    it("should return 200 and plant with full image_path if found", async () => {
      const plant = { id: 1, nama_indonesia: "Mawar", image_path: "mawar.jpg" };
      PlantModel.getPlantById.mockResolvedValue(plant);

      const req = mockRequest({ id: "1" });
      const res = mockResponse();

      await getPlantById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        ...plant,
        image_path: `${baseUrl}/${plant.image_path}`,
      });
    });

    it("should return 404 if plant not found", async () => {
      PlantModel.getPlantById.mockResolvedValue(null);

      const req = mockRequest({ id: "1" });
      const res = mockResponse();

      await getPlantById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Tanaman tidak ditemukan" });
    });

    it("should return 500 if error occurs", async () => {
      PlantModel.getPlantById.mockRejectedValue(new Error("DB error"));

      const req = mockRequest({ id: "1" });
      const res = mockResponse();

      await getPlantById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Terjadi kesalahan server" });
    });
  });

  describe("addPlant", () => {
    it("should return 201 and success message if plant added", async () => {
      const plantId = 123;
      PlantModel.addPlant.mockResolvedValue({ plantId });

      const req = mockRequest({}, {
        dataset_id: 1,
        nama_indonesia: "Melati",
        deskripsi: "Tanaman hias",
        category_ids: [1, 2],
      });
      const res = mockResponse();

      await addPlant(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Plant berhasil ditambahkan",
        plantId,
      });
    });

    it("should return 400 if required fields are missing", async () => {
      const req = mockRequest({}, { nama_indonesia: "Melati" }); // dataset_id, deskripsi missing
      const res = mockResponse();

      await addPlant(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "dataset_id, nama_indonesia, dan deskripsi wajib diisi",
      });
    });

    it("should return 500 if error occurs", async () => {
      PlantModel.addPlant.mockRejectedValue(new Error("DB error"));

      const req = mockRequest({}, {
        dataset_id: 1,
        nama_indonesia: "Melati",
        deskripsi: "Deskripsi",
      });
      const res = mockResponse();

      await addPlant(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Internal server error" });
    });
  });

  describe("updatePlant", () => {
    it("should return 200 and success message if update succeeds", async () => {
      PlantModel.updatePlant.mockResolvedValue();

      const req = mockRequest({ id: "1" }, {
        nama_indonesia: "Melati Updated",
        deskripsi: "Deskripsi baru",
        category_ids: [1, 3],
      });
      const res = mockResponse();

      await updatePlant(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Tanaman berhasil diperbarui",
      });
    });

    it("should return 500 if update fails", async () => {
      PlantModel.updatePlant.mockRejectedValue(new Error("DB error"));

      const req = mockRequest({ id: "1" }, {
        nama_indonesia: "Melati Updated",
        deskripsi: "Deskripsi baru",
        category_ids: [1, 3],
      });
      const res = mockResponse();

      await updatePlant(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Gagal memperbarui tanaman" });
    });
  });
});


// const plantController = require("../../controllers/plantController");
// const PlantModel = require("../../models/plantModel");

// jest.mock("../models/plantModel");

// describe("Plant Controller", () => {
//   let req, res;

//   beforeEach(() => {
//     req = { params: {}, body: {} };
//     res = {
//       status: jest.fn().mockReturnThis(),
//       json: jest.fn(),
//     };
//     jest.clearAllMocks();
//   });

//   describe("getPlants", () => {
//     it("should return 200 and all plants", async () => {
//       const mockPlants = [
//         { id: 1, image_path: "uploads/image1.jpg" },
//         { id: 2, image_path: "uploads/image2.jpg" },
//       ];

//       PlantModel.getAllPlants.mockResolvedValue(mockPlants);

//       await plantController.getPlants(req, res);

//       expect(res.status).toHaveBeenCalledWith(200);
//       expect(res.json).toHaveBeenCalledWith([
//         { id: 1, image_path: "http://localhost:3000/uploads/image1.jpg" },
//         { id: 2, image_path: "http://localhost:3000/uploads/image2.jpg" },
//       ]);
//     });

//     it("should handle error and return 500", async () => {
//       PlantModel.getAllPlants.mockRejectedValue(new Error("DB Error"));

//       await plantController.getPlants(req, res);

//       expect(res.status).toHaveBeenCalledWith(500);
//       expect(res.json).toHaveBeenCalledWith({ error: "Internal server error" });
//     });
//   });

//   describe("getPlantById", () => {
//     it("should return 200 and plant data", async () => {
//       req.params.id = 1;
//       const mockPlant = { id: 1, image_path: "uploads/plant.jpg" };

//       PlantModel.getPlantById.mockResolvedValue(mockPlant);

//       await plantController.getPlantById(req, res);

//       expect(res.status).toHaveBeenCalledWith(200);
//       expect(res.json).toHaveBeenCalledWith({
//         ...mockPlant,
//         image_path: "http://localhost:3000/uploads/plant.jpg",
//       });
//     });

//     it("should return 404 if plant not found", async () => {
//       req.params.id = 99;
//       PlantModel.getPlantById.mockResolvedValue(null);

//       await plantController.getPlantById(req, res);

//       expect(res.status).toHaveBeenCalledWith(404);
//       expect(res.json).toHaveBeenCalledWith({ error: "Tanaman tidak ditemukan" });
//     });

//     it("should handle error and return 500", async () => {
//       req.params.id = 1;
//       PlantModel.getPlantById.mockRejectedValue(new Error("DB Error"));

//       await plantController.getPlantById(req, res);

//       expect(res.status).toHaveBeenCalledWith(500);
//       expect(res.json).toHaveBeenCalledWith({ error: "Terjadi kesalahan server" });
//     });
//   });

//   describe("addPlant", () => {
//     it("should return 400 if required fields are missing", async () => {
//       req.body = { dataset_id: "", nama_indonesia: "", deskripsi: "" };

//       await plantController.addPlant(req, res);

//       expect(res.status).toHaveBeenCalledWith(400);
//       expect(res.json).toHaveBeenCalledWith({
//         error: "dataset_id, nama_indonesia, dan deskripsi wajib diisi",
//       });
//     });

//     it("should return 201 if plant added successfully", async () => {
//       req.body = {
//         dataset_id: "123",
//         nama_indonesia: "Tanaman A",
//         deskripsi: "Deskripsi A",
//         category_ids: [1, 2],
//       };

//       PlantModel.addPlant.mockResolvedValue({ plantId: 10 });

//       await plantController.addPlant(req, res);

//       expect(res.status).toHaveBeenCalledWith(201);
//       expect(res.json).toHaveBeenCalledWith({
//         message: "Plant berhasil ditambahkan",
//         plantId: 10,
//       });
//     });

//     it("should handle error and return 500", async () => {
//       req.body = {
//         dataset_id: "123",
//         nama_indonesia: "Tanaman A",
//         deskripsi: "Deskripsi A",
//       };

//       PlantModel.addPlant.mockRejectedValue(new Error("Insert error"));

//       await plantController.addPlant(req, res);

//       expect(res.status).toHaveBeenCalledWith(500);
//       expect(res.json).toHaveBeenCalledWith({ error: "Internal server error" });
//     });
//   });

//   describe("updatePlant", () => {
//     it("should return 200 if plant updated", async () => {
//       req.params.id = 1;
//       req.body = {
//         nama_indonesia: "Tanaman Baru",
//         deskripsi: "Deskripsi Baru",
//         category_ids: [1, 2],
//       };

//       await plantController.updatePlant(req, res);

//       expect(PlantModel.updatePlant).toHaveBeenCalledWith(1, req.body);
//       expect(res.status).toHaveBeenCalledWith(200);
//       expect(res.json).toHaveBeenCalledWith({ message: "Tanaman berhasil diperbarui" });
//     });

//     it("should handle error and return 500", async () => {
//       req.params.id = 1;
//       req.body = {
//         nama_indonesia: "Tanaman Baru",
//         deskripsi: "Deskripsi Baru",
//       };

//       PlantModel.updatePlant.mockRejectedValue(new Error("Update error"));

//       await plantController.updatePlant(req, res);

//       expect(res.status).toHaveBeenCalledWith(500);
//       expect(res.json).toHaveBeenCalledWith({ error: "Gagal memperbarui tanaman" });
//     });
//   });
// });
