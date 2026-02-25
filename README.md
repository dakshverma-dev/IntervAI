# IntervAi - AI-Powered Interview Practice Platform

An interactive coding interview practice platform with AI-powered guidance, voice interaction, and real-time feedback.

##  Features

### AI-Powered Interview Experience
- **Interactive AI Interviewer** - IntervAi provides real-time feedback on every code execution
- **Smart Guidance** - AI guides without spoiling answers, just like a real interviewer
- **Complexity Analysis** - Real-time analysis of algorithm complexity (O(n), O(n²), etc.)
- **Approach Recognition** - Detects coding patterns and suggests optimizations

### Voice Integration
- **Text-to-Speech** - AI speaks feedback naturally with human-like voice
- **Speech Recognition** - Voice input for hands-free interaction
- **Browser Compatibility** - Works across Chrome, Safari, Edge, and Firefox
- **Enhanced Error Recovery** - Multiple fallback mechanisms for reliable voice functionality

### Advanced Code Editor
- **Monaco Editor** - VS Code-like editing experience
- **Syntax Highlighting** - Full Python syntax support
- **Real-time Analysis** - Code complexity and pattern detection
- **Multi-problem Support** - Progressive difficulty with 3+ coding challenges

### Interview Metrics
- **Time Tracking** - Monitor coding session duration
- **Attempt Counter** - Track code execution attempts
- **Hint Usage** - Optional hints with usage tracking
- **Progress Analytics** - Performance metrics and feedback

## 🛠️ Tech Stack

- **Framework:** Next.js 15 with TypeScript
- **Styling:** Tailwind CSS
- **AI Integration:** Google Gemini 2.5-flash
- **Voice APIs:** Web Speech API (SpeechSynthesis + SpeechRecognition)
- **Code Editor:** Monaco Editor (VS Code editor component)
- **Icons:** Lucide React
- **Build Tool:** Turbopack

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

3. **Set up environment variables**
Create a `.env.local` file in the root directory and add your Google Gemini API key:
```env
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

4. **Run the development server**
```bash
npm run dev
```

5. **Open in browser**
Navigate to [http://localhost:3000](http://localhost:3000)

##  How to Use

### 1. Start Interview Session
- Click "Start Practice Session" on the homepage
- Choose from available coding problems
- Begin with the first problem

### 2. Coding Experience
- Write your solution in the Monaco editor
- Click "Run Code" for AI feedback after each attempt
- AI provides encouraging guidance without spoiling answers
- Use voice controls for hands-free interaction

### 3. Voice Features
- **Test TTS**: Click "Test TTS" button to verify voice functionality
- **AI Speaking**: AI automatically speaks feedback (can be toggled)
- **Voice Input**: Click microphone for voice-to-text input
- **Settings**: Adjust voice speed, pitch, and volume

##  Coding Problems

### Current Problems
1. **Find Duplicates** (Easy) - Array manipulation and hash sets
2. **Two Sum** (Medium) - Hash map optimization techniques  
3. **Valid Parentheses** (Medium) - Stack data structure patterns

##  Voice Technology

### Text-to-Speech Features
- **Natural Voices** - Prefers high-quality neural voices
- **Human-like Speech** - Enhanced text cleaning for natural flow
- **Browser Compatibility** - Comprehensive fallback mechanisms
- **Error Recovery** - Multiple TTS approaches for reliability

##  Browser Support

### Fully Supported
- **Chrome 90+** - Complete feature support
- **Edge 90+** - Full functionality
- **Safari 14+** - TTS may require user interaction
- **Firefox 90+** - Voice quality may vary

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **Google Gemini** - AI conversation capabilities
- **Monaco Editor** - VS Code editing experience
- **Web Speech API** - Voice interaction technology
- **Next.js Team** - Amazing React framework
- **Tailwind CSS** - Utility-first styling

---

**Built with ❤️ for coding interview success** 🎉
