import { io, Socket } from 'socket.io-client';
import { AppState, AppStateStatus } from 'react-native';
import api from './api';
import { Message, ApiResponse } from '../types';

const WS_URL = process.env.EXPO_PUBLIC_WS_URL || 'http://localhost:3001';

export class MobileSocketManager {
  private socket: Socket | null = null;
  private activeConsultationIds: Set<string> = new Set();
  private lastKnownTimestamps: Map<string, string> = new Map();
  private appStateSubscription: any = null;

  public connect(token: string) {
    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    this.socket = io(WS_URL, {
      auth: { token: `Bearer ${token}` },
      transports: ['websocket'],
      autoConnect: true,
    });

    this.setupAppStateListener();

    return this.socket;
  }

  public trackConsultation(consultationId: string, initialTimestamp?: string) {
    this.activeConsultationIds.add(consultationId);
    if (initialTimestamp) {
      this.lastKnownTimestamps.set(consultationId, initialTimestamp);
    }
  }

  public updateLastKnownTimestamp(consultationId: string, timestamp: string) {
    this.lastKnownTimestamps.set(consultationId, timestamp);
  }

  private setupAppStateListener() {
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
    }

    this.appStateSubscription = AppState.addEventListener(
      'change',
      async (nextAppState: AppStateStatus) => {
        if (nextAppState === 'background') {
          if (this.socket) {
            this.socket.disconnect();
          }
        } else if (nextAppState === 'active') {
          if (this.socket && !this.socket.connected) {
            this.socket.connect();
          }
          await this.syncIncrementalMessages();
        }
      }
    );
  }

  public async syncIncrementalMessages(): Promise<Map<string, Message[]>> {
    const syncedMessages = new Map<string, Message[]>();

    for (const consultationId of this.activeConsultationIds) {
      const lastKnown = this.lastKnownTimestamps.get(consultationId);
      const url = lastKnown
        ? `/api/consultations/${consultationId}/messages?after=${encodeURIComponent(lastKnown)}`
        : `/api/consultations/${consultationId}/messages`;

      try {
        const res = await api.get<ApiResponse<Message[]>>(url);
        if (res.data.success && res.data.data && res.data.data.length > 0) {
          const messages = res.data.data;
          syncedMessages.set(consultationId, messages);

          const latestMsg = messages[messages.length - 1];
          this.lastKnownTimestamps.set(consultationId, latestMsg.createdAt);
        }
      } catch (err) {
        console.warn(`Failed incremental sync for consultation ${consultationId}:`, err);
      }
    }

    return syncedMessages;
  }

  public disconnect() {
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.activeConsultationIds.clear();
    this.lastKnownTimestamps.clear();
  }
}

export const socketManager = new MobileSocketManager();
export default socketManager;
