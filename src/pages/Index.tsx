import React, { useState, useEffect, useCallback } from 'react';
import AvatarContainer from '@/components/AvatarContainer';
import MCQInterface from '@/components/MCQInterface';
import SessionControl from '@/components/SessionControl';
import { medicalQuestions, getRandomQuestions, MCQQuestion } from '@/data/medicalQuestions';
import { RealOpenAIService } from '@/services/realOpenAIService';
import { RealHeyGenService } from '@/services/realHeyGenService';
import { useToast } from '@/hooks/use-toast';

const SESSION_DURATION = 15 * 60; // 15 minutes in seconds

const Index = () => {
  // Session state
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(SESSION_DURATION);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Question state
  const [questions, setQuestions] = useState<MCQQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState<Array<{
    question: string;
    category: string;
    userAnswer: string;
  }>>([]);

  // UI state
  const [showExplanation, setShowExplanation] = useState(false);
  const [currentExplanation, setCurrentExplanation] = useState<string>('');
  const [isWaitingForNext, setIsWaitingForNext] = useState(false);
  const [avatarReady, setAvatarReady] = useState(false);

  // Services - using real services now with correct voice ID
  const [openAIService] = useState(new RealOpenAIService());
  const [heyGenService] = useState(new RealHeyGenService({
    avatarId: '1732323320',
    voiceId: 'EXAVITQu4vr4xnSDxMaL' // Your specified female voice ID
  }));
  const { toast } = useToast();

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isSessionActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleEndSession();
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

  const handleStartSession = useCallback(async () => {
    const newSessionId = `session-${Date.now()}`;
    setSessionId(newSessionId);
    setIsSessionActive(true);
    setTimeLeft(SESSION_DURATION);
    
    // Initialize questions
    const sessionQuestions = getRandomQuestions(10);
    setQuestions(sessionQuestions);
    setCurrentQuestionIndex(0);
    
    // Reset counters
    setQuestionsAnswered(0);
    setCorrectAnswers(0);
    setIncorrectAnswers([]);
    setShowExplanation(false);
    
    toast({
      title: "Session Started!",
      description: "Your 15-minute medical simulation has begun. Good luck!",
    });

    // Initialize HeyGen service
    await heyGenService.initializeStream();
  }, [heyGenService, toast]);

  const handleEndSession = useCallback(async () => {
    setIsSessionActive(false);
    
    // Generate session summary
    const accuracy = questionsAnswered > 0 ? Math.round((correctAnswers / questionsAnswered) * 100) : 0;
    
    toast({
      title: "Session Complete!",
      description: `You answered ${questionsAnswered} questions with ${accuracy}% accuracy. Great work!`,
    });

    // Provide adaptive feedback if there were multiple incorrect answers
    if (incorrectAnswers.length >= 2) {
      const feedback = await openAIService.generateAdaptiveFeedback(incorrectAnswers);
      await heyGenService.sendMessage({
        text: `Session complete! ${feedback}`,
        type: 'encouragement'
      });
    } else {
      await heyGenService.sendMessage({
        text: "Excellent session! You're making great progress in your medical studies. I enjoyed working with you today!",
        type: 'encouragement'
      });
    }

    heyGenService.disconnect();
  }, [questionsAnswered, correctAnswers, incorrectAnswers, openAIService, heyGenService, toast]);

  const handleResetSession = useCallback(() => {
    setIsSessionActive(false);
    setTimeLeft(SESSION_DURATION);
    setSessionId(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setQuestionsAnswered(0);
    setCorrectAnswers(0);
    setIncorrectAnswers([]);
    setShowExplanation(false);
    setCurrentExplanation('');
    setIsWaitingForNext(false);
    setAvatarReady(false);
    
    heyGenService.disconnect();
    
    toast({
      title: "Session Reset",
      description: "Ready to start a new learning session!",
    });
  }, [heyGenService, toast]);

  const handleAnswerSelect = useCallback(async (optionId: string, isCorrect: boolean) => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;

    setQuestionsAnswered(prev => prev + 1);

    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      
      // Provide positive feedback through avatar
      const encouragements = [
        "Excellent! You're really getting the hang of this.",
        "That's correct! Great clinical thinking.",
        "Perfect! Your medical knowledge is showing.",
        "Outstanding work! Let's keep this momentum going."
      ];
      const randomEncouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
      
      await heyGenService.provideFeedback(true, randomEncouragement);
      
      // Move to next question after a short delay
      setTimeout(() => {
        setIsWaitingForNext(true);
      }, 2000);
    } else {
      // Track incorrect answer
      const selectedOption = currentQuestion.options.find(opt => opt.id === optionId);
      setIncorrectAnswers(prev => [...prev, {
        question: currentQuestion.question,
        category: currentQuestion.category,
        userAnswer: selectedOption?.text || 'Unknown'
      }]);

      // Generate explanation
      const explanation = await openAIService.generateExplanation(
        currentQuestion.question,
        selectedOption?.text || 'Unknown',
        currentQuestion.options.find(opt => opt.isCorrect)?.text || 'Unknown',
        currentQuestion.category
      );

      setCurrentExplanation(explanation);
      setShowExplanation(true);

      // Provide encouraging feedback through avatar
      await heyGenService.provideFeedback(false, "That's not quite right, but great attempt! Let me explain the correct answer.");
      
      // Give explanation through avatar
      setTimeout(async () => {
        await heyGenService.giveExplanation(explanation);
        setIsWaitingForNext(true);
      }, 1000);
    }
  }, [questions, currentQuestionIndex, openAIService, heyGenService]);

  const handleNextQuestion = useCallback(async () => {
    setShowExplanation(false);
    setCurrentExplanation('');
    setIsWaitingForNext(false);

    const nextIndex = currentQuestionIndex + 1;
    
    if (nextIndex < questions.length) {
      setCurrentQuestionIndex(nextIndex);
      
      // Have avatar read the next question
      const nextQuestion = questions[nextIndex];
      const options = nextQuestion.options.map(opt => opt.text);
      
      setTimeout(async () => {
        await heyGenService.speakQuestion(nextQuestion.question, options);
      }, 1000);
    } else {
      // End session when all questions are answered
      handleEndSession();
    }
  }, [currentQuestionIndex, questions, heyGenService, handleEndSession]);

  const handleAvatarReady = useCallback(async () => {
    setAvatarReady(true);
    
    if (questions.length > 0 && isSessionActive) {
      const currentQuestion = questions[currentQuestionIndex];
      const options = currentQuestion.options.map(opt => opt.text);
      await heyGenService.speakQuestion(currentQuestion.question, options);
    }
  }, [questions, currentQuestionIndex, isSessionActive, heyGenService]);

  const currentQuestion = questions.length > 0 ? questions[currentQuestionIndex] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            AI Medical Tutor Platform
          </h1>
          <p className="text-gray-400 text-xl max-w-3xl mx-auto">
            Interactive MCQ-based medical simulations with real-time AI guidance and streaming avatar
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Avatar Section */}
          <div className="lg:col-span-5 h-[600px]">
            <AvatarContainer
              isSessionActive={isSessionActive}
              onAvatarReady={handleAvatarReady}
              currentQuestion={currentQuestion?.question}
              sessionId={sessionId}
              heyGenService={heyGenService}
            />
          </div>

          {/* MCQ Interface */}
          <div className="lg:col-span-5 h-[600px]">
            <MCQInterface
              currentQuestion={currentQuestion}
              onAnswerSelect={handleAnswerSelect}
              timeLeft={timeLeft}
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={questions.length}
              showExplanation={showExplanation}
              explanation={currentExplanation}
              isWaitingForNext={isWaitingForNext}
              onNextQuestion={handleNextQuestion}
            />
          </div>

          {/* Session Control */}
          <div className="lg:col-span-2">
            <SessionControl
              isSessionActive={isSessionActive}
              onStartSession={handleStartSession}
              onEndSession={handleEndSession}
              onResetSession={handleResetSession}
              timeLeft={timeLeft}
              questionsAnswered={questionsAnswered}
              correctAnswers={correctAnswers}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent font-semibold">
            Powered by HeyGen Streaming Avatar • OpenAI GPT-4 • Advanced Medical Education Technology
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
