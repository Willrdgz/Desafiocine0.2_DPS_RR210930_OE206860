import { PropsWithChildren } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, ui } from '../theme';
export function Pagina({ children }: PropsWithChildren) {
  return <SafeAreaView style={ui.page} edges={['left', 'right', 'bottom']}><KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={100}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={ui.content}>{children}</ScrollView></KeyboardAvoidingView></SafeAreaView>;
}
export function Boton({ titulo, onPress, disabled = false, secundario = false }: { titulo: string; onPress: () => void; disabled?: boolean; secundario?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={({ pressed }) => [ui.button, secundario && { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, (disabled || pressed) && { opacity: 0.5 }]}><Text style={[ui.buttonText, secundario && { color: colors.text }]}>{titulo}</Text></Pressable>;
}
export function Campo({ label, ...props }: TextInputProps & { label: string }) {
  return <View style={{ gap: 8 }}><Text style={ui.body}>{label}</Text><TextInput accessibilityLabel={label} placeholderTextColor={colors.muted} {...props} style={[styles.input, props.style]} /></View>;
}
export function Tarjeta({ children }: PropsWithChildren) { return <View style={styles.card}>{children}</View>; }
export const fechaTexto = (fecha: string) => new Date(fecha).toLocaleString('es-SV', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
export const dinero = (centavos: number) => '$' + (centavos / 100).toFixed(2);
export const mensajeError = (error: unknown) => error instanceof Error ? error.message : 'Ocurrió un error. Intenta nuevamente.';
const styles = StyleSheet.create({
  input: { color: colors.text, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 14, minHeight: 50, fontSize: 16 },
  card: { padding: 18, gap: 12, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
});

