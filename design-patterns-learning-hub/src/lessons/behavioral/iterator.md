# Iterator Pattern

## Overview
The Iterator pattern provides a way to access elements of a collection sequentially without exposing the underlying representation. It defines a standard interface for traversing different data structures uniformly.

## When to Use
- When you want to traverse a collection without exposing its internal structure
- When you need multiple traversal algorithms for the same collection
- When you want a uniform interface for traversing different data structures
- When you need to support multiple simultaneous traversals

## Structure
```
┌─────────────────┐
│     Client      │
└─────────────────┘
         │
         │ uses
         ▼
┌─────────────────┐     ┌─────────────────┐
│   Iterator      │◀────│   Aggregate     │
├─────────────────┤     ├─────────────────┤
│ + hasNext()     │     │ + createIter()  │
│ + next()        │     └─────────────────┘
└─────────────────┘              △
         △                       │
         │                       │
┌─────────────────┐     ┌─────────────────┐
│ConcreteIterator │     │ConcreteAggregate│
├─────────────────┤     ├─────────────────┤
│ + hasNext()     │────▶│ + createIter()  │
│ + next()        │     │ - items[]       │
└─────────────────┘     └─────────────────┘
```

## Implementation Examples

### JavaScript/TypeScript
```javascript
// Iterator interface
interface Iterator<T> {
  hasNext(): boolean;
  next(): T | null;
  reset(): void;
}

// Iterable interface
interface Iterable<T> {
  createIterator(): Iterator<T>;
}

// Book class
class Book {
  constructor(
    public title: string,
    public author: string,
    public year: number
  ) {}

  toString(): string {
    return `"${this.title}" by ${this.author} (${this.year})`;
  }
}

// Concrete collection
class BookCollection implements Iterable<Book> {
  private books: Book[] = [];

  addBook(book: Book): void {
    this.books.push(book);
  }

  removeBook(index: number): void {
    if (index >= 0 && index < this.books.length) {
      this.books.splice(index, 1);
    }
  }

  getBook(index: number): Book | null {
    return index >= 0 && index < this.books.length ? this.books[index] : null;
  }

  getCount(): number {
    return this.books.length;
  }

  createIterator(): Iterator<Book> {
    return new BookIterator(this);
  }

  createReverseIterator(): Iterator<Book> {
    return new ReverseBookIterator(this);
  }

  createFilteredIterator(predicate: (book: Book) => boolean): Iterator<Book> {
    return new FilteredBookIterator(this, predicate);
  }
}

// Concrete iterator
class BookIterator implements Iterator<Book> {
  private position = 0;

  constructor(private collection: BookCollection) {}

  hasNext(): boolean {
    return this.position < this.collection.getCount();
  }

  next(): Book | null {
    if (this.hasNext()) {
      const book = this.collection.getBook(this.position);
      this.position++;
      return book;
    }
    return null;
  }

  reset(): void {
    this.position = 0;
  }
}

// Reverse iterator
class ReverseBookIterator implements Iterator<Book> {
  private position: number;

  constructor(private collection: BookCollection) {
    this.position = collection.getCount() - 1;
  }

  hasNext(): boolean {
    return this.position >= 0;
  }

  next(): Book | null {
    if (this.hasNext()) {
      const book = this.collection.getBook(this.position);
      this.position--;
      return book;
    }
    return null;
  }

  reset(): void {
    this.position = this.collection.getCount() - 1;
  }
}

// Filtered iterator
class FilteredBookIterator implements Iterator<Book> {
  private position = 0;

  constructor(
    private collection: BookCollection,
    private predicate: (book: Book) => boolean
  ) {}

  hasNext(): boolean {
    while (this.position < this.collection.getCount()) {
      const book = this.collection.getBook(this.position);
      if (book && this.predicate(book)) {
        return true;
      }
      this.position++;
    }
    return false;
  }

  next(): Book | null {
    if (this.hasNext()) {
      const book = this.collection.getBook(this.position);
      this.position++;
      return book;
    }
    return null;
  }

  reset(): void {
    this.position = 0;
  }
}

// Usage
const library = new BookCollection();
library.addBook(new Book('The Great Gatsby', 'F. Scott Fitzgerald', 1925));
library.addBook(new Book('To Kill a Mockingbird', 'Harper Lee', 1960));
library.addBook(new Book('1984', 'George Orwell', 1949));
library.addBook(new Book('Pride and Prejudice', 'Jane Austen', 1813));
library.addBook(new Book('The Catcher in the Rye', 'J.D. Salinger', 1951));

console.log('=== Forward Iterator ===');
const forwardIter = library.createIterator();
while (forwardIter.hasNext()) {
  console.log(forwardIter.next()?.toString());
}

console.log('\n=== Reverse Iterator ===');
const reverseIter = library.createReverseIterator();
while (reverseIter.hasNext()) {
  console.log(reverseIter.next()?.toString());
}

console.log('\n=== Filtered Iterator (books after 1950) ===');
const modernBooksIter = library.createFilteredIterator(book => book.year > 1950);
while (modernBooksIter.hasNext()) {
  console.log(modernBooksIter.next()?.toString());
}

console.log('\n=== Using Built-in JavaScript Iterator ===');
// Making BookCollection work with for...of
BookCollection.prototype[Symbol.iterator] = function* () {
  const iter = this.createIterator();
  while (iter.hasNext()) {
    yield iter.next();
  }
};

for (const book of library as any) {
  console.log(book.toString());
}
```

### Python
```python
from abc import ABC, abstractmethod
from typing import Iterator, List, TypeVar, Generic, Optional, Callable

T = TypeVar('T')

# Abstract iterator
class CustomIterator(ABC, Generic[T]):
    @abstractmethod
    def __iter__(self):
        return self
    
    @abstractmethod
    def __next__(self) -> T:
        pass
    
    @abstractmethod
    def has_next(self) -> bool:
        pass
    
    @abstractmethod
    def reset(self) -> None:
        pass

# Abstract collection
class IterableCollection(ABC, Generic[T]):
    @abstractmethod
    def create_iterator(self) -> CustomIterator[T]:
        pass

# Employee class
class Employee:
    def __init__(self, name: str, department: str, salary: float):
        self.name = name
        self.department = department
        self.salary = salary
    
    def __str__(self):
        return f"{self.name} ({self.department}) - ${self.salary:,.0f}"
    
    def __repr__(self):
        return self.__str__()

# Concrete collection
class Company(IterableCollection[Employee]):
    def __init__(self, name: str):
        self.name = name
        self._employees: List[Employee] = []
    
    def hire_employee(self, employee: Employee):
        self._employees.append(employee)
    
    def fire_employee(self, index: int):
        if 0 <= index < len(self._employees):
            self._employees.pop(index)
    
    def get_employee(self, index: int) -> Optional[Employee]:
        if 0 <= index < len(self._employees):
            return self._employees[index]
        return None
    
    def get_employee_count(self) -> int:
        return len(self._employees)
    
    def create_iterator(self) -> CustomIterator[Employee]:
        return CompanyIterator(self)
    
    def create_department_iterator(self, department: str) -> CustomIterator[Employee]:
        return DepartmentIterator(self, department)
    
    def create_salary_range_iterator(self, min_salary: float, max_salary: float) -> CustomIterator[Employee]:
        return SalaryRangeIterator(self, min_salary, max_salary)

# Concrete iterators
class CompanyIterator(CustomIterator[Employee]):
    def __init__(self, company: Company):
        self._company = company
        self._position = 0
    
    def __iter__(self):
        return self
    
    def __next__(self) -> Employee:
        if not self.has_next():
            raise StopIteration
        employee = self._company.get_employee(self._position)
        self._position += 1
        return employee
    
    def has_next(self) -> bool:
        return self._position < self._company.get_employee_count()
    
    def reset(self) -> None:
        self._position = 0

class DepartmentIterator(CustomIterator[Employee]):
    def __init__(self, company: Company, department: str):
        self._company = company
        self._department = department
        self._position = 0
        self._find_next_position()
    
    def __iter__(self):
        return self
    
    def __next__(self) -> Employee:
        if not self.has_next():
            raise StopIteration
        employee = self._company.get_employee(self._position)
        self._position += 1
        self._find_next_position()
        return employee
    
    def has_next(self) -> bool:
        return self._position < self._company.get_employee_count()
    
    def reset(self) -> None:
        self._position = 0
        self._find_next_position()
    
    def _find_next_position(self):
        while (self._position < self._company.get_employee_count() and 
               self._company.get_employee(self._position).department != self._department):
            self._position += 1

class SalaryRangeIterator(CustomIterator[Employee]):
    def __init__(self, company: Company, min_salary: float, max_salary: float):
        self._company = company
        self._min_salary = min_salary
        self._max_salary = max_salary
        self._position = 0
        self._find_next_position()
    
    def __iter__(self):
        return self
    
    def __next__(self) -> Employee:
        if not self.has_next():
            raise StopIteration
        employee = self._company.get_employee(self._position)
        self._position += 1
        self._find_next_position()
        return employee
    
    def has_next(self) -> bool:
        return self._position < self._company.get_employee_count()
    
    def reset(self) -> None:
        self._position = 0
        self._find_next_position()
    
    def _find_next_position(self):
        while self._position < self._company.get_employee_count():
            employee = self._company.get_employee(self._position)
            if employee and self._min_salary <= employee.salary <= self._max_salary:
                break
            self._position += 1

# Usage
def demonstrate_iterator_pattern():
    company = Company("Tech Corp")
    
    # Add employees
    employees = [
        Employee("Alice", "Engineering", 85000),
        Employee("Bob", "Marketing", 65000),
        Employee("Charlie", "Engineering", 92000),
        Employee("Diana", "HR", 58000),
        Employee("Eve", "Engineering", 78000),
        Employee("Frank", "Marketing", 71000),
    ]
    
    for emp in employees:
        company.hire_employee(emp)
    
    print("=== All Employees ===")
    all_employees_iter = company.create_iterator()
    for employee in all_employees_iter:
        print(employee)
    
    print("\n=== Engineering Department ===")
    eng_iter = company.create_department_iterator("Engineering")
    for employee in eng_iter:
        print(employee)
    
    print("\n=== Salary Range $60,000 - $80,000 ===")
    salary_iter = company.create_salary_range_iterator(60000, 80000)
    for employee in salary_iter:
        print(employee)
    
    print("\n=== Using Python's built-in iteration ===")
    # Make Company work with Python's for loop
    Company.__iter__ = lambda self: self.create_iterator()
    
    print("First 3 employees:")
    for i, employee in enumerate(company):
        if i >= 3:
            break
        print(f"{i+1}. {employee}")

demonstrate_iterator_pattern()
```

### Java
```java
import java.util.*;
import java.util.function.Predicate;

// Generic iterator interface
interface CustomIterator<T> {
    boolean hasNext();
    T next();
    void reset();
}

// Generic iterable interface
interface CustomIterable<T> {
    CustomIterator<T> createIterator();
}

// Product class
class Product {
    private String name;
    private String category;
    private double price;
    
    public Product(String name, String category, double price) {
        this.name = name;
        this.category = category;
        this.price = price;
    }
    
    // Getters
    public String getName() { return name; }
    public String getCategory() { return category; }
    public double getPrice() { return price; }
    
    @Override
    public String toString() {
        return String.format("%s (%s) - $%.2f", name, category, price);
    }
}

// Concrete collection
class ProductCatalog implements CustomIterable<Product> {
    private List<Product> products;
    
    public ProductCatalog() {
        this.products = new ArrayList<>();
    }
    
    public void addProduct(Product product) {
        products.add(product);
    }
    
    public void removeProduct(int index) {
        if (index >= 0 && index < products.size()) {
            products.remove(index);
        }
    }
    
    public Product getProduct(int index) {
        if (index >= 0 && index < products.size()) {
            return products.get(index);
        }
        return null;
    }
    
    public int getProductCount() {
        return products.size();
    }
    
    public CustomIterator<Product> createIterator() {
        return new ProductIterator(this);
    }
    
    public CustomIterator<Product> createCategoryIterator(String category) {
        return new CategoryIterator(this, category);
    }
    
    public CustomIterator<Product> createPriceRangeIterator(double minPrice, double maxPrice) {
        return new PriceRangeIterator(this, minPrice, maxPrice);
    }
    
    public CustomIterator<Product> createFilteredIterator(Predicate<Product> filter) {
        return new FilteredIterator(this, filter);
    }
}

// Concrete iterators
class ProductIterator implements CustomIterator<Product> {
    private ProductCatalog catalog;
    private int position;
    
    public ProductIterator(ProductCatalog catalog) {
        this.catalog = catalog;
        this.position = 0;
    }
    
    public boolean hasNext() {
        return position < catalog.getProductCount();
    }
    
    public Product next() {
        if (hasNext()) {
            return catalog.getProduct(position++);
        }
        throw new NoSuchElementException();
    }
    
    public void reset() {
        position = 0;
    }
}

class CategoryIterator implements CustomIterator<Product> {
    private ProductCatalog catalog;
    private String category;
    private int position;
    
    public CategoryIterator(ProductCatalog catalog, String category) {
        this.catalog = catalog;
        this.category = category;
        this.position = 0;
        findNextValidPosition();
    }
    
    public boolean hasNext() {
        return position < catalog.getProductCount();
    }
    
    public Product next() {
        if (hasNext()) {
            Product product = catalog.getProduct(position++);
            findNextValidPosition();
            return product;
        }
        throw new NoSuchElementException();
    }
    
    public void reset() {
        position = 0;
        findNextValidPosition();
    }
    
    private void findNextValidPosition() {
        while (position < catalog.getProductCount()) {
            Product product = catalog.getProduct(position);
            if (product != null && category.equals(product.getCategory())) {
                break;
            }
            position++;
        }
    }
}

class PriceRangeIterator implements CustomIterator<Product> {
    private ProductCatalog catalog;
    private double minPrice;
    private double maxPrice;
    private int position;
    
    public PriceRangeIterator(ProductCatalog catalog, double minPrice, double maxPrice) {
        this.catalog = catalog;
        this.minPrice = minPrice;
        this.maxPrice = maxPrice;
        this.position = 0;
        findNextValidPosition();
    }
    
    public boolean hasNext() {
        return position < catalog.getProductCount();
    }
    
    public Product next() {
        if (hasNext()) {
            Product product = catalog.getProduct(position++);
            findNextValidPosition();
            return product;
        }
        throw new NoSuchElementException();
    }
    
    public void reset() {
        position = 0;
        findNextValidPosition();
    }
    
    private void findNextValidPosition() {
        while (position < catalog.getProductCount()) {
            Product product = catalog.getProduct(position);
            if (product != null && product.getPrice() >= minPrice && product.getPrice() <= maxPrice) {
                break;
            }
            position++;
        }
    }
}

class FilteredIterator implements CustomIterator<Product> {
    private ProductCatalog catalog;
    private Predicate<Product> filter;
    private int position;
    
    public FilteredIterator(ProductCatalog catalog, Predicate<Product> filter) {
        this.catalog = catalog;
        this.filter = filter;
        this.position = 0;
        findNextValidPosition();
    }
    
    public boolean hasNext() {
        return position < catalog.getProductCount();
    }
    
    public Product next() {
        if (hasNext()) {
            Product product = catalog.getProduct(position++);
            findNextValidPosition();
            return product;
        }
        throw new NoSuchElementException();
    }
    
    public void reset() {
        position = 0;
        findNextValidPosition();
    }
    
    private void findNextValidPosition() {
        while (position < catalog.getProductCount()) {
            Product product = catalog.getProduct(position);
            if (product != null && filter.test(product)) {
                break;
            }
            position++;
        }
    }
}

// Usage
public class IteratorExample {
    public static void main(String[] args) {
        ProductCatalog catalog = new ProductCatalog();
        
        // Add products
        catalog.addProduct(new Product("Laptop", "Electronics", 999.99));
        catalog.addProduct(new Product("Coffee Maker", "Appliances", 79.99));
        catalog.addProduct(new Product("Smartphone", "Electronics", 699.99));
        catalog.addProduct(new Product("Blender", "Appliances", 49.99));
        catalog.addProduct(new Product("Tablet", "Electronics", 399.99));
        catalog.addProduct(new Product("Toaster", "Appliances", 29.99));
        
        System.out.println("=== All Products ===");
        CustomIterator<Product> allProducts = catalog.createIterator();
        while (allProducts.hasNext()) {
            System.out.println(allProducts.next());
        }
        
        System.out.println("\n=== Electronics Only ===");
        CustomIterator<Product> electronics = catalog.createCategoryIterator("Electronics");
        while (electronics.hasNext()) {
            System.out.println(electronics.next());
        }
        
        System.out.println("\n=== Price Range $50-$500 ===");
        CustomIterator<Product> priceRange = catalog.createPriceRangeIterator(50.0, 500.0);
        while (priceRange.hasNext()) {
            System.out.println(priceRange.next());
        }
        
        System.out.println("\n=== Products with 'e' in name ===");
        CustomIterator<Product> filtered = catalog.createFilteredIterator(
            product -> product.getName().toLowerCase().contains("e")
        );
        while (filtered.hasNext()) {
            System.out.println(filtered.next());
        }
    }
}
```

## Pros and Cons

### Advantages
- Provides uniform interface for traversing different collections
- Supports multiple simultaneous traversals
- Simplifies collection interface
- Supports different traversal algorithms
- Follows Single Responsibility Principle

### Disadvantages
- Can be overkill for simple collections
- May have performance overhead
- Can be less efficient than direct access

## Real-World Examples
- Database result sets
- File system traversal
- Tree/graph traversal algorithms
- Menu navigation systems
- Playlist management
- Search result pagination
- Collection frameworks (Java Collections, C# IEnumerable)

## Common Use Cases
- Traversing complex data structures
- Implementing foreach loops
- Database cursors
- Streaming data processing
- Navigation through hierarchical data
- Custom collection implementations
- Lazy evaluation scenarios