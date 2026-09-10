import { StyleSheet, Text, View } from 'react-native';
import { Pelicula } from '../types/pelicula';
export default function Cartel({ pelicula }: { pelicula: Pelicula }) {
  return <View style={[styles.poster, { backgroundColor: pelicula.color }]}>
    <Text style={styles.label}>CINE · SELECCIÓN</Text>
    <View style={styles.orbit}><View style={styles.planet} /></View>
    <Text style={styles.name}>{pelicula.nombre.toUpperCase()}</Text>
    <Text style={styles.genre}>{pelicula.genero}</Text>
  </View>;
}
const styles = StyleSheet.create({
  poster: { padding: 24, borderRadius: 18, minHeight: 240, gap: 16, overflow: 'hidden' },
  label: { color: '#FFFFFF', fontSize: 11, letterSpacing: 3, fontWeight: '700' },
  orbit: { alignSelf: 'center', width: 100, height: 100, borderRadius: 50, borderWidth: 1, borderColor: '#FFFFFF66', alignItems: 'center', justifyContent: 'center' },
  planet: { width: 62, height: 62, borderRadius: 31, backgroundColor: '#FFFFFF22', borderWidth: 8, borderColor: '#FFFFFF33' },
  name: { color: '#FFFFFF', fontSize: 26, fontWeight: '900', letterSpacing: 1 },
  genre: { color: '#FFFFFF', fontSize: 13 },
});
