import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useAppSelector } from '../redux/hooks';
import { Boton } from '../components/UI';
import Cartel from '../components/Cartel';
import { colors, ui } from '../theme';
export default function DetallePeliculaScreen({ route, navigation }: NativeStackScreenProps<RootStackParamList, 'Detalle'>) {
  const pelicula = useAppSelector(s => s.peliculas.find(p => p.codigo === route.params.peliculaId));
  if (!pelicula) return <View style={[ui.page, ui.content]}><Text style={ui.heading}>Película no encontrada</Text></View>;
  return <SafeAreaView style={ui.page} edges={['bottom', 'left', 'right']}>
    <ScrollView contentContainerStyle={ui.content}>
      <Cartel pelicula={pelicula} /><Text style={ui.eyebrow}>{pelicula.disponible ? 'EN CARTELERA' : 'NO DISPONIBLE'}</Text>
      <Text style={ui.title}>{pelicula.nombre}</Text><Text style={ui.body}>{pelicula.genero} · {pelicula.duracion} min · {pelicula.clasificacion}</Text>
      <Text style={ui.heading}>La historia</Text><Text style={ui.body}>{pelicula.sinopsis}</Text>
      <View style={{ backgroundColor: colors.surface, padding: 20, borderRadius: 16, gap: 10 }}><Text style={ui.heading}>{pelicula.salaId}</Text><Text style={ui.body}>Precio por entrada</Text><Text style={[ui.title, { color: colors.accent }]}>${pelicula.precio.toFixed(2)}</Text></View>
      <Boton titulo="Elegir función y comprar" disabled={!pelicula.disponible} onPress={() => navigation.navigate('Reserva', { peliculaId: pelicula.codigo })} />
    </ScrollView>
  </SafeAreaView>;
}
