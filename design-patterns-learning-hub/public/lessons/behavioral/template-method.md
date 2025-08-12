# Template Method Pattern

## Overview
The Template Method pattern defines the skeleton of an algorithm in a base class, letting subclasses override specific steps without changing the algorithm's structure. It's a behavioral pattern that promotes code reuse while allowing customization.

## When to Use
- When you have multiple classes with similar algorithms that differ only in certain steps
- When you want to control the extension points of an algorithm
- When you want to avoid code duplication in similar algorithms
- When you need to enforce a specific sequence of operations

## Structure
```
┌─────────────────┐
│ AbstractClass   │
├─────────────────┤
│ + templateMethod()│◄─── defines algorithm skeleton
│ + step1()       │
│ # step2()       │◄─── abstract methods
│ # step3()       │
│ + hook()        │◄─── optional hooks
└─────────────────┘
         △
         │
┌─────────────────┐
│ ConcreteClass   │
├─────────────────┤
│ + step2()       │◄─── implements abstract steps
│ + step3()       │
│ + hook()        │◄─── optionally overrides hooks
└─────────────────┘
```

## Implementation Examples

### JavaScript/TypeScript - Data Processing Pipeline
```javascript
// Abstract class defining template method
abstract class DataProcessor {
  // Template method - defines the algorithm skeleton
  public processData(input: any[]): any[] {
    console.log('🚀 Starting data processing pipeline...');
    
    // Step 1: Validate input
    if (!this.validateInput(input)) {
      throw new Error('Invalid input data');
    }
    
    // Step 2: Load data (hook method)
    const loadedData = this.loadData(input);
    
    // Step 3: Transform data (abstract method)
    const transformedData = this.transformData(loadedData);
    
    // Step 4: Validate output (hook method)
    if (this.shouldValidateOutput()) {
      this.validateOutput(transformedData);
    }
    
    // Step 5: Save data (abstract method)
    const savedData = this.saveData(transformedData);
    
    // Step 6: Cleanup (hook method)
    this.cleanup();
    
    console.log('✅ Data processing completed');
    return savedData;
  }
  
  // Concrete method - same for all subclasses
  private validateInput(input: any[]): boolean {
    console.log('🔍 Validating input data...');
    return Array.isArray(input) && input.length > 0;
  }
  
  // Hook methods - can be overridden by subclasses
  protected loadData(input: any[]): any[] {
    console.log('📥 Loading data (default implementation)...');
    return input;
  }
  
  protected shouldValidateOutput(): boolean {
    return true; // Default: validate output
  }
  
  protected validateOutput(data: any[]): void {
    console.log('🔍 Validating output data...');
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Invalid output data');
    }
  }
  
  protected cleanup(): void {
    console.log('🧹 Cleaning up resources...');
  }
  
  // Abstract methods - must be implemented by subclasses
  protected abstract transformData(data: any[]): any[];
  protected abstract saveData(data: any[]): any[];
}

// Concrete implementation for CSV processing
class CSVProcessor extends DataProcessor {
  private outputPath: string;
  
  constructor(outputPath: string) {
    super();
    this.outputPath = outputPath;
  }
  
  protected loadData(input: any[]): any[] {
    console.log('📄 Loading CSV data with special parsing...');
    // Simulate CSV-specific loading logic
    return input.map(row => {
      if (typeof row === 'string') {
        return row.split(',').map(cell => cell.trim());
      }
      return row;
    });
  }
  
  protected transformData(data: any[]): any[] {
    console.log('🔄 Transforming CSV data...');
    return data.map(row => {
      if (Array.isArray(row)) {
        // Convert to object with headers
        return {
          id: row[0] || '',
          name: row[1] || '',
          value: parseFloat(row[2]) || 0
        };
      }
      return row;
    });
  }
  
  protected saveData(data: any[]): any[] {
    console.log(`💾 Saving CSV data to ${this.outputPath}...`);
    // Simulate saving to CSV file
    const csvContent = data.map(obj => 
      `${obj.id},${obj.name},${obj.value}`
    ).join('\\n');
    console.log('CSV Content (first 100 chars):', csvContent.substring(0, 100));
    return data;
  }
  
  protected cleanup(): void {
    console.log('🧹 Cleaning up CSV processing resources...');
    // CSV-specific cleanup
  }
}

// Concrete implementation for JSON processing
class JSONProcessor extends DataProcessor {
  private apiEndpoint: string;
  
  constructor(apiEndpoint: string) {
    super();
    this.apiEndpoint = apiEndpoint;
  }
  
  protected loadData(input: any[]): any[] {
    console.log('📡 Loading JSON data with API preprocessing...');
    return input.filter(item => item !== null && item !== undefined);
  }
  
  protected transformData(data: any[]): any[] {
    console.log('🔄 Transforming JSON data...');
    return data.map(item => {
      return {
        ...item,
        processedAt: new Date().toISOString(),
        version: '1.0'
      };
    });
  }
  
  protected saveData(data: any[]): any[] {
    console.log(`💾 Sending JSON data to ${this.apiEndpoint}...`);
    // Simulate API call
    console.log('JSON Payload:', JSON.stringify(data.slice(0, 2), null, 2));
    return data;
  }
  
  protected shouldValidateOutput(): boolean {
    return false; // Skip validation for JSON processor
  }
  
  protected cleanup(): void {
    console.log('🧹 Closing API connections...');
  }
}

// Concrete implementation for database processing
class DatabaseProcessor extends DataProcessor {
  private connectionString: string;
  private batchSize: number;
  
  constructor(connectionString: string, batchSize: number = 100) {
    super();
    this.connectionString = connectionString;
    this.batchSize = batchSize;
  }
  
  protected transformData(data: any[]): any[] {
    console.log('🔄 Transforming data for database insertion...');
    return data.map(item => {
      // Sanitize data for database
      return {
        ...item,
        createdAt: new Date(),
        sanitized: true
      };
    });
  }
  
  protected saveData(data: any[]): any[] {
    console.log(`💾 Saving to database: ${this.connectionString}...`);
    
    // Process in batches
    for (let i = 0; i < data.length; i += this.batchSize) {
      const batch = data.slice(i, i + this.batchSize);
      console.log(`  Batch ${Math.floor(i/this.batchSize) + 1}: ${batch.length} records`);
    }
    
    return data;
  }
  
  protected validateOutput(data: any[]): void {
    super.validateOutput(data);
    console.log('🔍 Performing database-specific validation...');
    
    // Check for required fields
    const invalidRecords = data.filter(record => !record.createdAt);
    if (invalidRecords.length > 0) {
      throw new Error(`${invalidRecords.length} records missing required fields`);
    }
  }
  
  protected cleanup(): void {
    console.log('🧹 Closing database connections...');
  }
}

// Usage
console.log('=== Template Method Pattern Demo ===');

// Sample data
const sampleData = [
  '001,John Doe,1500.50',
  '002,Jane Smith,2300.75',
  '003,Bob Johnson,1800.25'
];

console.log('\\n=== CSV Processing ===');
const csvProcessor = new CSVProcessor('./output.csv');
const csvResult = csvProcessor.processData(sampleData);

console.log('\\n=== JSON Processing ===');
const jsonData = [
  { id: '001', name: 'John Doe', salary: 1500.50 },
  { id: '002', name: 'Jane Smith', salary: 2300.75 }
];
const jsonProcessor = new JSONProcessor('https://api.example.com/employees');
const jsonResult = jsonProcessor.processData(jsonData);

console.log('\\n=== Database Processing ===');
const dbProcessor = new DatabaseProcessor('postgresql://localhost:5432/employees', 50);
const dbResult = dbProcessor.processData(jsonData);
```

### Python - Testing Framework
```python
from abc import ABC, abstractmethod
import time
from typing import Any, List, Dict, Optional
from enum import Enum

class TestResult(Enum):
    PASS = \"pass\"
    FAIL = \"fail\"
    SKIP = \"skip\"
    ERROR = \"error\"

class TestCase:
    def __init__(self, name: str, description: str = \"\"):
        self.name = name
        self.description = description
        self.result = TestResult.SKIP
        self.error_message = \"\"
        self.execution_time = 0.0
        self.setup_time = 0.0
        self.cleanup_time = 0.0

# Abstract test runner - defines template method
class TestRunner(ABC):
    def __init__(self, name: str):
        self.name = name
        self.test_cases: List[TestCase] = []
        self.total_tests = 0
        self.passed_tests = 0
        self.failed_tests = 0
        self.skipped_tests = 0
        self.error_tests = 0
        self.total_execution_time = 0.0
    
    # Template method - defines the testing algorithm
    def run_tests(self, test_cases: List[TestCase]) -> Dict[str, Any]:
        print(f\"🏃 Starting {self.name} test runner...\")
        
        start_time = time.time()
        
        # Step 1: Initialize test environment
        self.initialize_environment()
        
        # Step 2: Pre-test setup (hook)
        self.pre_test_setup()
        
        # Step 3: Run each test
        for test_case in test_cases:
            self.run_single_test(test_case)
        
        # Step 4: Post-test cleanup (hook) 
        self.post_test_cleanup()
        
        # Step 5: Generate report
        self.total_execution_time = time.time() - start_time
        report = self.generate_report()
        
        # Step 6: Cleanup environment
        self.cleanup_environment()
        
        print(f\"✅ {self.name} test run completed\")
        return report
    
    def run_single_test(self, test_case: TestCase):
        print(f\"  🧪 Running: {test_case.name}\")
        
        try:
            # Step 1: Test-specific setup
            setup_start = time.time()
            self.setup_test(test_case)
            test_case.setup_time = time.time() - setup_start
            
            # Step 2: Execute test (abstract method)
            execution_start = time.time()
            success = self.execute_test(test_case)
            test_case.execution_time = time.time() - execution_start
            
            # Step 3: Validate results (abstract method)
            if success and self.validate_test_result(test_case):
                test_case.result = TestResult.PASS
                self.passed_tests += 1
                print(f\"    ✅ PASS: {test_case.name}\")
            else:
                test_case.result = TestResult.FAIL
                self.failed_tests += 1
                print(f\"    ❌ FAIL: {test_case.name}\")
            
        except Exception as e:
            test_case.result = TestResult.ERROR
            test_case.error_message = str(e)
            self.error_tests += 1
            print(f\"    💥 ERROR: {test_case.name} - {e}\")
        
        finally:
            # Step 4: Test-specific cleanup
            cleanup_start = time.time()
            self.cleanup_test(test_case)
            test_case.cleanup_time = time.time() - cleanup_start
            
            self.test_cases.append(test_case)
            self.total_tests += 1
    
    # Concrete methods - same for all subclasses
    def initialize_environment(self):
        print(\"🔧 Initializing test environment...\")
        self.total_tests = 0
        self.passed_tests = 0
        self.failed_tests = 0
        self.skipped_tests = 0
        self.error_tests = 0
    
    def cleanup_environment(self):
        print(\"🧹 Cleaning up test environment...\")
    
    def generate_report(self) -> Dict[str, Any]:
        print(\"📊 Generating test report...\")
        return {
            'runner': self.name,
            'total': self.total_tests,
            'passed': self.passed_tests,
            'failed': self.failed_tests,
            'errors': self.error_tests,
            'skipped': self.skipped_tests,
            'execution_time': self.total_execution_time,
            'test_cases': [(tc.name, tc.result.value, tc.execution_time) for tc in self.test_cases]
        }
    
    # Hook methods - can be overridden by subclasses
    def pre_test_setup(self):
        print(\"⚙️  Pre-test setup (default)\")
    
    def post_test_cleanup(self):
        print(\"🧽 Post-test cleanup (default)\")
    
    def setup_test(self, test_case: TestCase):
        pass  # Default: no setup
    
    def cleanup_test(self, test_case: TestCase):
        pass  # Default: no cleanup
    
    # Abstract methods - must be implemented by subclasses
    @abstractmethod
    def execute_test(self, test_case: TestCase) -> bool:
        pass
    
    @abstractmethod
    def validate_test_result(self, test_case: TestCase) -> bool:
        pass

# Concrete implementation for unit tests
class UnitTestRunner(TestRunner):
    def __init__(self):
        super().__init__(\"Unit Test\")
        self.mock_objects = []
    
    def pre_test_setup(self):
        print(\"⚙️  Unit test setup: initializing mocks...\")
        self.mock_objects = [\"MockDatabase\", \"MockAPI\", \"MockFileSystem\"]
    
    def setup_test(self, test_case: TestCase):
        print(f\"    🔧 Setting up mocks for {test_case.name}\")
    
    def execute_test(self, test_case: TestCase) -> bool:
        print(f\"    🔬 Executing unit test: {test_case.name}\")
        
        # Simulate unit test execution
        import random
        time.sleep(0.1)  # Simulate fast unit test
        
        # Simulate some tests failing
        return not (\"fail\" in test_case.name.lower())
    
    def validate_test_result(self, test_case: TestCase) -> bool:
        print(f\"    🔍 Validating unit test result for {test_case.name}\")
        # Unit tests have simple pass/fail validation
        return True
    
    def cleanup_test(self, test_case: TestCase):
        print(f\"    🧹 Cleaning up mocks for {test_case.name}\")
    
    def post_test_cleanup(self):
        print(\"🧽 Unit test cleanup: destroying mocks...\")
        self.mock_objects.clear()

# Concrete implementation for integration tests
class IntegrationTestRunner(TestRunner):
    def __init__(self):
        super().__init__(\"Integration Test\")
        self.database_connection = None
        self.test_data = []
    
    def pre_test_setup(self):
        print(\"⚙️  Integration test setup: connecting to test database...\")
        self.database_connection = \"TestDB_Connection\"
        self.test_data = [\"test_record_1\", \"test_record_2\"]
    
    def setup_test(self, test_case: TestCase):
        print(f\"    🗄️  Setting up test data for {test_case.name}\")
        # Create test database records
    
    def execute_test(self, test_case: TestCase) -> bool:
        print(f\"    🔗 Executing integration test: {test_case.name}\")
        
        # Simulate integration test execution (slower)
        time.sleep(0.3)
        
        # Simulate some tests failing
        return not (\"fail\" in test_case.name.lower() or \"error\" in test_case.name.lower())
    
    def validate_test_result(self, test_case: TestCase) -> bool:
        print(f\"    🔍 Validating integration test result for {test_case.name}\")
        
        # Integration tests have more complex validation
        if \"database\" in test_case.name.lower():
            print(\"    📊 Checking database state...\")
        if \"api\" in test_case.name.lower():
            print(\"    🌐 Validating API responses...\")
        
        return True
    
    def cleanup_test(self, test_case: TestCase):
        print(f\"    🧹 Cleaning up test data for {test_case.name}\")
        # Remove test database records
    
    def post_test_cleanup(self):
        print(\"🧽 Integration test cleanup: closing database connection...\")
        self.database_connection = None
        self.test_data.clear()

# Concrete implementation for performance tests
class PerformanceTestRunner(TestRunner):
    def __init__(self):
        super().__init__(\"Performance Test\")
        self.performance_thresholds = {
            \"response_time\": 1.0,  # 1 second
            \"throughput\": 1000     # 1000 requests/second
        }
        self.load_generator = None
    
    def pre_test_setup(self):
        print(\"⚙️  Performance test setup: initializing load generator...\")
        self.load_generator = \"LoadGenerator_v2\"
    
    def setup_test(self, test_case: TestCase):
        print(f\"    📈 Setting up performance monitoring for {test_case.name}\")
    
    def execute_test(self, test_case: TestCase) -> bool:
        print(f\"    🚀 Executing performance test: {test_case.name}\")
        
        # Simulate performance test execution (longer)
        time.sleep(0.5)
        
        # Simulate performance results
        import random
        response_time = random.uniform(0.5, 1.5)
        test_case.response_time = response_time
        
        return response_time <= self.performance_thresholds[\"response_time\"]
    
    def validate_test_result(self, test_case: TestCase) -> bool:
        print(f\"    🔍 Validating performance metrics for {test_case.name}\")
        
        # Check if performance meets thresholds
        if hasattr(test_case, 'response_time'):
            if test_case.response_time > self.performance_thresholds[\"response_time\"]:
                test_case.error_message = f\"Response time {test_case.response_time:.2f}s exceeds threshold\"
                return False
        
        return True
    
    def cleanup_test(self, test_case: TestCase):
        print(f\"    🧹 Stopping performance monitoring for {test_case.name}\")
    
    def post_test_cleanup(self):
        print(\"🧽 Performance test cleanup: shutting down load generator...\")
        self.load_generator = None

# Usage
def demonstrate_template_method():
    print(\"=== Template Method Pattern - Testing Framework ===\")
    
    # Create test cases
    test_cases = [
        TestCase(\"test_user_login\", \"Test user authentication\"),
        TestCase(\"test_data_validation\", \"Test input validation\"),
        TestCase(\"test_api_response\", \"Test API response format\"),
        TestCase(\"test_database_connection\", \"Test database connectivity\"),
        TestCase(\"test_fail_scenario\", \"This test should fail\"),
        TestCase(\"test_error_handling\", \"This test should error\")
    ]
    
    # Run with different test runners
    runners = [
        UnitTestRunner(),
        IntegrationTestRunner(), 
        PerformanceTestRunner()
    ]
    
    results = []
    
    for runner in runners:
        print(f\"\\n{'='*50}\")
        result = runner.run_tests(test_cases.copy())
        results.append(result)
        
        print(f\"\\n📋 {result['runner']} Summary:\")
        print(f\"  Total: {result['total']}\")
        print(f\"  Passed: {result['passed']}\")
        print(f\"  Failed: {result['failed']}\")
        print(f\"  Errors: {result['errors']}\")
        print(f\"  Time: {result['execution_time']:.2f}s\")
    
    print(f\"\\n{'='*50}\")
    print(\"🏆 Overall Test Results:\")
    for result in results:
        success_rate = (result['passed'] / result['total']) * 100 if result['total'] > 0 else 0
        print(f\"  {result['runner']}: {success_rate:.1f}% success rate\")

if __name__ == \"__main__\":
    demonstrate_template_method()
```

## Template Method vs Strategy

### Template Method
- **Inheritance-based**: Uses inheritance to vary parts of algorithm
- **Static**: Algorithm structure fixed at compile time
- **Control**: Parent class controls the algorithm flow

### Strategy
- **Composition-based**: Uses composition to swap entire algorithms
- **Dynamic**: Can change algorithms at runtime
- **Control**: Client controls which algorithm to use

```javascript
// Template Method - inheritance
abstract class DataProcessor {
  process(data) {
    this.validate(data);    // same for all
    this.transform(data);   // varies by subclass
    this.save(data);        // varies by subclass
  }
  abstract transform(data);
  abstract save(data);
}

// Strategy - composition
class DataProcessor {
  constructor(transformStrategy, saveStrategy) {
    this.transformStrategy = transformStrategy;
    this.saveStrategy = saveStrategy;
  }
  
  process(data) {
    this.validate(data);
    this.transformStrategy.transform(data);
    this.saveStrategy.save(data);
  }
}
```

## Pros and Cons

### Advantages
- Eliminates code duplication
- Allows subclasses to override only specific parts
- Framework controls the algorithm structure
- Follows Hollywood Principle (\"Don't call us, we'll call you\")
- Easy to add new variations

### Disadvantages
- Can lead to complex inheritance hierarchies
- Liskov Substitution Principle violations if not careful
- Can be restrictive - clients must follow the template
- Difficult to change algorithm structure

## Real-World Examples
- Frameworks (Spring, Django, etc.)
- Testing frameworks (JUnit, pytest)
- Data processing pipelines
- Build systems (Maven, Gradle)
- Game AI behavior trees
- Document generators
- Web application lifecycles

## Common Use Cases
- Framework development
- Multi-step algorithms with variations
- Data processing workflows
- Application lifecycles
- Code generation tools
- Plugin architectures
- Batch processing systems