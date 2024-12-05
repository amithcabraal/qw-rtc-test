import { WebRTCMessage, GameConnection } from './types';
import { RTCConfiguration } from './config';
import { useGameStore } from '../../store/gameStore';

export class ConnectionManager {
  private gameConnection: GameConnection;
  private messageHandlers: Map<WebRTCMessage['type'], (payload: any) => void>;
  public playerId: string;

  constructor(isHost: boolean, playerId: string) {
    console.log(`Creating ConnectionManager - isHost: ${isHost}, playerId: ${playerId}`);
    this.playerId = playerId;
    this.gameConnection = {
      peerConnections: new Map(),
      isHost,
      playerId
    };

    this.messageHandlers = new Map();
    this.setupMessageHandlers();
  }

  private setupMessageHandlers() {
    console.log('Setting up message handlers');
    this.messageHandlers.set('JOIN', this.handleJoin.bind(this));
    this.messageHandlers.set('QUESTION', this.handleQuestion.bind(this));
    this.messageHandlers.set('BUZZ', this.handleBuzz.bind(this));
    this.messageHandlers.set('ANSWER_RESULT', this.handleAnswerResult.bind(this));
    this.messageHandlers.set('GAME_STATE', this.handleGameState.bind(this));
  }

  async createHostConnection(): Promise<string> {
    console.log('Creating host connection');
    const peerConnection = new RTCPeerConnection(RTCConfiguration);
    
    peerConnection.onicecandidate = (event) => {
      console.log('Host ICE candidate:', event.candidate);
    };

    peerConnection.onconnectionstatechange = () => {
      console.log('Host connection state changed:', peerConnection.connectionState);
    };

    const dataChannel = peerConnection.createDataChannel('gameChannel');
    console.log('Host data channel created');
    
    this.setupDataChannelHandlers(dataChannel);
    
    const offer = await peerConnection.createOffer();
    console.log('Host offer created:', offer);
    await peerConnection.setLocalDescription(offer);
    
    return offer.sdp.slice(-12).replace(/[^A-Z0-9]/g, '');
  }

  async joinGame(code: string): Promise<void> {
    console.log('Joining game with code:', code);
    const peerConnection = new RTCPeerConnection(RTCConfiguration);
    
    peerConnection.onicecandidate = (event) => {
      console.log('Player ICE candidate:', event.candidate);
    };

    peerConnection.onconnectionstatechange = () => {
      console.log('Player connection state changed:', peerConnection.connectionState);
    };
    
    peerConnection.ondatachannel = (event) => {
      console.log('Player received data channel');
      this.setupDataChannelHandlers(event.channel);
      
      event.channel.onopen = () => {
        console.log('Player data channel opened, sending JOIN message');
        const { players } = useGameStore.getState();
        const currentPlayer = players.find(p => !p.isHost);
        if (currentPlayer) {
          console.log('Sending JOIN message for player:', currentPlayer);
          this.sendToHost({
            type: 'JOIN',
            payload: {
              playerId: currentPlayer.id,
              name: currentPlayer.name
            }
          });
        } else {
          console.error('No non-host player found in store');
        }
      };
    };
    
    const answer = await peerConnection.createAnswer();
    console.log('Player answer created:', answer);
    await peerConnection.setLocalDescription(answer);
    
    this.gameConnection.hostConnection = {
      connection: peerConnection,
      dataChannel: undefined
    };
  }

  private setupDataChannelHandlers(dataChannel: RTCDataChannel) {
    console.log('Setting up data channel handlers');
    
    dataChannel.onopen = () => {
      console.log('Data channel opened');
      if (this.gameConnection.hostConnection) {
        console.log('Setting data channel for host connection');
        this.gameConnection.hostConnection.dataChannel = dataChannel;
      }
    };

    dataChannel.onclose = () => {
      console.log('Data channel closed');
    };

    dataChannel.onerror = (error) => {
      console.error('Data channel error:', error);
    };

    dataChannel.onmessage = (event) => {
      console.log('Received message:', event.data);
      try {
        const message: WebRTCMessage = JSON.parse(event.data);
        console.log('Parsed message:', message);
        const handler = this.messageHandlers.get(message.type);
        if (handler) {
          console.log('Handling message of type:', message.type);
          handler(message.payload);
        } else {
          console.warn('No handler found for message type:', message.type);
        }
      } catch (error) {
        console.error('Error handling message:', error);
      }
    };
  }

  private handleJoin(payload: { playerId: string; name: string }) {
    console.log('Handling JOIN message:', payload);
    const { addPlayer } = useGameStore.getState();
    addPlayer({
      id: payload.playerId,
      name: payload.name,
      score: 0,
      isHost: false,
      connectionTime: Date.now()
    });
  }

  private handleQuestion(payload: { question: string; answer: string }) {
    console.log('Handling QUESTION message:', payload);
    const { setCurrentQuestion } = useGameStore.getState();
    setCurrentQuestion({
      id: Date.now().toString(),
      text: payload.question,
      answer: payload.answer
    });
  }

  private handleBuzz(payload: { playerId: string; timestamp: number }) {
    console.log('Handling BUZZ message:', payload);
    const { addBuzzResponse } = useGameStore.getState();
    addBuzzResponse({
      playerId: payload.playerId,
      timestamp: payload.timestamp
    });
  }

  private handleAnswerResult(payload: { correct: boolean; playerId: string }) {
    console.log('Handling ANSWER_RESULT message:', payload);
    const { players, addPlayer } = useGameStore.getState();
    const player = players.find(p => p.id === payload.playerId);
    if (player) {
      const updatedPlayer = {
        ...player,
        score: payload.correct ? player.score + 1 : player.score
      };
      addPlayer(updatedPlayer);
    }
  }

  private handleGameState(payload: { gameStarted: boolean }) {
    console.log('Handling GAME_STATE message:', payload);
    const { setGameStarted } = useGameStore.getState();
    setGameStarted(payload.gameStarted);
  }

  sendToHost(message: WebRTCMessage) {
    console.log('Sending message to host:', message);
    if (this.gameConnection.hostConnection?.dataChannel) {
      this.gameConnection.hostConnection.dataChannel.send(JSON.stringify(message));
    } else {
      console.error('No data channel available to send message to host');
    }
  }

  broadcastToPeers(message: WebRTCMessage) {
    console.log('Broadcasting message to peers:', message);
    this.gameConnection.peerConnections.forEach((connection, peerId) => {
      if (connection.dataChannel) {
        console.log('Sending to peer:', peerId);
        connection.dataChannel.send(JSON.stringify(message));
      } else {
        console.warn('No data channel available for peer:', peerId);
      }
    });
  }
}