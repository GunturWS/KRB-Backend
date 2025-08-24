const PlantModel = require("../models/adminPlantModel");
const baseUrl = process.env.PUBLIC_BASE_URL;

const adminaddPlant = async (req, res) => {
  try {
    console.log("DEBUG req.body:", req.body);
    console.log("DEBUG req.file:", req.file);

    let { nama_indonesia, deskripsi, source, nama_tumbuhan, category_ids } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "Gambar wajib diupload" });
    }

    // Gunakan URL penuh biar frontend langsung bisa load
    const image_path = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

    if (typeof category_ids === "string") {
      try {
        const parsed = JSON.parse(category_ids);
        category_ids = Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        category_ids = category_ids
          .split(",")
          .map((s) => Number(s.trim()))
          .filter(Boolean);
      }
    }

    if (!nama_indonesia || !deskripsi || !category_ids?.length) {
      return res.status(400).json({
        error: "Data wajib diisi: nama_indonesia, deskripsi, category_ids",
      });
    }

    const result = await PlantModel.adminaddManualPlant({
      nama_indonesia,
      deskripsi,
      image_path,
      source,
      nama_tumbuhan,
      category_ids,
    });

    res.status(201).json({
      message: "Tanaman manual berhasil ditambahkan",
      manualPlantId: result.id,
      image_path,
      ...(result.display_id ? { display_id: result.display_id } : {}),
    });
  } catch (error) {
    console.error("controller error:", error);
    res.status(500).json({ error: "Gagal menambahkan tanaman manual" });
  }
};

const admingetAllPlants = async (req, res) => {
  try {
    const plants = await PlantModel.admingetAllPlants();

    const result = plants.map((plant) => {
      let img = plant.image_path || "";

      // Jika already absolute URL (http/https) pakai apa adanya
      if (img && !/^https?:\/\//i.test(img)) {
        img = img.replace(/^\/+/, ""); // hapus leading slash
        img = `${baseUrl}/${img}`;
      }

      return {
        ...plant,
        image_path: img,
        is_manual: Boolean(plant.is_manual),
      };
    });

    res.status(200).json({ data: result });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: "Gagal mengambil data tanaman" });
  }
};

const admingetPlantById = async (req, res) => {
  try {
    const { id: displayId } = req.params;

    const plant = await PlantModel.admingetPlantById(displayId);

    if (!plant) return res.status(404).json({ error: "Tanaman tidak ditemukan" });

    // handle image_path: kalau bukan absolute URL, prefix baseUrl
    let img = plant.image_path || "";
    if (img && !/^https?:\/\//i.test(img)) {
      img = img.replace(/^\/+/, "");
      img = `${baseUrl}/${img}`;
    }

    // return fields konsisten, sertakan display_id
    const result = {
      ...plant,
      image_path: img,
      display_id: plant.display_id || (plant.id ? Number(plant.id) : null),
      is_manual: Boolean(plant.is_manual),
    };

    return res.status(200).json({ data: result });
  } catch (error) {
    console.error("❌ Error getById:", error);
    return res.status(500).json({ error: "Gagal mengambil detail tanaman" });
  }
};

const adminUpdatePlant = async (req, res) => {
  try {
    const { id } = req.params; // pastikan :id ada di route
    let { nama_indonesia, deskripsi, source, nama_tumbuhan, category_ids } = req.body;

    if (!id) {
      return res.status(400).json({ error: "ID tanaman wajib disertakan" });
    }

    let image_path = req.body.image_path || null;
    if (req.file) {
      image_path = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    }

    if (typeof category_ids === "string") {
      try {
        const parsed = JSON.parse(category_ids);
        category_ids = Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        category_ids = category_ids
          .split(",")
          .map((s) => Number(s.trim()))
          .filter(Boolean);
      }
    }

    // **gunakan model, bukan controller sendiri**
    const result = await PlantModel.adminUpdatePlant({
      id: Number(id),
      nama_indonesia,
      deskripsi,
      image_path,
      source,
      nama_tumbuhan,
      category_ids,
    });

    res.status(200).json({
      success: true,
      message: "Tanaman manual berhasil diupdate",
      manualPlantId: result.id,
      image_path,
    });
  } catch (error) {
    console.error("controller error:", error);
    return res.status(500).json({ error: "Gagal mengupdate tanaman" });
  }
};

const admindeletePlant = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await PlantModel.admindeletePlant(id);

    if (!deleted) {
      return res.status(404).json({ error: "Tanaman tidak ditemukan" });
    }

    res.status(200).json({ message: "Tanaman berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ error: "Gagal menghapus tanaman" });
  }
};

module.exports = {
  adminaddPlant,
  admingetAllPlants,
  admingetPlantById,
  adminUpdatePlant,
  admindeletePlant,
};
