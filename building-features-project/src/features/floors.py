class Floors:
    def __init__(self, above_ground_floors, basement_floors):
        self.above_ground_floors = above_ground_floors
        self.basement_floors = basement_floors

    def total_floors(self):
        return self.above_ground_floors + self.basement_floors

    def __str__(self):
        return f"Above Ground Floors: {self.above_ground_floors}, Basement Floors: {self.basement_floors}"