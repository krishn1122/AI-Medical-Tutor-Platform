
import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MCQOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface MCQQuestion {
  id: string;
  question: string;
  options: MCQOption[];
  category: string;
  explanation: string;
}

interface MCQInterfaceProps {
  currentQuestion: MCQQuestion | null;
  onAnswerSelect: (optionId: string, isCorrect: boolean) => void;
  timeLeft: number;
  questionNumber: number;
  totalQuestions: number;
  showExplanation: boolean;
  explanation?: string;
  isWaitingForNext: boolean;
  onNextQuestion: () => void;
}

const MCQInterface: React.FC<MCQInterfaceProps> = ({
  currentQuestion,
  onAnswerSelect,
  timeLeft,
  questionNumber,
  totalQuestions,
  showExplanation,
  explanation,
  isWaitingForNext,
  onNextQuestion
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);

  useEffect(() => {
    // Reset state when question changes
    setSelectedOption(null);
    setAnswerSubmitted(false);
  }, [currentQuestion?.id]);

  const handleOptionSelect = (optionId: string) => {
    if (answerSubmitted) return;
    setSelectedOption(optionId);
  };

  const handleSubmitAnswer = () => {
    if (!selectedOption || !currentQuestion) return;
    
    const selectedOptionData = currentQuestion.options.find(opt => opt.id === selectedOption);
    if (selectedOptionData) {
      setAnswerSubmitted(true);
      onAnswerSelect(selectedOption, selectedOptionData.isCorrect);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900 rounded-lg border border-gray-700">
        <div className="text-center text-white">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4 mx-auto">
            <span className="text-2xl">📚</span>
          </div>
          <h3 className="text-xl font-semibold mb-2">Ready to Learn?</h3>
          <p className="text-gray-300">Start your session to begin the medical simulation.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-lg border border-gray-700">
      {/* Header */}
      <div className="bg-gray-800 px-6 py-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-blue-400 font-semibold">
              Question {questionNumber} of {totalQuestions}
            </span>
            <div className="w-full bg-gray-700 rounded-full h-2 max-w-xs">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
              ></div>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-white">
            <Clock className="w-4 h-4" />
            <span className={`font-mono ${timeLeft < 60 ? 'text-red-400' : 'text-green-400'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="mb-6">
          <div className="bg-blue-900 bg-opacity-30 border border-blue-700 rounded-lg p-4 mb-6">
            <h2 className="text-white text-lg font-medium leading-relaxed">
              {currentQuestion.question}
            </h2>
          </div>

          {/* MCQ Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedOption === option.id;
              const showResult = answerSubmitted;
              const isCorrect = option.isCorrect;
              
              let optionStyle = "bg-gray-800 hover:bg-gray-700 border-gray-600";
              
              if (showResult) {
                if (isCorrect) {
                  optionStyle = "bg-green-900 border-green-600";
                } else if (isSelected && !isCorrect) {
                  optionStyle = "bg-red-900 border-red-600";
                } else {
                  optionStyle = "bg-gray-800 border-gray-600 opacity-50";
                }
              } else if (isSelected) {
                optionStyle = "bg-blue-900 border-blue-600";
              }

              return (
                <button
                  key={option.id}
                  onClick={() => handleOptionSelect(option.id)}
                  disabled={answerSubmitted}
                  className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${optionStyle}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="flex-shrink-0 w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-white font-semibold">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="text-white">{option.text}</span>
                    </div>
                    {showResult && isCorrect && (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    )}
                    {showResult && isSelected && !isCorrect && (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Explanation */}
        {showExplanation && explanation && (
          <div className="bg-yellow-900 bg-opacity-30 border border-yellow-700 rounded-lg p-4 mb-4">
            <h3 className="text-yellow-400 font-semibold mb-2">Explanation</h3>
            <p className="text-white leading-relaxed">{explanation}</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="bg-gray-800 px-6 py-4 border-t border-gray-700">
        {!answerSubmitted ? (
          <Button
            onClick={handleSubmitAnswer}
            disabled={!selectedOption}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Submit Answer
          </Button>
        ) : isWaitingForNext ? (
          <Button
            onClick={onNextQuestion}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            <ArrowRight className="w-4 h-4 mr-2" />
            Next Question
          </Button>
        ) : (
          <div className="text-center text-gray-400">
            <p>Preparing next question...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MCQInterface;
