import { DesignPattern } from '../types';

export const designPatternsData: DesignPattern[] = [
  // Creational Patterns
  {
    id: 'singleton',
    name: 'Singleton',
    category: 'creational',
    description: 'Ensures a class has only one instance and provides global access to it',
    difficulty: 'beginner',
    lessonFile: 'lessons/creational/singleton.md',
    challenges: [
      {
        id: 'singleton-debug',
        title: '🐛 Debug the Singleton',
        description: 'Fix the broken singleton implementation that creates multiple instances',
        difficulty: 'beginner',
        type: 'debug',
        points: 100,
        starterCode: `class DatabaseConnection {
  constructor() {
    this.connection = "Database connected";
  }
  
  static getInstance() {
    return new DatabaseConnection(); // BUG: Always creates new instance
  }
  
  query(sql) {
    return \`Executing: \${sql}\`;
  }
}

// Test
const db1 = DatabaseConnection.getInstance();
const db2 = DatabaseConnection.getInstance();
console.log(db1 === db2); // Should be true, but it's false`,
        hints: [
          'The getInstance method should check if an instance already exists',
          'Store the instance in a static property',
          'Return the existing instance if it already exists'
        ]
      },
      {
        id: 'singleton-threadsafe',
        title: '🔒 Thread-Safe Challenge',
        description: 'Make the singleton thread-safe using different approaches',
        difficulty: 'intermediate',
        type: 'implement',
        points: 200,
        starterCode: `// Implement thread-safe singleton
class DatabaseConnection {
  private static instance: DatabaseConnection | null = null;
  private connection: string;

  private constructor() {
    this.connection = "Database connected";
  }
  
  // TODO: Make this method thread-safe
  static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      // What happens if two threads reach this point simultaneously?
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }
  
  query(sql: string): string {
    return \`Executing: \${sql}\`;
  }
}

// Test with simulated concurrent access
function testConcurrency() {
  const results: DatabaseConnection[] = [];
  
  // Simulate multiple threads accessing getInstance
  for (let i = 0; i < 10; i++) {
    setTimeout(() => {
      results.push(DatabaseConnection.getInstance());
      if (results.length === 10) {
        // Check if all instances are the same
        const allSame = results.every(instance => instance === results[0]);
        console.log('All instances identical:', allSame);
      }
    }, Math.random() * 100);
  }
}

testConcurrency();`,
        hints: [
          'Consider using locks or synchronization',
          'Double-check locking pattern',
          'Volatile keyword for instance variable'
        ]
      },
      {
        id: 'singleton-antipattern',
        title: '⚖️ Singleton vs Anti-pattern',
        description: 'Identify scenarios where singleton is appropriate vs problematic',
        difficulty: 'advanced',
        type: 'quiz',
        points: 150,
        starterCode: `// Review these scenarios and identify which ones are appropriate for Singleton

// Scenario 1: Database Connection Pool
class ConnectionPool {
  private static instance: ConnectionPool;
  private connections: Connection[] = [];
  
  private constructor() {
    // Initialize connection pool
  }
  
  static getInstance() {
    if (!ConnectionPool.instance) {
      ConnectionPool.instance = new ConnectionPool();
    }
    return ConnectionPool.instance;
  }
}

// Scenario 2: User Preferences
class UserPreferences {
  private static instance: UserPreferences;
  private settings: Record<string, any> = {};
  
  static getInstance() {
    if (!UserPreferences.instance) {
      UserPreferences.instance = new UserPreferences();
    }
    return UserPreferences.instance;
  }
}

// Scenario 3: Logger
class Logger {
  private static instance: Logger;
  
  static getInstance() {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }
  
  log(message: string) {
    console.log(\`[\${new Date().toISOString()}] \${message}\`);
  }
}

// Scenario 4: Shopping Cart
class ShoppingCart {
  private static instance: ShoppingCart;
  private items: Item[] = [];
  
  static getInstance() {
    if (!ShoppingCart.instance) {
      ShoppingCart.instance = new ShoppingCart();
    }
    return ShoppingCart.instance;
  }
}

// TODO: For each scenario, determine:
// 1. Is Singleton appropriate? (Yes/No)
// 2. Why or why not?
// 3. What would be a better alternative if Singleton is inappropriate?`,
      },
      {
        id: 'singleton-memory-leak',
        title: '🕵️ Memory Leak Detective',
        description: 'Find and fix memory leaks caused by improper singleton usage',
        difficulty: 'advanced',
        type: 'debug',
        points: 300,
        starterCode: `// This singleton has memory leaks - find and fix them!

class EventManager {
  private static instance: EventManager;
  private listeners: Map<string, Function[]> = new Map();
  private timers: number[] = [];
  private childObjects: any[] = [];
  
  private constructor() {
    // Initialize with some event listeners
    window.addEventListener('resize', this.handleResize.bind(this));
    window.addEventListener('beforeunload', this.handleUnload.bind(this));
    
    // Set up some timers
    this.timers.push(setInterval(() => {
      this.cleanupExpiredData();
    }, 1000) as any);
  }
  
  static getInstance(): EventManager {
    if (!EventManager.instance) {
      EventManager.instance = new EventManager();
    }
    return EventManager.instance;
  }
  
  addEventListener(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
    
    // Create child object that references parent
    const childObj = {
      parent: this,
      callback: callback,
      event: event
    };
    this.childObjects.push(childObj);
  }
  
  removeEventListener(event: string, callback: Function) {
    // BUG: This doesn't properly remove listeners!
    if (this.listeners.has(event)) {
      const listeners = this.listeners.get(event)!;
      // This creates a new array but doesn't update the map
      listeners.filter(listener => listener !== callback);
    }
  }
  
  private handleResize() {
    console.log('Window resized');
  }
  
  private handleUnload() {
    console.log('Window unloading');
    // BUG: Not cleaning up properly on unload
  }
  
  private cleanupExpiredData() {
    // This runs every second but never actually cleans up
    console.log('Cleanup check');
  }
  
  // Missing proper cleanup method
}

// Usage that creates memory leaks
const manager = EventManager.getInstance();
for (let i = 0; i < 100; i++) {
  manager.addEventListener('test', () => console.log(\`Handler \${i}\`));
}

// TODO: 
// 1. Find all the memory leaks in this code
// 2. Fix the removeEventListener method
// 3. Add proper cleanup for timers and event listeners
// 4. Break circular references between parent and child objects
// 5. Implement a proper destroy/cleanup method`,
        hints: [
          'Check for circular references',
          'Look for event listeners not being removed',
          'Consider cleanup methods'
        ]
      }
    ]
  },
  {
    id: 'factory-method',
    name: 'Factory Method',
    category: 'creational',
    description: 'Creates objects without specifying their exact classes',
    difficulty: 'intermediate',
    lessonFile: 'lessons/creational/factory-method.md',
    challenges: [
      {
        id: 'factory-builder',
        title: '🏭 Factory Builder',
        description: 'Create factory classes for different vehicle types (car, truck, motorcycle)',
        difficulty: 'intermediate',
        type: 'implement',
        points: 200,
        starterCode: `// Create a vehicle factory system
interface Vehicle {
  start(): string;
  stop(): string;
}

// TODO: Implement Car, Truck, and Motorcycle classes
// TODO: Implement VehicleFactory abstract class
// TODO: Implement CarFactory, TruckFactory and MotorcycleFactory

// Usage should work like this:
// const carFactory = new CarFactory();
// const car = carFactory.createVehicle();
// console.log(car.start()); // "Car engine started"`
      },
      {
        id: 'factory-chain',
        title: '🔗 Factory Chain',
        description: 'Build factory hierarchy for creating different document types',
        difficulty: 'intermediate',
        type: 'implement',
        points: 250,
        starterCode: `// Implement factory chain for document creation

interface Document {
  render(): string;
  export(): string;
  getType(): string;
}

// TODO: Implement concrete document classes
class PDFDocument implements Document {
  render(): string {
    // TODO: Implement PDF rendering
    return '';
  }
  
  export(): string {
    // TODO: Implement PDF export
    return '';
  }
  
  getType(): string {
    return 'PDF';
  }
}

class WordDocument implements Document {
  render(): string {
    // TODO: Implement Word rendering
    return '';
  }
  
  export(): string {
    // TODO: Implement Word export
    return '';
  }
  
  getType(): string {
    return 'Word';
  }
}

class ExcelDocument implements Document {
  render(): string {
    // TODO: Implement Excel rendering
    return '';
  }
  
  export(): string {
    // TODO: Implement Excel export
    return '';
  }
  
  getType(): string {
    return 'Excel';
  }
}

// TODO: Create abstract DocumentFactory
abstract class DocumentFactory {
  abstract createDocument(): Document;
  
  // Template method that uses the factory
  processDocument(): string {
    const doc = this.createDocument();
    const rendered = doc.render();
    const exported = doc.export();
    return \`Processed \${doc.getType()}: \${rendered}, \${exported}\`;
  }
}

// TODO: Implement concrete factories
class PDFFactory extends DocumentFactory {
  createDocument(): Document {
    // TODO: Implement
    return new PDFDocument();
  }
}

class WordFactory extends DocumentFactory {
  createDocument(): Document {
    // TODO: Implement
    return new WordDocument();
  }
}

class ExcelFactory extends DocumentFactory {
  createDocument(): Document {
    // TODO: Implement
    return new ExcelDocument();
  }
}

// TODO: Create factory chain
class DocumentFactoryChain {
  private factories: Map<string, DocumentFactory> = new Map();
  
  registerFactory(type: string, factory: DocumentFactory) {
    // TODO: Implement factory registration
  }
  
  createDocument(type: string): Document | null {
    // TODO: Implement document creation through chain
    return null;
  }
}

// Usage
const factoryChain = new DocumentFactoryChain();
// TODO: Register factories and test the chain`,
        hints: [
          'Create Document interface with render method',
          'Implement PDF, Word, and Excel document classes',
          'Chain factories for different document formats'
        ]
      },
      {
        id: 'plugin-factory',
        title: '🧩 Plugin Factory',
        description: 'Design plugin system using factory pattern for different file formats',
        difficulty: 'advanced',
        type: 'implement',
        points: 300,
        starterCode: `// Design a plugin system using factory pattern

interface FileProcessor {
  process(data: string): string;
  getFormat(): string;
  isSupported(filename: string): boolean;
}

// TODO: Implement concrete processors
class JSONProcessor implements FileProcessor {
  process(data: string): string {
    // TODO: Implement JSON processing
    return "";
  }
  
  getFormat(): string {
    return "JSON";
  }
  
  isSupported(filename: string): boolean {
    return filename.endsWith('.json');
  }
}

class XMLProcessor implements FileProcessor {
  process(data: string): string {
    // TODO: Implement XML processing
    return "";
  }
  
  getFormat(): string {
    return "XML";
  }
  
  isSupported(filename: string): boolean {
    return filename.endsWith('.xml');
  }
}

class CSVProcessor implements FileProcessor {
  process(data: string): string {
    // TODO: Implement CSV processing
    return "";
  }
  
  getFormat(): string {
    return "CSV";
  }
  
  isSupported(filename: string): boolean {
    return filename.endsWith('.csv');
  }
}

// TODO: Create plugin factory
class PluginFactory {
  private plugins: FileProcessor[] = [];
  
  registerPlugin(plugin: FileProcessor) {
    // TODO: Implement plugin registration
  }
  
  createProcessor(filename: string): FileProcessor | null {
    // TODO: Find and return appropriate processor
    return null;
  }
  
  getSupportedFormats(): string[] {
    // TODO: Return list of supported formats
    return [];
  }
  
  processFile(filename: string, data: string): string {
    // TODO: Process file using appropriate plugin
    return "";
  }
}

// TODO: Create plugin manager
class PluginManager {
  private factory: PluginFactory = new PluginFactory();
  
  loadPlugins() {
    // TODO: Load and register all plugins
  }
  
  processMultipleFiles(files: {name: string, data: string}[]) {
    // TODO: Process multiple files using appropriate plugins
  }
}

// Usage
const manager = new PluginManager();
manager.loadPlugins();

// Test with different file types
const testFiles = [
  { name: "data.json", data: '{"key": "value"}' },
  { name: "config.xml", data: '<config><item>value</item></config>' },
  { name: "report.csv", data: 'name,age\nJohn,25' }
];

// TODO: Process all files`,
        hints: [
          'Support dynamic plugin registration',
          'Handle unknown file formats gracefully',
          'Allow multiple plugins for same format'
        ]
      },
      {
        id: 'factory-refactoring',
        title: '♻️ Factory Refactoring',
        description: 'Convert hard-coded object creation code to use factory pattern',
        difficulty: 'intermediate',
        type: 'refactor',
        points: 220,
        starterCode: `// Refactor this code to use factory pattern
class GameEngine {
  createCharacter(type: string) {
    if (type === 'warrior') {
      return new Warrior('Strong', 100, 'Sword');
    } else if (type === 'mage') {
      return new Mage('Wise', 80, 'Staff');
    } else if (type === 'archer') {
      return new Archer('Swift', 90, 'Bow');
    }
    throw new Error('Unknown character type');
  }
}`
      }
    ]
  },
  {
    id: 'abstract-factory',
    name: 'Abstract Factory',
    category: 'creational',
    description: 'Creates families of related objects without specifying their concrete classes',
    difficulty: 'advanced',
    lessonFile: 'lessons/creational/abstract-factory.md',
    challenges: [
      {
        id: 'ui-theme-factory',
        title: '🎨 UI Theme Factory',
        description: 'Create factories for different UI themes (Material, iOS, Windows)',
        difficulty: 'advanced',
        type: 'implement',
        points: 350,
        starterCode: `// UI Theme Factory - Abstract Factory Pattern

// Abstract product interfaces
interface Button {
  click(): void;
  render(): string;
  getStyle(): string;
}

interface TextField {
  focus(): void;
  setValue(value: string): void;
  getValue(): string;
  render(): string;
  getStyle(): string;
}

interface Dialog {
  show(): void;
  hide(): void;
  setTitle(title: string): void;
  render(): string;
  getStyle(): string;
}

// Abstract factory interface
abstract class UIFactory {
  abstract createButton(): Button;
  abstract createTextField(): TextField;
  abstract createDialog(): Dialog;
  abstract getThemeName(): string;
}

// Concrete products for Material theme
class MaterialButton implements Button {
  click(): void {
    console.log('Material button clicked with ripple effect');
  }
  
  render(): string {
    return '<button class="material-button">Click Me</button>';
  }
  
  getStyle(): string {
    return 'material-button: { background: #2196F3, border-radius: 4px, box-shadow: 0 2px 4px rgba(0,0,0,0.3) }';
  }
}

class MaterialTextField implements TextField {
  private value: string = '';
  
  focus(): void {
    console.log('Material text field focused with floating label animation');
  }
  
  setValue(value: string): void {
    this.value = value;
  }
  
  getValue(): string {
    return this.value;
  }
  
  render(): string {
    return '<input class="material-textfield" type="text" />';
  }
  
  getStyle(): string {
    return 'material-textfield: { border-bottom: 2px solid #2196F3, background: transparent }';
  }
}

class MaterialDialog implements Dialog {
  private title: string = '';
  private visible: boolean = false;
  
  show(): void {
    this.visible = true;
    console.log('Material dialog shown with slide-up animation');
  }
  
  hide(): void {
    this.visible = false;
    console.log('Material dialog hidden');
  }
  
  setTitle(title: string): void {
    this.title = title;
  }
  
  render(): string {
    return \`<dialog class="material-dialog"><h3>\${this.title}</h3></dialog>\`;
  }
  
  getStyle(): string {
    return 'material-dialog: { background: white, border-radius: 8px, box-shadow: 0 8px 16px rgba(0,0,0,0.3) }';
  }
}

// TODO: Implement iOS theme components
class IOSButton implements Button {
  click(): void {
    // TODO: Implement iOS-style button click
    console.log('iOS button clicked');
  }
  
  render(): string {
    // TODO: Return iOS-style button HTML
    return '<button class="ios-button">Click Me</button>';
  }
  
  getStyle(): string {
    // TODO: Return iOS-style button CSS
    return 'ios-button: { background: #007AFF, border-radius: 8px }';
  }
}

class IOSTextField implements TextField {
  private value: string = '';
  
  focus(): void {
    // TODO: Implement iOS-style focus behavior
  }
  
  setValue(value: string): void {
    this.value = value;
  }
  
  getValue(): string {
    return this.value;
  }
  
  render(): string {
    // TODO: Return iOS-style text field HTML
    return '';
  }
  
  getStyle(): string {
    // TODO: Return iOS-style text field CSS
    return '';
  }
}

class IOSDialog implements Dialog {
  private title: string = '';
  private visible: boolean = false;
  
  show(): void {
    // TODO: Implement iOS-style dialog show
  }
  
  hide(): void {
    // TODO: Implement iOS-style dialog hide
  }
  
  setTitle(title: string): void {
    this.title = title;
  }
  
  render(): string {
    // TODO: Return iOS-style dialog HTML
    return '';
  }
  
  getStyle(): string {
    // TODO: Return iOS-style dialog CSS
    return '';
  }
}

// TODO: Implement Windows theme components
// (Similar structure to iOS components)

// Concrete factories
class MaterialUIFactory extends UIFactory {
  createButton(): Button {
    return new MaterialButton();
  }
  
  createTextField(): TextField {
    return new MaterialTextField();
  }
  
  createDialog(): Dialog {
    return new MaterialDialog();
  }
  
  getThemeName(): string {
    return 'Material Design';
  }
}

class IOSUIFactory extends UIFactory {
  createButton(): Button {
    return new IOSButton();
  }
  
  createTextField(): TextField {
    return new IOSTextField();
  }
  
  createDialog(): Dialog {
    return new IOSDialog();
  }
  
  getThemeName(): string {
    return 'iOS';
  }
}

// TODO: Implement WindowsUIFactory

// Client code that uses the factory
class Application {
  private factory: UIFactory;
  private button: Button;
  private textField: TextField;
  private dialog: Dialog;
  
  constructor(factory: UIFactory) {
    this.factory = factory;
    this.button = factory.createButton();
    this.textField = factory.createTextField();
    this.dialog = factory.createDialog();
  }
  
  createUI(): string {
    let ui = \`<div class="app-\${this.factory.getThemeName().toLowerCase()}">\`;
    ui += this.button.render();
    ui += this.textField.render();
    ui += this.dialog.render();
    ui += '</div>';
    return ui;
  }
  
  showStyles(): void {
    console.log(\`--- \${this.factory.getThemeName()} Styles ---\`);
    console.log(this.button.getStyle());
    console.log(this.textField.getStyle());
    console.log(this.dialog.getStyle());
  }
  
  interactWithUI(): void {
    this.button.click();
    this.textField.focus();
    this.textField.setValue('Hello World');
    this.dialog.setTitle('Welcome');
    this.dialog.show();
  }
}

// Usage
console.log('=== UI Theme Factory Demo ===');

// Create Material Design app
const materialFactory = new MaterialUIFactory();
const materialApp = new Application(materialFactory);
materialApp.showStyles();
materialApp.interactWithUI();
console.log('Material UI:', materialApp.createUI());

// Create iOS app
const iosFactory = new IOSUIFactory();
const iosApp = new Application(iosFactory);
iosApp.showStyles();
iosApp.interactWithUI();
console.log('iOS UI:', iosApp.createUI());

// TODO: Test with Windows factory when implemented`,
        hints: [
          'Define abstract factory for UI components',
          'Create concrete factories for each theme',
          'Ensure components from same theme work together'
        ]
      },
      {
        id: 'cross-platform-factory',
        title: '💻 Cross-Platform Factory',
        description: 'Build factories for OS-specific components (buttons, dialogs)',
        difficulty: 'advanced',
        type: 'implement',
        points: 400,
        hints: [
          'Abstract factory creates related UI components',
          'Platform-specific implementations',
          'Client code doesn\'t know concrete classes'
        ]
      },
      {
        id: 'factory-family',
        title: '👥 Factory Family',
        description: 'Design related product families (furniture sets, car parts)',
        difficulty: 'intermediate',
        type: 'implement',
        points: 300,
        hints: [
          'Products must be compatible within a family',
          'Each factory creates a complete set',
          'Easy to switch between families'
        ]
      },
      {
        id: 'factory-evolution',
        title: '📈 Factory Evolution',
        description: 'Migrate from simple factory to abstract factory step-by-step',
        difficulty: 'advanced',
        type: 'refactor',
        points: 450,
        starterCode: `// Evolve this simple factory into abstract factory
class VehicleFactory {
  static createVehicle(type: string, brand: string) {
    if (type === 'car' && brand === 'toyota') return new ToyotaCar();
    if (type === 'car' && brand === 'bmw') return new BMWCar();
    if (type === 'truck' && brand === 'toyota') return new ToyotaTruck();
    if (type === 'truck' && brand === 'bmw') return new BMWTruck();
    throw new Error('Unknown combination');
  }
}`
      }
    ]
  },
  {
    id: 'builder',
    name: 'Builder',
    category: 'creational',
    description: 'Constructs complex objects step by step',
    difficulty: 'intermediate',
    lessonFile: 'lessons/creational/builder.md',
    challenges: [
      {
        id: 'builder-house',
        title: '🏗️ House Builder',
        description: 'Build different house types using builder pattern',
        difficulty: 'intermediate',
        type: 'implement',
        points: 250,
        starterCode: `// Implement house builder pattern

class House {
  public foundation: string = '';
  public walls: string = '';
  public roof: string = '';
  public windows: number = 0;
  public doors: number = 0;
  public garage: boolean = false;
  public garden: boolean = false;
  public style: string = '';
  public color: string = '';
  
  describe(): string {
    return \`A \${this.style} house with \${this.walls} walls, \${this.roof} roof, \${this.windows} windows, and \${this.doors} doors.\`;
  }
}

// TODO: Implement HouseBuilder with method chaining
class HouseBuilder {
  private house: House;
  
  constructor() {
    this.house = new House();
  }
  
  setFoundation(foundation: string): HouseBuilder {
    // TODO: Implement
    return this;
  }
  
  setWalls(walls: string): HouseBuilder {
    // TODO: Implement
    return this;
  }
  
  setRoof(roof: string): HouseBuilder {
    // TODO: Implement
    return this;
  }
  
  setWindows(count: number): HouseBuilder {
    // TODO: Implement
    return this;
  }
  
  setDoors(count: number): HouseBuilder {
    // TODO: Implement
    return this;
  }
  
  addGarage(): HouseBuilder {
    // TODO: Implement
    return this;
  }
  
  addGarden(): HouseBuilder {
    // TODO: Implement
    return this;
  }
  
  setStyle(style: string): HouseBuilder {
    // TODO: Implement
    return this;
  }
  
  setColor(color: string): HouseBuilder {
    // TODO: Implement
    return this;
  }
  
  build(): House {
    // TODO: Return completed house and reset builder
    return this.house;
  }
  
  reset(): void {
    // TODO: Reset builder for new house
  }
}

// TODO: Create specialized builders for different house types
class ModernHouseBuilder extends HouseBuilder {
  constructor() {
    super();
    // TODO: Set default modern house properties
  }
}

class TraditionalHouseBuilder extends HouseBuilder {
  constructor() {
    super();
    // TODO: Set default traditional house properties
  }
}

// TODO: Create Director to orchestrate building process
class HouseDirector {
  buildModernHouse(builder: HouseBuilder): House {
    // TODO: Build a modern house using the builder
    return builder.build();
  }
  
  buildTraditionalHouse(builder: HouseBuilder): House {
    // TODO: Build a traditional house using the builder
    return builder.build();
  }
}

// Usage
const director = new HouseDirector();
const modernBuilder = new ModernHouseBuilder();
const traditionalBuilder = new TraditionalHouseBuilder();

const modernHouse = director.buildModernHouse(modernBuilder);
const traditionalHouse = director.buildTraditionalHouse(traditionalBuilder);

console.log(modernHouse.describe());
console.log(traditionalHouse.describe());`,
        hints: [
          'Create House class with multiple properties',
          'Implement HouseBuilder with method chaining',
          'Support different house styles (modern, traditional)'
        ]
      },
      {
        id: 'meal-builder',
        title: '🍔 Meal Builder',
        description: 'Create complex meal combinations with optional ingredients',
        difficulty: 'beginner',
        type: 'implement',
        points: 200,
        starterCode: `// Build meals with optional components

class Meal {
  public mainDish?: string;
  public side?: string;
  public drink?: string;
  public dessert?: string;
  public price: number = 0;
  public calories: number = 0;
  
  describe(): string {
    const components = [];
    if (this.mainDish) components.push(this.mainDish);
    if (this.side) components.push(this.side);
    if (this.drink) components.push(this.drink);
    if (this.dessert) components.push(this.dessert);
    
    return \`Meal: \${components.join(', ')} - $\${this.price} (\${this.calories} cal)\`;
  }
}

// TODO: Implement meal builder
class MealBuilder {
  private meal: Meal;
  
  constructor() {
    this.meal = new Meal();
  }
  
  addMainDish(dish: string, price: number = 0, calories: number = 0): MealBuilder {
    // TODO: Implement
    return this;
  }
  
  addSide(side: string, price: number = 0, calories: number = 0): MealBuilder {
    // TODO: Implement
    return this;
  }
  
  addDrink(drink: string, price: number = 0, calories: number = 0): MealBuilder {
    // TODO: Implement
    return this;
  }
  
  addDessert(dessert: string, price: number = 0, calories: number = 0): MealBuilder {
    // TODO: Implement
    return this;
  }
  
  build(): Meal {
    // TODO: Validate meal and return completed meal
    return this.meal;
  }
  
  private validate(): boolean {
    // TODO: Validate meal combinations (e.g., must have main dish)
    return true;
  }
  
  reset(): void {
    this.meal = new Meal();
  }
}

// TODO: Create preset meal builders
class KidsHappyMealBuilder extends MealBuilder {
  buildDefaultMeal(): Meal {
    // TODO: Build a typical kids meal
    return this.build();
  }
}

class HealthyMealBuilder extends MealBuilder {
  buildDefaultMeal(): Meal {
    // TODO: Build a healthy meal option
    return this.build();
  }
}

// Usage examples
const builder = new MealBuilder();
const customMeal = builder
  .addMainDish('Burger', 8.99, 650)
  .addSide('Fries', 3.99, 320)
  .addDrink('Cola', 2.99, 150)
  .addDessert('Ice Cream', 4.99, 280)
  .build();

const kidsBuilder = new KidsHappyMealBuilder();
const kidsMeal = kidsBuilder.buildDefaultMeal();

const healthyBuilder = new HealthyMealBuilder();
const healthyMeal = healthyBuilder.buildDefaultMeal();

console.log(customMeal.describe());
console.log(kidsMeal.describe());
console.log(healthyMeal.describe());`,
        hints: [
          'Meal has main dish, sides, drink, dessert',
          'All components are optional',
          'Builder should validate combinations'
        ]
      },
      {
        id: 'car-configurator',
        title: '🚗 Car Configurator',
        description: 'Build cars with different options and configurations',
        difficulty: 'intermediate',
        type: 'implement',
        points: 300,
        starterCode: `// Car configurator with options and pricing

class Car {
  public engine: string = '';
  public transmission: string = '';
  public wheels: string = '';
  public color: string = '';
  public interior: string = '';
  public features: string[] = [];
  public basePrice: number = 25000;
  
  getTotalPrice(): number {
    // TODO: Calculate total price including all options
    return this.basePrice;
  }
  
  getSpecifications(): string {
    return \`\${this.color} car with \${this.engine} engine, \${this.transmission} transmission\`;
  }
}

class CarBuilder {
  private car: Car;
  
  constructor() {
    this.car = new Car();
  }
  
  setEngine(engine: 'V4' | 'V6' | 'V8' | 'Electric'): CarBuilder {
    // TODO: Set engine and update price
    return this;
  }
  
  setTransmission(transmission: 'Manual' | 'Automatic' | 'CVT'): CarBuilder {
    // TODO: Set transmission and update price
    return this;
  }
  
  setWheels(wheels: '16inch' | '18inch' | '20inch' | 'Sport'): CarBuilder {
    // TODO: Set wheels and update price
    return this;
  }
  
  setColor(color: string): CarBuilder {
    // TODO: Set color (premium colors cost extra)
    return this;
  }
  
  setInterior(interior: 'Cloth' | 'Leather' | 'Premium'): CarBuilder {
    // TODO: Set interior and update price
    return this;
  }
  
  addFeature(feature: string, price: number): CarBuilder {
    // TODO: Add feature and update price
    return this;
  }
  
  build(): Car {
    // TODO: Validate configuration and return car
    return this.car;
  }
  
  private validateConfiguration(): boolean {
    // TODO: Validate that all required options are set
    // and that combinations are valid
    return true;
  }
  
  reset(): void {
    this.car = new Car();
  }
}

// Usage
const builder = new CarBuilder();
const sportsCar = builder
  .setEngine('V8')
  .setTransmission('Manual')
  .setWheels('Sport')
  .setColor('Red')
  .setInterior('Leather')
  .addFeature('Sunroof', 1500)
  .addFeature('Navigation', 800)
  .build();

console.log(sportsCar.getSpecifications());
console.log('Price:', sportsCar.getTotalPrice());`,
        hints: [
          'Car has engine, transmission, wheels, color, etc.',
          'Some options depend on others',
          'Generate final price based on options'
        ]
      },
      {
        id: 'query-builder',
        title: '📱 Query Builder',
        description: 'Create SQL query builder with method chaining',
        difficulty: 'advanced',
        type: 'implement',
        points: 400,
        hints: [
          'Support SELECT, WHERE, JOIN, ORDER BY',
          'Method chaining for fluent interface',
          'Generate valid SQL strings'
        ]
      }
    ]
  },
  {
    id: 'prototype',
    name: 'Prototype',
    category: 'creational',
    description: 'Creates objects by cloning existing instances',
    difficulty: 'intermediate',
    lessonFile: 'lessons/creational/prototype.md',
    challenges: [
      {
        id: 'clone-lab',
        title: '🧬 Clone Lab',
        description: 'Clone objects with different cloning strategies (shallow vs deep)',
        difficulty: 'intermediate',
        type: 'implement',
        points: 280,
        hints: [
          'Implement both shallow and deep cloning',
          'Handle circular references in deep clone',
          'Compare memory usage of both approaches'
        ]
      },
      {
        id: 'game-object-cloner',
        title: '🎮 Game Object Cloner',
        description: 'Clone game enemies with different attributes',
        difficulty: 'intermediate',
        type: 'implement',
        points: 250,
        hints: [
          'Each enemy has health, damage, abilities',
          'Clone and modify attributes for variants',
          'Support cloning of nested objects'
        ]
      },
      {
        id: 'document-template',
        title: '📄 Document Template',
        description: 'Create document templates that can be cloned and modified',
        difficulty: 'beginner',
        type: 'implement',
        points: 200,
        hints: [
          'Document has title, content, formatting',
          'Templates serve as prototypes',
          'Clone and customize for specific needs'
        ]
      },
      {
        id: 'clone-comparison',
        title: '🔍 Clone Comparison',
        description: 'Compare cloning vs constructor performance',
        difficulty: 'advanced',
        type: 'implement',
        points: 350,
        hints: [
          'Measure creation time for both approaches',
          'Test with different object complexities',
          'Consider memory usage implications'
        ]
      }
    ]
  },
  
  // Structural Patterns
  {
    id: 'adapter',
    name: 'Adapter',
    category: 'structural',
    description: 'Allows incompatible interfaces to work together',
    difficulty: 'intermediate',
    lessonFile: 'lessons/structural/adapter.md',
    challenges: [
      {
        id: 'adapter-api',
        title: '🔌 API Integration',
        description: 'Adapt different payment APIs to common interface',
        difficulty: 'intermediate',
        type: 'implement',
        points: 250,
        starterCode: `// Adapt different payment APIs to common interface

// Common payment interface
interface PaymentProcessor {
  processPayment(amount: number, currency: string): PaymentResult;
  refundPayment(transactionId: string): RefundResult;
  getTransactionStatus(transactionId: string): TransactionStatus;
}

interface PaymentResult {
  success: boolean;
  transactionId: string;
  message: string;
}

interface RefundResult {
  success: boolean;
  refundId: string;
  message: string;
}

type TransactionStatus = 'pending' | 'completed' | 'failed' | 'refunded';

// Legacy PayPal API (different interface)
class PayPalAPI {
  makePayment(value: number, curr: string): { id: string, status: string, error?: string } {
    // Simulate PayPal API call
    const success = Math.random() > 0.1;
    return {
      id: 'PP_' + Math.random().toString(36).substr(2, 9),
      status: success ? 'success' : 'failure',
      error: success ? undefined : 'Payment declined'
    };
  }
  
  initiateRefund(paymentId: string): { refund_id: string, state: string } {
    return {
      refund_id: 'RF_' + Math.random().toString(36).substr(2, 9),
      state: 'completed'
    };
  }
  
  getPaymentDetails(id: string): { payment_state: string } {
    return { payment_state: 'approved' };
  }
}

// Stripe API (different interface)
class StripeAPI {
  charges = {
    create: (params: { amount: number, currency: string }) => {
      const success = Math.random() > 0.05;
      return {
        id: 'ch_' + Math.random().toString(36).substr(2, 15),
        paid: success,
        failure_message: success ? null : 'Card declined'
      };
    }
  };
  
  refunds = {
    create: (params: { charge: string }) => {
      return {
        id: 're_' + Math.random().toString(36).substr(2, 15),
        status: 'succeeded'
      };
    }
  };
  
  charges_retrieve = (chargeId: string) => {
    return { status: 'succeeded' };
  };
}

// Square API (different interface)
class SquareAPI {
  payments = {
    create: (body: { amount_money: { amount: number, currency: string } }) => {
      const success = Math.random() > 0.08;
      return {
        payment: {
          id: 'sq_' + Math.random().toString(36).substr(2, 12),
          status: success ? 'COMPLETED' : 'FAILED',
          receipt_url: success ? 'http://receipt.url' : null
        },
        errors: success ? [] : [{ detail: 'Insufficient funds' }]
      };
    }
  };
  
  refunds = {
    create: (body: { payment_id: string }) => {
      return {
        refund: {
          id: 'ref_' + Math.random().toString(36).substr(2, 12),
          status: 'COMPLETED'
        }
      };
    }
  };
}

// TODO: Implement adapter for PayPal
class PayPalAdapter implements PaymentProcessor {
  constructor(private paypalApi: PayPalAPI) {}
  
  processPayment(amount: number, currency: string): PaymentResult {
    // TODO: Adapt PayPal API to common interface
    return { success: false, transactionId: '', message: '' };
  }
  
  refundPayment(transactionId: string): RefundResult {
    // TODO: Implement refund using PayPal API
    return { success: false, refundId: '', message: '' };
  }
  
  getTransactionStatus(transactionId: string): TransactionStatus {
    // TODO: Get status using PayPal API
    return 'pending';
  }
}

// TODO: Implement adapter for Stripe
class StripeAdapter implements PaymentProcessor {
  constructor(private stripeApi: StripeAPI) {}
  
  processPayment(amount: number, currency: string): PaymentResult {
    // TODO: Adapt Stripe API to common interface
    return { success: false, transactionId: '', message: '' };
  }
  
  refundPayment(transactionId: string): RefundResult {
    // TODO: Implement refund using Stripe API
    return { success: false, refundId: '', message: '' };
  }
  
  getTransactionStatus(transactionId: string): TransactionStatus {
    // TODO: Get status using Stripe API
    return 'pending';
  }
}

// TODO: Implement adapter for Square
class SquareAdapter implements PaymentProcessor {
  constructor(private squareApi: SquareAPI) {}
  
  processPayment(amount: number, currency: string): PaymentResult {
    // TODO: Adapt Square API to common interface
    return { success: false, transactionId: '', message: '' };
  }
  
  refundPayment(transactionId: string): RefundResult {
    // TODO: Implement refund using Square API
    return { success: false, refundId: '', message: '' };
  }
  
  getTransactionStatus(transactionId: string): TransactionStatus {
    // TODO: Get status using Square API
    return 'pending';
  }
}

// Client code that uses the adapters
class PaymentService {
  constructor(private processor: PaymentProcessor) {}
  
  processPayment(amount: number, currency: string): PaymentResult {
    return this.processor.processPayment(amount, currency);
  }
}

// Usage
const paypalService = new PaymentService(new PayPalAdapter(new PayPalAPI()));
const stripeService = new PaymentService(new StripeAdapter(new StripeAPI()));
const squareService = new PaymentService(new SquareAdapter(new SquareAPI()));

// All services use the same interface
console.log(paypalService.processPayment(100, 'USD'));
console.log(stripeService.processPayment(100, 'USD'));
console.log(squareService.processPayment(100, 'USD'));`,
        hints: [
          'Define common payment interface',
          'Create adapters for PayPal, Stripe, Square',
          'Hide API differences from client code'
        ]
      },
      {
        id: 'legacy-system-rescue',
        title: '🏛️ Legacy System Rescue',
        description: 'Create adapters for old systems to work with new code',
        difficulty: 'advanced',
        type: 'implement',
        points: 350,
        hints: [
          'Old system has different method signatures',
          'New system expects modern interface',
          'Preserve existing functionality'
        ]
      },
      {
        id: 'data-format-converter',
        title: '🔄 Data Format Converter',
        description: 'Build adapters for XML, JSON, CSV data formats',
        difficulty: 'intermediate',
        type: 'implement',
        points: 300,
        hints: [
          'Common data interface for all formats',
          'Format-specific parsing logic',
          'Bidirectional conversion support'
        ]
      },
      {
        id: 'two-way-adapter',
        title: '↔️ Two-Way Adapter',
        description: 'Implement bidirectional adapters for currency conversion',
        difficulty: 'advanced',
        type: 'implement',
        points: 400,
        hints: [
          'Adapter works in both directions',
          'Handle conversion rates and fees',
          'Support multiple currency pairs'
        ]
      }
    ]
  },
  {
    id: 'bridge',
    name: 'Bridge',
    category: 'structural',
    description: 'Separates abstraction from implementation so both can vary independently',
    difficulty: 'advanced',
    lessonFile: 'lessons/structural/bridge.md',
    challenges: [
      {
        id: 'device-driver-bridge',
        title: '🖥️ Device Driver Bridge',
        description: 'Separate device abstraction from OS-specific implementation',
        difficulty: 'advanced',
        type: 'implement',
        points: 400,
        hints: [
          'Abstract device interface',
          'OS-specific implementations (Windows, Linux, Mac)',
          'Client uses device without knowing OS details'
        ]
      },
      {
        id: 'graphics-bridge',
        title: '🎨 Graphics Bridge',
        description: 'Separate drawing API from rendering implementations',
        difficulty: 'advanced',
        type: 'implement',
        points: 380,
        hints: [
          'Drawing abstraction with shapes and operations',
          'Different renderers (Canvas, SVG, WebGL)',
          'Switch renderers without changing drawing code'
        ]
      },
      {
        id: 'ui-bridge',
        title: '📱 UI Bridge',
        description: 'Separate UI components from platform-specific rendering',
        difficulty: 'intermediate',
        type: 'implement',
        points: 350,
        hints: [
          'UI components (Button, TextField, Dialog)',
          'Platform implementations (Web, Mobile, Desktop)',
          'Same component renders differently per platform'
        ]
      },
      {
        id: 'bridge-builder',
        title: '🌉 Bridge Builder',
        description: 'Create bridge hierarchies for complex notification systems',
        difficulty: 'advanced',
        type: 'implement',
        points: 420,
        hints: [
          'Multiple notification types (Email, SMS, Push)',
          'Different delivery services per type',
          'Mix and match notifications with services'
        ]
      }
    ]
  },
  {
    id: 'composite',
    name: 'Composite',
    category: 'structural',
    description: 'Composes objects into tree structures to represent part-whole hierarchies',
    difficulty: 'intermediate',
    lessonFile: 'lessons/structural/composite.md',
    challenges: [
      {
        id: 'file-system-explorer',
        title: '📁 File System Explorer',
        description: 'Build file/folder hierarchies with operations',
        difficulty: 'intermediate',
        type: 'implement',
        points: 300,
        hints: [
          'Files and folders implement same interface',
          'Folders contain files and other folders',
          'Operations work on both files and folders'
        ]
      },
      {
        id: 'graphics-editor',
        title: '🎨 Graphics Editor',
        description: 'Create drawing app with composite shapes (groups, primitives)',
        difficulty: 'intermediate',
        type: 'implement',
        points: 350,
        hints: [
          'Primitive shapes (Circle, Rectangle, Line)',
          'Group shapes can contain other shapes',
          'Operations (move, resize, rotate) work on all'
        ]
      },
      {
        id: 'organization-chart',
        title: '🏢 Organization Chart',
        description: 'Build company hierarchy with composite employees/departments',
        difficulty: 'beginner',
        type: 'implement',
        points: 250,
        hints: [
          'Employees and departments have common interface',
          'Departments contain employees and sub-departments',
          'Calculate total salary for any level'
        ]
      },
      {
        id: 'menu-system',
        title: '🍽️ Menu System',
        description: 'Create nested menu systems for restaurants',
        difficulty: 'beginner',
        type: 'implement',
        points: 200,
        hints: [
          'Menu items and sub-menus both are menu components',
          'Sub-menus can contain items and other sub-menus',
          'Print entire menu or just sections'
        ]
      }
    ]
  },
  {
    id: 'decorator',
    name: 'Decorator',
    category: 'structural',
    description: 'Adds behavior to objects dynamically without altering structure',
    difficulty: 'intermediate',
    lessonFile: 'lessons/structural/decorator.md',
    challenges: [
      {
        id: 'decorator-coffee',
        title: '☕ Coffee Shop',
        description: 'Add toppings and extras to coffee orders dynamically',
        difficulty: 'intermediate',
        type: 'implement',
        points: 280,
        starterCode: `// Coffee shop with decorator pattern for toppings

// Base component interface
interface Coffee {
  getCost(): number;
  getDescription(): string;
}

// Concrete component - basic coffee types
class SimpleCoffee implements Coffee {
  getCost(): number {
    return 2.00;
  }
  
  getDescription(): string {
    return 'Simple coffee';
  }
}

class Espresso implements Coffee {
  getCost(): number {
    return 1.99;
  }
  
  getDescription(): string {
    return 'Espresso';
  }
}

class HouseBlend implements Coffee {
  getCost(): number {
    return 0.89;
  }
  
  getDescription(): string {
    return 'House Blend Coffee';
  }
}

// Base decorator class
abstract class CoffeeDecorator implements Coffee {
  protected coffee: Coffee;
  
  constructor(coffee: Coffee) {
    this.coffee = coffee;
  }
  
  getCost(): number {
    return this.coffee.getCost();
  }
  
  getDescription(): string {
    return this.coffee.getDescription();
  }
}

// TODO: Implement concrete decorators
class MilkDecorator extends CoffeeDecorator {
  constructor(coffee: Coffee) {
    super(coffee);
  }
  
  getCost(): number {
    // TODO: Add milk cost to base coffee cost
    return this.coffee.getCost() + 0.10;
  }
  
  getDescription(): string {
    // TODO: Add milk to description
    return this.coffee.getDescription() + ', Milk';
  }
}

class SugarDecorator extends CoffeeDecorator {
  constructor(coffee: Coffee) {
    super(coffee);
  }
  
  getCost(): number {
    // TODO: Add sugar cost (free but tracked)
    return this.coffee.getCost();
  }
  
  getDescription(): string {
    // TODO: Add sugar to description
    return this.coffee.getDescription() + ', Sugar';
  }
}

class WhipCreamDecorator extends CoffeeDecorator {
  constructor(coffee: Coffee) {
    super(coffee);
  }
  
  getCost(): number {
    // TODO: Add whipped cream cost
    return this.coffee.getCost() + 0.70;
  }
  
  getDescription(): string {
    // TODO: Add whipped cream to description
    return this.coffee.getDescription() + ', Whip';
  }
}

class ChocolateDecorator extends CoffeeDecorator {
  constructor(coffee: Coffee) {
    super(coffee);
  }
  
  getCost(): number {
    // TODO: Add chocolate cost
    return this.coffee.getCost() + 0.20;
  }
  
  getDescription(): string {
    // TODO: Add chocolate to description
    return this.coffee.getDescription() + ', Chocolate';
  }
}

class VanillaDecorator extends CoffeeDecorator {
  constructor(coffee: Coffee) {
    super(coffee);
  }
  
  getCost(): number {
    // TODO: Add vanilla cost
    return this.coffee.getCost() + 0.15;
  }
  
  getDescription(): string {
    // TODO: Add vanilla to description
    return this.coffee.getDescription() + ', Vanilla';
  }
}

class SoyMilkDecorator extends CoffeeDecorator {
  constructor(coffee: Coffee) {
    super(coffee);
  }
  
  getCost(): number {
    // TODO: Add soy milk cost (more expensive than regular milk)
    return this.coffee.getCost() + 0.15;
  }
  
  getDescription(): string {
    // TODO: Add soy milk to description
    return this.coffee.getDescription() + ', Soy Milk';
  }
}

// Helper class for building complex coffee orders
class CoffeeOrderBuilder {
  private coffee: Coffee;
  
  constructor(baseCoffee: Coffee) {
    this.coffee = baseCoffee;
  }
  
  addMilk(): CoffeeOrderBuilder {
    this.coffee = new MilkDecorator(this.coffee);
    return this;
  }
  
  addSugar(): CoffeeOrderBuilder {
    this.coffee = new SugarDecorator(this.coffee);
    return this;
  }
  
  addWhipCream(): CoffeeOrderBuilder {
    this.coffee = new WhipCreamDecorator(this.coffee);
    return this;
  }
  
  addChocolate(): CoffeeOrderBuilder {
    this.coffee = new ChocolateDecorator(this.coffee);
    return this;
  }
  
  addVanilla(): CoffeeOrderBuilder {
    this.coffee = new VanillaDecorator(this.coffee);
    return this;
  }
  
  addSoyMilk(): CoffeeOrderBuilder {
    this.coffee = new SoyMilkDecorator(this.coffee);
    return this;
  }
  
  build(): Coffee {
    return this.coffee;
  }
}

// Usage examples
console.log('=== Coffee Shop Orders ===');

// Simple coffee order
let coffee1: Coffee = new Espresso();
console.log(\`\${coffee1.getDescription()}: $\${coffee1.getCost().toFixed(2)}\`);

// Coffee with milk
let coffee2: Coffee = new MilkDecorator(new Espresso());
console.log(\`\${coffee2.getDescription()}: $\${coffee2.getCost().toFixed(2)}\`);

// Complex coffee order using decorators directly
let coffee3: Coffee = new HouseBlend();
coffee3 = new SoyMilkDecorator(coffee3);
coffee3 = new ChocolateDecorator(coffee3);
coffee3 = new WhipCreamDecorator(coffee3);
console.log(\`\${coffee3.getDescription()}: $\${coffee3.getCost().toFixed(2)}\`);

// Using the builder for fluent interface
let coffee4: Coffee = new CoffeeOrderBuilder(new SimpleCoffee())
  .addMilk()
  .addSugar()
  .addVanilla()
  .addWhipCream()
  .build();
console.log(\`\${coffee4.getDescription()}: $\${coffee4.getCost().toFixed(2)}\`);

// Multiple decorators of the same type
let coffee5: Coffee = new CoffeeOrderBuilder(new Espresso())
  .addSugar()
  .addSugar() // Double sugar
  .addMilk()
  .build();
console.log(\`\${coffee5.getDescription()}: $\${coffee5.getCost().toFixed(2)}\`);`,
        hints: [
          'Base coffee interface with cost and description',
          'Decorators for milk, sugar, whipped cream',
          'Chain decorators for complex orders'
        ]
      },
      {
        id: 'character-equipment',
        title: '🎮 Character Equipment',
        description: 'Add armor, weapons, and abilities to game characters',
        difficulty: 'intermediate',
        type: 'implement',
        points: 320,
        hints: [
          'Base character with stats (health, attack, defense)',
          'Equipment decorators modify stats',
          'Stack multiple equipment pieces'
        ]
      },
      {
        id: 'message-decorator',
        title: '💌 Message Decorator',
        description: 'Add encryption, compression, formatting to messages',
        difficulty: 'advanced',
        type: 'implement',
        points: 380,
        hints: [
          'Base message with content',
          'Decorators for encryption, compression, formatting',
          'Order of decorators affects final result'
        ]
      },
      {
        id: 'home-decorator',
        title: '🏠 Home Decorator',
        description: 'Add features to smart home devices dynamically',
        difficulty: 'intermediate',
        type: 'implement',
        points: 300,
        hints: [
          'Basic smart home devices (lights, thermostat)',
          'Feature decorators (timer, sensor, remote control)',
          'Combine multiple features per device'
        ]
      }
    ]
  },
  {
    id: 'facade',
    name: 'Facade',
    category: 'structural',
    description: 'Provides a simplified interface to a complex subsystem',
    difficulty: 'beginner',
    lessonFile: 'lessons/structural/facade.md',
    challenges: [
      {
        id: 'smart-home-controller',
        title: '🏠 Smart Home Controller',
        description: 'Create simple interface for complex home automation',
        difficulty: 'beginner',
        type: 'implement',
        points: 200,
        starterCode: `// Smart home facade pattern implementation

// Complex subsystem classes
class LightingSystem {
  private lights: Map<string, boolean> = new Map();
  
  constructor() {
    this.lights.set('living_room', false);
    this.lights.set('bedroom', false);
    this.lights.set('kitchen', false);
    this.lights.set('bathroom', false);
  }
  
  turnOnLight(room: string): void {
    this.lights.set(room, true);
    console.log(\`\${room} light turned ON\`);
  }
  
  turnOffLight(room: string): void {
    this.lights.set(room, false);
    console.log(\`\${room} light turned OFF\`);
  }
  
  turnOnAllLights(): void {
    this.lights.forEach((_, room) => {
      this.turnOnLight(room);
    });
  }
  
  turnOffAllLights(): void {
    this.lights.forEach((_, room) => {
      this.turnOffLight(room);
    });
  }
  
  dimLights(room: string, level: number): void {
    console.log(\`\${room} lights dimmed to \${level}%\`);
  }
}

class SecuritySystem {
  private isArmed: boolean = false;
  private cameras: Map<string, boolean> = new Map();
  
  constructor() {
    this.cameras.set('front_door', true);
    this.cameras.set('back_yard', true);
    this.cameras.set('garage', true);
  }
  
  arm(): void {
    this.isArmed = true;
    console.log('Security system ARMED');
  }
  
  disarm(): void {
    this.isArmed = false;
    console.log('Security system DISARMED');
  }
  
  activateCamera(location: string): void {
    this.cameras.set(location, true);
    console.log(\`\${location} camera activated\`);
  }
  
  deactivateCamera(location: string): void {
    this.cameras.set(location, false);
    console.log(\`\${location} camera deactivated\`);
  }
  
  checkStatus(): string {
    return \`Security: \${this.isArmed ? 'ARMED' : 'DISARMED'}\`;
  }
}

class ClimateControl {
  private temperature: number = 72;
  private isHeatingOn: boolean = false;
  private isCoolingOn: boolean = false;
  
  setTemperature(temp: number): void {
    this.temperature = temp;
    console.log(\`Temperature set to \${temp}°F\`);
    
    if (temp > 75) {
      this.startCooling();
      this.stopHeating();
    } else if (temp < 68) {
      this.startHeating();
      this.stopCooling();
    }
  }
  
  startHeating(): void {
    this.isHeatingOn = true;
    console.log('Heating system started');
  }
  
  stopHeating(): void {
    this.isHeatingOn = false;
    console.log('Heating system stopped');
  }
  
  startCooling(): void {
    this.isCoolingOn = true;
    console.log('Cooling system started');
  }
  
  stopCooling(): void {
    this.isCoolingOn = false;
    console.log('Cooling system stopped');
  }
  
  getStatus(): string {
    return \`Climate: \${this.temperature}°F, Heating: \${this.isHeatingOn}, Cooling: \${this.isCoolingOn}\`;
  }
}

class EntertainmentSystem {
  private tvOn: boolean = false;
  private stereoOn: boolean = false;
  private volume: number = 10;
  
  turnOnTV(): void {
    this.tvOn = true;
    console.log('TV turned ON');
  }
  
  turnOffTV(): void {
    this.tvOn = false;
    console.log('TV turned OFF');
  }
  
  turnOnStereo(): void {
    this.stereoOn = true;
    console.log('Stereo turned ON');
  }
  
  turnOffStereo(): void {
    this.stereoOn = false;
    console.log('Stereo turned OFF');
  }
  
  setVolume(level: number): void {
    this.volume = level;
    console.log(\`Volume set to \${level}\`);
  }
  
  playMusic(playlist: string): void {
    console.log(\`Playing playlist: \${playlist}\`);
  }
}

// TODO: Implement the SmartHomeFacade
class SmartHomeFacade {
  private lights: LightingSystem;
  private security: SecuritySystem;
  private climate: ClimateControl;
  private entertainment: EntertainmentSystem;
  
  constructor() {
    this.lights = new LightingSystem();
    this.security = new SecuritySystem();
    this.climate = new ClimateControl();
    this.entertainment = new EntertainmentSystem();
  }
  
  leaveHome(): void {
    console.log('=== LEAVING HOME ===');
    // TODO: Implement leave home sequence
    // - Turn off all lights
    // - Set temperature to energy-saving mode
    // - Arm security system
    // - Turn off entertainment systems
  }
  
  arriveHome(): void {
    console.log('=== ARRIVING HOME ===');
    // TODO: Implement arrive home sequence
    // - Disarm security system
    // - Turn on main lights
    // - Set comfortable temperature
    // - Turn on entertainment system
  }
  
  movieMode(): void {
    console.log('=== MOVIE MODE ===');
    // TODO: Implement movie mode
    // - Dim lights to 10%
    // - Turn on TV and stereo
    // - Set volume to appropriate level
  }
  
  sleepMode(): void {
    console.log('=== SLEEP MODE ===');
    // TODO: Implement sleep mode
    // - Turn off all lights except bedroom dim light
    // - Lower temperature by 3 degrees
    // - Turn off entertainment systems
    // - Activate security
  }
  
  partyMode(): void {
    console.log('=== PARTY MODE ===');
    // TODO: Implement party mode
    // - Turn on all lights
    // - Play upbeat music
    // - Adjust temperature for crowd
    // - Deactivate some security cameras for privacy
  }
  
  emergencyMode(): void {
    console.log('=== EMERGENCY MODE ===');
    // TODO: Implement emergency mode
    // - Turn on all lights to maximum
    // - Disarm security temporarily
    // - Turn off climate control
    // - Turn off entertainment
  }
  
  getHomeStatus(): string {
    console.log('=== HOME STATUS ===');
    console.log(this.security.checkStatus());
    console.log(this.climate.getStatus());
    return 'Status displayed in console';
  }
}

// Usage example
const smartHome = new SmartHomeFacade();

// Test the facade methods
smartHome.arriveHome();
smartHome.getHomeStatus();

smartHome.movieMode();

smartHome.leaveHome();
smartHome.getHomeStatus();`,
        hints: [
          'Multiple subsystems (lights, security, climate)',
          'Simple facade methods (leaveHome, arriveHome)',
          'Hide complexity from user'
        ]
      },
      {
        id: 'system-startup',
        title: '💻 System Startup',
        description: 'Simplify complex system initialization process',
        difficulty: 'intermediate',
        type: 'implement',
        points: 250,
        hints: [
          'Multiple initialization steps (database, cache, services)',
          'Single start() method coordinates everything',
          'Handle startup failures gracefully'
        ]
      },
      {
        id: 'media-center',
        title: '🎬 Media Center',
        description: 'Create unified interface for different media players',
        difficulty: 'intermediate',
        type: 'implement',
        points: 280,
        hints: [
          'Different players (VideoPlayer, AudioPlayer, ImageViewer)',
          'Unified playMedia() method',
          'Auto-detect media type and use appropriate player'
        ]
      },
      {
        id: 'tool-integration',
        title: '🔧 Tool Integration',
        description: 'Combine multiple tools behind single interface',
        difficulty: 'advanced',
        type: 'implement',
        points: 350,
        hints: [
          'Multiple development tools (compiler, linter, tester)',
          'Single build() method orchestrates all tools',
          'Configurable tool chain'
        ]
      }
    ]
  },
  {
    id: 'flyweight',
    name: 'Flyweight',
    category: 'structural',
    description: 'Minimizes memory usage by sharing common data among objects',
    difficulty: 'advanced',
    lessonFile: 'lessons/structural/flyweight.md',
    challenges: [
      {
        id: 'forest-renderer',
        title: '🌳 Forest Renderer',
        description: 'Efficiently render thousands of trees using flyweight',
        difficulty: 'advanced',
        type: 'implement',
        points: 400,
        hints: [
          'TreeType flyweight stores shared data (texture, model)',
          'Tree instances store position and individual state',
          'Factory manages TreeType instances'
        ]
      },
      {
        id: 'particle-system',
        title: '🎮 Particle System',
        description: 'Create particle effects with memory optimization',
        difficulty: 'advanced',
        type: 'implement',
        points: 450,
        hints: [
          'ParticleType flyweight for common properties',
          'Particle instances for position and velocity',
          'Efficient rendering of thousands of particles'
        ]
      },
      {
        id: 'text-editor',
        title: '📝 Text Editor',
        description: 'Implement character formatting with flyweight pattern',
        difficulty: 'intermediate',
        type: 'implement',
        points: 350,
        hints: [
          'CharacterFormat flyweight for font, color, size',
          'Character instances reference shared formats',
          'Memory efficient large document handling'
        ]
      },
      {
        id: 'map-tiles',
        title: '🗺️ Map Tiles',
        description: 'Render large maps efficiently using shared tile objects',
        difficulty: 'advanced',
        type: 'implement',
        points: 420,
        hints: [
          'TileType flyweight for shared tile graphics',
          'MapTile instances for position-specific data',
          'Efficient rendering of massive game worlds'
        ]
      }
    ]
  },
  {
    id: 'proxy',
    name: 'Proxy',
    category: 'structural',
    description: 'Provides placeholder/surrogate for another object to control access',
    difficulty: 'intermediate',
    lessonFile: 'lessons/structural/proxy.md',
    challenges: [
      {
        id: 'image-lazy-loader',
        title: '🖼️ Image Lazy Loader',
        description: 'Load images on-demand using proxy pattern',
        difficulty: 'intermediate',
        type: 'implement',
        points: 300,
        hints: [
          'ImageProxy loads actual image when needed',
          'Show placeholder until real image loads',
          'Implements same interface as real image'
        ]
      },
      {
        id: 'access-control',
        title: '🔐 Access Control',
        description: 'Implement security proxy for sensitive operations',
        difficulty: 'intermediate',
        type: 'implement',
        points: 320,
        hints: [
          'SecurityProxy checks permissions before access',
          'Different permission levels for operations',
          'Log access attempts for audit'
        ]
      },
      {
        id: 'caching-proxy',
        title: '📊 Caching Proxy',
        description: 'Add caching layer to expensive operations',
        difficulty: 'intermediate',
        type: 'implement',
        points: 350,
        hints: [
          'CacheProxy stores results of expensive calls',
          'Cache expiration and invalidation',
          'Transparent to client code'
        ]
      },
      {
        id: 'remote-proxy',
        title: '🌐 Remote Proxy',
        description: 'Create proxy for remote service calls',
        difficulty: 'advanced',
        type: 'implement',
        points: 400,
        hints: [
          'RemoteProxy handles network communication',
          'Hide remote call complexity from client',
          'Handle network errors and retries'
        ]
      }
    ]
  },

  // Behavioral Patterns  
  {
    id: 'chain-of-responsibility',
    name: 'Chain of Responsibility',
    category: 'behavioral',
    description: 'Passes requests along a chain of handlers until one handles it',
    difficulty: 'intermediate',
    lessonFile: 'lessons/behavioral/chain-of-responsibility.md',
    challenges: [
      {
        id: 'support-ticket-router',
        title: '🎫 Support Ticket Router',
        description: 'Route support requests through different levels',
        difficulty: 'intermediate',
        type: 'implement',
        points: 300,
        hints: [
          'Different support levels (L1, L2, L3)',
          'Each handler decides if it can process request',
          'Chain passes request to next handler if needed'
        ]
      },
      {
        id: 'atm-money-dispenser',
        title: '💰 ATM Money Dispenser',
        description: 'Dispense money using different bill denominations',
        difficulty: 'intermediate',
        type: 'implement',
        points: 280,
        hints: [
          'Handlers for different bill values ($100, $50, $20, $10)',
          'Each handler dispenses what it can',
          'Pass remainder to next handler'
        ]
      },
      {
        id: 'request-validator',
        title: '🔍 Request Validator',
        description: 'Chain multiple validation steps for user input',
        difficulty: 'beginner',
        type: 'implement',
        points: 250,
        hints: [
          'Validation handlers (format, length, business rules)',
          'Stop processing on first validation failure',
          'Each validator has single responsibility'
        ]
      },
      {
        id: 'event-handler-chain',
        title: '🎯 Event Handler Chain',
        description: 'Process UI events through handler chain',
        difficulty: 'advanced',
        type: 'implement',
        points: 350,
        hints: [
          'Event handlers for different UI components',
          'Event bubbling through component hierarchy',
          'Handler can stop or continue event propagation'
        ]
      }
    ]
  },
  {
    id: 'observer',
    name: 'Observer',
    category: 'behavioral',
    description: 'Notifies multiple objects about state changes',
    difficulty: 'intermediate',
    lessonFile: 'lessons/behavioral/observer.md',
    challenges: [
      {
        id: 'observer-stock',
        title: '📈 Stock Market Tracker',
        description: 'Real-time stock updates to multiple displays',
        difficulty: 'intermediate',
        type: 'implement',
        points: 320,
        starterCode: `// Stock market tracker with observer pattern

interface Observer {
  update(subject: Subject): void;
}

interface Subject {
  attach(observer: Observer): void;
  detach(observer: Observer): void;
  notify(): void;
}

class Stock implements Subject {
  private observers: Observer[] = [];
  private symbol: string;
  private price: number;
  private previousPrice: number;
  private volume: number;
  private lastUpdate: Date;
  
  constructor(symbol: string, initialPrice: number) {
    this.symbol = symbol;
    this.price = initialPrice;
    this.previousPrice = initialPrice;
    this.volume = 0;
    this.lastUpdate = new Date();
  }
  
  attach(observer: Observer): void {
    // TODO: Add observer to the list
  }
  
  detach(observer: Observer): void {
    // TODO: Remove observer from the list
  }
  
  notify(): void {
    // TODO: Notify all observers
  }
  
  setPrice(newPrice: number): void {
    this.previousPrice = this.price;
    this.price = newPrice;
    this.lastUpdate = new Date();
    // TODO: Notify observers of price change
  }
  
  getPrice(): number {
    return this.price;
  }
  
  getSymbol(): string {
    return this.symbol;
  }
  
  getPreviousPrice(): number {
    return this.previousPrice;
  }
  
  getPriceChange(): number {
    return this.price - this.previousPrice;
  }
  
  getPriceChangePercent(): number {
    return ((this.price - this.previousPrice) / this.previousPrice) * 100;
  }
}

// TODO: Implement chart display observer
class ChartDisplay implements Observer {
  private name: string;
  
  constructor(name: string) {
    this.name = name;
  }
  
  update(subject: Subject): void {
    // TODO: Update chart display with new stock data
    if (subject instanceof Stock) {
      // Update chart visualization
      console.log(\`Chart Display updating for \${subject.getSymbol()}\`);
    }
  }
}

// TODO: Implement table display observer
class TableDisplay implements Observer {
  private name: string;
  
  constructor(name: string) {
    this.name = name;
  }
  
  update(subject: Subject): void {
    // TODO: Update table display with new stock data
    if (subject instanceof Stock) {
      console.log(\`Table Display: \${subject.getSymbol()} - $\${subject.getPrice()}\`);
    }
  }
}

// TODO: Implement alert system observer
class PriceAlert implements Observer {
  private thresholdPrice: number;
  private alertType: 'above' | 'below';
  
  constructor(thresholdPrice: number, alertType: 'above' | 'below') {
    this.thresholdPrice = thresholdPrice;
    this.alertType = alertType;
  }
  
  update(subject: Subject): void {
    // TODO: Check if alert conditions are met and send alerts
    if (subject instanceof Stock) {
      const currentPrice = subject.getPrice();
      // Check alert conditions and send notifications
    }
  }
}

// TODO: Implement mobile notification observer
class MobileNotification implements Observer {
  private userId: string;
  
  constructor(userId: string) {
    this.userId = userId;
  }
  
  update(subject: Subject): void {
    // TODO: Send mobile notification for significant price changes
    if (subject instanceof Stock) {
      const changePercent = Math.abs(subject.getPriceChangePercent());
      if (changePercent > 5) { // 5% change threshold
        this.sendNotification(subject);
      }
    }
  }
  
  private sendNotification(stock: Stock): void {
    console.log(\`Mobile Alert: \${stock.getSymbol()} changed \${stock.getPriceChangePercent().toFixed(2)}%\`);
  }
}

// Usage example
const appleStock = new Stock('AAPL', 150.00);

const chartDisplay = new ChartDisplay('Main Chart');
const tableDisplay = new TableDisplay('Price Table');
const priceAlert = new PriceAlert(160.00, 'above');
const mobileNotification = new MobileNotification('user123');

// TODO: Attach observers to stock
// TODO: Simulate price changes and observe notifications
appleStock.setPrice(155.50);
appleStock.setPrice(161.25);
appleStock.setPrice(145.75);`,
        hints: [
          'Stock subject notifies price changes',
          'Multiple display observers (chart, table, alert)',
          'Observers update automatically when stock changes'
        ]
      },
      {
        id: 'news-subscription',
        title: '📰 News Subscription',
        description: 'Implement news feed with multiple subscribers',
        difficulty: 'beginner',
        type: 'implement',
        points: 250,
        hints: [
          'News agency publishes articles',
          'Subscribers get notified of new articles',
          'Different subscriber types (email, mobile, web)'
        ]
      },
      {
        id: 'game-events',
        title: '🎮 Game Events',
        description: 'Notify multiple game systems of player actions',
        difficulty: 'intermediate',
        type: 'implement',
        points: 300,
        hints: [
          'Player actions trigger events',
          'Multiple systems listen (UI, sound, achievements)',
          'Decouple game systems from each other'
        ]
      },
      {
        id: 'shopping-cart',
        title: '🛒 Shopping Cart',
        description: 'Update UI components when cart changes',
        difficulty: 'beginner',
        type: 'implement',
        points: 220,
        hints: [
          'Cart model notifies changes',
          'UI components observe cart (total, count, items)',
          'Automatic UI updates on cart modifications'
        ]
      }
    ]
  },
  {
    id: 'strategy',
    name: 'Strategy',
    category: 'behavioral',
    description: 'Defines interchangeable algorithms',
    difficulty: 'intermediate',
    lessonFile: 'lessons/behavioral/strategy.md',
    challenges: [
      {
        id: 'algorithm-racing',
        title: '⚡ Algorithm Racing',
        description: 'Compare sorting algorithm performance on different data',
        difficulty: 'intermediate',
        type: 'implement',
        points: 300,
        hints: [
          'Different sorting strategies (QuickSort, MergeSort, BubbleSort)',
          'Context switches between algorithms',
          'Measure and compare performance'
        ]
      },
      {
        id: 'strategy-payment',
        title: '💳 Payment Gateway',
        description: 'Implement multiple payment strategies (card, PayPal, crypto)',
        difficulty: 'intermediate',
        type: 'implement',
        points: 280,
        starterCode: `// Payment gateway with strategy pattern

interface PaymentStrategy {
  processPayment(amount: number, details: PaymentDetails): PaymentResult;
  validatePayment(details: PaymentDetails): boolean;
  getPaymentType(): string;
}

interface PaymentDetails {
  [key: string]: any;
}

interface PaymentResult {
  success: boolean;
  transactionId: string;
  message: string;
  fees?: number;
}

// TODO: Implement credit card payment strategy
class CreditCardPayment implements PaymentStrategy {
  processPayment(amount: number, details: PaymentDetails): PaymentResult {
    // TODO: Process credit card payment
    // details should contain: cardNumber, expiryDate, cvv, cardholderName
    
    if (!this.validatePayment(details)) {
      return {
        success: false,
        transactionId: '',
        message: 'Invalid card details'
      };
    }
    
    // Simulate processing
    const success = Math.random() > 0.1; // 90% success rate
    const transactionId = 'CC_' + Math.random().toString(36).substr(2, 9);
    
    return {
      success,
      transactionId,
      message: success ? 'Payment processed successfully' : 'Card declined',
      fees: amount * 0.029 // 2.9% processing fee
    };
  }
  
  validatePayment(details: PaymentDetails): boolean {
    // TODO: Validate credit card details
    // Check card number, expiry date, CVV format
    return true;
  }
  
  getPaymentType(): string {
    return 'Credit Card';
  }
}

// TODO: Implement PayPal payment strategy
class PayPalPayment implements PaymentStrategy {
  processPayment(amount: number, details: PaymentDetails): PaymentResult {
    // TODO: Process PayPal payment
    // details should contain: email, password or token
    
    if (!this.validatePayment(details)) {
      return {
        success: false,
        transactionId: '',
        message: 'Invalid PayPal credentials'
      };
    }
    
    // Simulate PayPal processing
    const success = Math.random() > 0.05; // 95% success rate
    const transactionId = 'PP_' + Math.random().toString(36).substr(2, 9);
    
    return {
      success,
      transactionId,
      message: success ? 'PayPal payment successful' : 'PayPal payment failed',
      fees: amount * 0.034 // 3.4% + $0.30 fee
    };
  }
  
  validatePayment(details: PaymentDetails): boolean {
    // TODO: Validate PayPal credentials
    return details.email && (details.password || details.token);
  }
  
  getPaymentType(): string {
    return 'PayPal';
  }
}

// TODO: Implement cryptocurrency payment strategy
class CryptoPayment implements PaymentStrategy {
  private cryptoType: string;
  
  constructor(cryptoType: 'BTC' | 'ETH' | 'LTC' = 'BTC') {
    this.cryptoType = cryptoType;
  }
  
  processPayment(amount: number, details: PaymentDetails): PaymentResult {
    // TODO: Process crypto payment
    // details should contain: walletAddress, privateKey or signature
    
    if (!this.validatePayment(details)) {
      return {
        success: false,
        transactionId: '',
        message: 'Invalid wallet details'
      };
    }
    
    // Simulate crypto processing (slower, higher fee)
    const success = Math.random() > 0.15; // 85% success rate (network issues)
    const transactionId = \`\${this.cryptoType}_\` + Math.random().toString(36).substr(2, 9);
    
    return {
      success,
      transactionId,
      message: success ? \`\${this.cryptoType} payment confirmed\` : 'Crypto payment failed',
      fees: this.calculateCryptoFees(amount)
    };
  }
  
  validatePayment(details: PaymentDetails): boolean {
    // TODO: Validate crypto wallet details
    return details.walletAddress && details.walletAddress.length > 20;
  }
  
  getPaymentType(): string {
    return \`Cryptocurrency (\${this.cryptoType})\`;
  }
  
  private calculateCryptoFees(amount: number): number {
    // Variable fees based on network congestion
    const baseFee = Math.random() * 10; // $0-10 network fee
    return baseFee;
  }
}

// TODO: Implement payment context
class PaymentProcessor {
  private strategy: PaymentStrategy;
  
  constructor(strategy: PaymentStrategy) {
    this.strategy = strategy;
  }
  
  setStrategy(strategy: PaymentStrategy): void {
    // TODO: Change payment strategy
  }
  
  processPayment(amount: number, details: PaymentDetails): PaymentResult {
    // TODO: Use current strategy to process payment
    return this.strategy.processPayment(amount, details);
  }
  
  getPaymentType(): string {
    return this.strategy.getPaymentType();
  }
}

// Usage examples
const creditCardProcessor = new PaymentProcessor(new CreditCardPayment());
const paypalProcessor = new PaymentProcessor(new PayPalPayment());
const cryptoProcessor = new PaymentProcessor(new CryptoPayment('BTC'));

// Process payments with different strategies
const cardResult = creditCardProcessor.processPayment(100, {
  cardNumber: '4532-1234-5678-9012',
  expiryDate: '12/25',
  cvv: '123',
  cardholderName: 'John Doe'
});

const paypalResult = paypalProcessor.processPayment(100, {
  email: 'user@example.com',
  token: 'paypal_token_123'
});

const cryptoResult = cryptoProcessor.processPayment(100, {
  walletAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83example123abc'
});

console.log('Card payment:', cardResult);
console.log('PayPal payment:', paypalResult);
console.log('Crypto payment:', cryptoResult);`,
        hints: [
          'Payment strategy interface',
          'Concrete strategies for different payment methods',
          'Context processes payment using selected strategy'
        ]
      },
      {
        id: 'game-ai',
        title: '🤖 Game AI',
        description: 'Create different AI strategies for game characters',
        difficulty: 'advanced',
        type: 'implement',
        points: 350,
        hints: [
          'AI behavior strategies (aggressive, defensive, random)',
          'Character context chooses strategy based on situation',
          'Dynamic strategy switching during gameplay'
        ]
      },
      {
        id: 'calculation-engine',
        title: '🧮 Calculation Engine',
        description: 'Switch between different calculation methods',
        difficulty: 'beginner',
        type: 'implement',
        points: 220,
        hints: [
          'Calculator supports different operations',
          'Strategy for each mathematical operation',
          'Easy to add new calculation methods'
        ]
      }
    ]
  },
  {
    id: 'command',
    name: 'Command',
    category: 'behavioral',
    description: 'Encapsulates requests as objects, allowing parameterization and queuing',
    difficulty: 'intermediate',
    lessonFile: 'lessons/behavioral/command.md',
    challenges: [
      {
        id: 'command-undo',
        title: '↩️ Undo/Redo Editor',
        description: 'Build text editor with command history',
        difficulty: 'intermediate',
        type: 'implement',
        points: 320,
        hints: [
          'Commands encapsulate text operations (insert, delete, format)',
          'Command history stack for undo/redo',
          'Each command can undo its own operation'
        ]
      },
      {
        id: 'remote-control',
        title: '📱 Remote Control',
        description: 'Create universal remote using command pattern',
        difficulty: 'beginner',
        type: 'implement',
        points: 250,
        starterCode: `// Universal remote control using command pattern

interface Command {
  execute(): void;
  undo(): void;
}

// Receiver classes - actual devices
class Television {
  private isOn: boolean = false;
  private volume: number = 10;
  private channel: number = 1;
  
  turnOn(): void {
    this.isOn = true;
    console.log('TV is now ON');
  }
  
  turnOff(): void {
    this.isOn = false;
    console.log('TV is now OFF');
  }
  
  volumeUp(): void {
    if (this.volume < 100) {
      this.volume++;
      console.log(\`TV volume: \${this.volume}\`);
    }
  }
  
  volumeDown(): void {
    if (this.volume > 0) {
      this.volume--;
      console.log(\`TV volume: \${this.volume}\`);
    }
  }
  
  channelUp(): void {
    this.channel++;
    console.log(\`TV channel: \${this.channel}\`);
  }
  
  channelDown(): void {
    if (this.channel > 1) {
      this.channel--;
      console.log(\`TV channel: \${this.channel}\`);
    }
  }
  
  getStatus(): string {
    return \`TV: \${this.isOn ? 'ON' : 'OFF'}, Volume: \${this.volume}, Channel: \${this.channel}\`;
  }
}

class Stereo {
  private isOn: boolean = false;
  private volume: number = 5;
  
  turnOn(): void {
    this.isOn = true;
    console.log('Stereo is now ON');
  }
  
  turnOff(): void {
    this.isOn = false;
    console.log('Stereo is now OFF');
  }
  
  volumeUp(): void {
    if (this.volume < 20) {
      this.volume++;
      console.log(\`Stereo volume: \${this.volume}\`);
    }
  }
  
  volumeDown(): void {
    if (this.volume > 0) {
      this.volume--;
      console.log(\`Stereo volume: \${this.volume}\`);
    }
  }
}

// TODO: Implement concrete commands for TV
class TVOnCommand implements Command {
  private tv: Television;
  
  constructor(tv: Television) {
    this.tv = tv;
  }
  
  execute(): void {
    // TODO: Turn on TV
  }
  
  undo(): void {
    // TODO: Turn off TV (undo the on command)
  }
}

class TVOffCommand implements Command {
  private tv: Television;
  
  constructor(tv: Television) {
    this.tv = tv;
  }
  
  execute(): void {
    // TODO: Turn off TV
  }
  
  undo(): void {
    // TODO: Turn on TV (undo the off command)
  }
}

class TVVolumeUpCommand implements Command {
  private tv: Television;
  
  constructor(tv: Television) {
    this.tv = tv;
  }
  
  execute(): void {
    // TODO: Increase TV volume
  }
  
  undo(): void {
    // TODO: Decrease TV volume
  }
}

// TODO: Implement NoOpCommand for empty slots
class NoOpCommand implements Command {
  execute(): void {
    // Do nothing
  }
  
  undo(): void {
    // Do nothing
  }
}

// TODO: Implement MacroCommand for multiple operations
class MacroCommand implements Command {
  private commands: Command[];
  
  constructor(commands: Command[]) {
    this.commands = commands;
  }
  
  execute(): void {
    // TODO: Execute all commands in sequence
  }
  
  undo(): void {
    // TODO: Undo all commands in reverse order
  }
}

// TODO: Implement the remote control (Invoker)
class RemoteControl {
  private onCommands: Command[] = [];
  private offCommands: Command[] = [];
  private lastCommand: Command;
  
  constructor() {
    // Initialize with NoOpCommands
    const noOpCommand = new NoOpCommand();
    for (let i = 0; i < 7; i++) {
      this.onCommands[i] = noOpCommand;
      this.offCommands[i] = noOpCommand;
    }
    this.lastCommand = noOpCommand;
  }
  
  setCommand(slot: number, onCommand: Command, offCommand: Command): void {
    // TODO: Set commands for a specific slot
  }
  
  pressOnButton(slot: number): void {
    // TODO: Execute the on command for the slot
  }
  
  pressOffButton(slot: number): void {
    // TODO: Execute the off command for the slot
  }
  
  pressUndoButton(): void {
    // TODO: Undo the last executed command
  }
  
  toString(): string {
    let result = '\\n--- Remote Control ---\\n';
    for (let i = 0; i < this.onCommands.length; i++) {
      result += \`[slot \${i}] \${this.onCommands[i].constructor.name}    \${this.offCommands[i].constructor.name}\\n\`;
    }
    return result;
  }
}

// Usage
const remote = new RemoteControl();
const tv = new Television();
const stereo = new Stereo();

// Create commands
const tvOnCommand = new TVOnCommand(tv);
const tvOffCommand = new TVOffCommand(tv);
const tvVolumeUpCommand = new TVVolumeUpCommand(tv);

// TODO: Set up the remote control and test the commands
remote.setCommand(0, tvOnCommand, tvOffCommand);
remote.setCommand(1, tvVolumeUpCommand, new NoOpCommand());

console.log(remote.toString());

// Test the remote
remote.pressOnButton(0);
remote.pressOffButton(0);
remote.pressUndoButton();`,
        hints: [
          'Commands for different device operations',
          'Remote control has programmable buttons',
          'Support macro commands for multiple operations'
        ]
      },
      {
        id: 'robot-controller',
        title: '🤖 Robot Controller',
        description: 'Queue and execute robot movements',
        difficulty: 'intermediate',
        type: 'implement',
        points: 300,
        hints: [
          'Movement commands (forward, backward, turn, stop)',
          'Command queue for batch execution',
          'Support for timed command execution'
        ]
      },
      {
        id: 'macro-recorder',
        title: '📹 Macro Recorder',
        description: 'Build macro system for automating tasks',
        difficulty: 'advanced',
        type: 'implement',
        points: 380,
        hints: [
          'Record sequence of user actions as commands',
          'Play back recorded macros',
          'Save/load macros for later use'
        ]
      }
    ]
  },
  {
    id: 'interpreter',
    name: 'Interpreter',
    category: 'behavioral',
    description: 'Defines grammar for a language and interprets sentences',
    difficulty: 'advanced',
    lessonFile: 'lessons/behavioral/interpreter.md',
    challenges: [
      {
        id: 'calculator-builder',
        title: '🧮 Calculator Builder',
        description: 'Create expression evaluator for math formulas',
        difficulty: 'advanced',
        type: 'implement',
        points: 400,
        hints: [
          'Grammar for math expressions (numbers, operators, parentheses)',
          'Expression tree with terminal and non-terminal nodes',
          'Interpret and evaluate expressions'
        ]
      },
      {
        id: 'music-notation',
        title: '🎵 Music Notation',
        description: 'Parse and play simple music notation',
        difficulty: 'advanced',
        type: 'implement',
        points: 450,
        hints: [
          'Grammar for music notes (C, D, E, F, G, A, B)',
          'Note duration (whole, half, quarter, eighth)',
          'Interpret notation and generate audio'
        ]
      },
      {
        id: 'search-query-parser',
        title: '🔍 Search Query Parser',
        description: 'Parse complex search queries with operators',
        difficulty: 'advanced',
        type: 'implement',
        points: 420,
        hints: [
          'Query grammar (AND, OR, NOT operators)',
          'Support for quoted phrases and wildcards',
          'Convert parsed query to search engine format'
        ]
      },
      {
        id: 'logo-interpreter',
        title: '🎨 Logo Interpreter',
        description: 'Create simple drawing language interpreter',
        difficulty: 'advanced',
        type: 'implement',
        points: 480,
        hints: [
          'Commands for turtle graphics (forward, turn, pen up/down)',
          'Support for loops and variables',
          'Generate visual output from commands'
        ]
      }
    ]
  },
  {
    id: 'iterator',
    name: 'Iterator',
    category: 'behavioral',
    description: 'Provides sequential access to elements without exposing structure',
    difficulty: 'intermediate',
    lessonFile: 'lessons/behavioral/iterator.md',
    challenges: [
      {
        id: 'collection-navigator',
        title: '📚 Collection Navigator',
        description: 'Navigate through different data structures uniformly',
        difficulty: 'intermediate',
        type: 'implement',
        points: 300,
        hints: [
          'Common iterator interface for different collections',
          'Iterators for arrays, linked lists, trees',
          'Client code doesn\'t know collection structure'
        ]
      },
      {
        id: 'tree-traverser',
        title: '🌳 Tree Traverser',
        description: 'Implement different tree traversal strategies',
        difficulty: 'advanced',
        type: 'implement',
        points: 380,
        hints: [
          'Iterators for pre-order, in-order, post-order traversal',
          'Breadth-first and depth-first iterators',
          'Switch traversal strategy without changing tree'
        ]
      },
      {
        id: 'file-reader',
        title: '📄 File Reader',
        description: 'Read files with different iteration strategies',
        difficulty: 'intermediate',
        type: 'implement',
        points: 320,
        hints: [
          'Iterators for line-by-line, word-by-word, character-by-character',
          'Support for different file formats',
          'Memory-efficient large file processing'
        ]
      },
      {
        id: 'playlist-player',
        title: '🎮 Playlist Player',
        description: 'Navigate through music playlists with shuffle/repeat',
        difficulty: 'beginner',
        type: 'implement',
        points: 250,
        hints: [
          'Sequential, shuffle, and repeat iterators',
          'Playlist doesn\'t change, only iteration changes',
          'Support for nested playlists'
        ]
      }
    ]
  },
  {
    id: 'mediator',
    name: 'Mediator',
    category: 'behavioral',
    description: 'Defines how objects interact through a central mediator',
    difficulty: 'intermediate',
    lessonFile: 'lessons/behavioral/mediator.md',
    challenges: [
      {
        id: 'air-traffic-control',
        title: '✈️ Air Traffic Control',
        description: 'Coordinate airplane communications through mediator',
        difficulty: 'advanced',
        type: 'implement',
        points: 400,
        hints: [
          'Airplanes don\'t communicate directly with each other',
          'Control tower mediates all communications',
          'Manage takeoff, landing, and flight path requests'
        ]
      },
      {
        id: 'chat-room',
        title: '💬 Chat Room',
        description: 'Implement chat system where users don\'t know each other directly',
        difficulty: 'intermediate',
        type: 'implement',
        points: 300,
        hints: [
          'Users send messages through chat room mediator',
          'Mediator routes messages to appropriate recipients',
          'Support for private messages and group chats'
        ]
      },
      {
        id: 'smart-home-hub',
        title: '🏠 Smart Home Hub',
        description: 'Coordinate smart device interactions',
        difficulty: 'intermediate',
        type: 'implement',
        points: 350,
        hints: [
          'Devices communicate through central hub',
          'Hub coordinates complex automation scenarios',
          'Devices don\'t need to know about other devices'
        ]
      },
      {
        id: 'game-event-system',
        title: '🎮 Game Event System',
        description: 'Mediate interactions between game objects',
        difficulty: 'advanced',
        type: 'implement',
        points: 380,
        hints: [
          'Game objects interact through event mediator',
          'Mediator handles collisions, triggers, achievements',
          'Loose coupling between game components'
        ]
      }
    ]
  },
  {
    id: 'memento',
    name: 'Memento',
    category: 'behavioral',
    description: 'Captures object state for later restoration without violating encapsulation',
    difficulty: 'intermediate',
    lessonFile: 'lessons/behavioral/memento.md',
    challenges: [
      {
        id: 'game-save-system',
        title: '💾 Game Save System',
        description: 'Save and restore game states at checkpoints',
        difficulty: 'intermediate',
        type: 'implement',
        points: 320,
        hints: [
          'Game state memento captures current progress',
          'Caretaker manages multiple save slots',
          'Restore game to any saved checkpoint'
        ]
      },
      {
        id: 'text-editor-history',
        title: '📝 Text Editor History',
        description: 'Implement document state snapshots',
        difficulty: 'intermediate',
        type: 'implement',
        points: 300,
        hints: [
          'Document memento stores complete state',
          'History manager keeps track of versions',
          'Revert to any previous document state'
        ]
      },
      {
        id: 'drawing-app-versions',
        title: '🎨 Drawing App Versions',
        description: 'Save and restore drawing states',
        difficulty: 'beginner',
        type: 'implement',
        points: 250,
        hints: [
          'Drawing memento captures canvas state',
          'Version history with timestamps',
          'Visual preview of saved versions'
        ]
      },
      {
        id: 'configuration-backup',
        title: '⚙️ Configuration Backup',
        description: 'Save and restore application settings',
        difficulty: 'beginner',
        type: 'implement',
        points: 220,
        hints: [
          'Settings memento for configuration state',
          'Named configuration profiles',
          'Import/export settings functionality'
        ]
      }
    ]
  },
  {
    id: 'state',
    name: 'State',
    category: 'behavioral',
    description: 'Allows object to alter behavior when internal state changes',
    difficulty: 'intermediate',
    lessonFile: 'lessons/behavioral/state.md',
    challenges: [
      {
        id: 'game-character-fsm',
        title: '🎮 Game Character FSM',
        description: 'Implement character states (idle, running, jumping, attacking)',
        difficulty: 'intermediate',
        type: 'implement',
        points: 340,
        starterCode: `// Game character finite state machine

// State interface
interface CharacterState {
  enter(character: GameCharacter): void;
  handleInput(character: GameCharacter, input: string): void;
  update(character: GameCharacter, deltaTime: number): void;
  exit(character: GameCharacter): void;
  getStateName(): string;
}

// Game Character context
class GameCharacter {
  private currentState: CharacterState;
  private health: number = 100;
  private stamina: number = 100;
  private position: { x: number, y: number } = { x: 0, y: 0 };
  private velocity: { x: number, y: number } = { x: 0, y: 0 };
  private isOnGround: boolean = true;
  private attackCooldown: number = 0;
  
  constructor(initialState: CharacterState) {
    this.currentState = initialState;
    this.currentState.enter(this);
  }
  
  changeState(newState: CharacterState): void {
    console.log(\`State change: \${this.currentState.getStateName()} -> \${newState.getStateName()}\`);
    this.currentState.exit(this);
    this.currentState = newState;
    this.currentState.enter(this);
  }
  
  handleInput(input: string): void {
    this.currentState.handleInput(this, input);
  }
  
  update(deltaTime: number): void {
    this.currentState.update(this, deltaTime);
    
    // Update cooldowns
    if (this.attackCooldown > 0) {
      this.attackCooldown -= deltaTime;
    }
    
    // Regenerate stamina when not running
    if (this.currentState.getStateName() !== 'Running' && this.stamina < 100) {
      this.stamina = Math.min(100, this.stamina + deltaTime * 20);
    }
  }
  
  getCurrentState(): CharacterState {
    return this.currentState;
  }
  
  // Getters and setters
  getHealth(): number { return this.health; }
  getStamina(): number { return this.stamina; }
  getPosition(): { x: number, y: number } { return this.position; }
  getVelocity(): { x: number, y: number } { return this.velocity; }
  isCharacterOnGround(): boolean { return this.isOnGround; }
  getAttackCooldown(): number { return this.attackCooldown; }
  
  setHealth(health: number): void { this.health = Math.max(0, Math.min(100, health)); }
  setStamina(stamina: number): void { this.stamina = Math.max(0, Math.min(100, stamina)); }
  setPosition(x: number, y: number): void { this.position = { x, y }; }
  setVelocity(x: number, y: number): void { this.velocity = { x, y }; }
  setOnGround(onGround: boolean): void { this.isOnGround = onGround; }
  setAttackCooldown(cooldown: number): void { this.attackCooldown = cooldown; }
  
  getStatus(): string {
    return \`State: \${this.currentState.getStateName()}, Health: \${this.health}, Stamina: \${this.stamina.toFixed(1)}, Position: (\${this.position.x}, \${this.position.y})\`;
  }
}

// TODO: Implement IdleState
class IdleState implements CharacterState {
  enter(character: GameCharacter): void {
    console.log('Character is now idle');
    character.setVelocity(0, 0);
  }
  
  handleInput(character: GameCharacter, input: string): void {
    switch (input) {
      case 'move':
        // TODO: Change to running state if stamina > 0
        if (character.getStamina() > 10) {
          character.changeState(new RunningState());
        }
        break;
      case 'jump':
        // TODO: Change to jumping state if on ground
        if (character.isCharacterOnGround()) {
          character.changeState(new JumpingState());
        }
        break;
      case 'attack':
        // TODO: Change to attacking state if attack is ready
        if (character.getAttackCooldown() <= 0) {
          character.changeState(new AttackingState());
        }
        break;
    }
  }
  
  update(character: GameCharacter, deltaTime: number): void {
    // Idle state doesn't need updates
  }
  
  exit(character: GameCharacter): void {
    console.log('Leaving idle state');
  }
  
  getStateName(): string {
    return 'Idle';
  }
}

// TODO: Implement RunningState
class RunningState implements CharacterState {
  private runningTime: number = 0;
  
  enter(character: GameCharacter): void {
    console.log('Character started running');
    character.setVelocity(5, 0); // Running speed
    this.runningTime = 0;
  }
  
  handleInput(character: GameCharacter, input: string): void {
    switch (input) {
      case 'stop':
        // TODO: Change to idle state
        character.changeState(new IdleState());
        break;
      case 'jump':
        // TODO: Change to jumping state
        if (character.isCharacterOnGround()) {
          character.changeState(new JumpingState());
        }
        break;
      case 'attack':
        // TODO: Change to attacking state
        if (character.getAttackCooldown() <= 0) {
          character.changeState(new AttackingState());
        }
        break;
    }
  }
  
  update(character: GameCharacter, deltaTime: number): void {
    this.runningTime += deltaTime;
    
    // Consume stamina while running
    character.setStamina(character.getStamina() - deltaTime * 15);
    
    // Update position
    const pos = character.getPosition();
    const vel = character.getVelocity();
    character.setPosition(pos.x + vel.x * deltaTime, pos.y);
    
    // If stamina depleted, go to idle
    if (character.getStamina() <= 0) {
      console.log('Character exhausted!');
      character.changeState(new IdleState());
    }
  }
  
  exit(character: GameCharacter): void {
    console.log(\`Stopped running after \${this.runningTime.toFixed(1)} seconds\`);
    character.setVelocity(0, 0);
  }
  
  getStateName(): string {
    return 'Running';
  }
}

// TODO: Implement JumpingState
class JumpingState implements CharacterState {
  private jumpTime: number = 0;
  private readonly jumpDuration: number = 1.0; // 1 second jump
  
  enter(character: GameCharacter): void {
    console.log('Character jumped!');
    character.setVelocity(character.getVelocity().x, -8); // Initial jump velocity
    character.setOnGround(false);
    this.jumpTime = 0;
  }
  
  handleInput(character: GameCharacter, input: string): void {
    switch (input) {
      case 'attack':
        // TODO: Air attack
        if (character.getAttackCooldown() <= 0) {
          character.changeState(new AttackingState());
        }
        break;
      // Can't change to other states while jumping
    }
  }
  
  update(character: GameCharacter, deltaTime: number): void {
    this.jumpTime += deltaTime;
    
    // Apply gravity
    const vel = character.getVelocity();
    character.setVelocity(vel.x, vel.y + 9.8 * deltaTime); // Gravity
    
    // Update position
    const pos = character.getPosition();
    character.setPosition(pos.x + vel.x * deltaTime, pos.y + vel.y * deltaTime);
    
    // Check if landed (simplified - just use timer)
    if (this.jumpTime >= this.jumpDuration) {
      character.setOnGround(true);
      character.setPosition(pos.x, 0); // Ground level
      character.changeState(new IdleState());
    }
  }
  
  exit(character: GameCharacter): void {
    console.log('Character landed');
    character.setVelocity(character.getVelocity().x, 0);
  }
  
  getStateName(): string {
    return 'Jumping';
  }
}

// TODO: Implement AttackingState
class AttackingState implements CharacterState {
  private attackTime: number = 0;
  private readonly attackDuration: number = 0.5; // 0.5 second attack
  
  enter(character: GameCharacter): void {
    console.log('Character attacks!');
    character.setVelocity(0, character.getVelocity().y); // Stop horizontal movement
    character.setAttackCooldown(2.0); // 2 second cooldown
    this.attackTime = 0;
  }
  
  handleInput(character: GameCharacter, input: string): void {
    // Can't change states during attack animation
  }
  
  update(character: GameCharacter, deltaTime: number): void {
    this.attackTime += deltaTime;
    
    // Attack animation complete
    if (this.attackTime >= this.attackDuration) {
      // Return to previous state or idle
      if (character.isCharacterOnGround()) {
        character.changeState(new IdleState());
      } else {
        character.changeState(new JumpingState());
      }
    }
  }
  
  exit(character: GameCharacter): void {
    console.log('Attack finished');
  }
  
  getStateName(): string {
    return 'Attacking';
  }
}

// Usage example
console.log('=== Game Character State Machine ===');
const character = new GameCharacter(new IdleState());

console.log(character.getStatus());

// Simulate game loop
let time = 0;
const inputs = ['move', 'jump', 'attack', 'stop'];

for (let i = 0; i < 10; i++) {
  // Random input every 2 seconds
  if (i % 2 === 0 && i < inputs.length * 2) {
    const input = inputs[Math.floor(i / 2)];
    console.log(\`Input: \${input}\`);
    character.handleInput(input);
  }
  
  // Update with 0.5 second delta time
  character.update(0.5);
  time += 0.5;
  
  console.log(\`Time: \${time}s - \${character.getStatus()}\`);
  console.log('---');
}`,
        hints: [
          'Character states define available actions',
          'State transitions based on inputs and conditions',
          'Different behavior per state'
        ]
      },
      {
        id: 'order-tracking',
        title: '📦 Order Tracking',
        description: 'Model order states (pending, processing, shipped, delivered)',
        difficulty: 'beginner',
        type: 'implement',
        points: 280,
        hints: [
          'Order progresses through defined states',
          'State determines allowed operations',
          'State-specific validation and actions'
        ]
      },
      {
        id: 'traffic-light',
        title: '🚦 Traffic Light',
        description: 'Create traffic light state machine',
        difficulty: 'beginner',
        type: 'implement',
        points: 200,
        hints: [
          'States for red, yellow, green lights',
          'Timed transitions between states',
          'Different duration per state'
        ]
      },
      {
        id: 'phone-call-states',
        title: '📱 Phone Call States',
        description: 'Model phone call states (idle, dialing, connected, busy)',
        difficulty: 'intermediate',
        type: 'implement',
        points: 300,
        hints: [
          'Call states determine available actions',
          'State transitions on user input and events',
          'Handle call failures and disconnections'
        ]
      }
    ]
  },
  {
    id: 'template-method',
    name: 'Template Method',
    category: 'behavioral',
    description: 'Defines skeleton of algorithm, subclasses fill in details',
    difficulty: 'intermediate',
    lessonFile: 'lessons/behavioral/template-method.md',
    challenges: [
      {
        id: 'house-construction',
        title: '🏠 House Construction',
        description: 'Define building steps, customize implementation details',
        difficulty: 'intermediate',
        type: 'implement',
        points: 300,
        hints: [
          'Template defines construction sequence',
          'Subclasses implement specific building steps',
          'Common structure with customizable details'
        ]
      },
      {
        id: 'recipe-framework',
        title: '🍳 Recipe Framework',
        description: 'Create cooking recipes with customizable steps',
        difficulty: 'beginner',
        type: 'implement',
        points: 250,
        hints: [
          'Recipe template defines cooking process',
          'Specific recipes customize ingredients and methods',
          'Common cooking steps with variations'
        ]
      },
      {
        id: 'report-generator',
        title: '📊 Report Generator',
        description: 'Generate different reports with same structure',
        difficulty: 'intermediate',
        type: 'implement',
        points: 320,
        hints: [
          'Report template defines sections and format',
          'Specific reports provide data and styling',
          'Consistent report structure across types'
        ]
      },
      {
        id: 'game-level-framework',
        title: '🎮 Game Level Framework',
        description: 'Create level progression template with variations',
        difficulty: 'advanced',
        type: 'implement',
        points: 380,
        hints: [
          'Level template defines progression structure',
          'Specific levels customize challenges and rewards',
          'Consistent gameplay flow with unique content'
        ]
      }
    ]
  },
  {
    id: 'visitor',
    name: 'Visitor',
    category: 'behavioral',
    description: 'Separates algorithms from objects they operate on',
    difficulty: 'advanced',
    lessonFile: 'lessons/behavioral/visitor.md',
    challenges: [
      {
        id: 'syntax-tree-walker',
        title: '🌳 Syntax Tree Walker',
        description: 'Traverse and process abstract syntax trees',
        difficulty: 'advanced',
        type: 'implement',
        points: 450,
        hints: [
          'AST nodes accept different visitor types',
          'Visitors implement operations (compile, format, analyze)',
          'Add new operations without modifying AST nodes'
        ]
      },
      {
        id: 'file-system-visitor',
        title: '📁 File System Visitor',
        description: 'Perform operations on file hierarchies',
        difficulty: 'advanced',
        type: 'implement',
        points: 400,
        hints: [
          'File system elements accept visitors',
          'Visitors perform operations (size calculation, search, backup)',
          'Add new operations without changing file structure'
        ]
      },
      {
        id: 'shopping-cart-calculator',
        title: '🛒 Shopping Cart Calculator',
        description: 'Calculate totals, taxes, discounts using visitors',
        difficulty: 'intermediate',
        type: 'implement',
        points: 350,
        hints: [
          'Cart items accept calculation visitors',
          'Different visitors for tax, discount, shipping',
          'Complex calculations without modifying items'
        ]
      },
      {
        id: 'graphics-renderer',
        title: '🎨 Graphics Renderer',
        description: 'Render different shapes using visitor pattern',
        difficulty: 'advanced',
        type: 'implement',
        points: 420,
        hints: [
          'Shape objects accept rendering visitors',
          'Different renderers (SVG, Canvas, PDF)',
          'Add new rendering formats without changing shapes'
        ]
      }
    ]
  }
];