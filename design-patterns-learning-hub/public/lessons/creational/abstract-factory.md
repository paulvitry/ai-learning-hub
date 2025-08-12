# Abstract Factory Pattern

## Overview
The Abstract Factory pattern provides an interface for creating families of related or dependent objects without specifying their concrete classes. It's like a factory of factories, where each factory specializes in creating a particular family of products.

## When to Use
- When you need to create families of related products
- When you want to ensure that products from the same family are used together
- When you want to provide a class library and reveal only interfaces, not implementations
- When the system should be independent of how products are created and represented

## Structure
```
┌─────────────────────┐
│   AbstractFactory   │
├─────────────────────┤
│ + createProductA()  │
│ + createProductB()  │
└─────────────────────┘
          △
          │
┌─────────────────────┐
│  ConcreteFactory1   │ ──┐
├─────────────────────┤   │ creates
│ + createProductA()  │   │
│ + createProductB()  │   │
└─────────────────────┘   │
                          │
┌─────────────────────┐   │
│  ConcreteFactory2   │ ──┤
├─────────────────────┤   │
│ + createProductA()  │   │
│ + createProductB()  │   │
└─────────────────────┘   │
                          ▼
                    ┌─────────────┐
                    │  ProductA   │
                    └─────────────┘
                          △
                          │
               ┌──────────┴──────────┐
               │                     │
     ┌─────────────────┐   ┌─────────────────┐
     │ ConcreteProductA1│   │ ConcreteProductA2│
     └─────────────────┘   └─────────────────┘
```

## Implementation Examples

### JavaScript/TypeScript
```javascript
// Abstract products
interface Button {
  render(): string;
  onClick(): void;
}

interface Checkbox {
  render(): string;
  toggle(): void;
}

// Windows family
class WindowsButton implements Button {
  render(): string {
    return "Rendering Windows button";
  }
  
  onClick(): void {
    console.log("Windows button clicked");
  }
}

class WindowsCheckbox implements Checkbox {
  render(): string {
    return "Rendering Windows checkbox";
  }
  
  toggle(): void {
    console.log("Windows checkbox toggled");
  }
}

// Mac family
class MacButton implements Button {
  render(): string {
    return "Rendering Mac button";
  }
  
  onClick(): void {
    console.log("Mac button clicked");
  }
}

class MacCheckbox implements Checkbox {
  render(): string {
    return "Rendering Mac checkbox";
  }
  
  toggle(): void {
    console.log("Mac checkbox toggled");
  }
}

// Abstract factory
interface GUIFactory {
  createButton(): Button;
  createCheckbox(): Checkbox;
}

// Concrete factories
class WindowsFactory implements GUIFactory {
  createButton(): Button {
    return new WindowsButton();
  }
  
  createCheckbox(): Checkbox {
    return new WindowsCheckbox();
  }
}

class MacFactory implements GUIFactory {
  createButton(): Button {
    return new MacButton();
  }
  
  createCheckbox(): Checkbox {
    return new MacCheckbox();
  }
}

// Client code
class Application {
  private button: Button;
  private checkbox: Checkbox;
  
  constructor(factory: GUIFactory) {
    this.button = factory.createButton();
    this.checkbox = factory.createCheckbox();
  }
  
  render(): string {
    return `${this.button.render()}\n${this.checkbox.render()}`;
  }
}

// Usage
const windowsApp = new Application(new WindowsFactory());
console.log(windowsApp.render());

const macApp = new Application(new MacFactory());
console.log(macApp.render());
```

### Python
```python
from abc import ABC, abstractmethod

# Abstract products
class Chair(ABC):
    @abstractmethod
    def sit_on(self):
        pass

class Table(ABC):
    @abstractmethod
    def put_on(self):
        pass

# Victorian family
class VictorianChair(Chair):
    def sit_on(self):
        return "Sitting on Victorian chair"

class VictorianTable(Table):
    def put_on(self):
        return "Putting items on Victorian table"

# Modern family
class ModernChair(Chair):
    def sit_on(self):
        return "Sitting on modern chair"

class ModernTable(Table):
    def put_on(self):
        return "Putting items on modern table"

# Abstract factory
class FurnitureFactory(ABC):
    @abstractmethod
    def create_chair(self) -> Chair:
        pass
    
    @abstractmethod
    def create_table(self) -> Table:
        pass

# Concrete factories
class VictorianFurnitureFactory(FurnitureFactory):
    def create_chair(self) -> Chair:
        return VictorianChair()
    
    def create_table(self) -> Table:
        return VictorianTable()

class ModernFurnitureFactory(FurnitureFactory):
    def create_chair(self) -> Chair:
        return ModernChair()
    
    def create_table(self) -> Table:
        return ModernTable()

# Client
class FurnitureStore:
    def __init__(self, factory: FurnitureFactory):
        self.chair = factory.create_chair()
        self.table = factory.create_table()
    
    def describe_furniture(self):
        return f"{self.chair.sit_on()}, {self.table.put_on()}"

# Usage
victorian_store = FurnitureStore(VictorianFurnitureFactory())
print(victorian_store.describe_furniture())

modern_store = FurnitureStore(ModernFurnitureFactory())
print(modern_store.describe_furniture())
```

### Java
```java
// Abstract products
interface CPU {
    void process();
}

interface GPU {
    void render();
}

// Intel family
class IntelCPU implements CPU {
    public void process() {
        System.out.println("Intel CPU processing");
    }
}

class IntelGPU implements GPU {
    public void render() {
        System.out.println("Intel GPU rendering");
    }
}

// AMD family
class AMDCPU implements CPU {
    public void process() {
        System.out.println("AMD CPU processing");
    }
}

class AMDGPU implements GPU {
    public void render() {
        System.out.println("AMD GPU rendering");
    }
}

// Abstract factory
interface ComputerFactory {
    CPU createCPU();
    GPU createGPU();
}

// Concrete factories
class IntelFactory implements ComputerFactory {
    public CPU createCPU() {
        return new IntelCPU();
    }
    
    public GPU createGPU() {
        return new IntelGPU();
    }
}

class AMDFactory implements ComputerFactory {
    public CPU createCPU() {
        return new AMDCPU();
    }
    
    public GPU createGPU() {
        return new AMDGPU();
    }
}

// Client
class Computer {
    private CPU cpu;
    private GPU gpu;
    
    public Computer(ComputerFactory factory) {
        this.cpu = factory.createCPU();
        this.gpu = factory.createGPU();
    }
    
    public void run() {
        cpu.process();
        gpu.render();
    }
}
```

## Abstract Factory vs Factory Method

### Factory Method
- Creates **one** product
- Uses inheritance (subclassing)
- Product creation through method overriding

### Abstract Factory
- Creates **families** of products
- Uses object composition
- Product creation through object delegation

```javascript
// Factory Method - single product
abstract class DocumentCreator {
  abstract createDocument(): Document;
}

// Abstract Factory - family of products
interface OfficeFactory {
  createDocument(): Document;
  createSpreadsheet(): Spreadsheet;
  createPresentation(): Presentation;
}
```

## Pros and Cons

### Advantages
- Ensures products from one family are used together
- Isolates concrete classes from client code
- Easy to exchange product families
- Promotes consistency among products
- Single Responsibility Principle: product creation code in one place

### Disadvantages
- Code becomes more complicated with many interfaces and classes
- Adding new product types requires extending all factory interfaces
- Can be overkill if you only have one product family

## Real-World Examples

### Theme System
```javascript
interface ThemeFactory {
  createButton(): Button;
  createInput(): Input;
  createCard(): Card;
}

class DarkThemeFactory implements ThemeFactory {
  createButton(): Button {
    return new DarkButton();
  }
  
  createInput(): Input {
    return new DarkInput();
  }
  
  createCard(): Card {
    return new DarkCard();
  }
}

class LightThemeFactory implements ThemeFactory {
  createButton(): Button {
    return new LightButton();
  }
  
  createInput(): Input {
    return new LightInput();
  }
  
  createCard(): Card {
    return new LightCard();
  }
}
```

### Database Abstraction
```javascript
interface DatabaseFactory {
  createConnection(): Connection;
  createQuery(): QueryBuilder;
  createTransaction(): Transaction;
}

class MySQLFactory implements DatabaseFactory {
  createConnection(): Connection {
    return new MySQLConnection();
  }
  
  createQuery(): QueryBuilder {
    return new MySQLQueryBuilder();
  }
  
  createTransaction(): Transaction {
    return new MySQLTransaction();
  }
}

class PostgreSQLFactory implements DatabaseFactory {
  createConnection(): Connection {
    return new PostgreSQLConnection();
  }
  
  createQuery(): QueryBuilder {
    return new PostgreSQLQueryBuilder();
  }
  
  createTransaction(): Transaction {
    return new PostgreSQLTransaction();
  }
}
```

### Game Development
```javascript
interface EnemyFactory {
  createSoldier(): Enemy;
  createTank(): Enemy;
  createAircraft(): Enemy;
}

class AlliedFactory implements EnemyFactory {
  createSoldier(): Enemy {
    return new AlliedSoldier();
  }
  
  createTank(): Enemy {
    return new AlliedTank();
  }
  
  createAircraft(): Enemy {
    return new AlliedFighter();
  }
}

class AxisFactory implements EnemyFactory {
  createSoldier(): Enemy {
    return new AxisSoldier();
  }
  
  createTank(): Enemy {
    return new AxisTank();
  }
  
  createAircraft(): Enemy {
    return new AxisBomber();
  }
}
```

## Common Use Cases
- Cross-platform UI toolkits
- Different database vendors
- Multiple operating system support
- Game development (different factions/races)
- Document processing (different file formats)
- Theme/skin systems
- Product configuration systems