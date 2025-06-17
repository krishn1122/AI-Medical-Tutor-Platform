
import React, { useEffect, useRef, useState } from 'react';
import { Loader2, Mic, MicOff } from 'lucide-react';

interface AvatarContainerProps {
  isSessionActive: boolean;
  onAvatarReady: () => void;
  currentQuestion?: string;
  sessionId?: string;
}

const AvatarContainer: React.FC<AvatarContainerProps> = ({
  isSessionActive,
  onAvatarReady,
  currentQuestion,
  sessionId
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // HeyGen Avatar Integration will be implemented here
  useEffect(() => {
    if (isSessionActive && !isConnected) {
      initializeAvatar();
    }
  }, [isSessionActive]);

  const initializeAvatar = async () => {
    setIsLoading(true);
    try {
      // HeyGen streaming avatar initialization
      console.log('Initializing HeyGen streaming avatar...');
      // TODO: Implement HeyGen API integration
      // const avatarStream = await connectToHeyGenAvatar();
      
      // Simulate connection for now
      setTimeout(() => {
        setIsConnected(true);
        setIsLoading(false);
        onAvatarReady();
      }, 2000);
    } catch (error) {
      console.error('Avatar initialization failed:', error);
      setIsLoading(false);
    }
  };

  const speakQuestion = async (question: string) => {
    if (!isConnected) return;
    
    setIsSpeaking(true);
    try {
      // TODO: Send question to HeyGen avatar for speech
      console.log('Avatar speaking:', question);
      
      // Simulate speaking duration
      setTimeout(() => {
        setIsSpeaking(false);
      }, 3000);
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
    <div className="flex flex-col h-full bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
      {/* Avatar Header */}
      <div className="bg-gray-800 px-4 py-3 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold">AI Medical Tutor</h3>
          <div className="flex items-center space-x-2">
            {isSpeaking ? (
              <div className="flex items-center text-green-400">
                <Mic className="w-4 h-4 mr-1" />
                <div className="flex space-x-1">
                  <div className="w-1 h-4 bg-green-400 rounded animate-pulse"></div>
                  <div className="w-1 h-4 bg-green-400 rounded animate-pulse delay-75"></div>
                  <div className="w-1 h-4 bg-green-400 rounded animate-pulse delay-150"></div>
                </div>
              </div>
            ) : (
              <MicOff className="w-4 h-4 text-gray-500" />
            )}
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
          </div>
        </div>
      </div>

      {/* Avatar Video Container */}
      <div className="flex-1 relative bg-gradient-to-b from-gray-800 to-gray-900 flex items-center justify-center">
        {isLoading ? (
          <div className="flex flex-col items-center text-white">
            <Loader2 className="w-8 h-8 animate-spin mb-2" />
            <p className="text-sm text-gray-300">Connecting to your tutor...</p>
          </div>
        ) : isConnected ? (
          <div className="w-full h-full relative">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              muted={false}
              playsInline
            />
            {isSpeaking && (
              <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 px-3 py-1 rounded-full">
                <span className="text-white text-sm">Speaking...</span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-white">
            <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mb-4 mx-auto">
              <span className="text-2xl">🧑‍⚕️</span>
            </div>
            <p className="text-gray-300">Tutor offline</p>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="bg-gray-800 px-4 py-2 border-t border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>Session: {sessionId || 'Not started'}</span>
          <span className={isConnected ? 'text-green-400' : 'text-red-400'}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AvatarContainer;
