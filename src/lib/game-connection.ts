import { SignalingService } from './signaling';
import { useGameStore } from '../store/gameStore';

class GameConnection {
  private static instance: GameConnection;
  private signaling: SignalingService | null = null;
  private gameCode: string | null = null;
  private isHost: boolean = false;

  private constructor() {}

  static getInstance(): GameConnection {
    if (!GameConnection.instance) {
      GameConnection.instance = new GameConnection();
    }
    return GameConnection.instance;
  }

  async hostGame(code: string): Promise<void> {
    this.isHost = true;
    this.gameCode = code;
    
    this.signaling = new SignalingService();
    await this.signaling.connect(code);
    
    this.signaling.onPeerConnected((peerId) => {
      console.log('New peer connected:', peerId);
    });
    
    sessionStorage.setItem('gameCode', code);
    sessionStorage.setItem('isHost', 'true');
  }

  async joinGame(code: string, playerName: string): Promise<void> {
    this.isHost = false;
    this.gameCode = code;
    
    this.signaling = new SignalingService();
    await this.signaling.connect(code);
    
    this.signaling.onPeerConnected(() => {
      const { addPlayer } = useGameStore.getState();
      addPlayer({
        id: Date.now().toString(),
        name: playerName,
        score: 0,
        isHost: false
      });
    });
    
    sessionStorage.setItem('gameCode', code);
    sessionStorage.setItem('isHost', 'false');
    sessionStorage.setItem('playerName', playerName);
  }

  sendToHost(message: any) {
    if (!this.isHost && this.signaling) {
      this.signaling.broadcast(message);
    }
  }

  broadcastToPlayers(message: any) {
    if (this.isHost && this.signaling) {
      this.signaling.broadcast(message);
    }
  }

  cleanup() {
    this.signaling?.close();
    this.signaling = null;
    this.gameCode = null;
    this.isHost = false;
    
    sessionStorage.removeItem('gameCode');
    sessionStorage.removeItem('isHost');
    sessionStorage.removeItem('playerName');
  }
}

export const gameConnection = GameConnection.getInstance();