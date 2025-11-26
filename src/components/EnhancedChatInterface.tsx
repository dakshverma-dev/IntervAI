'use client';

import { useState, useEffect } from 'react';
import { Bot, Send, Loader2, Mic, MicOff, Sparkles } from 'lucide-react';
import AIService from '@/services/AIService';
import VoiceControls from './VoiceControls';
import { voiceService } from '@/services/VoiceService';
import { CodingProblem } from '@/data/problems';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isHint?: boolean;
  isQuestion?: boolean;
}

interface EnhancedChatInterfaceProps {
  onHintUsed?: () => void;
  onQuestionAsked?: () => void;
  currentCode?: string;
  problemTitle?: string;
  currentProblem?: CodingProblem;
  interviewPhase?: string;
  aiCodeResponse?: string;
  onCodeResponseHandled?: () => void;
  resumeContext?: string;
  premadeQuestions?: string[];
}

export default function EnhancedChatInterface({
  onHintUsed,
  onQuestionAsked,
  currentCode = '',
  problemTitle = 'Find Duplicates in Array',
  currentProblem,
  interviewPhase = 'initial',
  aiCodeResponse = '',
  onCodeResponseHandled,
  resumeContext = ''
}: EnhancedChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);

  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiService] = useState(() => new AIService());
  const [isSpeakingEnabled] = useState(true);
  const [isHandsFreeMode, setIsHandsFreeMode] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);

  // Initialize voice service on mount and on user interaction
  useEffect(() => {
    const initializeVoice = async () => {
      try {
        console.log('🔄 Initializing voice service in chat interface...');
        await voiceService.ensureReady();
        console.log('✅ Voice service ready for chat interface');
      } catch (error) {
        console.error('❌ Voice service initialization failed in chat interface:', error);
      }
    };

    initializeVoice();

    // Add click listener to ensure voice is unlocked on first user interaction
    const handleUserInteraction = async () => {
      await voiceService.ensureReady();
      document.removeEventListener('click', handleUserInteraction);
    };
    
    document.addEventListener('click', handleUserInteraction);
    
    return () => {
      document.removeEventListener('click', handleUserInteraction);
    };
  }, []);

  // Initial greeting effect
  useEffect(() => {
    if (messages.length === 0 && currentProblem && interviewPhase === 'initial') {
      const sendInitialGreeting = async () => {
        try {
          const greeting = await aiService.getInitialGreeting(
            currentProblem.title,
            currentProblem.description
          );

          const initialMessage: Message = {
            id: '1',
            type: 'assistant',
            content: greeting,
            timestamp: new Date()
          };

          setMessages([initialMessage]);
        } catch (error) {
          console.error('Error getting initial greeting:', error);
          // Fallback greeting that sounds like a professional tech interviewer
          const fallbackMessage: Message = {
            id: '1',
            type: 'assistant',
            content: `Hi, how are you? Best of luck for the interview. Let's begin. Please implement the solution. Start by explaining your approach, then proceed with the implementation.`,
            timestamp: new Date()
          };
          setMessages([fallbackMessage]);
        }
      };

      sendInitialGreeting();
    }
  }, [currentProblem, interviewPhase, messages.length, problemTitle, aiService]);

  // Handle AI code execution responses
  useEffect(() => {
    if (aiCodeResponse && onCodeResponseHandled) {
      const codeResponseMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: aiCodeResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, codeResponseMessage]);

      // Speak the AI response if voice is enabled
      if (isSpeakingEnabled && voiceService.isSupported().speechSynthesis) {
        setIsAiSpeaking(true);
        voiceService.speakText(aiCodeResponse, {
          onEnd: () => setIsAiSpeaking(false),
          onError: (error) => {
            console.warn('⚠️ TTS failed for code response:', error);
            setIsAiSpeaking(false);
          }
        }).catch((error) => {
          console.warn('⚠️ TTS error for code response:', error);
          setIsAiSpeaking(false);
        });
      }

      onCodeResponseHandled(); // Clear the response
    }
  }, [aiCodeResponse, onCodeResponseHandled, isSpeakingEnabled]);

  // Speak AI messages when they are added
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.type === 'assistant' && isSpeakingEnabled && voiceService.isSupported().speechSynthesis) {
        // Only speak new AI messages (not initial messages or code responses which are handled above)
        if (!aiCodeResponse) {
          setIsAiSpeaking(true);
          voiceService.speakText(lastMessage.content, {
            onEnd: () => setIsAiSpeaking(false),
            onError: (error) => {
              console.warn('⚠️ TTS failed for message:', error);
              setIsAiSpeaking(false);
            }
          }).catch((error) => {
            console.warn('⚠️ TTS error for message:', error);
            setIsAiSpeaking(false);
          });
        }
      }
    }
  }, [messages, isSpeakingEnabled, aiCodeResponse]);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Detect message type using AI service
    const messageAnalysis = aiService.detectMessageType(inputMessage);

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
      isHint: messageAnalysis.isHintRequest,
      isQuestion: messageAnalysis.isQuestionAsked
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage('');
    setIsTyping(true);

    // Track analytics
    if (messageAnalysis.isHintRequest && onHintUsed) {
      onHintUsed();
    }
    if (messageAnalysis.isQuestionAsked && onQuestionAsked) {
      onQuestionAsked();
    }

    try {
      // Get AI response from Gemini
      const conversationHistory = messages.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      const aiResponse = await aiService.getInterviewResponse(
        currentInput,
        currentCode,
        `Problem: ${problemTitle}\n\nRESUME CONTEXT:\n${resumeContext}`,
        conversationHistory
      );

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
        isHint: messageAnalysis.isHintRequest
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: "I'm having trouble connecting to my AI brain right now. Can you tell me more about your approach to this problem? 🤔",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const analyzeComplexity = async () => {
    if (!currentCode.trim()) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: "Please write some code first, then I can analyze its time and space complexity! 📝",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    setIsAnalyzing(true);

    try {
      const analysis = await aiService.analyzeCodeComplexity(currentCode);

      const analysisMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: `🔍 **Code Complexity Analysis**\n\n⏱️ **Time Complexity:** ${analysis.timeComplexity}\n💾 **Space Complexity:** ${analysis.spaceComplexity}\n\n📝 **Analysis:** ${analysis.explanation}\n\n💡 **Optimization Tips:**\n${analysis.suggestions.map((tip, i) => `${i + 1}. ${tip}`).join('\n')}`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, analysisMessage]);
    } catch (error) {
      console.error('Error analyzing complexity:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: "I had trouble analyzing your code complexity. Could you tell me about your approach instead? 🤔",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle voice input
  const handleVoiceInput = (transcript: string) => {
    if (transcript.trim()) {
      setInputMessage(transcript);
      // Auto-send voice input after a short delay
      setTimeout(() => {
        if (transcript.trim()) {
          sendMessage();
        }
      }, 500);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const addPredefinedMessage = (message: string) => {
    setInputMessage(message);
  };

  return (
    <div className="flex flex-col h-full bg-black">
      {/* Quick Actions */}
      <div className="p-4 border-b border-white/10 bg-white/5">
        <div className="text-xs font-medium text-gray-400 mb-3 uppercase tracking-wider">Suggested Responses</div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => addPredefinedMessage("I'm thinking about using nested loops for this problem")}
            className="text-xs px-3 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 rounded-lg transition-colors flex items-center space-x-2"
          >
            <span>🔄</span>
            <span>Brute force</span>
          </button>
          <button
            onClick={() => addPredefinedMessage("What about using a hash set for O(1) lookups?")}
            className="text-xs px-3 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 rounded-lg transition-colors flex items-center space-x-2"
          >
            <span>⚡</span>
            <span>Optimization</span>
          </button>
          <button
            onClick={() => addPredefinedMessage("Could I get a progressive hint to guide my thinking?")}
            className="text-xs px-3 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 rounded-lg transition-colors flex items-center space-x-2"
          >
            <span>💡</span>
            <span>Hint</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
        {messages.map((message) => (
          <div key={message.id} className={`flex items-start space-x-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            {message.type === 'assistant' && (
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-900/20">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}

            <div className={`max-w-[85%] px-5 py-4 rounded-2xl shadow-sm relative ${message.type === 'user'
              ? 'bg-white text-black rounded-br-sm'
              : 'bg-white/5 border border-white/10 text-gray-200 rounded-bl-sm'
              }`}>
              {/* Speaking indicator for AI messages */}
              {message.type === 'assistant' && voiceService.getState().isSpeaking && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                </div>
              )}

              <div className="text-sm leading-relaxed whitespace-pre-line">{message.content}</div>

              <div className={`text-[10px] mt-2 flex items-center justify-between ${message.type === 'user' ? 'text-gray-500' : 'text-gray-500'}`}>
                <span>
                  {String(message.timestamp.getHours()).padStart(2, '0')}:
                  {String(message.timestamp.getMinutes()).padStart(2, '0')}
                </span>
              </div>
            </div>

            {message.type === 'user' && (
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0 border border-white/10">
                <span className="text-xs font-bold text-white">You</span>
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-2xl rounded-bl-sm">
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-white/10 p-4 bg-black">
        {/* Controls Row */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={analyzeComplexity}
            disabled={isAnalyzing || !currentCode.trim()}
            className="flex items-center space-x-2 px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-lg transition-colors text-xs font-medium border border-purple-500/20"
          >
            {isAnalyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            <span>Analyze Code</span>
          </button>

          <div className="flex items-center space-x-2">
            <VoiceControls
              onSpeechResult={handleVoiceInput}
              onSpeechStart={() => console.log('Started listening...')}
              onSpeechEnd={() => console.log('Stopped listening...')}
              className="flex"
              isHandsFree={isHandsFreeMode}
              isAiSpeaking={isAiSpeaking}
            />
            <button
              onClick={() => setIsHandsFreeMode(!isHandsFreeMode)}
              className={`p-2 rounded-lg transition-all duration-200 ${isHandsFreeMode
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                }`}
              title="Hands-free Mode"
            >
              {isHandsFreeMode ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Message Input */}
        <div className="relative">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask anything..."
            className="w-full pl-4 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 text-sm text-white placeholder-gray-500 transition-all"
          />
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isTyping}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white text-black rounded-lg hover:bg-gray-200 disabled:bg-gray-600 disabled:text-gray-400 transition-colors"
          >
            {isTyping ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}