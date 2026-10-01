jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('socket.io-client', () => ({
  io: jest.fn(),
}));

jest.mock('../lib/api', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    get: jest.fn(),
    patch: jest.fn(),
    defaults: { headers: { common: {} } },
  },
  SECURE_STORE_REFRESH_KEY: 'vetconnect_refresh_token',
  getApiErrorMessage: (err: any, fallback: string) => fallback,
}));

jest.mock('react-native', () => {
  const React = require('react');
  return {
    View: (props: any) => React.createElement('View', props, props.children),
    Text: (props: any) => React.createElement('Text', props, props.children),
    TouchableOpacity: (props: any) => React.createElement('TouchableOpacity', props, props.children),
    TextInput: (props: any) => React.createElement('TextInput', props, props.children),
    Modal: (props: any) => React.createElement('Modal', props, props.children),
    ActivityIndicator: (props: any) => React.createElement('ActivityIndicator', props, props.children),
    StyleSheet: {
      create: (styles: any) => styles,
    },
  };
});

import React from 'react';
import { StatusBadge, TriageBadge } from '../components/StatusBadge';
import { LoadingView, ErrorBox, EmptyView } from '../components/ScreenState';
import { PrimaryButton } from '../components/PrimaryButton';
import { Field } from '../components/Field';
import { StarsInput } from '../components/Stars';
import { IncomingCallModalView } from '../components/IncomingCallModal';
import { VetConsultationActionsView } from '../components/VetConsultationActions';
import { useCallStore, callSignalingService } from '../services/callSignaling.service';
import { colors, triageColors } from '../theme/tokens';
import { useRouter } from 'expo-router';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../services/callSignaling.service', () => {
  const actual = jest.requireActual('../services/callSignaling.service');
  return {
    ...actual,
    callSignalingService: {
      answerCall: jest.fn((id: string) => id),
      rejectCall: jest.fn(),
    },
  };
});

describe('Mobile Core UI Components', () => {
  describe('StatusBadge and TriageBadge', () => {
    it('renders correct status label and theme color', () => {
      const activeBadge = StatusBadge({ status: 'ACTIVE' });
      expect(activeBadge.props.children).toBe('ACTIVE');
      expect(activeBadge.props.style[1].backgroundColor).toBe(colors.primary);

      const waitingBadge = StatusBadge({ status: 'WAITING' });
      expect(waitingBadge.props.children).toBe('WAITING');
      expect(waitingBadge.props.style[1].backgroundColor).toBe(colors.amber);

      const completedBadge = StatusBadge({ status: 'COMPLETED' });
      expect(completedBadge.props.children).toBe('COMPLETED');
      expect(completedBadge.props.style[1].backgroundColor).toBe(colors.ok);

      const cancelledBadge = StatusBadge({ status: 'CANCELLED' });
      expect(cancelledBadge.props.children).toBe('CANCELLED');
      expect(cancelledBadge.props.style[1].backgroundColor).toBe(colors.muted);
    });

    it('renders triage badges with priority tokens', () => {
      const redBadge = TriageBadge({ priority: 'ROJO' });
      expect(redBadge.props.children).toBe('ROJO');
      expect(redBadge.props.style[1].backgroundColor).toBe(triageColors.ROJO);

      const yellowBadge = TriageBadge({ priority: 'AMARILLO' });
      expect(yellowBadge.props.children).toBe('AMARILLO');
      expect(yellowBadge.props.style[1].backgroundColor).toBe(triageColors.AMARILLO);

      const greenBadge = TriageBadge({ priority: 'VERDE' });
      expect(greenBadge.props.children).toBe('VERDE');
      expect(greenBadge.props.style[1].backgroundColor).toBe(triageColors.VERDE);
    });
  });

  describe('ScreenState (LoadingView, ErrorBox, EmptyView)', () => {
    it('renders LoadingView with custom message', () => {
      const loading = LoadingView({ message: 'Cargando datos...', testID: 'loading-test' });
      expect(loading.props.testID).toBe('loading-test');
      expect(loading.props.children[1].props.children).toBe('Cargando datos...');
    });

    it('renders ErrorBox and handles retry callback', () => {
      const onRetry = jest.fn();
      const errorBox = ErrorBox({ message: 'Error de red', onRetry, testID: 'err-test' });
      expect(errorBox.props.children[0].props.children).toBe('Error de red');

      const retryBtn = errorBox.props.children[1];
      expect(retryBtn).toBeTruthy();
      retryBtn.props.onPress();
      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('renders EmptyView with message', () => {
      const empty = EmptyView({ message: 'No hay elementos registrados', testID: 'empty-test' });
      expect(empty.props.children.props.children).toBe('No hay elementos registrados');
    });
  });

  describe('PrimaryButton', () => {
    it('handles press callback when enabled', () => {
      const onPress = jest.fn();
      const btn = PrimaryButton({ title: 'Guardar', onPress, variant: 'primary' });
      expect(btn.props.disabled).toBe(false);
      btn.props.onPress();
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('disables button when loading or disabled flag is true', () => {
      const onPress = jest.fn();
      const loadingBtn = PrimaryButton({ title: 'Guardar', onPress, loading: true });
      expect(loadingBtn.props.disabled).toBe(true);

      const disabledBtn = PrimaryButton({ title: 'Guardar', onPress, disabled: true });
      expect(disabledBtn.props.disabled).toBe(true);
    });
  });

  describe('Field', () => {
    it('renders label and passes text input props', () => {
      const field = Field({ label: 'Nombre Mascota', placeholder: 'Ej. Firulais', value: 'Rex' });
      expect(field.props.children[0].props.children).toBe('Nombre Mascota');
      expect(field.props.children[1].props.value).toBe('Rex');
      expect(field.props.children[1].props.placeholder).toBe('Ej. Firulais');
    });
  });

  describe('StarsInput', () => {
    it('renders 5 stars and triggers onChange with selected value', () => {
      const onChange = jest.fn();
      const stars = StarsInput({ value: 3, onChange, testIDPrefix: 'rating' });
      const starItems = stars.props.children;
      expect(starItems).toHaveLength(5);

      // Tap 5th star
      starItems[4].props.onPress();
      expect(onChange).toHaveBeenCalledWith(5);

      // Tap 2nd star
    });
  });
});

describe('IncomingCallModalView', () => {
  it('returns null when there is no incoming call', () => {
    const modal = IncomingCallModalView({
      incomingCall: null,
      onAccept: jest.fn(),
      onReject: jest.fn(),
    });
    expect(modal).toBeNull();
  });

  it('renders caller info and handles accept / reject actions', () => {
    const onAccept = jest.fn();
    const onReject = jest.fn();

    const modal = IncomingCallModalView({
      incomingCall: {
        consultationId: 'cons-modal-1',
        callerName: 'Dra. Valentina Gomez',
        roomName: 'room-cons-modal-1',
      },
      onAccept,
      onReject,
    });

    expect(modal).not.toBeNull();
    if (!modal) throw new Error('Expected modal to be defined');
    expect(modal.props.visible).toBe(true);

    // Find children inside Modal -> card -> callerName & actions
    const overlay = modal.props.children;
    const card = overlay.props.children;
    const callerText = card.props.children[2];
    expect(callerText.props.children).toBe('Dra. Valentina Gomez');

    const actionsRow = card.props.children[4];
    const rejectButton = actionsRow.props.children[0];
    const acceptButton = actionsRow.props.children[1];

    // Reject
    rejectButton.props.onPress();
    expect(onReject).toHaveBeenCalledTimes(1);

    // Accept
    acceptButton.props.onPress();
    expect(onAccept).toHaveBeenCalledTimes(1);
  });
});

describe('VetConsultationActionsView', () => {
  it('renders default action buttons when closing is false', () => {
    const onOpenPrescribe = jest.fn();
    const onOpenClose = jest.fn();

    const view = VetConsultationActionsView({
      consultationId: 'cons-10',
      closing: false,
      diagnosis: '',
      busy: false,
      error: null,
      onOpenPrescribe,
      onOpenClose,
      onCancelClose: jest.fn(),
      onChangeDiagnosis: jest.fn(),
      onConfirmClose: jest.fn(),
    });

    const wrapChildren = view.props.children;
    const buttonsBlock = wrapChildren[1];
    const prescribeBtn = buttonsBlock.props.children[0];
    const closeBtn = buttonsBlock.props.children[1];

    prescribeBtn.props.onPress();
    expect(onOpenPrescribe).toHaveBeenCalledTimes(1);

    closeBtn.props.onPress();
    expect(onOpenClose).toHaveBeenCalledTimes(1);
  });

  it('renders diagnosis field and confirm/cancel buttons when closing is true', () => {
    const onConfirmClose = jest.fn();
    const onCancelClose = jest.fn();
    const onChangeDiagnosis = jest.fn();

    const view = VetConsultationActionsView({
      consultationId: 'cons-10',
      closing: true,
      diagnosis: 'Otitis externa',
      busy: false,
      error: null,
      onOpenPrescribe: jest.fn(),
      onOpenClose: jest.fn(),
      onCancelClose,
      onChangeDiagnosis,
      onConfirmClose,
    });

    const wrapChildren = view.props.children;
    const formBlock = wrapChildren[1];
    const field = formBlock.props.children[0];
    const confirmBtn = formBlock.props.children[1];
    const cancelBtn = formBlock.props.children[2];

    expect(field.props.value).toBe('Otitis externa');

    confirmBtn.props.onPress();
    expect(onConfirmClose).toHaveBeenCalledTimes(1);

    cancelBtn.props.onPress();
    expect(onCancelClose).toHaveBeenCalledTimes(1);
  });

  it('renders ErrorBox when error prop is provided', () => {
    const view = VetConsultationActionsView({
      consultationId: 'cons-10',
      closing: false,
      diagnosis: '',
      busy: false,
      error: 'Error al cerrar consulta',
      onOpenPrescribe: jest.fn(),
      onOpenClose: jest.fn(),
      onCancelClose: jest.fn(),
      onChangeDiagnosis: jest.fn(),
      onConfirmClose: jest.fn(),
    });

    const wrapChildren = view.props.children;
    const errorBox = wrapChildren[0];
    expect(errorBox).toBeTruthy();
    expect(errorBox.props.message).toBe('Error al cerrar consulta');
  });
});
