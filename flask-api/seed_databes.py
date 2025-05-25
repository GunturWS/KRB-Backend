import os
import psycopg2

# Konfigurasi koneksi database
conn = psycopg2.connect(
    dbname='KRB',
    user='postgres',
    password='969696',
    host='localhost',
    port='5432'
)
cur = conn.cursor()

# Buat tabel datasetplants jika belum ada
cur.execute("""
    CREATE TABLE IF NOT EXISTS datasetplants (
        id SERIAL PRIMARY KEY,
        nama_tumbuhan VARCHAR(255) NOT NULL,
        image_path TEXT NOT NULL UNIQUE
    );
""")

# Path ke folder dataset
dataset_path = 'dataset/train'

# Iterasi setiap folder (kelas tumbuhan)
for class_folder in os.listdir(dataset_path):
    class_path = os.path.join(dataset_path, class_folder)
    if os.path.isdir(class_path):
        for image_file in os.listdir(class_path):
            image_path = os.path.join(class_path, image_file)
            relative_path = image_path.replace("\\", "/")  # agar path aman di semua OS

            try:
                # Cek apakah data sudah ada
                cur.execute("SELECT id FROM datasetplants WHERE image_path = %s", (relative_path,))
                existing = cur.fetchone()

                if existing:
                    print(f"ℹ️  Data sudah ada (ID: {existing[0]}): {relative_path}")
                else:
                    # Insert dan kembalikan ID
                    cur.execute("""
                        INSERT INTO datasetplants (nama_tumbuhan, image_path)
                        VALUES (%s, %s)
                        RETURNING id;
                    """, (class_folder, relative_path))
                    new_id = cur.fetchone()[0]
                    print(f"✅ Berhasil memasukkan (ID: {new_id}): {relative_path}")

            except Exception as e:
                print(f"❌ Gagal memasukkan {relative_path}: {e}")

conn.commit()
cur.close()
conn.close()
print("🎉 Semua data berhasil diperiksa dan dimasukkan ke database.")
