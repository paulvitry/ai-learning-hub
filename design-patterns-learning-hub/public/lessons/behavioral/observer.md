# Observer Pattern

## Overview
The Observer pattern defines a one-to-many dependency between objects so that when one object changes state, all its dependents are notified and updated automatically. It's also known as the Publish-Subscribe pattern.

## When to Use
- When changes to one object require changing many others, and you don't know how many objects need to be changed
- When an object should notify other objects without making assumptions about who those objects are
- When you need to maintain consistency between related objects without tight coupling

## Structure
```
┌─────────────────┐    ┌─────────────────┐
│    Subject      │───→│    Observer     │
├─────────────────┤    ├─────────────────┤
│ + attach()      │    │ + update()      │
│ + detach()      │    └─────────────────┘
│ + notify()      │           △
└─────────────────┘           │
         △                    │
         │              ┌─────────────────┐
┌─────────────────┐     │ ConcreteObserver│
│ ConcreteSubject │     ├─────────────────┤
├─────────────────┤     │ + update()      │
│ - subjectState  │     │ - observerState │
│ + getState()    │     └─────────────────┘
│ + setState()    │
└─────────────────┘
```

## Implementation Examples

### JavaScript/TypeScript - Event System
```javascript
// Observer interface
interface Observer {
  update(data: any): void;
}

// Subject interface
interface Subject {
  attach(observer: Observer): void;
  detach(observer: Observer): void;
  notify(data: any): void;
}

// Concrete Subject
class NewsAgency implements Subject {
  private observers: Observer[] = [];
  private news: string = "";

  attach(observer: Observer): void {
    if (!this.observers.includes(observer)) {
      this.observers.push(observer);
      console.log("Observer attached");
    }
  }

  detach(observer: Observer): void {
    const index = this.observers.indexOf(observer);
    if (index !== -1) {
      this.observers.splice(index, 1);
      console.log("Observer detached");
    }
  }

  notify(data: any): void {
    console.log("Notifying all observers...");
    this.observers.forEach(observer => observer.update(data));
  }

  setNews(news: string): void {
    this.news = news;
    this.notify(this.news);
  }

  getNews(): string {
    return this.news;
  }
}

// Concrete Observers
class NewsChannel implements Observer {
  constructor(private name: string) {}

  update(news: string): void {
    console.log(`${this.name} received news: ${news}`);
  }
}

class NewspaperWebsite implements Observer {
  constructor(private siteName: string) {}

  update(news: string): void {
    console.log(`${this.siteName} publishing: ${news}`);
  }
}

// Usage
const newsAgency = new NewsAgency();

const cnn = new NewsChannel("CNN");
const bbc = new NewsChannel("BBC");
const website = new NewspaperWebsite("TechCrunch");

newsAgency.attach(cnn);
newsAgency.attach(bbc);
newsAgency.attach(website);

newsAgency.setNews("Breaking: New JavaScript framework released!");
// Output:
// Notifying all observers...
// CNN received news: Breaking: New JavaScript framework released!
// BBC received news: Breaking: New JavaScript framework released!
// TechCrunch publishing: Breaking: New JavaScript framework released!

newsAgency.detach(bbc);
newsAgency.setNews("Tech stocks are rising!");
// Output:
// Observer detached
// Notifying all observers...
// CNN received news: Tech stocks are rising!
// TechCrunch publishing: Tech stocks are rising!
```

### Python - Stock Price Monitoring
```python
from abc import ABC, abstractmethod
from typing import List

# Observer interface
class Observer(ABC):
    @abstractmethod
    def update(self, subject):
        pass

# Subject interface
class Subject(ABC):
    @abstractmethod
    def attach(self, observer: Observer):
        pass
    
    @abstractmethod
    def detach(self, observer: Observer):
        pass
    
    @abstractmethod
    def notify(self):
        pass

# Concrete Subject
class Stock(Subject):
    def __init__(self, symbol: str, price: float):
        self.symbol = symbol
        self._price = price
        self._observers: List[Observer] = []
    
    def attach(self, observer: Observer):
        if observer not in self._observers:
            self._observers.append(observer)
            print(f"Observer attached to {self.symbol}")
    
    def detach(self, observer: Observer):
        if observer in self._observers:
            self._observers.remove(observer)
            print(f"Observer detached from {self.symbol}")
    
    def notify(self):
        print(f"Notifying observers about {self.symbol} price change")
        for observer in self._observers:
            observer.update(self)
    
    @property
    def price(self) -> float:
        return self._price
    
    @price.setter
    def price(self, value: float):
        if value != self._price:
            self._price = value
            self.notify()

# Concrete Observers
class StockDisplay(Observer):
    def __init__(self, name: str):
        self.name = name
    
    def update(self, subject: Stock):
        print(f"{self.name}: {subject.symbol} is now ${subject.price:.2f}")

class PriceAlert(Observer):
    def __init__(self, threshold: float, alert_type: str):
        self.threshold = threshold
        self.alert_type = alert_type  # 'above' or 'below'
    
    def update(self, subject: Stock):
        if (self.alert_type == 'above' and subject.price > self.threshold) or \
           (self.alert_type == 'below' and subject.price < self.threshold):
            print(f"ALERT: {subject.symbol} is ${subject.price:.2f} "
                  f"({self.alert_type} ${self.threshold:.2f})")

class Portfolio(Observer):
    def __init__(self):
        self.holdings = {}
    
    def add_stock(self, symbol: str, shares: int):
        self.holdings[symbol] = shares
    
    def update(self, subject: Stock):
        if subject.symbol in self.holdings:
            shares = self.holdings[subject.symbol]
            value = shares * subject.price
            print(f"Portfolio: {shares} shares of {subject.symbol} "
                  f"worth ${value:.2f}")

# Usage
apple_stock = Stock("AAPL", 150.00)

# Create observers
display1 = StockDisplay("Mobile App")
display2 = StockDisplay("Website")
high_alert = PriceAlert(160.00, "above")
low_alert = PriceAlert(140.00, "below")
portfolio = Portfolio()
portfolio.add_stock("AAPL", 100)

# Attach observers
apple_stock.attach(display1)
apple_stock.attach(display2)
apple_stock.attach(high_alert)
apple_stock.attach(low_alert)
apple_stock.attach(portfolio)

# Trigger notifications
apple_stock.price = 155.50
print("\n" + "="*50 + "\n")
apple_stock.price = 165.00
print("\n" + "="*50 + "\n")
apple_stock.price = 135.00
```

### Java - Model-View Pattern
```java
import java.util.*;

// Observer interface
interface Observer {
    void update(Observable o, Object data);
}

// Subject (Observable)
abstract class Observable {
    private List<Observer> observers = new ArrayList<>();
    
    public void addObserver(Observer observer) {
        if (!observers.contains(observer)) {
            observers.add(observer);
        }
    }
    
    public void removeObserver(Observer observer) {
        observers.remove(observer);
    }
    
    public void notifyObservers(Object data) {
        for (Observer observer : observers) {
            observer.update(this, data);
        }
    }
}

// Concrete Subject - User Model
class UserModel extends Observable {
    private String username;
    private String email;
    
    public void setUserData(String username, String email) {
        this.username = username;
        this.email = email;
        notifyObservers(this);
    }
    
    public String getUsername() { return username; }
    public String getEmail() { return email; }
}

// Concrete Observers - Views
class HeaderView implements Observer {
    @Override
    public void update(Observable o, Object data) {
        if (o instanceof UserModel) {
            UserModel user = (UserModel) o;
            System.out.println("Header updated: Welcome, " + user.getUsername());
        }
    }
}

class ProfileView implements Observer {
    @Override
    public void update(Observable o, Object data) {
        if (o instanceof UserModel) {
            UserModel user = (UserModel) o;
            System.out.println("Profile View updated:");
            System.out.println("  Username: " + user.getUsername());
            System.out.println("  Email: " + user.getEmail());
        }
    }
}

class ActivityLogger implements Observer {
    @Override
    public void update(Observable o, Object data) {
        if (o instanceof UserModel) {
            UserModel user = (UserModel) o;
            System.out.println("LOG: User " + user.getUsername() + 
                              " data updated at " + new Date());
        }
    }
}

// Usage
public class MVCExample {
    public static void main(String[] args) {
        UserModel userModel = new UserModel();
        
        HeaderView header = new HeaderView();
        ProfileView profile = new ProfileView();
        ActivityLogger logger = new ActivityLogger();
        
        userModel.addObserver(header);
        userModel.addObserver(profile);
        userModel.addObserver(logger);
        
        userModel.setUserData("john_doe", "john@example.com");
        
        System.out.println("\n" + "=".repeat(40) + "\n");
        
        userModel.removeObserver(logger);
        userModel.setUserData("jane_smith", "jane@example.com");
    }
}
```

## Event-Driven Implementation

### JavaScript Event Emitter
```javascript
class EventEmitter {
  private events: { [key: string]: Function[] } = {};

  on(event: string, callback: Function): void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  off(event: string, callback: Function): void {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
  }

  emit(event: string, data?: any): void {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(data));
    }
  }
}

// Usage with Shopping Cart
class ShoppingCart extends EventEmitter {
  private items: any[] = [];

  addItem(item: any): void {
    this.items.push(item);
    this.emit('itemAdded', { item, totalItems: this.items.length });
  }

  removeItem(itemId: string): void {
    const index = this.items.findIndex(item => item.id === itemId);
    if (index !== -1) {
      const removedItem = this.items.splice(index, 1)[0];
      this.emit('itemRemoved', { item: removedItem, totalItems: this.items.length });
    }
  }

  checkout(): void {
    this.emit('checkout', { items: [...this.items], total: this.getTotal() });
    this.items = [];
  }

  private getTotal(): number {
    return this.items.reduce((sum, item) => sum + item.price, 0);
  }
}

// Event listeners
const cart = new ShoppingCart();

cart.on('itemAdded', (data) => {
  console.log(`Item added: ${data.item.name}, Total items: ${data.totalItems}`);
});

cart.on('itemRemoved', (data) => {
  console.log(`Item removed: ${data.item.name}, Total items: ${data.totalItems}`);
});

cart.on('checkout', (data) => {
  console.log(`Checkout: ${data.items.length} items, Total: $${data.total}`);
});

// Usage
cart.addItem({ id: '1', name: 'Laptop', price: 999 });
cart.addItem({ id: '2', name: 'Mouse', price: 25 });
cart.removeItem('1');
cart.checkout();
```

## Modern Variations

### Reactive Extensions (RxJS-style)
```javascript
class Observable<T> {
  private subscribers: ((value: T) => void)[] = [];

  subscribe(observer: (value: T) => void): () => void {
    this.subscribers.push(observer);
    
    // Return unsubscribe function
    return () => {
      const index = this.subscribers.indexOf(observer);
      if (index !== -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  next(value: T): void {
    this.subscribers.forEach(observer => observer(value));
  }

  map<U>(fn: (value: T) => U): Observable<U> {
    const mapped = new Observable<U>();
    this.subscribe(value => mapped.next(fn(value)));
    return mapped;
  }

  filter(predicate: (value: T) => boolean): Observable<T> {
    const filtered = new Observable<T>();
    this.subscribe(value => {
      if (predicate(value)) {
        filtered.next(value);
      }
    });
    return filtered;
  }
}

// Usage
const temperatureStream = new Observable<number>();

const fahrenheitStream = temperatureStream
  .filter(temp => temp > 0) // Only positive temperatures
  .map(celsius => celsius * 9/5 + 32); // Convert to Fahrenheit

const unsubscribe = fahrenheitStream.subscribe(temp => {
  console.log(`Temperature: ${temp}°F`);
});

temperatureStream.next(20); // Temperature: 68°F
temperatureStream.next(-5); // No output (filtered out)
temperatureStream.next(25); // Temperature: 77°F

unsubscribe(); // Stop receiving updates
```

## Pros and Cons

### Advantages
- Loose coupling between subjects and observers
- Dynamic relationships: observers can be added/removed at runtime
- Open/Closed Principle: new observers without changing subject
- Broadcast communication: one-to-many notifications

### Disadvantages
- Observers are notified in random order
- Memory leaks if observers aren't properly detached
- Can lead to complex update cascades
- Debugging can be difficult due to indirect flow

## Common Pitfalls

### Memory Leaks
```javascript
// BAD: Observer not cleaned up
class ComponentA {
  constructor(subject) {
    subject.attach(this); // Never detached
  }
  
  update(data) {
    // Handle update
  }
}

// GOOD: Proper cleanup
class ComponentB {
  constructor(subject) {
    this.subject = subject;
    subject.attach(this);
  }
  
  destroy() {
    this.subject.detach(this); // Clean up
  }
  
  update(data) {
    // Handle update
  }
}
```

### Circular Dependencies
```javascript
// BAD: Can cause infinite loops
class Subject1 extends Observable {
  update(data) {
    // Process data and notify observers
    this.notify(processedData); // Might trigger Subject2
  }
}

class Subject2 extends Observable {
  update(data) {
    // Process data and notify observers
    this.notify(processedData); // Might trigger Subject1
  }
}
```

## Real-World Examples
- Model-View-Controller (MVC) architectures
- Event systems in GUI frameworks
- Reactive programming (RxJS, Redux)
- WebSocket real-time updates
- Stock price monitoring systems
- News feed updates
- Game state synchronization
- Shopping cart updates in e-commerce

## Related Patterns
- **Mediator**: Centralizes complex communications between objects
- **Command**: Can be used to parameterize observers with different requests
- **State**: Subject's behavior changes based on its state
- **Publisher-Subscriber**: Similar but often involves message queues or brokers