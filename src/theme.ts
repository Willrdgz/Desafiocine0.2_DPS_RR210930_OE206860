import { StyleSheet } from 'react-native';
export const colors = { background: '#101319', surface: '#1C222C', border: '#343D4C', text: '#F6F3EC', muted: '#B0BAC8', accent: '#F5C451', ink: '#19150B' };
export const ui = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, gap: 20, paddingBottom: 32 },
  eyebrow: { color: colors.accent, fontSize: 12, fontWeight: '800', letterSpacing: 2 },
  title: { color: colors.text, fontSize: 32, fontWeight: '800' },
  heading: { color: colors.text, fontSize: 21, fontWeight: '700' },
  body: { color: colors.muted, fontSize: 16, lineHeight: 24 },
  button: { backgroundColor: colors.accent, padding: 16, borderRadius: 14, alignItems: 'center', minHeight: 48 },
  buttonText: { color: colors.ink, fontWeight: '800', fontSize: 16 },
});
