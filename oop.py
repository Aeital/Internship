# Defining a class
class Car:
    def __init__(self, brand, model):
        self.brand = brand    # Instance attribute
        self.model = model    # Instance attribute

    def drive(self):          # Instance method
        return f"The {self.brand} {self.model} is moving."

# Creating objects (Instantiation)
my_car = Car("Toyota", "Corolla")
print(my_car.drive())  # Output: The Toyota Corolla is moving.
