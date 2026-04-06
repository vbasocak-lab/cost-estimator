import unittest
from src.features.surface import calculate_surface_area, calculate_surface_ratio

class TestSurfaceFeatures(unittest.TestCase):

    def test_calculate_surface_area(self):
        # Test case for surface area calculation
        shon_m2 = 100
        shab_m2 = 80
        expected_area = shon_m2 + shab_m2
        self.assertEqual(calculate_surface_area(shon_m2, shab_m2), expected_area)

    def test_calculate_surface_ratio(self):
        # Test case for surface ratio calculation
        shon_m2 = 100
        shab_m2 = 80
        expected_ratio = shon_m2 / shab_m2
        self.assertEqual(calculate_surface_ratio(shon_m2, shab_m2), expected_ratio)

if __name__ == '__main__':
    unittest.main()