import { useRef, useState } from 'react';
import { Alert, Switch, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PersonalParamList } from '../navigation/types';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { guardar } from '../redux/operaciones';
import { asegurarGuardado } from '../redux/store';
import { Boton, Campo, Pagina, mensajeError } from '../components/UI';
import Filtros from '../components/Filtros';
import { ui } from '../theme';
import { useSesionPersonal } from '../navigation/SesionPersonal';
export default function FormularioPeliculaScreen({ route, navigation }: NativeStackScreenProps<PersonalParamList, 'Formulario'>) {
  const pelicula = useAppSelector(s => s.peliculas.find(p => p.codigo === route.params.peliculaId));
  const salas = useAppSelector(s => s.salas.salas);
  const dispatch = useAppDispatch();
  const { verificar } = useSesionPersonal();
  const [codigo, setCodigo] = useState(pelicula?.codigo ?? '');
  const [nombre, setNombre] = useState(pelicula?.nombre ?? '');
  const [genero, setGenero] = useState(pelicula?.genero ?? '');
  const [duracion, setDuracion] = useState(pelicula?.duracion.toString() ?? '');
  const [precio, setPrecio] = useState(pelicula?.precio.toString() ?? '');
  const [clasificacion, setClasificacion] = useState(pelicula?.clasificacion ?? 'Todo público');
  const [salaId, setSala] = useState(pelicula?.salaId ?? salas[0]?.id ?? '');
  const [sinopsis, setSinopsis] = useState(pelicula?.sinopsis ?? '');
  const [disponible, setDisponible] = useState(pelicula?.disponible ?? true);
  const [guardando, setGuardando] = useState(false);
  const bloqueo = useRef(false);
  async function enviar() {
    if (bloqueo.current) return;
    bloqueo.current = true; setGuardando(true);
    try {
      verificar();
      if (!precio.trim() || !duracion.trim()) throw new Error('Completa el precio y la duración.');
      dispatch(guardar({ codigo, nombre, genero, duracion: Number(duracion), precio: Number(precio.replace(',', '.')), clasificacion, salaId, sinopsis, disponible, color: pelicula?.color ?? '#283C66' }, !!route.params.peliculaId));
      await asegurarGuardado(); navigation.goBack();
    } catch (error) { Alert.alert('Revisa los datos', mensajeError(error)); }
    finally { bloqueo.current = false; setGuardando(false); }
  }
  return <Pagina><Text style={ui.title}>{pelicula ? 'Editar película' : 'Nueva película'}</Text>
    <Campo label="Código único" value={codigo} onChangeText={setCodigo} editable={!route.params.peliculaId} autoCapitalize="characters" maxLength={30} />
    <Campo label="Nombre" value={nombre} onChangeText={setNombre} maxLength={100} />
    <Campo label="Género" value={genero} onChangeText={setGenero} maxLength={40} />
    <Campo label="Duración en minutos" value={duracion} onChangeText={setDuracion} keyboardType="number-pad" maxLength={4} />
    <Campo label="Precio de entrada ($)" value={precio} onChangeText={setPrecio} keyboardType="decimal-pad" maxLength={9} />
    <Text style={ui.body}>Clasificación</Text><Filtros opciones={['Todo público', '12+', '16+', '18+']} seleccionado={clasificacion} onSelect={setClasificacion} />
    <Text style={ui.body}>Sala asignada por defecto</Text><Filtros opciones={salas.map(s => s.id)} seleccionado={salaId} onSelect={setSala} />
    <Campo label="Sinopsis" value={sinopsis} onChangeText={setSinopsis} multiline maxLength={1500} />
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><Text style={ui.body}>Disponible para compra</Text><Switch accessibilityLabel="Disponible para compra" value={disponible} onValueChange={setDisponible} /></View>
    <Boton titulo={guardando ? 'Guardando…' : 'Guardar película'} disabled={guardando} onPress={enviar} />
  </Pagina>;
}
