import { useRef, useState } from 'react';
import { Alert, Image, Switch, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { guardarImagen, uriImagen } from '../services/imagenes';
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
  const { verificar, conSelector } = useSesionPersonal();
  const [imagen, setImagen] = useState(pelicula?.imagen);
  const [seleccionando, setSeleccionando] = useState(false);
  async function elegirImagen() {
    if (bloqueo.current) return;
    bloqueo.current = true; setSeleccionando(true);
    try {
      verificar();
      const resultado = await conSelector(() => ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [2, 3], quality: 0.8 }));
      if (!resultado.canceled && resultado.assets[0]) {
        const archivo = await guardarImagen(resultado.assets[0].uri);
        verificar();
        setImagen(archivo);
      }
    } catch (error) { Alert.alert('No se pudo seleccionar la imagen', mensajeError(error)); }
    finally { bloqueo.current = false; setSeleccionando(false); }
  }
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
      dispatch(guardar({ codigo, nombre, genero, duracion: Number(duracion), precio: Number(precio.replace(',', '.')), clasificacion, salaId, sinopsis, disponible, imagen, color: pelicula?.color ?? '#283C66' }, !!route.params.peliculaId));
      await asegurarGuardado(); navigation.goBack();
      Alert.alert(route.params.peliculaId ? '¡Película actualizada!' : '¡Película agregada!', 'La película «' + nombre.trim() + '» se ha ' + (route.params.peliculaId ? 'actualizado' : 'agregado') + ' correctamente.', [{ text: 'Entendido' }]);
    } catch (error) { Alert.alert('Revisa los datos', mensajeError(error)); }
    finally { bloqueo.current = false; setGuardando(false); }
  }
  return <Pagina><Text style={ui.title}>{pelicula ? 'Editar película' : 'Nueva película'}</Text>
    <Text style={ui.body}>Póster de la película (opcional)</Text>
    {imagen && <Image source={{ uri: uriImagen(imagen) }} accessibilityLabel="Vista previa del póster" resizeMode="contain" style={{ width: '100%', height: 280 }} />}
    <Boton titulo={seleccionando ? 'Seleccionando…' : imagen ? 'Cambiar imagen' : 'Seleccionar imagen de la galería'} disabled={seleccionando || guardando} onPress={elegirImagen} />
    {imagen && <Boton titulo="Quitar imagen" secundario disabled={seleccionando || guardando} onPress={() => setImagen(undefined)} />}
    <Campo label="Código único" value={codigo} onChangeText={setCodigo} editable={!route.params.peliculaId} autoCapitalize="characters" maxLength={30} />
    <Campo label="Nombre" value={nombre} onChangeText={setNombre} maxLength={100} />
    <Campo label="Género" value={genero} onChangeText={setGenero} maxLength={40} />
    <Campo label="Duración en minutos" value={duracion} onChangeText={setDuracion} keyboardType="number-pad" maxLength={4} />
    <Campo label="Precio de entrada ($)" value={precio} onChangeText={setPrecio} keyboardType="decimal-pad" maxLength={9} />
    <Text style={ui.body}>Clasificación</Text><Filtros opciones={['Todo público', '12+', '16+', '18+']} seleccionado={clasificacion} onSelect={setClasificacion} />
    <Text style={ui.body}>Sala asignada por defecto</Text><Filtros opciones={salas.map(s => s.id)} seleccionado={salaId} onSelect={setSala} />
    <Campo label="Sinopsis" value={sinopsis} onChangeText={setSinopsis} multiline maxLength={1500} />
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><Text style={ui.body}>Disponible para compra</Text><Switch accessibilityLabel="Disponible para compra" value={disponible} onValueChange={setDisponible} /></View>
    <Boton titulo={guardando ? 'Guardando…' : 'Guardar película'} disabled={guardando || seleccionando} onPress={enviar} />
  </Pagina>;
}
