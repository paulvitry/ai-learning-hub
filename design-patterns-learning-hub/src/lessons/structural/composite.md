# Composite Pattern

## Overview
The Composite pattern composes objects into tree structures to represent part-whole hierarchies. It lets clients treat individual objects and compositions of objects uniformly. This pattern is perfect for building tree-like structures where both leaves and branches should be treated the same way.

## When to Use
- When you need to represent part-whole hierarchies of objects
- When you want clients to ignore the difference between compositions and individual objects
- When you have a tree structure and want to perform operations on all elements
- When the structure can be represented recursively

## Structure
```
┌─────────────────┐
│    Component    │
├─────────────────┤
│ + operation()   │
│ + add()         │
│ + remove()      │
│ + getChild()    │
└─────────────────┘
         △
         │
┌────────┴────────┐
│                 │
┌─────────────────┐  ┌─────────────────┐
│      Leaf       │  │    Composite    │
├─────────────────┤  ├─────────────────┤
│ + operation()   │  │ + operation()   │
└─────────────────┘  │ + add()         │
                     │ + remove()      │
                     │ + getChild()    │
                     └─────────────────┘
                              │
                              │ contains
                              ▼
                     ┌─────────────────┐
                     │   children[]    │
                     └─────────────────┘
```

## Implementation Examples

### JavaScript/TypeScript
```javascript
// Component interface
interface FileSystemComponent {
  getName(): string;
  getSize(): number;
  display(indent?: string): void;
}

// Leaf
class File implements FileSystemComponent {
  private name: string;
  private size: number;

  constructor(name: string, size: number) {
    this.name = name;
    this.size = size;
  }

  getName(): string {
    return this.name;
  }

  getSize(): number {
    return this.size;
  }

  display(indent: string = ""): void {
    console.log(`${indent}📄 ${this.name} (${this.size}KB)`);
  }
}

// Composite
class Directory implements FileSystemComponent {
  private name: string;
  private children: FileSystemComponent[] = [];

  constructor(name: string) {
    this.name = name;
  }

  getName(): string {
    return this.name;
  }

  getSize(): number {
    return this.children.reduce((total, child) => total + child.getSize(), 0);
  }

  add(component: FileSystemComponent): void {
    this.children.push(component);
  }

  remove(component: FileSystemComponent): void {
    const index = this.children.indexOf(component);
    if (index !== -1) {
      this.children.splice(index, 1);
    }
  }

  getChild(index: number): FileSystemComponent | undefined {
    return this.children[index];
  }

  display(indent: string = ""): void {
    console.log(`${indent}📁 ${this.name}/ (${this.getSize()}KB)`);
    this.children.forEach(child => child.display(indent + "  "));
  }
}

// Usage
const root = new Directory("root");
const documents = new Directory("Documents");
const pictures = new Directory("Pictures");

const resume = new File("resume.pdf", 150);
const coverLetter = new File("cover-letter.docx", 75);
const photo1 = new File("vacation.jpg", 2000);
const photo2 = new File("family.png", 1500);

documents.add(resume);
documents.add(coverLetter);
pictures.add(photo1);
pictures.add(photo2);

root.add(documents);
root.add(pictures);
root.add(new File("readme.txt", 5));

root.display();
// 📁 root/ (3730KB)
//   📁 Documents/ (225KB)
//     📄 resume.pdf (150KB)
//     📄 cover-letter.docx (75KB)
//   📁 Pictures/ (3500KB)
//     📄 vacation.jpg (2000KB)
//     📄 family.png (1500KB)
//   📄 readme.txt (5KB)

console.log(`Total size: ${root.getSize()}KB`);
```

### Python
```python
from abc import ABC, abstractmethod
from typing import List

# Component interface
class Graphic(ABC):
    @abstractmethod
    def draw(self):
        pass
    
    @abstractmethod
    def get_area(self):
        pass

# Leaf components
class Circle(Graphic):
    def __init__(self, radius):
        self.radius = radius
    
    def draw(self):
        return f"Circle(radius={self.radius})"
    
    def get_area(self):
        return 3.14159 * self.radius ** 2

class Rectangle(Graphic):
    def __init__(self, width, height):
        self.width = width
        self.height = height
    
    def draw(self):
        return f"Rectangle(width={self.width}, height={self.height})"
    
    def get_area(self):
        return self.width * self.height

# Composite
class CompositeGraphic(Graphic):
    def __init__(self):
        self._graphics: List[Graphic] = []
    
    def add(self, graphic: Graphic):
        self._graphics.append(graphic)
    
    def remove(self, graphic: Graphic):
        if graphic in self._graphics:
            self._graphics.remove(graphic)
    
    def draw(self):
        results = []
        results.append("CompositeGraphic [")
        for graphic in self._graphics:
            results.append(f"  {graphic.draw()}")
        results.append("]")
        return "\n".join(results)
    
    def get_area(self):
        return sum(graphic.get_area() for graphic in self._graphics)

# Usage
circle1 = Circle(5)
circle2 = Circle(3)
rectangle1 = Rectangle(4, 6)
rectangle2 = Rectangle(2, 3)

# Create composite graphics
composite1 = CompositeGraphic()
composite1.add(circle1)
composite1.add(rectangle1)

composite2 = CompositeGraphic()
composite2.add(circle2)
composite2.add(rectangle2)

# Create main composite
main_composite = CompositeGraphic()
main_composite.add(composite1)
main_composite.add(composite2)

print(main_composite.draw())
print(f"Total area: {main_composite.get_area():.2f}")
```

### Java
```java
import java.util.*;

// Component interface
interface Employee {
    void showEmployeeDetails();
    double getSalary();
}

// Leaf
class Developer implements Employee {
    private String name;
    private String position;
    private double salary;
    
    public Developer(String name, String position, double salary) {
        this.name = name;
        this.position = position;
        this.salary = salary;
    }
    
    public void showEmployeeDetails() {
        System.out.println("👨‍💻 " + name + " - " + position + " ($" + salary + ")");
    }
    
    public double getSalary() {
        return salary;
    }
}

class Designer implements Employee {
    private String name;
    private String position;
    private double salary;
    
    public Designer(String name, String position, double salary) {
        this.name = name;
        this.position = position;
        this.salary = salary;
    }
    
    public void showEmployeeDetails() {
        System.out.println("🎨 " + name + " - " + position + " ($" + salary + ")");
    }
    
    public double getSalary() {
        return salary;
    }
}

// Composite
class Manager implements Employee {
    private String name;
    private String position;
    private double salary;
    private List<Employee> subordinates;
    
    public Manager(String name, String position, double salary) {
        this.name = name;
        this.position = position;
        this.salary = salary;
        this.subordinates = new ArrayList<>();
    }
    
    public void addEmployee(Employee employee) {
        subordinates.add(employee);
    }
    
    public void removeEmployee(Employee employee) {
        subordinates.remove(employee);
    }
    
    public void showEmployeeDetails() {
        System.out.println("👔 " + name + " - " + position + " ($" + salary + ")");
        for (Employee employee : subordinates) {
            System.out.print("  ");
            employee.showEmployeeDetails();
        }
    }
    
    public double getSalary() {
        double totalSalary = salary;
        for (Employee employee : subordinates) {
            totalSalary += employee.getSalary();
        }
        return totalSalary;
    }
    
    public List<Employee> getSubordinates() {
        return subordinates;
    }
}

// Usage
public class CompositeExample {
    public static void main(String[] args) {
        // Create leaf employees
        Developer dev1 = new Developer("John", "Senior Developer", 80000);
        Developer dev2 = new Developer("Jane", "Junior Developer", 60000);
        Designer designer1 = new Designer("Mike", "UI Designer", 70000);
        
        // Create composite managers
        Manager teamLead = new Manager("Sarah", "Team Lead", 90000);
        teamLead.addEmployee(dev1);
        teamLead.addEmployee(dev2);
        
        Manager projectManager = new Manager("Bob", "Project Manager", 100000);
        projectManager.addEmployee(teamLead);
        projectManager.addEmployee(designer1);
        
        // Display hierarchy
        projectManager.showEmployeeDetails();
        System.out.println("Total team cost: $" + projectManager.getSalary());
    }
}
```

## Composite with Different Operations

### Menu System
```javascript
interface MenuComponent {
  getName(): string;
  getPrice(): number;
  display(): void;
}

class MenuItem implements MenuComponent {
  private name: string;
  private price: number;
  private description: string;

  constructor(name: string, price: number, description: string) {
    this.name = name;
    this.price = price;
    this.description = description;
  }

  getName(): string {
    return this.name;
  }

  getPrice(): number {
    return this.price;
  }

  display(): void {
    console.log(`  ${this.name} - $${this.price}`);
    console.log(`    ${this.description}`);
  }
}

class Menu implements MenuComponent {
  private name: string;
  private items: MenuComponent[] = [];

  constructor(name: string) {
    this.name = name;
  }

  getName(): string {
    return this.name;
  }

  getPrice(): number {
    return this.items.reduce((total, item) => total + item.getPrice(), 0);
  }

  add(item: MenuComponent): void {
    this.items.push(item);
  }

  remove(item: MenuComponent): void {
    const index = this.items.indexOf(item);
    if (index !== -1) {
      this.items.splice(index, 1);
    }
  }

  display(): void {
    console.log(`\n${this.name}`);
    console.log("=" + "=".repeat(this.name.length));
    this.items.forEach(item => item.display());
  }
}

// Usage
const mainMenu = new Menu("Restaurant Menu");

const appetizers = new Menu("Appetizers");
appetizers.add(new MenuItem("Caesar Salad", 8.99, "Fresh romaine with parmesan"));
appetizers.add(new MenuItem("Soup of the Day", 6.99, "Ask your server"));

const mains = new Menu("Main Courses");
mains.add(new MenuItem("Grilled Salmon", 24.99, "With lemon butter sauce"));
mains.add(new MenuItem("Beef Steak", 29.99, "8oz ribeye with garlic mash"));

const desserts = new Menu("Desserts");
desserts.add(new MenuItem("Chocolate Cake", 7.99, "Rich chocolate with vanilla ice cream"));
desserts.add(new MenuItem("Cheesecake", 6.99, "New York style"));

mainMenu.add(appetizers);
mainMenu.add(mains);
mainMenu.add(desserts);

mainMenu.display();
```

## Safety vs Transparency

### Safe Composite (Recommended)
```javascript
// Safe approach - child management only in Composite
interface Component {
  operation(): void;
}

interface CompositeInterface extends Component {
  add(component: Component): void;
  remove(component: Component): void;
  getChild(index: number): Component | undefined;
}

class Leaf implements Component {
  operation(): void {
    console.log("Leaf operation");
  }
}

class Composite implements CompositeInterface {
  private children: Component[] = [];

  operation(): void {
    console.log("Composite operation");
    this.children.forEach(child => child.operation());
  }

  add(component: Component): void {
    this.children.push(component);
  }

  remove(component: Component): void {
    const index = this.children.indexOf(component);
    if (index !== -1) {
      this.children.splice(index, 1);
    }
  }

  getChild(index: number): Component | undefined {
    return this.children[index];
  }
}
```

### Transparent Composite
```javascript
// Transparent approach - all methods in base interface
interface Component {
  operation(): void;
  add(component: Component): void;    // May not make sense for Leaf
  remove(component: Component): void; // May not make sense for Leaf
  getChild(index: number): Component | undefined;
}

class Leaf implements Component {
  operation(): void {
    console.log("Leaf operation");
  }

  add(component: Component): void {
    throw new Error("Cannot add to a leaf");
  }

  remove(component: Component): void {
    throw new Error("Cannot remove from a leaf");
  }

  getChild(index: number): Component | undefined {
    return undefined;
  }
}
```

## Pros and Cons

### Advantages
- Makes client code simpler (treats complex and primitive objects uniformly)
- Easy to add new component types
- Naturally recursive structure
- Follows Open/Closed Principle
- Works well with other patterns (Iterator, Visitor)

### Disadvantages
- Can make design overly general
- Hard to restrict components of a composite
- Can lead to a design that's too general

## Real-World Examples

### UI Component System
```javascript
interface UIComponent {
  render(): string;
  getWidth(): number;
  getHeight(): number;
}

class Button implements UIComponent {
  constructor(private text: string, private width: number, private height: number) {}

  render(): string {
    return `<button style="width:${this.width}px;height:${this.height}px">${this.text}</button>`;
  }

  getWidth(): number { return this.width; }
  getHeight(): number { return this.height; }
}

class TextInput implements UIComponent {
  constructor(private placeholder: string, private width: number) {}

  render(): string {
    return `<input type="text" placeholder="${this.placeholder}" style="width:${this.width}px;height:30px">`;
  }

  getWidth(): number { return this.width; }
  getHeight(): number { return 30; }
}

class Panel implements UIComponent {
  private components: UIComponent[] = [];
  private direction: 'horizontal' | 'vertical' = 'vertical';

  constructor(direction: 'horizontal' | 'vertical' = 'vertical') {
    this.direction = direction;
  }

  add(component: UIComponent): void {
    this.components.push(component);
  }

  render(): string {
    const style = this.direction === 'horizontal' ? 'display:flex;flex-direction:row' : 'display:flex;flex-direction:column';
    const content = this.components.map(c => c.render()).join('\n');
    return `<div style="${style}">\n${content}\n</div>`;
  }

  getWidth(): number {
    if (this.direction === 'horizontal') {
      return this.components.reduce((sum, c) => sum + c.getWidth(), 0);
    }
    return Math.max(...this.components.map(c => c.getWidth()));
  }

  getHeight(): number {
    if (this.direction === 'vertical') {
      return this.components.reduce((sum, c) => sum + c.getHeight(), 0);
    }
    return Math.max(...this.components.map(c => c.getHeight()));
  }
}

// Usage
const loginForm = new Panel('vertical');
loginForm.add(new TextInput('Username', 200));
loginForm.add(new TextInput('Password', 200));

const buttonPanel = new Panel('horizontal');
buttonPanel.add(new Button('Login', 80, 30));
buttonPanel.add(new Button('Cancel', 80, 30));

loginForm.add(buttonPanel);

console.log(loginForm.render());
```

### Mathematical Expressions
```javascript
interface Expression {
  evaluate(): number;
  toString(): string;
}

class Number implements Expression {
  constructor(private value: number) {}

  evaluate(): number {
    return this.value;
  }

  toString(): string {
    return this.value.toString();
  }
}

class BinaryOperation implements Expression {
  constructor(
    private left: Expression,
    private operator: '+' | '-' | '*' | '/',
    private right: Expression
  ) {}

  evaluate(): number {
    switch (this.operator) {
      case '+': return this.left.evaluate() + this.right.evaluate();
      case '-': return this.left.evaluate() - this.right.evaluate();
      case '*': return this.left.evaluate() * this.right.evaluate();
      case '/': return this.left.evaluate() / this.right.evaluate();
      default: throw new Error(`Unknown operator: ${this.operator}`);
    }
  }

  toString(): string {
    return `(${this.left.toString()} ${this.operator} ${this.right.toString()})`;
  }
}

// Usage: (5 + 3) * (10 - 2)
const expr = new BinaryOperation(
  new BinaryOperation(new Number(5), '+', new Number(3)),
  '*',
  new BinaryOperation(new Number(10), '-', new Number(2))
);

console.log(expr.toString()); // "(5 + 3) * (10 - 2)"
console.log(expr.evaluate()); // 64
```

## Common Use Cases
- File systems (files and directories)
- UI component hierarchies
- Organizational structures
- Menu systems
- Mathematical expressions
- Graphics and drawing applications
- Document structures
- Tree-like data structures