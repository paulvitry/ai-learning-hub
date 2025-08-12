# Factory Method Pattern

## Overview
The Factory Method pattern provides an interface for creating objects in a superclass, but allows subclasses to alter the type of objects that will be created. Instead of calling a constructor directly, you call a factory method.

## When to Use
- When you don't know the exact types of objects your code will work with
- When you want to provide users of your library/framework with a way to extend internal components
- When you want to save system resources by reusing existing objects instead of rebuilding them

## Structure
```
    ┌─────────────────┐
    │    Creator      │
    ├─────────────────┤
    │ + factoryMethod()│──────┐
    │ + operation()   │      │
    └─────────────────┘      │ creates
             △               │
             │               ▼
    ┌─────────────────┐  ┌─────────────────┐
    │ ConcreteCreator │  │    Product      │
    ├─────────────────┤  └─────────────────┘
    │ + factoryMethod()│           △
    └─────────────────┘           │
                              ┌─────────────────┐
                              │ ConcreteProduct │
                              └─────────────────┘
```

## Implementation Examples

### JavaScript/TypeScript
```javascript
// Product interface
interface Vehicle {
  start(): string;
  stop(): string;
}

// Concrete products
class Car implements Vehicle {
  start(): string {
    return "Car engine started";
  }
  
  stop(): string {
    return "Car engine stopped";
  }
}

class Motorcycle implements Vehicle {
  start(): string {
    return "Motorcycle engine started";
  }
  
  stop(): string {
    return "Motorcycle engine stopped";
  }
}

// Creator
abstract class VehicleFactory {
  // Factory method
  abstract createVehicle(): Vehicle;
  
  // Template method using factory method
  public startJourney(): string {
    const vehicle = this.createVehicle();
    return vehicle.start();
  }
}

// Concrete creators
class CarFactory extends VehicleFactory {
  createVehicle(): Vehicle {
    return new Car();
  }
}

class MotorcycleFactory extends VehicleFactory {
  createVehicle(): Vehicle {
    return new Motorcycle();
  }
}

// Usage
function clientCode(factory: VehicleFactory) {
  console.log(factory.startJourney());
}

clientCode(new CarFactory()); // "Car engine started"
clientCode(new MotorcycleFactory()); // "Motorcycle engine started"
```

### Python
```python
from abc import ABC, abstractmethod

# Product interface
class Animal(ABC):
    @abstractmethod
    def make_sound(self):
        pass

# Concrete products
class Dog(Animal):
    def make_sound(self):
        return "Woof!"

class Cat(Animal):
    def make_sound(self):
        return "Meow!"

# Creator
class AnimalFactory(ABC):
    @abstractmethod
    def create_animal(self) -> Animal:
        pass
    
    def get_animal_sound(self) -> str:
        animal = self.create_animal()
        return animal.make_sound()

# Concrete creators
class DogFactory(AnimalFactory):
    def create_animal(self) -> Animal:
        return Dog()

class CatFactory(AnimalFactory):
    def create_animal(self) -> Animal:
        return Cat()

# Usage
def client_code(factory: AnimalFactory):
    print(factory.get_animal_sound())

client_code(DogFactory())  # "Woof!"
client_code(CatFactory())  # "Meow!"
```

### Java
```java
// Product interface
interface Document {
    void open();
    void close();
}

// Concrete products
class PDFDocument implements Document {
    public void open() {
        System.out.println("Opening PDF document");
    }
    
    public void close() {
        System.out.println("Closing PDF document");
    }
}

class WordDocument implements Document {
    public void open() {
        System.out.println("Opening Word document");
    }
    
    public void close() {
        System.out.println("Closing Word document");
    }
}

// Creator
abstract class DocumentCreator {
    // Factory method
    abstract Document createDocument();
    
    // Template method
    public void processDocument() {
        Document doc = createDocument();
        doc.open();
        // Process document...
        doc.close();
    }
}

// Concrete creators
class PDFCreator extends DocumentCreator {
    Document createDocument() {
        return new PDFDocument();
    }
}

class WordCreator extends DocumentCreator {
    Document createDocument() {
        return new WordDocument();
    }
}
```

## Simple Factory vs Factory Method

### Simple Factory (Not a Design Pattern)
```javascript
class SimpleVehicleFactory {
  static createVehicle(type: string): Vehicle {
    switch (type) {
      case 'car':
        return new Car();
      case 'motorcycle':
        return new Motorcycle();
      default:
        throw new Error('Unknown vehicle type');
    }
  }
}

// Usage
const car = SimpleVehicleFactory.createVehicle('car');
```

### Factory Method Advantage
The Factory Method pattern is more flexible because:
- New product types can be added by creating new creator subclasses
- No need to modify existing code (Open/Closed Principle)
- Each creator can have its own logic for object creation

## Pros and Cons

### Advantages
- Eliminates tight coupling between creator and concrete products
- Single Responsibility Principle: creation code in one place
- Open/Closed Principle: new products without changing existing code
- Provides hooks for subclasses

### Disadvantages
- Code may become more complicated due to many subclasses
- Requires creating a creator hierarchy parallel to the product hierarchy

## Real-World Examples

### UI Components
```javascript
abstract class ButtonFactory {
  abstract createButton(): Button;
  
  renderUI() {
    const button = this.createButton();
    return button.render();
  }
}

class WindowsButtonFactory extends ButtonFactory {
  createButton(): Button {
    return new WindowsButton();
  }
}

class MacButtonFactory extends ButtonFactory {
  createButton(): Button {
    return new MacButton();
  }
}
```

### Database Connections
```javascript
abstract class DatabaseFactory {
  abstract createConnection(): DatabaseConnection;
  
  connectAndExecute(query: string) {
    const connection = this.createConnection();
    connection.connect();
    const result = connection.execute(query);
    connection.close();
    return result;
  }
}

class MySQLFactory extends DatabaseFactory {
  createConnection(): DatabaseConnection {
    return new MySQLConnection();
  }
}

class PostgreSQLFactory extends DatabaseFactory {
  createConnection(): DatabaseConnection {
    return new PostgreSQLConnection();
  }
}
```

## Common Use Cases
- Cross-platform applications (different UI elements per platform)
- Plugin architectures
- Database abstraction layers
- Parsers for different file formats
- Network protocol handlers
- Game object creation systems