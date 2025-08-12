# Bridge Pattern

## Overview
The Bridge pattern separates an object's abstraction from its implementation so that both can vary independently. It "bridges" the gap between abstraction and implementation by using composition instead of inheritance.

## When to Use
- When you want to avoid permanent binding between abstraction and implementation
- When both abstractions and implementations should be extensible through subclassing
- When changes in implementation should have no impact on clients
- When you need to share implementation among multiple objects
- When you want to hide implementation details from clients completely

## Structure
```
┌─────────────────┐
│   Abstraction   │
├─────────────────┤
│ - implementor   │──────┐
│ + operation()   │      │
└─────────────────┘      │
         △               │
         │               │
┌─────────────────┐      │
│RefinedAbstraction│      │
├─────────────────┤      │
│ + operation()   │      │
└─────────────────┘      │
                         │
                         ▼
                ┌─────────────────┐
                │   Implementor   │
                ├─────────────────┤
                │ + operationImpl()│
                └─────────────────┘
                         △
                         │
              ┌──────────┴──────────┐
              │                     │
    ┌─────────────────┐   ┌─────────────────┐
    │ConcreteImplA    │   │ConcreteImplB    │
    ├─────────────────┤   ├─────────────────┤
    │ + operationImpl()│   │ + operationImpl()│
    └─────────────────┘   └─────────────────┘
```

## Implementation Examples

### JavaScript/TypeScript
```javascript
// Implementation interface
interface Device {
  isEnabled(): boolean;
  enable(): void;
  disable(): void;
  getVolume(): number;
  setVolume(percent: number): void;
  getChannel(): number;
  setChannel(channel: number): void;
}

// Concrete implementations
class TV implements Device {
  private enabled: boolean = false;
  private volume: number = 30;
  private channel: number = 1;

  isEnabled(): boolean {
    return this.enabled;
  }

  enable(): void {
    this.enabled = true;
    console.log("TV is now on");
  }

  disable(): void {
    this.enabled = false;
    console.log("TV is now off");
  }

  getVolume(): number {
    return this.volume;
  }

  setVolume(percent: number): void {
    this.volume = Math.max(0, Math.min(100, percent));
    console.log(`TV volume set to ${this.volume}%`);
  }

  getChannel(): number {
    return this.channel;
  }

  setChannel(channel: number): void {
    this.channel = channel;
    console.log(`TV channel set to ${this.channel}`);
  }
}

class Radio implements Device {
  private enabled: boolean = false;
  private volume: number = 50;
  private channel: number = 1;

  isEnabled(): boolean {
    return this.enabled;
  }

  enable(): void {
    this.enabled = true;
    console.log("Radio is now on");
  }

  disable(): void {
    this.enabled = false;
    console.log("Radio is now off");
  }

  getVolume(): number {
    return this.volume;
  }

  setVolume(percent: number): void {
    this.volume = Math.max(0, Math.min(100, percent));
    console.log(`Radio volume set to ${this.volume}%`);
  }

  getChannel(): number {
    return this.channel;
  }

  setChannel(channel: number): void {
    this.channel = channel;
    console.log(`Radio station set to ${this.channel}`);
  }
}

// Abstraction
class RemoteControl {
  protected device: Device;

  constructor(device: Device) {
    this.device = device;
  }

  togglePower(): void {
    if (this.device.isEnabled()) {
      this.device.disable();
    } else {
      this.device.enable();
    }
  }

  volumeDown(): void {
    this.device.setVolume(this.device.getVolume() - 10);
  }

  volumeUp(): void {
    this.device.setVolume(this.device.getVolume() + 10);
  }

  channelDown(): void {
    this.device.setChannel(this.device.getChannel() - 1);
  }

  channelUp(): void {
    this.device.setChannel(this.device.getChannel() + 1);
  }
}

// Refined abstraction
class AdvancedRemoteControl extends RemoteControl {
  mute(): void {
    this.device.setVolume(0);
  }

  setChannel(channel: number): void {
    this.device.setChannel(channel);
  }

  setVolume(volume: number): void {
    this.device.setVolume(volume);
  }
}

// Usage
const tv = new TV();
const radio = new Radio();

const basicRemote = new RemoteControl(tv);
basicRemote.togglePower(); // TV is now on
basicRemote.volumeUp();    // TV volume set to 40%

const advancedRemote = new AdvancedRemoteControl(radio);
advancedRemote.togglePower(); // Radio is now on
advancedRemote.setVolume(75); // Radio volume set to 75%
advancedRemote.mute();        // Radio volume set to 0%
```

### Python
```python
from abc import ABC, abstractmethod

# Implementation interface
class DrawingAPI(ABC):
    @abstractmethod
    def draw_circle(self, x, y, radius):
        pass
    
    @abstractmethod
    def draw_rectangle(self, x, y, width, height):
        pass

# Concrete implementations
class OpenGLDrawing(DrawingAPI):
    def draw_circle(self, x, y, radius):
        print(f"OpenGL: Drawing circle at ({x}, {y}) with radius {radius}")
    
    def draw_rectangle(self, x, y, width, height):
        print(f"OpenGL: Drawing rectangle at ({x}, {y}) with size {width}x{height}")

class DirectXDrawing(DrawingAPI):
    def draw_circle(self, x, y, radius):
        print(f"DirectX: Drawing circle at ({x}, {y}) with radius {radius}")
    
    def draw_rectangle(self, x, y, width, height):
        print(f"DirectX: Drawing rectangle at ({x}, {y}) with size {width}x{height}")

# Abstraction
class Shape(ABC):
    def __init__(self, drawing_api: DrawingAPI):
        self._drawing_api = drawing_api
    
    @abstractmethod
    def draw(self):
        pass
    
    @abstractmethod
    def resize(self, factor):
        pass

# Refined abstractions
class Circle(Shape):
    def __init__(self, x, y, radius, drawing_api: DrawingAPI):
        super().__init__(drawing_api)
        self._x = x
        self._y = y
        self._radius = radius
    
    def draw(self):
        self._drawing_api.draw_circle(self._x, self._y, self._radius)
    
    def resize(self, factor):
        self._radius *= factor

class Rectangle(Shape):
    def __init__(self, x, y, width, height, drawing_api: DrawingAPI):
        super().__init__(drawing_api)
        self._x = x
        self._y = y
        self._width = width
        self._height = height
    
    def draw(self):
        self._drawing_api.draw_rectangle(self._x, self._y, self._width, self._height)
    
    def resize(self, factor):
        self._width *= factor
        self._height *= factor

# Usage
opengl_api = OpenGLDrawing()
directx_api = DirectXDrawing()

# Same shape with different rendering APIs
circle1 = Circle(10, 20, 5, opengl_api)
circle2 = Circle(10, 20, 5, directx_api)

circle1.draw()  # OpenGL: Drawing circle at (10, 20) with radius 5
circle2.draw()  # DirectX: Drawing circle at (10, 20) with radius 5

rectangle1 = Rectangle(0, 0, 100, 50, opengl_api)
rectangle2 = Rectangle(0, 0, 100, 50, directx_api)

rectangle1.draw()  # OpenGL: Drawing rectangle at (0, 0) with size 100x50
rectangle2.draw()  # DirectX: Drawing rectangle at (0, 0) with size 100x50
```

### Java
```java
// Implementation interface
interface MessageSender {
    void sendMessage(String message, String recipient);
}

// Concrete implementations
class EmailSender implements MessageSender {
    public void sendMessage(String message, String recipient) {
        System.out.println("Email sent to " + recipient + ": " + message);
    }
}

class SMSSender implements MessageSender {
    public void sendMessage(String message, String recipient) {
        System.out.println("SMS sent to " + recipient + ": " + message);
    }
}

class SlackSender implements MessageSender {
    public void sendMessage(String message, String recipient) {
        System.out.println("Slack message sent to " + recipient + ": " + message);
    }
}

// Abstraction
abstract class Message {
    protected MessageSender sender;
    
    public Message(MessageSender sender) {
        this.sender = sender;
    }
    
    public abstract void send(String recipient);
}

// Refined abstractions
class TextMessage extends Message {
    private String content;
    
    public TextMessage(String content, MessageSender sender) {
        super(sender);
        this.content = content;
    }
    
    public void send(String recipient) {
        sender.sendMessage(content, recipient);
    }
}

class EncryptedMessage extends Message {
    private String content;
    
    public EncryptedMessage(String content, MessageSender sender) {
        super(sender);
        this.content = content;
    }
    
    public void send(String recipient) {
        String encryptedContent = encrypt(content);
        sender.sendMessage("[Encrypted] " + encryptedContent, recipient);
    }
    
    private String encrypt(String message) {
        // Simple encryption simulation
        return new StringBuilder(message).reverse().toString();
    }
}

class UrgentMessage extends Message {
    private String content;
    
    public UrgentMessage(String content, MessageSender sender) {
        super(sender);
        this.content = content;
    }
    
    public void send(String recipient) {
        sender.sendMessage("URGENT: " + content, recipient);
    }
}

// Usage
public class BridgeExample {
    public static void main(String[] args) {
        MessageSender emailSender = new EmailSender();
        MessageSender smsSender = new SMSSender();
        MessageSender slackSender = new SlackSender();
        
        Message textEmail = new TextMessage("Hello World", emailSender);
        Message encryptedSMS = new EncryptedMessage("Secret Message", smsSender);
        Message urgentSlack = new UrgentMessage("Server is down!", slackSender);
        
        textEmail.send("john@example.com");
        encryptedSMS.send("+1234567890");
        urgentSlack.send("@channel");
    }
}
```

## Bridge vs Adapter

### Bridge
- **Design time**: Planned separation of abstraction and implementation
- **Purpose**: Let abstraction and implementation vary independently
- **Structure**: Both hierarchies developed in parallel

### Adapter
- **Runtime**: Makes incompatible interfaces work together
- **Purpose**: Make existing classes work with others without modifying their source code
- **Structure**: Wraps existing interface to match expected interface

```javascript
// Bridge - planned separation
class RemoteControl {
  constructor(device) { // Device is abstracted
    this.device = device;
  }
}

// Adapter - making incompatible interfaces work
class LegacyPrinterAdapter {
  constructor(legacyPrinter) {
    this.legacyPrinter = legacyPrinter; // Wraps existing interface
  }
  
  print(document) {
    // Adapts new interface to old one
    this.legacyPrinter.printDocument(document.content);
  }
}
```

## Pros and Cons

### Advantages
- Separates interface from implementation
- Improves extensibility (can extend abstractions and implementations independently)
- Hides implementation details from clients
- Platform independence
- Single Responsibility Principle: focus on high-level logic in abstraction
- Open/Closed Principle: introduce new abstractions and implementations independently

### Disadvantages
- Might make code more complicated by adding extra abstraction layers
- Can be overkill for simple scenarios

## Real-World Examples

### Database Abstraction
```javascript
// Implementation interface
interface DatabaseDriver {
  connect(): void;
  disconnect(): void;
  executeQuery(query: string): any[];
}

// Concrete implementations
class MySQLDriver implements DatabaseDriver {
  connect(): void {
    console.log("Connected to MySQL database");
  }
  
  disconnect(): void {
    console.log("Disconnected from MySQL database");
  }
  
  executeQuery(query: string): any[] {
    console.log(`MySQL: Executing ${query}`);
    return [];
  }
}

class PostgreSQLDriver implements DatabaseDriver {
  connect(): void {
    console.log("Connected to PostgreSQL database");
  }
  
  disconnect(): void {
    console.log("Disconnected from PostgreSQL database");
  }
  
  executeQuery(query: string): any[] {
    console.log(`PostgreSQL: Executing ${query}`);
    return [];
  }
}

// Abstraction
class Database {
  protected driver: DatabaseDriver;
  
  constructor(driver: DatabaseDriver) {
    this.driver = driver;
  }
  
  connect(): void {
    this.driver.connect();
  }
  
  disconnect(): void {
    this.driver.disconnect();
  }
  
  query(sql: string): any[] {
    return this.driver.executeQuery(sql);
  }
}

// Refined abstraction
class TransactionalDatabase extends Database {
  beginTransaction(): void {
    this.driver.executeQuery("BEGIN");
  }
  
  commit(): void {
    this.driver.executeQuery("COMMIT");
  }
  
  rollback(): void {
    this.driver.executeQuery("ROLLBACK");
  }
}
```

### GUI Framework
```javascript
// Implementation interface
interface WindowImpl {
  drawWindow(title: string, x: number, y: number, width: number, height: number): void;
  drawButton(text: string, x: number, y: number): void;
}

// Concrete implementations
class WindowsImpl implements WindowImpl {
  drawWindow(title: string, x: number, y: number, width: number, height: number): void {
    console.log(`Windows: Drawing window "${title}" at (${x},${y}) ${width}x${height}`);
  }
  
  drawButton(text: string, x: number, y: number): void {
    console.log(`Windows: Drawing button "${text}" at (${x},${y})`);
  }
}

class MacImpl implements WindowImpl {
  drawWindow(title: string, x: number, y: number, width: number, height: number): void {
    console.log(`Mac: Drawing window "${title}" at (${x},${y}) ${width}x${height}`);
  }
  
  drawButton(text: string, x: number, y: number): void {
    console.log(`Mac: Drawing button "${text}" at (${x},${y})`);
  }
}

// Abstraction
class Window {
  protected impl: WindowImpl;
  protected title: string;
  
  constructor(impl: WindowImpl, title: string) {
    this.impl = impl;
    this.title = title;
  }
  
  draw(x: number, y: number, width: number, height: number): void {
    this.impl.drawWindow(this.title, x, y, width, height);
  }
}

// Refined abstractions
class DialogWindow extends Window {
  private buttons: string[] = [];
  
  addButton(text: string): void {
    this.buttons.push(text);
  }
  
  draw(x: number, y: number, width: number, height: number): void {
    super.draw(x, y, width, height);
    this.buttons.forEach((button, index) => {
      this.impl.drawButton(button, x + 10, y + 30 + index * 30);
    });
  }
}

// Usage
const windowsDialog = new DialogWindow(new WindowsImpl(), "Settings");
windowsDialog.addButton("OK");
windowsDialog.addButton("Cancel");
windowsDialog.draw(100, 100, 300, 200);

const macDialog = new DialogWindow(new MacImpl(), "Settings");
macDialog.addButton("OK");
macDialog.addButton("Cancel");
macDialog.draw(100, 100, 300, 200);
```

## Common Use Cases
- Cross-platform applications (UI, databases, file systems)
- Device drivers
- Graphics rendering systems
- Messaging systems
- Payment gateways
- Cloud service abstractions
- Plugin architectures
- Multi-database applications