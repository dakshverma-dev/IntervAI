'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, CameraOff, Maximize2, Minimize2 } from 'lucide-react';

interface CameraViewProps {
  className?: string;
}

export default function CameraView({ className = '' }: CameraViewProps) {
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [error, setError] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // Don't auto-start camera - let user control it
    // This prevents timeout issues on slower systems
    
    // Cleanup on unmount
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      console.log('🎥 Starting camera...');
      setError('');
      
      // Try with more lenient constraints first
      const constraints = {
        video: {
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          facingMode: 'user',
          frameRate: { ideal: 30, max: 30 }
        },
        audio: false
      };

      console.log('📷 Requesting camera with constraints:', constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      console.log('✅ Camera stream obtained:', stream);
      streamRef.current = stream;
      
      if (videoRef.current) {
        console.log('📹 Setting video source...');
        videoRef.current.srcObject = stream;
        
        // Add a timeout for video loading
        const playTimeout = setTimeout(() => {
          console.warn('⚠️ Video loading timeout - trying fallback');
          if (!isCameraOn && videoRef.current) {
            videoRef.current.play().catch(console.error);
          }
        }, 3000);

        // Set video to play immediately
        videoRef.current.onloadedmetadata = () => {
          clearTimeout(playTimeout);
          console.log('✅ Video metadata loaded');
          videoRef.current?.play().then(() => {
            console.log('✅ Video playing');
            setIsCameraOn(true);
          }).catch((e) => {
            console.error('❌ Video play error:', e);
            // Try to play anyway
            setIsCameraOn(true);
          });
        };

        // Fallback: if metadata doesn't load in time, try playing anyway
        setTimeout(() => {
          if (!isCameraOn && videoRef.current?.readyState >= 2) {
            videoRef.current.play().then(() => {
              setIsCameraOn(true);
            }).catch(console.error);
          }
        }, 1500);
      }
    } catch (err) {
      console.error('❌ Error accessing camera:', err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      
      if (errorMessage.includes('NotAllowedError') || errorMessage.includes('Permission')) {
        setError('Camera permission denied. Please allow camera access in your browser settings.');
      } else if (errorMessage.includes('NotFoundError')) {
        setError('No camera found. Please connect a camera and try again.');
      } else if (errorMessage.includes('AbortError') || errorMessage.includes('Timeout')) {
        setError('Camera startup timeout. Click Retry to try again.');
      } else {
        setError('Could not access camera. Please check permissions and try again.');
      }
      setIsCameraOn(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraOn(false);
  };

  const toggleCamera = () => {
    if (isCameraOn) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  const toggleSize = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`${className}`}>
      <div
        className={`fixed transition-all duration-300 ease-in-out ${
          isExpanded
            ? 'top-20 right-4 w-36 h-28 z-[60]'
            : 'top-20 right-4 w-28 h-20 z-[60]'
        } bg-gray-900 rounded-lg shadow-2xl border border-purple-500/30 overflow-hidden`}
      >
        {/* Controls Bar */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/90 to-transparent p-1 flex items-center justify-between z-10 opacity-0 hover:opacity-100 transition-opacity">
          <div className="flex items-center space-x-1">
            <div className={`w-1.5 h-1.5 rounded-full ${
              isCameraOn ? 'bg-red-500 animate-pulse shadow-lg shadow-red-500/50' : 'bg-gray-500'
            }`} />
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={toggleSize}
              className="p-1 hover:bg-white/20 rounded transition-all"
              title={isExpanded ? 'Minimize' : 'Maximize'}
            >
              {isExpanded ? (
                <Minimize2 className="w-3 h-3 text-white" />
              ) : (
                <Maximize2 className="w-3 h-3 text-white" />
              )}
            </button>
            <button
              onClick={toggleCamera}
              className={`p-1 rounded transition-all ${
                isCameraOn
                  ? 'bg-red-500/30 hover:bg-red-500/40 text-red-300'
                  : 'bg-green-500/30 hover:bg-green-500/40 text-green-300'
              }`}
              title={isCameraOn ? 'Turn off camera' : 'Turn on camera'}
            >
              {isCameraOn ? (
                <CameraOff className="w-3 h-3" />
              ) : (
                <Camera className="w-3 h-3" />
              )}
            </button>
          </div>
        </div>

        {/* Video Feed */}
        <div className="relative w-full h-full bg-gray-950">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${isCameraOn ? 'block' : 'hidden'}`}
            style={{ transform: 'scaleX(-1)' }}
          />
          {!isCameraOn && (
            <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gradient-to-br from-gray-900 to-black">
              <Camera className="w-6 h-6 mb-1 opacity-40" />
              <button
                onClick={startCamera}
                className="mt-1 px-2 py-1 bg-purple-600 hover:bg-purple-700 rounded text-white text-[10px] font-medium transition-colors"
              >
                {error ? 'Retry' : 'Start Camera'}
              </button>
              {error && (
                <p className="mt-1 text-[9px] text-red-400 text-center px-2">{error}</p>
              )}
            </div>
          )}
        </div>

        {/* Info Badge */}
        {isCameraOn && (
          <div className="absolute bottom-1 left-1 bg-black/70 backdrop-blur-sm px-1.5 py-0.5 rounded border border-white/10">
            <p className="text-white text-[10px] font-semibold">You</p>
          </div>
        )}
      </div>
    </div>
  );
}
