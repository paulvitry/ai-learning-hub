# Decorator Pattern

## Overview
The Decorator pattern allows behavior to be added to objects dynamically without altering their structure. It provides a flexible alternative to subclassing for extending functionality by wrapping objects in decorator classes that contain the behavior.

## When to Use
- When you want to add behavior to objects dynamically and transparently
- When extension by subclassing is impractical or would result in class explosion
- When you want to add responsibilities to objects without affecting other objects
- When you need to add/remove responsibilities at runtime
- When inheritance would be awkward or impossible

## Structure
```
┌─────────────────┐
│   Component     │
├─────────────────┤
│ + operation()   │
└─────────────────┘
         △
         │
┌────────┴────────┐
│                 │
┌─────────────────┐  ┌─────────────────┐
│ConcreteComponent│  │   Decorator     │
├─────────────────┤  ├─────────────────┤
│ + operation()   │  │ - component     │
└─────────────────┘  │ + operation()   │
                     └─────────────────┘
                              △
                              │
                     ┌─────────────────┐
                     │ConcreteDecorator│
                     ├─────────────────┤
                     │ + operation()   │
                     │ + addedBehavior()│
                     └─────────────────┘
```

## Implementation Examples

### JavaScript/TypeScript
```javascript
// Component interface
interface Coffee {
  cost(): number;
  description(): string;
}

// Concrete component
class SimpleCoffee implements Coffee {
  cost(): number {
    return 2.00;
  }

  description(): string {
    return "Simple coffee";
  }
}

// Base decorator
abstract class CoffeeDecorator implements Coffee {
  protected coffee: Coffee;

  constructor(coffee: Coffee) {
    this.coffee = coffee;
  }

  cost(): number {
    return this.coffee.cost();
  }

  description(): string {
    return this.coffee.description();
  }
}

// Concrete decorators
class MilkDecorator extends CoffeeDecorator {
  cost(): number {
    return this.coffee.cost() + 0.50;
  }

  description(): string {
    return this.coffee.description() + ", milk";
  }
}

class SugarDecorator extends CoffeeDecorator {
  cost(): number {
    return this.coffee.cost() + 0.25;
  }

  description(): string {
    return this.coffee.description() + ", sugar";
  }
}

class WhipDecorator extends CoffeeDecorator {
  cost(): number {
    return this.coffee.cost() + 0.75;
  }

  description(): string {
    return this.coffee.description() + ", whip";
  }
}

class VanillaDecorator extends CoffeeDecorator {
  cost(): number {
    return this.coffee.cost() + 0.60;
  }

  description(): string {
    return this.coffee.description() + ", vanilla";
  }
}

// Usage
let coffee: Coffee = new SimpleCoffee();
console.log(`${coffee.description()} - $${coffee.cost()}`);
// Simple coffee - $2

coffee = new MilkDecorator(coffee);
console.log(`${coffee.description()} - $${coffee.cost()}`);
// Simple coffee, milk - $2.5

coffee = new SugarDecorator(coffee);
console.log(`${coffee.description()} - $${coffee.cost()}`);
// Simple coffee, milk, sugar - $2.75

coffee = new WhipDecorator(coffee);
coffee = new VanillaDecorator(coffee);
console.log(`${coffee.description()} - $${coffee.cost()}`);
// Simple coffee, milk, sugar, whip, vanilla - $4.1
```

### Python
```python
from abc import ABC, abstractmethod

# Component interface
class Text(ABC):
    @abstractmethod
    def render(self) -> str:
        pass

# Concrete component
class PlainText(Text):
    def __init__(self, content: str):
        self._content = content
    
    def render(self) -> str:
        return self._content

# Base decorator
class TextDecorator(Text):
    def __init__(self, text: Text):
        self._text = text
    
    def render(self) -> str:
        return self._text.render()

# Concrete decorators
class BoldDecorator(TextDecorator):
    def render(self) -> str:
        return f"<b>{self._text.render()}</b>"

class ItalicDecorator(TextDecorator):
    def render(self) -> str:
        return f"<i>{self._text.render()}</i>"

class UnderlineDecorator(TextDecorator):
    def render(self) -> str:
        return f"<u>{self._text.render()}</u>"

class ColorDecorator(TextDecorator):
    def __init__(self, text: Text, color: str):
        super().__init__(text)
        self._color = color
    
    def render(self) -> str:
        return f'<span style="color:{self._color}">{self._text.render()}</span>'

# Usage
text = PlainText("Hello, World!")
print(text.render())  # Hello, World!

text = BoldDecorator(text)
print(text.render())  # <b>Hello, World!</b>

text = ItalicDecorator(text)
print(text.render())  # <i><b>Hello, World!</b></i>

text = ColorDecorator(text, "red")
print(text.render())  # <span style="color:red"><i><b>Hello, World!</b></i></span>

# Or chain them in one go
formatted_text = ColorDecorator(
    UnderlineDecorator(
        ItalicDecorator(
            BoldDecorator(
                PlainText("Decorated Text!")
            )
        )
    ),
    "blue"
)
print(formatted_text.render())
```

### Java
```java
// Component interface
interface DataSource {
    void writeData(String data);
    String readData();
}

// Concrete component
class FileDataSource implements DataSource {
    private String filename;
    private String data = "";
    
    public FileDataSource(String filename) {
        this.filename = filename;
    }
    
    public void writeData(String data) {
        this.data = data;
        System.out.println("Writing to file " + filename + ": " + data);
    }
    
    public String readData() {
        System.out.println("Reading from file " + filename);
        return data;
    }
}

// Base decorator
abstract class DataSourceDecorator implements DataSource {
    protected DataSource wrappee;
    
    public DataSourceDecorator(DataSource source) {
        this.wrappee = source;
    }
    
    public void writeData(String data) {
        wrappee.writeData(data);
    }
    
    public String readData() {
        return wrappee.readData();
    }
}

// Concrete decorators
class EncryptionDecorator extends DataSourceDecorator {
    public EncryptionDecorator(DataSource source) {
        super(source);
    }
    
    public void writeData(String data) {
        System.out.println("Encrypting data");
        super.writeData(encode(data));
    }
    
    public String readData() {
        String data = super.readData();
        System.out.println("Decrypting data");
        return decode(data);
    }
    
    private String encode(String data) {
        // Simple encoding simulation
        return new StringBuilder(data).reverse().toString();
    }
    
    private String decode(String data) {
        return new StringBuilder(data).reverse().toString();
    }
}

class CompressionDecorator extends DataSourceDecorator {
    public CompressionDecorator(DataSource source) {
        super(source);
    }
    
    public void writeData(String data) {
        System.out.println("Compressing data");
        super.writeData(compress(data));
    }
    
    public String readData() {
        String data = super.readData();
        System.out.println("Decompressing data");
        return decompress(data);
    }
    
    private String compress(String data) {
        return data + "[compressed]";
    }
    
    private String decompress(String data) {
        return data.replace("[compressed]", "");
    }
}

// Usage
public class DecoratorExample {
    public static void main(String[] args) {
        DataSource source = new FileDataSource("data.txt");
        
        // Add encryption
        source = new EncryptionDecorator(source);
        
        // Add compression
        source = new CompressionDecorator(source);
        
        source.writeData("Hello, World!");
        System.out.println("Retrieved: " + source.readData());
    }
}
```

## Functional Decorator (Higher-Order Functions)

### JavaScript Function Decorators
```javascript
// Function decorator
function withLogging<T extends any[], R>(
  fn: (...args: T) => R
): (...args: T) => R {
  return (...args: T): R => {
    console.log(`Calling ${fn.name} with arguments:`, args);
    const result = fn(...args);
    console.log(`${fn.name} returned:`, result);
    return result;
  };
}

function withTiming<T extends any[], R>(
  fn: (...args: T) => R
): (...args: T) => R {
  return (...args: T): R => {
    const start = performance.now();
    const result = fn(...args);
    const end = performance.now();
    console.log(`${fn.name} took ${end - start} milliseconds`);
    return result;
  };
}

function withRetry<T extends any[], R>(
  fn: (...args: T) => R,
  maxAttempts: number = 3
): (...args: T) => R {
  return (...args: T): R => {
    let lastError: Error | undefined;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return fn(...args);
      } catch (error) {
        lastError = error as Error;
        console.log(`Attempt ${attempt} failed: ${error}`);
        if (attempt === maxAttempts) {
          throw lastError;
        }
      }
    }
    throw lastError;
  };
}

// Usage
function calculate(a: number, b: number): number {
  return a + b;
}

// Compose decorators
const decoratedCalculate = withLogging(
  withTiming(
    withRetry(calculate, 2)
  )
);

decoratedCalculate(5, 3);
```

### Python Decorators
```python
import functools
import time

def with_logging(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        print(f"Calling {func.__name__} with args: {args}, kwargs: {kwargs}")
        result = func(*args, **kwargs)
        print(f"{func.__name__} returned: {result}")
        return result
    return wrapper

def with_timing(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        end = time.time()
        print(f"{func.__name__} took {end - start:.4f} seconds")
        return result
    return wrapper

def with_caching(func):
    cache = {}
    
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        # Simple key generation (only works with hashable args)
        key = (args, tuple(sorted(kwargs.items())))
        
        if key in cache:
            print(f"Cache hit for {func.__name__}")
            return cache[key]
        
        result = func(*args, **kwargs)
        cache[key] = result
        print(f"Cache miss for {func.__name__}, result cached")
        return result
    
    return wrapper

# Usage with decorators
@with_logging
@with_timing
@with_caching
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

# Call the decorated function
print(fibonacci(10))
```

## Decorator vs Inheritance

### Inheritance Approach (Rigid)
```javascript
class Coffee { cost(): number { return 2.00; } }
class CoffeeWithMilk extends Coffee { cost(): number { return super.cost() + 0.50; } }
class CoffeeWithMilkAndSugar extends CoffeeWithMilk { cost(): number { return super.cost() + 0.25; } }
class CoffeeWithMilkAndSugarAndWhip extends CoffeeWithMilkAndSugar { cost(): number { return super.cost() + 0.75; } }
// This leads to class explosion!
```

### Decorator Approach (Flexible)
```javascript
let coffee = new SimpleCoffee();
coffee = new MilkDecorator(coffee);
coffee = new SugarDecorator(coffee);
coffee = new WhipDecorator(coffee);
// Any combination is possible!
```

## Pros and Cons

### Advantages
- More flexible than static inheritance
- Avoids feature-laden classes high in the hierarchy
- Responsibilities can be added and removed at runtime
- Allows behavior composition instead of inheritance
- Follows Single Responsibility Principle
- Follows Open/Closed Principle

### Disadvantages
- Can result in many small objects that are hard to debug
- Can be hard to remove specific decorators from a wrapper stack
- Can make code harder to understand
- Order of decorators might matter

## Real-World Examples

### Stream Processing
```javascript
interface Stream {
  read(): string;
  write(data: string): void;
}

class BasicStream implements Stream {
  private data: string = '';

  read(): string {
    return this.data;
  }

  write(data: string): void {
    this.data += data;
  }
}

class BufferedStream implements Stream {
  private buffer: string = '';
  
  constructor(private stream: Stream) {}

  read(): string {
    return this.stream.read();
  }

  write(data: string): void {
    this.buffer += data;
    if (this.buffer.length >= 100) {
      this.flush();
    }
  }

  flush(): void {
    this.stream.write(this.buffer);
    this.buffer = '';
  }
}

class CompressedStream implements Stream {
  constructor(private stream: Stream) {}

  read(): string {
    const data = this.stream.read();
    return this.decompress(data);
  }

  write(data: string): void {
    const compressed = this.compress(data);
    this.stream.write(compressed);
  }

  private compress(data: string): string {
    return data + '[compressed]';
  }

  private decompress(data: string): string {
    return data.replace('[compressed]', '');
  }
}

// Usage
let stream: Stream = new BasicStream();
stream = new BufferedStream(stream);
stream = new CompressedStream(stream);

stream.write("Hello World!");
```

### HTTP Request Enhancement
```javascript
interface HttpClient {
  request(url: string): Promise<string>;
}

class BasicHttpClient implements HttpClient {
  async request(url: string): Promise<string> {
    // Simulate HTTP request
    return `Response from ${url}`;
  }
}

class CachingHttpClient implements HttpClient {
  private cache = new Map<string, string>();

  constructor(private client: HttpClient) {}

  async request(url: string): Promise<string> {
    if (this.cache.has(url)) {
      console.log(`Cache hit for ${url}`);
      return this.cache.get(url)!;
    }

    const response = await this.client.request(url);
    this.cache.set(url, response);
    return response;
  }
}

class RetryHttpClient implements HttpClient {
  constructor(
    private client: HttpClient,
    private maxRetries: number = 3
  ) {}

  async request(url: string): Promise<string> {
    let lastError: Error | undefined;

    for (let i = 0; i < this.maxRetries; i++) {
      try {
        return await this.client.request(url);
      } catch (error) {
        lastError = error as Error;
        console.log(`Attempt ${i + 1} failed, retrying...`);
      }
    }

    throw lastError;
  }
}

class LoggingHttpClient implements HttpClient {
  constructor(private client: HttpClient) {}

  async request(url: string): Promise<string> {
    console.log(`Making request to ${url}`);
    const start = Date.now();
    
    try {
      const response = await this.client.request(url);
      console.log(`Request to ${url} completed in ${Date.now() - start}ms`);
      return response;
    } catch (error) {
      console.log(`Request to ${url} failed after ${Date.now() - start}ms`);
      throw error;
    }
  }
}

// Usage - compose multiple decorators
let httpClient: HttpClient = new BasicHttpClient();
httpClient = new CachingHttpClient(httpClient);
httpClient = new RetryHttpClient(httpClient, 3);
httpClient = new LoggingHttpClient(httpClient);

httpClient.request('https://api.example.com/users');
```

### UI Component Enhancement
```javascript
interface UIComponent {
  render(): string;
}

class Button implements UIComponent {
  constructor(private text: string) {}

  render(): string {
    return `<button>${this.text}</button>`;
  }
}

class BorderDecorator implements UIComponent {
  constructor(private component: UIComponent) {}

  render(): string {
    return `<div style="border: 1px solid black;">${this.component.render()}</div>`;
  }
}

class ShadowDecorator implements UIComponent {
  constructor(private component: UIComponent) {}

  render(): string {
    return `<div style="box-shadow: 2px 2px 4px rgba(0,0,0,0.5);">${this.component.render()}</div>`;
  }
}

class ColorDecorator implements UIComponent {
  constructor(
    private component: UIComponent,
    private backgroundColor: string
  ) {}

  render(): string {
    return `<div style="background-color: ${this.backgroundColor};">${this.component.render()}</div>`;
  }
}

// Usage
let button: UIComponent = new Button("Click Me");
button = new ColorDecorator(button, "blue");
button = new BorderDecorator(button);
button = new ShadowDecorator(button);

console.log(button.render());
```

## Common Use Cases
- Adding behavior to objects dynamically
- Stream processing (buffering, compression, encryption)
- UI component enhancement
- HTTP clients with cross-cutting concerns
- Text processing and formatting
- Function enhancement (logging, timing, caching)
- Security features (authentication, authorization)
- Performance monitoring