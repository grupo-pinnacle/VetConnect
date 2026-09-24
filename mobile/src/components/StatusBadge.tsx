import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { colors, triageColors } from '../theme/tokens';
import type { ConsultationStatus, TriagePriority } from '../types';

const STATUS_COLORS: Record<ConsultationStatus, string> = {
  WAITING: colors.amber,
  ACTIVE: colors.primary,
  COMPLETED: colors.ok,
  CANCELLED: colors.muted,
};

export function StatusBadge({ status, testID }: { status: ConsultationStatus; testID?: string }) {
  return (
    <Text style={[styles.badge, { backgroundColor: STATUS_COLORS[status] }]} testID={testID}>
      {status}
    </Text>
  );
}

export function TriageBadge({ priority, testID }: { priority: TriagePriority; testID?: string }) {
  return (
    <Text style={[styles.badge, { backgroundColor: triageColors[priority] }]} testID={testID}>
      {priority}
    </Text>
  );
}

const styles = StyleSheet.create({
  badge: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    overflow: 'hidden',
  },
});
