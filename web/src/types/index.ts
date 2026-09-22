export type Role = 'CLIENT' | 'VET' | 'ADMIN';
export type VetStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type ConsultationStatus = 'WAITING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type CallStatus = 'INITIATED' | 'ACTIVE' | 'ENDED';

export type TriagePriority = 'GREEN' | 'YELLOW' | 'RED';
export type TriagePriorityES = 'VERDE' | 'AMARILLO' | 'ROJO';

export const TRIAGE_EN_TO_ES: Record<TriagePriority, TriagePriorityES> = {
  GREEN: 'VERDE',
  YELLOW: 'AMARILLO',
  RED: 'ROJO',
};

export const TRIAGE_ES_TO_EN: Record<TriagePriorityES, TriagePriority> = {
  VERDE: 'GREEN',
  AMARILLO: 'YELLOW',
  ROJO: 'RED',
};

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  role: Role;
  vetStatus?: VetStatus | null;
  licenseNumber?: string | null;
  speciality?: string | null;
  bio?: string | null;
  photoUrl?: string | null;
  ratingAvg: number;
  ratingCount: number;
  isOnline: boolean;
  lastSeen?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BaseComponentProps {
  className?: string;
  'data-testid'?: string;
}

export interface BadgeProps extends BaseComponentProps {
  variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'online' | 'offline' | 'green' | 'yellow' | 'red' | 'rojo' | 'amarillo' | 'verde';
  size?: 'sm' | 'md';
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export interface Pet {
  id: string;
  ownerId: string;
  name: string;
  species: string;
  breed: string;
  weightKg?: number | null;
  sex?: string | null;
  microchip?: string | null;
  allergies?: string | null;
  chronicConditions?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  owner?: Partial<User>;
}

export interface Consultation {
  id: string;
  clientId: string;
  vetId?: string | null;
  petId: string;
  status: ConsultationStatus;
  notes?: string | null;
  diagnosisNotes?: string | null;
  startedAt?: string | null;
  endedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  pet?: Pet;
  client?: Partial<User>;
  vet?: Partial<User>;
  prescriptions?: Prescription[];
  review?: Review | null;
}

export interface Message {
  id: string;
  consultationId: string;
  senderId: string;
  content: string;
  attachmentUrl?: string | null;
  clientMsgId: string;
  createdAt: string;
  updatedAt: string;
  sender?: {
    id: string;
    firstName: string;
    lastName: string;
    role: Role;
  };
}

export interface Prescription {
  id: string;
  consultationId: string;
  vetId: string;
  medication: string;
  dosage: string;
  frequency: string;
  durationDays: number;
  indications: string;
  createdAt: string;
  qrCodeDataUrl?: string;
  verifyUrl?: string;
  vet?: Partial<User>;
}

export interface Review {
  id: string;
  consultationId: string;
  clientId: string;
  vetId: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
}

export interface MediaFile {
  id: string;
  ownerId: string;
  consultationId?: string | null;
  fileName: string;
  fileSize: number;
  mimeType: string;
  localPath?: string | null;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: string;
  data?: Record<string, any> | null;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
  };
}
