import { useCallback, useRef, useState } from 'react';
import { FlatList, PanResponder, StyleSheet, Text, View } from 'react-native';
import { CompositeScreenProps, useFocusEffect } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList, TabsParamList } from '../navigation/types';
import { useAppSelector } from '../redux/hooks';
import { Boton } from '../components/UI';
import Buscador from '../components/Buscador';
import Filtros from '../components/Filtros';
import PeliculaFila from '../components/PeliculaFila';
import { colors, ui } from '../theme';
type Props = CompositeScreenProps<BottomTabScreenProps<TabsParamList, 'Cartelera'>, NativeStackScreenProps<RootStackParamList>>;
const normalizar = (texto: string) => texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
export default function PeliculasScreen({ navigation }: Props) {
  const disponibles = useAppSelector(s => s.peliculas).filter(p => p.disponible);
  const generos = ['Todos', ...new Set(disponibles.map(p => p.genero))];
  const [busqueda, setBusqueda] = useState('');
  const [genero, setGenero] = useState('Todos');
  const [clasificacion, setClasificacion] = useState('Todas');
  const [sala, setSala] = useState('Todas las salas');
  const [mostrarPersonal, setMostrarPersonal] = useState(false);
  const [alFinal, setAlFinal] = useState(false);
  const medidas = useRef({ alto: 0, contenido: 0, y: 0 });
  const actualizarFinal = () => {
    const { alto, contenido, y } = medidas.current;
    setAlFinal(alto > 0 && contenido - alto - y <= 48);
  };
  const espera = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelarEspera = () => {
    if (espera.current) clearTimeout(espera.current);
    espera.current = null;
  };
  useFocusEffect(useCallback(() => {
    setMostrarPersonal(false);
    return () => {
      if (espera.current) clearTimeout(espera.current);
      espera.current = null;
    };
  }, []));
  const [detector] = useState(() => PanResponder.create({
    // Una zona propia toma el contacto desde el inicio; no depende del overscroll.
    onStartShouldSetPanResponder: () => true,
    onStartShouldSetPanResponderCapture: () => true,
    onPanResponderGrant: () => {
      cancelarEspera();
      espera.current = setTimeout(() => { espera.current = null; setMostrarPersonal(true); }, 700);
    },
    onPanResponderMove: (_, gesto) => {
      if (Math.abs(gesto.dy) >= 30 && Math.abs(gesto.dy) > Math.abs(gesto.dx)) {
        cancelarEspera();
        setMostrarPersonal(true);
      } else if (Math.abs(gesto.dx) > 20) cancelarEspera();
    },
    onPanResponderRelease: cancelarEspera,
    onPanResponderTerminate: cancelarEspera,
    onPanResponderTerminationRequest: () => false,
    onShouldBlockNativeResponder: () => true,
  }));
  const resultados = disponibles.filter(p => (genero === 'Todos' || p.genero === genero) && (clasificacion === 'Todas' || p.clasificacion === clasificacion) && (sala === 'Todas las salas' || p.salaId === sala) && normalizar(`${p.nombre} ${p.genero} ${p.clasificacion} ${p.salaId}`).includes(normalizar(busqueda)));
  return <SafeAreaView style={ui.page} edges={['top', 'left', 'right']}>
    <View style={ui.page}>
    <FlatList data={resultados} keyExtractor={p => p.codigo} contentContainerStyle={[ui.content, styles.contenido]} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag"
      onLayout={({ nativeEvent }) => { medidas.current.alto = nativeEvent.layout.height; actualizarFinal(); }}
      onContentSizeChange={(_, alto) => { medidas.current.contenido = alto; actualizarFinal(); }}
      scrollEventThrottle={32}
      onScroll={({ nativeEvent: { contentSize, layoutMeasurement, contentOffset } }) => {
        medidas.current = { alto: layoutMeasurement.height, contenido: contentSize.height, y: contentOffset.y };
        actualizarFinal();
        if (mostrarPersonal && contentSize.height - layoutMeasurement.height - contentOffset.y > 180) setMostrarPersonal(false);
      }}
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
      ListEmptyComponent={<View style={{ gap: 8, paddingVertical: 24 }}><Text style={ui.heading}>Sin coincidencias</Text><Text style={ui.body}>Prueba con otro nombre o selecciona otro género.</Text></View>}
    />
    {(alFinal || mostrarPersonal) && <View style={styles.zonaFinal}>
        {mostrarPersonal
          ? <Boton titulo="Acceso del personal" secundario onPress={() => navigation.navigate('Personal')} />
          : <View collapsable={false} style={styles.zonaGesto} {...detector.panHandlers}
              accessible accessibilityRole="button" accessibilityLabel="Mostrar acceso del personal"
              accessibilityActions={[{ name: 'activate', label: 'Mostrar acceso del personal' }]}
              onAccessibilityAction={() => setMostrarPersonal(true)}>
              <View style={styles.barra} />
          </View>}
      </View>}
    </View>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  contenido: { paddingBottom: 72 },
  zonaFinal: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: colors.background, paddingHorizontal: 20, paddingBottom: 4, justifyContent: 'center' },
  zonaGesto: { height: 36, justifyContent: 'center', alignItems: 'center' },
  barra: { width: 56, height: 5, borderRadius: 3, backgroundColor: '#697586' },
});
