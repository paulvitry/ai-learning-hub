# Strategy Pattern

## Overview
The Strategy pattern defines a family of algorithms, encapsulates each one, and makes them interchangeable. Strategy lets the algorithm vary independently from clients that use it. It's also known as the Policy pattern.

## When to Use
- When you have multiple ways to perform a task and want to choose the method at runtime
- When you want to avoid conditional statements for selecting behaviors
- When you have a class with multiple similar algorithms that differ only in implementation details
- When you need to switch between different algorithms dynamically

## Structure
```
┌─────────────┐    ┌─────────────┐
│   Context   │───→│  Strategy   │
├─────────────┤    ├─────────────┤
│ + strategy  │    │ + execute() │
│ + execute() │    └─────────────┘
└─────────────┘           △
                          │
              ┌───────────┼───────────┐
              │           │           │
    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
    │ConcreteA    │ │ConcreteB    │ │ConcreteC    │
    │Strategy     │ │Strategy     │ │Strategy     │
    ├─────────────┤ ├─────────────┤ ├─────────────┤
    │+ execute()  │ │+ execute()  │ │+ execute()  │
    └─────────────┘ └─────────────┘ └─────────────┘
```

## Implementation Examples

### JavaScript/TypeScript - Payment Processing
```javascript
// Strategy interface
interface PaymentStrategy {
  processPayment(amount: number): string;
}

// Concrete strategies
class CreditCardPayment implements PaymentStrategy {
  constructor(private cardNumber: string, private cvv: string) {}

  processPayment(amount: number): string {
    return `Processed $${amount} using Credit Card ending in ${this.cardNumber.slice(-4)}`;
  }
}

class PayPalPayment implements PaymentStrategy {
  constructor(private email: string) {}

  processPayment(amount: number): string {
    return `Processed $${amount} using PayPal account ${this.email}`;
  }
}

class CryptocurrencyPayment implements PaymentStrategy {
  constructor(private walletAddress: string) {}

  processPayment(amount: number): string {
    return `Processed $${amount} using Crypto wallet ${this.walletAddress.slice(0, 8)}...`;
  }
}

class BankTransferPayment implements PaymentStrategy {
  constructor(private accountNumber: string) {}

  processPayment(amount: number): string {
    return `Processed $${amount} using Bank Transfer from account ${this.accountNumber}`;
  }
}

// Context class
class PaymentProcessor {
  private strategy: PaymentStrategy;

  constructor(strategy: PaymentStrategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy: PaymentStrategy): void {
    this.strategy = strategy;
  }

  processOrder(amount: number): string {
    return this.strategy.processPayment(amount);
  }
}

// Usage
const processor = new PaymentProcessor(
  new CreditCardPayment("1234-5678-9012-3456", "123")
);

console.log(processor.processOrder(100));
// "Processed $100 using Credit Card ending in 3456"

processor.setStrategy(new PayPalPayment("user@example.com"));
console.log(processor.processOrder(50));
// "Processed $50 using PayPal account user@example.com"

processor.setStrategy(new CryptocurrencyPayment("1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"));
console.log(processor.processOrder(200));
// "Processed $200 using Crypto wallet 1A1zP1eP..."
```

### Python - Sorting Algorithms
```python
from abc import ABC, abstractmethod
from typing import List
import random

# Strategy interface
class SortingStrategy(ABC):
    @abstractmethod
    def sort(self, data: List[int]) -> List[int]:
        pass

# Concrete strategies
class BubbleSort(SortingStrategy):
    def sort(self, data: List[int]) -> List[int]:
        arr = data.copy()
        n = len(arr)
        
        for i in range(n):
            for j in range(0, n - i - 1):
                if arr[j] > arr[j + 1]:
                    arr[j], arr[j + 1] = arr[j + 1], arr[j]
        
        return arr

class QuickSort(SortingStrategy):
    def sort(self, data: List[int]) -> List[int]:
        arr = data.copy()
        self._quick_sort(arr, 0, len(arr) - 1)
        return arr
    
    def _quick_sort(self, arr: List[int], low: int, high: int):
        if low < high:
            pi = self._partition(arr, low, high)
            self._quick_sort(arr, low, pi - 1)
            self._quick_sort(arr, pi + 1, high)
    
    def _partition(self, arr: List[int], low: int, high: int) -> int:
        pivot = arr[high]
        i = low - 1
        
        for j in range(low, high):
            if arr[j] <= pivot:
                i += 1
                arr[i], arr[j] = arr[j], arr[i]
        
        arr[i + 1], arr[high] = arr[high], arr[i + 1]
        return i + 1

class MergeSort(SortingStrategy):
    def sort(self, data: List[int]) -> List[int]:
        arr = data.copy()
        self._merge_sort(arr, 0, len(arr) - 1)
        return arr
    
    def _merge_sort(self, arr: List[int], left: int, right: int):
        if left < right:
            mid = (left + right) // 2
            self._merge_sort(arr, left, mid)
            self._merge_sort(arr, mid + 1, right)
            self._merge(arr, left, mid, right)
    
    def _merge(self, arr: List[int], left: int, mid: int, right: int):
        left_arr = arr[left:mid + 1]
        right_arr = arr[mid + 1:right + 1]
        
        i = j = 0
        k = left
        
        while i < len(left_arr) and j < len(right_arr):
            if left_arr[i] <= right_arr[j]:
                arr[k] = left_arr[i]
                i += 1
            else:
                arr[k] = right_arr[j]
                j += 1
            k += 1
        
        while i < len(left_arr):
            arr[k] = left_arr[i]
            i += 1
            k += 1
        
        while j < len(right_arr):
            arr[k] = right_arr[j]
            j += 1
            k += 1

class PythonBuiltinSort(SortingStrategy):
    def sort(self, data: List[int]) -> List[int]:
        return sorted(data)

# Context class
class DataSorter:
    def __init__(self, strategy: SortingStrategy):
        self.strategy = strategy
    
    def set_strategy(self, strategy: SortingStrategy):
        self.strategy = strategy
    
    def sort_data(self, data: List[int]) -> List[int]:
        print(f"Using {self.strategy.__class__.__name__}")
        return self.strategy.sort(data)

# Usage
data = [64, 34, 25, 12, 22, 11, 90, 88, 76, 50, 42]
print(f"Original data: {data}")

sorter = DataSorter(BubbleSort())
result1 = sorter.sort_data(data)
print(f"Bubble Sort result: {result1}")

sorter.set_strategy(QuickSort())
result2 = sorter.sort_data(data)
print(f"Quick Sort result: {result2}")

sorter.set_strategy(MergeSort())
result3 = sorter.sort_data(data)
print(f"Merge Sort result: {result3}")

# Performance comparison
import time
large_data = [random.randint(1, 1000) for _ in range(1000)]

strategies = [
    ("Python Built-in", PythonBuiltinSort()),
    ("Quick Sort", QuickSort()),
    ("Merge Sort", MergeSort()),
    # ("Bubble Sort", BubbleSort()),  # Too slow for large datasets
]

for name, strategy in strategies:
    sorter.set_strategy(strategy)
    start_time = time.time()
    sorter.sort_data(large_data)
    end_time = time.time()
    print(f"{name}: {end_time - start_time:.4f} seconds")
```

### Java - Compression Strategies
```java
// Strategy interface
interface CompressionStrategy {
    String compress(String data);
    String decompress(String compressedData);
}

// Concrete strategies
class ZipCompression implements CompressionStrategy {
    @Override
    public String compress(String data) {
        return "ZIP[" + data + "]";
    }
    
    @Override
    public String decompress(String compressedData) {
        return compressedData.replace("ZIP[", "").replace("]", "");
    }
}

class GzipCompression implements CompressionStrategy {
    @Override
    public String compress(String data) {
        return "GZIP{" + data + "}";
    }
    
    @Override
    public String decompress(String compressedData) {
        return compressedData.replace("GZIP{", "").replace("}", "");
    }
}

class LzmaCompression implements CompressionStrategy {
    @Override
    public String compress(String data) {
        return "LZMA<" + data + ">";
    }
    
    @Override
    public String decompress(String compressedData) {
        return compressedData.replace("LZMA<", "").replace(">", "");
    }
}

// Context class
class FileCompressor {
    private CompressionStrategy strategy;
    
    public FileCompressor(CompressionStrategy strategy) {
        this.strategy = strategy;
    }
    
    public void setStrategy(CompressionStrategy strategy) {
        this.strategy = strategy;
    }
    
    public String compressFile(String fileContent) {
        return strategy.compress(fileContent);
    }
    
    public String decompressFile(String compressedContent) {
        return strategy.decompress(compressedContent);
    }
}

// Usage
public class CompressionExample {
    public static void main(String[] args) {
        String fileContent = "This is a sample file content that needs compression.";
        
        FileCompressor compressor = new FileCompressor(new ZipCompression());
        
        String zipCompressed = compressor.compressFile(fileContent);
        System.out.println("ZIP compressed: " + zipCompressed);
        System.out.println("ZIP decompressed: " + compressor.decompressFile(zipCompressed));
        
        compressor.setStrategy(new GzipCompression());
        String gzipCompressed = compressor.compressFile(fileContent);
        System.out.println("GZIP compressed: " + gzipCompressed);
        
        compressor.setStrategy(new LzmaCompression());
        String lzmaCompressed = compressor.compressFile(fileContent);
        System.out.println("LZMA compressed: " + lzmaCompressed);
    }
}
```

## Strategy with Lambda Functions

### JavaScript - Functional Approach
```javascript
class Calculator {
  private operation: (a: number, b: number) => number;

  constructor(operation: (a: number, b: number) => number) {
    this.operation = operation;
  }

  setOperation(operation: (a: number, b: number) => number): void {
    this.operation = operation;
  }

  calculate(a: number, b: number): number {
    return this.operation(a, b);
  }
}

// Define strategies as functions
const add = (a: number, b: number) => a + b;
const subtract = (a: number, b: number) => a - b;
const multiply = (a: number, b: number) => a * b;
const divide = (a: number, b: number) => {
  if (b === 0) throw new Error("Division by zero");
  return a / b;
};
const power = (a: number, b: number) => Math.pow(a, b);

// Usage
const calculator = new Calculator(add);
console.log(calculator.calculate(10, 5)); // 15

calculator.setOperation(multiply);
console.log(calculator.calculate(10, 5)); // 50

calculator.setOperation(power);
console.log(calculator.calculate(2, 8)); // 256

// You can even pass inline functions
calculator.setOperation((a, b) => Math.max(a, b));
console.log(calculator.calculate(10, 5)); // 10
```

### Python - Functional Strategy
```python
from typing import Callable, List

class DataProcessor:
    def __init__(self, strategy: Callable[[List[int]], List[int]]):
        self.strategy = strategy
    
    def set_strategy(self, strategy: Callable[[List[int]], List[int]]):
        self.strategy = strategy
    
    def process(self, data: List[int]) -> List[int]:
        return self.strategy(data)

# Define strategies as functions
def filter_even(data: List[int]) -> List[int]:
    return [x for x in data if x % 2 == 0]

def filter_positive(data: List[int]) -> List[int]:
    return [x for x in data if x > 0]

def double_values(data: List[int]) -> List[int]:
    return [x * 2 for x in data]

def square_values(data: List[int]) -> List[int]:
    return [x ** 2 for x in data]

# Usage
data = [-3, -2, -1, 0, 1, 2, 3, 4, 5]
processor = DataProcessor(filter_even)

print(f"Original: {data}")
print(f"Even numbers: {processor.process(data)}")

processor.set_strategy(filter_positive)
print(f"Positive numbers: {processor.process(data)}")

processor.set_strategy(lambda x: [abs(i) for i in x])
print(f"Absolute values: {processor.process(data)}")

# Chain strategies
def chain_strategies(*strategies):
    def chained(data):
        result = data
        for strategy in strategies:
            result = strategy(result)
        return result
    return chained

processor.set_strategy(chain_strategies(filter_positive, square_values))
print(f"Positive squared: {processor.process(data)}")
```

## Real-World Examples

### Discount Strategies (E-commerce)
```javascript
interface DiscountStrategy {
  calculateDiscount(price: number, customerType: string, quantity: number): number;
}

class NoDiscount implements DiscountStrategy {
  calculateDiscount(price: number): number {
    return 0;
  }
}

class PercentageDiscount implements DiscountStrategy {
  constructor(private percentage: number) {}

  calculateDiscount(price: number): number {
    return price * (this.percentage / 100);
  }
}

class QuantityDiscount implements DiscountStrategy {
  constructor(private minQuantity: number, private discountAmount: number) {}

  calculateDiscount(price: number, customerType: string, quantity: number): number {
    return quantity >= this.minQuantity ? this.discountAmount : 0;
  }
}

class VIPDiscount implements DiscountStrategy {
  calculateDiscount(price: number, customerType: string): number {
    return customerType === 'VIP' ? price * 0.15 : 0;
  }
}

class ShoppingCart {
  private discountStrategy: DiscountStrategy = new NoDiscount();

  setDiscountStrategy(strategy: DiscountStrategy): void {
    this.discountStrategy = strategy;
  }

  calculateTotal(price: number, customerType: string = 'regular', quantity: number = 1): number {
    const discount = this.discountStrategy.calculateDiscount(price, customerType, quantity);
    return price - discount;
  }
}

// Usage
const cart = new ShoppingCart();
const itemPrice = 100;

console.log(`Regular price: $${cart.calculateTotal(itemPrice)}`);

cart.setDiscountStrategy(new PercentageDiscount(10));
console.log(`With 10% discount: $${cart.calculateTotal(itemPrice)}`);

cart.setDiscountStrategy(new VIPDiscount());
console.log(`VIP discount: $${cart.calculateTotal(itemPrice, 'VIP')}`);

cart.setDiscountStrategy(new QuantityDiscount(5, 20));
console.log(`Quantity discount (5+ items): $${cart.calculateTotal(itemPrice, 'regular', 6)}`);
```

### Navigation Strategies
```javascript
interface NavigationStrategy {
  calculateRoute(start: string, end: string): string[];
}

class CarNavigation implements NavigationStrategy {
  calculateRoute(start: string, end: string): string[] {
    return [`Drive from ${start} to ${end}`, "Take highways", "Avoid tolls if possible"];
  }
}

class WalkingNavigation implements NavigationStrategy {
  calculateRoute(start: string, end: string): string[] {
    return [`Walk from ${start} to ${end}`, "Use sidewalks", "Take shortcuts through parks"];
  }
}

class PublicTransitNavigation implements NavigationStrategy {
  calculateRoute(start: string, end: string): string[] {
    return [`Transit from ${start} to ${end}`, "Find nearest bus stop", "Transfer if needed"];
  }
}

class BicycleNavigation implements NavigationStrategy {
  calculateRoute(start: string, end: string): string[] {
    return [`Bike from ${start} to ${end}`, "Use bike lanes", "Avoid heavy traffic roads"];
  }
}

class Navigator {
  private strategy: NavigationStrategy = new CarNavigation();

  setNavigationMode(strategy: NavigationStrategy): void {
    this.strategy = strategy;
  }

  getDirections(start: string, end: string): string[] {
    return this.strategy.calculateRoute(start, end);
  }
}

// Usage
const navigator = new Navigator();

const start = "Home";
const end = "Office";

console.log("Car directions:", navigator.getDirections(start, end));

navigator.setNavigationMode(new WalkingNavigation());
console.log("Walking directions:", navigator.getDirections(start, end));

navigator.setNavigationMode(new PublicTransitNavigation());
console.log("Transit directions:", navigator.getDirections(start, end));
```

## Pros and Cons

### Advantages
- Open/Closed Principle: new strategies without changing context
- Runtime switching of algorithms
- Eliminates conditional statements
- Single Responsibility Principle: each strategy has one reason to change
- Composition over inheritance

### Disadvantages
- Increased number of classes/objects
- Clients must be aware of different strategies
- Communication overhead between context and strategy
- May be overkill for simple algorithms

## Strategy vs State Pattern

### Strategy Pattern
- Algorithms are independent and interchangeable
- Client chooses which strategy to use
- Context delegates work to strategy
- Strategies don't know about each other

### State Pattern
- States can trigger transitions to other states
- States are interdependent
- Context behavior changes based on internal state
- States often know about other states

## Common Use Cases
- Payment processing systems
- Sorting algorithms
- Compression algorithms
- Authentication methods
- Routing algorithms
- Discount calculations
- Data validation
- File format converters
- Caching strategies
- Database query optimizers

## Related Patterns
- **Bridge**: Separates abstraction from implementation
- **State**: Context behavior varies with internal state
- **Template Method**: Defines algorithm skeleton, subclasses implement steps
- **Command**: Encapsulates requests, Strategy encapsulates algorithms