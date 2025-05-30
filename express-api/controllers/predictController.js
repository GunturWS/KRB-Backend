const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

const predictController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file uploaded" });
    }

    const formData = new FormData();
    formData.append("image", fs.createReadStream(req.file.path));

    const response = await axios.post(process.env.FLASK_API_URL, formData, {
      headers: formData.getHeaders(),
    });

    // Ambil dataset_id dari response Flask
    const dataset_id = response.data.dataset_id;

    // Kirim balik data prediction sesuai bentuk baru
    return res.json({
      prediction: response.data, // langsung objek {dataset_id, nama_tumbuhan, image_url}
      dataset_id: dataset_id,
    });
  } catch (error) {
    // console.error("🛑 Error calling Flask API:", error.message);
    if (error.response) {
      return res.status(500).json({ error: error.response.data });
    }
    return res.status(500).json({ error: "Something went wrong with the prediction API" });
  }
};

module.exports = { predictController };
