import { Role } from '@prisma/client';

export interface SocketUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  tokenVersion: number;
}

export interface ClientToServerEvents {
  'join:consultation': (data: { consultationId: string }) => void;
  'message:send': (
    data: {
      consultationId: string;
      content: string;
      clientMsgId: string;
      attachmentUrl?: string;
    },
    callback?: (response: { success: boolean; data?: any; error?: any }) => void
  ) => void;
  'call:answered': (data: { consultationId: string }) => void;
  'call:rejected': (data: { consultationId: string; reason?: string }) => void;
  'call:ended': (data: { consultationId: string }) => void;
  'leave:consultation': (data: { consultationId: string }) => void;
}

export interface ServerToClientEvents {
  'message:new': (message: any) => void;
  'call:incoming': (data: { consultationId: string; callerName: string; roomName: string }) => void;
  'call:ended': (data: { consultationId: string; endedBy?: string }) => void;
  'prescription:new': (prescription: any) => void;
  'notification:new': (notification: any) => void;
  'consultation:new': (consultation: any) => void;
  'auth:session_terminated': (data: { reason: string; message: string }) => void;
  'session:invalidated': (data: { reason: string; consultationId?: string }) => void;
  'consultation:critical_resume': (data: {
    consultationId: string;
    status: string;
    stateVersion: number;
    vetId?: string | null;
  }) => void;
  'consultation:tutor_reconnecting': (data: { consultationId: string; message: string }) => void;
}

export interface InterServerEvents {}

export interface SocketData {
  user: SocketUser;
  deviceId?: string;
}
