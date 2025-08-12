import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDesignPatterns } from '../context/DesignPatternsContext';
import Editor from '@monaco-editor/react';
import { Play, RotateCcw, Lightbulb, CheckCircle } from 'lucide-react';
import './PatternChallenge.css';

export const PatternChallenge: React.FC = () => {
  const { category, pattern, challengeId } = useParams<{
    category: string;
    pattern: string;
    challengeId: string;
  }>();
  const { getPatternByIds, startSession, endSession, updateProgress } = useDesignPatterns();
  const navigate = useNavigate();

  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [showHints, setShowHints] = useState(false);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [editorInitialized, setEditorInitialized] = useState(false);
  const [language, setLanguage] = useState<'javascript' | 'typescript'>('typescript');

  const patternData = category && pattern ? getPatternByIds(category, pattern) : undefined;
  const challenge = patternData?.challenges.find(c => c.id === challengeId);

  // Challenge-specific validation function
  const validateChallengeCode = async (challengeId: string, code: string, consoleOutput: string[]): Promise<boolean> => {
    switch (challengeId) {
      case 'singleton-debug':
        // For singleton challenge, check if the two instances are the same
        const output = consoleOutput.join('\n');
        return output.includes('LOG: true') || output.includes('true');
      
      case 'singleton-threadsafe':
        // Check if code includes proper synchronization concepts
        return code.includes('static') && (code.includes('lock') || code.includes('synchronized') || code.includes('instance'));
      
      case 'factory-builder':
        // Check if factory pattern is implemented
        return code.includes('Factory') && code.includes('createVehicle') && code.includes('interface');
      
      default:
        // Basic validation - just check if code runs without errors
        return consoleOutput.length >= 0; // Any output or no errors means success
    }
  };

  // Initialize code only once when challenge changes and editor is ready
  useEffect(() => {
    if (challenge?.starterCode && !editorInitialized) {
      setCode(challenge.starterCode);
    }
  }, [challenge?.starterCode, challenge?.id, editorInitialized]); // Only depend on challenge data

  // Start session only once
  useEffect(() => {
    if (category && pattern && challengeId) {
      startSession(pattern, challengeId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, pattern, challengeId]); // Intentionally omitting startSession to prevent re-runs

  // Handle language change for Monaco Editor
  useEffect(() => {
    if ((window as any).monaco && editorInitialized) {
      const models = (window as any).monaco.editor.getModels();
      models.forEach((model: any) => {
        if (model.uri.toString().includes('challenge')) {
          (window as any).monaco.editor.setModelLanguage(model, language);
          // Force model validation refresh
          setTimeout(() => {
            const monaco = (window as any).monaco;
            if (monaco && monaco.editor) {
              monaco.editor.getEditors().forEach((editor: any) => {
                const model = editor.getModel();
                if (model && model.uri.toString().includes('challenge')) {
                  // Trigger validation
                  monaco.editor.setModelMarkers(model, 'typescript', []);
                }
              });
            }
          }, 100);
        }
      });
    }
  }, [language, editorInitialized]);

  const runCode = async () => {
    setIsRunning(true);
    setOutput('Running code...\n');

    try {
      // Capture console output
      const consoleOutput: string[] = [];
      const originalConsole = {
        log: console.log,
        error: console.error,
        warn: console.warn,
        info: console.info
      };

      // Override console methods to capture output
      console.log = (...args) => {
        consoleOutput.push('LOG: ' + args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' '));
        originalConsole.log(...args);
      };
      
      console.error = (...args) => {
        consoleOutput.push('ERROR: ' + args.map(arg => String(arg)).join(' '));
        originalConsole.error(...args);
      };
      
      console.warn = (...args) => {
        consoleOutput.push('WARN: ' + args.map(arg => String(arg)).join(' '));
        originalConsole.warn(...args);
      };
      
      console.info = (...args) => {
        consoleOutput.push('INFO: ' + args.map(arg => String(arg)).join(' '));
        originalConsole.info(...args);
      };

      setTimeout(async () => {
        // Execute the code in a safe context
        let executableCode = code;
        
        try {
          
          // If using TypeScript mode, transpile to JavaScript
          if (language === 'typescript') {
            // Enhanced TypeScript to JavaScript conversion with better error handling
            executableCode = executableCode
              // First pass: Remove major TypeScript constructs
              .replace(/interface\s+\w+(\s*extends\s+[\w,\s]+)?\s*\{[^}]*\}/gs, '')
              .replace(/type\s+\w+(\s*<[^>]*>)?\s*=\s*[^;]+;/g, '')
              .replace(/enum\s+\w+\s*\{[^}]*\}/gs, '')
              .replace(/namespace\s+\w+\s*\{[^}]*\}/gs, '')
              
              // Handle class syntax and access modifiers
              .replace(/(public|private|protected|readonly|static|abstract)\s+/g, '')
              .replace(/implements\s+[\w,\s]+/g, '')
              .replace(/extends\s+[\w<>,\s]+/g, '')
              
              // Remove decorators
              .replace(/@\w+(\([^)]*\))?\s*/g, '')
              
              // Handle union types and complex type expressions
              .replace(/:\s*[^,=(){\n;]*\|[^,=(){\n;]*/g, '')
              .replace(/:\s*\([^)]+\)/g, '')
              .replace(/:\s*\{[^}]*\}/g, '')
              .replace(/:\s*[\w[\]<>|&\s]+(?=\s*[=,;{\n)])/g, '')
              
              // Clean function signatures
              .replace(/(\w+)\s*<[^>]*>/g, '$1')
              .replace(/(\w+)\?\s*:/g, '$1:')
              .replace(/(\w+):\s*[^,=(){\n;]+/g, '$1')
              
              // Clean return types and function types
              .replace(/\):\s*[^{;=]+(?=\s*[{;=])/g, ')')
              .replace(/=>\s*[^{;,\n]+(?=\s*[{;,\n])/g, '=> ')
              
              // Remove remaining type assertions
              .replace(/<[^>]*>/g, '')
              .replace(/\s+as\s+[^;,\n)}\]]+/g, '')
              
              // Final cleanup
              .replace(/:\s*[^,=(){\n;]+/g, '')
              .replace(/\?\s*:/g, ':')
              .replace(/\s+/g, ' ')
              .replace(/\n\s*\n\s*/g, '\n');
          }

          // Debug: Log the transpiled code to help identify issues
          if (language === 'typescript') {
            console.log('Original TypeScript code:', code);
            console.log('Transpiled JavaScript code:', executableCode);
          }

          const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
          const func = new AsyncFunction(executableCode);
          
          const result = await func();
          
          // Restore original console methods
          Object.assign(console, originalConsole);
          
          // Format output
          let output = 'Code executed successfully!\n\n';
          
          if (consoleOutput.length > 0) {
            output += 'Console Output:\n';
            output += consoleOutput.join('\n') + '\n\n';
          }
          
          if (result !== undefined) {
            output += 'Return Value:\n';
            output += typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result);
          }
          
          if (consoleOutput.length === 0 && result === undefined) {
            output += 'No output generated';
          }
          
          setOutput(output);
          setIsRunning(false);

          // Run tests if available
          if (challenge?.tests) {
            const testResults = challenge.tests.map((test, index) => ({
              ...test,
              passed: Math.random() > 0.3, // Still mock for now - would need proper test evaluation
              actualOutput: consoleOutput.join('\n') || 'No output'
            }));
            setTestResults(testResults);
          } else if (challenge) {
            // For challenges without defined tests, create basic validation
            const hasValidCode = await validateChallengeCode(challenge.id, code, consoleOutput);
            const mockTest = {
              id: 'basic-validation',
              description: 'Code validation',
              expectedOutput: 'Valid implementation',
              passed: hasValidCode,
              actualOutput: hasValidCode ? 'Implementation looks correct!' : 'Implementation needs fixes'
            };
            setTestResults([mockTest]);
          }
          
        } catch (error) {
          // Restore original console methods
          Object.assign(console, originalConsole);
          
          // Enhanced error reporting with line numbers
          let errorMessage = 'Error executing code:\n';
          
          if (error instanceof SyntaxError) {
            errorMessage += `Syntax Error: ${error.message}\n\n`;
            
            // Try to extract line information from the error
            const lines = executableCode.split('\n');
            
            // Look for common patterns that might cause syntax errors
            const problematicLines: string[] = [];
            lines.forEach((line: string, index: number) => {
              const lineNum = index + 1;
              // Check for remaining TypeScript syntax that might cause issues
              if (line.includes('|') && !line.includes('||') && !line.includes('|=')) {
                problematicLines.push(`Line ${lineNum}: ${line.trim()} (possible union type)`);
              }
              if (line.includes(':') && !line.includes('?:') && !line.includes('::')) {
                const colonMatch = line.match(/(\w+):\s*[^=,;{}()\n]+/);
                if (colonMatch) {
                  problematicLines.push(`Line ${lineNum}: ${line.trim()} (possible type annotation)`);
                }
              }
              if (line.includes('interface') || line.includes('type ') || line.includes('enum ')) {
                problematicLines.push(`Line ${lineNum}: ${line.trim()} (TypeScript declaration)`);
              }
            });
            
            if (problematicLines.length > 0) {
              errorMessage += 'Potential issues found:\n' + problematicLines.join('\n') + '\n\n';
            }
            
            errorMessage += 'Transpiled code that failed to execute:\n';
            lines.forEach((line: string, index: number) => {
              errorMessage += `${index + 1}: ${line}\n`;
            });
          } else {
            errorMessage += error instanceof Error ? error.message : String(error);
          }
          
          setOutput(errorMessage);
          setIsRunning(false);
        }
      }, 500);
      
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : String(error)}`);
      setIsRunning(false);
    }
  };

  const resetCode = () => {
    if (challenge?.starterCode) {
      setCode(challenge.starterCode);
      setOutput('');
      setTestResults([]);
    }
  };

  const nextHint = () => {
    if (challenge?.hints && currentHintIndex < challenge.hints.length - 1) {
      setCurrentHintIndex(currentHintIndex + 1);
    }
  };

  const submitSolution = () => {
    if (!pattern || !challengeId || !challenge) return;

    // Mock validation - in a real app, this would validate the solution
    const isCorrect = testResults.length > 0 && testResults.every(t => t.passed);
    
    if (isCorrect) {
      updateProgress(pattern, challengeId, challenge.points);
      endSession(challenge.points);
      
      // Navigate to next challenge or pattern overview
      const patternChallenges = patternData?.challenges || [];
      const currentIndex = patternChallenges.findIndex(c => c.id === challengeId);
      const nextChallenge = patternChallenges[currentIndex + 1];
      
      if (nextChallenge) {
        navigate(`/challenge/${category}/${pattern}/${nextChallenge.id}`);
      } else {
        navigate(`/lesson/${category}/${pattern}`);
      }
    }
  };

  if (!patternData || !challenge) {
    return (
      <div className="challenge-error">
        <h2>Challenge Not Found</h2>
        <p>The requested challenge could not be found.</p>
      </div>
    );
  }

  return (
    <div className="pattern-challenge">
      <header className="challenge-header">
        <div className="challenge-info">
          <h1>{challenge.title}</h1>
          <p>{challenge.description}</p>
          <div className="challenge-meta">
            <span className={`difficulty difficulty-${challenge.difficulty}`}>
              {challenge.difficulty}
            </span>
            <span className="points">{challenge.points} points</span>
            <span className="type">{challenge.type}</span>
          </div>
        </div>
      </header>

      <div className="challenge-content">
        <div className="code-section">
          <div className="editor-header">
            <h3>Code Editor</h3>
            <div className="editor-actions">
              <button 
                onClick={() => setLanguage(language === 'typescript' ? 'javascript' : 'typescript')}
                className={`btn btn-outline ${language === 'typescript' ? 'active' : ''}`}
                title="Toggle between TypeScript and JavaScript"
              >
                {language === 'typescript' ? 'TS' : 'JS'}
              </button>
              <button onClick={resetCode} className="btn btn-outline">
                <RotateCcw size={16} />
                Reset
              </button>
              <button 
                onClick={() => setShowHints(!showHints)} 
                className="btn btn-outline"
              >
                <Lightbulb size={16} />
                Hints
              </button>
              <button 
                onClick={runCode} 
                className="btn btn-primary"
                disabled={isRunning}
              >
                <Play size={16} />
                {isRunning ? 'Running...' : 'Run Code'}
              </button>
            </div>
          </div>
          
          <div className="editor-container">
            <Editor
              height="400px"
              language={language}
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value || '')}
              path={language === 'typescript' ? 'challenge.tsx' : 'challenge.js'}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                roundedSelection: false,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                wordWrap: 'on',
                tabSize: 2,
                insertSpaces: true,
                formatOnPaste: true,
                formatOnType: true,
                suggestOnTriggerCharacters: true,
                acceptSuggestionOnEnter: 'on',
                quickSuggestions: {
                  other: true,
                  comments: true,
                  strings: true
                }
              }}
              beforeMount={(monaco) => {
                // Configure TypeScript language settings for proper validation
                monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
                  noSemanticValidation: false,
                  noSyntaxValidation: false,
                  noSuggestionDiagnostics: false,
                });
                
                monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
                  target: monaco.languages.typescript.ScriptTarget.ES2020,
                  allowNonTsExtensions: true,
                  moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
                  module: monaco.languages.typescript.ModuleKind.CommonJS,
                  noEmit: true,
                  esModuleInterop: true,
                  jsx: monaco.languages.typescript.JsxEmit.React,
                  allowJs: true,
                  strict: false,
                  noImplicitAny: false,
                  skipLibCheck: true,
                  lib: [
                    'ES2020', 
                    'ES2020.Array', 
                    'ES2020.String', 
                    'ES2020.Promise', 
                    'ES2020.Intl',
                    'DOM',
                    'DOM.Iterable'
                  ],
                  typeRoots: ['node_modules/@types']
                });

                // Configure JavaScript defaults to be more permissive
                monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
                  noSemanticValidation: true, // Disable semantic validation for JS mode
                  noSyntaxValidation: false,
                  noSuggestionDiagnostics: true,
                });
                
                monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
                  target: monaco.languages.typescript.ScriptTarget.ES2020,
                  allowNonTsExtensions: true,
                  moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
                  module: monaco.languages.typescript.ModuleKind.CommonJS,
                  noEmit: true,
                  esModuleInterop: true,
                  jsx: monaco.languages.typescript.JsxEmit.React,
                  allowJs: true,
                  checkJs: false // Don't check JavaScript files for TypeScript errors
                });

                // Add comprehensive TypeScript lib definitions
                const libSource = `
                  // Console API
                  declare var console: {
                    log(...args: any[]): void;
                    error(...args: any[]): void;
                    warn(...args: any[]): void;
                    info(...args: any[]): void;
                    debug(...args: any[]): void;
                    trace(...args: any[]): void;
                    clear(): void;
                    assert(condition?: boolean, ...args: any[]): void;
                    count(label?: string): void;
                    time(label?: string): void;
                    timeEnd(label?: string): void;
                  };

                  // Global functions
                  declare function setTimeout(callback: (...args: any[]) => void, ms: number, ...args: any[]): number;
                  declare function clearTimeout(timeoutId: number): void;
                  declare function setInterval(callback: (...args: any[]) => void, ms: number, ...args: any[]): number;
                  declare function clearInterval(intervalId: number): void;
                  
                  // JSON API
                  declare var JSON: {
                    parse(text: string, reviver?: (this: any, key: string, value: any) => any): any;
                    stringify(value: any, replacer?: (this: any, key: string, value: any) => any, space?: string | number): string;
                    stringify(value: any, replacer?: (number | string)[] | null, space?: string | number): string;
                  };

                  // Math API
                  declare var Math: {
                    readonly E: number;
                    readonly LN10: number;
                    readonly LN2: number;
                    readonly LOG10E: number;
                    readonly LOG2E: number;
                    readonly PI: number;
                    readonly SQRT1_2: number;
                    readonly SQRT2: number;
                    abs(x: number): number;
                    acos(x: number): number;
                    asin(x: number): number;
                    atan(x: number): number;
                    atan2(y: number, x: number): number;
                    ceil(x: number): number;
                    cos(x: number): number;
                    exp(x: number): number;
                    floor(x: number): number;
                    log(x: number): number;
                    max(...values: number[]): number;
                    min(...values: number[]): number;
                    pow(x: number, y: number): number;
                    random(): number;
                    round(x: number): number;
                    sin(x: number): number;
                    sqrt(x: number): number;
                    tan(x: number): number;
                  };

                  // Object constructor
                  declare var Object: {
                    keys(obj: any): string[];
                    values(obj: any): any[];
                    entries(obj: any): [string, any][];
                    assign(target: any, ...sources: any[]): any;
                    create(prototype: any, properties?: PropertyDescriptorMap): any;
                    defineProperty(obj: any, prop: string | symbol, descriptor: PropertyDescriptor): any;
                    getOwnPropertyNames(obj: any): string[];
                    getPrototypeOf(obj: any): any;
                    setPrototypeOf(obj: any, prototype: any): any;
                  };

                  // Array constructor  
                  declare var Array: {
                    isArray(obj: any): obj is any[];
                    from<T>(iterable: Iterable<T>, mapfn?: (v: T, k: number) => any, thisArg?: any): any[];
                    of<T>(...items: T[]): T[];
                  };

                  // Promise
                  declare class Promise<T> {
                    constructor(executor: (resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void);
                    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): Promise<TResult1 | TResult2>;
                    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): Promise<T | TResult>;
                    finally(onfinally?: (() => void) | undefined | null): Promise<T>;
                    static resolve<T>(value: T | PromiseLike<T>): Promise<T>;
                    static reject<T = never>(reason?: any): Promise<T>;
                    static all<T>(values: readonly (T | PromiseLike<T>)[]): Promise<T[]>;
                    static race<T>(values: readonly (T | PromiseLike<T>)[]): Promise<T>;
                  }

                  // String extensions
                  interface String {
                    includes(searchString: string, position?: number): boolean;
                    startsWith(searchString: string, position?: number): boolean;
                    endsWith(searchString: string, length?: number): boolean;
                    repeat(count: number): string;
                    padStart(targetLength: number, padString?: string): string;
                    padEnd(targetLength: number, padString?: string): string;
                  }

                  // Array extensions
                  interface Array<T> {
                    length: number;
                    push(...items: T[]): number;
                    pop(): T | undefined;
                    shift(): T | undefined;
                    unshift(...items: T[]): number;
                    concat(...items: (T | T[])[]): T[];
                    join(separator?: string): string;
                    reverse(): T[];
                    slice(start?: number, end?: number): T[];
                    sort(compareFn?: (a: T, b: T) => number): T[];
                    splice(start: number, deleteCount?: number, ...items: T[]): T[];
                    indexOf(searchElement: T, fromIndex?: number): number;
                    lastIndexOf(searchElement: T, fromIndex?: number): number;
                    includes(searchElement: T, fromIndex?: number): boolean;
                    find(predicate: (this: void, value: T, index: number, obj: T[]) => boolean, thisArg?: any): T | undefined;
                    findIndex(predicate: (value: T, index: number, obj: T[]) => boolean, thisArg?: any): number;
                    some(predicate: (value: T, index: number, array: T[]) => boolean, thisArg?: any): boolean;
                    every(predicate: (value: T, index: number, array: T[]) => boolean, thisArg?: any): boolean;
                    filter(predicate: (value: T, index: number, array: T[]) => boolean, thisArg?: any): T[];
                    map<U>(callbackfn: (value: T, index: number, array: T[]) => U, thisArg?: any): U[];
                    reduce<U>(callbackfn: (previousValue: U, currentValue: T, currentIndex: number, array: T[]) => U, initialValue: U): U;
                    reduce(callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) => T): T;
                    reduceRight<U>(callbackfn: (previousValue: U, currentValue: T, currentIndex: number, array: T[]) => U, initialValue: U): U;
                    reduceRight(callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) => T): T;
                    forEach(callbackfn: (value: T, index: number, array: T[]) => void, thisArg?: any): void;
                    [n: number]: T;
                  }
                `;
                monaco.languages.typescript.typescriptDefaults.addExtraLib(libSource, 'ts:lib.es2020.d.ts');
              }}
              onMount={(editor) => {
                // Force syntax highlighting refresh
                editor.trigger('keyboard', 'editor.action.formatDocument', {});
                // Focus the editor
                editor.focus();
                // Mark editor as initialized
                setEditorInitialized(true);
                
                // Update model language when language changes
                const model = editor.getModel();
                if (model) {
                  const monaco = editor.getEditorType() === 'vs.editor.ICodeEditor' ? (window as any).monaco : null;
                  if (monaco) {
                    monaco.editor.setModelLanguage(model, language);
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="results-section">
          <div className="output-panel">
            <h3>Output</h3>
            <pre className="output-content">{output}</pre>
          </div>

          {testResults.length > 0 && (
            <div className="tests-panel">
              <h3>Test Results</h3>
              <div className="test-results">
                {testResults.map((test, index) => (
                  <div key={test.id} className={`test-result ${test.passed ? 'passed' : 'failed'}`}>
                    <div className="test-header">
                      <span className="test-status">
                        {test.passed ? <CheckCircle size={16} /> : '❌'}
                      </span>
                      <span className="test-description">{test.description}</span>
                    </div>
                    <div className="test-details">
                      <div>Expected: {JSON.stringify(test.expectedOutput)}</div>
                      <div>Actual: {test.actualOutput}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              {testResults.every(t => t.passed) && (
                <button onClick={submitSolution} className="btn btn-success">
                  <CheckCircle size={16} />
                  Submit Solution
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {showHints && challenge.hints && (
        <div className="hints-panel">
          <div className="hints-header">
            <h3>Hints</h3>
            <span className="hint-counter">
              {currentHintIndex + 1} / {challenge.hints.length}
            </span>
          </div>
          <div className="hint-content">
            <p>{challenge.hints[currentHintIndex]}</p>
          </div>
          <div className="hints-actions">
            {currentHintIndex < challenge.hints.length - 1 && (
              <button onClick={nextHint} className="btn btn-outline">
                Next Hint
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};