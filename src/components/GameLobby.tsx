import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { Users, Crown } from 'lucide-react';
import ConnectionModal from './ConnectionModal';
import { useGameConnection } from '../hooks/useGameConnection';

const GameLobby: React.FC = () => {
  const [playerName, setPlayerName] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const { players, gameStarted, setGameStarted } = useGameStore();
  const { gameCode, hostGame, joinGame } = useGameConnection();

  const handleJoinGame = async () => {
    if (playerName.trim()) {
      if (isHost) {
        await hostGame(playerName);
      }
      setShowConnectionModal(true);
    }
  };

  const handleConnection = async (code: string) => {
    if (!isHost) {
      await joinGame(code, playerName);
    }
    setShowConnectionModal(false);
  };

  const handleStartGame = () => {
    setGameStarted(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-8">Quiz Game Lobby</h1>

        {!gameStarted ? (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your name"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="hostCheckbox"
                checked={isHost}
                onChange={(e) => setIsHost(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="hostCheckbox" className="ml-2 text-sm text-gray-600">
                Join as host
              </label>
            </div>

            <button
              onClick={handleJoinGame}
              disabled={!playerName.trim()}
              className={`w-full py-3 rounded-lg transition-colors ${
                playerName.trim()
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-gray-300 cursor-not-allowed text-gray-500'
              }`}
            >
              Join Game
            </button>

            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Players in Lobby</h2>
              <div className="space-y-2">
                {players.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center">
                      {player.isHost ? (
                        <Crown className="w-5 h-5 text-yellow-500 mr-2" />
                      ) : (
                        <Users className="w-5 h-5 text-gray-500 mr-2" />
                      )}
                      <span>{player.name}</span>
                    </div>
                    {player.isHost && (
                      <span className="text-sm text-gray-500">Host</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {isHost && players.length > 0 && (
              <button
                onClick={handleStartGame}
                className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors mt-4"
              >
                Start Game
              </button>
            )}
          </div>
        ) : (
          <p className="text-center text-gray-600">Game in progress...</p>
        )}
      </div>

      {showConnectionModal && (
        <ConnectionModal
          isHost={isHost}
          onConnect={handleConnection}
          connectionCode={gameCode}
          onClose={() => setShowConnectionModal(false)}
        />
      )}
    </div>
  );
};

export default GameLobby;