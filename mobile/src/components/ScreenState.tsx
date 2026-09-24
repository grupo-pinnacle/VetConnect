import React from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme/tokens';

export function LoadingView({ testID, message }: { testID?: string; message?: string }) {
  return (
    <View style={styles.center} testID={testID || 'loading-view'}>
      <ActivityIndicator size="large" color={colors.primary} />
      {!!message && <Text style={styles.hint}>{message}</Text>}
    </View>
  );
}

export function ErrorBox({
  message,
  onRetry,
  testID,
}: {
  message: string;
  onRetry?: () => void;
  testID?: string;
}) {
  return (
    <View style={styles.errorBox} testID={testID || 'error-box'}>
      <Text style={styles.errorText}>{message}</Text>
      {!!onRetry && (
        <TouchableOpacity onPress={onRetry} testID={(testID || 'error-box') + '-retry'}>
          <Text style={styles.retryText}>Reintentar</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export function EmptyView({ message, testID }: { message: string; testID?: string }) {
  return (
    <View style={styles.emptyWrap} testID={testID || 'empty-view'}>
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF', padding: 24 },
  hint: { marginTop: 12, fontSize: 14, color: colors.muted },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  errorText: { color: colors.danger, fontSize: 13, marginBottom: 6, textAlign: 'center' },
  retryText: { color: colors.primary, fontWeight: 'bold', textAlign: 'center' },
  emptyWrap: { padding: 24, alignItems: 'center' },
  emptyText: { color: colors.faint, fontSize: 14, textAlign: 'center' },
});
