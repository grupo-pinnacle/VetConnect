import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/tokens';

export function StarsInput({
  value,
  onChange,
  testIDPrefix = 'stars',
}: {
  value: number;
  onChange: (v: number) => void;
  testIDPrefix?: string;
}) {
  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map((s) => (
        <TouchableOpacity
          key={s}
          style={[styles.star, s <= value && styles.active]}
          onPress={() => onChange(s)}
          testID={`${testIDPrefix}-${s}`}
          accessibilityLabel={`${s} de 5`}
        >
          <Ionicons name={s <= value ? 'star' : 'star-outline'} size={22} color={s <= value ? '#FFF' : colors.faint} />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },
  star: { flex: 1, padding: 12, borderWidth: 1, borderColor: colors.lineDark, borderRadius: 8, alignItems: 'center' },
  active: { backgroundColor: colors.amber, borderColor: colors.amber },
});
