# Facade Pattern

## Overview
The Facade pattern provides a simplified interface to a complex subsystem. It defines a higher-level interface that makes the subsystem easier to use by hiding the complexities of the underlying system from clients.

## When to Use
- When you want to provide a simple interface to a complex subsystem
- When there are many dependencies between clients and implementation classes
- When you want to layer your subsystems
- When you need to wrap a poorly designed collection of APIs
- When you want to reduce coupling between subsystem and clients

## Structure
```
┌─────────────────┐
│     Client      │
└─────────────────┘
         │
         │ uses
         ▼
┌─────────────────┐
│     Facade      │ ──┐
├─────────────────┤   │
│ + operation1()  │   │ coordinates
│ + operation2()  │   │
└─────────────────┘   │
                      │
                      ▼
    ┌─────────────────────────────────────┐
    │           Subsystem Classes         │
    ├─────────────────┬─────────────────┬─┤
    │   ClassA        │    ClassB       │ │
    │ + methodA()     │  + methodB()    │ │
    └─────────────────┼─────────────────┼─┘
    ┌─────────────────┴─────────────────┴─┐
    │   ClassC        │    ClassD       │
    │ + methodC()     │  + methodD()    │
    └─────────────────┴─────────────────┴─┘
```

## Implementation Examples

### JavaScript/TypeScript
```javascript
// Complex subsystem classes
class VideoFile {
  constructor(public filename: string) {}
  
  getCodecType(): string {
    return this.filename.endsWith('.mp4') ? 'MPEG4' : 'OGG';
  }
}

class OggCompressionCodec {
  extract(file: VideoFile): Buffer {
    console.log('Extracting OGG video data...');
    return Buffer.from('OGG video data');
  }
  
  compress(data: Buffer): Buffer {
    console.log('Compressing OGG video...');
    return data;
  }
}

class MPEG4CompressionCodec {
  extract(file: VideoFile): Buffer {
    console.log('Extracting MPEG4 video data...');
    return Buffer.from('MPEG4 video data');
  }
  
  compress(data: Buffer): Buffer {
    console.log('Compressing MPEG4 video...');
    return data;
  }
}

class CodecFactory {
  static getCodec(type: string): OggCompressionCodec | MPEG4CompressionCodec {
    if (type === 'OGG') {
      return new OggCompressionCodec();
    }
    return new MPEG4CompressionCodec();
  }
}

class BitrateReader {
  static read(file: VideoFile, codec: any): Buffer {
    console.log('Reading bitrate information...');
    return Buffer.from('bitrate data');
  }
  
  static convert(buffer: Buffer, format: string): Buffer {
    console.log(`Converting to ${format} format...`);
    return buffer;
  }
}

class AudioMixer {
  static fix(result: Buffer): Buffer {
    console.log('Fixing audio issues...');
    return result;
  }
}

// Facade
class VideoConverter {
  convert(filename: string, format: string): Buffer {
    console.log(`Starting conversion of ${filename} to ${format}`);
    
    const file = new VideoFile(filename);
    const sourceCodec = CodecFactory.getCodec(file.getCodecType());
    const destinationCodec = CodecFactory.getCodec(format);
    
    let buffer = sourceCodec.extract(file);
    buffer = destinationCodec.compress(buffer);
    buffer = BitrateReader.read(file, sourceCodec);
    buffer = BitrateReader.convert(buffer, format);
    buffer = AudioMixer.fix(buffer);
    
    console.log(`Conversion completed!`);
    return buffer;
  }
}

// Usage
const converter = new VideoConverter();
const result = converter.convert('video.mp4', 'OGG');
// Client doesn't need to know about codecs, bitrate readers, audio mixers, etc.
```

### Python
```python
# Complex subsystem classes
class CPU:
    def freeze(self):
        print("CPU: Freezing processor")
    
    def jump(self, position):
        print(f"CPU: Jumping to position {position}")
    
    def execute(self):
        print("CPU: Executing instructions")

class Memory:
    def load(self, position, data):
        print(f"Memory: Loading data '{data}' at position {position}")

class HardDrive:
    def read(self, lba, size):
        print(f"HardDrive: Reading {size} bytes from sector {lba}")
        return f"data_from_sector_{lba}"

class BIOS:
    def __init__(self):
        self.cpu = CPU()
        self.memory = Memory()
        self.hard_drive = HardDrive()
    
    def boot_sequence(self):
        print("BIOS: Starting boot sequence")
        self.cpu.freeze()
        self.memory.load(0, self.hard_drive.read(0, 1024))
        self.cpu.jump(0)
        self.cpu.execute()
        print("BIOS: Boot sequence completed")

# Facade
class ComputerFacade:
    def __init__(self):
        self.bios = BIOS()
    
    def start_computer(self):
        print("Computer: Starting up...")
        self.bios.boot_sequence()
        print("Computer: Ready to use!")
    
    def shutdown_computer(self):
        print("Computer: Shutting down...")
        print("Computer: Powered off!")

# Usage
computer = ComputerFacade()
computer.start_computer()
# Client doesn't need to know about CPU, Memory, HardDrive, BIOS details
computer.shutdown_computer()
```

### Java
```java
// Complex subsystem classes
class Order {
    private String productName;
    private int quantity;
    
    public Order(String productName, int quantity) {
        this.productName = productName;
        this.quantity = quantity;
    }
    
    // Getters
    public String getProductName() { return productName; }
    public int getQuantity() { return quantity; }
}

class InventoryService {
    public boolean isAvailable(String product, int quantity) {
        System.out.println("Checking inventory for " + product);
        return true; // Simulate availability
    }
    
    public void reserveItems(String product, int quantity) {
        System.out.println("Reserving " + quantity + " units of " + product);
    }
}

class PaymentService {
    public boolean processPayment(double amount) {
        System.out.println("Processing payment of $" + amount);
        return true; // Simulate successful payment
    }
}

class ShippingService {
    public void scheduleDelivery(String product, int quantity, String address) {
        System.out.println("Scheduling delivery of " + quantity + " " + product + " to " + address);
    }
}

class NotificationService {
    public void sendOrderConfirmation(String email, String orderDetails) {
        System.out.println("Sending order confirmation to " + email + ": " + orderDetails);
    }
}

// Facade
class OrderFacade {
    private InventoryService inventoryService;
    private PaymentService paymentService;
    private ShippingService shippingService;
    private NotificationService notificationService;
    
    public OrderFacade() {
        this.inventoryService = new InventoryService();
        this.paymentService = new PaymentService();
        this.shippingService = new ShippingService();
        this.notificationService = new NotificationService();
    }
    
    public boolean placeOrder(Order order, String customerEmail, 
                            String shippingAddress, double amount) {
        System.out.println("Processing order for " + order.getProductName());
        
        // Check inventory
        if (!inventoryService.isAvailable(order.getProductName(), order.getQuantity())) {
            System.out.println("Product not available");
            return false;
        }
        
        // Reserve items
        inventoryService.reserveItems(order.getProductName(), order.getQuantity());
        
        // Process payment
        if (!paymentService.processPayment(amount)) {
            System.out.println("Payment failed");
            return false;
        }
        
        // Schedule shipping
        shippingService.scheduleDelivery(order.getProductName(), 
                                       order.getQuantity(), shippingAddress);
        
        // Send confirmation
        notificationService.sendOrderConfirmation(customerEmail, 
                          order.getQuantity() + " x " + order.getProductName());
        
        System.out.println("Order placed successfully!");
        return true;
    }
}

// Usage
public class FacadeExample {
    public static void main(String[] args) {
        OrderFacade orderSystem = new OrderFacade();
        Order order = new Order("Laptop", 1);
        
        orderSystem.placeOrder(order, "customer@email.com", 
                              "123 Main St", 999.99);
        // Client doesn't need to interact with multiple services
    }
}
```

## Facade vs Adapter

### Facade
- **Purpose**: Simplify interface to complex subsystem
- **Scope**: Works with multiple classes/subsystems
- **Intent**: Hide complexity, provide convenience
- **New Interface**: Creates a new, simpler interface

### Adapter
- **Purpose**: Make incompatible interfaces compatible
- **Scope**: Usually works with one class
- **Intent**: Resolve interface incompatibility
- **Existing Interface**: Adapts to an existing interface

```javascript
// Facade - simplifies complex operations
class DatabaseFacade {
  createUser(userData) {
    // Coordinates multiple subsystems
    this.validator.validate(userData);
    this.passwordHash.hash(userData.password);
    this.database.insert('users', userData);
    this.emailService.sendWelcome(userData.email);
  }
}

// Adapter - makes incompatible interfaces work
class LegacyDatabaseAdapter {
  constructor(legacyDb) {
    this.legacyDb = legacyDb;
  }
  
  insert(table, data) {
    // Adapts modern interface to legacy interface
    return this.legacyDb.legacy_insert_method(table, data);
  }
}
```

## Pros and Cons

### Advantages
- Isolates clients from subsystem components
- Promotes weak coupling between subsystem and clients
- Provides a simple interface to complex functionality
- Reduces dependencies
- Can provide additional functionality beyond just simplification

### Disadvantages
- Can become a god object if it tries to do too much
- Can hide important functionality that clients might need
- Might require updates when subsystem changes
- Can introduce an additional layer of indirection

## Real-World Examples

### Database Operations Facade
```javascript
// Complex subsystem classes
class Connection {
  constructor(connectionString: string) {
    console.log(`Connecting to database: ${connectionString}`);
  }
  
  close(): void {
    console.log('Closing database connection');
  }
}

class QueryBuilder {
  private query: string = '';
  
  select(fields: string[]): QueryBuilder {
    this.query = `SELECT ${fields.join(', ')} `;
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
  
  build(): string {
    return this.query.trim();
  }
}

class ResultParser {
  static parse(rawResult: string): any[] {
    console.log('Parsing database results');
    return JSON.parse(rawResult);
  }
}

class CacheManager {
  private cache = new Map<string, any>();
  
  get(key: string): any {
    return this.cache.get(key);
  }
  
  set(key: string, value: any): void {
    this.cache.set(key, value);
  }
  
  has(key: string): boolean {
    return this.cache.has(key);
  }
}

// Facade
class DatabaseFacade {
  private connection: Connection;
  private cache: CacheManager;
  
  constructor(connectionString: string) {
    this.connection = new Connection(connectionString);
    this.cache = new CacheManager();
  }
  
  findUser(id: number): any {
    const cacheKey = `user_${id}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      console.log('Returning cached result');
      return this.cache.get(cacheKey);
    }
    
    // Build query
    const query = new QueryBuilder()
      .select(['id', 'name', 'email'])
      .from('users')
      .where(`id = ${id}`)
      .build();
    
    console.log(`Executing query: ${query}`);
    
    // Simulate database result
    const rawResult = `[{"id": ${id}, "name": "John Doe", "email": "john@example.com"}]`;
    const result = ResultParser.parse(rawResult)[0];
    
    // Cache result
    this.cache.set(cacheKey, result);
    
    return result;
  }
  
  findUsersByRole(role: string): any[] {
    const query = new QueryBuilder()
      .select(['id', 'name', 'email', 'role'])
      .from('users')
      .where(`role = '${role}'`)
      .build();
    
    console.log(`Executing query: ${query}`);
    
    const rawResult = `[{"id": 1, "name": "Admin", "email": "admin@example.com", "role": "${role}"}]`;
    return ResultParser.parse(rawResult);
  }
  
  close(): void {
    this.connection.close();
  }
}

// Usage
const db = new DatabaseFacade('postgresql://localhost:5432/myapp');
const user = db.findUser(123);
const admins = db.findUsersByRole('admin');
db.close();
```

### Home Theater System
```javascript
// Complex subsystem classes
class DVDPlayer {
  on(): void { console.log('DVD Player on'); }
  off(): void { console.log('DVD Player off'); }
  play(movie: string): void { console.log(`Playing "${movie}"`); }
  stop(): void { console.log('DVD Player stopped'); }
}

class Projector {
  on(): void { console.log('Projector on'); }
  off(): void { console.log('Projector off'); }
  setInput(input: string): void { console.log(`Projector input set to ${input}`); }
  wideScreenMode(): void { console.log('Projector in widescreen mode'); }
}

class Screen {
  up(): void { console.log('Screen going up'); }
  down(): void { console.log('Screen coming down'); }
}

class SoundSystem {
  on(): void { console.log('Sound system on'); }
  off(): void { console.log('Sound system off'); }
  setVolume(volume: number): void { console.log(`Sound system volume set to ${volume}`); }
  setSurroundSound(): void { console.log('Sound system set to surround sound'); }
}

class Lights {
  dim(level: number): void { console.log(`Lights dimmed to ${level}%`); }
  on(): void { console.log('Lights on'); }
}

// Facade
class HomeTheaterFacade {
  private dvdPlayer: DVDPlayer;
  private projector: Projector;
  private screen: Screen;
  private soundSystem: SoundSystem;
  private lights: Lights;
  
  constructor(
    dvdPlayer: DVDPlayer,
    projector: Projector,
    screen: Screen,
    soundSystem: SoundSystem,
    lights: Lights
  ) {
    this.dvdPlayer = dvdPlayer;
    this.projector = projector;
    this.screen = screen;
    this.soundSystem = soundSystem;
    this.lights = lights;
  }
  
  watchMovie(movie: string): void {
    console.log('Get ready to watch a movie...');
    
    this.lights.dim(10);
    this.screen.down();
    this.projector.on();
    this.projector.wideScreenMode();
    this.projector.setInput('DVD');
    this.soundSystem.on();
    this.soundSystem.setVolume(5);
    this.soundSystem.setSurroundSound();
    this.dvdPlayer.on();
    this.dvdPlayer.play(movie);
    
    console.log('Movie is now playing. Enjoy!');
  }
  
  endMovie(): void {
    console.log('Shutting down movie theater...');
    
    this.dvdPlayer.stop();
    this.dvdPlayer.off();
    this.soundSystem.off();
    this.projector.off();
    this.screen.up();
    this.lights.on();
    
    console.log('Movie theater is shut down.');
  }
}

// Usage
const homeTheater = new HomeTheaterFacade(
  new DVDPlayer(),
  new Projector(),
  new Screen(),
  new SoundSystem(),
  new Lights()
);

homeTheater.watchMovie('The Matrix');
// ... watch movie ...
homeTheater.endMovie();
```

### Web API Client Facade
```javascript
// Complex subsystem classes
class HttpClient {
  async get(url: string, headers: Record<string, string> = {}): Promise<any> {
    console.log(`GET ${url}`);
    return { data: 'mock data' };
  }
  
  async post(url: string, data: any, headers: Record<string, string> = {}): Promise<any> {
    console.log(`POST ${url}`, data);
    return { data: 'created' };
  }
}

class AuthManager {
  private token: string | null = null;
  
  async login(username: string, password: string): Promise<string> {
    console.log(`Authenticating ${username}`);
    this.token = 'mock-jwt-token';
    return this.token;
  }
  
  getAuthHeaders(): Record<string, string> {
    return this.token ? { 'Authorization': `Bearer ${this.token}` } : {};
  }
  
  logout(): void {
    this.token = null;
  }
}

class DataTransformer {
  static transformUserData(rawData: any): any {
    console.log('Transforming user data');
    return {
      id: rawData.id,
      fullName: `${rawData.firstName} ${rawData.lastName}`,
      email: rawData.emailAddress
    };
  }
}

class ErrorHandler {
  static handle(error: any): never {
    console.error('API Error:', error.message);
    throw new Error(`API call failed: ${error.message}`);
  }
}

// Facade
class UserApiClient {
  private httpClient: HttpClient;
  private authManager: AuthManager;
  private baseUrl: string;
  
  constructor(baseUrl: string) {
    this.httpClient = new HttpClient();
    this.authManager = new AuthManager();
    this.baseUrl = baseUrl;
  }
  
  async authenticate(username: string, password: string): Promise<void> {
    try {
      await this.authManager.login(username, password);
      console.log('Authentication successful');
    } catch (error) {
      ErrorHandler.handle(error);
    }
  }
  
  async getUser(id: number): Promise<any> {
    try {
      const response = await this.httpClient.get(
        `${this.baseUrl}/users/${id}`,
        this.authManager.getAuthHeaders()
      );
      return DataTransformer.transformUserData(response.data);
    } catch (error) {
      ErrorHandler.handle(error);
    }
  }
  
  async createUser(userData: any): Promise<any> {
    try {
      const response = await this.httpClient.post(
        `${this.baseUrl}/users`,
        userData,
        {
          ...this.authManager.getAuthHeaders(),
          'Content-Type': 'application/json'
        }
      );
      return DataTransformer.transformUserData(response.data);
    } catch (error) {
      ErrorHandler.handle(error);
    }
  }
  
  logout(): void {
    this.authManager.logout();
    console.log('Logged out');
  }
}

// Usage
const userApi = new UserApiClient('https://api.example.com');

async function main() {
  await userApi.authenticate('username', 'password');
  const user = await userApi.getUser(123);
  console.log('User:', user);
  
  const newUser = await userApi.createUser({
    firstName: 'Jane',
    lastName: 'Doe',
    emailAddress: 'jane@example.com'
  });
  
  userApi.logout();
}
```

## Common Use Cases
- Simplifying complex APIs or libraries
- Providing a unified interface to multiple subsystems
- Database access layers
- Payment processing systems
- File system operations
- Network communication
- Home automation systems
- E-commerce order processing
- Media processing pipelines