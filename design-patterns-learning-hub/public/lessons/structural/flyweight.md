# Flyweight Pattern

## Overview
The Flyweight pattern minimizes memory usage by sharing efficiently stored data among multiple similar objects. Instead of storing all data in each object, the flyweight separates intrinsic state (shared) from extrinsic state (context-specific) to reduce memory footprint.

## When to Use
- When your application needs to spawn a large number of similar objects
- When the storage costs of objects are high due to sheer quantity
- When most object state can be made extrinsic
- When groups of objects may be replaced by relatively few shared objects
- When the application doesn't depend on object identity

## Structure
```
┌─────────────────┐
│     Client      │
└─────────────────┘
         │
         │ uses
         ▼
┌─────────────────┐     ┌─────────────────┐
│FlyweightFactory │────▶│   Flyweight     │
├─────────────────┤     ├─────────────────┤
│ + getFlyweight()│     │ + operation()   │
│ - flyweights    │     └─────────────────┘
└─────────────────┘              △
                                 │
                    ┌────────────┴────────────┐
                    │                         │
         ┌─────────────────┐      ┌─────────────────┐
         │ConcreteFlyweight│      │UnsharedConcrete │
         ├─────────────────┤      │   Flyweight     │
         │ - intrinsicState│      ├─────────────────┤
         │ + operation()   │      │ - allState      │
         └─────────────────┘      │ + operation()   │
                                  └─────────────────┘
```

## Implementation Examples

### JavaScript/TypeScript
```javascript
// Flyweight interface
interface TreeType {
  render(canvas: string, x: number, y: number): void;
}

// Concrete Flyweight - stores intrinsic state
class ConcreteTreeType implements TreeType {
  private name: string;
  private color: string;
  private sprite: string;

  constructor(name: string, color: string, sprite: string) {
    this.name = name;
    this.color = color;
    this.sprite = sprite;
  }

  render(canvas: string, x: number, y: number): void {
    console.log(`Rendering ${this.name} tree (${this.color}) at (${x}, ${y}) on ${canvas}`);
    // Here you would actually draw the sprite
  }
}

// Flyweight Factory
class TreeTypeFactory {
  private static treeTypes: Map<string, TreeType> = new Map();

  static getTreeType(name: string, color: string, sprite: string): TreeType {
    const key = `${name}_${color}`;
    
    if (!this.treeTypes.has(key)) {
      console.log(`Creating new tree type: ${key}`);
      this.treeTypes.set(key, new ConcreteTreeType(name, color, sprite));
    } else {
      console.log(`Reusing existing tree type: ${key}`);
    }
    
    return this.treeTypes.get(key)!;
  }

  static getCreatedTreeTypes(): number {
    return this.treeTypes.size;
  }
}

// Context - stores extrinsic state
class Tree {
  private x: number;
  private y: number;
  private type: TreeType;

  constructor(x: number, y: number, type: TreeType) {
    this.x = x;
    this.y = y;
    this.type = type;
  }

  render(canvas: string): void {
    this.type.render(canvas, this.x, this.y);
  }
}

// Client - manages context objects
class Forest {
  private trees: Tree[] = [];

  plantTree(x: number, y: number, name: string, color: string, sprite: string): void {
    const type = TreeTypeFactory.getTreeType(name, color, sprite);
    const tree = new Tree(x, y, type);
    this.trees.push(tree);
  }

  render(canvas: string): void {
    console.log(`\nRendering ${this.trees.length} trees:`);
    this.trees.forEach(tree => tree.render(canvas));
    console.log(`Total tree types created: ${TreeTypeFactory.getCreatedTreeTypes()}`);
  }
}

// Usage
const forest = new Forest();

// Plant many trees - but only a few types will be created
for (let i = 0; i < 1000; i++) {
  const x = Math.floor(Math.random() * 100);
  const y = Math.floor(Math.random() * 100);
  
  if (i % 3 === 0) {
    forest.plantTree(x, y, 'Oak', 'Green', 'oak_sprite.png');
  } else if (i % 3 === 1) {
    forest.plantTree(x, y, 'Pine', 'Dark Green', 'pine_sprite.png');
  } else {
    forest.plantTree(x, y, 'Birch', 'Light Green', 'birch_sprite.png');
  }
}

forest.render('MainCanvas');
// Only 3 tree types created despite 1000 tree instances
```

### Python
```python
import weakref
from typing import Dict, Optional

# Flyweight interface
class Character:
    def display(self, font_size: int, color: str, x: int, y: int) -> None:
        pass

# Concrete Flyweight
class ConcreteCharacter(Character):
    def __init__(self, symbol: str):
        self._symbol = symbol  # Intrinsic state
    
    def display(self, font_size: int, color: str, x: int, y: int) -> None:
        print(f"Displaying '{self._symbol}' at ({x}, {y}) with size {font_size} and color {color}")

# Flyweight Factory
class CharacterFactory:
    _characters: Dict[str, Character] = {}
    
    @classmethod
    def get_character(cls, symbol: str) -> Character:
        if symbol not in cls._characters:
            print(f"Creating new character flyweight for: '{symbol}'")
            cls._characters[symbol] = ConcreteCharacter(symbol)
        else:
            print(f"Reusing existing character flyweight for: '{symbol}'")
        
        return cls._characters[symbol]
    
    @classmethod
    def get_created_characters_count(cls) -> int:
        return len(cls._characters)

# Context
class CharacterContext:
    def __init__(self, character: Character, font_size: int, color: str, x: int, y: int):
        self._character = character
        self._font_size = font_size  # Extrinsic state
        self._color = color          # Extrinsic state
        self._x = x                  # Extrinsic state
        self._y = y                  # Extrinsic state
    
    def display(self) -> None:
        self._character.display(self._font_size, self._color, self._x, self._y)

# Client
class TextEditor:
    def __init__(self):
        self._characters = []
    
    def add_character(self, symbol: str, font_size: int, color: str, x: int, y: int) -> None:
        character = CharacterFactory.get_character(symbol)
        context = CharacterContext(character, font_size, color, x, y)
        self._characters.append(context)
    
    def display_text(self) -> None:
        print(f"\nDisplaying {len(self._characters)} characters:")
        for char_context in self._characters:
            char_context.display()
        print(f"Total unique character flyweights: {CharacterFactory.get_created_characters_count()}")

# Usage
editor = TextEditor()

# Add text "HELLO WORLD" with various formatting
text = "HELLO WORLD"
x_pos = 0

for char in text:
    if char == ' ':
        x_pos += 10
        continue
    
    editor.add_character(char, 12, 'black', x_pos, 10)
    x_pos += 8

# Add more text with different formatting
for i, char in enumerate("hello world"):
    if char == ' ':
        continue
    editor.add_character(char.upper(), 16, 'blue', i * 10, 30)

editor.display_text()
# Only unique characters are stored as flyweights
```

### Java
```java
import java.util.*;

// Flyweight interface
interface Shape {
    void draw(int x, int y, int radius, String color);
}

// Concrete Flyweight
class Circle implements Shape {
    private String type; // Intrinsic state
    
    public Circle(String type) {
        this.type = type;
        System.out.println("Creating circle flyweight of type: " + type);
    }
    
    public void draw(int x, int y, int radius, String color) {
        System.out.println("Drawing " + type + " circle at (" + x + ", " + y + 
                          ") with radius " + radius + " and color " + color);
    }
}

// Flyweight Factory
class ShapeFactory {
    private static final Map<String, Shape> shapes = new HashMap<>();
    
    public static Shape getCircle(String type) {
        if (!shapes.containsKey(type)) {
            shapes.put(type, new Circle(type));
        } else {
            System.out.println("Reusing existing circle flyweight of type: " + type);
        }
        return shapes.get(type);
    }
    
    public static int getCreatedShapesCount() {
        return shapes.size();
    }
}

// Context
class DrawingContext {
    private Shape shape;
    private int x, y, radius;
    private String color;
    
    public DrawingContext(Shape shape, int x, int y, int radius, String color) {
        this.shape = shape;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }
    
    public void draw() {
        shape.draw(x, y, radius, color);
    }
}

// Client
class DrawingApplication {
    private List<DrawingContext> contexts = new ArrayList<>();
    
    public void addCircle(String type, int x, int y, int radius, String color) {
        Shape circle = ShapeFactory.getCircle(type);
        contexts.add(new DrawingContext(circle, x, y, radius, color));
    }
    
    public void drawAll() {
        System.out.println("\nDrawing " + contexts.size() + " shapes:");
        for (DrawingContext context : contexts) {
            context.draw();
        }
        System.out.println("Total flyweights created: " + ShapeFactory.getCreatedShapesCount());
    }
}

// Usage
public class FlyweightExample {
    public static void main(String[] args) {
        DrawingApplication app = new DrawingApplication();
        Random random = new Random();
        
        String[] types = {"Solid", "Dotted", "Dashed"};
        String[] colors = {"Red", "Blue", "Green", "Yellow"};
        
        // Create many circles with few types
        for (int i = 0; i < 20; i++) {
            String type = types[random.nextInt(types.length)];
            String color = colors[random.nextInt(colors.length)];
            int x = random.nextInt(100);
            int y = random.nextInt(100);
            int radius = random.nextInt(20) + 5;
            
            app.addCircle(type, x, y, radius, color);
        }
        
        app.drawAll();
    }
}
```

## Intrinsic vs Extrinsic State

### Intrinsic State (Flyweight)
- Independent of flyweight's context
- Stored in the flyweight
- Shared among objects
- Immutable

### Extrinsic State (Context)
- Varies with flyweight's context
- Stored by client
- Passed to flyweight methods
- Can be computed on the fly

```javascript
// Example of separating states
class Bullet {
  // Intrinsic state (shared)
  constructor(
    private sprite: string,
    private damage: number,
    private speed: number
  ) {}

  // Extrinsic state passed as parameters
  fire(x: number, y: number, direction: number, shooter: string): void {
    console.log(`${shooter} fires bullet from (${x}, ${y}) in direction ${direction}`);
    console.log(`Bullet: ${this.sprite}, damage: ${this.damage}, speed: ${this.speed}`);
  }
}

class BulletFactory {
  private static bullets = new Map<string, Bullet>();

  static getBullet(type: string): Bullet {
    if (!this.bullets.has(type)) {
      switch (type) {
        case 'pistol':
          this.bullets.set(type, new Bullet('bullet_small.png', 10, 300));
          break;
        case 'rifle':
          this.bullets.set(type, new Bullet('bullet_medium.png', 25, 500));
          break;
        case 'sniper':
          this.bullets.set(type, new Bullet('bullet_large.png', 50, 800));
          break;
      }
    }
    return this.bullets.get(type)!;
  }
}

// Usage - many bullets, few flyweights
const pistolBullet = BulletFactory.getBullet('pistol');
pistolBullet.fire(10, 20, 45, 'Player1');
pistolBullet.fire(15, 25, 90, 'Player2'); // Same flyweight, different context
```

## Pros and Cons

### Advantages
- Reduces memory consumption when dealing with large numbers of objects
- Can improve performance by reducing memory allocation
- Centralizes state management
- Can reduce the total number of objects in the system

### Disadvantages
- Can introduce runtime overhead if extrinsic state needs to be computed
- Code becomes more complex
- Can trade CPU cycles for memory savings
- May not be worth it if objects aren't actually shared much

## Real-World Examples

### Text Editor Characters
```javascript
interface TextCharacter {
  render(x: number, y: number, fontSize: number, color: string, fontFamily: string): void;
}

class Character implements TextCharacter {
  constructor(private symbol: string) {
    console.log(`Creating character flyweight: '${symbol}'`);
  }

  render(x: number, y: number, fontSize: number, color: string, fontFamily: string): void {
    console.log(`Rendering '${this.symbol}' at (${x}, ${y}) - ${fontSize}px ${fontFamily} ${color}`);
  }
}

class CharacterFactory {
  private static characters = new Map<string, TextCharacter>();

  static getCharacter(symbol: string): TextCharacter {
    if (!this.characters.has(symbol)) {
      this.characters.set(symbol, new Character(symbol));
    }
    return this.characters.get(symbol)!;
  }

  static getCharacterCount(): number {
    return this.characters.size;
  }
}

class FormattedCharacter {
  constructor(
    private character: TextCharacter,
    private x: number,
    private y: number,
    private fontSize: number,
    private color: string,
    private fontFamily: string
  ) {}

  render(): void {
    this.character.render(this.x, this.y, this.fontSize, this.color, this.fontFamily);
  }
}

class Document {
  private characters: FormattedCharacter[] = [];

  addText(text: string, x: number, y: number, fontSize: number, color: string, fontFamily: string): void {
    let currentX = x;
    for (const char of text) {
      if (char === ' ') {
        currentX += fontSize / 2;
        continue;
      }
      
      const flyweight = CharacterFactory.getCharacter(char);
      const formatted = new FormattedCharacter(flyweight, currentX, y, fontSize, color, fontFamily);
      this.characters.push(formatted);
      currentX += fontSize;
    }
  }

  render(): void {
    console.log(`\nRendering document with ${this.characters.length} characters:`);
    this.characters.forEach(char => char.render());
    console.log(`Character flyweights created: ${CharacterFactory.getCharacterCount()}`);
  }
}

// Usage
const doc = new Document();
doc.addText("Hello World", 0, 0, 12, "black", "Arial");
doc.addText("Hello Again", 0, 20, 14, "blue", "Times");
doc.addText("HELLO", 0, 40, 16, "red", "Helvetica");
doc.render();
```

### Game Particles
```javascript
interface Particle {
  render(x: number, y: number, velocity: [number, number], color: string, size: number): void;
}

class ParticleType implements Particle {
  constructor(
    private shape: string,
    private texture: string
  ) {
    console.log(`Creating particle flyweight: ${shape} with texture ${texture}`);
  }

  render(x: number, y: number, velocity: [number, number], color: string, size: number): void {
    console.log(`Rendering ${this.shape} particle at (${x}, ${y}) moving at [${velocity[0]}, ${velocity[1]}] - ${color} ${size}px`);
  }
}

class ParticleFactory {
  private static particles = new Map<string, Particle>();

  static getParticle(shape: string, texture: string): Particle {
    const key = `${shape}_${texture}`;
    
    if (!this.particles.has(key)) {
      this.particles.set(key, new ParticleType(shape, texture));
    }
    
    return this.particles.get(key)!;
  }

  static getParticleTypeCount(): number {
    return this.particles.size;
  }
}

class ActiveParticle {
  constructor(
    private particle: Particle,
    private x: number,
    private y: number,
    private velocity: [number, number],
    private color: string,
    private size: number,
    private life: number
  ) {}

  update(deltaTime: number): boolean {
    this.x += this.velocity[0] * deltaTime;
    this.y += this.velocity[1] * deltaTime;
    this.life -= deltaTime;
    return this.life > 0;
  }

  render(): void {
    this.particle.render(this.x, this.y, this.velocity, this.color, this.size);
  }
}

class ParticleSystem {
  private particles: ActiveParticle[] = [];

  createExplosion(x: number, y: number): void {
    // Create many particles of few types
    for (let i = 0; i < 50; i++) {
      const angle = (i / 50) * 2 * Math.PI;
      const speed = Math.random() * 100 + 50;
      const velocity: [number, number] = [
        Math.cos(angle) * speed,
        Math.sin(angle) * speed
      ];
      
      const particleType = Math.random() < 0.5 ? 'spark' : 'smoke';
      const texture = particleType === 'spark' ? 'spark.png' : 'smoke.png';
      
      const flyweight = ParticleFactory.getParticle(particleType, texture);
      const particle = new ActiveParticle(
        flyweight,
        x + Math.random() * 10 - 5,
        y + Math.random() * 10 - 5,
        velocity,
        particleType === 'spark' ? 'orange' : 'gray',
        Math.random() * 5 + 2,
        Math.random() * 2 + 1
      );
      
      this.particles.push(particle);
    }
  }

  update(deltaTime: number): void {
    this.particles = this.particles.filter(particle => particle.update(deltaTime));
  }

  render(): void {
    console.log(`\nRendering ${this.particles.length} active particles:`);
    this.particles.slice(0, 5).forEach(particle => particle.render()); // Show first 5
    console.log(`... and ${this.particles.length - 5} more`);
    console.log(`Particle flyweights created: ${ParticleFactory.getParticleTypeCount()}`);
  }
}

// Usage
const particleSystem = new ParticleSystem();
particleSystem.createExplosion(100, 100);
particleSystem.render();
```

### Web Page Elements
```javascript
interface WebElement {
  render(id: string, className: string, content: string, styles: Record<string, string>): string;
}

class ButtonElement implements WebElement {
  constructor(private type: 'primary' | 'secondary' | 'danger') {
    console.log(`Creating button flyweight: ${type}`);
  }

  render(id: string, className: string, content: string, styles: Record<string, string>): string {
    const baseStyles = this.getBaseStyles();
    const allStyles = { ...baseStyles, ...styles };
    const styleString = Object.entries(allStyles).map(([key, value]) => `${key}: ${value}`).join('; ');
    
    return `<button id="${id}" class="${className}" style="${styleString}">${content}</button>`;
  }

  private getBaseStyles(): Record<string, string> {
    const base = { padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer' };
    
    switch (this.type) {
      case 'primary':
        return { ...base, backgroundColor: '#007bff', color: 'white' };
      case 'secondary':
        return { ...base, backgroundColor: '#6c757d', color: 'white' };
      case 'danger':
        return { ...base, backgroundColor: '#dc3545', color: 'white' };
    }
  }
}

class ElementFactory {
  private static elements = new Map<string, WebElement>();

  static getButton(type: 'primary' | 'secondary' | 'danger'): WebElement {
    if (!this.elements.has(type)) {
      this.elements.set(type, new ButtonElement(type));
    }
    return this.elements.get(type)!;
  }

  static getElementCount(): number {
    return this.elements.size;
  }
}

class WebPageElement {
  constructor(
    private element: WebElement,
    private id: string,
    private className: string,
    private content: string,
    private styles: Record<string, string> = {}
  ) {}

  render(): string {
    return this.element.render(this.id, this.className, this.content, this.styles);
  }
}

class WebPage {
  private elements: WebPageElement[] = [];

  addButton(type: 'primary' | 'secondary' | 'danger', id: string, content: string, className: string = '', styles: Record<string, string> = {}): void {
    const flyweight = ElementFactory.getButton(type);
    const element = new WebPageElement(flyweight, id, className, content, styles);
    this.elements.push(element);
  }

  render(): string {
    console.log(`\nRendering page with ${this.elements.length} elements:`);
    const html = this.elements.map(element => element.render()).join('\n');
    console.log(`Element flyweights created: ${ElementFactory.getElementCount()}`);
    return html;
  }
}

// Usage
const page = new WebPage();

page.addButton('primary', 'btn1', 'Save', 'save-btn');
page.addButton('secondary', 'btn2', 'Cancel', 'cancel-btn');
page.addButton('danger', 'btn3', 'Delete', 'delete-btn');
page.addButton('primary', 'btn4', 'Submit', 'submit-btn', { fontSize: '16px' });
page.addButton('primary', 'btn5', 'Continue', 'continue-btn');

const html = page.render();
console.log('\nGenerated HTML:');
console.log(html);
```

## Common Use Cases
- Text editors (character rendering)
- Game development (particles, sprites, terrain tiles)
- Web browsers (DOM elements, CSS styles)
- Graphics applications (shapes, brushes)
- Document processing (formatting objects)
- UI frameworks (reusable components)
- Map applications (map tiles, markers)
- Database systems (cached objects)