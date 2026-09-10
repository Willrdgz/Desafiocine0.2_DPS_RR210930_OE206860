import { useRef, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { comprar, ocupados } from '../redux/operaciones';
import { asegurarGuardado } from '../redux/store';
import { Boton, Campo, Pagina, Tarjeta, fechaTexto, dinero, mensajeError } from '../components/UI';
import Asiento from '../components/Asiento';
import { ui } from '../theme';
export default function MapaAsientosScreen({ route, navigation }: NativeStackScreenProps<RootStackParamList, 'Asientos'>) {
  const { funcionId, cantidad } = route.params;
  const state = useAppSelector(s => s);
  const dispatch = useAppDispatch();
  const [seleccion, setSeleccion] = useState<string[]>([]);
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [guardando, setGuardando] = useState(false);
  const bloqueo = useRef(false);
  const funcion = state.salas.funciones.find(f => f.id === funcionId);
  const pelicula = state.peliculas.find(p => p.codigo === funcion?.peliculaId);
  const sala = state.salas.salas.find(s => s.id === funcion?.salaId);
  const reservados = ocupados(state, funcionId);
  const filas = sala ? [...new Set(sala.asientos.map(a => a[0]))] : [];
  function seleccionar(asiento: string) {
    if (guardando) return;
    if (seleccion.includes(asiento)) setSeleccion(seleccion.filter(a => a !== asiento));
    else if (seleccion.length < cantidad) setSeleccion([...seleccion, asiento]);
    else Alert.alert('Selección completa', 'Quita un asiento para cambiarlo por otro.');
  }
  async function confirmar() {
    if (bloqueo.current) return;
    if (seleccion.length !== cantidad) return Alert.alert('Faltan asientos', 'Selecciona exactamente ' + cantidad + ' asientos.');
    bloqueo.current = true;
    setGuardando(true);
    try {
      const id = dispatch(comprar({ funcionId, asientos: seleccion, nombre, correo }));
      await asegurarGuardado();
      navigation.replace('Boleto', { reservaId: id });
    } catch (error) { Alert.alert('No se pudo completar', mensajeError(error)); }
    finally { bloqueo.current = false; setGuardando(false); }
  }
  if (!funcion || !pelicula?.disponible || !sala) return <Pagina><Text style={ui.heading}>La función ya no está disponible.</Text></Pagina>;
  return <Pagina>
    <Text style={ui.eyebrow}>PASO 2 DE 2</Text><Text style={ui.title}>Tus asientos</Text>
    <Text style={ui.body}>{pelicula.nombre} · {sala.nombre}{'\n'}{fechaTexto(funcion.inicio)}</Text>
    <Tarjeta><Text style={[ui.body, { textAlign: 'center', letterSpacing: 4 }]}>PANTALLA</Text>
      {filas.map(fila => <View key={fila} style={{ flexDirection: 'row', gap: 6 }}>{sala.asientos.filter(a => a[0] === fila).map(a => <Asiento key={a} codigo={a} ocupado={reservados.includes(a)} seleccionado={seleccion.includes(a)} onPress={() => seleccionar(a)} />)}</View>)}
      <Text style={ui.body}>○ Disponible · ✓ Seleccionado · × Ocupado</Text>
    </Tarjeta>
    <Text style={ui.heading}>{seleccion.length} de {cantidad} seleccionados</Text>
    <Campo label="Nombre del cliente" value={nombre} onChangeText={setNombre} autoCapitalize="words" maxLength={100} editable={!guardando} />
    <Campo label="Correo electrónico" value={correo} onChangeText={setCorreo} autoCapitalize="none" keyboardType="email-address" maxLength={150} editable={!guardando} />
    <Text style={ui.heading}>Total: {dinero(Math.round(pelicula.precio * 100) * cantidad)}</Text>
    <Text style={ui.body}>La compra se registra en este dispositivo. No se realiza ningún cobro bancario.</Text>
    <Boton titulo={guardando ? 'Guardando…' : 'Confirmar compra'} disabled={guardando || seleccion.length !== cantidad} onPress={confirmar} />
  </Pagina>;
}

