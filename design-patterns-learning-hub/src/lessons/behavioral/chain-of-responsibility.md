# Chain of Responsibility Pattern

## Overview
The Chain of Responsibility pattern passes requests along a chain of handlers. When a request is received, each handler decides either to process the request or pass it to the next handler in the chain. This pattern decouples the sender from the receiver by allowing multiple objects to handle the request.

## When to Use
- When you want to give more than one object a chance to handle a request
- When you don't know which object should handle a request beforehand
- When the set of request handlers should be specified dynamically
- When you want to avoid coupling the sender to specific receivers

## Structure
```
┌─────────────────┐
│     Client      │
└─────────────────┘
         │
         │ sends request
         ▼
┌─────────────────┐
│     Handler     │
├─────────────────┤
│ + setNext()     │
│ + handle()      │
└─────────────────┘
         △
         │
┌─────────────────┐
│ConcreteHandlerA │
├─────────────────┤
│ + handle()      │
└─────────────────┘
         │
         │ next
         ▼
┌─────────────────┐
│ConcreteHandlerB │
├─────────────────┤
│ + handle()      │
└─────────────────┘
         │
         │ next
         ▼
┌─────────────────┐
│ConcreteHandlerC │
├─────────────────┤
│ + handle()      │
└─────────────────┘
```

## Implementation Examples

### JavaScript/TypeScript
```javascript
// Request interface
interface Request {
  type: string;
  severity: number;
  message: string;
}

// Handler interface
interface Handler {
  setNext(handler: Handler): Handler;
  handle(request: Request): string | null;
}

// Base handler
abstract class BaseHandler implements Handler {
  private nextHandler?: Handler;

  setNext(handler: Handler): Handler {
    this.nextHandler = handler;
    return handler;
  }

  handle(request: Request): string | null {
    if (this.nextHandler) {
      return this.nextHandler.handle(request);
    }
    return null;
  }
}

// Concrete handlers
class InfoHandler extends BaseHandler {
  handle(request: Request): string | null {
    if (request.type === 'INFO' && request.severity <= 1) {
      return `InfoHandler: Logged info message - ${request.message}`;
    }
    return super.handle(request);
  }
}

class WarningHandler extends BaseHandler {
  handle(request: Request): string | null {
    if (request.type === 'WARNING' && request.severity <= 3) {
      return `WarningHandler: Logged warning - ${request.message}`;
    }
    return super.handle(request);
  }
}

class ErrorHandler extends BaseHandler {
  handle(request: Request): string | null {
    if (request.type === 'ERROR' && request.severity <= 5) {
      return `ErrorHandler: Logged error - ${request.message}`;
    }
    return super.handle(request);
  }
}

class CriticalHandler extends BaseHandler {
  handle(request: Request): string | null {
    if (request.type === 'CRITICAL' || request.severity > 5) {
      return `CriticalHandler: URGENT! Critical issue - ${request.message}`;
    }
    return super.handle(request);
  }
}

// Usage
const infoHandler = new InfoHandler();
const warningHandler = new WarningHandler();
const errorHandler = new ErrorHandler();
const criticalHandler = new CriticalHandler();

// Build the chain
infoHandler
  .setNext(warningHandler)
  .setNext(errorHandler)
  .setNext(criticalHandler);

// Test requests
const requests: Request[] = [
  { type: 'INFO', severity: 1, message: 'System started' },
  { type: 'WARNING', severity: 2, message: 'Memory usage high' },
  { type: 'ERROR', severity: 4, message: 'Database connection failed' },
  { type: 'CRITICAL', severity: 8, message: 'System crash imminent' },
  { type: 'DEBUG', severity: 1, message: 'This should not be handled' }
];

requests.forEach(request => {
  const result = infoHandler.handle(request);
  console.log(result || `No handler found for: ${request.type} - ${request.message}`);
});
```

### Python
```python
from abc import ABC, abstractmethod
from typing import Optional

# Request class
class SupportRequest:
    def __init__(self, request_type: str, priority: int, description: str):
        self.request_type = request_type
        self.priority = priority
        self.description = description

# Handler interface
class SupportHandler(ABC):
    def __init__(self):
        self._next_handler: Optional[SupportHandler] = None
    
    def set_next(self, handler: 'SupportHandler') -> 'SupportHandler':
        self._next_handler = handler
        return handler
    
    @abstractmethod
    def handle(self, request: SupportRequest) -> Optional[str]:
        if self._next_handler:
            return self._next_handler.handle(request)
        return None

# Concrete handlers
class Level1Support(SupportHandler):
    def handle(self, request: SupportRequest) -> Optional[str]:
        if request.request_type == 'basic' and request.priority <= 2:
            return f"Level 1 Support: Resolved '{request.description}' - Basic issue handled"
        return super().handle(request)

class Level2Support(SupportHandler):
    def handle(self, request: SupportRequest) -> Optional[str]:
        if request.request_type in ['technical', 'billing'] and request.priority <= 5:
            return f"Level 2 Support: Escalated '{request.description}' - Technical team assigned"
        return super().handle(request)

class Level3Support(SupportHandler):
    def handle(self, request: SupportRequest) -> Optional[str]:
        if request.request_type == 'technical' and request.priority <= 8:
            return f"Level 3 Support: Expert handling '{request.description}' - Senior engineer assigned"
        return super().handle(request)

class ManagerSupport(SupportHandler):
    def handle(self, request: SupportRequest) -> Optional[str]:
        if request.priority >= 8:
            return f"Manager Support: URGENT - '{request.description}' - Manager personally handling"
        return super().handle(request)

# Usage
def demonstrate_support_chain():
    # Create handlers
    level1 = Level1Support()
    level2 = Level2Support()
    level3 = Level3Support()
    manager = ManagerSupport()
    
    # Build chain
    level1.set_next(level2).set_next(level3).set_next(manager)
    
    # Test requests
    requests = [
        SupportRequest('basic', 1, 'Password reset'),
        SupportRequest('billing', 3, 'Invoice discrepancy'),
        SupportRequest('technical', 6, 'Server performance issue'),
        SupportRequest('technical', 9, 'System-wide outage'),
        SupportRequest('other', 2, 'General inquiry')
    ]
    
    for request in requests:
        result = level1.handle(request)
        if result:
            print(result)
        else:
            print(f"No handler available for: {request.description}")
        print("-" * 50)

demonstrate_support_chain()
```

### Java
```python
from abc import ABC, abstractmethod
from typing import Optional

# Purchase request
class PurchaseRequest:
    def __init__(self, amount: float, purpose: str, requester: str):
        self.amount = amount
        self.purpose = purpose
        self.requester = requester

# Abstract handler
class ApprovalHandler(ABC):
    def __init__(self):
        self._next_handler: Optional[ApprovalHandler] = None
    
    def set_next(self, handler: 'ApprovalHandler') -> 'ApprovalHandler':
        self._next_handler = handler
        return handler
    
    @abstractmethod
    def handle_request(self, request: PurchaseRequest) -> Optional[str]:
        pass
    
    def _pass_to_next(self, request: PurchaseRequest) -> Optional[str]:
        if self._next_handler:
            return self._next_handler.handle_request(request)
        return None

# Concrete handlers
class TeamLead(ApprovalHandler):
    def handle_request(self, request: PurchaseRequest) -> Optional[str]:
        if request.amount <= 1000:
            return f"Team Lead approved ${request.amount} for {request.purpose}"
        print(f"Team Lead: Amount ${request.amount} exceeds my authority, passing to manager")
        return self._pass_to_next(request)

class Manager(ApprovalHandler):
    def handle_request(self, request: PurchaseRequest) -> Optional[str]:
        if request.amount <= 5000:
            return f"Manager approved ${request.amount} for {request.purpose}"
        print(f"Manager: Amount ${request.amount} exceeds my authority, passing to director")
        return self._pass_to_next(request)

class Director(ApprovalHandler):
    def handle_request(self, request: PurchaseRequest) -> Optional[str]:
        if request.amount <= 20000:
            return f"Director approved ${request.amount} for {request.purpose}"
        print(f"Director: Amount ${request.amount} exceeds my authority, passing to VP")
        return self._pass_to_next(request)

class VicePresident(ApprovalHandler):
    def handle_request(self, request: PurchaseRequest) -> Optional[str]:
        if request.amount <= 100000:
            return f"VP approved ${request.amount} for {request.purpose}"
        return "VP: This amount requires board approval"

# Usage
def demonstrate_approval_chain():
    # Create chain
    team_lead = TeamLead()
    manager = Manager()
    director = Director()
    vp = VicePresident()
    
    team_lead.set_next(manager).set_next(director).set_next(vp)
    
    # Test requests
    requests = [
        PurchaseRequest(500, "Office supplies", "John Doe"),
        PurchaseRequest(3000, "New laptop", "Jane Smith"),
        PurchaseRequest(15000, "Server upgrade", "IT Team"),
        PurchaseRequest(75000, "New software licenses", "Development Team"),
        PurchaseRequest(150000, "Office renovation", "Facilities")
    ]
    
    for request in requests:
        print(f"\nProcessing request: ${request.amount} for {request.purpose}")
        result = team_lead.handle_request(request)
        print(f"Result: {result}")

demonstrate_approval_chain()
```

## Middleware Pattern (Web Development)
```javascript
interface HttpRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: any;
  user?: any;
}

interface HttpResponse {
  status: number;
  body: any;
  headers: Record<string, string>;
}

type NextFunction = () => void;
type MiddlewareFunction = (req: HttpRequest, res: HttpResponse, next: NextFunction) => void;

class MiddlewareChain {
  private middlewares: MiddlewareFunction[] = [];
  private index = 0;

  use(middleware: MiddlewareFunction): void {
    this.middlewares.push(middleware);
  }

  execute(req: HttpRequest, res: HttpResponse): void {
    this.index = 0;
    this.next(req, res);
  }

  private next = (req: HttpRequest, res: HttpResponse): void => {
    if (this.index < this.middlewares.length) {
      const middleware = this.middlewares[this.index++];
      middleware(req, res, () => this.next(req, res));
    }
  };
}

// Middleware functions
const authenticationMiddleware: MiddlewareFunction = (req, res, next) => {
  console.log('🔐 Authentication middleware');
  
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status = 401;
    res.body = { error: 'Unauthorized' };
    return; // Don't call next() - chain stops here
  }
  
  // Simulate user authentication
  req.user = { id: 1, name: 'John Doe' };
  next(); // Continue to next middleware
};

const loggingMiddleware: MiddlewareFunction = (req, res, next) => {
  console.log(`📝 Logging: ${req.method} ${req.url} at ${new Date().toISOString()}`);
  next();
};

const rateLimitMiddleware: MiddlewareFunction = (req, res, next) => {
  console.log('🚦 Rate limiting middleware');
  
  // Simulate rate limiting check
  const isRateLimited = Math.random() < 0.1; // 10% chance
  if (isRateLimited) {
    res.status = 429;
    res.body = { error: 'Too many requests' };
    return;
  }
  
  next();
};

const corsMiddleware: MiddlewareFunction = (req, res, next) => {
  console.log('🌐 CORS middleware');
  res.headers['Access-Control-Allow-Origin'] = '*';
  res.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE';
  next();
};

const requestHandlerMiddleware: MiddlewareFunction = (req, res, next) => {
  console.log('🎯 Request handler middleware');
  res.status = 200;
  res.body = { 
    message: 'Request processed successfully',
    user: req.user,
    timestamp: Date.now()
  };
  // Final handler - doesn't call next()
};

// Usage
const app = new MiddlewareChain();

app.use(loggingMiddleware);
app.use(corsMiddleware);
app.use(authenticationMiddleware);
app.use(rateLimitMiddleware);
app.use(requestHandlerMiddleware);

// Test requests
const validRequest: HttpRequest = {
  url: '/api/users',
  method: 'GET',
  headers: { 'authorization': 'Bearer valid-token' }
};

const invalidRequest: HttpRequest = {
  url: '/api/users',
  method: 'GET',
  headers: {}
};

console.log('=== Processing valid request ===');
app.execute(validRequest, { status: 0, body: null, headers: {} });

console.log('\n=== Processing invalid request ===');
app.execute(invalidRequest, { status: 0, body: null, headers: {} });
```

## Event Processing Chain
```javascript
interface Event {
  type: string;
  data: any;
  timestamp: number;
  processed?: boolean;
}

abstract class EventProcessor {
  protected nextProcessor?: EventProcessor;

  setNext(processor: EventProcessor): EventProcessor {
    this.nextProcessor = processor;
    return processor;
  }

  abstract process(event: Event): boolean;

  protected passToNext(event: Event): boolean {
    if (this.nextProcessor && !event.processed) {
      return this.nextProcessor.process(event);
    }
    return false;
  }
}

class ValidationProcessor extends EventProcessor {
  process(event: Event): boolean {
    console.log('🔍 Validating event:', event.type);
    
    // Basic validation
    if (!event.data || Object.keys(event.data).length === 0) {
      console.log('❌ Validation failed: Empty data');
      event.processed = true;
      return false;
    }
    
    console.log('✅ Validation passed');
    return this.passToNext(event);
  }
}

class FilterProcessor extends EventProcessor {
  private blockedTypes = ['spam', 'test'];

  process(event: Event): boolean {
    console.log('🔽 Filtering event:', event.type);
    
    if (this.blockedTypes.includes(event.type)) {
      console.log('🚫 Event filtered out');
      event.processed = true;
      return false;
    }
    
    console.log('✅ Event passed filter');
    return this.passToNext(event);
  }
}

class EnrichmentProcessor extends EventProcessor {
  process(event: Event): boolean {
    console.log('🔧 Enriching event:', event.type);
    
    // Add metadata
    event.data = {
      ...event.data,
      processedAt: Date.now(),
      version: '1.0',
      source: 'event-processor'
    };
    
    console.log('✅ Event enriched');
    return this.passToNext(event);
  }
}

class StorageProcessor extends EventProcessor {
  process(event: Event): boolean {
    console.log('💾 Storing event:', event.type);
    
    // Simulate storage
    console.log('📝 Event stored to database');
    event.processed = true;
    return true;
  }
}

class NotificationProcessor extends EventProcessor {
  process(event: Event): boolean {
    console.log('📢 Processing notifications for:', event.type);
    
    if (event.type === 'user-signup' || event.type === 'order-completed') {
      console.log('📧 Notification sent');
    }
    
    return this.passToNext(event);
  }
}

// Usage
const validator = new ValidationProcessor();
const filter = new FilterProcessor();
const enricher = new EnrichmentProcessor();
const notifier = new NotificationProcessor();
const storage = new StorageProcessor();

// Build processing chain
validator
  .setNext(filter)
  .setNext(enricher)
  .setNext(notifier)
  .setNext(storage);

// Test events
const events: Event[] = [
  {
    type: 'user-signup',
    data: { userId: 123, email: 'user@example.com' },
    timestamp: Date.now()
  },
  {
    type: 'spam',
    data: { content: 'Buy now!' },
    timestamp: Date.now()
  },
  {
    type: 'order-completed',
    data: {},
    timestamp: Date.now()
  },
  {
    type: 'page-view',
    data: { page: '/home', user: 456 },
    timestamp: Date.now()
  }
];

events.forEach((event, index) => {
  console.log(`\n=== Processing Event ${index + 1}: ${event.type} ===`);
  const result = validator.process(event);
  console.log(`Result: ${result ? 'Success' : 'Failed'}`);
});
```

## Pros and Cons

### Advantages
- Decouples sender from receiver
- Allows dynamic addition/removal of handlers
- Follows Single Responsibility Principle
- Follows Open/Closed Principle
- Flexible request handling
- Can handle requests in different ways depending on runtime conditions

### Disadvantages
- No guarantee that request will be handled
- Can be hard to debug - request path through chain may not be obvious
- Can impact performance with long chains
- Chain setup can be complex

## Real-World Examples
- Middleware in web frameworks (Express.js, ASP.NET Core)
- Event handling systems
- GUI event propagation
- Authentication/authorization chains
- Logging and monitoring pipelines
- Request processing in microservices
- Exception handling hierarchies
- Business rule processing