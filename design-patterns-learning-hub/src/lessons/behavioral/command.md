# Command Pattern

## Overview
The Command pattern encapsulates a request as an object, allowing you to parameterize clients with different requests, queue operations, log requests, and support undo operations. It decouples the object that invokes the operation from the object that performs it.

## When to Use
- When you want to parameterize objects with operations
- When you want to queue operations, schedule their execution, or execute them remotely
- When you want to support undo operations
- When you want to support logging changes for crash recovery
- When you want to structure a system around high-level operations built on primitives

## Structure
```
┌─────────────────┐
│     Client      │
└─────────────────┘
         │
         │ creates
         ▼
┌─────────────────┐     ┌─────────────────┐
│    Invoker      │────▶│    Command      │
├─────────────────┤     ├─────────────────┤
│ + setCommand()  │     │ + execute()     │
│ + executeCmd()  │     │ + undo()        │
└─────────────────┘     └─────────────────┘
                                 △
                                 │
                        ┌─────────────────┐
                        │ConcreteCommand  │
                        ├─────────────────┤
                        │ - receiver      │
                        │ + execute()     │────┐
                        │ + undo()        │    │
                        └─────────────────┘    │
                                               │
                                               ▼
                                      ┌─────────────────┐
                                      │    Receiver     │
                                      ├─────────────────┤
                                      │ + action()      │
                                      └─────────────────┘
```

## Implementation Examples

### JavaScript/TypeScript
```javascript
// Command interface
interface Command {
  execute(): void;
  undo(): void;
}

// Receiver - knows how to perform operations
class Light {
  private isOn: boolean = false;

  turnOn(): void {
    this.isOn = true;
    console.log('Light is ON');
  }

  turnOff(): void {
    this.isOn = false;
    console.log('Light is OFF');
  }

  getState(): boolean {
    return this.isOn;
  }
}

class Fan {
  private speed: number = 0; // 0 = off, 1-3 = speeds

  setSpeed(speed: number): void {
    this.speed = Math.max(0, Math.min(3, speed));
    if (this.speed === 0) {
      console.log('Fan is OFF');
    } else {
      console.log(`Fan speed set to ${this.speed}`);
    }
  }

  getSpeed(): number {
    return this.speed;
  }
}

// Concrete Commands
class LightOnCommand implements Command {
  private light: Light;

  constructor(light: Light) {
    this.light = light;
  }

  execute(): void {
    this.light.turnOn();
  }

  undo(): void {
    this.light.turnOff();
  }
}

class LightOffCommand implements Command {
  private light: Light;

  constructor(light: Light) {
    this.light = light;
  }

  execute(): void {
    this.light.turnOff();
  }

  undo(): void {
    this.light.turnOn();
  }
}

class FanSetSpeedCommand implements Command {
  private fan: Fan;
  private speed: number;
  private previousSpeed: number;

  constructor(fan: Fan, speed: number) {
    this.fan = fan;
    this.speed = speed;
    this.previousSpeed = 0;
  }

  execute(): void {
    this.previousSpeed = this.fan.getSpeed();
    this.fan.setSpeed(this.speed);
  }

  undo(): void {
    this.fan.setSpeed(this.previousSpeed);
  }
}

// Null Object Pattern for empty commands
class NoCommand implements Command {
  execute(): void {}
  undo(): void {}
}

// Macro Command - composite command
class MacroCommand implements Command {
  private commands: Command[];

  constructor(commands: Command[]) {
    this.commands = commands;
  }

  execute(): void {
    console.log('Executing macro command:');
    this.commands.forEach(command => command.execute());
  }

  undo(): void {
    console.log('Undoing macro command:');
    // Undo in reverse order
    for (let i = this.commands.length - 1; i >= 0; i--) {
      this.commands[i].undo();
    }
  }
}

// Invoker
class RemoteControl {
  private commands: Command[] = [];
  private undoCommand: Command = new NoCommand();

  setCommand(slot: number, command: Command): void {
    this.commands[slot] = command;
  }

  pressButton(slot: number): void {
    if (this.commands[slot]) {
      this.commands[slot].execute();
      this.undoCommand = this.commands[slot];
    }
  }

  pressUndo(): void {
    this.undoCommand.undo();
  }
}

// Usage
const remote = new RemoteControl();
const livingRoomLight = new Light();
const ceilingFan = new Fan();

// Create commands
const lightOn = new LightOnCommand(livingRoomLight);
const lightOff = new LightOffCommand(livingRoomLight);
const fanHigh = new FanSetSpeedCommand(ceilingFan, 3);
const fanOff = new FanSetSpeedCommand(ceilingFan, 0);

// Set up remote
remote.setCommand(0, lightOn);
remote.setCommand(1, lightOff);
remote.setCommand(2, fanHigh);
remote.setCommand(3, fanOff);

// Test commands
console.log('=== Testing Basic Commands ===');
remote.pressButton(0); // Light ON
remote.pressButton(2); // Fan High
remote.pressUndo();    // Undo Fan (Fan OFF)
remote.pressUndo();    // Undo Light (Light OFF)

console.log('\n=== Testing Macro Command ===');
const partyMode = new MacroCommand([lightOn, fanHigh]);
remote.setCommand(4, partyMode);
remote.pressButton(4); // Execute party mode
remote.pressUndo();    // Undo party mode
```

### Python
```python
from abc import ABC, abstractmethod
from typing import List
import datetime

# Command interface
class Command(ABC):
    @abstractmethod
    def execute(self):
        pass
    
    @abstractmethod
    def undo(self):
        pass

# Receivers
class Document:
    def __init__(self):
        self._content = ""
    
    def add_text(self, text: str):
        self._content += text
        print(f"Added: '{text}' | Content: '{self._content}'")
    
    def remove_text(self, length: int):
        removed = self._content[-length:] if length <= len(self._content) else self._content
        self._content = self._content[:-length] if length <= len(self._content) else ""
        print(f"Removed: '{removed}' | Content: '{self._content}'")
        return removed
    
    def get_content(self):
        return self._content

class FileSystem:
    def __init__(self):
        self._files = set()
    
    def create_file(self, filename: str):
        self._files.add(filename)
        print(f"Created file: {filename}")
    
    def delete_file(self, filename: str):
        if filename in self._files:
            self._files.remove(filename)
            print(f"Deleted file: {filename}")
            return True
        return False
    
    def file_exists(self, filename: str):
        return filename in self._files

# Concrete Commands
class AddTextCommand(Command):
    def __init__(self, document: Document, text: str):
        self._document = document
        self._text = text
    
    def execute(self):
        self._document.add_text(self._text)
    
    def undo(self):
        self._document.remove_text(len(self._text))

class RemoveTextCommand(Command):
    def __init__(self, document: Document, length: int):
        self._document = document
        self._length = length
        self._removed_text = ""
    
    def execute(self):
        self._removed_text = self._document.remove_text(self._length)
    
    def undo(self):
        self._document.add_text(self._removed_text)

class CreateFileCommand(Command):
    def __init__(self, filesystem: FileSystem, filename: str):
        self._filesystem = filesystem
        self._filename = filename
    
    def execute(self):
        self._filesystem.create_file(self._filename)
    
    def undo(self):
        self._filesystem.delete_file(self._filename)

class DeleteFileCommand(Command):
    def __init__(self, filesystem: FileSystem, filename: str):
        self._filesystem = filesystem
        self._filename = filename
        self._file_existed = False
    
    def execute(self):
        self._file_existed = self._filesystem.file_exists(self._filename)
        if self._file_existed:
            self._filesystem.delete_file(self._filename)
    
    def undo(self):
        if self._file_existed:
            self._filesystem.create_file(self._filename)

# Command Manager (Invoker with history)
class CommandManager:
    def __init__(self):
        self._history: List[Command] = []
        self._current_position = -1
    
    def execute_command(self, command: Command):
        # Remove any commands after current position (for redo functionality)
        self._history = self._history[:self._current_position + 1]
        
        # Execute and add to history
        command.execute()
        self._history.append(command)
        self._current_position += 1
    
    def undo(self):
        if self._current_position >= 0:
            command = self._history[self._current_position]
            command.undo()
            self._current_position -= 1
            print(f"Undid command. Position: {self._current_position}")
        else:
            print("Nothing to undo")
    
    def redo(self):
        if self._current_position < len(self._history) - 1:
            self._current_position += 1
            command = self._history[self._current_position]
            command.execute()
            print(f"Redid command. Position: {self._current_position}")
        else:
            print("Nothing to redo")

# Usage
def demonstrate_text_editor():
    document = Document()
    manager = CommandManager()
    
    # Execute commands
    manager.execute_command(AddTextCommand(document, "Hello "))
    manager.execute_command(AddTextCommand(document, "World!"))
    manager.execute_command(RemoveTextCommand(document, 6))  # Remove "World!"
    manager.execute_command(AddTextCommand(document, "Python!"))
    
    print(f"\nFinal content: '{document.get_content()}'")
    
    # Test undo/redo
    print("\n=== Testing Undo/Redo ===")
    manager.undo()  # Undo "Python!"
    manager.undo()  # Undo remove "World!"
    manager.redo()  # Redo remove "World!"
    manager.execute_command(AddTextCommand(document, "Universe!"))
    
    print(f"Final content: '{document.get_content()}'")

def demonstrate_file_system():
    fs = FileSystem()
    manager = CommandManager()
    
    # File operations
    print("\n=== File System Commands ===")
    manager.execute_command(CreateFileCommand(fs, "document.txt"))
    manager.execute_command(CreateFileCommand(fs, "image.png"))
    manager.execute_command(DeleteFileCommand(fs, "document.txt"))
    
    print("\n=== Undo Operations ===")
    manager.undo()  # Restore document.txt
    manager.undo()  # Remove image.png
    manager.undo()  # Remove document.txt

demonstrate_text_editor()
demonstrate_file_system()
```

### Java
```java
import java.util.*;
import java.time.LocalDateTime;

// Command interface
interface Command {
    void execute();
    void undo();
    String getDescription();
}

// Receivers
class BankAccount {
    private String accountNumber;
    private double balance;
    
    public BankAccount(String accountNumber, double initialBalance) {
        this.accountNumber = accountNumber;
        this.balance = initialBalance;
    }
    
    public void deposit(double amount) {
        balance += amount;
        System.out.println("Deposited $" + amount + ". New balance: $" + balance);
    }
    
    public boolean withdraw(double amount) {
        if (balance >= amount) {
            balance -= amount;
            System.out.println("Withdrawn $" + amount + ". New balance: $" + balance);
            return true;
        }
        System.out.println("Insufficient funds. Current balance: $" + balance);
        return false;
    }
    
    public double getBalance() {
        return balance;
    }
    
    public String getAccountNumber() {
        return accountNumber;
    }
}

// Concrete Commands
class DepositCommand implements Command {
    private BankAccount account;
    private double amount;
    private boolean wasExecuted = false;
    
    public DepositCommand(BankAccount account, double amount) {
        this.account = account;
        this.amount = amount;
    }
    
    public void execute() {
        account.deposit(amount);
        wasExecuted = true;
    }
    
    public void undo() {
        if (wasExecuted && account.getBalance() >= amount) {
            account.withdraw(amount);
        }
    }
    
    public String getDescription() {
        return "Deposit $" + amount + " to " + account.getAccountNumber();
    }
}

class WithdrawCommand implements Command {
    private BankAccount account;
    private double amount;
    private boolean wasExecuted = false;
    
    public WithdrawCommand(BankAccount account, double amount) {
        this.account = account;
        this.amount = amount;
    }
    
    public void execute() {
        wasExecuted = account.withdraw(amount);
    }
    
    public void undo() {
        if (wasExecuted) {
            account.deposit(amount);
        }
    }
    
    public String getDescription() {
        return "Withdraw $" + amount + " from " + account.getAccountNumber();
    }
}

class TransferCommand implements Command {
    private BankAccount fromAccount;
    private BankAccount toAccount;
    private double amount;
    private boolean wasExecuted = false;
    
    public TransferCommand(BankAccount fromAccount, BankAccount toAccount, double amount) {
        this.fromAccount = fromAccount;
        this.toAccount = toAccount;
        this.amount = amount;
    }
    
    public void execute() {
        if (fromAccount.getBalance() >= amount) {
            fromAccount.withdraw(amount);
            toAccount.deposit(amount);
            wasExecuted = true;
            System.out.println("Transferred $" + amount + " from " + 
                             fromAccount.getAccountNumber() + " to " + 
                             toAccount.getAccountNumber());
        } else {
            System.out.println("Transfer failed: insufficient funds");
        }
    }
    
    public void undo() {
        if (wasExecuted && toAccount.getBalance() >= amount) {
            toAccount.withdraw(amount);
            fromAccount.deposit(amount);
            System.out.println("Transfer reversed");
        }
    }
    
    public String getDescription() {
        return "Transfer $" + amount + " from " + fromAccount.getAccountNumber() + 
               " to " + toAccount.getAccountNumber();
    }
}

// Invoker with transaction support
class BankingSystem {
    private List<Command> transactionHistory = new ArrayList<>();
    private List<Command> currentTransaction = new ArrayList<>();
    private boolean inTransaction = false;
    
    public void beginTransaction() {
        if (!inTransaction) {
            currentTransaction.clear();
            inTransaction = true;
            System.out.println("Transaction started");
        }
    }
    
    public void executeCommand(Command command) {
        command.execute();
        
        if (inTransaction) {
            currentTransaction.add(command);
        } else {
            transactionHistory.add(command);
        }
    }
    
    public void commitTransaction() {
        if (inTransaction) {
            transactionHistory.addAll(currentTransaction);
            currentTransaction.clear();
            inTransaction = false;
            System.out.println("Transaction committed");
        }
    }
    
    public void rollbackTransaction() {
        if (inTransaction) {
            System.out.println("Rolling back transaction...");
            // Undo commands in reverse order
            for (int i = currentTransaction.size() - 1; i >= 0; i--) {
                currentTransaction.get(i).undo();
            }
            currentTransaction.clear();
            inTransaction = false;
            System.out.println("Transaction rolled back");
        }
    }
    
    public void undoLastCommand() {
        if (!transactionHistory.isEmpty()) {
            Command lastCommand = transactionHistory.get(transactionHistory.size() - 1);
            lastCommand.undo();
            transactionHistory.remove(transactionHistory.size() - 1);
            System.out.println("Undid: " + lastCommand.getDescription());
        }
    }
    
    public void showHistory() {
        System.out.println("\nTransaction History:");
        for (int i = 0; i < transactionHistory.size(); i++) {
            System.out.println((i + 1) + ". " + transactionHistory.get(i).getDescription());
        }
    }
}

// Usage
public class CommandExample {
    public static void main(String[] args) {
        // Create accounts
        BankAccount checking = new BankAccount("CHK001", 1000.0);
        BankAccount savings = new BankAccount("SAV001", 500.0);
        
        BankingSystem bank = new BankingSystem();
        
        // Individual operations
        System.out.println("=== Individual Operations ===");
        bank.executeCommand(new DepositCommand(checking, 200));
        bank.executeCommand(new WithdrawCommand(savings, 100));
        
        // Transaction example
        System.out.println("\n=== Transaction Example ===");
        bank.beginTransaction();
        bank.executeCommand(new WithdrawCommand(checking, 300));
        bank.executeCommand(new DepositCommand(savings, 300));
        bank.executeCommand(new TransferCommand(savings, checking, 150));
        bank.commitTransaction();
        
        // Failed transaction (rollback)
        System.out.println("\n=== Failed Transaction (Rollback) ===");
        bank.beginTransaction();
        bank.executeCommand(new WithdrawCommand(checking, 500));
        bank.executeCommand(new WithdrawCommand(checking, 2000)); // This should fail
        bank.rollbackTransaction();
        
        // Show history and undo
        bank.showHistory();
        
        System.out.println("\n=== Undo Last Command ===");
        bank.undoLastCommand();
        
        System.out.println("\nFinal balances:");
        System.out.println("Checking: $" + checking.getBalance());
        System.out.println("Savings: $" + savings.getBalance());
    }
}
```

## GUI Event Handling with Commands
```javascript
interface UICommand {
  execute(): void;
  undo(): void;
  getDescription(): string;
}

class TextEditor {
  private content: string = '';
  private cursorPosition: number = 0;

  insertText(text: string, position: number): void {
    this.content = this.content.slice(0, position) + text + this.content.slice(position);
    this.cursorPosition = position + text.length;
    this.notifyUpdate();
  }

  deleteText(position: number, length: number): string {
    const deleted = this.content.slice(position, position + length);
    this.content = this.content.slice(0, position) + this.content.slice(position + length);
    this.cursorPosition = position;
    this.notifyUpdate();
    return deleted;
  }

  getContent(): string {
    return this.content;
  }

  getCursor(): number {
    return this.cursorPosition;
  }

  private notifyUpdate(): void {
    console.log(`Content: "${this.content}" | Cursor: ${this.cursorPosition}`);
  }
}

class InsertTextCommand implements UICommand {
  constructor(
    private editor: TextEditor,
    private text: string,
    private position: number
  ) {}

  execute(): void {
    this.editor.insertText(this.text, this.position);
  }

  undo(): void {
    this.editor.deleteText(this.position, this.text.length);
  }

  getDescription(): string {
    return `Insert "${this.text}" at position ${this.position}`;
  }
}

class DeleteTextCommand implements UICommand {
  private deletedText: string = '';

  constructor(
    private editor: TextEditor,
    private position: number,
    private length: number
  ) {}

  execute(): void {
    this.deletedText = this.editor.deleteText(this.position, this.length);
  }

  undo(): void {
    this.editor.insertText(this.deletedText, this.position);
  }

  getDescription(): string {
    return `Delete ${this.length} characters at position ${this.position}`;
  }
}

class EditorCommandManager {
  private undoStack: UICommand[] = [];
  private redoStack: UICommand[] = [];

  execute(command: UICommand): void {
    command.execute();
    this.undoStack.push(command);
    this.redoStack = []; // Clear redo stack when new command is executed
  }

  undo(): void {
    if (this.undoStack.length > 0) {
      const command = this.undoStack.pop()!;
      command.undo();
      this.redoStack.push(command);
      console.log(`Undid: ${command.getDescription()}`);
    }
  }

  redo(): void {
    if (this.redoStack.length > 0) {
      const command = this.redoStack.pop()!;
      command.execute();
      this.undoStack.push(command);
      console.log(`Redid: ${command.getDescription()}`);
    }
  }

  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  canRedo(): boolean {
    return this.redoStack.length > 0;
  }
}

// Usage
const editor = new TextEditor();
const commandManager = new EditorCommandManager();

console.log('=== Text Editor Commands ===');

// Simulate typing
commandManager.execute(new InsertTextCommand(editor, 'Hello', 0));
commandManager.execute(new InsertTextCommand(editor, ' World', 5));
commandManager.execute(new InsertTextCommand(editor, '!', 11));

// Simulate deletion
commandManager.execute(new DeleteTextCommand(editor, 5, 6)); // Delete " World"

console.log('\n=== Undo/Redo Operations ===');
commandManager.undo(); // Restore " World"
commandManager.undo(); // Remove "!"
commandManager.redo(); // Add "!" back
commandManager.execute(new InsertTextCommand(editor, ' Again', 12));

console.log(`\nFinal content: "${editor.getContent()}"`);
```

## Pros and Cons

### Advantages
- Decouples invoker from receiver
- Allows parameterization of objects with operations
- Enables queuing, logging, and undo operations
- Supports macro commands (composite commands)
- Follows Single Responsibility Principle
- Follows Open/Closed Principle
- Enables delayed execution and scheduling

### Disadvantages
- Can introduce many small command classes
- May increase complexity for simple operations
- Can impact performance with many command objects

## Real-World Examples
- GUI buttons and menu items
- Undo/Redo functionality in text editors
- Database transactions
- Network request queuing
- Macro recording in applications
- Thread pools and job queues
- Remote procedure calls
- Wizard step navigation