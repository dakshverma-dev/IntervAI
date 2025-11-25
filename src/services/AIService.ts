'use client';

import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

interface ExecutionResult {
  output?: string;
  error?: string;
  status?: 'success' | 'error';
  runtime?: number;
  // Code analysis properties
  complexity?: string;
  codeLines?: number;
  hasComments?: boolean;
  hasErrorHandling?: boolean;
  hasFunctionDef?: boolean;
  hasReturnStatement?: boolean;
  hasLoops?: boolean;
  hasConditionals?: boolean;
  isNestedLoop?: boolean;
  hasHashMap?: boolean;
  hasSorting?: boolean;
  isEmpty?: boolean;
  isComplete?: boolean;
}

class AIService {
  private genAI: GoogleGenerativeAI | null;
  private model: GenerativeModel | null;
  private openRouterApiKey: string;

  constructor() {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    this.openRouterApiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || '';
    
    if (!apiKey) {
      // During build time or when API key is missing, create a mock instance
      console.warn('Gemini API key not found - will use OpenRouter or mock mode');
      this.genAI = null;
      this.model = null;
      return;
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    // Using gemini-2.5-flash which is the current stable model
    this.model = this.genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        maxOutputTokens: 1024,
      }
    });
  }

  private checkModelAvailable(): boolean {
    return this.model !== null && this.genAI !== null;
  }

  private getMockResponse(context: string): string {
    return `I'm currently running in demo mode. In a real deployment with proper API configuration, I would provide intelligent AI feedback for: ${context}`;
  }

  private getIntelligentMockResponse(
    userMessage: string,
    conversationHistory: Array<{ role: string; content: string }>,
    currentCode: string,
    interviewPhase: string
  ): string {
    const lowerMessage = userMessage.toLowerCase();

    // Initial greeting
    if (conversationHistory.length <= 1 && interviewPhase === 'initial') {
      return "Hello! I'm your AI interviewer today. I'll be conducting this technical interview with you. Let's start by understanding the problem together. Have you had a chance to read through the problem statement?";
    }

    // Hint requests
    if (lowerMessage.includes('hint') || lowerMessage.includes('help') || lowerMessage.includes('stuck')) {
      return "Let me guide you. Think about the data structure that would give you the fastest lookup time. What comes to mind when you need O(1) lookups? Also, consider what you're trying to track as you iterate through the array.";
    }

    // Complexity questions
    if (lowerMessage.includes('complexity') || lowerMessage.includes('big o') || lowerMessage.includes('time')) {
      if (currentCode.includes('for') && currentCode.includes('for')) {
        return "Looking at your code, I see nested loops. That typically means O(n²) time complexity. Can you think of a way to reduce this to a single pass through the array? Consider using a hash map to store values you've seen.";
      }
      return "The optimal solution for this problem should be O(n) time complexity with a single pass through the array. Are you using any additional data structures to help track the elements you've seen?";
    }

    // Approach questions
    if (lowerMessage.includes('approach') || lowerMessage.includes('start') || lowerMessage.includes('begin')) {
      return "Great question! Let's break down the approach: First, think about what you need to track - you're looking for duplicates, right? So you need to remember what you've seen. What data structure is best for quickly checking 'have I seen this before?'";
    }

    // Code review/submission
    if (lowerMessage.includes('done') || lowerMessage.includes('finished') || lowerMessage.includes('complete')) {
      return "Let me review your code. I can see your implementation. Can you walk me through your solution? What's the time and space complexity of your approach?";
    }

    // Testing questions
    if (lowerMessage.includes('test') || lowerMessage.includes('run') || lowerMessage.includes('execute')) {
      return "Go ahead and run your code! I'll analyze the results. Make sure you test with edge cases like empty arrays, arrays with no duplicates, and arrays where all elements are duplicates.";
    }

    // Solution explanation
    if (lowerMessage.includes('explain') || lowerMessage.includes('why') || lowerMessage.includes('how')) {
      return "Good question! The key insight here is using a hash set. As you iterate through the array, you check if each element is already in the set. If it is, you've found a duplicate. If not, you add it to the set. This gives you O(n) time and O(n) space.";
    }

    // Optimization questions
    if (lowerMessage.includes('optimize') || lowerMessage.includes('better') || lowerMessage.includes('improve')) {
      return "For optimization, focus on reducing unnecessary iterations. Can you solve this in a single pass? Also, think about space complexity - sometimes trading space for time is worth it, especially when dealing with large datasets.";
    }

    // General encouragement or continuation
    const encouragingResponses = [
      "That's a good start! Keep going with that logic. What's your next step?",
      "Interesting approach! Have you considered any edge cases?",
      "I see where you're going with this. Can you explain your thought process?",
      "Good thinking! How would you implement that in code?",
      "That makes sense. What data structure would work best for this?",
      "Nice! Now, how would you handle the case where the array is empty?",
    ];

    return encouragingResponses[Math.floor(Math.random() * encouragingResponses.length)];
  }

  private async callOpenRouter(prompt: string, systemContext?: string): Promise<string> {
    try {
      console.log('🚀 Calling OpenRouter Grok...');
      console.log('API Key present:', this.openRouterApiKey ? 'Yes' : 'No');
      
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openRouterApiKey}`,
          'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://codesage.ai',
          'X-Title': 'CodeSage Interview Platform'
        },
        body: JSON.stringify({
          model: 'google/gemini-flash-1.5-8b:free',
          messages: [
            {
              role: 'system',
              content: systemContext || 'You are IntervAi, an experienced technical interviewer conducting a coding interview. Be encouraging, provide hints when asked, and guide the candidate through problem-solving. Keep responses concise (2-3 sentences).'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 512
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('OpenRouter API error:', response.status, errorData);
        throw new Error(`OpenRouter API error: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      console.log('OpenRouter raw response:', data);
      const aiResponse = data.choices[0]?.message?.content || '';
      
      if (!aiResponse) {
        console.error('Empty response from OpenRouter:', data);
        throw new Error('Empty response from OpenRouter');
      }
      
      console.log('✅ OpenRouter response received:', aiResponse.substring(0, 100) + '...');
      return aiResponse;
    } catch (error) {
      console.error('❌ OpenRouter API call failed:', error);
      throw error;
    }
  }

  /**
   * Generates interview questions based on resume content
   */
  async generateQuestionsFromResume(resumeText: string): Promise<string[]> {
    const prompt = `
    You are IntervAi, an expert technical interviewer. I will provide you with a candidate's resume text.
    
    RESUME CONTENT:
    ${resumeText.substring(0, 5000)}
    
    Based on the skills, projects, and experience in this resume, generate 10 specific technical interview questions.
    Focus on:
    1. Their claimed programming languages (e.g., if they know Python, ask about Python internals).
    2. Technologies mentioned in their projects.
    3. System design concepts relevant to their experience level.
    4. Problem-solving scenarios.
    
    Return ONLY a JSON array of strings, nothing else. Example:
    ["Question 1", "Question 2", ...]
    `;

    try {
      if (!this.checkModelAvailable()) {
        return [
          "Can you explain the difference between a process and a thread?",
          "How does garbage collection work in your preferred language?",
          "Explain the concept of RESTful APIs.",
          "What are the ACID properties in databases?",
          "Describe a challenging bug you faced and how you solved it.",
          "What is the difference between TCP and UDP?",
          "How do you handle state management in frontend applications?",
          "Explain the concept of dependency injection.",
          "What are microservices and when should you use them?",
          "How do you ensure code quality in your projects?"
        ];
      }

      const result = await this.model!.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Extract JSON array from response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return [
        "Tell me about a challenging project you worked on.",
        "What are your strongest technical skills?",
        "How do you approach debugging complex issues?",
        "Explain a technical concept you recently learned.",
        "What is your preferred programming language and why?"
      ];
    } catch (error) {
      console.error('Error generating questions from resume:', error);
      return [
        "Tell me about a challenging project you worked on.",
        "What are your strongest technical skills?",
        "How do you approach debugging complex issues?",
        "Explain a technical concept you recently learned.",
        "What is your preferred programming language and why?"
      ];
    }
  }

  /**
   * Provides initial greeting when starting a problem
   */
  async getInitialGreeting(problemTitle: string, problemDescription: string): Promise<string> {
    const prompt = `You are IntervAi, a senior technical interviewer at a top tech company. A candidate is about to work on "${problemTitle}".

    Problem: ${problemDescription}

    Provide a professional greeting that includes a brief personal touch before moving to the interview:
    - Start with a warm, conversational greeting: "Hey! Good to see you. How's your day going? Ready to tackle some interesting code?"
    - Then transition naturally to the problem: "We're going to look at finding duplicates in an array today."
    - Keep the instructions clear but friendly: "Take your time to think it through. I'm here to collaborate with you, so feel free to think out loud."
    - Keep it professional but very human (2-3 sentences total)
    
    Example tone: "Hello! Hope you're doing well. We've got a classic problem to solve today - finding duplicates in an array. No pressure, just walk me through your initial thoughts and we'll go from there."
    
    Make it sound like a friendly senior colleague or mentor, not a robot. Use "we" to imply collaboration.`;

    try {
      if (!this.checkModelAvailable()) {
        return `Hi, how are you? Best of luck for the interview. Let's begin. Please implement a solution for "${problemTitle}". Start by explaining your approach, then proceed with the implementation.`;
      }

      const result = await this.model!.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error getting initial greeting:', error);
      return `Hi, how are you? Best of luck for the interview. Let's begin. Please implement a solution for "${problemTitle}". Start by explaining your approach, then proceed with the implementation.`;
    }
  }

  /**
   * Provides contextual response when code is executed
   */
  async getCodeExecutionResponse(
    code: string,
    problemTitle: string,
    isFirstRun: boolean = false,
    executionResult?: ExecutionResult
  ): Promise<string> {
    const prompt = `You are IntervAi, an experienced and encouraging AI technical interviewer conducting a live coding session. The candidate just ${isFirstRun ? 'ran their first solution' : 'executed updated code'} for "${problemTitle}".

    CODE SUBMITTED:
    ${code}

    ${executionResult ? `EXECUTION RESULT: ${executionResult}` : ''}

    As an interviewer, provide immediate feedback that:

    1. **Always starts encouraging**: "Good work!", "Nice progress!", "Your logic looks solid!"
    
    2. **Analyzes approach without spoiling**:
    - If brute force/nested loops: "I can see the logic is working! This gives us O(n²) time complexity though. For a dataset of a million records, that's a trillion operations. What if we needed to process this in real-time?"
    - If using better approach: "Excellent! You're thinking about efficiency. This approach shows good algorithmic thinking."
    - If partially correct: "You're on the right track! I see what you're aiming for here."
    
    3. **Guides with questions, never gives direct answers**:
    - "What data structure could help us track what we've seen?"
    - "How could we reduce the number of passes through the data?"
    - "What's another way to approach this problem?"
    
    4. **Relates to real-world scenarios**:
    - "In production systems..."
    - "When handling user data at scale..."
    - "Enterprise applications often need..."
    
    5. **Maintains interview atmosphere**:
    - Ask follow-up questions
    - Encourage thinking aloud
    - Show interest in their thought process
    
    Respond as if you're sitting next to them in a casual pair-programming session. Be conversational, encouraging, and guide them toward better solutions without revealing the answer. 
    Use natural language like "I see what you did there" or "That's a clever trick". 
    Keep it 2-3 sentences. Avoid robotic phrases like "The time complexity is...". Instead say "This might run a bit slow on huge datasets because..."
    
    CRITICAL: Always maintain a supportive, mentor-like tone. Never be harsh or overly formal.`;

    try {
      if (!this.checkModelAvailable()) {
        return this.getFallbackExecutionResponse(code, isFirstRun);
      }

      const result = await this.model!.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error getting code execution response:', error);
      return this.getFallbackExecutionResponse(code, isFirstRun);
    }
  }

  /**
   * Provides guidance when user seems stuck or taking wrong approach
   */
  async getGuidanceResponse(
    problemTitle: string,
    userCode: string,
    timeSpent: number,
    attemptCount: number
  ): Promise<string> {
    const prompt = `You are IntervAi, an experienced technical interviewer. The candidate has been working on "${problemTitle}" for ${timeSpent} minutes and this is attempt ${attemptCount}.

    CURRENT CODE:
    ${userCode}

    The candidate seems to be stuck or may need gentle guidance. Provide supportive feedback that:

    1. **Acknowledges their effort**: "I can see you're really thinking this through..."
    
    2. **Identifies the pattern without spoiling**:
    - If they're overcomplicating: "Sometimes the simplest approach is the best. What's the most straightforward way to think about this?"
    - If missing key insight: "You're close! Think about what information we need to track as we go through the data."
    - If wrong direction: "Interesting approach! Let me ask you this - what if we approached it from a different angle?"
    
    3. **Asks leading questions**:
    - "What would happen if we processed elements one by one?"
    - "What information do we need to remember from previous iterations?"
    - "How would you explain this problem to a friend?"
    
    4. **Encourages different perspective**:
    - "Let's step back for a moment - what's the core problem we're trying to solve?"
    - "What if we drew this out on paper first?"
    
    Be encouraging and helpful without giving away the solution. Keep it supportive and interview-appropriate, 2-3 sentences.`;

    try {
      if (!this.checkModelAvailable()) {
        return "I can see you're working hard on this! Sometimes it helps to step back and think about the problem differently. What's the core challenge we're trying to solve here?";
      }

      const result = await this.model!.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error getting guidance response:', error);
      return "I can see you're working hard on this! Sometimes it helps to step back and think about the problem differently. What's the core challenge we're trying to solve here?";
    }
  }

  /**
   * Provides contextual hints based on current progress
   */
  async getProgressiveHint(
    problemTitle: string,
    userCode: string,
    hintLevel: number // 1-3, increasing specificity
  ): Promise<string> {
    const hintLevels = {
      1: "Think about the problem conceptually first",
      2: "Consider what data structures might help",
      3: "Focus on the algorithm approach"
    };

    const prompt = `You are IntervAi giving a ${hintLevels[hintLevel as keyof typeof hintLevels]} hint for "${problemTitle}".

    CURRENT CODE:
    ${userCode}

    Provide a hint that's appropriate for level ${hintLevel}:
    - Level 1: Conceptual guidance, problem understanding
    - Level 2: Data structure suggestions, general approach
    - Level 3: More specific algorithmic direction (but no direct answers)

    Keep it encouraging and interview-appropriate. Never give the full solution.`;

    try {
      if (!this.checkModelAvailable()) {
        const fallbackHints = {
          1: "Let's think about this step by step. What exactly are we trying to find or achieve?",
          2: "Consider what data structure would help you keep track of elements efficiently.",
          3: "Think about whether you need to compare every element with every other element, or if there's a smarter way."
        };
        return fallbackHints[hintLevel as keyof typeof fallbackHints] || "Keep thinking - you're on the right track!";
      }

      const result = await this.model!.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error getting progressive hint:', error);
      const fallbackHints = {
        1: "Let's think about this step by step. What exactly are we trying to find or achieve?",
        2: "Consider what data structure would help you keep track of elements efficiently.",
        3: "Think about whether you need to compare every element with every other element, or if there's a smarter way."
      };
      return fallbackHints[hintLevel as keyof typeof fallbackHints] || "Keep thinking - you're on the right track!";
    }
  }

  /**
   * Provides closing remarks when interview ends
   */
  async getClosingInteraction(
    problemsSolved: number,
    totalTime: string,
    performance: string
  ): Promise<string> {
    const prompt = `You are IntervAi concluding an interview session. The candidate completed ${problemsSolved} problems in ${totalTime} with ${performance} performance.

    Provide a warm, professional closing that:
    1. Congratulates them on completing the session
    2. Highlights their strengths 
    3. Mentions areas for improvement (if any)
    4. Encourages continued practice
    5. Ends with a positive, motivational note
    
    Style: Supportive mentor tone, like a senior engineer wrapping up a mock interview.
    Length: 3-4 sentences.`;

    try {
      if (!this.checkModelAvailable()) {
        return `🎉 Great work completing ${problemsSolved} problems! You showed solid problem-solving skills and good coding practices. Keep practicing these patterns - you're on the right track for your next interview!`;
      }

      const result = await this.model!.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error getting closing interaction:', error);
      return `🎉 Great work completing ${problemsSolved} problems! You showed solid problem-solving skills and good coding practices. Keep practicing these patterns - you're on the right track for your next interview!`;
    }
  }

  private getFallbackExecutionResponse(code: string, isFirstRun: boolean): string {
    const codeLines = code.toLowerCase();

    // Empty or minimal code
    if (code.trim().length < 10) {
      return isFirstRun
        ? "Great! I see you're starting to code. Talk me through your approach - what's your initial strategy for solving this?"
        : "I'm ready when you are! What are you thinking for the next step?";
    }

    // Detect nested loops (O(n²) complexity)
    if ((codeLines.includes('for i') && codeLines.includes('for j')) ||
      (codeLines.match(/for.*:/g) || []).length >= 2) {
      return isFirstRun
        ? "Good work! Your logic is solid and this will definitely work. I notice this uses nested loops though - O(n²) complexity. For a million-element array, that's a trillion operations. What if we needed to process real-time user data?"
        : "I see you're refining the nested loop approach. For enterprise applications processing large datasets, this O(n²) complexity could become a bottleneck. What data structure might help us track elements more efficiently?";
    }

    // Detect hash-based solutions
    if (codeLines.includes('set(') || codeLines.includes('{}') ||
      codeLines.includes('seen') || codeLines.includes('dict') ||
      codeLines.includes('hashmap') || codeLines.includes('hashtable')) {
      return isFirstRun
        ? "Excellent thinking! Using a hash-based approach shows great algorithmic intuition. This gives us O(1) average lookup time. How does this change our overall time complexity?"
        : "Perfect! This hash-based solution is much more efficient - O(n) time complexity. This is exactly what we'd want in a production system. Can you walk me through how this handles edge cases?";
    }

    // Detect sorting-based approaches
    if (codeLines.includes('sort') || codeLines.includes('sorted')) {
      return "Interesting approach! Sorting first is a valid strategy. What's the time complexity when we factor in the sort operation? Are there any trade-offs we should consider?";
    }

    // Detect list comprehensions or functional approaches
    if (codeLines.includes('[') && codeLines.includes('for') && codeLines.includes('in')) {
      return "Nice! I like the functional programming approach - very clean and readable. This is definitely more Pythonic. What's the space complexity of this solution?";
    }

    // Detect conditional logic
    if (codeLines.includes('if') && codeLines.includes('return')) {
      return isFirstRun
        ? "Good start! I can see you're thinking through the logic flow. Tell me more about your approach - what conditions are you checking for?"
        : "I like how you're handling the different cases. Are there any edge cases we should consider? What happens with empty inputs?";
    }

    // Generic encouraging responses for other patterns
    const encouragingResponses = [
      "Good progress! I can see you're thinking systematically about this. What's your next step?",
      "Nice work! Tell me about the approach you're taking - I'd love to understand your thought process.",
      "Solid start! How are you planning to handle the core logic here?",
      "I like where this is going! What's your strategy for optimizing this solution?",
      "Excellent! You're building this step by step. What data structures are you considering?"
    ];

    if (isFirstRun) {
      return "Great! I can see you're getting started. Walk me through your thinking - what's your game plan for tackling this problem?";
    }

    return encouragingResponses[Math.floor(Math.random() * encouragingResponses.length)];
  }

  /**
   * Analyzes code and provides time complexity analysis
   */
  async analyzeCodeComplexity(code: string): Promise<{
    timeComplexity: string;
    spaceComplexity: string;
    explanation: string;
    suggestions: string[];
  }> {
    const prompt = `
    Analyze this code for time and space complexity. Be precise and educational:

    \`\`\`
    ${code}
    \`\`\`

    Please provide:
    1. Time Complexity (Big O notation)
    2. Space Complexity (Big O notation) 
    3. Brief explanation of why
    4. 2-3 optimization suggestions

    Format your response as JSON:
    {
      "timeComplexity": "O(...)",
      "spaceComplexity": "O(...)",
      "explanation": "Brief explanation of the complexity analysis",
      "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"]
    }
    `;

    try {
      if (!this.checkModelAvailable()) {
        return {
          timeComplexity: "O(n)",
          spaceComplexity: "O(1)",
          explanation: "Analysis not available in demo mode",
          suggestions: ["Enable API key for full analysis"]
        };
      }

      const result = await this.model!.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // Fallback if JSON parsing fails
      return {
        timeComplexity: "O(?)",
        spaceComplexity: "O(?)",
        explanation: "Unable to analyze complexity automatically.",
        suggestions: ["Review your algorithm", "Consider edge cases", "Think about optimization"]
      };
    } catch (error) {
      console.error('Error analyzing code complexity:', error);

      // Provide more helpful error messages
      if (error instanceof Error && error.message.includes('not found')) {
        return {
          timeComplexity: "O(?)",
          spaceComplexity: "O(?)",
          explanation: "AI analysis temporarily unavailable. Try manual analysis: count your loops and recursive calls.",
          suggestions: ["Look for nested loops (O(n²))", "Single loops are usually O(n)", "Consider your data structure usage"]
        };
      }

      return {
        timeComplexity: "O(?)",
        spaceComplexity: "O(?)",
        explanation: "Error occurred during analysis.",
        suggestions: ["Check your code syntax", "Try running the code first", "Consider the algorithm's steps manually"]
      };
    }
  }

  /**
   * Provides intelligent interview coaching responses
   */
  async getInterviewResponse(
    userMessage: string,
    currentCode: string,
    problemContext: string,
    conversationHistory: Array<{ role: string; content: string }>
  ): Promise<string> {
    const contextPrompt = `
    You are IntervAi, an expert technical interview coach. You're helping a candidate practice coding interviews.

    PROBLEM CONTEXT: ${problemContext}
    
    CURRENT CODE:
    \`\`\`
    ${currentCode}
    \`\`\`

    CONVERSATION HISTORY:
    ${conversationHistory.slice(-4).map(msg => `${msg.role}: ${msg.content}`).join('\n')}

    CANDIDATE'S MESSAGE: ${userMessage}

    Respond as a supportive but challenging technical interviewer/mentor. Be:
    - Encouraging but honest
    - Focus on problem-solving approach
    - Provide hints that guide thinking, not direct answers
    - Ask follow-up questions to assess understanding
    - Mention time/space complexity when relevant but naturally
    - Keep responses concise (2-3 sentences max)
    - Use emojis sparingly for engagement
    - Use "we" and "us" to foster a collaborative atmosphere
    
    If they ask for hints, provide progressive guidance.
    If they ask about complexity, analyze their current approach.
    If they're stuck, ask clarifying questions about their thought process.
    
    Make the conversation feel continuous and fluid, like a real voice conversation.
    `;

    try {
      // Try OpenRouter first if available
      if (this.openRouterApiKey && this.openRouterApiKey !== 'your_openrouter_api_key_here') {
        try {
          console.log('🚀 Using OpenRouter Grok as primary AI...');
          // Send just the user message, context goes in system prompt
          return await this.callOpenRouter(userMessage, contextPrompt);
        } catch (openRouterError) {
          console.error('❌ OpenRouter failed:', openRouterError);
          // Continue to try Gemini
        }
      }

      // Try Gemini as fallback
      if (this.checkModelAvailable()) {
        console.log('Attempting to call Gemini API with model: gemini-2.5-flash');
        const result = await this.model!.generateContent(contextPrompt);
        const response = await result.response;
        const text = response.text();
        console.log('Gemini API response received successfully');
        return text;
      }

      // If no AI available, use mock responses
      return this.getIntelligentMockResponse(userMessage, conversationHistory, currentCode, 'coding');
    } catch (error) {
      console.error('Error getting AI response:', error);
      console.error('Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });

      // Fallback to intelligent mock responses
      return this.getIntelligentMockResponse(userMessage, conversationHistory, currentCode, 'coding');
    }
  }

  /**
   * Detects if user is asking for hints or complexity analysis
   */
  detectMessageType(message: string): {
    isHintRequest: boolean;
    isComplexityQuestion: boolean;
    isQuestionAsked: boolean;
  } {
    const lowerMsg = message.toLowerCase();

    const hintKeywords = ['hint', 'help', 'stuck', 'clue', 'guidance', 'tip'];
    const complexityKeywords = ['complexity', 'time', 'space', 'big o', 'efficiency', 'optimize'];

    return {
      isHintRequest: hintKeywords.some(keyword => lowerMsg.includes(keyword)),
      isComplexityQuestion: complexityKeywords.some(keyword => lowerMsg.includes(keyword)),
      isQuestionAsked: message.includes('?') || message.includes('how') || message.includes('why') || message.includes('what')
    };
  }
}

export default AIService;