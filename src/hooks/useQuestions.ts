
import { useState, useCallback } from 'react';
import { getRandomQuestions, MCQQuestion } from '@/data/medicalQuestions';

export const useQuestions = () => {
  const [questions, setQuestions] = useState<MCQQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState<Array<{
    question: string;
    category: string;
    userAnswer: string;
  }>>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [currentExplanation, setCurrentExplanation] = useState<string>('');
  const [isWaitingForNext, setIsWaitingForNext] = useState(false);

  const initializeQuestions = useCallback(() => {
    const sessionQuestions = getRandomQuestions(10);
    setQuestions(sessionQuestions);
    setCurrentQuestionIndex(0);
    setQuestionsAnswered(0);
    setCorrectAnswers(0);
    setIncorrectAnswers([]);
    setShowExplanation(false);
    setCurrentExplanation('');
    setIsWaitingForNext(false);
  }, []);

  const recordAnswer = useCallback((optionId: string, isCorrect: boolean) => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return null;

    setQuestionsAnswered(prev => prev + 1);

    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      return { isCorrect: true, question: currentQuestion };
    } else {
      const selectedOption = currentQuestion.options.find(opt => opt.id === optionId);
      const incorrectAnswer = {
        question: currentQuestion.question,
        category: currentQuestion.category,
        userAnswer: selectedOption?.text || 'Unknown'
      };
      
      setIncorrectAnswers(prev => [...prev, incorrectAnswer]);
      return { 
        isCorrect: false, 
        question: currentQuestion, 
        selectedOption,
        correctOption: currentQuestion.options.find(opt => opt.isCorrect)
      };
    }
  }, [questions, currentQuestionIndex]);

  const setExplanation = useCallback((explanation: string) => {
    setCurrentExplanation(explanation);
    setShowExplanation(true);
  }, []);

  const setWaitingForNext = useCallback((waiting: boolean) => {
    setIsWaitingForNext(waiting);
  }, []);

  const moveToNextQuestion = useCallback(() => {
    setShowExplanation(false);
    setCurrentExplanation('');
    setIsWaitingForNext(false);

    const nextIndex = currentQuestionIndex + 1;
    
    if (nextIndex < questions.length) {
      setCurrentQuestionIndex(nextIndex);
      return { hasNext: true, nextQuestion: questions[nextIndex] };
    } else {
      return { hasNext: false, nextQuestion: null };
    }
  }, [currentQuestionIndex, questions]);

  const resetQuestions = useCallback(() => {
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setQuestionsAnswered(0);
    setCorrectAnswers(0);
    setIncorrectAnswers([]);
    setShowExplanation(false);
    setCurrentExplanation('');
    setIsWaitingForNext(false);
  }, []);

  const currentQuestion = questions.length > 0 ? questions[currentQuestionIndex] : null;

  return {
    questions,
    currentQuestion,
    currentQuestionIndex,
    questionsAnswered,
    correctAnswers,
    incorrectAnswers,
    showExplanation,
    currentExplanation,
    isWaitingForNext,
    initializeQuestions,
    recordAnswer,
    setExplanation,
    setWaitingForNext,
    moveToNextQuestion,
    resetQuestions
  };
};
