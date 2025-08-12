# Adapter Pattern

## Overview
The Adapter pattern allows objects with incompatible interfaces to work together. It acts as a wrapper between two objects, catching calls for one object and transforming them to format and interface recognizable by the second object.

## When to Use
- When you want to use an existing class with an incompatible interface
- When you need to create a reusable class that cooperates with classes that don't have compatible interfaces
- When you want to use several existing subclasses but it's impractical to adapt their interface by subclassing

## Structure

### Object Adapter
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Client    │───→│   Adapter   │───→│  Adaptee    │
└─────────────┘    ├─────────────┤    ├─────────────┤
                   │ + request() │    │ + specific  │
                   └─────────────┘    │   Request() │
                                      └─────────────┘
```

### Class Adapter (using inheritance)
```
┌─────────────┐    ┌─────────────┐
│   Client    │───→│   Adapter   │
└─────────────┘    ├─────────────┤
                   │ + request() │
                   └─────────────┘
                          │
                          │ extends
                          ▼
                   ┌─────────────┐
                   │  Adaptee    │
                   ├─────────────┤
                   │ + specific  │
                   │   Request() │
                   └─────────────┘
```

## Implementation Examples

### JavaScript/TypeScript - Media Player Example
```javascript
// Target interface (what the client expects)
interface MediaPlayer {
  play(audioType: string, fileName: string): void;
}

// Adaptee classes (existing incompatible interfaces)
class Mp4Player {
  playMp4(fileName: string): void {
    console.log(`Playing mp4 file: ${fileName}`);
  }
}

class VlcPlayer {
  playVlc(fileName: string): void {
    console.log(`Playing vlc file: ${fileName}`);
  }
}

class Mp3Player {
  playMp3(fileName: string): void {
    console.log(`Playing mp3 file: ${fileName}`);
  }
}

// Adapter
class MediaAdapter implements MediaPlayer {
  private mp4Player: Mp4Player;
  private vlcPlayer: VlcPlayer;

  constructor(private audioType: string) {
    if (audioType === "mp4") {
      this.mp4Player = new Mp4Player();
    } else if (audioType === "vlc") {
      this.vlcPlayer = new VlcPlayer();
    }
  }

  play(audioType: string, fileName: string): void {
    if (audioType === "mp4") {
      this.mp4Player.playMp4(fileName);
    } else if (audioType === "vlc") {
      this.vlcPlayer.playVlc(fileName);
    }
  }
}

// Context class that uses the adapter
class AudioPlayer implements MediaPlayer {
  private mediaAdapter: MediaAdapter;

  play(audioType: string, fileName: string): void {
    // Built-in support for mp3
    if (audioType === "mp3") {
      const mp3Player = new Mp3Player();
      mp3Player.playMp3(fileName);
    }
    // Use adapter for other formats
    else if (audioType === "mp4" || audioType === "vlc") {
      this.mediaAdapter = new MediaAdapter(audioType);
      this.mediaAdapter.play(audioType, fileName);
    } else {
      console.log(`${audioType} format not supported`);
    }
  }
}

// Usage
const player = new AudioPlayer();
player.play("mp3", "song.mp3");
player.play("mp4", "movie.mp4");
player.play("vlc", "video.vlc");
```

### Python - Third-party Library Integration
```python
# Target interface
class Target:
    def request(self):
        return "Target: Default behavior"

# Adaptee (third-party library with incompatible interface)
class ThirdPartyLibrary:
    def specific_request(self):
        return "Special behavior from third-party library"

# Object Adapter
class LibraryAdapter(Target):
    def __init__(self, adaptee: ThirdPartyLibrary):
        self.adaptee = adaptee
    
    def request(self):
        return f"Adapter: {self.adaptee.specific_request()}"

# Usage
def client_code(target: Target):
    print(target.request())

# Direct usage
print("Client can work with Target objects:")
target = Target()
client_code(target)

print("\nThird-party library has incompatible interface:")
adaptee = ThirdPartyLibrary()
print(f"ThirdPartyLibrary: {adaptee.specific_request()}")

print("\nBut with adapter, client can work with it:")
adapter = LibraryAdapter(adaptee)
client_code(adapter)
```

### Java - Legacy System Integration
```java
// Target interface
interface ModernPaymentGateway {
    PaymentResult processPayment(double amount, String currency);
}

// Adaptee (legacy system)
class LegacyPaymentSystem {
    public boolean makePayment(int amountInCents, String curr) {
        System.out.println("Processing payment of " + amountInCents + 
                          " cents in " + curr);
        return true; // Simulate successful payment
    }
}

// Result class
class PaymentResult {
    private boolean success;
    private String message;
    
    public PaymentResult(boolean success, String message) {
        this.success = success;
        this.message = message;
    }
    
    // getters...
}

// Adapter
class LegacyPaymentAdapter implements ModernPaymentGateway {
    private LegacyPaymentSystem legacySystem;
    
    public LegacyPaymentAdapter(LegacyPaymentSystem legacySystem) {
        this.legacySystem = legacySystem;
    }
    
    @Override
    public PaymentResult processPayment(double amount, String currency) {
        // Convert dollars to cents
        int amountInCents = (int) (amount * 100);
        
        // Call legacy method
        boolean result = legacySystem.makePayment(amountInCents, currency);
        
        // Adapt the return type
        return new PaymentResult(result, 
                               result ? "Payment successful" : "Payment failed");
    }
}

// Usage
public class PaymentProcessor {
    public void processOrder(ModernPaymentGateway gateway, double amount) {
        PaymentResult result = gateway.processPayment(amount, "USD");
        System.out.println("Payment result: " + result.getMessage());
    }
    
    public static void main(String[] args) {
        // Using legacy system through adapter
        LegacyPaymentSystem legacySystem = new LegacyPaymentSystem();
        ModernPaymentGateway adapter = new LegacyPaymentAdapter(legacySystem);
        
        PaymentProcessor processor = new PaymentProcessor();
        processor.processOrder(adapter, 99.99);
    }
}
```

## Types of Adapters

### Two-Way Adapter
```javascript
class TwoWayAdapter implements TargetInterface, AdapteeInterface {
  private target: Target;
  private adaptee: Adaptee;

  constructor(target: Target, adaptee: Adaptee) {
    this.target = target;
    this.adaptee = adaptee;
  }

  // Target interface methods
  targetMethod(): void {
    this.adaptee.adapteeMethod();
  }

  // Adaptee interface methods
  adapteeMethod(): void {
    this.target.targetMethod();
  }
}
```

### Class Adapter (using multiple inheritance - Python)
```python
class Target:
    def request(self):
        return "Target: Default behavior"

class Adaptee:
    def specific_request(self):
        return "Special behavior"

# Class adapter using multiple inheritance
class ClassAdapter(Target, Adaptee):
    def request(self):
        return f"Adapter: {self.specific_request()}"
```

## Real-World Examples

### Database Connection Adapters
```javascript
interface DatabaseConnection {
  connect(): void;
  query(sql: string): any[];
  disconnect(): void;
}

class MySQLAdapter implements DatabaseConnection {
  private mysqlLib: any; // Third-party MySQL library

  constructor(mysqlLib: any) {
    this.mysqlLib = mysqlLib;
  }

  connect(): void {
    this.mysqlLib.createConnection();
  }

  query(sql: string): any[] {
    return this.mysqlLib.executeQuery(sql);
  }

  disconnect(): void {
    this.mysqlLib.closeConnection();
  }
}

class PostgreSQLAdapter implements DatabaseConnection {
  private pgLib: any; // Third-party PostgreSQL library

  constructor(pgLib: any) {
    this.pgLib = pgLib;
  }

  connect(): void {
    this.pgLib.connect();
  }

  query(sql: string): any[] {
    return this.pgLib.runQuery(sql);
  }

  disconnect(): void {
    this.pgLib.end();
  }
}
```

### API Response Adapters
```javascript
// Different API response formats
interface WeatherAPI {
  getCurrentWeather(): WeatherData;
}

interface WeatherData {
  temperature: number;
  humidity: number;
  conditions: string;
}

// OpenWeatherMap API response
class OpenWeatherMapAdapter implements WeatherAPI {
  private api: any;

  constructor(api: any) {
    this.api = api;
  }

  getCurrentWeather(): WeatherData {
    const response = this.api.getCurrentWeather();
    return {
      temperature: response.main.temp,
      humidity: response.main.humidity,
      conditions: response.weather[0].description
    };
  }
}

// AccuWeather API response
class AccuWeatherAdapter implements WeatherAPI {
  private api: any;

  constructor(api: any) {
    this.api = api;
  }

  getCurrentWeather(): WeatherData {
    const response = this.api.getWeather();
    return {
      temperature: response.Temperature.Imperial.Value,
      humidity: response.RelativeHumidity,
      conditions: response.WeatherText
    };
  }
}
```

## Pros and Cons

### Advantages
- Separates interface conversion code from primary business logic
- Open/Closed Principle: new adapters without changing existing code
- Single Responsibility Principle: separates interface conversion
- Allows reuse of existing functionality

### Disadvantages
- Overall complexity increases due to new interfaces and classes
- Sometimes it's simpler to change the service class to match the rest of your code

## Related Patterns
- **Bridge**: Designed upfront to let abstractions and implementations vary independently
- **Decorator**: Enhances object without changing its interface
- **Facade**: Defines new interface for existing objects
- **Proxy**: Provides same interface as original object

## Common Use Cases
- Legacy system integration
- Third-party library integration
- API response normalization
- Database abstraction layers
- Cross-platform development
- Plugin systems