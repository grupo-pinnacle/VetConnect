import { create } from 'zustand';
import { IncomingCallPayload } from '../types';
import socketManager from '../lib/socket';

interface CallState {
  incomingCall: IncomingCallPayload | null;
  setIncomingCall: (call: IncomingCallPayload) => void;
  clearIncomingCall: () => void;
}

export const useCallStore = create<CallState>((set) => ({
  incomingCall: null,
  setIncomingCall: (incomingCall) => set({ incomingCall }),
  clearIncomingCall: () => set({ incomingCall: null }),
}));

export class CallSignalingService {
  private unsubscribe: (() => void) | null = null;

  public initListener(): () => void {
    if (this.unsubscribe) {
      this.unsubscribe();
    }

    this.unsubscribe = socketManager.onIncomingCall((call) => {
      this.handleIncomingCall(call);
    });

    return () => {
      if (this.unsubscribe) {
        this.unsubscribe();
        this.unsubscribe = null;
      }
    };
  }

  public handleIncomingCall(call: IncomingCallPayload) {
    useCallStore.getState().setIncomingCall(call);
  }

  public answerCall(consultationId: string): string {
    socketManager.emitAnswerCall(consultationId);
    useCallStore.getState().clearIncomingCall();
    return consultationId;
  }

  public rejectCall(consultationId: string, reason?: string): void {
    socketManager.emitRejectCall(consultationId, reason);
    useCallStore.getState().clearIncomingCall();
  }
}

export const callSignalingService = new CallSignalingService();
export default callSignalingService;
