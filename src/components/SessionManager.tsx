
import React, { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSession } from '@/hooks/useSession';
import { useQuestions } from '@/hooks/useQuestions';
import { useServices } from '@/hooks/useServices';

interface SessionManagerProps {
  children: (props: {
    sessionState: {
      isSessionActive: boolean;
      timeLeft: number;
      sessionId: string | null;
      questionsAnswered: number;
      correctAnswers: number;
    };
    questionState: {
      currentQuestion: any;
      currentQuestionIndex: number;
      questions: any[];
      showExplanation: boolean;
      currentExplanation: string;
      isWaitingForNext: boolean;
    };
    services: {
      avatarReady: boolean;
      heyGenService: any;
      handleAvatarReady: () => void;
    };
    handlers: {
      handleStartSession: () => void;
      handleEndSession: () => void;
      handleResetSession: () => void;
      handleAnswerSelect: (optionId: string, isCorrect: boolean) => void;
      handleNextQuestion: () => void;
    };
  }) => React.ReactNode;
}

const SessionManager: React.FC<SessionManagerProps> = ({ children }) => {
  const { toast } = useToast();
  const session = useSession();
  const questions = useQuestions();
  const services = useServices();

  const handleStartSession = useCallback(async () => {
    const sessionId = session.startSession();
    questions.initializeQuestions();
    await services.initializeAvatar();
  }, [session, questions, services]);

  const handleEndSession = useCallback(async () => {
    const sessionId = session.endSession();
    
    const accuracy = questions.questionsAnswered > 0 
      ? Math.round((questions.correctAnswers / questions.questionsAnswered) * 100) 
      : 0;
    
    toast({
      title: "Session Complete!",
      description: `You answered ${questions.questionsAnswered} questions with ${accuracy}% accuracy. Great work!`,
    });

    if (questions.incorrectAnswers.length >= 2) {
      const feedback = await services.generateAdaptiveFeedback(questions.incorrectAnswers);
      await services.provideFeedback(false, `Session complete! ${feedback}`);
    } else {
      await services.provideFeedback(true, "Excellent session! You're making great progress in your medical studies. I enjoyed working with you today!");
    }

    services.disconnectServices();
  }, [session, questions, services, toast]);

  const handleResetSession = useCallback(() => {
    session.resetSession();
    questions.resetQuestions();
    services.disconnectServices();
  }, [session, questions, services]);

  const handleAnswerSelect = useCallback(async (optionId: string, isCorrect: boolean) => {
    const result = questions.recordAnswer(optionId, isCorrect);
    if (!result) return;

    if (result.isCorrect) {
      const encouragements = [
        "Excellent! You're really getting the hang of this.",
        "That's correct! Great clinical thinking.",
        "Perfect! Your medical knowledge is showing.",
        "Outstanding work! Let's keep this momentum going."
      ];
      const randomEncouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
      
      await services.provideFeedback(true, randomEncouragement);
      
      setTimeout(() => {
        questions.setWaitingForNext(true);
      }, 2000);
    } else {
      const explanation = await services.generateExplanation(
        result.question.question,
        result.selectedOption?.text || 'Unknown',
        result.correctOption?.text || 'Unknown',
        result.question.category
      );

      questions.setExplanation(explanation);
      await services.provideFeedback(false, "That's not quite right, but great attempt! Let me explain the correct answer.");
      
      setTimeout(async () => {
        await services.giveExplanation(explanation);
        questions.setWaitingForNext(true);
      }, 1000);
    }
  }, [questions, services]);

  const handleNextQuestion = useCallback(async () => {
    const result = questions.moveToNextQuestion();
    
    if (result.hasNext && result.nextQuestion) {
      const options = result.nextQuestion.options.map((opt: any) => opt.text);
      
      setTimeout(async () => {
        await services.speakQuestion(result.nextQuestion.question, options);
      }, 1000);
    } else {
      handleEndSession();
    }
  }, [questions, services, handleEndSession]);

  const handleAvatarReady = useCallback(async () => {
    await services.handleAvatarReady(questions.currentQuestion);
  }, [services, questions.currentQuestion]);

  return children({
    sessionState: {
      isSessionActive: session.isSessionActive,
      timeLeft: session.timeLeft,
      sessionId: session.sessionId,
      questionsAnswered: questions.questionsAnswered,
      correctAnswers: questions.correctAnswers,
    },
    questionState: {
      currentQuestion: questions.currentQuestion,
      currentQuestionIndex: questions.currentQuestionIndex,
      questions: questions.questions,
      showExplanation: questions.showExplanation,
      currentExplanation: questions.currentExplanation,
      isWaitingForNext: questions.isWaitingForNext,
    },
    services: {
      avatarReady: services.avatarReady,
      heyGenService: services.heyGenService,
      handleAvatarReady,
    },
    handlers: {
      handleStartSession,
      handleEndSession,
      handleResetSession,
      handleAnswerSelect,
      handleNextQuestion,
    },
  });
};

export default SessionManager;
