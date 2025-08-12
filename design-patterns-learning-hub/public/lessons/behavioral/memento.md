# Memento Pattern

## Overview
The Memento pattern captures and externalizes an object's internal state so that it can be restored later without violating encapsulation. It's commonly used to implement undo functionality and checkpoints.

## When to Use
- When you need to save and restore object states
- When implementing undo/redo functionality
- When you want to create snapshots of objects
- When direct access to object state would violate encapsulation
- When you need to implement checkpoints or rollback mechanisms

## Structure
```
┌─────────────────┐
│   Originator    │
├─────────────────┤
│ - state         │
│ + createMemento()│─────▶┌─────────────────┐
│ + restore()     │     │    Memento      │
└─────────────────┘     ├─────────────────┤
         △                │ - state         │
         │                │ + getState()    │
         │                └─────────────────┘
         │                         △
         │                         │
┌─────────────────┐                │ stores
│   Caretaker     │────────────────┘
├─────────────────┤
│ - mementos[]    │
│ + backup()      │
│ + undo()        │
└─────────────────┘
```

## Implementation Examples

### JavaScript/TypeScript - Text Editor
```javascript
// Memento class
class EditorMemento {
  constructor(
    private content: string,
    private cursorPosition: number,
    private selectionStart: number,
    private selectionEnd: number,
    private timestamp: Date = new Date()
  ) {}

  getContent(): string {
    return this.content;
  }

  getCursorPosition(): number {
    return this.cursorPosition;
  }

  getSelectionStart(): number {
    return this.selectionStart;
  }

  getSelectionEnd(): number {
    return this.selectionEnd;
  }

  getTimestamp(): Date {
    return this.timestamp;
  }

  getDescription(): string {
    return `State at ${this.timestamp.toLocaleTimeString()}: ${this.content.length} chars`;
  }
}

// Originator
class TextEditor {
  private content: string = '';
  private cursorPosition: number = 0;
  private selectionStart: number = 0;
  private selectionEnd: number = 0;

  // Text editing operations
  insertText(text: string): void {
    const before = this.content.substring(0, this.cursorPosition);
    const after = this.content.substring(this.cursorPosition);
    this.content = before + text + after;
    this.cursorPosition += text.length;
    this.clearSelection();
    this.notifyChange();
  }

  deleteText(length: number): string {
    const startPos = Math.max(0, this.cursorPosition - length);
    const deleted = this.content.substring(startPos, this.cursorPosition);
    this.content = this.content.substring(0, startPos) + this.content.substring(this.cursorPosition);
    this.cursorPosition = startPos;
    this.clearSelection();
    this.notifyChange();
    return deleted;
  }

  selectText(start: number, end: number): void {
    this.selectionStart = Math.max(0, Math.min(start, this.content.length));
    this.selectionEnd = Math.max(0, Math.min(end, this.content.length));
    this.cursorPosition = this.selectionEnd;
  }

  replaceSelection(text: string): void {
    if (this.hasSelection()) {
      const before = this.content.substring(0, this.selectionStart);
      const after = this.content.substring(this.selectionEnd);
      this.content = before + text + after;
      this.cursorPosition = this.selectionStart + text.length;
      this.clearSelection();
      this.notifyChange();
    } else {
      this.insertText(text);
    }
  }

  // State management
  createMemento(): EditorMemento {
    return new EditorMemento(
      this.content,
      this.cursorPosition,
      this.selectionStart,
      this.selectionEnd
    );
  }

  restoreFromMemento(memento: EditorMemento): void {
    this.content = memento.getContent();
    this.cursorPosition = memento.getCursorPosition();
    this.selectionStart = memento.getSelectionStart();
    this.selectionEnd = memento.getSelectionEnd();
    this.notifyChange();
  }

  // Getters
  getContent(): string {
    return this.content;
  }

  getCursorPosition(): number {
    return this.cursorPosition;
  }

  getSelection(): { start: number; end: number; text: string } {
    return {
      start: this.selectionStart,
      end: this.selectionEnd,
      text: this.content.substring(this.selectionStart, this.selectionEnd)
    };
  }

  private hasSelection(): boolean {
    return this.selectionStart !== this.selectionEnd;
  }

  private clearSelection(): void {
    this.selectionStart = this.cursorPosition;
    this.selectionEnd = this.cursorPosition;
  }

  private notifyChange(): void {
    console.log(`Content: "${this.content}" | Cursor: ${this.cursorPosition}`);
  }
}

// Caretaker
class EditorHistory {
  private history: EditorMemento[] = [];
  private currentIndex: number = -1;
  private maxHistorySize: number = 50;

  saveState(editor: TextEditor): void {
    // Remove any future history when new state is saved
    this.history = this.history.slice(0, this.currentIndex + 1);
    
    // Add new memento
    const memento = editor.createMemento();
    this.history.push(memento);
    this.currentIndex++;

    // Limit history size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
      this.currentIndex--;
    }

    console.log(`💾 Saved state: ${memento.getDescription()}`);
  }

  undo(editor: TextEditor): boolean {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      const memento = this.history[this.currentIndex];
      editor.restoreFromMemento(memento);
      console.log(`↩️ Undo: ${memento.getDescription()}`);
      return true;
    }
    console.log('❌ No more undo states available');
    return false;
  }

  redo(editor: TextEditor): boolean {
    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex++;
      const memento = this.history[this.currentIndex];
      editor.restoreFromMemento(memento);
      console.log(`↪️ Redo: ${memento.getDescription()}`);
      return true;
    }
    console.log('❌ No more redo states available');
    return false;
  }

  canUndo(): boolean {
    return this.currentIndex > 0;
  }

  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  getHistorySize(): number {
    return this.history.length;
  }

  getCurrentIndex(): number {
    return this.currentIndex;
  }

  getHistorySummary(): string[] {
    return this.history.map((memento, index) => {
      const marker = index === this.currentIndex ? ' → ' : '   ';
      return `${marker}${index}: ${memento.getDescription()}`;
    });
  }
}

// Usage
const editor = new TextEditor();
const history = new EditorHistory();

console.log('=== Text Editor with Memento Pattern ===');

// Initial state
history.saveState(editor);

// Edit operations
editor.insertText('Hello');
history.saveState(editor);

editor.insertText(' World');
history.saveState(editor);

editor.insertText('!');
history.saveState(editor);

// Select and replace
editor.selectText(6, 11); // Select "World"
console.log(`Selected: "${editor.getSelection().text}"`);
editor.replaceSelection('Universe');
history.saveState(editor);

// Delete some text
editor.deleteText(1); // Delete '!'
history.saveState(editor);

console.log('\n=== History Summary ===');
history.getHistorySummary().forEach(line => console.log(line));

console.log('\n=== Undo/Redo Operations ===');
history.undo(editor); // Restore '!'
history.undo(editor); // Restore "World"
history.redo(editor); // Back to "Universe"

console.log('\n=== Final History Summary ===');
history.getHistorySummary().forEach(line => console.log(line));
```

### Python - Game Save System
```python
from dataclasses import dataclass
from datetime import datetime
from typing import List, Optional, Dict
import json
import copy

# Game state data
@dataclass
class PlayerStats:
    level: int
    experience: int
    health: int
    mana: int
    gold: int
    
    def __str__(self):
        return f"Level {self.level}, XP: {self.experience}, HP: {self.health}, MP: {self.mana}, Gold: {self.gold}"

@dataclass
class Inventory:
    items: Dict[str, int]  # item_name -> quantity
    
    def add_item(self, item: str, quantity: int = 1):
        self.items[item] = self.items.get(item, 0) + quantity
    
    def remove_item(self, item: str, quantity: int = 1) -> bool:
        if item in self.items and self.items[item] >= quantity:
            self.items[item] -= quantity
            if self.items[item] == 0:
                del self.items[item]
            return True
        return False
    
    def __str__(self):
        if not self.items:
            return "Empty inventory"
        return ", ".join([f"{item}: {qty}" for item, qty in self.items.items()])

# Memento
class GameSaveMemento:
    def __init__(self, player_stats: PlayerStats, inventory: Inventory, 
                 location: str, timestamp: datetime = None):
        # Create deep copies to ensure immutability
        self._player_stats = copy.deepcopy(player_stats)
        self._inventory = copy.deepcopy(inventory)
        self._location = location
        self._timestamp = timestamp or datetime.now()
    
    def get_player_stats(self) -> PlayerStats:
        return copy.deepcopy(self._player_stats)
    
    def get_inventory(self) -> Inventory:
        return copy.deepcopy(self._inventory)
    
    def get_location(self) -> str:
        return self._location
    
    def get_timestamp(self) -> datetime:
        return self._timestamp
    
    def get_description(self) -> str:
        return (f"Save at {self._timestamp.strftime('%H:%M:%S')} - "
                f"Level {self._player_stats.level} at {self._location}")
    
    def to_dict(self) -> dict:
        """Serialize memento for persistent storage"""
        return {
            'player_stats': {
                'level': self._player_stats.level,
                'experience': self._player_stats.experience,
                'health': self._player_stats.health,
                'mana': self._player_stats.mana,
                'gold': self._player_stats.gold
            },
            'inventory': self._inventory.items,
            'location': self._location,
            'timestamp': self._timestamp.isoformat()
        }
    
    @classmethod
    def from_dict(cls, data: dict) -> 'GameSaveMemento':
        """Deserialize memento from storage"""
        stats_data = data['player_stats']
        player_stats = PlayerStats(
            level=stats_data['level'],
            experience=stats_data['experience'],
            health=stats_data['health'],
            mana=stats_data['mana'],
            gold=stats_data['gold']
        )
        inventory = Inventory(items=data['inventory'].copy())
        timestamp = datetime.fromisoformat(data['timestamp'])
        
        return cls(player_stats, inventory, data['location'], timestamp)

# Originator
class GameState:
    def __init__(self):
        self.player_stats = PlayerStats(level=1, experience=0, health=100, mana=50, gold=0)
        self.inventory = Inventory(items={})
        self.current_location = "Starting Village"
    
    # Game actions that modify state
    def gain_experience(self, amount: int):
        self.player_stats.experience += amount
        # Level up logic
        while self.player_stats.experience >= self.player_stats.level * 100:
            self.player_stats.experience -= self.player_stats.level * 100
            self.player_stats.level += 1
            self.player_stats.health += 20
            self.player_stats.mana += 10
            print(f"🎆 Level up! Now level {self.player_stats.level}")
    
    def take_damage(self, damage: int):
        self.player_stats.health = max(0, self.player_stats.health - damage)
        print(f"🩸 Took {damage} damage! Health: {self.player_stats.health}")
    
    def heal(self, amount: int):
        max_health = self.player_stats.level * 20 + 80
        self.player_stats.health = min(max_health, self.player_stats.health + amount)
        print(f"🍿 Healed {amount} HP! Health: {self.player_stats.health}")
    
    def gain_gold(self, amount: int):
        self.player_stats.gold += amount
        print(f"💰 Gained {amount} gold! Total: {self.player_stats.gold}")
    
    def spend_gold(self, amount: int) -> bool:
        if self.player_stats.gold >= amount:
            self.player_stats.gold -= amount
            print(f"💸 Spent {amount} gold! Remaining: {self.player_stats.gold}")
            return True
        print(f"❌ Not enough gold! Have {self.player_stats.gold}, need {amount}")
        return False
    
    def add_item(self, item: str, quantity: int = 1):
        self.inventory.add_item(item, quantity)
        print(f"🎒 Found {quantity} {item}!")
    
    def use_item(self, item: str) -> bool:
        if self.inventory.remove_item(item, 1):
            print(f"🧪 Used {item}!")
            # Item effects could be implemented here
            return True
        print(f"❌ Don't have {item}!")
        return False
    
    def travel_to(self, location: str):
        self.current_location = location
        print(f"🗺️ Traveled to {location}")
    
    # Memento operations
    def create_save(self) -> GameSaveMemento:
        return GameSaveMemento(self.player_stats, self.inventory, self.current_location)
    
    def load_save(self, memento: GameSaveMemento):
        self.player_stats = memento.get_player_stats()
        self.inventory = memento.get_inventory()
        self.current_location = memento.get_location()
        print(f"💾 Game loaded: {memento.get_description()}")
    
    def get_status(self) -> str:
        return (f"Location: {self.current_location}\n"
                f"Stats: {self.player_stats}\n"
                f"Inventory: {self.inventory}")

# Caretaker with persistent storage
class SaveGameManager:
    def __init__(self, max_saves: int = 10):
        self.saves: List[GameSaveMemento] = []
        self.max_saves = max_saves
        self.current_save_index: Optional[int] = None
    
    def quick_save(self, game: GameState) -> int:
        """Create a quick save and return its index"""
        memento = game.create_save()
        
        # Remove oldest save if at capacity
        if len(self.saves) >= self.max_saves:
            self.saves.pop(0)
            if self.current_save_index is not None:
                self.current_save_index -= 1
        
        self.saves.append(memento)
        save_index = len(self.saves) - 1
        self.current_save_index = save_index
        
        print(f"💾 Quick save created: {memento.get_description()}")
        return save_index
    
    def load_save(self, game: GameState, save_index: int) -> bool:
        """Load a specific save"""
        if 0 <= save_index < len(self.saves):
            memento = self.saves[save_index]
            game.load_save(memento)
            self.current_save_index = save_index
            return True
        print(f"❌ Invalid save index: {save_index}")
        return False
    
    def load_latest(self, game: GameState) -> bool:
        """Load the most recent save"""
        if self.saves:
            return self.load_save(game, len(self.saves) - 1)
        print("❌ No saves available")
        return False
    
    def delete_save(self, save_index: int) -> bool:
        """Delete a specific save"""
        if 0 <= save_index < len(self.saves):
            deleted_save = self.saves.pop(save_index)
            if self.current_save_index == save_index:
                self.current_save_index = None
            elif self.current_save_index is not None and self.current_save_index > save_index:
                self.current_save_index -= 1
            
            print(f"🗑️ Deleted save: {deleted_save.get_description()}")
            return True
        return False
    
    def list_saves(self) -> List[str]:
        """Get descriptions of all saves"""
        return [f"{i}: {save.get_description()}" + 
                (" (current)" if i == self.current_save_index else "")
                for i, save in enumerate(self.saves)]
    
    def save_to_file(self, filename: str):
        """Persist saves to file"""
        data = [save.to_dict() for save in self.saves]
        with open(filename, 'w') as f:
            json.dump(data, f, indent=2)
        print(f"💾 Saves exported to {filename}")
    
    def load_from_file(self, filename: str):
        """Load saves from file"""
        try:
            with open(filename, 'r') as f:
                data = json.load(f)
            self.saves = [GameSaveMemento.from_dict(save_data) for save_data in data]
            print(f"💾 Loaded {len(self.saves)} saves from {filename}")
        except FileNotFoundError:
            print(f"❌ File {filename} not found")
        except json.JSONDecodeError:
            print(f"❌ Invalid save file format")

# Usage
def demonstrate_game_save_system():
    game = GameState()
    save_manager = SaveGameManager()
    
    print("=== RPG Game Save System ===")
    print("Initial state:")
    print(game.get_status())
    
    # Play the game
    print("\n=== Playing the Game ===")
    save_manager.quick_save(game)  # Save 0: Initial state
    
    game.add_item("Sword", 1)
    game.add_item("Health Potion", 3)
    game.gain_gold(50)
    save_manager.quick_save(game)  # Save 1: After finding items
    
    game.travel_to("Dark Forest")
    game.gain_experience(150)  # Should level up
    game.take_damage(30)
    save_manager.quick_save(game)  # Save 2: After forest adventure
    
    game.travel_to("Ancient Dungeon")
    game.gain_experience(200)  # Another level up
    game.take_damage(60)
    game.use_item("Health Potion")
    game.heal(25)
    game.gain_gold(100)
    save_manager.quick_save(game)  # Save 3: After dungeon
    
    print("\n=== Current State ===")
    print(game.get_status())
    
    print("\n=== Available Saves ===")
    for save_desc in save_manager.list_saves():
        print(save_desc)
    
    print("\n=== Loading Previous Save ===")
    save_manager.load_save(game, 1)  # Go back to after finding items
    print(game.get_status())
    
    print("\n=== Continue Playing from Loaded State ===")
    game.travel_to("Peaceful Meadow")
    game.add_item("Magic Ring", 1)
    game.spend_gold(25)
    save_manager.quick_save(game)  # New save branch
    
    print("\n=== Final Save List ===")
    for save_desc in save_manager.list_saves():
        print(save_desc)
    
    # Demonstrate file persistence
    save_manager.save_to_file("game_saves.json")

demonstrate_game_save_system()
```

## Pros and Cons

### Advantages
- Preserves encapsulation boundaries
- Simplifies originator by delegating state management
- Enables undo/redo functionality
- Allows state snapshots and rollbacks
- Supports checkpointing systems

### Disadvantages
- Can be expensive if creating mementos frequently
- Can consume significant memory for large states
- May be complex if state is complex
- Can lead to memory leaks if mementos aren't managed properly

## Real-World Examples
- Text editors (undo/redo)
- Games (save/load systems)
- Database transactions
- Version control systems
- Form state management
- Image editing software
- IDE refactoring tools

## Common Use Cases
- Implementing undo/redo functionality
- Creating checkpoints in applications
- Transaction rollback mechanisms
- State persistence and restoration
- Debugging and state inspection
- A/B testing with state snapshots
- Multi-step wizards with back functionality