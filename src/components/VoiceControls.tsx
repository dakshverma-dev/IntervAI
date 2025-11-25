'use client';

import { useState, useEffect, useCallback } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Settings, Loader2 } from 'lucide-react';
import { voiceService } from '@/services/VoiceService';

// Web Speech API types
declare global {
  interface SpeechRecognitionErrorEvent extends Event {
    error: string;
    message?: string;
  }
}

interface VoiceControlsProps {
  onSpeechResult?: (transcript: string) => void;
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
  className?: string;
  isHandsFree?: boolean;
  isAiSpeaking?: boolean;
}

export default function VoiceControls({
  onSpeechResult,
  onSpeechStart,
  onSpeechEnd,
  className = '',
  isHandsFree = false,
  isAiSpeaking = false
}: VoiceControlsProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [voiceSettings, setVoiceSettings] = useState(voiceService.getSettings());
  // Start with false to prevent hydration mismatch, will be updated on client
  const [supportedFeatures, setSupportedFeatures] = useState({ speechSynthesis: false, speechRecognition: false });
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Mark as client-side after hydration
    setIsClient(true);

    // Only run in browser
    if (typeof window === 'undefined') return;

    // Initialize voice service properly
    const initializeVoiceService = async () => {
      try {
        console.log('🔄 Initializing voice service...');
        await voiceService.ensureReady();

        // Update UI after initialization
        const loadVoices = () => {
          setAvailableVoices(voiceService.getVoices());
        };

        setSupportedFeatures(voiceService.isSupported());
        setVoiceSettings(voiceService.getSettings());
        loadVoices();

        // Listen for voice changes
        window.speechSynthesis?.addEventListener('voiceschanged', loadVoices);

        console.log('✅ Voice service initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize voice service:', error);
      }
    };

    // Initialize immediately
    initializeVoiceService();

    return () => {
      window.speechSynthesis?.removeEventListener('voiceschanged', () => {
        setAvailableVoices(voiceService.getVoices());
      });
    };
  }, []);

  // Handle Hands-free mode interactions
  const startListening = useCallback(async () => {
    if (!supportedFeatures.speechRecognition) {
      alert('Speech recognition is not supported in your browser. Please try Chrome or Edge.');
      return;
    }

    setIsProcessing(true);
    setInterimTranscript('');

    try {
      // Ensure voice service is ready before starting
      console.log('🔄 Ensuring voice service is ready for listening...');
      await voiceService.ensureReady();
      console.log('✅ Voice service ready, starting listening...');
    } catch (error) {
      console.error('❌ Failed to initialize voice service for listening:', error);
      setIsProcessing(false);
      alert('Voice service failed to initialize. Please try again.');
      return;
    }

    voiceService.startListening({
      onStart: () => {
        setIsListening(true);
        setIsProcessing(false);
        onSpeechStart?.();
      },
      onResult: (transcript: string) => {
        setInterimTranscript('');
        onSpeechResult?.(transcript);

        // In hands-free mode, we stay listening (unless AI starts speaking, handled by effect)
        // In manual mode, we stop after one result
        if (!isHandsFree) {
          setIsListening(false);
        }
      },
      onInterimResult: (transcript: string) => {
        setInterimTranscript(transcript);
      },
      onEnd: () => {
        // Only update state if we're not trying to stay listening
        // This prevents flickering in continuous mode
        if (!isHandsFree || isAiSpeaking) {
          setIsListening(false);
        }
        setIsProcessing(false);
        setInterimTranscript('');
        onSpeechEnd?.();
      },
      onError: (error: Error | SpeechRecognitionErrorEvent) => {
        setIsListening(false);
        setIsProcessing(false);
        setInterimTranscript('');

        const errorMessage = error instanceof Error ? error.message :
          (error as SpeechRecognitionErrorEvent)?.error || 'Unknown error';

        console.error('Speech recognition error:', errorMessage);

        // Provide user-friendly error messages
        let userMessage = 'Speech recognition failed. Please try again.';
        if (errorMessage.includes('not-allowed')) {
          userMessage = 'Microphone permission denied. Please allow microphone access and try again.';
        } else if (errorMessage.includes('no-speech')) {
          userMessage = 'No speech detected. Please speak clearly and try again.';
        } else if (errorMessage.includes('network')) {
          userMessage = 'Network error. Please check your connection and try again.';
        }

        // Don't alert in hands-free mode to avoid spamming
        if (!isHandsFree) {
          alert(userMessage);
        }
      }
    });
  }, [supportedFeatures.speechRecognition, onSpeechStart, onSpeechResult, onSpeechEnd, isHandsFree]);

  const stopListening = useCallback(() => {
    voiceService.stopListening();
    setIsListening(false);
    setIsProcessing(false);
    setInterimTranscript('');
  }, []);

  useEffect(() => {
    if (!isHandsFree) return;

    if (isAiSpeaking) {
      // AI started speaking, stop listening to avoid feedback
      if (isListening) {
        stopListening();
      }
    } else {
      // AI stopped speaking (or hasn't started), resume listening if we were interrupted or just starting
      // We use a small delay to ensure the audio has fully stopped
      const timer = setTimeout(() => {
        if (!isListening && !isProcessing && supportedFeatures.speechRecognition) {
          startListening();
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isHandsFree, isAiSpeaking, supportedFeatures.speechRecognition, isListening, isProcessing, startListening, stopListening]);

  const toggleSpeaker = () => {
    const newState = !isSpeakerEnabled;
    setIsSpeakerEnabled(newState);

    if (!newState) {
      voiceService.stopSpeaking();
    }

    // Update voice service settings
    voiceService.updateSettings({ autoSpeak: newState });
  };

  const handleVoiceSettingChange = (setting: string, value: string | number | boolean) => {
    const newSettings = { ...voiceSettings, [setting]: value };
    setVoiceSettings(newSettings);
    voiceService.updateSettings(newSettings);
  };

  const testTTS = async () => {
    try {
      console.log('🧪 Testing TTS from VoiceControls...');

      // Enable debug mode for better troubleshooting
      voiceService.enableDebugMode();

      // Force reinitialize if no voices are available
      const state = voiceService.getState();
      if (state.voicesAvailable === 0) {
        console.log('🔄 No voices available, reinitializing...');
        voiceService.reinitialize();
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      const success = await voiceService.testTTS();
      if (success) {
        alert('✅ TTS test successful! You should hear the test message.');
      } else {
        alert('❌ TTS test failed. Please check the console for error details.');
      }
    } catch (error) {
      console.error('TTS test error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`❌ TTS test failed: ${errorMessage}`);
    }
  };

  return (
    <div className={`voice-controls relative ${className}`}>
      {/* Main Voice Controls */}
      <div className="flex items-center space-x-2">
        {/* Microphone Button */}
        <button
          onClick={isListening ? stopListening : startListening}
          disabled={isProcessing || (!isClient || !supportedFeatures.speechRecognition)}
          className={`relative p-2 rounded-lg transition-all duration-200 ${isListening
            ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30 border border-red-500/30 animate-pulse'
            : isProcessing
              ? 'bg-blue-500/20 text-blue-400 cursor-not-allowed border border-blue-500/30'
              : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          title={
            !isClient
              ? 'Loading voice features...'
              : !supportedFeatures.speechRecognition
                ? 'Speech recognition not supported'
                : isListening
                  ? 'Click to stop listening'
                  : 'Click to start voice input'
          }
        >
          {isProcessing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isListening ? (
            <MicOff className="w-4 h-4" />
          ) : (
            <Mic className="w-4 h-4" />
          )}

          {/* Recording indicator */}
          {isListening && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
          )}
        </button>

        {/* Speaker Toggle */}
        <button
          onClick={toggleSpeaker}
          disabled={!isClient || !supportedFeatures.speechSynthesis}
          className={`p-2 rounded-lg transition-all duration-200 ${isClient && isSpeakerEnabled && supportedFeatures.speechSynthesis
            ? 'bg-white/5 text-green-400 border border-green-500/30 hover:bg-white/10'
            : 'bg-white/5 text-gray-500 border border-white/10 disabled:opacity-50'
            }`}
          title={
            !isClient
              ? 'Loading voice features...'
              : !supportedFeatures.speechSynthesis
                ? 'Text-to-speech not supported'
                : isSpeakerEnabled
                  ? 'AI voice enabled - click to mute'
                  : 'AI voice muted - click to enable'
          }
        >
          {isClient && isSpeakerEnabled && supportedFeatures.speechSynthesis ? (
            <Volume2 className="w-4 h-4" />
          ) : (
            <VolumeX className="w-4 h-4" />
          )}
        </button>

        {/* Settings Button */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`p-2 rounded-lg transition-all duration-200 ${showSettings
            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
            : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'}`}
          title="Voice settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Interim Transcript Display */}
      {interimTranscript && (
        <div className="absolute bottom-full left-0 mb-2 w-64 p-2 bg-black/90 border border-white/10 rounded-lg backdrop-blur-sm z-50">
          <span className="text-xs text-blue-400 font-medium block mb-1">Listening...</span>
          <p className="text-sm text-gray-300">{interimTranscript}</p>
        </div>
      )}

      {/* Voice Settings Panel */}
      {showSettings && (
        <div className="absolute bottom-full left-0 mb-2 w-72 p-4 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl z-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Voice Settings</h3>
            <button
              onClick={() => setShowSettings(false)}
              className="text-gray-500 hover:text-white"
            >
              ×
            </button>
          </div>

          {/* Speech Rate */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-400 mb-2">
              Speech Rate: {voiceSettings.speechRate}x
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={voiceSettings.speechRate}
              onChange={(e) => handleVoiceSettingChange('speechRate', parseFloat(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>

          {/* Volume */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-400 mb-2">
              Volume: {Math.round(voiceSettings.speechVolume * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={voiceSettings.speechVolume}
              onChange={(e) => handleVoiceSettingChange('speechVolume', parseFloat(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>

          {/* Voice Selection */}
          {availableVoices.length > 0 && (
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-400 mb-2">AI Voice</label>
              <select
                value={voiceSettings.preferredVoice}
                onChange={(e) => {
                  handleVoiceSettingChange('preferredVoice', e.target.value);
                  voiceService.setVoice(e.target.value);
                }}
                className="w-full text-xs bg-black border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500/50"
              >
                <option value="female">Female (Auto)</option>
                <option value="male">Male (Auto)</option>
                {availableVoices
                  .filter(voice => voice.lang.startsWith('en'))
                  .map(voice => (
                    <option key={voice.name} value={voice.name}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))
                }
              </select>
            </div>
          )}

          {/* Feature Support Status */}
          <div className="pt-3 border-t border-white/10">
            <div className="flex space-x-4 text-[10px]">
              <span className={`flex items-center ${supportedFeatures.speechSynthesis ? 'text-green-400' : 'text-red-400'}`}>
                {supportedFeatures.speechSynthesis ? '✓' : '✗'} TTS
              </span>
              <span className={`flex items-center ${supportedFeatures.speechRecognition ? 'text-green-400' : 'text-red-400'}`}>
                {supportedFeatures.speechRecognition ? '✓' : '✗'} Recognition
              </span>
            </div>
          </div>

          {/* Test TTS Button */}
          <button
            onClick={testTTS}
            className="w-full mt-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-gray-300 transition-colors border border-white/5"
            disabled={!isClient || !supportedFeatures.speechSynthesis}
          >
            Test Voice Output
          </button>
        </div>
      )}
    </div>
  );
}