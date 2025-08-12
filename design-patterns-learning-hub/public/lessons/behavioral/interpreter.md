# Interpreter Pattern

## Overview
The Interpreter pattern defines a grammar for a language and provides an interpreter to process sentences in that language. It's used to evaluate expressions or commands written in a specific syntax by representing grammar rules as classes.

## When to Use
- When you have a simple grammar/language to interpret
- When efficiency is not a primary concern
- When you want to change or extend the grammar easily
- For building domain-specific languages (DSL)
- For mathematical expression evaluation
- For command parsing and execution

## Structure
```
┌─────────────────┐
│     Client      │
└─────────────────┘
         │
         │ uses
         ▼
┌─────────────────┐
│    Context      │
├─────────────────┤
│ + input         │
│ + output        │
└─────────────────┘
         │
         │ interprets with
         ▼
┌─────────────────┐
│AbstractExpression│
├─────────────────┤
│ + interpret()   │
└─────────────────┘
         △
         │
┌────────┴────────┐
│                 │
┌─────────────────┐  ┌─────────────────┐
│TerminalExpr     │  │NonTerminalExpr  │
├─────────────────┤  ├─────────────────┤
│ + interpret()   │  │ + interpret()   │
└─────────────────┘  └─────────────────┘
```

## Implementation Examples

### JavaScript/TypeScript - Boolean Expression Interpreter
```javascript
// Context for interpretation
class Context {
  private variables = new Map<string, boolean>();

  setVariable(name: string, value: boolean): void {
    this.variables.set(name, value);
  }

  getVariable(name: string): boolean {
    return this.variables.get(name) || false;
  }
}

// Abstract expression
interface Expression {
  interpret(context: Context): boolean;
}

// Terminal expressions
class VariableExpression implements Expression {
  constructor(private name: string) {}

  interpret(context: Context): boolean {
    return context.getVariable(this.name);
  }

  toString(): string {
    return this.name;
  }
}

class ConstantExpression implements Expression {
  constructor(private value: boolean) {}

  interpret(context: Context): boolean {
    return this.value;
  }

  toString(): string {
    return this.value.toString();
  }
}

// Non-terminal expressions
class AndExpression implements Expression {
  constructor(
    private left: Expression,
    private right: Expression
  ) {}

  interpret(context: Context): boolean {
    return this.left.interpret(context) && this.right.interpret(context);
  }

  toString(): string {
    return `(${this.left} AND ${this.right})`;
  }
}

class OrExpression implements Expression {
  constructor(
    private left: Expression,
    private right: Expression
  ) {}

  interpret(context: Context): boolean {
    return this.left.interpret(context) || this.right.interpret(context);
  }

  toString(): string {
    return `(${this.left} OR ${this.right})`;
  }
}

class NotExpression implements Expression {
  constructor(private expression: Expression) {}

  interpret(context: Context): boolean {
    return !this.expression.interpret(context);
  }

  toString(): string {
    return `NOT ${this.expression}`;
  }
}

// Parser for building expression tree
class BooleanExpressionParser {
  private tokens: string[] = [];
  private current = 0;

  parse(expression: string): Expression {
    this.tokens = this.tokenize(expression);
    this.current = 0;
    return this.parseOrExpression();
  }

  private tokenize(expression: string): string[] {
    return expression
      .replace(/\(/g, ' ( ')
      .replace(/\)/g, ' ) ')
      .split(/\s+/)
      .filter(token => token.length > 0);
  }

  private parseOrExpression(): Expression {
    let expr = this.parseAndExpression();

    while (this.current < this.tokens.length && this.tokens[this.current] === 'OR') {
      this.current++; // consume 'OR'
      const right = this.parseAndExpression();
      expr = new OrExpression(expr, right);
    }

    return expr;
  }

  private parseAndExpression(): Expression {
    let expr = this.parseNotExpression();

    while (this.current < this.tokens.length && this.tokens[this.current] === 'AND') {
      this.current++; // consume 'AND'
      const right = this.parseNotExpression();
      expr = new AndExpression(expr, right);
    }

    return expr;
  }

  private parseNotExpression(): Expression {
    if (this.current < this.tokens.length && this.tokens[this.current] === 'NOT') {
      this.current++; // consume 'NOT'
      const expr = this.parseNotExpression();
      return new NotExpression(expr);
    }

    return this.parsePrimaryExpression();
  }

  private parsePrimaryExpression(): Expression {
    if (this.current >= this.tokens.length) {
      throw new Error('Unexpected end of expression');
    }

    const token = this.tokens[this.current++];

    if (token === '(') {
      const expr = this.parseOrExpression();
      if (this.current >= this.tokens.length || this.tokens[this.current] !== ')') {
        throw new Error('Missing closing parenthesis');
      }
      this.current++; // consume ')'
      return expr;
    }

    if (token === 'true') {
      return new ConstantExpression(true);
    }

    if (token === 'false') {
      return new ConstantExpression(false);
    }

    // Assume it's a variable
    return new VariableExpression(token);
  }
}

// Usage
const parser = new BooleanExpressionParser();
const context = new Context();

// Set variables
context.setVariable('A', true);
context.setVariable('B', false);
context.setVariable('C', true);

// Parse and evaluate expressions
const expressions = [
  'A AND B',
  'A OR B',
  'NOT A',
  'A AND (B OR C)',
  '(A OR B) AND (NOT C OR A)',
  'true AND false',
  'A AND NOT B AND C'
];

console.log('=== Boolean Expression Interpreter ===');
expressions.forEach(exprStr => {
  try {
    const expr = parser.parse(exprStr);
    const result = expr.interpret(context);
    console.log(`${exprStr} = ${result}`);
    console.log(`  Parsed as: ${expr.toString()}`);
  } catch (error) {
    console.log(`Error parsing "${exprStr}": ${error.message}`);
  }
});
```

### Python - Mathematical Expression Interpreter
```python
from abc import ABC, abstractmethod
import re
from typing import Dict, List, Union

# Context for variables
class MathContext:
    def __init__(self):
        self.variables: Dict[str, float] = {}
    
    def set_variable(self, name: str, value: float):
        self.variables[name] = value
    
    def get_variable(self, name: str) -> float:
        if name not in self.variables:
            raise ValueError(f"Undefined variable: {name}")
        return self.variables[name]

# Abstract expression
class MathExpression(ABC):
    @abstractmethod
    def interpret(self, context: MathContext) -> float:
        pass
    
    @abstractmethod
    def __str__(self) -> str:
        pass

# Terminal expressions
class NumberExpression(MathExpression):
    def __init__(self, value: float):
        self.value = value
    
    def interpret(self, context: MathContext) -> float:
        return self.value
    
    def __str__(self) -> str:
        return str(self.value)

class VariableExpression(MathExpression):
    def __init__(self, name: str):
        self.name = name
    
    def interpret(self, context: MathContext) -> float:
        return context.get_variable(self.name)
    
    def __str__(self) -> str:
        return self.name

# Non-terminal expressions
class AddExpression(MathExpression):
    def __init__(self, left: MathExpression, right: MathExpression):
        self.left = left
        self.right = right
    
    def interpret(self, context: MathContext) -> float:
        return self.left.interpret(context) + self.right.interpret(context)
    
    def __str__(self) -> str:
        return f"({self.left} + {self.right})"

class SubtractExpression(MathExpression):
    def __init__(self, left: MathExpression, right: MathExpression):
        self.left = left
        self.right = right
    
    def interpret(self, context: MathContext) -> float:
        return self.left.interpret(context) - self.right.interpret(context)
    
    def __str__(self) -> str:
        return f"({self.left} - {self.right})"

class MultiplyExpression(MathExpression):
    def __init__(self, left: MathExpression, right: MathExpression):
        self.left = left
        self.right = right
    
    def interpret(self, context: MathContext) -> float:
        return self.left.interpret(context) * self.right.interpret(context)
    
    def __str__(self) -> str:
        return f"({self.left} * {self.right})"

class DivideExpression(MathExpression):
    def __init__(self, left: MathExpression, right: MathExpression):
        self.left = left
        self.right = right
    
    def interpret(self, context: MathContext) -> float:
        right_val = self.right.interpret(context)
        if right_val == 0:
            raise ValueError("Division by zero")
        return self.left.interpret(context) / right_val
    
    def __str__(self) -> str:
        return f"({self.left} / {self.right})"

class PowerExpression(MathExpression):
    def __init__(self, left: MathExpression, right: MathExpression):
        self.left = left
        self.right = right
    
    def interpret(self, context: MathContext) -> float:
        return self.left.interpret(context) ** self.right.interpret(context)
    
    def __str__(self) -> str:
        return f"({self.left} ^ {self.right})"

# Parser for mathematical expressions
class MathExpressionParser:
    def __init__(self):
        self.tokens: List[str] = []
        self.current = 0
    
    def parse(self, expression: str) -> MathExpression:
        self.tokens = self.tokenize(expression)
        self.current = 0
        result = self.parse_expression()
        if self.current < len(self.tokens):
            raise ValueError(f"Unexpected token: {self.tokens[self.current]}")
        return result
    
    def tokenize(self, expression: str) -> List[str]:
        # Tokenize the expression
        pattern = r'(\d+\.?\d*|[a-zA-Z_][a-zA-Z0-9_]*|[+\-*/^()])'
        tokens = re.findall(pattern, expression.replace(' ', ''))
        return tokens
    
    def parse_expression(self) -> MathExpression:
        # Handle addition and subtraction (lowest precedence)
        left = self.parse_term()
        
        while self.current < len(self.tokens) and self.tokens[self.current] in ['+', '-']:
            operator = self.tokens[self.current]
            self.current += 1
            right = self.parse_term()
            
            if operator == '+':
                left = AddExpression(left, right)
            else:
                left = SubtractExpression(left, right)
        
        return left
    
    def parse_term(self) -> MathExpression:
        # Handle multiplication and division
        left = self.parse_power()
        
        while self.current < len(self.tokens) and self.tokens[self.current] in ['*', '/']:
            operator = self.tokens[self.current]
            self.current += 1
            right = self.parse_power()
            
            if operator == '*':
                left = MultiplyExpression(left, right)
            else:
                left = DivideExpression(left, right)
        
        return left
    
    def parse_power(self) -> MathExpression:
        # Handle exponentiation (highest precedence)
        left = self.parse_factor()
        
        if self.current < len(self.tokens) and self.tokens[self.current] == '^':
            self.current += 1
            right = self.parse_power()  # Right associative
            left = PowerExpression(left, right)
        
        return left
    
    def parse_factor(self) -> MathExpression:
        # Handle parentheses, numbers, and variables
        if self.current >= len(self.tokens):
            raise ValueError("Unexpected end of expression")
        
        token = self.tokens[self.current]
        
        if token == '(':
            self.current += 1
            expr = self.parse_expression()
            if self.current >= len(self.tokens) or self.tokens[self.current] != ')':
                raise ValueError("Missing closing parenthesis")
            self.current += 1
            return expr
        
        elif token == '-':
            # Handle unary minus
            self.current += 1
            expr = self.parse_factor()
            return SubtractExpression(NumberExpression(0), expr)
        
        elif token.replace('.', '').isdigit():
            # Number
            self.current += 1
            return NumberExpression(float(token))
        
        elif token.isalpha() or token.startswith('_'):
            # Variable
            self.current += 1
            return VariableExpression(token)
        
        else:
            raise ValueError(f"Unexpected token: {token}")

# Usage
def demonstrate_math_interpreter():
    parser = MathExpressionParser()
    context = MathContext()
    
    # Set variables
    context.set_variable('x', 5)
    context.set_variable('y', 3)
    context.set_variable('pi', 3.14159)
    
    expressions = [
        "2 + 3 * 4",
        "x * y + 10",
        "(x + y) * 2",
        "x^2 + y^2",
        "2 * pi * 10",
        "x / y + 1",
        "-x + y * 2",
        "2^3^2",  # Right associative: 2^(3^2) = 2^9 = 512
    ]
    
    print("=== Mathematical Expression Interpreter ===")
    print(f"Variables: x={context.get_variable('x')}, y={context.get_variable('y')}, pi={context.get_variable('pi')}")
    print()
    
    for expr_str in expressions:
        try:
            expr = parser.parse(expr_str)
            result = expr.interpret(context)
            print(f"{expr_str:15} = {result:8.2f}  |  Parsed: {expr}")
        except Exception as e:
            print(f"{expr_str:15} = ERROR: {e}")

demonstrate_math_interpreter()
```

### Java - SQL-like Query Interpreter
```java
import java.util.*;
import java.util.stream.Collectors;

// Data model
class Person {
    private String name;
    private int age;
    private String department;
    
    public Person(String name, int age, String department) {
        this.name = name;
        this.age = age;
        this.department = department;
    }
    
    // Getters
    public String getName() { return name; }
    public int getAge() { return age; }
    public String getDepartment() { return department; }
    
    @Override
    public String toString() {
        return String.format("Person{name='%s', age=%d, dept='%s'}", name, age, department);
    }
}

// Context for query execution
class QueryContext {
    private List<Person> data;
    
    public QueryContext(List<Person> data) {
        this.data = new ArrayList<>(data);
    }
    
    public List<Person> getData() {
        return data;
    }
    
    public void setData(List<Person> data) {
        this.data = data;
    }
}

// Abstract expression
interface QueryExpression {
    List<Person> interpret(QueryContext context);
    String toString();
}

// Terminal expressions
class AllExpression implements QueryExpression {
    public List<Person> interpret(QueryContext context) {
        return new ArrayList<>(context.getData());
    }
    
    public String toString() {
        return "ALL";
    }
}

// Non-terminal expressions
class WhereExpression implements QueryExpression {
    private QueryExpression source;
    private Predicate<Person> condition;
    private String conditionStr;
    
    public WhereExpression(QueryExpression source, Predicate<Person> condition, String conditionStr) {
        this.source = source;
        this.condition = condition;
        this.conditionStr = conditionStr;
    }
    
    public List<Person> interpret(QueryContext context) {
        List<Person> sourceData = source.interpret(context);
        return sourceData.stream()
                        .filter(condition)
                        .collect(Collectors.toList());
    }
    
    public String toString() {
        return source + " WHERE " + conditionStr;
    }
}

class OrderByExpression implements QueryExpression {
    private QueryExpression source;
    private Comparator<Person> comparator;
    private String orderStr;
    
    public OrderByExpression(QueryExpression source, Comparator<Person> comparator, String orderStr) {
        this.source = source;
        this.comparator = comparator;
        this.orderStr = orderStr;
    }
    
    public List<Person> interpret(QueryContext context) {
        List<Person> sourceData = source.interpret(context);
        return sourceData.stream()
                        .sorted(comparator)
                        .collect(Collectors.toList());
    }
    
    public String toString() {
        return source + " ORDER BY " + orderStr;
    }
}

class LimitExpression implements QueryExpression {
    private QueryExpression source;
    private int limit;
    
    public LimitExpression(QueryExpression source, int limit) {
        this.source = source;
        this.limit = limit;
    }
    
    public List<Person> interpret(QueryContext context) {
        List<Person> sourceData = source.interpret(context);
        return sourceData.stream()
                        .limit(limit)
                        .collect(Collectors.toList());
    }
    
    public String toString() {
        return source + " LIMIT " + limit;
    }
}

// Query builder (simplified parser)
class QueryBuilder {
    public static QueryExpression createQuery() {
        return new AllExpression();
    }
    
    public static QueryExpression where(QueryExpression source, String field, String operator, Object value) {
        Predicate<Person> predicate = createPredicate(field, operator, value);
        String conditionStr = field + " " + operator + " " + value;
        return new WhereExpression(source, predicate, conditionStr);
    }
    
    public static QueryExpression orderBy(QueryExpression source, String field, boolean ascending) {
        Comparator<Person> comparator = createComparator(field, ascending);
        String orderStr = field + (ascending ? " ASC" : " DESC");
        return new OrderByExpression(source, comparator, orderStr);
    }
    
    public static QueryExpression limit(QueryExpression source, int limit) {
        return new LimitExpression(source, limit);
    }
    
    private static Predicate<Person> createPredicate(String field, String operator, Object value) {
        switch (field.toLowerCase()) {
            case "name":
                return person -> compareValues(person.getName(), operator, value);
            case "age":
                return person -> compareValues(person.getAge(), operator, value);
            case "department":
                return person -> compareValues(person.getDepartment(), operator, value);
            default:
                throw new IllegalArgumentException("Unknown field: " + field);
        }
    }
    
    private static boolean compareValues(Object fieldValue, String operator, Object targetValue) {
        switch (operator) {
            case "=":
            case "==":
                return fieldValue.equals(targetValue);
            case "!=":
                return !fieldValue.equals(targetValue);
            case ">":
                if (fieldValue instanceof Comparable) {
                    return ((Comparable) fieldValue).compareTo(targetValue) > 0;
                }
                break;
            case ">=":
                if (fieldValue instanceof Comparable) {
                    return ((Comparable) fieldValue).compareTo(targetValue) >= 0;
                }
                break;
            case "<":
                if (fieldValue instanceof Comparable) {
                    return ((Comparable) fieldValue).compareTo(targetValue) < 0;
                }
                break;
            case "<=":
                if (fieldValue instanceof Comparable) {
                    return ((Comparable) fieldValue).compareTo(targetValue) <= 0;
                }
                break;
            case "LIKE":
                if (fieldValue instanceof String && targetValue instanceof String) {
                    String pattern = ((String) targetValue).replace("%", ".*");
                    return ((String) fieldValue).matches(pattern);
                }
                break;
        }
        return false;
    }
    
    private static Comparator<Person> createComparator(String field, boolean ascending) {
        Comparator<Person> comparator;
        
        switch (field.toLowerCase()) {
            case "name":
                comparator = Comparator.comparing(Person::getName);
                break;
            case "age":
                comparator = Comparator.comparing(Person::getAge);
                break;
            case "department":
                comparator = Comparator.comparing(Person::getDepartment);
                break;
            default:
                throw new IllegalArgumentException("Unknown field: " + field);
        }
        
        return ascending ? comparator : comparator.reversed();
    }
}

// Usage
public class InterpreterExample {
    public static void main(String[] args) {
        // Create sample data
        List<Person> people = Arrays.asList(
            new Person("Alice", 30, "Engineering"),
            new Person("Bob", 25, "Marketing"),
            new Person("Charlie", 35, "Engineering"),
            new Person("Diana", 28, "Sales"),
            new Person("Eve", 32, "Marketing"),
            new Person("Frank", 29, "Engineering")
        );
        
        QueryContext context = new QueryContext(people);
        
        System.out.println("=== SQL-like Query Interpreter ===");
        System.out.println("Original data:");
        people.forEach(System.out::println);
        System.out.println();
        
        // Build and execute queries
        List<QueryExpression> queries = Arrays.asList(
            // SELECT * FROM people WHERE age > 30
            QueryBuilder.where(QueryBuilder.createQuery(), "age", ">", 30),
            
            // SELECT * FROM people WHERE department = 'Engineering' ORDER BY age
            QueryBuilder.orderBy(
                QueryBuilder.where(QueryBuilder.createQuery(), "department", "=", "Engineering"),
                "age", true
            ),
            
            // SELECT * FROM people WHERE age >= 30 ORDER BY name DESC LIMIT 2
            QueryBuilder.limit(
                QueryBuilder.orderBy(
                    QueryBuilder.where(QueryBuilder.createQuery(), "age", ">=", 30),
                    "name", false
                ), 2
            ),
            
            // SELECT * FROM people WHERE name LIKE 'A%'
            QueryBuilder.where(QueryBuilder.createQuery(), "name", "LIKE", "A%")
        );
        
        for (int i = 0; i < queries.size(); i++) {
            QueryExpression query = queries.get(i);
            System.out.println("Query " + (i + 1) + ": " + query);
            List<Person> results = query.interpret(context);
            results.forEach(person -> System.out.println("  " + person));
            System.out.println();
        }
    }
}
```

## Pros and Cons

### Advantages
- Easy to change and extend grammar
- Each grammar rule is represented by a class
- Easy to implement simple grammars
- Can build complex expressions from simple ones
- Follows Single Responsibility Principle

### Disadvantages
- Complex grammars become hard to maintain
- Performance issues with complex expressions
- Can result in many classes
- Better alternatives exist for complex parsing (ANTLR, parser generators)

## Real-World Examples
- Regular expression engines
- Configuration file parsers
- Mathematical expression evaluators
- Query languages (SQL subsets)
- Domain-specific languages
- Command-line argument parsers
- Template engines
- Scripting language interpreters

## Common Use Cases
- Simple domain-specific languages
- Configuration validation
- Rule engines
- Mathematical calculators
- Boolean logic evaluators
- Simple query systems
- Template processing
- Command interpretation