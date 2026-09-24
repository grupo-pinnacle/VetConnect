import React from 'react';
import { View, Text, TextInput, StyleSheet, type TextInputProps } from 'react-native';
import { colors } from '../theme/tokens';

export function Field({
  label,
  testID,
  ...props
}: { label: string; testID?: string } & TextInputProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, props.multiline && styles.multiline]}
        placeholderTextColor={colors.faint}
        testID={testID}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 14 },
  label: { fontSize: 14, fontWeight: 'bold', color: colors.body, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: colors.lineDark, borderRadius: 8, padding: 12, fontSize: 15, color: colors.ink, backgroundColor: '#FFF' },
  multiline: { height: 100, textAlignVertical: 'top' },
});
