const pool = require("./db");

const getAllPlants = async () => {
  const query = `
    SELECT DISTINCT ON (dp.nama_tumbuhan) 
      dp.id AS dataset_id,
      dp.nama_tumbuhan,
      dp.image_path,
      p.dataset_id AS plant_id,
      p.nama_indonesia,
      p.deskripsi,
      COALESCE(k.kategori, '[]') AS kategori
    FROM datasetplants dp
    LEFT JOIN plants p ON p.dataset_id = dp.id
    LEFT JOIN (
      SELECT 
        pc.plant_id,
        json_agg(DISTINCT c.nama_kategori) AS kategori
      FROM plantcategory pc
      JOIN categories c ON pc.category_id = c.id
      GROUP BY pc.plant_id
    ) k ON p.id = k.plant_id
    ORDER BY dp.nama_tumbuhan, p.id
    LIMIT 52;
  `;
  const result = await pool.query(query);
  return result.rows;
};

// Get Plant By ID
const getPlantById = async (id) => {
  const query = `
    SELECT 
      dp.id AS dataset_id,
      dp.nama_tumbuhan,
      dp.image_path,
      p.id AS plant_id,
      p.nama_indonesia,
      p.deskripsi,
      COALESCE(k.kategori, '[]') AS kategori
    FROM datasetplants dp
    LEFT JOIN plants p ON p.dataset_id = dp.id
    LEFT JOIN (
      SELECT 
        pc.plant_id,
        json_agg(DISTINCT c.nama_kategori) AS kategori
      FROM plantcategory pc
      JOIN categories c ON pc.category_id = c.id
      GROUP BY pc.plant_id
    ) k ON p.id = k.plant_id
    WHERE dp.id = $1
    LIMIT 1;
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};


// const getPlantById = async (id) => {
//   const query = `
//     SELECT 
//       dp.id AS dataset_id,
//       dp.nama_tumbuhan,
//       dp.image_path,
//       p.id AS plant_id,
//       p.nama_indonesia,
//       p.deskripsi,
//       COALESCE(k.kategori, '[]') AS kategori
//     FROM datasetplants dp
//     LEFT JOIN plants p ON p.dataset_id = dp.id
//     LEFT JOIN (
//       SELECT 
//         pc.plant_id,
//         json_agg(DISTINCT c.nama_kategori) AS kategori
//       FROM plantcategory pc
//       JOIN categories c ON pc.category_id = c.id
//       GROUP BY pc.plant_id
//     ) k ON p.id = k.plant_id
//     WHERE dp.id = $1
//     LIMIT 1;
//   `;
//   const result = await pool.query(query, [id]);
//   return result.rows[0];
// };


// const getPlantById = async (id) => {
//   const query = `
//     SELECT DISTINCT ON (dp.nama_tumbuhan)
//       dp.id AS dataset_id,
//       dp.nama_tumbuhan,
//       dp.image_path,
//       p.id AS plant_id,
//       p.nama_indonesia,
//       p.deskripsi,
//       COALESCE(k.kategori, '[]') AS kategori
//     FROM datasetplants dp
//     LEFT JOIN plants p ON p.dataset_id = dp.id
//     LEFT JOIN (
//       SELECT
//         pc.plant_id,
//         json_agg(DISTINCT c.nama_kategori) AS kategori
//       FROM plantcategory pc
//       JOIN categories c ON pc.category_id = c.id
//       GROUP BY pc.plant_id
//     ) k ON p.id = k.plant_id
//     WHERE p.id = $1  -- Menambahkan kondisi WHERE untuk mencari berdasarkan plant_id
//     ORDER BY dp.nama_tumbuhan, p.id;
//   `;
//   const result = await pool.query(query, [id]);
//   return result.rows;
// };

const updatePlant = async (id, { nama_indonesia, deskripsi, category_ids }) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Update nama_indonesia & deskripsi di tabel plants
    await client.query(`UPDATE plants SET nama_indonesia = $1, deskripsi = $2 WHERE id = $3`, [
      nama_indonesia,
      deskripsi,
      id,
    ]);

    // Hapus kategori lama dari relasi plantcategory
    await client.query(`DELETE FROM plantcategory WHERE plant_id = $1`, [id]);

    // Insert kategori baru
    if (Array.isArray(category_ids) && category_ids.length > 0) {
      const insertQuery = `
        INSERT INTO plantcategory (plant_id, category_id)
        VALUES ${category_ids.map((_, i) => `($1, $${i + 2})`).join(", ")}
      `;
      await client.query(insertQuery, [id, ...category_ids]);
    }

    await client.query("COMMIT");
    return { success: true };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

// Add
const addPlant = async ({ dataset_id, nama_indonesia, deskripsi, category_ids }) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Insert ke tabel plants
    const insertPlantQuery = `
      INSERT INTO plants (dataset_id, nama_indonesia, deskripsi)
      VALUES ($1, $2, $3)
      RETURNING id
    `;
    const { rows } = await client.query(insertPlantQuery, [dataset_id, nama_indonesia, deskripsi]);
    const plantId = rows[0].id;

    // 2. Insert ke tabel plantcategory
    if (category_ids && category_ids.length > 0) {
      const insertCategoryQuery = `
        INSERT INTO plantcategory (plant_id, category_id)
        VALUES ${category_ids.map((_, i) => `($1, $${i + 2})`).join(", ")}
      `;
      await client.query(insertCategoryQuery, [plantId, ...category_ids]);
    }

    await client.query("COMMIT");
    return { success: true, plantId };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

module.exports = {
  getAllPlants,
  getPlantById,
  addPlant,
  updatePlant,
};
