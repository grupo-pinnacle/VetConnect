import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useCallStore, callSignalingService } from '../services/callSignaling.service';
import { colors, radius, spacing } from '../theme/tokens';

export interface IncomingCallModalViewProps {
  incomingCall: {
    consultationId: string;
    callerName: string;
    roomName: string;
  } | null;
  onAccept: () => void;
  onReject: () => void;
}

export function IncomingCallModalView({
  incomingCall,
  onAccept,
  onReject,
}: IncomingCallModalViewProps) {
  if (!incomingCall) return null;

  return (
    <Modal
      transparent
      animationType="slide"
      visible={Boolean(incomingCall)}
      onRequestClose={onReject}
      testID="incoming-call-modal"
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>📞</Text>
          </View>

          <Text style={styles.badge}>Videoconsulta en vivo</Text>
          <Text style={styles.callerName} testID="incoming-caller-name">
            {incomingCall.callerName}
          </Text>
          <Text style={styles.subtitle}>
            Llamada clínica entrante para tu consulta
          </Text>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.rejectButton]}
              onPress={onReject}
              testID="reject-call-button"
              accessibilityLabel="Rechazar llamada"
            >
              <Text style={styles.rejectText}>✕ Rechazar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.acceptButton]}
              onPress={onAccept}
              testID="accept-call-button"
              accessibilityLabel="Atender videoconsulta"
            >
              <Text style={styles.acceptText}>✓ Atender</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function IncomingCallModal() {
  const router = useRouter();
  const incomingCall = useCallStore((state) => state.incomingCall);

  const handleAccept = () => {
    if (!incomingCall) return;
    const consultationId = callSignalingService.answerCall(incomingCall.consultationId);
    router.push({
      pathname: '/(app)/call/[consultationId]',
      params: { consultationId },
    });
  };

  const handleReject = () => {
    if (!incomingCall) return;
    callSignalingService.rejectCall(incomingCall.consultationId, 'Rechazada por el usuario');
  };

  return (
    <IncomingCallModalView
      incomingCall={incomingCall}
      onAccept={handleAccept}
      onReject={handleReject}
    />
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: '#10B981',
  },
  iconText: {
    fontSize: 32,
  },
  badge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  callerName: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.ink,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    width: '100%',
    gap: spacing.md,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectButton: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  rejectText: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 15,
  },
  acceptButton: {
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  acceptText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
