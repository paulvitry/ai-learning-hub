# Proxy Pattern

## Overview
The Proxy pattern provides a placeholder or surrogate for another object to control access to it. The proxy acts as an intermediary between the client and the real object, allowing you to perform additional operations before or after requests are forwarded to the real object.

## When to Use
- When you need lazy initialization of expensive objects
- When you want to control access to an object
- When you need to cache results of expensive operations
- When you want to add logging, monitoring, or validation
- When the object is located remotely (Remote Proxy)
- When you need reference counting or smart pointers

## Structure
```
┌─────────────────┐
│     Client      │
└─────────────────┘
         │
         │ uses
         ▼
┌─────────────────┐
│     Subject     │
├─────────────────┤
│ + request()     │
└─────────────────┘
         △
         │
┌────────┴────────┐
│                 │
┌─────────────────┐  ┌─────────────────┐
│   RealSubject   │  │      Proxy      │
├─────────────────┤  ├─────────────────┤
│ + request()     │  │ - realSubject   │──┐
└─────────────────┘  │ + request()     │  │
                     └─────────────────┘  │
                              │           │
                              └───────────┘
```

## Types of Proxies

### Virtual Proxy (Lazy Loading)
```javascript
interface Image {
  display(): void;
}

class RealImage implements Image {
  private filename: string;

  constructor(filename: string) {
    this.filename = filename;
    this.loadFromDisk();
  }

  private loadFromDisk(): void {
    console.log(`Loading image from disk: ${this.filename}`);
    // Simulate expensive loading operation
  }

  display(): void {
    console.log(`Displaying image: ${this.filename}`);
  }
}

class ImageProxy implements Image {
  private realImage: RealImage | null = null;
  private filename: string;

  constructor(filename: string) {
    this.filename = filename;
  }

  display(): void {
    if (this.realImage === null) {
      console.log('Creating real image (lazy loading)');
      this.realImage = new RealImage(this.filename);
    }
    this.realImage.display();
  }
}

// Usage
const image1 = new ImageProxy('photo1.jpg');
const image2 = new ImageProxy('photo2.jpg');

console.log('Images created (but not loaded yet)');
image1.display(); // Now loads and displays
image1.display(); // Just displays (already loaded)
```

### Protection Proxy (Access Control)
```javascript
interface Document {
  read(): string;
  write(content: string): void;
}

class SecureDocument implements Document {
  private content: string = 'Confidential content';

  read(): string {
    return this.content;
  }

  write(content: string): void {
    this.content = content;
    console.log('Document updated');
  }
}

class DocumentProxy implements Document {
  private realDocument: SecureDocument;
  private userRole: string;

  constructor(userRole: string) {
    this.realDocument = new SecureDocument();
    this.userRole = userRole;
  }

  read(): string {
    if (this.hasReadAccess()) {
      return this.realDocument.read();
    }
    throw new Error('Access denied: insufficient permissions to read');
  }

  write(content: string): void {
    if (this.hasWriteAccess()) {
      this.realDocument.write(content);
    } else {
      throw new Error('Access denied: insufficient permissions to write');
    }
  }

  private hasReadAccess(): boolean {
    return ['user', 'admin', 'editor'].includes(this.userRole);
  }

  private hasWriteAccess(): boolean {
    return ['admin', 'editor'].includes(this.userRole);
  }
}

// Usage
const adminDoc = new DocumentProxy('admin');
const userDoc = new DocumentProxy('user');
const guestDoc = new DocumentProxy('guest');

console.log(adminDoc.read()); // Works
adminDoc.write('New content'); // Works

console.log(userDoc.read()); // Works
// userDoc.write('User content'); // Would throw error

// guestDoc.read(); // Would throw error
```

### Caching Proxy
```javascript
interface DataService {
  getData(key: string): any;
}

class ExpensiveDataService implements DataService {
  getData(key: string): any {
    console.log(`Fetching data for key: ${key} (expensive operation)`);
    // Simulate expensive database/API call
    return { key, data: `Data for ${key}`, timestamp: Date.now() };
  }
}

class CachingProxy implements DataService {
  private realService: ExpensiveDataService;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheTimeout: number = 5000; // 5 seconds

  constructor() {
    this.realService = new ExpensiveDataService();
  }

  getData(key: string): any {
    const cached = this.cache.get(key);
    const now = Date.now();

    if (cached && (now - cached.timestamp) < this.cacheTimeout) {
      console.log(`Cache hit for key: ${key}`);
      return cached.data;
    }

    console.log(`Cache miss for key: ${key}`);
    const data = this.realService.getData(key);
    this.cache.set(key, { data, timestamp: now });
    return data;
  }
}

// Usage
const dataService = new CachingProxy();

console.log(dataService.getData('user:123')); // Cache miss
console.log(dataService.getData('user:123')); // Cache hit
console.log(dataService.getData('user:456')); // Cache miss
console.log(dataService.getData('user:123')); // Cache hit
```

## Implementation Examples

### JavaScript/TypeScript - Remote Proxy
```javascript
interface UserService {
  getUser(id: number): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User>;
}

interface User {
  id: number;
  name: string;
  email: string;
}

class RemoteUserService implements UserService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async getUser(id: number): Promise<User> {
    console.log(`Making HTTP request to ${this.baseUrl}/users/${id}`);
    // Simulate HTTP request
    await this.delay(1000);
    return { id, name: `User ${id}`, email: `user${id}@example.com` };
  }

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    console.log(`Making HTTP PUT request to ${this.baseUrl}/users/${id}`);
    await this.delay(800);
    return { id, name: data.name || `User ${id}`, email: data.email || `user${id}@example.com` };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

class UserServiceProxy implements UserService {
  private realService: RemoteUserService;
  private cache: Map<number, { user: User; timestamp: number }> = new Map();
  private pendingRequests: Map<number, Promise<User>> = new Map();

  constructor(baseUrl: string) {
    this.realService = new RemoteUserService(baseUrl);
  }

  async getUser(id: number): Promise<User> {
    // Check cache first
    const cached = this.cache.get(id);
    if (cached && (Date.now() - cached.timestamp) < 60000) { // 1 minute cache
      console.log(`Returning cached user ${id}`);
      return cached.user;
    }

    // Check if request is already pending
    if (this.pendingRequests.has(id)) {
      console.log(`Request for user ${id} already pending, waiting...`);
      return this.pendingRequests.get(id)!;
    }

    // Make new request
    const requestPromise = this.realService.getUser(id);
    this.pendingRequests.set(id, requestPromise);

    try {
      const user = await requestPromise;
      this.cache.set(id, { user, timestamp: Date.now() });
      return user;
    } finally {
      this.pendingRequests.delete(id);
    }
  }

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const user = await this.realService.updateUser(id, data);
    // Update cache with new data
    this.cache.set(id, { user, timestamp: Date.now() });
    return user;
  }
}

// Usage
async function demonstrateUserService() {
  const userService = new UserServiceProxy('https://api.example.com');

  const user1 = await userService.getUser(1); // Remote call
  const user1Again = await userService.getUser(1); // Cached

  // Concurrent requests
  const [user2, user2Again] = await Promise.all([
    userService.getUser(2),
    userService.getUser(2)
  ]); // Second request waits for first

  console.log({ user1, user1Again, user2, user2Again });
}
```

### Python - Virtual Proxy
```python
from abc import ABC, abstractmethod
import time

class DatabaseConnection(ABC):
    @abstractmethod
    def query(self, sql: str):
        pass
    
    @abstractmethod
    def close(self):
        pass

class RealDatabaseConnection(DatabaseConnection):
    def __init__(self, connection_string: str):
        self.connection_string = connection_string
        self._connect()
    
    def _connect(self):
        print(f"Establishing expensive database connection to {self.connection_string}")
        time.sleep(2)  # Simulate connection time
        print("Database connection established")
    
    def query(self, sql: str):
        print(f"Executing query: {sql}")
        return f"Results for: {sql}"
    
    def close(self):
        print("Closing database connection")

class DatabaseConnectionProxy(DatabaseConnection):
    def __init__(self, connection_string: str):
        self.connection_string = connection_string
        self._real_connection = None
        self._closed = False
    
    def query(self, sql: str):
        if self._closed:
            raise Exception("Connection is closed")
        
        if self._real_connection is None:
            print("Lazy loading: creating real database connection")
            self._real_connection = RealDatabaseConnection(self.connection_string)
        
        return self._real_connection.query(sql)
    
    def close(self):
        if self._real_connection:
            self._real_connection.close()
        self._closed = True
        print("Proxy connection closed")

# Usage
def demonstrate_database_proxy():
    print("Creating database proxy (no real connection yet)")
    db = DatabaseConnectionProxy("postgresql://localhost/mydb")
    
    print("\nFirst query (triggers real connection)")
    result1 = db.query("SELECT * FROM users")
    
    print("\nSecond query (uses existing connection)")
    result2 = db.query("SELECT * FROM orders")
    
    print("\nClosing connection")
    db.close()

demonstrate_database_proxy()
```

### Java - Protection Proxy
```java
interface FileManager {
    String readFile(String filename);
    void writeFile(String filename, String content);
    void deleteFile(String filename);
}

class SystemFileManager implements FileManager {
    public String readFile(String filename) {
        System.out.println("Reading file: " + filename);
        return "File content of " + filename;
    }
    
    public void writeFile(String filename, String content) {
        System.out.println("Writing to file: " + filename);
        System.out.println("Content: " + content);
    }
    
    public void deleteFile(String filename) {
        System.out.println("Deleting file: " + filename);
    }
}

class SecureFileManagerProxy implements FileManager {
    private SystemFileManager realFileManager;
    private String userRole;
    private String currentUser;
    
    public SecureFileManagerProxy(String userRole, String currentUser) {
        this.realFileManager = new SystemFileManager();
        this.userRole = userRole;
        this.currentUser = currentUser;
    }
    
    public String readFile(String filename) {
        if (hasReadPermission(filename)) {
            logAccess("READ", filename);
            return realFileManager.readFile(filename);
        }
        throw new SecurityException("Access denied: Cannot read " + filename);
    }
    
    public void writeFile(String filename, String content) {
        if (hasWritePermission(filename)) {
            logAccess("WRITE", filename);
            realFileManager.writeFile(filename, content);
        } else {
            throw new SecurityException("Access denied: Cannot write to " + filename);
        }
    }
    
    public void deleteFile(String filename) {
        if (hasDeletePermission(filename)) {
            logAccess("DELETE", filename);
            realFileManager.deleteFile(filename);
        } else {
            throw new SecurityException("Access denied: Cannot delete " + filename);
        }
    }
    
    private boolean hasReadPermission(String filename) {
        return true; // Everyone can read
    }
    
    private boolean hasWritePermission(String filename) {
        return userRole.equals("admin") || userRole.equals("editor") || 
               filename.startsWith(currentUser + "_");
    }
    
    private boolean hasDeletePermission(String filename) {
        return userRole.equals("admin") || filename.startsWith(currentUser + "_");
    }
    
    private void logAccess(String operation, String filename) {
        System.out.println("AUDIT: " + currentUser + " (" + userRole + ") " + 
                          operation + " " + filename);
    }
}

// Usage
public class ProxyExample {
    public static void main(String[] args) {
        FileManager adminFileManager = new SecureFileManagerProxy("admin", "adminUser");
        FileManager userFileManager = new SecureFileManagerProxy("user", "johnDoe");
        
        // Admin operations
        System.out.println("=== Admin Operations ===");
        adminFileManager.readFile("system_config.txt");
        adminFileManager.writeFile("system_config.txt", "new config");
        adminFileManager.deleteFile("temp.txt");
        
        // User operations
        System.out.println("\n=== User Operations ===");
        userFileManager.readFile("public_doc.txt");
        userFileManager.writeFile("johnDoe_personal.txt", "personal data");
        
        try {
            userFileManager.deleteFile("system_config.txt"); // Should fail
        } catch (SecurityException e) {
            System.out.println("Expected security exception: " + e.getMessage());
        }
    }
}
```

## Smart Pointers (Reference Counting)
```javascript
class SmartProxy<T> {
  private static references = new Map<object, number>();
  private target: T;

  constructor(target: T) {
    this.target = target;
    this.addReference();
  }

  private addReference(): void {
    const count = SmartProxy.references.get(this.target) || 0;
    SmartProxy.references.set(this.target, count + 1);
    console.log(`Reference count for object: ${SmartProxy.references.get(this.target)}`);
  }

  private removeReference(): void {
    const count = SmartProxy.references.get(this.target) || 0;
    if (count <= 1) {
      SmartProxy.references.delete(this.target);
      console.log('Object can be garbage collected');
    } else {
      SmartProxy.references.set(this.target, count - 1);
      console.log(`Reference count decreased to: ${count - 1}`);
    }
  }

  get(): T {
    return this.target;
  }

  destroy(): void {
    this.removeReference();
  }
}

class ExpensiveResource {
  constructor(public name: string) {
    console.log(`Creating expensive resource: ${name}`);
  }
}

// Usage
const resource = new ExpensiveResource('Database Connection');

const proxy1 = new SmartProxy(resource);
const proxy2 = new SmartProxy(resource);
const proxy3 = new SmartProxy(resource);

proxy1.destroy(); // Reference count: 2
proxy2.destroy(); // Reference count: 1
proxy3.destroy(); // Object can be garbage collected
```

## Proxy vs Decorator vs Adapter

### Proxy
- **Purpose**: Control access to object
- **Relationship**: Same interface as real object
- **Behavior**: May not delegate all calls

### Decorator
- **Purpose**: Add behavior to object
- **Relationship**: Same interface as component
- **Behavior**: Usually delegates and adds behavior

### Adapter
- **Purpose**: Convert interface
- **Relationship**: Different interface from adaptee
- **Behavior**: Translates interface calls

```javascript
// Proxy - controls access
class ServiceProxy {
  constructor(private service: Service) {}
  
  request() {
    if (this.hasPermission()) {
      return this.service.request();
    }
    throw new Error('Access denied');
  }
}

// Decorator - adds behavior
class LoggingDecorator {
  constructor(private service: Service) {}
  
  request() {
    console.log('Logging request');
    return this.service.request(); // Always delegates
  }
}

// Adapter - converts interface
class ServiceAdapter {
  constructor(private legacyService: LegacyService) {}
  
  request() {
    return this.legacyService.oldRequest(); // Interface conversion
  }
}
```

## Pros and Cons

### Advantages
- Controls access to the real object
- Can provide lazy initialization
- Can implement caching and performance optimizations
- Can add cross-cutting concerns (logging, security, etc.)
- Follows Single Responsibility Principle
- Follows Open/Closed Principle

### Disadvantages
- Code may become more complex
- Response time might increase
- Introduces another layer of indirection

## Real-World Examples

### HTTP Client Proxy
```javascript
interface HttpClient {
  get(url: string): Promise<any>;
  post(url: string, data: any): Promise<any>;
}

class AxiosHttpClient implements HttpClient {
  async get(url: string): Promise<any> {
    console.log(`HTTP GET: ${url}`);
    // Simulate HTTP call
    return { status: 200, data: `Response from ${url}` };
  }

  async post(url: string, data: any): Promise<any> {
    console.log(`HTTP POST: ${url}`, data);
    return { status: 201, data: 'Created' };
  }
}

class HttpClientProxy implements HttpClient {
  private client: AxiosHttpClient;
  private cache = new Map<string, { data: any; timestamp: number }>();
  private rateLimiter = new Map<string, number[]>();

  constructor() {
    this.client = new AxiosHttpClient();
  }

  async get(url: string): Promise<any> {
    // Check rate limit
    if (!this.checkRateLimit(url)) {
      throw new Error('Rate limit exceeded');
    }

    // Check cache for GET requests
    const cached = this.cache.get(url);
    if (cached && (Date.now() - cached.timestamp) < 300000) { // 5 minutes
      console.log(`Cache hit: ${url}`);
      return cached.data;
    }

    const response = await this.client.get(url);
    this.cache.set(url, { data: response, timestamp: Date.now() });
    return response;
  }

  async post(url: string, data: any): Promise<any> {
    if (!this.checkRateLimit(url)) {
      throw new Error('Rate limit exceeded');
    }

    // Clear cache for POST requests that might affect cached data
    this.invalidateCache(url);
    return this.client.post(url, data);
  }

  private checkRateLimit(url: string): boolean {
    const now = Date.now();
    const requests = this.rateLimiter.get(url) || [];
    
    // Remove requests older than 1 minute
    const recentRequests = requests.filter(time => now - time < 60000);
    
    if (recentRequests.length >= 10) { // Max 10 requests per minute
      return false;
    }

    recentRequests.push(now);
    this.rateLimiter.set(url, recentRequests);
    return true;
  }

  private invalidateCache(url: string): void {
    for (const [key] of this.cache) {
      if (key.includes(url.split('/')[2])) { // Same domain
        this.cache.delete(key);
      }
    }
  }
}

// Usage
const httpClient = new HttpClientProxy();

async function demonstrateHttpProxy() {
  await httpClient.get('https://api.example.com/users'); // Real request + cache
  await httpClient.get('https://api.example.com/users'); // Cache hit
  
  await httpClient.post('https://api.example.com/users', { name: 'John' }); // Invalidates cache
  await httpClient.get('https://api.example.com/users'); // Real request (cache invalidated)
}
```

## Common Use Cases
- Lazy loading of expensive objects
- Access control and security
- Caching and performance optimization
- Logging and monitoring
- Remote object proxies (RPC, web services)
- Smart pointers and reference counting
- Transaction management
- Firewall proxies
- Copy-on-write optimization