import { useEffect, useRef } from 'react';
import { ConnectionManager } from '../lib/webrtc/connection-manager';
import { useGameStore } from '../store/gameStore';

export function useWebRTC(isHost: boolean) {
  const connectionRef = useRef<ConnectionManager | null>(null);
  const { players } = useGameStore();

  useEffect(() => {
    console.log('Initializing WebRTC hook - isHost:', isHost);
    const playerId = `player-${Date.now()}`;
    connectionRef.current = new ConnectionManager(isHost, playerId);

    return () => {
      console.log('Cleaning up WebRTC connection');
      connectionRef.current = null;
    };
  }, [isHost]);

  const createGame = async () => {
    console.log('Creating new game');
    if (!connectionRef.current) {
      console.error('No connection manager available');
      return '';
    }
    const code = await connectionRef.current.createHostConnection();
    console.log('Game created with code:', code);
    return code;
  };

  const joinGame = async (hostOffer: string) => {
    console.log('Joining game with offer:', hostOffer);
    if (!connectionRef.current) {
      console.error('No connection manager available');
      return '';
    }
    await connectionRef.current.joinGame(hostOffer);
    console.log('Successfully joined game');
    return '';
  };

  const sendBuzz = () => {
    console.log('Sending buzz');
    if (!connectionRef.current) {
      console.error('No connection manager available');
      return;
    }
    connectionRef.current.sendToHost({
      type: 'BUZZ',
      payload: {
        playerId: connectionRef.current.playerId,
        timestamp: performance.now()
      }
    });
  };

  const broadcastQuestion = (question: string, answer: string) => {
    console.log('Broadcasting question:', { question, answer });
    if (!connectionRef.current) {
      console.error('No connection manager available');
      return;
    }
    connectionRef.current.broadcastToPeers({
      type: 'QUESTION',
      payload: { question, answer }
    });
  };

  return {
    createGame,
    joinGame,
    sendBuzz,
    broadcastQuestion
  };
}