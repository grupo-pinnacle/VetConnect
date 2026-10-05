import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/tokens';

type Variant = 'primary' | 'secondary' | 'danger';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const EDGE: Record<Variant, string> = {
  primary: colors.primaryDark,
  secondary: '#075985',
  danger: colors.dangerDark,
};

export function PrimaryButton({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  testID,
}: {
  title: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  icon?: IconName;
  testID?: string;
}) {
  const isDisabled = disabled || loading;
  return (
    <TouchableOpacity
      style={[
        styles.btn,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'danger' && styles.danger,
        { borderBottomColor: EDGE[variant] },
        isDisabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}
      testID={testID || 'primary-button'}
    >
      {loading ? (
        <ActivityIndicator color="#FFF" />
      ) : (
        <View style={styles.row}>
          {icon ? <Ionicons name={icon} size={18} color="#FFF" style={styles.icon} /> : null}
          <Text style={styles.text}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12, alignItems: 'center', borderBottomWidth: 4 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  icon: { marginRight: 8 },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.primaryDark },
  danger: { backgroundColor: colors.danger },
  disabled: { opacity: 0.6 },
  text: { color: '#FFF', fontWeight: '700', fontSize: 15 },
});
