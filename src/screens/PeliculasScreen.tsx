import { useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList, TabsParamList } from '../navigation/types';
import { useAppSelector } from '../redux/hooks';
import { Boton } from '../components/UI';
import Buscador from '../components/Buscador';
import Filtros from '../components/Filtros';
import PeliculaFila from '../components/PeliculaFila';
import { ui } from '../theme';
type Props = CompositeScreenProps<BottomTabScreenProps<TabsParamList, 'Cartelera'>, NativeStackScreenProps<RootStackParamList>>;
const normalizar = (texto: string) => texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
export default function PeliculasScreen({ navigation }: Props) {
  const disponibles = useAppSelector(s => s.peliculas).filter(p => p.disponible);
  const generos = ['Todos', ...new Set(disponibles.map(p => p.genero))];
  const [busqueda, setBusqueda] = useState('');
  const [genero, setGenero] = useState('Todos');
  const [clasificacion, setClasificacion] = useState('Todas');
  const [sala, setSala] = useState('Todas las salas');
  const resultados = disponibles.filter(p => (genero === 'Todos' || p.genero === genero) && (clasificacion === 'Todas' || p.clasificacion === clasificacion) && (sala === 'Todas las salas' || p.salaId === sala) && normalizar(`${p.nombre} ${p.genero} ${p.clasificacion} ${p.salaId}`).includes(normalizar(busqueda)));
  return <SafeAreaView style={ui.page} edges={['top', 'left', 'right']}>
    <FlatList data={resultados} keyExtractor={p => p.codigo} contentContainerStyle={ui.content} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag"
      ListHeaderComponent={<View style={{ gap: 18, marginBottom: 4 }}>
        <Text style={ui.eyebrow}>CINE · TU PRÓXIMA HISTORIA</Text><Text style={ui.title}>Nos vemos en el cine.</Text>
        <Text style={ui.body}>Explora las películas disponibles y encuentra tu próxima historia.</Text>
        <Buscador value={busqueda} onChangeText={setBusqueda} />
        <Text style={ui.body}>Género</Text><Filtros opciones={generos} seleccionado={genero} onSelect={setGenero} />
        <Text style={ui.body}>Clasificación</Text><Filtros opciones={['Todas', ...new Set(disponibles.map(p => p.clasificacion))]} seleccionado={clasificacion} onSelect={setClasificacion} />
        <Text style={ui.body}>Sala asignada</Text><Filtros opciones={['Todas las salas', ...new Set(disponibles.map(p => p.salaId))]} seleccionado={sala} onSelect={setSala} />
        <Boton titulo="Limpiar búsqueda y filtros" secundario onPress={() => { setBusqueda(''); setGenero('Todos'); setClasificacion('Todas'); setSala('Todas las salas'); }} />
        <Text style={ui.heading}>En cartelera · {resultados.length}</Text>
      </View>}
      renderItem={({ item }) => <PeliculaFila pelicula={item} onPress={() => navigation.navigate('Detalle', { peliculaId: item.codigo })} />}
      ListFooterComponent={<Boton titulo="Acceso del personal" secundario onPress={() => navigation.navigate('Personal')} />}
      ListEmptyComponent={<View style={{ gap: 8, paddingVertical: 24 }}><Text style={ui.heading}>Sin coincidencias</Text><Text style={ui.body}>Prueba con otro nombre o selecciona otro género.</Text></View>}
    />
  </SafeAreaView>;
}
