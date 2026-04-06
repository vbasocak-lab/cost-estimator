def calculate_surface_area(surface_shon_m2, surface_shab_m2):
    return {
        "surface_shon_m2": surface_shon_m2,
        "surface_shab_m2": surface_shab_m2,
        "total_surface_area": surface_shon_m2 + surface_shab_m2
    }

def get_surface_features(surface_shon_m2, surface_shab_m2):
    surface_features = calculate_surface_area(surface_shon_m2, surface_shab_m2)
    return surface_features