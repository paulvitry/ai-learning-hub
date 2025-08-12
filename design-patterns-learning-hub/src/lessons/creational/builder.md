# Builder Pattern

## Overview
The Builder pattern constructs complex objects step by step. It allows you to produce different types and representations of an object using the same construction code. The pattern separates the construction of a complex object from its representation.

## When to Use
- When creating complex objects with many optional parameters
- When you want to avoid telescoping constructors (constructors with many parameters)
- When the construction process must allow different representations
- When you need to construct objects step by step or defer some construction steps

## Structure
```
┌─────────────────┐
│    Director     │
├─────────────────┤
│ + construct()   │
└─────────────────┘
         │
         │ uses
         ▼
┌─────────────────┐
│     Builder     │
├─────────────────┤
│ + buildPartA()  │
│ + buildPartB()  │
│ + getResult()   │
└─────────────────┘
         △
         │
┌─────────────────┐      ┌─────────────────┐
│ ConcreteBuilder │─────▶│     Product     │
├─────────────────┤      └─────────────────┘
│ + buildPartA()  │           constructs
│ + buildPartB()  │
│ + getResult()   │
└─────────────────┘
```

## Implementation Examples

### JavaScript/TypeScript
```javascript
// Product
class House {
  private walls: string = '';
  private roof: string = '';
  private doors: number = 0;
  private windows: number = 0;
  private garage: boolean = false;
  private garden: boolean = false;

  setWalls(walls: string): void {
    this.walls = walls;
  }

  setRoof(roof: string): void {
    this.roof = roof;
  }

  setDoors(doors: number): void {
    this.doors = doors;
  }

  setWindows(windows: number): void {
    this.windows = windows;
  }

  setGarage(hasGarage: boolean): void {
    this.garage = hasGarage;
  }

  setGarden(hasGarden: boolean): void {
    this.garden = hasGarden;
  }

  getDescription(): string {
    return `House with ${this.walls} walls, ${this.roof} roof, ${this.doors} doors, ${this.windows} windows${this.garage ? ', garage' : ''}${this.garden ? ', garden' : ''}`;
  }
}

// Builder interface
interface HouseBuilder {
  buildWalls(): HouseBuilder;
  buildRoof(): HouseBuilder;
  buildDoors(): HouseBuilder;
  buildWindows(): HouseBuilder;
  buildGarage(): HouseBuilder;
  buildGarden(): HouseBuilder;
  getHouse(): House;
}

// Concrete builder
class ConcreteHouseBuilder implements HouseBuilder {
  private house: House;

  constructor() {
    this.house = new House();
  }

  buildWalls(): HouseBuilder {
    this.house.setWalls('brick');
    return this;
  }

  buildRoof(): HouseBuilder {
    this.house.setRoof('tile');
    return this;
  }

  buildDoors(): HouseBuilder {
    this.house.setDoors(1);
    return this;
  }

  buildWindows(): HouseBuilder {
    this.house.setWindows(4);
    return this;
  }

  buildGarage(): HouseBuilder {
    this.house.setGarage(true);
    return this;
  }

  buildGarden(): HouseBuilder {
    this.house.setGarden(true);
    return this;
  }

  getHouse(): House {
    return this.house;
  }
}

// Director (optional)
class HouseDirector {
  buildSimpleHouse(builder: HouseBuilder): House {
    return builder
      .buildWalls()
      .buildRoof()
      .buildDoors()
      .buildWindows()
      .getHouse();
  }

  buildLuxuryHouse(builder: HouseBuilder): House {
    return builder
      .buildWalls()
      .buildRoof()
      .buildDoors()
      .buildWindows()
      .buildGarage()
      .buildGarden()
      .getHouse();
  }
}

// Usage
const builder = new ConcreteHouseBuilder();
const director = new HouseDirector();

// Using director
const simpleHouse = director.buildSimpleHouse(new ConcreteHouseBuilder());
console.log(simpleHouse.getDescription());

// Direct building
const customHouse = builder
  .buildWalls()
  .buildRoof()
  .buildDoors()
  .buildGarage()
  .getHouse();
console.log(customHouse.getDescription());
```

### Python
```python
from abc import ABC, abstractmethod

# Product
class Computer:
    def __init__(self):
        self.cpu = ""
        self.ram = 0
        self.storage = ""
        self.gpu = ""
        self.os = ""
    
    def __str__(self):
        return f"Computer: {self.cpu}, {self.ram}GB RAM, {self.storage}, {self.gpu}, {self.os}"

# Builder interface
class ComputerBuilder(ABC):
    def __init__(self):
        self.computer = Computer()
    
    @abstractmethod
    def build_cpu(self):
        pass
    
    @abstractmethod
    def build_ram(self):
        pass
    
    @abstractmethod
    def build_storage(self):
        pass
    
    @abstractmethod
    def build_gpu(self):
        pass
    
    @abstractmethod
    def build_os(self):
        pass
    
    def get_computer(self):
        return self.computer

# Concrete builders
class GamingComputerBuilder(ComputerBuilder):
    def build_cpu(self):
        self.computer.cpu = "Intel i9"
        return self
    
    def build_ram(self):
        self.computer.ram = 32
        return self
    
    def build_storage(self):
        self.computer.storage = "1TB NVMe SSD"
        return self
    
    def build_gpu(self):
        self.computer.gpu = "RTX 4080"
        return self
    
    def build_os(self):
        self.computer.os = "Windows 11"
        return self

class OfficeComputerBuilder(ComputerBuilder):
    def build_cpu(self):
        self.computer.cpu = "Intel i5"
        return self
    
    def build_ram(self):
        self.computer.ram = 16
        return self
    
    def build_storage(self):
        self.computer.storage = "512GB SSD"
        return self
    
    def build_gpu(self):
        self.computer.gpu = "Integrated"
        return self
    
    def build_os(self):
        self.computer.os = "Windows 11 Pro"
        return self

# Director
class ComputerDirector:
    def build_complete_computer(self, builder: ComputerBuilder):
        return (builder
                .build_cpu()
                .build_ram()
                .build_storage()
                .build_gpu()
                .build_os()
                .get_computer())

# Usage
director = ComputerDirector()

gaming_computer = director.build_complete_computer(GamingComputerBuilder())
print(gaming_computer)

office_computer = director.build_complete_computer(OfficeComputerBuilder())
print(office_computer)
```

### Java
```java
// Product
class Pizza {
    private String dough;
    private String sauce;
    private String topping;
    private boolean cheese;
    
    public void setDough(String dough) {
        this.dough = dough;
    }
    
    public void setSauce(String sauce) {
        this.sauce = sauce;
    }
    
    public void setTopping(String topping) {
        this.topping = topping;
    }
    
    public void setCheese(boolean cheese) {
        this.cheese = cheese;
    }
    
    @Override
    public String toString() {
        return String.format("Pizza: %s dough, %s sauce, %s topping%s",
            dough, sauce, topping, cheese ? ", with cheese" : "");
    }
}

// Builder interface
interface PizzaBuilder {
    PizzaBuilder buildDough();
    PizzaBuilder buildSauce();
    PizzaBuilder buildTopping();
    PizzaBuilder buildCheese();
    Pizza getPizza();
}

// Concrete builders
class MargheritaPizzaBuilder implements PizzaBuilder {
    private Pizza pizza;
    
    public MargheritaPizzaBuilder() {
        this.pizza = new Pizza();
    }
    
    public PizzaBuilder buildDough() {
        pizza.setDough("thin");
        return this;
    }
    
    public PizzaBuilder buildSauce() {
        pizza.setSauce("tomato");
        return this;
    }
    
    public PizzaBuilder buildTopping() {
        pizza.setTopping("basil");
        return this;
    }
    
    public PizzaBuilder buildCheese() {
        pizza.setCheese(true);
        return this;
    }
    
    public Pizza getPizza() {
        return pizza;
    }
}

class PepperoniPizzaBuilder implements PizzaBuilder {
    private Pizza pizza;
    
    public PepperoniPizzaBuilder() {
        this.pizza = new Pizza();
    }
    
    public PizzaBuilder buildDough() {
        pizza.setDough("thick");
        return this;
    }
    
    public PizzaBuilder buildSauce() {
        pizza.setSauce("tomato");
        return this;
    }
    
    public PizzaBuilder buildTopping() {
        pizza.setTopping("pepperoni");
        return this;
    }
    
    public PizzaBuilder buildCheese() {
        pizza.setCheese(true);
        return this;
    }
    
    public Pizza getPizza() {
        return pizza;
    }
}

// Director
class PizzaDirector {
    public Pizza makePizza(PizzaBuilder builder) {
        return builder
            .buildDough()
            .buildSauce()
            .buildTopping()
            .buildCheese()
            .getPizza();
    }
}
```

## Builder Variations

### Fluent Builder (Method Chaining)
```javascript
class URLBuilder {
  private protocol: string = 'https';
  private domain: string = '';
  private port?: number;
  private path: string = '';
  private queryParams: Map<string, string> = new Map();

  setProtocol(protocol: string): URLBuilder {
    this.protocol = protocol;
    return this;
  }

  setDomain(domain: string): URLBuilder {
    this.domain = domain;
    return this;
  }

  setPort(port: number): URLBuilder {
    this.port = port;
    return this;
  }

  setPath(path: string): URLBuilder {
    this.path = path;
    return this;
  }

  addQueryParam(key: string, value: string): URLBuilder {
    this.queryParams.set(key, value);
    return this;
  }

  build(): string {
    let url = `${this.protocol}://${this.domain}`;
    
    if (this.port) {
      url += `:${this.port}`;
    }
    
    if (this.path) {
      url += this.path;
    }
    
    if (this.queryParams.size > 0) {
      const params = Array.from(this.queryParams.entries())
        .map(([key, value]) => `${key}=${value}`)
        .join('&');
      url += `?${params}`;
    }
    
    return url;
  }
}

// Usage
const url = new URLBuilder()
  .setDomain('api.example.com')
  .setPath('/users')
  .addQueryParam('page', '1')
  .addQueryParam('limit', '10')
  .build();

console.log(url); // "https://api.example.com/users?page=1&limit=10"
```

### Step Builder (Enforced Order)
```javascript
interface NameStep {
  name(name: string): EmailStep;
}

interface EmailStep {
  email(email: string): AgeStep;
}

interface AgeStep {
  age(age: number): BuildStep;
}

interface BuildStep {
  build(): User;
}

class User {
  constructor(
    public name: string,
    public email: string,
    public age: number
  ) {}
}

class UserBuilder implements NameStep, EmailStep, AgeStep, BuildStep {
  private userName: string = '';
  private userEmail: string = '';
  private userAge: number = 0;

  static create(): NameStep {
    return new UserBuilder();
  }

  name(name: string): EmailStep {
    this.userName = name;
    return this;
  }

  email(email: string): AgeStep {
    this.userEmail = email;
    return this;
  }

  age(age: number): BuildStep {
    this.userAge = age;
    return this;
  }

  build(): User {
    return new User(this.userName, this.userEmail, this.userAge);
  }
}

// Usage - enforces correct order
const user = UserBuilder
  .create()
  .name('John Doe')
  .email('john@example.com')
  .age(30)
  .build();
```

## Pros and Cons

### Advantages
- Allows you to construct objects step-by-step
- Can construct different representations using the same code
- Single Responsibility Principle: complex construction code is isolated
- Avoids telescoping constructors
- Provides control over the construction process

### Disadvantages
- Overall complexity increases due to multiple new classes
- Might be overkill for simple objects
- Requires creating a separate ConcreteBuilder for each type of product

## Real-World Examples

### SQL Query Builder
```javascript
class QueryBuilder {
  private query: string = '';

  select(fields: string[]): QueryBuilder {
    this.query += `SELECT ${fields.join(', ')} `;
    return this;
  }

  from(table: string): QueryBuilder {
    this.query += `FROM ${table} `;
    return this;
  }

  where(condition: string): QueryBuilder {
    this.query += `WHERE ${condition} `;
    return this;
  }

  orderBy(field: string, direction: 'ASC' | 'DESC' = 'ASC'): QueryBuilder {
    this.query += `ORDER BY ${field} ${direction} `;
    return this;
  }

  limit(count: number): QueryBuilder {
    this.query += `LIMIT ${count} `;
    return this;
  }

  build(): string {
    return this.query.trim();
  }
}

// Usage
const query = new QueryBuilder()
  .select(['name', 'email'])
  .from('users')
  .where('age > 18')
  .orderBy('name', 'ASC')
  .limit(10)
  .build();

console.log(query); // "SELECT name, email FROM users WHERE age > 18 ORDER BY name ASC LIMIT 10"
```

### HTTP Request Builder
```javascript
class HttpRequestBuilder {
  private url: string = '';
  private method: string = 'GET';
  private headers: Map<string, string> = new Map();
  private body?: any;

  setUrl(url: string): HttpRequestBuilder {
    this.url = url;
    return this;
  }

  setMethod(method: string): HttpRequestBuilder {
    this.method = method;
    return this;
  }

  addHeader(key: string, value: string): HttpRequestBuilder {
    this.headers.set(key, value);
    return this;
  }

  setBody(body: any): HttpRequestBuilder {
    this.body = body;
    return this;
  }

  build(): RequestInit {
    const config: RequestInit = {
      method: this.method,
      headers: Object.fromEntries(this.headers)
    };

    if (this.body) {
      config.body = JSON.stringify(this.body);
    }

    return config;
  }

  async execute(): Promise<Response> {
    return fetch(this.url, this.build());
  }
}

// Usage
const response = await new HttpRequestBuilder()
  .setUrl('https://api.example.com/users')
  .setMethod('POST')
  .addHeader('Content-Type', 'application/json')
  .addHeader('Authorization', 'Bearer token')
  .setBody({ name: 'John', email: 'john@example.com' })
  .execute();
```

## Common Use Cases
- Complex object construction (houses, computers, documents)
- Configuration objects
- SQL/Query builders
- HTTP request builders
- Test data builders
- Form builders
- Email builders
- Report generators