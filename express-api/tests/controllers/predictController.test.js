const { predictController } = require("../../controllers/predictController");
const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");

// Mock axios, fs, dan FormData
jest.mock("axios");
jest.mock("fs");

describe("predictController", () => {
  let req, res;

  beforeEach(() => {
    req = {
      file: {
        path: "/path/to/fakefile.jpg",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    fs.createReadStream.mockReturnValue("fakeStream");
  });

  it("should return 400 if no file uploaded", async () => {
    req.file = undefined;

    await predictController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "No image file uploaded" });
  });

  it("should return 200 and prediction data on success", async () => {
    const mockResponse = {
      data: {
        dataset_id: 123,
        nama_tumbuhan: "Melati",
        image_url: "http://example.com/melati.jpg",
      },
    };

    axios.post.mockResolvedValue(mockResponse);

    await predictController(req, res);

    expect(axios.post).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      prediction: mockResponse.data,
      dataset_id: mockResponse.data.dataset_id,
    });
  });

  it("should handle axios error with response from Flask API", async () => {
    const errorResponse = {
      response: {
        data: { message: "Flask API error" },
      },
    };

    axios.post.mockRejectedValue(errorResponse);

    await predictController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: errorResponse.response.data });
  });

  it("should handle axios error without response", async () => {
    axios.post.mockRejectedValue(new Error("Network error"));

    await predictController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Something went wrong with the prediction API",
    });
  });
});
