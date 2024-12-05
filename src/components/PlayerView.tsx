import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { useWebRTC } from '../hooks/useWebRTC';
import { Bell } from 'lucide-react';

const PlayerView: React.FC = () => {
  const { 
    currentQuestion, 
    buzzResponses,
    addBuzzResponse,
    currentAnswerer,
    players
  } = useGameStore();

  const { sendBuzz } = useWebRTC(false);
  const [localPlayerId, setLocalPlayerId] = useState<string>('');

  useEffect(() => {
    // Get the current player's ID from the players list
    const currentPlayer = players.find(p => !p.isHost);
    if (currentPlayer) {
      setLocalPlayerId(currentPlayer.id);
    }
  }, [players]);

  const handleBuzz = () => {
    if (!localPlayerId) return;
    
    const timestamp = performance.now();
    addBuzzResponse({
      playerId: localPlayerId,
      timestamp
    });
    sendBuzz();
  };

  const canBuzz = currentQuestion && !currentAnswerer;
  const playerBuzzPosition = buzzResponses.findIndex(b => b.playerId === localPlayerId) + 1;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Current Question</h2>
        {currentQuestion ? (
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-lg">{currentQuestion.text}</p>
          </div>
        ) : (
          <p className="text-gray-500">Waiting for question...</p>
        )}
      </div>

      <div className="text-center">
        <button
          onClick={handleBuzz}
          disabled={!canBuzz}
          className={`
            px-8 py-8 rounded-full shadow-lg transition-transform
            ${canBuzz 
              ? 'bg-red-500 hover:bg-red-600 active:transform active:scale-95' 
              : 'bg-gray-300 cursor-not-allowed'
            }
          `}
        >
          <Bell className="w-12 h-12 text-white" />
        </button>

        {playerBuzzPosition > 0 && (
          <div className="mt-4 text-lg font-semibold">
            Your position: {playerBuzzPosition}
          </div>
        )}

        <div className="mt-6 space-y-2">
          {buzzResponses.map((response, index) => {
            const player = players.find(p => p.id === response.playerId);
            return (
              <div
                key={response.playerId}
                className={`p-4 rounded-lg ${
                  response.playerId === localPlayerId
                    ? 'bg-blue-100 border border-blue-300'
                    : 'bg-gray-100'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span>{player?.name || 'Unknown Player'}</span>
                  <span className="text-gray-600">
                    {(response.timestamp / 1000).toFixed(3)}s
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PlayerView;