
import React from 'react';
import { Play, Square, RotateCcw, Timer, Target, CheckCircle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SessionControlProps {
  isSessionActive: boolean;
  onStartSession: () => void;
  onEndSession: () => void;
  onResetSession: () => void;
  timeLeft: number;
  questionsAnswered: number;
  correctAnswers: number;
}

const SessionControl: React.FC<SessionControlProps> = ({
  isSessionActive,
  onStartSession,
  onEndSession,
  onResetSession,
  timeLeft,
  questionsAnswered,
  correctAnswers
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const accuracy = questionsAnswered > 0 ? Math.round((correctAnswers / questionsAnswered) * 100) : 0;

  return (
    <div className="bg-gradient-to-br from-gray-800 via-gray-850 to-gray-900 rounded-xl p-6 border border-gray-600 shadow-2xl h-fit">
      <h2 className="text-white text-xl font-bold mb-6 text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
        Session Control
      </h2>
      
      {/* Session Stats - Improved Design */}
      <div className="space-y-4 mb-8">
        {/* Time Left */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-4 border border-gray-700 hover:border-blue-500 transition-colors">
          <div className="flex items-center justify-center mb-2">
            <Timer className="w-5 h-5 text-blue-400 mr-2" />
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400 mb-1 font-mono">
              {formatTime(timeLeft)}
            </div>
            <div className="text-sm text-gray-400 font-medium">Time Left</div>
          </div>
        </div>

        {/* Questions */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-4 border border-gray-700 hover:border-green-500 transition-colors">
          <div className="flex items-center justify-center mb-2">
            <Target className="w-5 h-5 text-green-400 mr-2" />
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-1">
              {questionsAnswered}
            </div>
            <div className="text-sm text-gray-400 font-medium">Questions</div>
          </div>
        </div>

        {/* Correct Answers */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-4 border border-gray-700 hover:border-purple-500 transition-colors">
          <div className="flex items-center justify-center mb-2">
            <CheckCircle className="w-5 h-5 text-purple-400 mr-2" />
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400 mb-1">
              {correctAnswers}
            </div>
            <div className="text-sm text-gray-400 font-medium">Correct</div>
          </div>
        </div>

        {/* Accuracy */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-4 border border-gray-700 hover:border-yellow-500 transition-colors">
          <div className="flex items-center justify-center mb-2">
            <TrendingUp className="w-5 h-5 text-yellow-400 mr-2" />
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400 mb-1">
              {accuracy}%
            </div>
            <div className="text-sm text-gray-400 font-medium">Accuracy</div>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="space-y-3 mb-6">
        {!isSessionActive ? (
          <Button
            onClick={onStartSession}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            <Play className="w-5 h-5 mr-2" />
            Start Session (15 min)
          </Button>
        ) : (
          <Button
            onClick={onEndSession}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            <Square className="w-5 h-5 mr-2" />
            End Session
          </Button>
        )}
        
        <Button
          onClick={onResetSession}
          variant="outline"
          className="w-full border-2 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500 py-4 text-lg font-semibold rounded-lg transition-all duration-200 transform hover:scale-105"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          Reset
        </Button>
      </div>

      {/* Session Info */}
      <div className="pt-6 border-t border-gray-700">
        <div className="text-sm text-gray-400 space-y-2 leading-relaxed">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
            <span>15-minute focused learning session</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
            <span>Interactive MCQ-based simulations</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
            <span>Real-time AI tutor feedback</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
            <span>Adaptive learning progression</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionControl;
