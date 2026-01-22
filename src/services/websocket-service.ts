import { io, Socket } from 'socket.io-client';
import CryptoJS from 'crypto-js';
import {
  Message,
  UserPresence,
  ConnectionStatus,
  WebSocketEvent,
  TypingIndicator
} from '../types/real-time-messaging.types';

class WebSocketService {
  private socket: Socket | null = null;
  private readonly ENCRYPTION_KEY = process.env.NEXT_PUBLIC_WEBSOCKET_ENCRYPTION_KEY || 'default-key';
  private messageQueue: Message[] = [];
  private connectionStatus: ConnectionStatus = {
    isConnected: false,
    lastPing: 0,
    latency: 0,
    reconnectAttempts: 0,
  };
  private readonly MAX_RECONNECT_ATTEMPTS = 5;
  private readonly RECONNECT_INTERVAL = 5000;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeSocket();
  }

  private initializeSocket(): void {
    this.socket = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'http://localhost:3001', {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: this.MAX_RECONNECT_ATTEMPTS,
      reconnectionDelay: this.RECONNECT_INTERVAL,
    });

    this.setupEventListeners();
    this.startHeartbeat();
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      this.connectionStatus.isConnected = true;
      this.connectionStatus.reconnectAttempts = 0;
      this.processMessageQueue();
    });

    this.socket.on('disconnect', () => {
      this.connectionStatus.isConnected = false;
    });

    this.socket.on('error', (error: Error) => {
      console.error('WebSocket Error:', error);
    });

    this.socket.on('pong', (latency: number) => {
      this.updateConnectionStatus(latency);
    });
  }

  private encrypt(data: any): string {
    return CryptoJS.AES.encrypt(JSON.stringify(data), this.ENCRYPTION_KEY).toString();
  }

  private decrypt(encryptedData: string): any {
    const bytes = CryptoJS.AES.decrypt(encryptedData, this.ENCRYPTION_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.socket?.connected) {
        const start = Date.now();
        this.socket.emit('ping', () => {
          const latency = Date.now() - start;
          this.updateConnectionStatus(latency);
        });
      }
    }, 30000); // 30 seconds
  }

  private updateConnectionStatus(latency: number): void {
    this.connectionStatus = {
      ...this.connectionStatus,
      lastPing: Date.now(),
      latency,
    };
  }

  private processMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.connectionStatus.isConnected) {
      const message = this.messageQueue.shift();
      if (message) {
        this.sendMessage(message);
      }
    }
  }

  public sendMessage(message: Message): void {
    if (!this.connectionStatus.isConnected) {
      this.messageQueue.push(message);
      return;
    }

    const encryptedMessage = this.encrypt(message);
    this.socket?.emit('message', encryptedMessage, (acknowledgment: boolean) => {
      if (!acknowledgment) {
        this.messageQueue.push(message);
      }
    });
  }

  public updatePresence(presence: UserPresence): void {
    if (this.socket?.connected) {
      this.socket.emit('presence', presence);
    }
  }

  public updateTypingStatus(indicator: TypingIndicator): void {
    if (this.socket?.connected) {
      this.socket.emit('typing', indicator);
    }
  }

  public onMessage(callback: (message: Message) => void): void {
    this.socket?.on('message', (encryptedMessage: string) => {
      const message = this.decrypt(encryptedMessage);
      callback(message);
    });
  }

  public onPresenceUpdate(callback: (presence: UserPresence) => void): void {
    this.socket?.on('presence', callback);
  }

  public onTypingUpdate(callback: (indicator: TypingIndicator) => void): void {
    this.socket?.on('typing', callback);
  }

  public getConnectionStatus(): ConnectionStatus {
    return this.connectionStatus;
  }

  public disconnect(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    this.socket?.disconnect();
  }
}

export const webSocketService = new WebSocketService();
