# Mediator Pattern

## Overview
The Mediator pattern defines how objects interact with each other by promoting loose coupling. Instead of objects communicating directly, they communicate through a central mediator object. This reduces dependencies between communicating objects.

## When to Use
- When a set of objects communicate in well-defined but complex ways
- When reusing objects is difficult because they refer to many other objects
- When you want to customize behavior that's distributed between several classes
- When coupling between classes becomes too tight

## Structure
```
┌─────────────────┐
│    Mediator     │
├─────────────────┤
│ + mediate()     │
└─────────────────┘
         △
         │
┌─────────────────┐
│ConcreteMediator │
├─────────────────┤
│ - colleagues    │
│ + mediate()     │
└─────────────────┘
    │        │
    │        │ coordinates
    ▼        ▼
┌─────────────────┐  ┌─────────────────┐
│   ColleagueA    │  │   ColleagueB    │
├─────────────────┤  ├─────────────────┤
│ - mediator      │  │ - mediator      │
│ + send()        │  │ + send()        │
│ + receive()     │  │ + receive()     │
└─────────────────┘  └─────────────────┘
```

## Implementation Examples

### JavaScript/TypeScript - Chat Room
```javascript
// Mediator interface
interface ChatMediator {
  sendMessage(message: string, user: User): void;
  addUser(user: User): void;
  removeUser(user: User): void;
}

// Abstract colleague
abstract class User {
  constructor(
    protected mediator: ChatMediator,
    protected name: string
  ) {}

  abstract send(message: string): void;
  abstract receive(message: string, from: string): void;

  getName(): string {
    return this.name;
  }
}

// Concrete colleagues
class RegularUser extends User {
  send(message: string): void {
    console.log(`${this.name} sends: ${message}`);
    this.mediator.sendMessage(message, this);
  }

  receive(message: string, from: string): void {
    console.log(`${this.name} receives from ${from}: ${message}`);
  }
}

class PremiumUser extends User {
  private isOnline = true;

  send(message: string): void {
    if (this.isOnline) {
      console.log(`👑 ${this.name} (Premium) sends: ${message}`);
      this.mediator.sendMessage(`[Premium] ${message}`, this);
    }
  }

  receive(message: string, from: string): void {
    if (this.isOnline) {
      console.log(`👑 ${this.name} receives from ${from}: ${message}`);
    }
  }

  setOnlineStatus(online: boolean): void {
    this.isOnline = online;
    console.log(`👑 ${this.name} is now ${online ? 'online' : 'offline'}`);
  }

  isUserOnline(): boolean {
    return this.isOnline;
  }
}

class Moderator extends User {
  private mutedUsers: Set<string> = new Set();

  send(message: string): void {
    console.log(`🛡️ [MODERATOR] ${this.name}: ${message}`);
    this.mediator.sendMessage(`[MOD] ${message}`, this);
  }

  receive(message: string, from: string): void {
    console.log(`🛡️ [MODERATOR] ${this.name} sees from ${from}: ${message}`);
  }

  muteUser(username: string): void {
    this.mutedUsers.add(username);
    console.log(`😇 ${username} has been muted by ${this.name}`);
  }

  unmuteUser(username: string): void {
    this.mutedUsers.delete(username);
    console.log(`😊 ${username} has been unmuted by ${this.name}`);
  }

  isMuted(username: string): boolean {
    return this.mutedUsers.has(username);
  }
}

// Concrete mediator
class ChatRoom implements ChatMediator {
  private users: User[] = [];
  private messageHistory: { user: string; message: string; timestamp: Date }[] = [];

  addUser(user: User): void {
    this.users.push(user);
    console.log(`📝 ${user.getName()} joined the chat room`);
    
    // Notify other users
    this.users.forEach(u => {
      if (u !== user) {
        u.receive(`${user.getName()} joined the chat`, 'System');
      }
    });
  }

  removeUser(user: User): void {
    const index = this.users.indexOf(user);
    if (index !== -1) {
      this.users.splice(index, 1);
      console.log(`📝 ${user.getName()} left the chat room`);
      
      // Notify remaining users
      this.users.forEach(u => {
        u.receive(`${user.getName()} left the chat`, 'System');
      });
    }
  }

  sendMessage(message: string, sender: User): void {
    // Check if sender is muted by any moderator
    const moderators = this.users.filter(u => u instanceof Moderator) as Moderator[];
    const isMuted = moderators.some(mod => mod.isMuted(sender.getName()));
    
    if (isMuted) {
      sender.receive('Your message was blocked by a moderator', 'System');
      return;
    }

    // Log message
    this.messageHistory.push({
      user: sender.getName(),
      message,
      timestamp: new Date()
    });

    // Deliver to all users except sender
    this.users.forEach(user => {
      if (user !== sender) {
        // Check if recipient is online (for premium users)
        if (user instanceof PremiumUser && !user.isUserOnline()) {
          return; // Skip offline premium users
        }
        user.receive(message, sender.getName());
      }
    });
  }

  getMessageHistory(): { user: string; message: string; timestamp: Date }[] {
    return [...this.messageHistory];
  }

  getUserCount(): number {
    return this.users.length;
  }
}

// Usage
const chatRoom = new ChatRoom();

// Create users
const alice = new RegularUser(chatRoom, 'Alice');
const bob = new PremiumUser(chatRoom, 'Bob');
const charlie = new RegularUser(chatRoom, 'Charlie');
const moderatorSarah = new Moderator(chatRoom, 'Sarah');

// Add users to chat room
chatRoom.addUser(alice);
chatRoom.addUser(bob);
chatRoom.addUser(charlie);
chatRoom.addUser(moderatorSarah);

console.log('\n=== Chat Session ===');

// Normal conversation
alice.send('Hello everyone!');
bob.send('Hi Alice! How are you?');
charlie.send('Good morning!');

// Moderator actions
console.log('\n=== Moderation ===');
moderatorSarah.muteUser('Charlie');
charlie.send('This message should be blocked');
moderatorSarah.send('Please keep the conversation civil');
moderatorSarah.unmuteUser('Charlie');
charlie.send('Sorry, I will behave');

// Premium user goes offline
console.log('\n=== Premium User Status ===');
bob.setOnlineStatus(false);
alice.send('Bob, are you there?'); // Bob won't receive this
bob.setOnlineStatus(true);
alice.send('Welcome back Bob!');

console.log(`\n=== Chat Statistics ===`);
console.log(`Total users: ${chatRoom.getUserCount()}`);
console.log(`Total messages: ${chatRoom.getMessageHistory().length}`);
```

### Python - Air Traffic Control
```python
from abc import ABC, abstractmethod
from typing import List, Optional
from enum import Enum
from datetime import datetime

class FlightStatus(Enum):
    APPROACHING = "approaching"
    LANDING = "landing"
    LANDED = "landed"
    TAKING_OFF = "taking_off"
    DEPARTED = "departed"

# Mediator interface
class AirTrafficControl(ABC):
    @abstractmethod
    def request_landing(self, aircraft: 'Aircraft') -> bool:
        pass
    
    @abstractmethod
    def request_takeoff(self, aircraft: 'Aircraft') -> bool:
        pass
    
    @abstractmethod
    def notify_status_change(self, aircraft: 'Aircraft', status: FlightStatus):
        pass
    
    @abstractmethod
    def register_aircraft(self, aircraft: 'Aircraft'):
        pass

# Abstract colleague
class Aircraft(ABC):
    def __init__(self, call_sign: str, atc: AirTrafficControl):
        self.call_sign = call_sign
        self.atc = atc
        self.status = FlightStatus.APPROACHING
        self.fuel_level = 100  # percentage
        
    @abstractmethod
    def request_landing(self) -> bool:
        pass
    
    @abstractmethod
    def request_takeoff(self) -> bool:
        pass
    
    def get_call_sign(self) -> str:
        return self.call_sign
    
    def get_status(self) -> FlightStatus:
        return self.status
    
    def set_status(self, status: FlightStatus):
        old_status = self.status
        self.status = status
        self.atc.notify_status_change(self, status)
        print(f"{self.call_sign}: Status changed from {old_status.value} to {status.value}")
    
    def get_fuel_level(self) -> int:
        return self.fuel_level
    
    def consume_fuel(self, amount: int):
        self.fuel_level = max(0, self.fuel_level - amount)
        if self.fuel_level <= 20:
            print(f"⚠️ {self.call_sign}: LOW FUEL WARNING! ({self.fuel_level}% remaining)")

# Concrete colleagues
class PassengerJet(Aircraft):
    def __init__(self, call_sign: str, atc: AirTrafficControl, passengers: int):
        super().__init__(call_sign, atc)
        self.passengers = passengers
    
    def request_landing(self) -> bool:
        print(f"✈️ {self.call_sign} (Passenger Jet, {self.passengers} pax): Requesting landing clearance")
        return self.atc.request_landing(self)
    
    def request_takeoff(self) -> bool:
        print(f"✈️ {self.call_sign} (Passenger Jet, {self.passengers} pax): Requesting takeoff clearance")
        return self.atc.request_takeoff(self)

class CargoPlane(Aircraft):
    def __init__(self, call_sign: str, atc: AirTrafficControl, cargo_weight: float):
        super().__init__(call_sign, atc)
        self.cargo_weight = cargo_weight
    
    def request_landing(self) -> bool:
        print(f"📦 {self.call_sign} (Cargo, {self.cargo_weight}t): Requesting landing clearance")
        return self.atc.request_landing(self)
    
    def request_takeoff(self) -> bool:
        print(f"📦 {self.call_sign} (Cargo, {self.cargo_weight}t): Requesting takeoff clearance")
        return self.atc.request_takeoff(self)

class EmergencyAircraft(Aircraft):
    def __init__(self, call_sign: str, atc: AirTrafficControl, emergency_type: str):
        super().__init__(call_sign, atc)
        self.emergency_type = emergency_type
        self.fuel_level = 15  # Emergency aircraft typically low on fuel
    
    def request_landing(self) -> bool:
        print(f"🆘 {self.call_sign} (EMERGENCY - {self.emergency_type}): MAYDAY! Requesting immediate landing!")
        return self.atc.request_landing(self)
    
    def request_takeoff(self) -> bool:
        # Emergency aircraft don't typically request takeoff during emergency
        print(f"🆘 {self.call_sign}: Emergency aircraft requesting takeoff (unusual)")
        return self.atc.request_takeoff(self)

# Concrete mediator
class Airport(AirTrafficControl):
    def __init__(self, name: str, runway_count: int = 2):
        self.name = name
        self.runway_count = runway_count
        self.aircraft: List[Aircraft] = []
        self.landing_queue: List[Aircraft] = []
        self.takeoff_queue: List[Aircraft] = []
        self.active_runways = {f"Runway {i+1}": None for i in range(runway_count)}
        
    def register_aircraft(self, aircraft: Aircraft):
        self.aircraft.append(aircraft)
        print(f"📻 {self.name} ATC: {aircraft.get_call_sign()} registered")
    
    def request_landing(self, aircraft: Aircraft) -> bool:
        # Emergency aircraft get priority
        if isinstance(aircraft, EmergencyAircraft):
            print(f"🚨 {self.name} ATC: EMERGENCY PRIORITY - Clearing runway for {aircraft.get_call_sign()}")
            # Find available runway or clear one
            runway = self._get_available_runway()
            if runway:
                self._assign_runway_for_landing(aircraft, runway)
                return True
            else:
                # Clear a runway for emergency
                self._clear_runway_for_emergency(aircraft)
                return True
        
        # Check fuel level - low fuel gets priority
        if aircraft.get_fuel_level() <= 20:
            print(f"⛽ {self.name} ATC: LOW FUEL PRIORITY - {aircraft.get_call_sign()}")
            self.landing_queue.insert(0, aircraft)  # Priority queue
        else:
            self.landing_queue.append(aircraft)
        
        # Process landing queue
        return self._process_landing_queue()
    
    def request_takeoff(self, aircraft: Aircraft) -> bool:
        if aircraft.get_status() not in [FlightStatus.LANDED]:
            print(f"❌ {self.name} ATC: {aircraft.get_call_sign()} not cleared for takeoff - not on ground")
            return False
        
        self.takeoff_queue.append(aircraft)
        return self._process_takeoff_queue()
    
    def notify_status_change(self, aircraft: Aircraft, status: FlightStatus):
        print(f"📻 {self.name} ATC: {aircraft.get_call_sign()} status: {status.value}")
        
        if status == FlightStatus.LANDED:
            # Free up runway after landing
            for runway_name, occupying_aircraft in self.active_runways.items():
                if occupying_aircraft == aircraft:
                    self.active_runways[runway_name] = None
                    print(f"✅ {self.name} ATC: {runway_name} now available")
                    break
            
            # Process queues
            self._process_landing_queue()
            self._process_takeoff_queue()
        
        elif status == FlightStatus.DEPARTED:
            # Free up runway after takeoff
            for runway_name, occupying_aircraft in self.active_runways.items():
                if occupying_aircraft == aircraft:
                    self.active_runways[runway_name] = None
                    print(f"✅ {self.name} ATC: {runway_name} now available")
                    break
            
            # Remove from our tracking
            if aircraft in self.aircraft:
                self.aircraft.remove(aircraft)
            
            # Process queues
            self._process_landing_queue()
            self._process_takeoff_queue()
    
    def _get_available_runway(self) -> Optional[str]:
        for runway_name, occupying_aircraft in self.active_runways.items():
            if occupying_aircraft is None:
                return runway_name
        return None
    
    def _assign_runway_for_landing(self, aircraft: Aircraft, runway: str):
        self.active_runways[runway] = aircraft
        print(f"✈️ {self.name} ATC: {aircraft.get_call_sign()} cleared for landing on {runway}")
        aircraft.set_status(FlightStatus.LANDING)
        
        # Simulate landing process
        import time
        # In real implementation, this would be async
        print(f"🛬 {aircraft.get_call_sign()} is landing...")
        aircraft.set_status(FlightStatus.LANDED)
    
    def _clear_runway_for_emergency(self, emergency_aircraft: Aircraft):
        # For emergency, clear any runway
        runway_to_clear = list(self.active_runways.keys())[0]
        current_aircraft = self.active_runways[runway_to_clear]
        
        if current_aircraft:
            print(f"⚠️ {self.name} ATC: Emergency situation - moving {current_aircraft.get_call_sign()} to holding pattern")
        
        self._assign_runway_for_landing(emergency_aircraft, runway_to_clear)
    
    def _process_landing_queue(self) -> bool:
        if not self.landing_queue:
            return True
        
        runway = self._get_available_runway()
        if runway and self.landing_queue:
            aircraft = self.landing_queue.pop(0)
            self._assign_runway_for_landing(aircraft, runway)
            return True
        
        return False
    
    def _process_takeoff_queue(self) -> bool:
        if not self.takeoff_queue:
            return True
        
        runway = self._get_available_runway()
        if runway and self.takeoff_queue:
            aircraft = self.takeoff_queue.pop(0)
            self.active_runways[runway] = aircraft
            print(f"🛫 {self.name} ATC: {aircraft.get_call_sign()} cleared for takeoff on {runway}")
            aircraft.set_status(FlightStatus.TAKING_OFF)
            
            # Simulate takeoff
            print(f"✈️ {aircraft.get_call_sign()} is taking off...")
            aircraft.set_status(FlightStatus.DEPARTED)
            return True
        
        return False
    
    def get_status_report(self):
        print(f"\n=== {self.name} Status Report ===")
        print(f"Aircraft on ground: {len([a for a in self.aircraft if a.get_status() == FlightStatus.LANDED])}")
        print(f"Landing queue: {len(self.landing_queue)}")
        print(f"Takeoff queue: {len(self.takeoff_queue)}")
        print("Runway status:")
        for runway, aircraft in self.active_runways.items():
            status = f"Occupied by {aircraft.get_call_sign()}" if aircraft else "Available"
            print(f"  {runway}: {status}")

# Usage
def demonstrate_air_traffic_control():
    # Create airport
    airport = Airport("JFK International", runway_count=3)
    
    # Create aircraft
    flight_aa123 = PassengerJet("AA123", airport, 180)
    flight_ua456 = PassengerJet("UA456", airport, 220)
    cargo_fx789 = CargoPlane("FX789", airport, 45.5)
    emergency_em001 = EmergencyAircraft("EM001", airport, "Engine failure")
    
    # Register aircraft
    airport.register_aircraft(flight_aa123)
    airport.register_aircraft(flight_ua456)
    airport.register_aircraft(cargo_fx789)
    airport.register_aircraft(emergency_em001)
    
    print("\n=== Landing Requests ===")
    
    # Regular landing requests
    flight_aa123.request_landing()
    flight_ua456.request_landing()
    cargo_fx789.consume_fuel(85)  # Low fuel
    cargo_fx789.request_landing()
    
    # Emergency landing
    emergency_em001.request_landing()
    
    print("\n=== Takeoff Requests ===")
    
    # Simulate some aircraft are now on ground and ready for takeoff
    flight_aa123.set_status(FlightStatus.LANDED)
    flight_ua456.set_status(FlightStatus.LANDED)
    
    flight_aa123.request_takeoff()
    flight_ua456.request_takeoff()
    
    airport.get_status_report()

demonstrate_air_traffic_control()
```

## Pros and Cons

### Advantages
- Reduces coupling between colleagues
- Centralizes complex communications and control logic
- Makes object interaction easier to understand and maintain
- Follows Single Responsibility Principle
- Makes the interaction reusable

### Disadvantages
- Mediator can become a god object
- Can become complex if it handles too many interactions
- Can introduce single point of failure

## Real-World Examples
- Air traffic control systems
- Chat applications
- UI dialog boxes
- Workflow engines
- Event management systems
- MVC pattern (Controller acts as mediator)
- Message brokers (RabbitMQ, Apache Kafka)

## Common Use Cases
- Complex UI interactions
- Multi-user systems
- Workflow management
- Event coordination
- Communication protocols
- Resource allocation systems
- Game coordination (multiplayer games)
- System integration