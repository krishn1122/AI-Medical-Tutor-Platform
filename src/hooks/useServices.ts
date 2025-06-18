
import { useState, useCallback } from 'react';
import { RealOpenAIService } from '@/services/realOpenAIService';
import { RealHeyGenService } from '@/services/realHeyGenService';

export const useServices = () => {
  const [avatarReady, setAvatarReady] = useState(false);
  
  const [openAIService] = useState(new RealOpenAIService());
  const [heyGenService] = useState(new RealHeyGenService({
    avatarId: '1732323320',
    voiceId: 'EXAVITQu4vr4xnSDxMaL'
  }));

  const initializeAvatar = useCallback(async () => {
    await heyGenService.initializeStream();
  }, [heyGenService]);

  const handleAvatarReady = useCallback(async (currentQuestion: any) => {
    setAvatarReady(true);
    
    if (currentQuestion) {
      const options = currentQuestion.options.map((opt: any) => opt.text);
      await heyGenService.speakQuestion(currentQuestion.question, options);
    }
  }, [heyGenService]);

  const provideFeedback = useCallback(async (isCorrect: boolean, encouragement: string) => {
    await heyGenService.provideFeedback(isCorrect, encouragement);
  }, [heyGenService]);

  const giveExplanation = useCallback(async (explanation: string) => {
    await heyGenService.giveExplanation(explanation);
  }, [heyGenService]);

  const speakQuestion = useCallback(async (question: string, options: string[]) => {
    await heyGenService.speakQuestion(question, options);
  }, [heyGenService]);

  const generateExplanation = useCallback(async (
    question: string,
    userAnswer: string,
    correctAnswer: string,
    category: string
  ) => {
    return await openAIService.generateExplanation(question, userAnswer, correctAnswer, category);
  }, [openAIService]);

  const generateAdaptiveFeedback = useCallback(async (incorrectAnswers: any[]) => {
    return await openAIService.generateAdaptiveFeedback(incorrectAnswers);
  }, [openAIService]);

  const disconnectServices = useCallback(() => {
    heyGenService.disconnect();
    setAvatarReady(false);
  }, [heyGenService]);

  return {
    avatarReady,
    openAIService,
    heyGenService,
    initializeAvatar,
    handleAvatarReady,
    provideFeedback,
    giveExplanation,
    speakQuestion,
    generateExplanation,
    generateAdaptiveFeedback,
    disconnectServices
  };
};
