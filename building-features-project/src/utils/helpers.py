def calculate_surface_area(length, width):
    return length * width

def calculate_volume(length, width, height):
    return length * width * height

def format_feature_value(value):
    return f"{value:.2f}"

def validate_positive(value):
    if value < 0:
        raise ValueError("Value must be positive.")
    return value

def convert_to_square_meters(value, conversion_factor):
    return value * conversion_factor