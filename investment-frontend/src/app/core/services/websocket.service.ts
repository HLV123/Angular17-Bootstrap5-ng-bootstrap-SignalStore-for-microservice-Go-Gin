import { Injectable, signal } from '@angular/core';

export interface WsMessage {
  type: 'QUOTE_UPDATE' | 'NAV_UPDATE' | 'POSITION_UPDATE' | 'INDEX_UPDATE' | 'ALERT' | 'NEWS_FEED' | 'PNL_UPDATE';
  data: any;
  timestamp?: string;
}

@Injectable({ providedIn: 'root' })
export class WebSocketService {
  private ws: WebSocket | null = null;
  connected = signal(false);
  lastMessage = signal<WsMessage | null>(null);
  private reconnectAttempts = 0;
  private maxReconnect = 5;
  private listeners = new Map<string, ((data: any) => void)[]>();

  // Connect to Go backend WebSocket
  connect(endpoint: string = 'ws://localhost:8080/ws/market'): void {
    if (this.ws?.readyState === WebSocket.OPEN) return;
    try {
      this.ws = new WebSocket(endpoint);
      this.ws.onopen = () => {
        this.connected.set(true);
        this.reconnectAttempts = 0;
        console.log('[WS] Connected to', endpoint);
      };
      this.ws.onmessage = (event) => {
        try {
          const msg: WsMessage = JSON.parse(event.data);
          this.lastMessage.set(msg);
          this.notifyListeners(msg.type, msg.data);
        } catch (e) { console.warn('[WS] Invalid message:', event.data); }
      };
      this.ws.onclose = () => {
        this.connected.set(false);
        if (this.reconnectAttempts < this.maxReconnect) {
          this.reconnectAttempts++;
          setTimeout(() => this.connect(endpoint), 2000 * this.reconnectAttempts);
        }
      };
      this.ws.onerror = () => this.connected.set(false);
    } catch {
      // In mock mode, no real WebSocket server available
      this.connected.set(false);
    }
  }

  subscribe(type: string, callback: (data: any) => void): void {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type)!.push(callback);
  }

  unsubscribe(type: string): void {
    this.listeners.delete(type);
  }

  send(message: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  disconnect(): void {
    this.ws?.close();
    this.ws = null;
    this.connected.set(false);
  }

  private notifyListeners(type: string, data: any): void {
    this.listeners.get(type)?.forEach(cb => cb(data));
  }
}
