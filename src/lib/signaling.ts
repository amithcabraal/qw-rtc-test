import { PeerConnection } from './webrtc/peer-connection';

const SIGNALING_SERVER = 'wss://free.blitznet.dev/ws/game';

export class SignalingService {
  private ws: WebSocket | null = null;
  private gameCode: string = '';
  private onPeerConnectedCallback: ((peerId: string) => void) | null = null;
  private peerConnections: Map<string, PeerConnection> = new Map();

  connect(gameCode: string): Promise<void> {
    this.gameCode = gameCode;
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(SIGNALING_SERVER);
      
      this.ws.onopen = () => {
        this.ws?.send(JSON.stringify({ type: 'join', gameCode }));
        resolve();
      };
      
      this.ws.onerror = (error) => {
        reject(error);
      };
      
      this.ws.onmessage = async (event) => {
        const message = JSON.parse(event.data);
        await this.handleSignalingMessage(message);
      };
    });
  }

  private async handleSignalingMessage(message: any) {
    switch (message.type) {
      case 'peer-joined':
        await this.handlePeerJoined(message.peerId);
        break;
      case 'offer':
        await this.handleOffer(message.peerId, message.offer);
        break;
      case 'answer':
        await this.handleAnswer(message.peerId, message.answer);
        break;
    }
  }

  private async handlePeerJoined(peerId: string) {
    const peerConnection = new PeerConnection();
    this.peerConnections.set(peerId, peerConnection);
    
    const offer = await peerConnection.createOffer();
    this.ws?.send(JSON.stringify({
      type: 'offer',
      gameCode: this.gameCode,
      peerId,
      offer
    }));

    peerConnection.onConnected(() => {
      this.onPeerConnectedCallback?.(peerId);
    });
  }

  private async handleOffer(peerId: string, offer: string) {
    const peerConnection = new PeerConnection();
    this.peerConnections.set(peerId, peerConnection);
    
    const answer = await peerConnection.createAnswer(offer);
    this.ws?.send(JSON.stringify({
      type: 'answer',
      gameCode: this.gameCode,
      peerId,
      answer
    }));

    peerConnection.onConnected(() => {
      this.onPeerConnectedCallback?.(peerId);
    });
  }

  private async handleAnswer(peerId: string, answer: string) {
    const peerConnection = this.peerConnections.get(peerId);
    if (peerConnection) {
      await peerConnection.handleAnswer(answer);
    }
  }

  onPeerConnected(callback: (peerId: string) => void) {
    this.onPeerConnectedCallback = callback;
  }

  broadcast(data: any) {
    this.peerConnections.forEach(connection => {
      connection.sendMessage(data);
    });
  }

  close() {
    this.ws?.close();
    this.peerConnections.forEach(connection => {
      // Clean up peer connections
    });
  }
}