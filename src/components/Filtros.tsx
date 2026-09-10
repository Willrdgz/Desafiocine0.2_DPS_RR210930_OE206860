import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { colors } from '../theme';
export default function Filtros({ opciones, seleccionado, onSelect }: { opciones: string[]; seleccionado: string; onSelect: (value: string) => void }) {
  return <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
    {opciones.map(opcion => <Pressable key={opcion} accessibilityRole="button" accessibilityState={{ selected: seleccionado === opcion }} onPress={() => onSelect(opcion)} style={[styles.chip, seleccionado === opcion && styles.active]}><Text style={{ color: seleccionado === opcion ? colors.ink : colors.muted, fontWeight: '700' }}>{opcion}</Text></Pressable>)}
  </ScrollView>;
}
const styles = StyleSheet.create({
  row: { gap: 8 },
  chip: { paddingHorizontal: 18, paddingVertical: 14, borderRadius: 24, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  active: { backgroundColor: colors.accent, borderColor: colors.accent },
});
