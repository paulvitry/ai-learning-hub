# Prototype Pattern

## Overview
The Prototype pattern creates new objects by cloning existing instances (prototypes) rather than creating new instances from scratch. It's useful when object creation is expensive or when you need to create many objects with similar properties.

## When to Use
- When creating objects is expensive (database queries, network calls, complex computations)
- When you need to avoid subclassing of object creators
- When you want to hide the complexity of creating new instances
- When objects have only a few different combinations of state
- When you need to create objects at runtime dynamically

## Structure
```
┌─────────────────┐
│     Client      │
└─────────────────┘
         │
         │ creates
         ▼
┌─────────────────┐
│    Prototype    │
├─────────────────┤
│ + clone()       │
└─────────────────┘
         △
         │
┌─────────────────┐
│ConcretePrototype│
├─────────────────┤
│ + clone()       │
│ - field1        │
│ - field2        │
└─────────────────┘
```

## Implementation Examples

### JavaScript/TypeScript
```javascript
// Prototype interface
interface Cloneable {
  clone(): Cloneable;
}

// Abstract prototype
abstract class Shape implements Cloneable {
  public x: number = 0;
  public y: number = 0;
  public color: string = '';

  constructor(source?: Shape) {
    if (source) {
      this.x = source.x;
      this.y = source.y;
      this.color = source.color;
    }
  }

  abstract clone(): Shape;
  abstract draw(): string;
}

// Concrete prototypes
class Circle extends Shape {
  public radius: number = 0;

  constructor(source?: Circle) {
    super(source);
    if (source) {
      this.radius = source.radius;
    }
  }

  clone(): Circle {
    return new Circle(this);
  }

  draw(): string {
    return `Circle at (${this.x}, ${this.y}) with radius ${this.radius} and color ${this.color}`;
  }
}

class Rectangle extends Shape {
  public width: number = 0;
  public height: number = 0;

  constructor(source?: Rectangle) {
    super(source);
    if (source) {
      this.width = source.width;
      this.height = source.height;
    }
  }

  clone(): Rectangle {
    return new Rectangle(this);
  }

  draw(): string {
    return `Rectangle at (${this.x}, ${this.y}) with dimensions ${this.width}x${this.height} and color ${this.color}`;
  }
}

// Prototype registry (optional)
class ShapeRegistry {
  private shapes: Map<string, Shape> = new Map();

  addShape(key: string, shape: Shape): void {
    this.shapes.set(key, shape);
  }

  getShape(key: string): Shape | undefined {
    const shape = this.shapes.get(key);
    return shape ? shape.clone() : undefined;
  }
}

// Usage
const originalCircle = new Circle();
originalCircle.x = 10;
originalCircle.y = 20;
originalCircle.radius = 5;
originalCircle.color = 'red';

const clonedCircle = originalCircle.clone();
clonedCircle.x = 30; // Modify clone without affecting original

console.log(originalCircle.draw());
console.log(clonedCircle.draw());

// Using registry
const registry = new ShapeRegistry();
registry.addShape('redCircle', originalCircle);

const anotherCircle = registry.getShape('redCircle');
console.log(anotherCircle?.draw());
```

### Python
```python
import copy
from abc import ABC, abstractmethod

# Prototype interface
class Prototype(ABC):
    @abstractmethod
    def clone(self):
        pass

# Concrete prototype
class Document(Prototype):
    def __init__(self, title="", content="", author=""):
        self.title = title
        self.content = content
        self.author = author
        self.created_at = None
        self.metadata = {}
    
    def clone(self):
        # Deep copy to ensure complete independence
        return copy.deepcopy(self)
    
    def __str__(self):
        return f"Document: {self.title} by {self.author}"

class Report(Document):
    def __init__(self, title="", content="", author="", report_type=""):
        super().__init__(title, content, author)
        self.report_type = report_type
        self.charts = []
        self.data_sources = []
    
    def clone(self):
        return copy.deepcopy(self)
    
    def add_chart(self, chart):
        self.charts.append(chart)
    
    def __str__(self):
        return f"Report: {self.title} ({self.report_type}) by {self.author}"

# Document factory using prototypes
class DocumentFactory:
    def __init__(self):
        self._prototypes = {}
    
    def register_prototype(self, name, prototype):
        self._prototypes[name] = prototype
    
    def create_document(self, name):
        prototype = self._prototypes.get(name)
        if prototype:
            return prototype.clone()
        return None

# Usage
# Create prototype templates
basic_doc = Document("Template Document", "Default content", "System")
monthly_report = Report("Monthly Report", "Monthly analysis", "Admin", "financial")
monthly_report.add_chart("Revenue Chart")

# Register prototypes
factory = DocumentFactory()
factory.register_prototype("basic", basic_doc)
factory.register_prototype("monthly", monthly_report)

# Create new documents from prototypes
doc1 = factory.create_document("basic")
doc1.title = "My Document"
doc1.author = "John Doe"

doc2 = factory.create_document("monthly")
doc2.title = "January Report"
doc2.author = "Jane Smith"

print(doc1)
print(doc2)
```

### Java
```java
// Prototype interface
interface Prototype {
    Prototype clone();
}

// Abstract prototype
abstract class Vehicle implements Prototype {
    protected String brand;
    protected String model;
    protected String color;
    protected int year;
    
    public Vehicle() {}
    
    public Vehicle(Vehicle source) {
        if (source != null) {
            this.brand = source.brand;
            this.model = source.model;
            this.color = source.color;
            this.year = source.year;
        }
    }
    
    public abstract Vehicle clone();
    
    @Override
    public String toString() {
        return String.format("%s %s %s (%d)", color, brand, model, year);
    }
}

// Concrete prototypes
class Car extends Vehicle {
    private int doors;
    private String transmission;
    
    public Car() {
        super();
    }
    
    public Car(Car source) {
        super(source);
        if (source != null) {
            this.doors = source.doors;
            this.transmission = source.transmission;
        }
    }
    
    @Override
    public Car clone() {
        return new Car(this);
    }
    
    public void setDoors(int doors) {
        this.doors = doors;
    }
    
    public void setTransmission(String transmission) {
        this.transmission = transmission;
    }
    
    @Override
    public String toString() {
        return super.toString() + String.format(" - %d doors, %s", doors, transmission);
    }
}

class Motorcycle extends Vehicle {
    private int engineCapacity;
    private boolean hasSidecar;
    
    public Motorcycle() {
        super();
    }
    
    public Motorcycle(Motorcycle source) {
        super(source);
        if (source != null) {
            this.engineCapacity = source.engineCapacity;
            this.hasSidecar = source.hasSidecar;
        }
    }
    
    @Override
    public Motorcycle clone() {
        return new Motorcycle(this);
    }
    
    public void setEngineCapacity(int engineCapacity) {
        this.engineCapacity = engineCapacity;
    }
    
    public void setHasSidecar(boolean hasSidecar) {
        this.hasSidecar = hasSidecar;
    }
    
    @Override
    public String toString() {
        return super.toString() + String.format(" - %dcc%s", engineCapacity, hasSidecar ? ", with sidecar" : "");
    }
}

// Vehicle registry
class VehicleRegistry {
    private Map<String, Vehicle> vehicles = new HashMap<>();
    
    public void addVehicle(String key, Vehicle vehicle) {
        vehicles.put(key, vehicle);
    }
    
    public Vehicle getVehicle(String key) {
        Vehicle vehicle = vehicles.get(key);
        return vehicle != null ? vehicle.clone() : null;
    }
}
```

## Shallow vs Deep Copy

### Shallow Copy
```javascript
class Person {
  constructor(public name: string, public address: Address) {}

  // Shallow copy - only copies references
  clone(): Person {
    return new Person(this.name, this.address);
  }
}

class Address {
  constructor(public street: string, public city: string) {}
}

const original = new Person("John", new Address("123 Main St", "Anytown"));
const copy = original.clone();

// Modifying the address affects both original and copy
copy.address.street = "456 Oak St";
console.log(original.address.street); // "456 Oak St" - affected!
```

### Deep Copy
```javascript
class Person {
  constructor(public name: string, public address: Address) {}

  // Deep copy - creates new instances of nested objects
  clone(): Person {
    return new Person(
      this.name,
      new Address(this.address.street, this.address.city)
    );
  }
}

const original = new Person("John", new Address("123 Main St", "Anytown"));
const copy = original.clone();

// Modifying the address only affects the copy
copy.address.street = "456 Oak St";
console.log(original.address.street); // "123 Main St" - not affected
```

## Prototype Registry Pattern
```javascript
class PrototypeRegistry<T extends { clone(): T }> {
  private prototypes: Map<string, T> = new Map();

  register(key: string, prototype: T): void {
    this.prototypes.set(key, prototype);
  }

  unregister(key: string): void {
    this.prototypes.delete(key);
  }

  create(key: string): T | undefined {
    const prototype = this.prototypes.get(key);
    return prototype ? prototype.clone() : undefined;
  }

  list(): string[] {
    return Array.from(this.prototypes.keys());
  }
}

// Usage
const shapeRegistry = new PrototypeRegistry<Shape>();

const redCircle = new Circle();
redCircle.color = 'red';
redCircle.radius = 10;

const blueRectangle = new Rectangle();
blueRectangle.color = 'blue';
blueRectangle.width = 20;
blueRectangle.height = 30;

shapeRegistry.register('redCircle', redCircle);
shapeRegistry.register('blueRectangle', blueRectangle);

// Create new instances from prototypes
const circle1 = shapeRegistry.create('redCircle');
const circle2 = shapeRegistry.create('redCircle');
const rectangle1 = shapeRegistry.create('blueRectangle');
```

## Pros and Cons

### Advantages
- Reduces the need for subclassing
- Hides complexity of object creation from clients
- Allows adding and removing products at runtime
- Often more efficient than creating objects from scratch
- Allows creating objects without coupling to specific classes

### Disadvantages
- Can be difficult to implement if objects have circular references
- Cloning complex objects with nested objects can be tricky
- Requires implementing clone method for each concrete prototype
- Deep copying can be expensive

## Real-World Examples

### Configuration Templates
```javascript
class DatabaseConfig implements Cloneable {
  constructor(
    public host: string = 'localhost',
    public port: number = 5432,
    public database: string = '',
    public username: string = '',
    public password: string = '',
    public ssl: boolean = false,
    public connectionPool: { min: number; max: number } = { min: 1, max: 10 }
  ) {}

  clone(): DatabaseConfig {
    return new DatabaseConfig(
      this.host,
      this.port,
      this.database,
      this.username,
      this.password,
      this.ssl,
      { ...this.connectionPool }
    );
  }
}

// Create base configurations
const productionConfig = new DatabaseConfig(
  'prod-db.company.com',
  5432,
  'production',
  'prod_user',
  'secure_password',
  true,
  { min: 5, max: 50 }
);

const developmentConfig = productionConfig.clone();
developmentConfig.host = 'dev-db.company.com';
developmentConfig.database = 'development';
developmentConfig.username = 'dev_user';
developmentConfig.ssl = false;

const testConfig = developmentConfig.clone();
testConfig.database = 'test';
testConfig.connectionPool = { min: 1, max: 5 };
```

### Game Objects
```javascript
class Enemy implements Cloneable {
  constructor(
    public name: string = '',
    public health: number = 100,
    public attack: number = 10,
    public defense: number = 5,
    public abilities: string[] = [],
    public position: { x: number; y: number } = { x: 0, y: 0 }
  ) {}

  clone(): Enemy {
    return new Enemy(
      this.name,
      this.health,
      this.attack,
      this.defense,
      [...this.abilities],
      { ...this.position }
    );
  }

  spawn(x: number, y: number): Enemy {
    const clone = this.clone();
    clone.position = { x, y };
    return clone;
  }
}

// Create enemy templates
const goblinTemplate = new Enemy(
  'Goblin',
  50,
  8,
  3,
  ['quick_attack'],
  { x: 0, y: 0 }
);

const orcTemplate = new Enemy(
  'Orc',
  120,
  15,
  8,
  ['heavy_strike', 'rage'],
  { x: 0, y: 0 }
);

// Spawn enemies at different positions
const goblin1 = goblinTemplate.spawn(10, 20);
const goblin2 = goblinTemplate.spawn(15, 25);
const orc1 = orcTemplate.spawn(30, 40);
```

### UI Components
```javascript
class UIComponent implements Cloneable {
  constructor(
    public type: string = '',
    public properties: Record<string, any> = {},
    public styles: Record<string, any> = {},
    public children: UIComponent[] = []
  ) {}

  clone(): UIComponent {
    return new UIComponent(
      this.type,
      { ...this.properties },
      { ...this.styles },
      this.children.map(child => child.clone())
    );
  }
}

// Create component templates
const buttonTemplate = new UIComponent(
  'button',
  { text: 'Click Me', disabled: false },
  { backgroundColor: '#007bff', color: 'white', padding: '10px 20px' }
);

const primaryButton = buttonTemplate.clone();
primaryButton.properties.text = 'Primary Action';

const secondaryButton = buttonTemplate.clone();
secondaryButton.properties.text = 'Secondary Action';
secondaryButton.styles.backgroundColor = '#6c757d';

const dangerButton = buttonTemplate.clone();
dangerButton.properties.text = 'Delete';
dangerButton.styles.backgroundColor = '#dc3545';
```

## Common Use Cases
- Object pools and caching
- Configuration templates
- Default object creation
- Game object spawning
- UI component templates
- Document templates
- Database record templates
- Complex object initialization