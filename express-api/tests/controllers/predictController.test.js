const { predictController } = require("../../controllers/predictController");
const axios = require("axios");
const fs = require("fs");

// Mock axios dan fs
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

    // Mock createReadStream supaya tidak error
    fs.createReadStream.mockReturnValue("fakeStream");
  });

  it("should return 400 if no file uploaded", async () => {
    req.file = undefined;

    await predictController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "No image file uploaded" });
  });

  it("should call axios.post and return prediction data", async () => {
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

  it("should handle axios error with response", async () => {
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

// const fs = require("fs");
// const axios = require("axios");
// const FormData = require("form-data");
// const { predictController } = require("../../controllers/predictController");

// jest.mock("axios");
// jest.mock("fs");

// describe("predictController", () => {
//   let req, res;

//   beforeEach(() => {
//     req = {
//       file: null, // default: no file
//     };

//     res = {
//       status: jest.fn().mockReturnThis(),
//       json: jest.fn(),
//     };

//     jest.clearAllMocks();
//   });

//   it("should return 400 if no file is uploaded", async () => {
//     await predictController(req, res);

//     expect(res.status).toHaveBeenCalledWith(400);
//     expect(res.json).toHaveBeenCalledWith({ error: "No image file uploaded" });
//   });

//   it("should return prediction and dataset_id if Flask API responds successfully", async () => {
//     req.file = { path: "mock/image/path.jpg" };

//     const mockPredictionResponse = {
//       data: {
//         dataset_id: "12345",
//         nama_tumbuhan: "Pohon Mangga",
//         image_url: "http://flask-api.com/images/123.jpg",
//       },
//     };

//     fs.createReadStream.mockReturnValue("mocked file stream");
//     axios.post.mockResolvedValue(mockPredictionResponse);

//     await predictController(req, res);

//     expect(axios.post).toHaveBeenCalled();
//     expect(res.json).toHaveBeenCalledWith({
//       prediction: mockPredictionResponse.data,
//       dataset_id: "12345",
//     });
//   });

//   it("should handle Flask API error with error.response.data", async () => {
//     req.file = { path: "mock/image/path.jpg" };
//     fs.createReadStream.mockReturnValue("mocked file stream");

//     axios.post.mockRejectedValue({
//       response: {
//         data: "Invalid image format",
//       },
//     });

//     await predictController(req, res);

//     expect(res.status).toHaveBeenCalledWith(500);
//     expect(res.json).toHaveBeenCalledWith({
//       error: "Invalid image format",
//     });
//   });

//   it("should handle unknown error without error.response", async () => {
//     req.file = { path: "mock/image/path.jpg" };
//     fs.createReadStream.mockReturnValue("mocked file stream");

//     axios.post.mockRejectedValue(new Error("Network Error"));

//     await predictController(req, res);

//     expect(res.status).toHaveBeenCalledWith(500);
//     expect(res.json).toHaveBeenCalledWith({
//       error: "Something went wrong with the prediction API",
//     });
//   });
// });
