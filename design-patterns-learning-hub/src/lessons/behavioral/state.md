# State Pattern

## Overview
The State pattern allows an object to alter its behavior when its internal state changes. The object appears to change its class by delegating state-specific behavior to different state objects.

## When to Use
- When object behavior depends on its state and must change at runtime
- When you have large conditional statements that depend on object state
- When similar code is duplicated across multiple states
- When state transitions are complex

## Structure
```
┌─────────────────┐
│    Context      │
├─────────────────┤
│ - state         │──────┐
│ + request()     │      │
│ + setState()    │      │
└─────────────────┘      │
                         │
                         ▼
                ┌─────────────────┐
                │     State       │
                ├─────────────────┤
                │ + handle()      │
                └─────────────────┘
                         △
                         │
            ┌────────────┴────────────┐
            │                         │
   ┌─────────────────┐      ┌─────────────────┐
   │ ConcreteStateA  │      │ ConcreteStateB  │
   ├─────────────────┤      ├─────────────────┤
   │ + handle()      │      │ + handle()      │
   └─────────────────┘      └─────────────────┘
```

## Implementation Examples

### JavaScript/TypeScript - Vending Machine
```javascript
// State interface
interface VendingMachineState {
  insertCoin(machine: VendingMachine): void;
  selectItem(machine: VendingMachine): void;
  dispenseItem(machine: VendingMachine): void;
  cancel(machine: VendingMachine): void;
}

// Context
class VendingMachine {
  private currentState: VendingMachineState;
  private idleState: VendingMachineState;
  private hasMoneyState: VendingMachineState;
  private soldState: VendingMachineState;
  private outOfStockState: VendingMachineState;

  private items: Map<string, { name: string; price: number; stock: number }> = new Map();
  private insertedMoney: number = 0;
  private selectedItem: string = '';

  constructor() {
    this.idleState = new IdleState();
    this.hasMoneyState = new HasMoneyState();
    this.soldState = new SoldState();
    this.outOfStockState = new OutOfStockState();
    
    this.currentState = this.idleState;
    
    // Initialize items
    this.items.set('A1', { name: 'Coke', price: 150, stock: 5 });
    this.items.set('A2', { name: 'Pepsi', price: 150, stock: 3 });
    this.items.set('B1', { name: 'Chips', price: 100, stock: 0 });
    this.items.set('B2', { name: 'Candy', price: 75, stock: 8 });
  }

  // State management
  setState(state: VendingMachineState): void {
    this.currentState = state;
    console.log(`State changed to: ${this.getStateName()}`);
  }

  getStateName(): string {
    if (this.currentState === this.idleState) return 'Idle';
    if (this.currentState === this.hasMoneyState) return 'HasMoney';
    if (this.currentState === this.soldState) return 'Sold';
    if (this.currentState === this.outOfStockState) return 'OutOfStock';
    return 'Unknown';
  }

  // State getters
  getIdleState(): VendingMachineState { return this.idleState; }
  getHasMoneyState(): VendingMachineState { return this.hasMoneyState; }
  getSoldState(): VendingMachineState { return this.soldState; }
  getOutOfStockState(): VendingMachineState { return this.outOfStockState; }

  // Public interface - delegates to current state
  insertCoin(amount: number): void {
    this.insertedMoney += amount;
    console.log(`💰 Inserted $${amount/100}. Total: $${this.insertedMoney/100}`);
    this.currentState.insertCoin(this);
  }

  selectItem(itemCode: string): void {
    this.selectedItem = itemCode;
    console.log(`🎯 Selected item: ${itemCode}`);
    this.currentState.selectItem(this);
  }

  dispenseItem(): void {
    this.currentState.dispenseItem(this);
  }

  cancel(): void {
    this.currentState.cancel(this);
  }

  // Helper methods
  hasEnoughMoney(): boolean {
    const item = this.items.get(this.selectedItem);
    return item ? this.insertedMoney >= item.price : false;
  }

  hasStock(): boolean {
    const item = this.items.get(this.selectedItem);
    return item ? item.stock > 0 : false;
  }

  getItemInfo(itemCode: string): { name: string; price: number; stock: number } | null {
    return this.items.get(itemCode) || null;
  }

  getInsertedMoney(): number {
    return this.insertedMoney;
  }

  getSelectedItem(): string {
    return this.selectedItem;
  }

  releaseItem(): void {
    const item = this.items.get(this.selectedItem);
    if (item && item.stock > 0) {
      item.stock--;
      console.log(`📦 Dispensed: ${item.name}`);
      
      // Give change
      const change = this.insertedMoney - item.price;
      if (change > 0) {
        console.log(`💵 Change returned: $${change/100}`);
      }
      
      this.resetTransaction();
    }
  }

  returnMoney(): void {
    if (this.insertedMoney > 0) {
      console.log(`💵 Returned: $${this.insertedMoney/100}`);
    }
    this.resetTransaction();
  }

  private resetTransaction(): void {
    this.insertedMoney = 0;
    this.selectedItem = '';
  }

  displayStatus(): void {
    console.log('\\n=== Vending Machine Status ===');
    console.log(`State: ${this.getStateName()}`);
    console.log(`Money inserted: $${this.insertedMoney/100}`);
    console.log(`Selected item: ${this.selectedItem || 'None'}`);
    console.log('Available items:');
    this.items.forEach((item, code) => {
      console.log(`  ${code}: ${item.name} - $${item.price/100} (${item.stock} left)`);
    });
    console.log('========================\\n');
  }
}

// Concrete states
class IdleState implements VendingMachineState {
  insertCoin(machine: VendingMachine): void {
    machine.setState(machine.getHasMoneyState());
  }

  selectItem(machine: VendingMachine): void {
    console.log('❌ Please insert money first');
  }

  dispenseItem(machine: VendingMachine): void {
    console.log('❌ Please insert money first');
  }

  cancel(machine: VendingMachine): void {
    console.log('❌ Nothing to cancel');
  }
}

class HasMoneyState implements VendingMachineState {
  insertCoin(machine: VendingMachine): void {
    console.log('💰 Added more money');
  }

  selectItem(machine: VendingMachine): void {
    const item = machine.getItemInfo(machine.getSelectedItem());
    if (!item) {
      console.log('❌ Invalid item code');
      return;
    }

    if (!machine.hasStock()) {
      console.log('❌ Item out of stock');
      machine.setState(machine.getOutOfStockState());
      return;
    }

    if (!machine.hasEnoughMoney()) {
      console.log(`❌ Insufficient funds. Need $${(item.price - machine.getInsertedMoney())/100} more`);
      return;
    }

    console.log('✅ Item selected, dispensing...');
    machine.setState(machine.getSoldState());
    machine.dispenseItem();
  }

  dispenseItem(machine: VendingMachine): void {
    console.log('❌ Please select an item first');
  }

  cancel(machine: VendingMachine): void {
    console.log('🚫 Transaction cancelled');
    machine.returnMoney();
    machine.setState(machine.getIdleState());
  }
}

class SoldState implements VendingMachineState {
  insertCoin(machine: VendingMachine): void {
    console.log('⏳ Please wait, processing your purchase...');
  }

  selectItem(machine: VendingMachine): void {
    console.log('⏳ Already processing a purchase...');
  }

  dispenseItem(machine: VendingMachine): void {
    machine.releaseItem();
    machine.setState(machine.getIdleState());
  }

  cancel(machine: VendingMachine): void {
    console.log('❌ Cannot cancel, item already being dispensed');
  }
}

class OutOfStockState implements VendingMachineState {
  insertCoin(machine: VendingMachine): void {
    console.log('💰 Money accepted, but please select a different item');
    machine.setState(machine.getHasMoneyState());
  }

  selectItem(machine: VendingMachine): void {
    console.log('❌ Selected item is out of stock, please choose another');
  }

  dispenseItem(machine: VendingMachine): void {
    console.log('❌ Cannot dispense - out of stock');
  }

  cancel(machine: VendingMachine): void {
    console.log('🚫 Transaction cancelled - item out of stock');
    machine.returnMoney();
    machine.setState(machine.getIdleState());
  }
}

// Usage
const vendingMachine = new VendingMachine();

console.log('=== Vending Machine Demo ===');
vendingMachine.displayStatus();

// Normal purchase flow
vendingMachine.insertCoin(100);
vendingMachine.selectItem('B2'); // Candy for $0.75
vendingMachine.displayStatus();

// Insufficient funds
vendingMachine.insertCoin(50);
vendingMachine.selectItem('A1'); // Coke for $1.50 (need $1.00 more)

// Add more money and complete purchase
vendingMachine.insertCoin(100);
vendingMachine.selectItem('A1');
vendingMachine.displayStatus();

// Try out of stock item
vendingMachine.insertCoin(150);
vendingMachine.selectItem('B1'); // Chips (out of stock)
vendingMachine.selectItem('B2'); // Switch to candy
vendingMachine.displayStatus();

// Cancellation
vendingMachine.insertCoin(200);
vendingMachine.cancel();
vendingMachine.displayStatus();
```

### Python - TCP Connection
```python
from abc import ABC, abstractmethod
import time
import threading
from enum import Enum

class ConnectionEvent(Enum):
    OPEN = \"open\"
    CLOSE = \"close\"
    ACKNOWLEDGE = \"acknowledge\"
    TIMEOUT = \"timeout\"
    ERROR = \"error\"

# State interface
class TCPState(ABC):
    @abstractmethod
    def open(self, connection: 'TCPConnection'):
        pass
    
    @abstractmethod
    def close(self, connection: 'TCPConnection'):
        pass
    
    @abstractmethod
    def acknowledge(self, connection: 'TCPConnection'):
        pass
    
    @abstractmethod
    def timeout(self, connection: 'TCPConnection'):
        pass
    
    @abstractmethod
    def send_data(self, connection: 'TCPConnection', data: str):
        pass

# Context
class TCPConnection:
    def __init__(self, name: str):
        self.name = name
        self._state = None
        self.data_buffer = []
        self.retry_count = 0
        self.max_retries = 3
        self.timeout_timer = None
        
        # Initialize states
        self.closed_state = ClosedState()
        self.listen_state = ListenState() 
        self.established_state = EstablishedState()
        self.close_wait_state = CloseWaitState()
        
        # Start in closed state
        self.set_state(self.closed_state)
    
    def set_state(self, state: TCPState):
        old_state_name = self.get_state_name()
        self._state = state
        new_state_name = self.get_state_name()
        print(f\"🔄 {self.name}: {old_state_name} -> {new_state_name}\")
    
    def get_state_name(self) -> str:
        if isinstance(self._state, ClosedState):
            return \"CLOSED\"
        elif isinstance(self._state, ListenState):
            return \"LISTEN\"
        elif isinstance(self._state, EstablishedState):
            return \"ESTABLISHED\"
        elif isinstance(self._state, CloseWaitState):
            return \"CLOSE_WAIT\"
        return \"UNKNOWN\"
    
    # Public interface - delegates to current state
    def open(self):
        print(f\"📡 {self.name}: Attempting to open connection\")
        self._state.open(self)
    
    def close(self):
        print(f\"🔒 {self.name}: Attempting to close connection\")
        self._state.close(self)
    
    def acknowledge(self):
        print(f\"✅ {self.name}: Received acknowledgment\")
        self._state.acknowledge(self)
    
    def timeout(self):
        print(f\"⏰ {self.name}: Timeout occurred\")
        self._state.timeout(self)
    
    def send_data(self, data: str):
        print(f\"📤 {self.name}: Attempting to send: '{data}'\")
        self._state.send_data(self, data)
    
    # Helper methods
    def start_timeout_timer(self, seconds: int = 5):
        if self.timeout_timer:
            self.timeout_timer.cancel()
        
        self.timeout_timer = threading.Timer(seconds, self.timeout)
        self.timeout_timer.start()
        print(f\"⏲️  {self.name}: Timeout timer started ({seconds}s)\")
    
    def cancel_timeout_timer(self):
        if self.timeout_timer:
            self.timeout_timer.cancel()
            self.timeout_timer = None
            print(f\"⏹️  {self.name}: Timeout timer cancelled\")
    
    def increment_retry(self) -> bool:
        self.retry_count += 1
        print(f\"🔄 {self.name}: Retry attempt {self.retry_count}/{self.max_retries}\")
        return self.retry_count <= self.max_retries
    
    def reset_retry_count(self):
        self.retry_count = 0
    
    def add_to_buffer(self, data: str):
        self.data_buffer.append(data)
        print(f\"💾 {self.name}: Data buffered: '{data}'\")
    
    def flush_buffer(self):
        if self.data_buffer:
            print(f\"📨 {self.name}: Sending buffered data: {self.data_buffer}\")
            self.data_buffer.clear()
    
    def get_status(self) -> str:
        return (f\"Connection {self.name}:\\n\"
                f\"  State: {self.get_state_name()}\\n\"
                f\"  Retry count: {self.retry_count}/{self.max_retries}\\n\"
                f\"  Buffer size: {len(self.data_buffer)}\\n\"
                f\"  Timer active: {self.timeout_timer is not None}\")

# Concrete states
class ClosedState(TCPState):
    def open(self, connection: TCPConnection):
        connection.set_state(connection.listen_state)
        connection.start_timeout_timer()
        connection.reset_retry_count()
    
    def close(self, connection: TCPConnection):
        print(f\"⚠️  {connection.name}: Connection already closed\")
    
    def acknowledge(self, connection: TCPConnection):
        print(f\"❌ {connection.name}: Cannot acknowledge in closed state\")
    
    def timeout(self, connection: TCPConnection):
        print(f\"❌ {connection.name}: No timeout handling in closed state\")
    
    def send_data(self, connection: TCPConnection, data: str):
        print(f\"❌ {connection.name}: Cannot send data - connection closed\")

class ListenState(TCPState):
    def open(self, connection: TCPConnection):
        print(f\"⚠️  {connection.name}: Already attempting to connect\")
    
    def close(self, connection: TCPConnection):
        connection.cancel_timeout_timer()
        connection.set_state(connection.closed_state)
    
    def acknowledge(self, connection: TCPConnection):
        connection.cancel_timeout_timer()
        connection.set_state(connection.established_state)
        connection.flush_buffer()  # Send any buffered data
        print(f\"🎉 {connection.name}: Connection established!\")
    
    def timeout(self, connection: TCPConnection):
        if connection.increment_retry():
            print(f\"🔄 {connection.name}: Retrying connection...\")
            connection.start_timeout_timer()
        else:
            print(f\"💥 {connection.name}: Max retries exceeded, closing connection\")
            connection.set_state(connection.closed_state)
    
    def send_data(self, connection: TCPConnection, data: str):
        print(f\"⏳ {connection.name}: Connection not established, buffering data\")
        connection.add_to_buffer(data)

class EstablishedState(TCPState):
    def open(self, connection: TCPConnection):
        print(f\"✅ {connection.name}: Connection already established\")
    
    def close(self, connection: TCPConnection):
        connection.set_state(connection.close_wait_state)
        connection.start_timeout_timer(3)  # Shorter timeout for close
    
    def acknowledge(self, connection: TCPConnection):
        print(f\"ℹ️  {connection.name}: Acknowledgment received (connection healthy)\")
    
    def timeout(self, connection: TCPConnection):
        print(f\"⚠️  {connection.name}: Timeout in established state - connection may be unstable\")
    
    def send_data(self, connection: TCPConnection, data: str):
        print(f\"📨 {connection.name}: Data sent successfully: '{data}'\")

class CloseWaitState(TCPState):
    def open(self, connection: TCPConnection):
        print(f\"❌ {connection.name}: Cannot open - connection is closing\")
    
    def close(self, connection: TCPConnection):
        print(f\"⏳ {connection.name}: Close already in progress\")
    
    def acknowledge(self, connection: TCPConnection):
        connection.cancel_timeout_timer()
        connection.set_state(connection.closed_state)
        print(f\"🔒 {connection.name}: Connection closed successfully\")
    
    def timeout(self, connection: TCPConnection):
        print(f\"⚠️  {connection.name}: Close timeout - forcing connection closed\")
        connection.set_state(connection.closed_state)
    
    def send_data(self, connection: TCPConnection, data: str):
        print(f\"❌ {connection.name}: Cannot send data - connection is closing\")

# Usage
def demonstrate_tcp_connection():
    print(\"=== TCP Connection State Machine ===\")
    
    # Create connections
    conn1 = TCPConnection(\"Client-1\")
    conn2 = TCPConnection(\"Client-2\")
    
    print(\"\\n=== Initial Status ===\")
    print(conn1.get_status())
    
    print(\"\\n=== Successful Connection Sequence ===\")
    conn1.open()  # CLOSED -> LISTEN
    time.sleep(1)
    conn1.send_data(\"Hello Server\")  # Buffer data while connecting
    time.sleep(1)
    conn1.acknowledge()  # LISTEN -> ESTABLISHED (flushes buffer)
    conn1.send_data(\"Data packet 1\")  # Send immediately
    conn1.send_data(\"Data packet 2\")
    
    print(\"\\n=== Normal Close Sequence ===\")
    conn1.close()  # ESTABLISHED -> CLOSE_WAIT
    time.sleep(1)
    conn1.acknowledge()  # CLOSE_WAIT -> CLOSED
    
    print(\"\\n=== Connection with Timeout and Retry ===\")
    conn2.open()  # CLOSED -> LISTEN
    time.sleep(6)  # Let timeout occur
    # Timeout will trigger retry
    time.sleep(6)  # Let another timeout occur
    # Will retry again
    time.sleep(6)  # Final timeout
    # Should close after max retries
    
    print(\"\\n=== Final Status ===\")
    print(conn1.get_status())
    print(conn2.get_status())

# Run demonstration
if __name__ == \"__main__\":
    demonstrate_tcp_connection()
```

## Pros and Cons

### Advantages
- Eliminates complex conditional statements
- Makes state transitions explicit
- Easy to add new states
- Follows Single Responsibility Principle
- Follows Open/Closed Principle

### Disadvantages
- Can increase number of classes
- May be overkill for simple state machines
- Can make code harder to understand if overused

## Real-World Examples
- Network connection protocols
- User interface components
- Game character states
- Workflow management systems
- Order processing systems
- Media player controls
- Authentication systems

## Common Use Cases
- State machines with complex transitions
- UI component state management
- Network protocol implementations
- Game AI behavior
- Document workflow systems
- Device control systems
- Authentication flows