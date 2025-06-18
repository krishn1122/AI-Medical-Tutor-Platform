
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

const SESSION_DURATION = 15 * 60; // 15 minutes in seconds

export const useSession = () => {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(SESSION_DURATION);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const { toast } = useToast();

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isSessionActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isSessionActive, timeLeft]);

  const startSession = useCallback(() => {
    const newSessionId = `session-${Date.now()}`;
    setSessionId(newSessionId);
    setIsSessionActive(true);
    setTimeLeft(SESSION_DURATION);
    
    toast({
      title: "Session Started!",
      description: "Your 15-minute medical simulation has begun. Good luck!",
    });

    return newSessionId;
  }, [toast]);

  const endSession = useCallback(() => {
    setIsSessionActive(false);
    return sessionId;
  }, [sessionId]);

  const resetSession = useCallback(() => {
    setIsSessionActive(false);
    setTimeLeft(SESSION_DURATION);
    setSessionId(null);
    
    toast({
      title: "Session Reset",
      description: "Ready to start a new learning session!",
    });
  }, [toast]);

  return {
    isSessionActive,
    timeLeft,
    sessionId,
    startSession,
    endSession,
    resetSession
  };
};
