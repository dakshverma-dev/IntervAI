'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Clock, BarChart3, MessageSquare, ArrowLeft, Timer, Target, HelpCircle, Send, Code2, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import CodeEditor from '@/components/CodeEditor';
import EnhancedChatInterface from '@/components/EnhancedChatInterface';
import CameraView from '@/components/CameraView';
import { CODING_PROBLEMS, CodingProblem } from '@/data/problems';
import { SAMPLE_RESUME, PREMADE_QUESTIONS } from '@/data/mockData';
import AIService from '@/services/AIService';
import Logo from '@/components/Logo';

export default function PracticePage() {
  // Problem management
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [currentProblem, setCurrentProblem] = useState<CodingProblem>(CODING_PROBLEMS[0]);
  const [code, setCode] = useState(CODING_PROBLEMS[0].initialCode);
  const [isFirstRun, setIsFirstRun] = useState(true);
  const [hasStartedCoding, setHasStartedCoding] = useState(false);

  const [isRunning, setIsRunning] = useState(false);
  const [metrics, setMetrics] = useState({
    executionTime: 0,
    memoryUsage: 0,
    complexity: 'O(?)',
    codeQuality: 0
  });

  // Interview state
  const [interviewPhase, setInterviewPhase] = useState<'initial' | 'coding' | 'submitted' | 'completed' | 'guidance'>('initial');
  const [aiService] = useState(() => new AIService());

  // Resume state - Simplified flow
  const [resumeQuestions] = useState<string[]>(PREMADE_QUESTIONS);

  // Interview tracking states
  const [isInterviewActive] = useState(true);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [codeSubmissions, setCodeSubmissions] = useState(0);
  const [problemsCompleted, setProblemsCompleted] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Add state for triggering AI responses in chat
  const [aiCodeResponse, setAiCodeResponse] = useState<string>('');

  // Problem navigation functions
  const handleNextProblem = () => {
    if (currentProblemIndex < CODING_PROBLEMS.length - 1) {
      const nextIndex = currentProblemIndex + 1;
      const nextProblem = CODING_PROBLEMS[nextIndex];
      setCurrentProblemIndex(nextIndex);
      setCurrentProblem(nextProblem);
      setCode(nextProblem.initialCode);
      setIsFirstRun(true);
      setHasStartedCoding(false);
      setInterviewPhase('initial');
      setAiCodeResponse(''); // Reset AI response
    } else {
      setInterviewPhase('completed');
    }
  };

  const handleSubmitProblem = async () => {
    setCodeSubmissions(prev => prev + 1);
    setProblemsCompleted(prev => prev + 1);
    setInterviewPhase('submitted');

    // Get AI feedback on submission
    try {
      await aiService.getCodeExecutionResponse(
        code,
        currentProblem.title,
        false
      );
      // You can add this response to chat or show in a modal
    } catch (error) {
      console.error('Error getting submission feedback:', error);
    }
  };

  // Timer effect for tracking interview phases
  useEffect(() => {
    if (isInterviewActive) {
      timerRef.current = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isInterviewActive]);

  // Initial greeting effect
  useEffect(() => {
    if (interviewPhase === 'initial') {
      const sendInitialGreeting = async () => {
        try {
          await aiService.getInitialGreeting(
            currentProblem.title,
            currentProblem.description
          );
          // The greeting will be handled by the EnhancedChatInterface
        } catch (error) {
          console.error('Error sending initial greeting:', error);
        }
      };

      sendInitialGreeting();
    }
  }, [currentProblem, interviewPhase, aiService]);

  // Advanced complexity detection
  const analyzeTimeComplexity = (codeText: string): string => {
    if (!codeText.trim()) return 'O(?)';

    // Normalize code for analysis
    const normalizedCode = codeText.toLowerCase();
    const lines = codeText.split('\n');

    // Track patterns
    let maxNestedLoops = 0;
    let hasRecursiveCall = false;
    let hasHashSet = false;
    let hasHashMap = false;
    let hasSorting = false;
    let hasLinearSearch = false;
    let hasBinarySearch = false;
    let singleLoop = false;

    // Analyze each line
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim().toLowerCase();

      // Track loop nesting by indentation and keywords
      if (line.includes('for ') || line.includes('while ')) {
        singleLoop = true;

        // Check if this loop is nested inside another
        let isNested = false;
        for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
          const innerLine = lines[j].trim().toLowerCase();
          if (innerLine && (innerLine.includes('for ') || innerLine.includes('while '))) {
            if (lines[j].length > lines[i].length) { // More indented = nested
              maxNestedLoops = Math.max(maxNestedLoops, 1);
              isNested = true;
            }
          }
        }

        // Check for triple nested loops
        if (isNested) {
          for (let k = i + 2; k < Math.min(i + 15, lines.length); k++) {
            const deepLine = lines[k].trim().toLowerCase();
            if (deepLine && (deepLine.includes('for ') || deepLine.includes('while '))) {
              if (lines[k].length > lines[i + 1].length) {
                maxNestedLoops = Math.max(maxNestedLoops, 2);
              }
            }
          }
        }
      }

      // Data structures
      if (line.includes('set()') || line.includes('set(') || line.includes('hashset')) {
        hasHashSet = true;
      }

      if (line.includes('dict()') || line.includes('dict(') || line.includes('{}') ||
        line.includes('hashmap') || line.includes('map(')) {
        hasHashMap = true;
      }

      // Algorithms
      if (line.includes('.sort(') || line.includes('sorted(') || line.includes('sort(')) {
        hasSorting = true;
      }

      // Search patterns
      if (line.includes('in arr') || line.includes('in array') || line.includes('in nums') ||
        line.includes('.find(') || line.includes('.index(') || line.includes('linear')) {
        hasLinearSearch = true;
      }

      if (line.includes('binary') || line.includes('bisect') || line.includes('log')) {
        hasBinarySearch = true;
      }

      // Recursion detection
      if (line.includes('def ')) {
        const funcName = line.match(/def\s+(\w+)/)?.[1];
        if (funcName) {
          // Check if function calls itself
          for (let j = i + 1; j < lines.length; j++) {
            if (lines[j].toLowerCase().includes(funcName + '(')) {
              hasRecursiveCall = true;
              break;
            }
          }
        }
      }
    }

    // Complexity determination
    if (hasRecursiveCall) {
      if (maxNestedLoops >= 2) return 'O(2^n)';
      if (maxNestedLoops === 1) return 'O(n²)';
      if (hasBinarySearch || normalizedCode.includes('//2') || normalizedCode.includes('/2')) return 'O(log n)';
      return 'O(n)';
    }

    if (maxNestedLoops >= 2) return 'O(n³)';
    if (maxNestedLoops === 1) return 'O(n²)';

    if (hasSorting && !hasHashSet && !hasHashMap) return 'O(n log n)';

    if (singleLoop) {
      if (hasHashSet || hasHashMap) return 'O(n)';
      return 'O(n)';
    }

    if (hasBinarySearch) return 'O(log n)';

    if (hasHashSet || hasHashMap) {
      if (hasLinearSearch) return 'O(n)';
      if (normalizedCode.includes('lookup') || normalizedCode.includes('get(')) return 'O(1)';
      return 'O(n)';
    }

    // Simple operations
    if (lines.length <= 3 && normalizedCode.includes('return')) return 'O(1)';

    return 'O(?)';
  };

  const analyzeCodeExecution = (code: string) => {
    const codeLines = code.split('\n').filter(line => line.trim()).length;
    const complexity = analyzeTimeComplexity(code);
    const hasComments = code.includes('#') || code.includes('//') || code.includes('"""');
    const hasErrorHandling = code.includes('try') || code.includes('except') || code.includes('if not') || code.includes('if len');
    const hasFunctionDef = code.includes('def ');
    const hasReturnStatement = code.includes('return');
    const hasLoops = code.includes('for') || code.includes('while');
    const hasConditionals = code.includes('if ');

    // Detect approach patterns
    const isNestedLoop = (code.match(/for.*:/g) || []).length >= 2;
    const hasHashMap = code.includes('{}') || code.includes('dict') || code.includes('set(');
    const hasSorting = code.includes('sort') || code.includes('sorted');

    return {
      complexity,
      codeLines,
      hasComments,
      hasErrorHandling,
      hasFunctionDef,
      hasReturnStatement,
      hasLoops,
      hasConditionals,
      isNestedLoop,
      hasHashMap,
      hasSorting,
      isEmpty: code.trim().length < 10,
      isComplete: hasReturnStatement && hasLoops && codeLines > 3
    };
  };

  const runCode = async () => {
    setIsRunning(true);
    setCodeSubmissions(prev => prev + 1);
    setHasStartedCoding(true);

    // Analyze execution result for more context
    const executionAnalysis = analyzeCodeExecution(code);

    // Get comprehensive AI response for code execution
    try {
      const response = await aiService.getCodeExecutionResponse(
        code,
        currentProblem.title,
        isFirstRun,
        executionAnalysis
      );

      // Trigger AI response in chat interface with enhanced context
      setAiCodeResponse(response);
      setIsFirstRun(false);

      // Update interview phase based on progress
      if (isFirstRun) {
        setInterviewPhase('coding');
      } else if (codeSubmissions >= 3) {
        setInterviewPhase('guidance'); // Switch to guidance mode after multiple attempts
      }

    } catch (error) {
      console.error('Error getting AI response:', error);
      // Enhanced fallback with encouragement
      const encouragingFallbacks = [
        "Great work! I'm analyzing your approach. Tell me about your thought process - what's your strategy here?",
        "Nice progress! I can see you're thinking through this systematically. What aspects are you focusing on?",
        "Good job! Your code is taking shape. Walk me through your logic - I'd love to understand your approach better.",
        "Excellent! Let's discuss the complexity and see if there are ways to optimize this further."
      ];
      setAiCodeResponse(encouragingFallbacks[Math.floor(Math.random() * encouragingFallbacks.length)]);
    }

    // Simulate code execution with enhanced analysis
    setTimeout(() => {
      const detectedComplexity = analyzeTimeComplexity(code);

      // Enhanced analysis based on code patterns
      const codeLines = code.split('\n').filter(line => line.trim()).length;
      const hasComments = code.includes('#') || code.includes('//') || code.includes('"""');
      const hasVariableNames = /\b(seen|duplicates|result|arr|nums|count|freq)\b/.test(code);
      const hasErrorHandling = code.includes('try') || code.includes('except') || code.includes('if not') || code.includes('if len');
      const hasFunctionDef = code.includes('def ');
      const hasDocstring = code.includes('"""') || code.includes("'''");
      const hasTypeHints = code.includes(':') && (code.includes('List') || code.includes('int') || code.includes('str'));
      const hasReturnStatement = code.includes('return');

      // Calculate quality score
      let quality = 30; // Base score

      // Code structure points
      if (codeLines >= 5 && codeLines <= 20) quality += 15; // Appropriate length
      else if (codeLines > 20) quality += 5; // Too long
      else if (codeLines < 5) quality += 10; // Concise

      if (hasComments || hasDocstring) quality += 15; // Documentation
      if (hasVariableNames) quality += 15; // Good naming
      if (hasErrorHandling) quality += 10; // Edge cases
      if (hasFunctionDef) quality += 10; // Proper structure
      if (hasTypeHints) quality += 5; // Modern practices
      if (hasReturnStatement) quality += 5; // Complete function

      // Algorithm efficiency points  
      switch (detectedComplexity) {
        case 'O(1)': quality += 30; break;
        case 'O(log n)': quality += 25; break;
        case 'O(n)': quality += 20; break;
        case 'O(n log n)': quality += 15; break;
        case 'O(n²)': quality += 5; break;
        case 'O(n³)': quality -= 5; break;
        case 'O(2^n)': quality -= 10; break;
        default: quality -= 15; // Unknown complexity
      }

      // Code patterns bonus
      if (code.includes('set(') || code.includes('dict(')) quality += 10; // Good data structures
      if (code.includes('enumerate') || code.includes('zip')) quality += 5; // Pythonic
      if (code.includes('list comprehension') || /\[.*for.*in.*\]/.test(code)) quality += 5; // Concise

      // Execution time simulation based on complexity
      let execTime = 10;
      const randomFactor = Math.random(); // Generate once to avoid hydration issues
      switch (detectedComplexity) {
        case 'O(1)': execTime = 1 + randomFactor * 2; break;
        case 'O(n)': execTime = 5 + randomFactor * 10; break;
        case 'O(n log n)': execTime = 15 + randomFactor * 15; break;
        case 'O(n²)': execTime = 50 + randomFactor * 50; break;
        case 'O(n³)': execTime = 200 + randomFactor * 100; break;
        case 'O(2^n)': execTime = 1000 + randomFactor * 1000; break;
        default: execTime = 0;
      }

      // Calculate realistic memory usage based on data structures
      let memoryUsage = 8; // Base memory for function

      // Add memory for data structures
      if (code.includes('set(') || code.includes('dict(')) {
        memoryUsage += 32; // Hash table overhead
      }
      if (code.includes('[]') || code.includes('list(')) {
        memoryUsage += 24; // List overhead
      }
      if (code.includes('result') || code.includes('duplicates')) {
        memoryUsage += 16; // Result storage
      }

      // Memory complexity based on algorithm
      switch (detectedComplexity) {
        case 'O(1)': memoryUsage += randomFactor * 5; break;
        case 'O(log n)': memoryUsage += 5 + randomFactor * 10; break;
        case 'O(n)': memoryUsage += 20 + randomFactor * 25; break;
        case 'O(n²)': memoryUsage += 50 + randomFactor * 40; break;
        default: memoryUsage += 15 + randomFactor * 20;
      }

      setMetrics({
        executionTime: execTime,
        memoryUsage: Math.round(memoryUsage * 100) / 100,
        complexity: detectedComplexity,
        codeQuality: Math.min(100, Math.max(0, Math.round(quality)))
      });

      setIsRunning(false);
    }, 1000);
  };

  const handleHintUsed = () => {
    setHintsUsed(prev => prev + 1);
  };

  const handleQuestionAsked = () => {
    // Track questions asked for analytics
  };

  return (
    <div className="h-screen bg-black text-white flex flex-col overflow-hidden selection:bg-purple-500/30">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-xl border-b border-white/10 px-6 py-3 flex-shrink-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link
              href="/"
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Exit</span>
            </Link>
            <div className="h-6 w-px bg-white/10"></div>
            <div className="flex items-center space-x-3">
              <Logo className="scale-90" />
            </div>
          </div>

          {/* Stats & Controls */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-6 text-sm text-gray-400 bg-white/5 px-4 py-2 rounded-full border border-white/5">
              <div className="flex items-center space-x-2">
                <Timer className="w-4 h-4 text-purple-400" />
                <span className="font-mono text-white">{Math.floor(timeElapsed / 60)}:{String(timeElapsed % 60).padStart(2, '0')}</span>
              </div>
              <div className="w-px h-4 bg-white/10"></div>
              <div className="flex items-center space-x-2">
                <HelpCircle className="w-4 h-4 text-blue-400" />
                <span>{hintsUsed} Hints</span>
              </div>
              <div className="w-px h-4 bg-white/10"></div>
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-indigo-400" />
                <span>{problemsCompleted} Completed</span>
              </div>
              <div className="w-px h-4 bg-white/10"></div>
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-green-400" />
                <span>{codeSubmissions} Submissions</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={runCode}
                disabled={isRunning}
                className="flex items-center space-x-2 bg-white text-black hover:bg-gray-200 disabled:bg-gray-600 disabled:text-gray-400 px-4 py-2 rounded-full transition-all duration-200 font-medium text-sm"
              >
                {isRunning ? <Clock className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{isRunning ? 'Running...' : 'Run Code'}</span>
              </button>

              <button
                onClick={handleSubmitProblem}
                disabled={!hasStartedCoding || isRunning}
                className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:from-gray-800 disabled:to-gray-800 text-white px-4 py-2 rounded-full transition-all duration-200 font-medium text-sm shadow-lg shadow-green-900/20"
              >
                <Send className="w-4 h-4" />
                <span>Submit</span>
              </button>

              {interviewPhase === 'submitted' && currentProblemIndex < CODING_PROBLEMS.length - 1 && (
                <button
                  onClick={handleNextProblem}
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white px-4 py-2 rounded-full transition-all duration-200 font-medium text-sm"
                >
                  <ChevronRight className="w-4 h-4" />
                  <span>Next</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Left Panel: Problem & Metrics */}
        <div className="w-[400px] bg-black border-r border-white/10 flex flex-col">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between mb-4">
              <span className={`px-2 py-1 rounded text-xs font-medium border ${currentProblem.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                  currentProblem.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                    'bg-red-500/10 text-red-400 border-red-500/20'
                }`}>
                {currentProblem.difficulty}
              </span>
              <span className="text-xs text-gray-500">{currentProblem.category}</span>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">{currentProblem.title}</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
            {/* Description */}
            <div className="prose prose-invert prose-sm max-w-none">
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Description</h3>
              <div className="text-gray-300 leading-relaxed whitespace-pre-line">{currentProblem.description}</div>
            </div>

            {/* Examples */}
            <div>
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Examples</h3>
              <div className="space-y-3">
                {currentProblem.testCases.slice(0, 2).map((example: { input: string; output: string; explanation?: string }, idx: number) => (
                  <div key={idx} className="bg-white/5 rounded-lg p-4 border border-white/5">
                    <div className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-2 text-sm">
                      <span className="text-gray-500">Input:</span>
                      <code className="text-purple-300 font-mono">{example.input}</code>
                      <span className="text-gray-500">Output:</span>
                      <code className="text-green-300 font-mono">{example.output}</code>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Constraints */}
            <div>
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Constraints</h3>
              <ul className="space-y-2">
                {['Array length: 1 ≤ n ≤ 10^5', 'Time complexity: O(n)', 'Space complexity: O(n)'].map((constraint: string, idx: number) => (
                  <li key={idx} className="flex items-center text-sm text-gray-400">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3"></div>
                    {constraint}
                  </li>
                ))}
              </ul>
            </div>

            {/* Metrics Card */}
            <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-xl p-5 border border-white/10">
              <h3 className="text-sm font-medium text-white mb-4 flex items-center">
                <BarChart3 className="w-4 h-4 mr-2 text-purple-400" />
                Performance Analysis
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/40 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">Time Complexity</div>
                  <div className="text-lg font-mono text-purple-400">{metrics.complexity}</div>
                </div>
                <div className="bg-black/40 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">Execution Time</div>
                  <div className="text-lg font-mono text-blue-400">{metrics.executionTime > 0 ? `${metrics.executionTime.toFixed(1)}ms` : '-'}</div>
                </div>
                <div className="bg-black/40 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">Memory Usage</div>
                  <div className="text-lg font-mono text-yellow-400">{metrics.memoryUsage > 0 ? `${metrics.memoryUsage.toFixed(1)}MB` : '-'}</div>
                </div>
                <div className="bg-black/40 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">Code Quality</div>
                  <div className="text-lg font-mono text-green-400">{metrics.codeQuality > 0 ? `${metrics.codeQuality}%` : '-'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Center Panel: Code Editor */}
        <div className="flex-1 flex flex-col bg-[#1e1e1e] border-r border-white/10 relative">
          <div className="absolute inset-0 bg-black/20 pointer-events-none z-10" /> {/* Dark overlay for depth */}
          <div className="px-4 py-2 bg-black border-b border-white/10 flex items-center justify-between z-20">
            <div className="flex items-center space-x-2">
              <Code2 className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-gray-300">solution.py</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <div className={`w-2 h-2 rounded-full ${hasStartedCoding ? 'bg-green-500' : 'bg-gray-600'}`}></div>
              <span>{hasStartedCoding ? 'Editing' : 'Ready'}</span>
            </div>
          </div>
          <div className="flex-1 relative z-0">
            <CodeEditor
              value={code}
              onChange={setCode}
              language="python"
            />
          </div>
        </div>

        {/* Right Panel: AI Interviewer */}
        <div className="w-[400px] bg-black flex flex-col">
          <div className="px-6 py-4 border-b border-white/10 bg-white/5 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-900/20">
                  <MessageSquare className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">AI Interviewer</h3>
                  <div className="flex items-center space-x-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-xs text-green-400 font-medium">Online</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-0 bg-black/50">
            <EnhancedChatInterface
              onHintUsed={handleHintUsed}
              onQuestionAsked={handleQuestionAsked}
              currentCode={code}
              problemTitle={currentProblem.title}
              currentProblem={currentProblem}
              interviewPhase={interviewPhase}
              aiCodeResponse={aiCodeResponse}
              onCodeResponseHandled={() => setAiCodeResponse('')}
              resumeContext={SAMPLE_RESUME}
              premadeQuestions={resumeQuestions}
            />
          </div>
        </div>
      </div>

      {/* Camera View */}
      <CameraView />
    </div>
  );
}