export interface WebRTCMessage {
  type: 'JOIN' | 'QUESTION' | 'BUZZ' | 'ANSWER_RESULT' | 'GAME_STATE';
  payload: any;
}

export interface GameConnection {
  hostConnection?: WebRTCConnection;
  peerConnections: Map<string, WebRTCConnection>;
  isHost: boolean;
  playerId: string;
}

export interface WebRTCConnection {
  connection: RTCPeerConnection;
  dataChannel?: RTCDataChannel;
}