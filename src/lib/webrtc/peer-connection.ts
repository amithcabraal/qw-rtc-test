import { RTCConfiguration } from './config';

export class PeerConnection {
  private pc: RTCPeerConnection;
  private dataChannel: RTCDataChannel | null = null;
  private onMessageCallback: ((data: any) => void) | null = null;
  private onConnectedCallback: (() => void) | null = null;

  constructor() {
    this.pc = new RTCPeerConnection(RTCConfiguration);
    this.setupPeerConnectionListeners();
  }

  private setupPeerConnectionListeners() {
    this.pc.onicecandidate = (event) => {
      if (event.candidate === null) {
        // ICE gathering completed
        console.log('ICE gathering completed');
      }
    };

    this.pc.ondatachannel = (event) => {
      this.dataChannel = event.channel;
      this.setupDataChannelListeners();
    };
  }

  private setupDataChannelListeners() {
    if (!this.dataChannel) return;

    this.dataChannel.onopen = () => {
      console.log('Data channel opened');
      this.onConnectedCallback?.();
    };

    this.dataChannel.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.onMessageCallback?.(data);
      } catch (err) {
        console.error('Error parsing message:', err);
      }
    };
  }

  async createOffer(): Promise<string> {
    this.dataChannel = this.pc.createDataChannel('gameChannel');
    this.setupDataChannelListeners();

    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);

    // Wait for ICE gathering to complete
    return new Promise((resolve) => {
      const checkState = () => {
        if (this.pc.iceGatheringState === 'complete') {
          const sdp = btoa(JSON.stringify(this.pc.localDescription));
          resolve(sdp);
        } else {
          setTimeout(checkState, 100);
        }
      };
      checkState();
    });
  }

  async createAnswer(offerSdp: string): Promise<string> {
    const offer = JSON.parse(atob(offerSdp));
    await this.pc.setRemoteDescription(new RTCSessionDescription(offer));
    
    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);

    return new Promise((resolve) => {
      const checkState = () => {
        if (this.pc.iceGatheringState === 'complete') {
          const sdp = btoa(JSON.stringify(this.pc.localDescription));
          resolve(sdp);
        } else {
          setTimeout(checkState, 100);
        }
      };
      checkState();
    });
  }

  async handleAnswer(answerSdp: string) {
    const answer = JSON.parse(atob(answerSdp));
    await this.pc.setRemoteDescription(new RTCSessionDescription(answer));
  }

  onMessage(callback: (data: any) => void) {
    this.onMessageCallback = callback;
  }

  onConnected(callback: () => void) {
    this.onConnectedCallback = callback;
  }

  sendMessage(data: any) {
    if (this.dataChannel?.readyState === 'open') {
      this.dataChannel.send(JSON.stringify(data));
    }
  }
}