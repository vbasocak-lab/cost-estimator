import unittest
from src.features.roof import Roof

class TestRoof(unittest.TestCase):

    def setUp(self):
        self.roof = Roof()

    def test_roof_type(self):
        self.roof.roof_type = 'Flat'
        self.assertEqual(self.roof.roof_type, 'Flat')

    def test_invalid_roof_type(self):
        with self.assertRaises(ValueError):
            self.roof.roof_type = 'InvalidType'

if __name__ == '__main__':
    unittest.main()