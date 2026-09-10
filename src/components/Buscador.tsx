import { StyleSheet, TextInput } from 'react-native';
import { colors } from '../theme';
export default function Buscador({ value, onChangeText }: { value: string; onChangeText: (text: string) => void }) {
  return <TextInput value={value} onChangeText={onChangeText} placeholder="Buscar película, género o sala…" placeholderTextColor={colors.muted} accessibilityLabel="Buscar por nombre, género, clasificación o sala" style={styles.input} autoCorrect={false} returnKeyType="search" />;
}
const styles = StyleSheet.create({ input: { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border, borderWidth: 1, padding: 16, borderRadius: 14, fontSize: 16, minHeight: 52 } });
