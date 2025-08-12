# Singleton Pattern

## Overview
The Singleton pattern ensures that a class has only one instance and provides a global point of access to that instance. This is useful when exactly one object is needed to coordinate actions across the system.

## When to Use
- When you need exactly one instance of a class (e.g., database connection, logger, configuration manager)
- When you want to control access to a shared resource
- When you need a global point of access to an instance

## Structure
```
┌─────────────────┐
│    Singleton    │
├─────────────────┤
│ - instance      │
├─────────────────┤
│ + getInstance() │
│ + operation()   │
└─────────────────┘
```

## Implementation Examples

### JavaScript/TypeScript
```javascript
class DatabaseConnection {
  private static instance: DatabaseConnection;
  private connection: string;

  private constructor() {
    // Private constructor prevents direct instantiation
    this.connection = "Database connected";
  }

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  public query(sql: string): string {
    return `Executing: ${sql}`;
  }
}

// Usage
const db1 = DatabaseConnection.getInstance();
const db2 = DatabaseConnection.getInstance();
console.log(db1 === db2); // true - same instance
```

### Python
```python
class Logger:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(Logger, cls).__new__(cls)
            cls._instance.log_file = "app.log"
        return cls._instance
    
    def log(self, message):
        print(f"Logging to {self.log_file}: {message}")

# Usage
logger1 = Logger()
logger2 = Logger()
print(logger1 is logger2)  # True - same instance
```

### Java
```java
public class ConfigManager {
    private static ConfigManager instance;
    private Properties config;
    
    private ConfigManager() {
        config = new Properties();
        // Load configuration
    }
    
    public static synchronized ConfigManager getInstance() {
        if (instance == null) {
            instance = new ConfigManager();
        }
        return instance;
    }
    
    public String getProperty(String key) {
        return config.getProperty(key);
    }
}
```

## Pros and Cons

### Advantages
- Controlled access to sole instance
- Reduced namespace pollution
- Permits refinement of operations and representation
- Can be extended by subclassing

### Disadvantages
- Can be difficult to test (global state)
- Violates Single Responsibility Principle
- Can hide dependencies
- Requires special treatment in multithreaded environment

## Common Variations

### Thread-Safe Singleton (Java)
```java
public class ThreadSafeSingleton {
    private static volatile ThreadSafeSingleton instance;
    
    private ThreadSafeSingleton() {}
    
    public static ThreadSafeSingleton getInstance() {
        if (instance == null) {
            synchronized (ThreadSafeSingleton.class) {
                if (instance == null) {
                    instance = new ThreadSafeSingleton();
                }
            }
        }
        return instance;
    }
}
```

### Enum Singleton (Java)
```java
public enum DatabaseManager {
    INSTANCE;
    
    public void connect() {
        System.out.println("Database connected");
    }
}
```

## Real-World Examples
- Database connection pools
- Logging services
- Configuration managers
- Cache managers
- Thread pools
- Application state managers

## Anti-Pattern Warning
While Singleton is a classic pattern, it's often considered an anti-pattern in modern development because:
- Makes unit testing difficult
- Creates hidden dependencies
- Can lead to tight coupling
- Often used as a global variable in disguise

Consider dependency injection as an alternative for better testability and flexibility.