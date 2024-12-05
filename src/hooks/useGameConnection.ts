import { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { generateGameCode } from '../lib/utils';

export function useGameConnection() {
  const [gameCode, setGameCode] = useState<string>('');
  const { addPlayer } = useGameStore();

  const hostGame = async (playerName: string) => {
    // Generate a shorter game code
    const newCode = generateGameCode(4);
    setGameCode(newCode);
    
    // Add the host player
    addPlayer({
      id: Date.now().toString(),
      name: playerName,
      score: 0,
      isHost: true,
    });

    // Store connection info
    sessionStorage.setItem('gameCode', newCode);
    sessionStorage.setItem('isHost', 'true');
    sessionStorage.setItem('playerName', playerName);

    return newCode;
  };

  const joinGame = async (code: string, playerName: string) => {
    if (!code || !playerName) return false;

    // Add the player
    const playerId = Date.now().toString();
    addPlayer({
      id: playerId,
      name: playerName,
      score: 0,
      isHost: false,
    });

    // Store connection info
    sessionStorage.setItem('gameCode', code);
    sessionStorage.setItem('isHost', 'false');
    sessionStorage.setItem('playerName', playerName);
    sessionStorage.setItem('playerId', playerId);

    return true;
  };

  // Restore session on page load
  useEffect(() => {
    const storedCode = sessionStorage.getItem('gameCode');
    const storedIsHost = sessionStorage.getItem('isHost') === 'true';
    const storedName = sessionStorage.getItem('playerName');
    const storedId = sessionStorage.getItem('playerId');

    if (storedCode && storedName) {
      if (storedIsHost) {
        setGameCode(storedCode);
        addPlayer({
          id: Date.now().toString(),
          name: storedName,
          score: 0,
          isHost: true,
        });
      } else if (storedId) {
        addPlayer({
          id: storedId,
          name: storedName,
          score: 0,
          isHost: false,
        });
      }
    }
  }, []);

  return {
    gameCode,
    hostGame,
    joinGame
  };
}