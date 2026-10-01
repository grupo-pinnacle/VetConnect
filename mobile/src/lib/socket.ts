import { io, Socket } from 'socket.io-client';
import { AppState, AppStateStatus } from 'react-native';
import api from './api';
import { Message, ApiResponse, IncomingCallPayload } from '../types';

const WS_URL = process.env.EXPO_PUBLIC_WS_URL || 'http://localhost:3001';

/**
 * Consumer of the incremental sync result. The chat screens register one of
 * these so messages fetched while reconnecting or while the app returns to the
 * foreground actually reach the UI.
 */
export type SyncedMessagesHandler = (consultationId: string, messages: Message[]) => void;
export type IncomingCallHandler = (call: IncomingCallPayload) => void;

export class MobileSocketManager {
  private socket: Socket | null = null;
  private activeConsultationIds: Set<string> = new Set();
  private lastKnownTimestamps: Map<string, string> = new Map();
  private appStateSubscription: { remove: () => void } | null = null;
  private syncedMessagesHandlers: Set<SyncedMessagesHandler> = new Set();
  private incomingCallHandlers: Set<IncomingCallHandler> = new Set();

  public getSocket(): Socket | null {
    return this.socket;
  }

  public connect(token: string) {
    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    this.socket = io(WS_URL, {
      auth: { token: `Bearer ${token}` },
      transports: ['websocket'],
      autoConnect: true,
    });

    this.socket.on('call:incoming', (call: IncomingCallPayload) => {
      for (const handler of this.incomingCallHandlers) {
        try {
          handler(call);
        } catch (err) {
          console.warn('Error handling incoming call in socketManager:', err);
        }
      }
    });

    this.setupAppStateListener();

    return this.socket;
  }

  public onIncomingCall(handler: IncomingCallHandler): () => void {
    this.incomingCallHandlers.add(handler);
    return () => {
      this.incomingCallHandlers.delete(handler);
    };
  }

  public emitAnswerCall(consultationId: string) {
    const s = this.getSocket();
    if (s) {
      s.emit('call:answered', { consultationId });
    }
  }

  public emitRejectCall(consultationId: string, reason?: string) {
    const s = this.getSocket();
    if (s) {
      s.emit('call:rejected', { consultationId, reason });
    }
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

  /**
   * Subscribes to incremental sync results. Returns the unsubscribe function so
   * a screen can detach itself on unmount without leaking a stale closure.
   */
  public onSyncedMessages(handler: SyncedMessagesHandler): () => void {
    this.syncedMessagesHandlers.add(handler);
    return () => {
      this.syncedMessagesHandlers.delete(handler);
    };
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

      let messages: Message[];
      try {
        const res = await api.get<ApiResponse<Message[]>>(url);
        if (!res.data?.success || !Array.isArray(res.data.data)) {
          // Unusable envelope: the watermark stays put so the next attempt
          // re-reads the very same window instead of skipping over it.
          continue;
        }
        messages = res.data.data;
      } catch (err) {
        console.warn(`Failed incremental sync for consultation ${consultationId}:`, err);
        // Failed fetch: the watermark stays put, so nothing is lost.
        continue;
      }

      if (messages.length === 0) continue;

      // Deliver BEFORE moving the watermark. Advancing it first and letting the
      // caller drop the payload is what permanently lost messages.
      let delivered = false;
      for (const handler of this.syncedMessagesHandlers) {
        try {
          handler(consultationId, messages);
          delivered = true;
        } catch (err) {
          console.warn(`Synced messages handler failed for consultation ${consultationId}:`, err);
        }
      }
      if (!delivered) continue;

      syncedMessages.set(consultationId, messages);

      const latestMsg = messages[messages.length - 1];
      if (latestMsg?.createdAt) {
        this.lastKnownTimestamps.set(consultationId, latestMsg.createdAt);
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
    this.syncedMessagesHandlers.clear();
    this.incomingCallHandlers.clear();
    this.activeConsultationIds.clear();
    this.lastKnownTimestamps.clear();
  }
}

export const socketManager = new MobileSocketManager();
export default socketManager;
