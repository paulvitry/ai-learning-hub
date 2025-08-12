# Visitor Pattern

## Overview
The Visitor pattern allows you to define new operations on objects without changing their classes. It separates algorithms from the object structure by moving the operations into separate visitor classes.

## When to Use
- When you need to perform operations on objects of different types
- When you want to add new operations without modifying existing classes
- When you have a stable object structure but frequently changing operations
- When you need to perform complex operations that don't belong in the object classes

## Structure
```
┌─────────────────┐
│     Client      │
└─────────────────┘
         │
         │ uses
         ▼
┌─────────────────┐      ┌─────────────────┐
│    Visitor      │      │    Element      │
├─────────────────┤      ├─────────────────┤
│ + visitA()      │      │ + accept()      │
│ + visitB()      │      └─────────────────┘
└─────────────────┘               △
         △                        │
         │                        │
┌─────────────────┐      ┌─────────────────┐
│ConcreteVisitorA │      │  ConcreteA      │
├─────────────────┤      ├─────────────────┤
│ + visitA()      │◄────►│ + accept()      │
│ + visitB()      │      │ + operationA()  │
└─────────────────┘      └─────────────────┘
                                  △
┌─────────────────┐               │
│ConcreteVisitorB │      ┌─────────────────┐
├─────────────────┤      │  ConcreteB      │
│ + visitA()      │◄────►│ + accept()      │
│ + visitB()      │      │ + operationB()  │
└─────────────────┘      └─────────────────┘
```

## Implementation Examples

### JavaScript/TypeScript - File System Operations
```javascript
// Visitor interface
interface FileSystemVisitor {
  visitFile(file: File): void;
  visitDirectory(directory: Directory): void;
  visitSymbolicLink(symlink: SymbolicLink): void;
}

// Element interface
interface FileSystemElement {
  accept(visitor: FileSystemVisitor): void;
  getName(): string;
  getSize(): number;
}

// Concrete elements
class File implements FileSystemElement {
  constructor(
    private name: string,
    private size: number,
    private extension: string,
    private content: string = ''
  ) {}

  accept(visitor: FileSystemVisitor): void {
    visitor.visitFile(this);
  }

  getName(): string {
    return this.name;
  }

  getSize(): number {
    return this.size;
  }

  getExtension(): string {
    return this.extension;
  }

  getContent(): string {
    return this.content;
  }

  setContent(content: string): void {
    this.content = content;
    this.size = content.length;
  }
}

class Directory implements FileSystemElement {
  private children: FileSystemElement[] = [];

  constructor(private name: string) {}

  accept(visitor: FileSystemVisitor): void {
    visitor.visitDirectory(this);
  }

  getName(): string {
    return this.name;
  }

  getSize(): number {
    return this.children.reduce((total, child) => total + child.getSize(), 0);
  }

  addChild(element: FileSystemElement): void {
    this.children.push(element);
  }

  getChildren(): FileSystemElement[] {
    return [...this.children];
  }

  removeChild(element: FileSystemElement): void {
    const index = this.children.indexOf(element);
    if (index !== -1) {
      this.children.splice(index, 1);
    }
  }
}

class SymbolicLink implements FileSystemElement {
  constructor(
    private name: string,
    private target: FileSystemElement
  ) {}

  accept(visitor: FileSystemVisitor): void {
    visitor.visitSymbolicLink(this);
  }

  getName(): string {
    return this.name;
  }

  getSize(): number {
    return this.target.getSize();
  }

  getTarget(): FileSystemElement {
    return this.target;
  }
}

// Concrete visitors
class FileSizeCalculatorVisitor implements FileSystemVisitor {
  private totalSize: number = 0;
  private fileCount: number = 0;
  private directoryCount: number = 0;
  private symlinkCount: number = 0;

  visitFile(file: File): void {
    this.totalSize += file.getSize();
    this.fileCount++;
    console.log(`📄 File: ${file.getName()} (${file.getSize()} bytes)`);
  }

  visitDirectory(directory: Directory): void {
    this.directoryCount++;
    console.log(`📁 Directory: ${directory.getName()}`);
    
    // Visit all children
    directory.getChildren().forEach(child => {
      child.accept(this);
    });
  }

  visitSymbolicLink(symlink: SymbolicLink): void {
    this.symlinkCount++;
    console.log(`🔗 Symlink: ${symlink.getName()} -> ${symlink.getTarget().getName()}`);
    // Don't count symlink target size to avoid double counting
  }

  getReport(): string {
    return `File System Report:
  Total Size: ${this.totalSize} bytes (${(this.totalSize / 1024).toFixed(2)} KB)
  Files: ${this.fileCount}
  Directories: ${this.directoryCount}
  Symbolic Links: ${this.symlinkCount}`;
  }

  reset(): void {
    this.totalSize = 0;
    this.fileCount = 0;
    this.directoryCount = 0;
    this.symlinkCount = 0;
  }
}

class SearchVisitor implements FileSystemVisitor {
  private results: FileSystemElement[] = [];
  
  constructor(private searchTerm: string) {}

  visitFile(file: File): void {
    if (file.getName().toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        file.getContent().toLowerCase().includes(this.searchTerm.toLowerCase())) {
      this.results.push(file);
      console.log(`🔍 Found in file: ${file.getName()}`);
    }
  }

  visitDirectory(directory: Directory): void {
    if (directory.getName().toLowerCase().includes(this.searchTerm.toLowerCase())) {
      this.results.push(directory);
      console.log(`🔍 Found directory: ${directory.getName()}`);
    }
    
    // Continue searching in children
    directory.getChildren().forEach(child => {
      child.accept(this);
    });
  }

  visitSymbolicLink(symlink: SymbolicLink): void {
    if (symlink.getName().toLowerCase().includes(this.searchTerm.toLowerCase())) {
      this.results.push(symlink);
      console.log(`🔍 Found symlink: ${symlink.getName()}`);
    }
  }

  getResults(): FileSystemElement[] {
    return [...this.results];
  }

  reset(): void {
    this.results = [];
  }
}

class BackupVisitor implements FileSystemVisitor {
  private backedUpFiles: string[] = [];
  private skippedFiles: string[] = [];
  
  constructor(
    private backupPath: string,
    private includeExtensions: string[] = []
  ) {}

  visitFile(file: File): void {
    if (this.shouldBackup(file)) {
      const backupLocation = `${this.backupPath}/${file.getName()}`;
      console.log(`💾 Backing up: ${file.getName()} -> ${backupLocation}`);
      this.backedUpFiles.push(file.getName());
      
      // Simulate backup process
      this.simulateBackup(file, backupLocation);
    } else {
      console.log(`⏭️ Skipping: ${file.getName()} (not in backup criteria)`);
      this.skippedFiles.push(file.getName());
    }
  }

  visitDirectory(directory: Directory): void {
    const backupLocation = `${this.backupPath}/${directory.getName()}`;
    console.log(`📁 Creating backup directory: ${backupLocation}`);
    
    // Backup all children
    directory.getChildren().forEach(child => {
      child.accept(this);
    });
  }

  visitSymbolicLink(symlink: SymbolicLink): void {
    console.log(`🔗 Backing up symlink: ${symlink.getName()}`);
    // In real implementation, would recreate symlink in backup location
  }

  private shouldBackup(file: File): boolean {
    if (this.includeExtensions.length === 0) {
      return true; // Backup all files if no filter specified
    }
    return this.includeExtensions.includes(file.getExtension());
  }

  private simulateBackup(file: File, destination: string): void {
    // Simulate file copy operation
    console.log(`  📋 Copying ${file.getSize()} bytes...`);
  }

  getBackupSummary(): string {
    return `Backup Summary:
  Backed up files: ${this.backedUpFiles.length}
  Skipped files: ${this.skippedFiles.length}
  Files: ${this.backedUpFiles.join(', ')}`;
  }
}

class SecurityScanVisitor implements FileSystemVisitor {
  private threats: { element: FileSystemElement; threat: string; severity: 'low' | 'medium' | 'high' }[] = [];
  private scannedCount: number = 0;

  visitFile(file: File): void {
    this.scannedCount++;
    console.log(`🔒 Scanning file: ${file.getName()}`);
    
    // Simulate security scanning
    this.scanForThreats(file);
  }

  visitDirectory(directory: Directory): void {
    console.log(`🔒 Scanning directory: ${directory.getName()}`);
    
    // Check directory permissions
    this.checkDirectoryPermissions(directory);
    
    // Scan all children
    directory.getChildren().forEach(child => {
      child.accept(this);
    });
  }

  visitSymbolicLink(symlink: SymbolicLink): void {
    console.log(`🔒 Scanning symlink: ${symlink.getName()}`);
    
    // Check if symlink points to sensitive location
    this.checkSymlinkSecurity(symlink);
  }

  private scanForThreats(file: File): void {
    const content = file.getContent().toLowerCase();
    const fileName = file.getName().toLowerCase();
    
    // Check for suspicious file extensions
    const suspiciousExtensions = ['.exe', '.bat', '.sh', '.ps1'];
    if (suspiciousExtensions.some(ext => fileName.endsWith(ext))) {
      this.threats.push({
        element: file,
        threat: 'Potentially executable file',
        severity: 'medium'
      });
    }
    
    // Check for suspicious content
    const suspiciousPatterns = ['password', 'secret', 'token', 'api_key'];
    suspiciousPatterns.forEach(pattern => {
      if (content.includes(pattern)) {
        this.threats.push({
          element: file,
          threat: `Contains suspicious keyword: ${pattern}`,
          severity: 'high'
        });
      }
    });
    
    // Check file size (potential zip bomb)
    if (file.getSize() > 100000) {
      this.threats.push({
        element: file,
        threat: 'Unusually large file size',
        severity: 'low'
      });
    }
  }

  private checkDirectoryPermissions(directory: Directory): void {
    // Simulate permission check
    if (directory.getName().includes('temp') || directory.getName().includes('tmp')) {
      this.threats.push({
        element: directory,
        threat: 'Temporary directory with potential security risk',
        severity: 'low'
      });
    }
  }

  private checkSymlinkSecurity(symlink: SymbolicLink): void {
    // Check if symlink could be used for directory traversal
    const targetName = symlink.getTarget().getName();
    if (targetName.includes('..') || targetName.includes('system')) {
      this.threats.push({
        element: symlink,
        threat: 'Potentially dangerous symlink target',
        severity: 'high'
      });
    }
  }

  getSecurityReport(): string {
    const highThreats = this.threats.filter(t => t.severity === 'high').length;
    const mediumThreats = this.threats.filter(t => t.severity === 'medium').length;
    const lowThreats = this.threats.filter(t => t.severity === 'low').length;
    
    let report = `Security Scan Report:
  Files scanned: ${this.scannedCount}
  Threats found: ${this.threats.length}
  - High severity: ${highThreats}
  - Medium severity: ${mediumThreats}  
  - Low severity: ${lowThreats}
  
  Threat Details:`;
    
    this.threats.forEach((threat, index) => {
      report += `\\n  ${index + 1}. ${threat.element.getName()} - ${threat.threat} [${threat.severity.toUpperCase()}]`;
    });
    
    return report;
  }
}

// Usage
console.log('=== Visitor Pattern - File System Operations ===');

// Create file system structure
const rootDir = new Directory('root');
const documentsDir = new Directory('Documents');
const photosDir = new Directory('Photos');

// Create files
const readme = new File('README.txt', 150, 'txt', 'This is a readme file with important information');
const config = new File('config.json', 250, 'json', '{ \"api_key\": \"secret123\", \"debug\": true }');
const script = new File('backup.sh', 500, 'sh', '#!/bin/bash\\necho \"Running backup...\"');
const photo1 = new File('vacation.jpg', 15000, 'jpg', 'binary image data...');
const photo2 = new File('family.png', 25000, 'png', 'binary image data...');

// Build directory structure
rootDir.addChild(documentsDir);
rootDir.addChild(photosDir);
documentsDir.addChild(readme);
documentsDir.addChild(config);
documentsDir.addChild(script);
photosDir.addChild(photo1);
photosDir.addChild(photo2);

// Create symbolic link
const quickAccess = new SymbolicLink('QuickAccess', documentsDir);
rootDir.addChild(quickAccess);

console.log('\\n=== File Size Calculation ===');
const sizeCalculator = new FileSizeCalculatorVisitor();
rootDir.accept(sizeCalculator);
console.log('\\n' + sizeCalculator.getReport());

console.log('\\n=== Search Operation ===');
const searchVisitor = new SearchVisitor('readme');
rootDir.accept(searchVisitor);
console.log(`\\nSearch results: ${searchVisitor.getResults().length} items found`);

console.log('\\n=== Backup Operation ===');
const backupVisitor = new BackupVisitor('/backup', ['txt', 'json']);
rootDir.accept(backupVisitor);
console.log('\\n' + backupVisitor.getBackupSummary());

console.log('\\n=== Security Scan ===');
const securityVisitor = new SecurityScanVisitor();
rootDir.accept(securityVisitor);
console.log('\\n' + securityVisitor.getSecurityReport());
```

### Python - AST Processing
```python
from abc import ABC, abstractmethod
from typing import Any, List, Dict
import json

# Visitor interface
class ASTVisitor(ABC):
    @abstractmethod
    def visit_number(self, node: 'NumberNode') -> Any:
        pass
    
    @abstractmethod
    def visit_variable(self, node: 'VariableNode') -> Any:
        pass
    
    @abstractmethod
    def visit_binary_op(self, node: 'BinaryOpNode') -> Any:
        pass
    
    @abstractmethod
    def visit_function_call(self, node: 'FunctionCallNode') -> Any:
        pass

# Element interface
class ASTNode(ABC):
    @abstractmethod
    def accept(self, visitor: ASTVisitor) -> Any:
        pass

# Concrete elements
class NumberNode(ASTNode):
    def __init__(self, value: float):
        self.value = value
    
    def accept(self, visitor: ASTVisitor) -> Any:
        return visitor.visit_number(self)
    
    def __str__(self):
        return str(self.value)

class VariableNode(ASTNode):
    def __init__(self, name: str):
        self.name = name
    
    def accept(self, visitor: ASTVisitor) -> Any:
        return visitor.visit_variable(self)
    
    def __str__(self):
        return self.name

class BinaryOpNode(ASTNode):
    def __init__(self, left: ASTNode, operator: str, right: ASTNode):
        self.left = left
        self.operator = operator
        self.right = right
    
    def accept(self, visitor: ASTVisitor) -> Any:
        return visitor.visit_binary_op(self)
    
    def __str__(self):
        return f\"({self.left} {self.operator} {self.right})\"

class FunctionCallNode(ASTNode):
    def __init__(self, function_name: str, arguments: List[ASTNode]):
        self.function_name = function_name
        self.arguments = arguments
    
    def accept(self, visitor: ASTVisitor) -> Any:
        return visitor.visit_function_call(self)
    
    def __str__(self):
        args_str = \", \".join(str(arg) for arg in self.arguments)
        return f\"{self.function_name}({args_str})\"

# Concrete visitors
class EvaluatorVisitor(ASTVisitor):
    def __init__(self, variables: Dict[str, float] = None, functions: Dict[str, callable] = None):
        self.variables = variables or {}
        self.functions = functions or {
            'sin': lambda x: __import__('math').sin(x),
            'cos': lambda x: __import__('math').cos(x),
            'sqrt': lambda x: __import__('math').sqrt(x),
            'abs': abs,
            'max': max,
            'min': min
        }
    
    def visit_number(self, node: NumberNode) -> float:
        return node.value
    
    def visit_variable(self, node: VariableNode) -> float:
        if node.name not in self.variables:
            raise ValueError(f\"Undefined variable: {node.name}\")
        return self.variables[node.name]
    
    def visit_binary_op(self, node: BinaryOpNode) -> float:
        left_val = node.left.accept(self)
        right_val = node.right.accept(self)
        
        operators = {
            '+': lambda a, b: a + b,
            '-': lambda a, b: a - b,
            '*': lambda a, b: a * b,
            '/': lambda a, b: a / b if b != 0 else float('inf'),
            '^': lambda a, b: a ** b,
            '%': lambda a, b: a % b
        }
        
        if node.operator not in operators:
            raise ValueError(f\"Unknown operator: {node.operator}\")
        
        return operators[node.operator](left_val, right_val)
    
    def visit_function_call(self, node: FunctionCallNode) -> float:
        if node.function_name not in self.functions:
            raise ValueError(f\"Unknown function: {node.function_name}\")
        
        arg_values = [arg.accept(self) for arg in node.arguments]
        return self.functions[node.function_name](*arg_values)

class PrettyPrinterVisitor(ASTVisitor):
    def __init__(self, indent: int = 0):
        self.indent = indent
    
    def _get_indent(self) -> str:
        return \"  \" * self.indent
    
    def visit_number(self, node: NumberNode) -> str:
        return f\"{self._get_indent()}Number: {node.value}\"
    
    def visit_variable(self, node: VariableNode) -> str:
        return f\"{self._get_indent()}Variable: {node.name}\"
    
    def visit_binary_op(self, node: BinaryOpNode) -> str:
        result = f\"{self._get_indent()}BinaryOp: {node.operator}\\n\"
        
        # Visit children with increased indentation
        child_visitor = PrettyPrinterVisitor(self.indent + 1)
        result += node.left.accept(child_visitor) + \"\\n\"
        result += node.right.accept(child_visitor)
        
        return result
    
    def visit_function_call(self, node: FunctionCallNode) -> str:
        result = f\"{self._get_indent()}FunctionCall: {node.function_name}\\n\"
        
        # Visit arguments with increased indentation
        child_visitor = PrettyPrinterVisitor(self.indent + 1)
        for arg in node.arguments:
            result += child_visitor._get_indent() + \"Argument:\\n\"
            result += arg.accept(PrettyPrinterVisitor(self.indent + 2)) + \"\\n\"
        
        return result.rstrip()

class CodeGeneratorVisitor(ASTVisitor):
    def __init__(self, target_language: str = \"python\"):
        self.target_language = target_language.lower()
    
    def visit_number(self, node: NumberNode) -> str:
        if self.target_language == \"python\":
            return str(node.value)
        elif self.target_language == \"javascript\":
            return str(node.value)
        elif self.target_language == \"c++\":
            return f\"{node.value}\"
        else:
            return str(node.value)
    
    def visit_variable(self, node: VariableNode) -> str:
        return node.name
    
    def visit_binary_op(self, node: BinaryOpNode) -> str:
        left_code = node.left.accept(self)
        right_code = node.right.accept(self)
        
        operator_mapping = {
            \"python\": {'^': '**'},
            \"javascript\": {'^': '**'},
            \"c++\": {'^': 'pow'}
        }
        
        operator = node.operator
        if self.target_language in operator_mapping:
            operator = operator_mapping[self.target_language].get(operator, operator)
        
        if self.target_language == \"c++\" and operator == \"pow\":\n            return f\"pow({left_code}, {right_code})\"\n        else:\n            return f\"({left_code} {operator} {right_code})\"\n    \n    def visit_function_call(self, node: FunctionCallNode) -> str:\n        args_code = [arg.accept(self) for arg in node.arguments]\n        args_str = \", \".join(args_code)\n        \n        function_mapping = {\n            \"python\": {\n                'sin': 'math.sin',\n                'cos': 'math.cos',\n                'sqrt': 'math.sqrt'\n            },\n            \"javascript\": {\n                'sin': 'Math.sin',\n                'cos': 'Math.cos',\n                'sqrt': 'Math.sqrt'\n            },\n            \"c++\": {\n                'sin': 'sin',\n                'cos': 'cos', \n                'sqrt': 'sqrt'\n            }\n        }\n        \n        func_name = node.function_name\n        if self.target_language in function_mapping:\n            func_name = function_mapping[self.target_language].get(func_name, func_name)\n        \n        return f\"{func_name}({args_str})\"\n\nclass OptimizationVisitor(ASTVisitor):\n    \"\"\"Performs basic algebraic optimizations\"\"\"\n    \n    def visit_number(self, node: NumberNode) -> ASTNode:\n        return node  # Numbers are already optimized\n    \n    def visit_variable(self, node: VariableNode) -> ASTNode:\n        return node  # Variables are already optimized\n    \n    def visit_binary_op(self, node: BinaryOpNode) -> ASTNode:\n        # Optimize children first\n        left = node.left.accept(self)\n        right = node.right.accept(self)\n        \n        # Constant folding\n        if isinstance(left, NumberNode) and isinstance(right, NumberNode):\n            evaluator = EvaluatorVisitor()\n            result = BinaryOpNode(left, node.operator, right).accept(evaluator)\n            return NumberNode(result)\n        \n        # Identity operations\n        if node.operator == '+' and isinstance(right, NumberNode) and right.value == 0:\n            return left  # x + 0 = x\n        if node.operator == '+' and isinstance(left, NumberNode) and left.value == 0:\n            return right  # 0 + x = x\n        if node.operator == '*' and isinstance(right, NumberNode) and right.value == 1:\n            return left  # x * 1 = x\n        if node.operator == '*' and isinstance(left, NumberNode) and left.value == 1:\n            return right  # 1 * x = x\n        if node.operator == '*' and ((isinstance(left, NumberNode) and left.value == 0) or \n                                     (isinstance(right, NumberNode) and right.value == 0)):\n            return NumberNode(0)  # x * 0 = 0 or 0 * x = 0\n        \n        return BinaryOpNode(left, node.operator, right)\n    \n    def visit_function_call(self, node: FunctionCallNode) -> ASTNode:\n        # Optimize arguments\n        optimized_args = [arg.accept(self) for arg in node.arguments]\n        return FunctionCallNode(node.function_name, optimized_args)\n\n# Usage\ndef demonstrate_ast_visitor():\n    print(\"=== Visitor Pattern - AST Processing ===\")\n    \n    # Build an AST for: sqrt(x^2 + y^2) * 0 + sin(3.14159)\n    # This represents a somewhat complex expression with optimization opportunities\n    \n    x = VariableNode(\"x\")\n    y = VariableNode(\"y\")\n    \n    # x^2\n    x_squared = BinaryOpNode(x, \"^\", NumberNode(2))\n    \n    # y^2  \n    y_squared = BinaryOpNode(y, \"^\", NumberNode(2))\n    \n    # x^2 + y^2\n    sum_squares = BinaryOpNode(x_squared, \"+\", y_squared)\n    \n    # sqrt(x^2 + y^2)\n    distance = FunctionCallNode(\"sqrt\", [sum_squares])\n    \n    # sqrt(x^2 + y^2) * 0 (this should optimize to 0)\n    multiply_by_zero = BinaryOpNode(distance, \"*\", NumberNode(0))\n    \n    # sin(3.14159)\n    sin_pi = FunctionCallNode(\"sin\", [NumberNode(3.14159)])\n    \n    # Final expression: sqrt(x^2 + y^2) * 0 + sin(3.14159)\n    expression = BinaryOpNode(multiply_by_zero, \"+\", sin_pi)\n    \n    print(\"Original expression:\")\n    print(expression)\n    print()\n    \n    print(\"=== Pretty Printer Visitor ===\")\n    printer = PrettyPrinterVisitor()\n    print(expression.accept(printer))\n    print()\n    \n    print(\"=== Evaluation Visitor ===\")\n    variables = {\"x\": 3.0, \"y\": 4.0}\n    evaluator = EvaluatorVisitor(variables)\n    result = expression.accept(evaluator)\n    print(f\"With x=3, y=4: {result:.6f}\")\n    print()\n    \n    print(\"=== Optimization Visitor ===\")\n    optimizer = OptimizationVisitor()\n    optimized = expression.accept(optimizer)\n    print(\"Optimized expression:\")\n    print(optimized)\n    \n    # Evaluate optimized expression\n    optimized_result = optimized.accept(evaluator)\n    print(f\"Optimized result: {optimized_result:.6f}\")\n    print()\n    \n    print(\"=== Code Generation Visitor ===\")\n    languages = [\"python\", \"javascript\", \"c++\"]\n    \n    for lang in languages:\n        generator = CodeGeneratorVisitor(lang)\n        code = optimized.accept(generator)\n        print(f\"{lang.upper()}: {code}\")\n    \n    print()\n    \n    # Demonstrate with a simpler expression: (x + 1) * (y - 0)\n    simple_expr = BinaryOpNode(\n        BinaryOpNode(VariableNode(\"x\"), \"+\", NumberNode(1)),\n        \"*\", \n        BinaryOpNode(VariableNode(\"y\"), \"-\", NumberNode(0))\n    )\n    \n    print(\"=== Simple Expression Optimization ===\")\n    print(f\"Original: {simple_expr}\")\n    \n    optimized_simple = simple_expr.accept(optimizer)\n    print(f\"Optimized: {optimized_simple}\")\n    \n    # Show the optimization eliminated (y - 0) to just y\n    variables = {\"x\": 5, \"y\": 10}\n    original_result = simple_expr.accept(EvaluatorVisitor(variables))\n    optimized_result = optimized_simple.accept(EvaluatorVisitor(variables))\n    \n    print(f\"Original result (x=5, y=10): {original_result}\")\n    print(f\"Optimized result (x=5, y=10): {optimized_result}\")\n    print(f\"Results match: {original_result == optimized_result}\")\n\nif __name__ == \"__main__\":\n    demonstrate_ast_visitor()\n```\n\n## Pros and Cons\n\n### Advantages\n- Easy to add new operations without modifying existing classes\n- Groups related operations in visitor classes\n- Can accumulate state while traversing object structure\n- Follows Single Responsibility Principle\n- Follows Open/Closed Principle\n\n### Disadvantages\n- Adding new element types is difficult (requires updating all visitors)\n- May break encapsulation by requiring elements to expose internal details\n- Can become complex with many element types and operations\n- Circular dependencies between visitors and elements\n\n## Visitor vs Other Patterns\n\n### Visitor vs Strategy\n- **Visitor**: Multiple operations on stable object structure\n- **Strategy**: Multiple algorithms for single operation\n\n### Visitor vs Command\n- **Visitor**: Operations distributed across object structure\n- **Command**: Encapsulates single operation as object\n\n## Real-World Examples\n- Compiler design (AST processing)\n- File system operations\n- Document processing\n- Game object processing\n- XML/HTML parsing\n- Database query optimization\n- Code analysis tools\n\n## Common Use Cases\n- Tree/graph traversal with different operations\n- Compiler phases (parsing, optimization, code generation)\n- Document format conversion\n- Static analysis tools\n- Reporting and statistics gathering\n- Serialization frameworks\n- Object validation systems