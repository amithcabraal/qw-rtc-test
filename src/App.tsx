import React from 'react';
import { useGameStore } from './store/gameStore';
import GameLobby from './components/GameLobby';
import HostView from './components/HostView';
import PlayerView from './components/PlayerView';

function App() {
  const { gameStarted, players } = useGameStore();
  const currentPlayer = players[0]; // This would come from connection logic

  if (!gameStarted) {
    return <GameLobby />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {currentPlayer?.isHost ? <HostView /> : <PlayerView />}
    </div>
  );
}

export default App;