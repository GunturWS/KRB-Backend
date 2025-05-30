const PlantModel = require("../models/plantModel");

const baseUrl = process.env.PUBLIC_BASE_URL;

const getPlants = async (req, res) => {
  try {
    // const baseUrl = process.env.PUBLIC_BASE_URL;
    const plants = await PlantModel.getAllPlants();
    const result = plants.map((plant) => ({
      ...plant,
      // image_path: `http://localhost:3000/${plant.image_path}`,
      image_path: `${baseUrl}/${plant.image_path}`,
    }));
    res.status(200).json(result);
  } catch (error) {
    // console.error("❌ Error fetching plants:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getPlantById = async (req, res) => {
  const { id } = req.params;

  try {
    // const baseUrl = process.env.PUBLIC_BASE_URL;
    const plant = await PlantModel.getPlantById(id);

    if (!plant) {
      return res.status(404).json({ error: "Tanaman tidak ditemukan" });
    }

    const result = {
      ...plant,
      // image_path: `http://localhost:3000/${plant.image_path}`,
      image_path: `${baseUrl}/${plant.image_path}`,
    };

    res.status(200).json(result);
  } catch (error) {
    // console.error("❌ Error fetching plant by ID:", error);
    res.status(500).json({ error: "Terjadi kesalahan server" });
  }
};

const addPlant = async (req, res) => {
  try {
    const { dataset_id, nama_indonesia, deskripsi, category_ids } = req.body;

    if (!dataset_id || !nama_indonesia || !deskripsi) {
      return res
        .status(400)
        .json({ error: "dataset_id, nama_indonesia, dan deskripsi wajib diisi" });
    }

    const result = await PlantModel.addPlant({
      dataset_id,
      nama_indonesia,
      deskripsi,
      category_ids,
    });
    res.status(201).json({ message: "Plant berhasil ditambahkan", plantId: result.plantId });
  } catch (error) {
    // console.error("❌ Error adding plant:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updatePlant = async (req, res) => {
  const { id } = req.params;
  const { nama_indonesia, deskripsi, category_ids } = req.body;

  try {
    await PlantModel.updatePlant(id, { nama_indonesia, deskripsi, category_ids });
    res.status(200).json({ message: "Tanaman berhasil diperbarui" });
  } catch (err) {
    // console.error("❌ Error updating plant:", err);
    res.status(500).json({ error: "Gagal memperbarui tanaman" });
  }
};

module.exports = {
  getPlants,
  getPlantById,
  addPlant,
  updatePlant,
};
