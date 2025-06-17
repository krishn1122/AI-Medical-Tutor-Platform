
import React from 'react';
import { Play, Square, RotateCcw } from 'lucide-react';
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
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h2 className="text-white text-xl font-semibold mb-4">Session Control</h2>
      
      {/* Session Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-900 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-blue-400">{formatTime(timeLeft)}</div>
          <div className="text-sm text-gray-400">Time Left</div>
        </div>
        <div className="bg-gray-900 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-400">{questionsAnswered}</div>
          <div className="text-sm text-gray-400">Questions</div>
        </div>
        <div className="bg-gray-900 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-purple-400">{correctAnswers}</div>
          <div className="text-sm text-gray-400">Correct</div>
        </div>
        <div className="bg-gray-900 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-yellow-400">{accuracy}%</div>
          <div className="text-sm text-gray-400">Accuracy</div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="space-y-3">
        {!isSessionActive ? (
          <Button
            onClick={onStartSession}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            <Play className="w-4 h-4 mr-2" />
            Start Session (15 min)
          </Button>
        ) : (
          <Button
            onClick={onEndSession}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            <Square className="w-4 h-4 mr-2" />
            End Session
          </Button>
        )}
        
        <Button
          onClick={onResetSession}
          variant="outline"
          className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>

      {/* Session Info */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="text-sm text-gray-400 space-y-1">
          <p>• 15-minute focused learning session</p>
          <p>• Interactive MCQ-based medical simulations</p>
          <p>• Real-time AI tutor feedback</p>
          <p>• Adaptive learning progression</p>
        </div>
      </div>
    </div>
  );
};

export default SessionControl;
