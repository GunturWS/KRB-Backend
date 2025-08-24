const db = require("./db");

const adminaddManualPlant = async ({
  nama_indonesia,
  deskripsi,
  image_path,
  source,
  nama_tumbuhan,
  category_ids,
}) => {
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

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    const insertPlantQuery = `
INSERT INTO manualplants (id, nama_indonesia, deskripsi, image_path, source, nama_tumbuhan)
VALUES (
    (SELECT COALESCE(MAX(id), 0) + 1 
     FROM (
         SELECT id FROM plants
         UNION ALL
         SELECT id FROM manualplants
     ) AS all_plants),
    $1, $2, $3, $4, $5
)
RETURNING id;


    `;
    const { rows } = await client.query(insertPlantQuery, [
      nama_indonesia,
      deskripsi,
      image_path,
      source,
      nama_tumbuhan,
    ]);
    const manualPlantId = rows[0].id;

    if (category_ids && category_ids.length > 0) {
      const insertCategoryQuery = `
        INSERT INTO manualplantcategory (manualplant_id, category_id)
        VALUES ${category_ids.map((_, i) => `($1, $${i + 2})`).join(", ")}
      `;
      await client.query(insertCategoryQuery, [manualPlantId, ...category_ids]);
    }

    // ambil max id dari plants untuk hitung display_id
    const maxRes = await client.query(`SELECT COALESCE(MAX(id),0)::bigint AS max_id FROM plants`);
    const maxId = Number(maxRes.rows[0].max_id || 0);
    const displayId = Number(manualPlantId) + maxId;

    await client.query("COMMIT");
    return { success: true, id: manualPlantId, display_id: displayId };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

const admingetAllPlants = async () => {
  const query = `
    WITH
    -- 1) pilih 1 plant representative per nama_tumbuhan di datasetplants (maks 52)
    rep AS (
      SELECT DISTINCT ON (dp.nama_tumbuhan)
        p.id AS plant_id,
        dp.id AS dataset_id,
        dp.nama_tumbuhan
      FROM plants p
      JOIN datasetplants dp ON p.dataset_id = dp.id
      ORDER BY dp.nama_tumbuhan, p.id
      LIMIT 52
    ),

    dataset_sample AS (
      SELECT
        p.id::bigint AS id,
        COALESCE(p.nama_indonesia, '')::text AS nama_indonesia,
        COALESCE(p.deskripsi, '')::text AS deskripsi,
        COALESCE(p.image_path, dp.image_path)::text AS image_path,
        COALESCE(p.source, '')::text AS source,
        COALESCE(p.nama_tumbuhan, dp.nama_tumbuhan)::text AS nama_tumbuhan,
        dp.id::bigint AS dataset_id,
        COALESCE(ARRAY_AGG(DISTINCT c.nama_kategori) FILTER (WHERE c.nama_kategori IS NOT NULL), ARRAY[]::text[]) AS categories,
        dp.nama_tumbuhan::text AS dataset_name,
        false AS is_manual
      FROM rep r
      JOIN plants p ON p.id = r.plant_id
      LEFT JOIN datasetplants dp ON p.dataset_id = dp.id
      LEFT JOIN plantcategory pc ON p.id = pc.plant_id
      LEFT JOIN categories c ON pc.category_id = c.id
      GROUP BY p.id, dp.id, dp.nama_tumbuhan, dp.image_path
    ),

    -- plants yang tidak punya dataset_id (non-dataset)
    plants_null AS (
      SELECT
        p.id::bigint AS id,
        p.nama_indonesia::text AS nama_indonesia,
        p.deskripsi::text AS deskripsi,
        p.image_path::text AS image_path,
        COALESCE(p.source, '')::text AS source,
        COALESCE(p.nama_tumbuhan, '')::text AS nama_tumbuhan,
        NULL::bigint AS dataset_id,
        COALESCE(ARRAY_AGG(DISTINCT c.nama_kategori) FILTER (WHERE c.nama_kategori IS NOT NULL), ARRAY[]::text[]) AS categories,
        NULL::text AS dataset_name,
        false AS is_manual
      FROM plants p
      LEFT JOIN plantcategory pc ON p.id = pc.plant_id
      LEFT JOIN categories c ON pc.category_id = c.id
      WHERE p.dataset_id IS NULL
      GROUP BY p.id
    ),

    -- semua manualplants
    manual_all AS (
      SELECT
        mp.id::bigint AS id,
        mp.nama_indonesia::text AS nama_indonesia,
        mp.deskripsi::text AS deskripsi,
        mp.image_path::text AS image_path,
        COALESCE(mp.source, '')::text AS source,
        COALESCE(mp.nama_tumbuhan, '')::text AS nama_tumbuhan,
        NULL::bigint AS dataset_id,
        COALESCE(ARRAY_AGG(DISTINCT c.nama_kategori) FILTER (WHERE c.nama_kategori IS NOT NULL), ARRAY[]::text[]) AS categories,
        NULL::text AS dataset_name,
        true AS is_manual
      FROM manualplants mp
      LEFT JOIN manualplantcategory mpc ON mp.id = mpc.manualplant_id
      LEFT JOIN categories c ON mpc.category_id = c.id
      GROUP BY mp.id
    )

    -- gabungkan hasil: dataset_sample (52 jenis berbeda) + plants_null + manual_all
    SELECT * FROM dataset_sample
    UNION ALL
    SELECT * FROM plants_null
    UNION ALL
    SELECT * FROM manual_all
    ORDER BY id;
  `;

  const { rows } = await db.query(query);
  return rows;
};

const admingetPlantById = async (displayId) => {
  const id = Number(displayId);
  if (Number.isNaN(id)) return null;

  // Cek di plants dulu
  const qPlants = `
    SELECT
      p.id::bigint AS id,
      COALESCE(p.nama_indonesia, '')::text AS nama_indonesia,
      COALESCE(p.deskripsi, '')::text AS deskripsi,
      COALESCE(p.image_path, dp.image_path)::text AS image_path,
      COALESCE(p.source, '')::text AS source,
      COALESCE(p.nama_tumbuhan, dp.nama_tumbuhan)::text AS nama_tumbuhan,
      p.dataset_id::bigint AS dataset_id,
      COALESCE(ARRAY_AGG(DISTINCT c.nama_kategori) FILTER (WHERE c.nama_kategori IS NOT NULL), ARRAY[]::text[]) AS categories,
      dp.nama_tumbuhan::text AS dataset_name,
      false AS is_manual
    FROM plants p
    LEFT JOIN datasetplants dp ON p.dataset_id = dp.id
    LEFT JOIN plantcategory pc ON p.id = pc.plant_id
    LEFT JOIN categories c ON pc.category_id = c.id
    WHERE p.id = $1
    GROUP BY p.id, dp.id, dp.nama_tumbuhan, dp.image_path
    LIMIT 1;
  `;
  const plantsRes = await db.query(qPlants, [id]);
  if (plantsRes.rows.length) return plantsRes.rows[0];

  // Kalau tidak ketemu di plants → cek manualplants
  const qManual = `
    SELECT
      mp.id::bigint AS id,
      mp.nama_indonesia::text AS nama_indonesia,
      mp.deskripsi::text AS deskripsi,
      mp.image_path::text AS image_path,
      COALESCE(mp.source, '')::text AS source,
      COALESCE(mp.nama_tumbuhan, '')::text AS nama_tumbuhan,
      NULL::bigint AS dataset_id,
      COALESCE(ARRAY_AGG(DISTINCT c.nama_kategori) FILTER (WHERE c.nama_kategori IS NOT NULL), ARRAY[]::text[]) AS categories,
      NULL::text AS dataset_name,
      true AS is_manual
    FROM manualplants mp
    LEFT JOIN manualplantcategory mpc ON mp.id = mpc.manualplant_id
    LEFT JOIN categories c ON mpc.category_id = c.id
    WHERE mp.id = $1
    GROUP BY mp.id
    LIMIT 1;
  `;
  const manualRes = await db.query(qManual, [id]);
  return manualRes.rows[0] || null;
};

const adminUpdatePlant = async ({
  id,
  nama_indonesia,
  deskripsi,
  image_path,
  source,
  nama_tumbuhan,
  category_ids,
}) => {
  // pastikan category_ids jadi array
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

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    // Update data manual plant
    const updatePlantQuery = `
      UPDATE manualplants
      SET nama_indonesia = $1,
          deskripsi = $2,
          image_path = $3,
          source = $4,
          nama_tumbuhan = $5
      WHERE id = $6
      RETURNING id
    `;
    const { rows } = await client.query(updatePlantQuery, [
      nama_indonesia,
      deskripsi,
      image_path,
      source,
      nama_tumbuhan,
      id,
    ]);

    // Update kategori
    if (category_ids && category_ids.length > 0) {
      await client.query(`DELETE FROM manualplantcategory WHERE manualplant_id = $1`, [id]);

      const insertCategoryQuery = `
        INSERT INTO manualplantcategory (manualplant_id, category_id)
        VALUES ${category_ids.map((_, i) => `($1, $${i + 2})`).join(", ")}
      `;
      await client.query(insertCategoryQuery, [id, ...category_ids]);
    }

    await client.query("COMMIT");

    return { success: true, id: rows[0].id };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

const admindeletePlant = async (id) => {
  // hapus dari plants
  const plantDel = await db.query(`DELETE FROM plantcategory WHERE plant_id = $1`, [id]);
  const resultPlant = await db.query(`DELETE FROM plants WHERE id = $1`, [id]);

  if (resultPlant.rowCount > 0) {
    return true;
  }

  // hapus dari manualplants
  await db.query(`DELETE FROM manualplantcategory WHERE manualplant_id = $1`, [id]);
  const resultManual = await db.query(`DELETE FROM manualplants WHERE id = $1`, [id]);

  return resultManual.rowCount > 0;
};

module.exports = {
  adminaddManualPlant,
  admingetAllPlants,
  admingetPlantById,
  adminUpdatePlant,
  admindeletePlant,
};
