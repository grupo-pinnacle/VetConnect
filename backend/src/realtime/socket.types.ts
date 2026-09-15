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
}

export interface ServerToClientEvents {
  'message:new': (message: any) => void;
  'call:incoming': (data: { consultationId: string; callerName: string; roomName: string }) => void;
  'prescription:new': (prescription: any) => void;
}

export interface InterServerEvents {}

export interface SocketData {
  user: SocketUser;
}
