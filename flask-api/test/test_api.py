# import unittest
# from io import BytesIO
# from PIL import Image
# from app import app

# class PredictEndpointTestCase(unittest.TestCase):
#     def setUp(self):
#         self.client = app.test_client()

#     def test_predict_success(self):
#         # Buat gambar dummy untuk pengujian
#         img = Image.new('RGB', (224, 224), color='green')
#         img_bytes = BytesIO()
#         img.save(img_bytes, format='JPEG')
#         img_bytes.seek(0)

#         response = self.client.post('/predict', data={
#             'image': (img_bytes, 'dummy.jpg')
#         }, content_type='multipart/form-data')

#         self.assertEqual(response.status_code, 200)
#         data = response.get_json()
#         self.assertIn('dataset_id', data)
#         self.assertIn('nama_tumbuhan', data)
#         self.assertIn('image_url', data)

#     def test_predict_no_image(self):
#         response = self.client.post('/predict', data={}, content_type='multipart/form-data')
#         self.assertEqual(response.status_code, 400)
#         data = response.get_json()
#         self.assertEqual(data['error'], 'No image provided')

# if __name__ == '__main__':
#     unittest.main()


import unittest
from io import BytesIO
from PIL import Image
from unittest.mock import patch, MagicMock
import torch
from app import app

class TestPredictApi(unittest.TestCase):

    def setUp(self):
        self.client = app.test_client()

    @patch('app.cur')
    @patch('app.model')
    def test_predict_success_mock(self, mock_model, mock_cur):
        mock_model.return_value = torch.tensor([[10.0]])
        app.class_names = ['Daun Mangga']
        mock_cur.execute.return_value = None
        mock_cur.fetchone.return_value = (123, 'Daun Mangga')

        img = Image.new('RGB', (224, 224), color='green')
        img_bytes = BytesIO()
        img.save(img_bytes, format='JPEG')
        img_bytes.seek(0)

        response = self.client.post('/predict', data={
            'image': (img_bytes, 'dummy.jpg')
        }, content_type='multipart/form-data')

        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data['dataset_id'], 123)
        self.assertEqual(data['nama_tumbuhan'], 'Daun Mangga')
        self.assertIn('image_url', data)

if __name__ == '__main__':
    unittest.main()
