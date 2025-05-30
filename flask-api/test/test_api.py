import io
import unittest
from PIL import Image
from app import app

class FlaskTestCase(unittest.TestCase):
    def setUp(self):
        app.config['TESTING'] = True
        self.client = app.test_client()

    def generate_test_image(self):
        image = Image.new('RGB', (224, 224), color='blue')
        img_bytes = io.BytesIO()
        image.save(img_bytes, format='JPEG')
        img_bytes.seek(0)
        return img_bytes

    def test_predict_with_image(self):
        image_data = self.generate_test_image()
        response = self.client.post('/predict', content_type='multipart/form-data', data={
            'image': (image_data, 'test.jpg')
        })

        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn('dataset_id', data)
        self.assertIn('nama_tumbuhan', data)
        self.assertIn('image_url', data)

    def test_predict_without_image(self):
        response = self.client.post('/predict', content_type='multipart/form-data', data={})
        self.assertEqual(response.status_code, 400)
        data = response.get_json()
        self.assertIn('error', data)
        self.assertEqual(data['error'], 'No image provided')

if __name__ == '__main__':
    unittest.main()
