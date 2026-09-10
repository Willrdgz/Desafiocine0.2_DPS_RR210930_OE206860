import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../theme';
export default function Asiento({ codigo, ocupado, seleccionado, onPress }: { codigo: string; ocupado: boolean; seleccionado: boolean; onPress: () => void }) {
  return <Pressable disabled={ocupado} accessibilityRole="button" accessibilityLabel={codigo + (ocupado ? ', ocupado' : seleccionado ? ', seleccionado' : ', disponible')} accessibilityState={{ disabled: ocupado, selected: seleccionado }} onPress={onPress} style={[styles.seat, ocupado && styles.busy, seleccionado && styles.selected]}>
    <Text style={{ color: seleccionado ? colors.ink : colors.text, fontWeight: '700' }}>{codigo}</Text>
    <Text style={{ color: seleccionado ? colors.ink : colors.muted, fontSize: 12 }}>{ocupado ? '×' : seleccionado ? '✓' : '○'}</Text>
  </Pressable>;
}
const styles = StyleSheet.create({
  seat: { flex: 1, minHeight: 56, borderRadius: 10, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface },
  busy: { backgroundColor: '#483438', borderColor: '#A7777A' },
  selected: { backgroundColor: colors.accent, borderColor: colors.accent },
});

