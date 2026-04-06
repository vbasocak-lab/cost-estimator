class Facade:
    def __init__(self, complexity):
        self.complexity = complexity

    def get_complexity(self):
        return self.complexity

    def set_complexity(self, complexity):
        self.complexity = complexity

    def describe(self):
        return f"The facade has a complexity level of {self.complexity}."