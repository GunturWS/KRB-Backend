const pool = require("../../models/db");
const plantModel = require("../../models/plantModel");

jest.mock("../../models/db", () => ({
  query: jest.fn(),
  connect: jest.fn(),
}));

describe("plantModel", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllPlants", () => {
    it("should return list of plants", async () => {
      const mockRows = [{ dataset_id: 1, nama_tumbuhan: "Tumbuhan A" }];
      pool.query.mockResolvedValue({ rows: mockRows });

      const result = await plantModel.getAllPlants();

      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockRows);
    });
  });

  describe("getPlantById", () => {
    it("should return a plant by id", async () => {
      const mockRow = { dataset_id: 1, nama_tumbuhan: "Tumbuhan A" };
      pool.query.mockResolvedValue({ rows: [mockRow] });

      const result = await plantModel.getPlantById(1);

      expect(pool.query).toHaveBeenCalledWith(expect.any(String), [1]);
      expect(result).toEqual(mockRow);
    });
  });

  describe("updatePlant", () => {
    it("should update plant and categories successfully", async () => {
      const mockClient = {
        query: jest.fn(),
        release: jest.fn(),
      };
      pool.connect.mockResolvedValue(mockClient);

      // Mock query to resolve without error
      mockClient.query.mockResolvedValue({});

      const data = {
        nama_indonesia: "Tanaman Baru",
        deskripsi: "Deskripsi Baru",
        category_ids: [1, 2],
      };

      const result = await plantModel.updatePlant(1, data);

      expect(pool.connect).toHaveBeenCalled();
      expect(mockClient.query).toHaveBeenCalledWith("BEGIN");
      expect(mockClient.query).toHaveBeenCalledWith(
        "UPDATE plants SET nama_indonesia = $1, deskripsi = $2 WHERE id = $3",
        [data.nama_indonesia, data.deskripsi, 1]
      );
      expect(mockClient.query).toHaveBeenCalledWith(
        "DELETE FROM plantcategory WHERE plant_id = $1",
        [1]
      );
      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO plantcategory"),
        [1, ...data.category_ids]
      );
      expect(mockClient.query).toHaveBeenCalledWith("COMMIT");
      expect(mockClient.release).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });

    it("should rollback if error occurs", async () => {
      const mockClient = {
        query: jest.fn(),
        release: jest.fn(),
      };
      pool.connect.mockResolvedValue(mockClient);

      mockClient.query
        .mockImplementationOnce(() => Promise.resolve()) // BEGIN
        .mockImplementationOnce(() => Promise.reject(new Error("fail"))); // UPDATE

      await expect(
        plantModel.updatePlant(1, {
          nama_indonesia: "x",
          deskripsi: "x",
          category_ids: [],
        })
      ).rejects.toThrow("fail");

      expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK");
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe("addPlant", () => {
    it("should insert a new plant and its categories", async () => {
      const mockClient = await pool.connect();

      mockClient.query
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({ rows: [{ id: 10 }] }) // insert plant returning id
        .mockResolvedValueOnce({}) // insert categories
        .mockResolvedValueOnce({}); // COMMIT

      const data = {
        dataset_id: 1,
        nama_indonesia: "Pisang",
        deskripsi: "Tanaman tropis",
        category_ids: [1, 2],
      };

      const result = await plantModel.addPlant(data);

      expect(mockClient.query).toHaveBeenCalledTimes(4);
      expect(result).toEqual({ success: true, plantId: 10 });
    });

    it("should rollback on error", async () => {
      const mockClient = await pool.connect();
      mockClient.query
        .mockResolvedValueOnce({ rows: [{ id: 10 }] }) // insert plant
        .mockRejectedValueOnce(new Error("Insert category error"));

      const data = {
        dataset_id: 1,
        nama_indonesia: "Pisang",
        deskripsi: "Tanaman tropis",
        category_ids: [1, 2],
      };

      await expect(plantModel.addPlant(data)).rejects.toThrow("Insert category error");
      expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK");
    });
  });
});
