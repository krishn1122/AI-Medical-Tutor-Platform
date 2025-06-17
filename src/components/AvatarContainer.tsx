
import React, { useEffect, useRef, useState } from 'react';
import { Loader2, Mic, MicOff, Video, VideoOff } from 'lucide-react';

interface AvatarContainerProps {
  isSessionActive: boolean;
  onAvatarReady: () => void;
  currentQuestion?: string;
  sessionId?: string;
  heyGenService?: any;
}

const AvatarContainer: React.FC<AvatarContainerProps> = ({
  isSessionActive,
  onAvatarReady,
  currentQuestion,
  sessionId,
  heyGenService
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    if (isSessionActive && !isConnected && heyGenService) {
      initializeAvatar();
    }
  }, [isSessionActive, heyGenService]);

  const initializeAvatar = async () => {
    setIsLoading(true);
    setConnectionError(null);
    
    try {
      console.log('Initializing HeyGen streaming avatar...');
      const success = await heyGenService.initializeStream();
      
      if (success) {
        const url = heyGenService.getStreamUrl();
        setStreamUrl(url);
        setIsConnected(true);
        
        // Set up video stream if URL is available
        if (url && videoRef.current) {
          videoRef.current.src = url;
          videoRef.current.play().catch(console.error);
        }
        
        onAvatarReady();
      } else {
        setConnectionError('Failed to connect to HeyGen avatar service');
      }
    } catch (error) {
      console.error('Avatar initialization failed:', error);
      setConnectionError('Avatar initialization failed');
    } finally {
      setIsLoading(false);
    }
  };

  const speakQuestion = async (question: string) => {
    if (!isConnected || !heyGenService) return;
    
    setIsSpeaking(true);
    try {
      await heyGenService.sendMessage({
        text: question,
        type: 'question'
      });
      
      // Simulate speaking duration - in real implementation, you'd listen for HeyGen events
      setTimeout(() => {
        setIsSpeaking(false);
      }, 5000);
    } catch (error) {
      console.error('Avatar speech failed:', error);
      setIsSpeaking(false);
    }
  };

  useEffect(() => {
    if (currentQuestion && isConnected) {
      speakQuestion(currentQuestion);
    }
  }, [currentQuestion, isConnected]);

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl overflow-hidden border border-gray-600 shadow-2xl">
      {/* Avatar Header */}
      <div className="bg-gradient-to-r from-blue-900 to-purple-900 px-6 py-4 border-b border-gray-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <h3 className="text-white font-bold text-lg">AI Medical Tutor</h3>
          </div>
          <div className="flex items-center space-x-3">
            {isSpeaking ? (
              <div className="flex items-center text-green-400">
                <Mic className="w-5 h-5 mr-2" />
                <div className="flex space-x-1">
                  <div className="w-1 h-5 bg-green-400 rounded animate-pulse"></div>
                  <div className="w-1 h-5 bg-green-400 rounded animate-pulse delay-75"></div>
                  <div className="w-1 h-5 bg-green-400 rounded animate-pulse delay-150"></div>
                </div>
              </div>
            ) : (
              <MicOff className="w-5 h-5 text-gray-400" />
            )}
            {isConnected ? (
              <Video className="w-5 h-5 text-green-400" />
            ) : (
              <VideoOff className="w-5 h-5 text-red-400" />
            )}
          </div>
        </div>
      </div>

      {/* Avatar Video Container */}
      <div className="flex-1 relative bg-gradient-to-b from-gray-800 to-gray-900 flex items-center justify-center">
        {isLoading ? (
          <div className="flex flex-col items-center text-white space-y-4">
            <div className="relative">
              <Loader2 className="w-12 h-12 animate-spin text-blue-400" />
              <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-blue-400 border-t-transparent animate-spin"></div>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-blue-400">Connecting to your tutor...</p>
              <p className="text-sm text-gray-400 mt-1">Initializing HeyGen Avatar</p>
            </div>
          </div>
        ) : connectionError ? (
          <div className="text-center text-white space-y-4">
            <div className="w-24 h-24 bg-red-900 rounded-full flex items-center justify-center mb-4 mx-auto">
              <span className="text-3xl">⚠️</span>
            </div>
            <div>
              <p className="text-red-400 font-semibold">Connection Failed</p>
              <p className="text-gray-400 text-sm mt-1">{connectionError}</p>
            </div>
          </div>
        ) : isConnected ? (
          <div className="w-full h-full relative">
            {streamUrl ? (
              <video
                ref={videoRef}
                className="w-full h-full object-cover rounded-lg"
                autoPlay
                muted={false}
                playsInline
                controls={false}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-32 h-32 bg-blue-800 rounded-full flex items-center justify-center mb-4 mx-auto shadow-lg">
                    <span className="text-5xl">🧑‍⚕️</span>
                  </div>
                  <p className="text-xl font-semibold">Dr. AI Assistant</p>
                  <p className="text-blue-300 text-sm">Ready to help you learn</p>
                </div>
              </div>
            )}
            
            {isSpeaking && (
              <div className="absolute bottom-6 left-6 bg-black bg-opacity-70 px-4 py-2 rounded-full backdrop-blur-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-white text-sm font-medium">Speaking...</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-white space-y-4">
            <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mb-4 mx-auto">
              <span className="text-3xl">🧑‍⚕️</span>
            </div>
            <div>
              <p className="text-gray-300 font-semibold">Tutor Offline</p>
              <p className="text-gray-500 text-sm">Start a session to begin</p>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Status Bar */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-700 px-6 py-3 border-t border-gray-600">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <span className="text-gray-400">Session:</span>
            <span className="text-blue-400 font-mono">{sessionId || 'Not started'}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span className={`font-medium ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvatarContainer;
