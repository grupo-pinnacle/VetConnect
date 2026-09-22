import React from 'react';

// ============================================================
// PRIMITIVE TYPES
// ============================================================

export type Role = 'CLIENT' | 'VET' | 'ADMIN';
export type VetStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type ConsultationStatus = 'WAITING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type CallStatus = 'INITIATED' | 'ACTIVE' | 'ENDED';

// Triage: stored in Spanish in DB (inside `notes` field as "[Prioridad: ROJO] ...")
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

// ============================================================
// DOMAIN MODELS (synchronized with backend Prisma schema)
// ============================================================

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  role: Role;
  vetStatus?: VetStatus | null;
  licenseNumber?: string | null;
  bio?: string | null; // ✅ Only professional description field — NO 'speciality' in DB
  photoUrl?: string | null;
  ratingAvg: number;
  ratingCount: number;
  isOnline: boolean;
  lastSeen?: string | null;
  createdAt: string;
  updatedAt: string;
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
  // ⚠️ NO 'url' field — construct URL as `/api/media/${id}` in the frontend
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: string;
  data?: Record<string, unknown> | null;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: unknown;
    timestamp: string;
  };
}

// ============================================================
// UI COMPONENT PROPS (Base)
// ============================================================

/** Base props shared by all atomic UI components */
export interface BaseComponentProps {
  className?: string;
  'data-testid'?: string; // MANDATORY: preserves Vitest selectors
}

// ============================================================
// ATOMIC COMPONENT PROPS — Fase 1: Átomos
// ============================================================

/** Button — extends native HTMLButtonElement attrs (see Button.tsx) */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

/** Badge — triage, status, and semantic indicators */
export interface BadgeProps extends BaseComponentProps {
  variant:
    | 'success'
    | 'warning'
    | 'danger'
    | 'info'
    | 'neutral'
    | 'online'
    | 'offline'
    | 'green'
    | 'yellow'
    | 'red'
    | 'rojo'
    | 'amarillo'
    | 'verde';
  size?: 'sm' | 'md';
  children: React.ReactNode;
  icon?: React.ReactNode;
}

/** Input — labeled field with error and helper text */
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    BaseComponentProps {
  label: string;
  error?: string;
  helperText?: string;
}

/** Avatar — user or pet photo with optional online status indicator */
export interface AvatarProps extends BaseComponentProps {
  src?: string | null;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  status?: 'online' | 'busy' | 'offline';
}

// ============================================================
// MOLECULAR COMPONENT PROPS — Fase 2: Moléculas
// ============================================================

/** PetCard — clinical patient card shown in DashboardClient queue */
export interface PetCardProps extends BaseComponentProps {
  pet: Pet;
  onSelect?: (pet: Pet) => void;
  onRequestConsultation?: (pet: Pet) => void;
  selected?: boolean;
}

/**
 * TriageSelector — priority picker (strictly Spanish values).
 *
 * ⚠️ CONTRACT: `value` accepts ONLY TriagePriorityES ('ROJO' | 'AMARILLO' | 'VERDE').
 * Bilingual normalization (EN→ES) is performed UPSTREAM in the container page
 * via TRIAGE_EN_TO_ES before passing the value here.
 * TriageSelector does NOT normalize 'GREEN'/'YELLOW'/'RED' internally.
 */
export interface TriageSelectorProps extends BaseComponentProps {
  value: TriagePriorityES;
  onChange: (value: TriagePriorityES) => void;
  disabled?: boolean;
}

/** Breadcrumbs — hierarchical navigation trail */
export interface BreadcrumbItem {
  label: string;
  path?: string;
}

export interface BreadcrumbsProps extends BaseComponentProps {
  items: BreadcrumbItem[];
}

/** ChatMessage — single message bubble in clinical chat */
export interface ChatMessageProps extends BaseComponentProps {
  message: Message;
  isOwn: boolean;
  onImageClick?: (url: string) => void;
}

// ============================================================
// ORGANISM COMPONENT PROPS — Fase 3: Organismos
// ============================================================

/**
 * HangUpButton — overlay "Finalizar Consulta" button rendered OUTSIDE <VideoConference />.
 *
 * ⚠️ GUARDRAIL (AGENTS.md §5 Anti-pattern 3):
 * <VideoConference /> already includes audio/video/screenshare controls.
 * HangUpButton is the ONLY extra control allowed alongside VideoConference.
 * It must call PATCH /api/consultations/:id/complete before unmounting <CallRoom />.
 * DO NOT create CallControls.tsx with isMuted/isVideoOff props — causes LiveKit state conflict.
 */
export interface HangUpButtonProps extends BaseComponentProps {
  onHangUp: () => void;
  isLoading?: boolean;
}

/** PrescriptionDoc — read-only prescription document with QR code (used in PrescriptionView) */
export interface PrescriptionDocProps extends BaseComponentProps {
  prescription: Prescription;
  qrUrl: string;
  onPrint?: () => void;
}

/**
 * PrescriptionModal — form modal for VET to draft and submit a prescription.
 * Currently embedded inline in DashboardVet.tsx; to be extracted to components/ui/ in CDD Fase 3.
 * Uses HTML5 native dialog (role="dialog", aria-modal="true") — NO Radix UI.
 */
export interface PrescriptionModalProps extends BaseComponentProps {
  isOpen: boolean;
  consultationId: string;
  onClose: () => void;
  onSuccess: (prescription: Prescription) => void;
}

/**
 * ReviewModal — star rating + optional comment, shown by ConsultationRoom when phase === 'completed'.
 *
 * Responsibility: The modal calls POST /api/consultations/:id/review internally.
 * The parent (ConsultationRoom) passes consultationId and onClose/onSuccess callbacks only.
 */
export interface ReviewModalProps extends BaseComponentProps {
  isOpen: boolean;
  consultationId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

/**
 * ConfirmModal — generic two-step confirmation dialog for destructive actions.
 *
 * Primary use: soft-delete of pets in DashboardClient (calls DELETE /api/pets/:id).
 * Uses HTML5 native dialog (role="dialog", aria-modal="true") — NO Radix UI.
 * Implement as web/src/components/ui/ConfirmModal.tsx.
 */
export interface ConfirmModalProps extends BaseComponentProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string; // default: "Confirmar"
  cancelLabel?: string;  // default: "Cancelar"
  variant?: 'danger' | 'warning'; // default: 'danger'
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}
