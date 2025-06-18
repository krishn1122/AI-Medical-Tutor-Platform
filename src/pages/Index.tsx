
import React from 'react';
import AvatarContainer from '@/components/AvatarContainer';
import MCQInterface from '@/components/MCQInterface';
import SessionControl from '@/components/SessionControl';
import SessionManager from '@/components/SessionManager';

const Index = () => {
  return (
    <SessionManager>
      {({ sessionState, questionState, services, handlers }) => (
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
                  isSessionActive={sessionState.isSessionActive}
                  onAvatarReady={services.handleAvatarReady}
                  currentQuestion={questionState.currentQuestion?.question}
                  sessionId={sessionState.sessionId}
                  heyGenService={services.heyGenService}
                />
              </div>

              {/* MCQ Interface */}
              <div className="lg:col-span-5 h-[600px]">
                <MCQInterface
                  currentQuestion={questionState.currentQuestion}
                  onAnswerSelect={handlers.handleAnswerSelect}
                  timeLeft={sessionState.timeLeft}
                  questionNumber={questionState.currentQuestionIndex + 1}
                  totalQuestions={questionState.questions.length}
                  showExplanation={questionState.showExplanation}
                  explanation={questionState.currentExplanation}
                  isWaitingForNext={questionState.isWaitingForNext}
                  onNextQuestion={handlers.handleNextQuestion}
                />
              </div>

              {/* Session Control */}
              <div className="lg:col-span-2">
                <SessionControl
                  isSessionActive={sessionState.isSessionActive}
                  onStartSession={handlers.handleStartSession}
                  onEndSession={handlers.handleEndSession}
                  onResetSession={handlers.handleResetSession}
                  timeLeft={sessionState.timeLeft}
                  questionsAnswered={sessionState.questionsAnswered}
                  correctAnswers={sessionState.correctAnswers}
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
      )}
    </SessionManager>
  );
};

export default Index;
