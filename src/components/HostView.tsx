import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { Timer, Users, Check, X } from 'lucide-react';

const HostView: React.FC = () => {
  const { 
    players, 
    currentQuestion, 
    buzzResponses,
    setCurrentQuestion,
    clearBuzzResponses,
    currentAnswerer
  } = useGameStore();
  
  const [questionInput, setQuestionInput] = useState('');
  const [answerInput, setAnswerInput] = useState('');

  const handleAskQuestion = () => {
    if (questionInput && answerInput) {
      setCurrentQuestion({
        id: Date.now().toString(),
        text: questionInput,
        answer: answerInput
      });
      clearBuzzResponses();
      setQuestionInput('');
      setAnswerInput('');
    }
  };

  const handleJudgeAnswer = (correct: boolean) => {
    // Handle scoring and next question
    clearBuzzResponses();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Host Controls</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Question</label>
            <input
              type="text"
              value={questionInput}
              onChange={(e) => setQuestionInput(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter your question..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Answer</label>
            <input
              type="text"
              value={answerInput}
              onChange={(e) => setAnswerInput(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter the answer..."
            />
          </div>
          <button
            onClick={handleAskQuestion}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Ask Question
          </button>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Current Question</h3>
        {currentQuestion ? (
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-lg">{currentQuestion.text}</p>
            <p className="text-sm text-gray-600 mt-2">
              Answer: {currentQuestion.answer}
            </p>
          </div>
        ) : (
          <p className="text-gray-500">No question currently active</p>
        )}
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Players</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {players.map((player) => (
            <div
              key={player.id}
              className="bg-white p-4 rounded-lg shadow flex items-center justify-between"
            >
              <div className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                <span>{player.name}</span>
              </div>
              <span className="text-gray-600">Score: {player.score}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">Buzz-ins</h3>
        <div className="space-y-2">
          {buzzResponses.map((response, index) => {
            const player = players.find(p => p.id === response.playerId);
            return (
              <div
                key={response.playerId}
                className={`bg-white p-4 rounded-lg shadow flex items-center justify-between
                  ${response.playerId === currentAnswerer ? 'border-2 border-blue-500' : ''}`}
              >
                <div className="flex items-center">
                  <Timer className="w-5 h-5 mr-2" />
                  <span>{player?.name}</span>
                </div>
                <span className="text-gray-600">
                  {(response.timestamp / 1000).toFixed(3)}s
                </span>
              </div>
            );
          })}
        </div>

        {currentAnswerer && (
          <div className="mt-4 flex space-x-4">
            <button
              onClick={() => handleJudgeAnswer(true)}
              className="bg-green-500 text-white px-4 py-2 rounded flex items-center"
            >
              <Check className="w-5 h-5 mr-2" /> Correct
            </button>
            <button
              onClick={() => handleJudgeAnswer(false)}
              className="bg-red-500 text-white px-4 py-2 rounded flex items-center"
            >
              <X className="w-5 h-5 mr-2" /> Incorrect
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HostView;