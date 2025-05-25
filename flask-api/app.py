from flask import Flask, request, jsonify
from torchvision import models, transforms
import torch
from PIL import Image
import os
import uuid
import psycopg2
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Folder untuk menyimpan gambar yang di-upload
UPLOAD_FOLDER = 'static/uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Konfigurasi koneksi PostgreSQL
conn = psycopg2.connect(
    dbname=os.getenv('DB_NAME'),
    user=os.getenv('DB_USER'),
    password=os.getenv('DB_PASSWORD'),
    host=os.getenv('DB_HOST'),
    port=os.getenv('DB_PORT')
)

cur = conn.cursor()

# Ambil semua nama_tumbuhan unik dan urutkan (berdasarkan nama folder training)
cur.execute("SELECT DISTINCT nama_tumbuhan FROM datasetplants ORDER BY nama_tumbuhan ASC")
class_names = [row[0] for row in cur.fetchall()]

# Load model
model = models.resnet50(weights=None)
num_classes = len(class_names)
model.fc = torch.nn.Linear(model.fc.in_features, num_classes)
model.load_state_dict(torch.load('model/resnet50_ZeroLayer.pth', map_location='cpu', weights_only=True))
model.eval()

# Preprocessing gambar
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                         std=[0.229, 0.224, 0.225])
])

@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400

    file = request.files['image']
    image_pil = Image.open(file).convert('RGB')

    # Transform gambar
    image_tensor = transform(image_pil).unsqueeze(0)

    # Simpan gambar ke folder uploads
    filename = f"{uuid.uuid4().hex}.jpg"
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    image_pil.save(filepath)

    # Prediksi kelas
    with torch.no_grad():
        output = model(image_tensor)
        _, predicted = torch.max(output, 1)
        class_id = predicted.item()

    # Ambil nama tumbuhan dari class_names
    if class_id < len(class_names):
        nama_tumbuhan = class_names[class_id]
    else:
        nama_tumbuhan = "Tidak ditemukan"

    # Ambil data dari datasetplants berdasarkan nama_tumbuhan
    cur.execute("""
        SELECT id, nama_tumbuhan 
        FROM datasetplants
        WHERE nama_tumbuhan = %s
        LIMIT 1
    """, (nama_tumbuhan,))
    dataset_row = cur.fetchone()

    if dataset_row:
        dataset_id = dataset_row[0]
        nama_tumbuhan_db = dataset_row[1]
    else:
        dataset_id = None
        nama_tumbuhan_db = nama_tumbuhan

    # URL gambar
    image_url = request.host_url + f'static/uploads/{filename}'

    return jsonify({
        'dataset_id': dataset_id,
        'nama_tumbuhan': nama_tumbuhan_db,
        'image_url': image_url
    })

if __name__ == '__main__':
    app.run(port=5000, debug=True)
