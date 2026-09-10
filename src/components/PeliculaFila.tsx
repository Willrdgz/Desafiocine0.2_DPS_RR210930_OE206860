import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Pelicula } from '../types/pelicula';
import { colors, ui } from '../theme';
import Cartel from './Cartel';
export default function PeliculaFila({ pelicula, onPress }: { pelicula: Pelicula; onPress: () => void }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={`Ver detalle de ${pelicula.nombre}`} onPress={onPress} style={({ pressed }) => [styles.card, pressed && { opacity: 0.8 }]}>
    <Cartel pelicula={pelicula} />
    <View style={styles.details}><Text style={ui.heading}>{pelicula.nombre}</Text><Text style={ui.body}>{pelicula.clasificacion} · {pelicula.duracion} min · {pelicula.salaId}</Text>
      <View style={styles.footer}><Text style={styles.price}>${pelicula.precio.toFixed(2)} <Text style={styles.small}>/ entrada</Text></Text><Text style={styles.link}>Ver detalle →</Text></View>
    </View>
  </Pressable>;
}
const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: 18, marginBottom: 20 },
  details: { padding: 16, gap: 10 },
  footer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, alignItems: 'center' },
  price: { color: colors.text, fontSize: 21, fontWeight: '800' },
  small: { color: colors.muted, fontSize: 13, fontWeight: '400' },
  link: { color: colors.accent, fontWeight: '700' },
});
