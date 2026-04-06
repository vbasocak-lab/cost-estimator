class Building:
    def __init__(self, surface_shon_m2, surface_shab_m2, above_ground_floors, basement_floors, facade_complexity, roof_type):
        self.surface_shon_m2 = surface_shon_m2
        self.surface_shab_m2 = surface_shab_m2
        self.above_ground_floors = above_ground_floors
        self.basement_floors = basement_floors
        self.facade_complexity = facade_complexity
        self.roof_type = roof_type

    def total_floors(self):
        return self.above_ground_floors + self.basement_floors

    def surface_area_ratio(self):
        if self.surface_shab_m2 > 0:
            return self.surface_shon_m2 / self.surface_shab_m2
        return None

    def describe_building(self):
        return (f"Building with {self.total_floors()} total floors, "
                f"facade complexity of {self.facade_complexity}, "
                f"and roof type '{self.roof_type}'.")