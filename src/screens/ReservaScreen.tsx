import { useState } from 'react';
import { Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { actualizarBorrador, borradorVacio } from '../redux/slices/borradoresSlice';
import { ocupados } from '../redux/operaciones';
import { Boton, Pagina, Tarjeta, fechaTexto, dinero } from '../components/UI';
import { ui } from '../theme';
export default function ReservaScreen({ route, navigation }: NativeStackScreenProps<RootStackParamList, 'Reserva'>) {
  const state = useAppSelector(s => s);
  const pelicula = state.peliculas.find(p => p.codigo === route.params.peliculaId);
  const funciones = state.salas.funciones.filter(f => f.peliculaId === pelicula?.codigo && Date.parse(f.inicio) > Date.now()).sort((a,b) => a.inicio.localeCompare(b.inicio));
  const [seleccion, setSeleccion] = useState(route.params.funcionId ?? '');
  const dispatch = useAppDispatch();
  const borrador = state.borradores[seleccion] ?? borradorVacio;
  const cantidad = borrador.cantidad;
  const setCantidad = (cantidad: number) => dispatch(actualizarBorrador({ funcionId: seleccion, cambios: { cantidad } }));
  const funcion = funciones.find(f => f.id === seleccion);
  const sala = state.salas.salas.find(s => s.id === funcion?.salaId);
  const disponibles = funcion && sala ? sala.asientos.length - ocupados(state, funcion.id).length : 0;
  if (!pelicula?.disponible) return <Pagina><Text style={ui.heading}>Esta película no está disponible.</Text></Pagina>;
  return <Pagina>
    <Text style={ui.eyebrow}>PASO 1 DE 2</Text><Text style={ui.title}>{pelicula.nombre}</Text>
    <Text style={ui.heading}>Elige una función</Text>
    {!funciones.length && <Text style={ui.body}>No hay funciones futuras. El personal puede programarlas desde su zona.</Text>}
    {funciones.map(f => <Boton key={f.id} secundario={seleccion !== f.id} titulo={f.salaId + ' · ' + fechaTexto(f.inicio)} onPress={() => setSeleccion(f.id)} />)}
    {!!funcion && <Tarjeta>
      <Text style={ui.heading}>Cantidad de entradas: {cantidad}</Text><Text style={ui.body}>{disponibles} asientos disponibles · {dinero(Math.round(pelicula.precio * 100))} por entrada</Text>
      <Boton titulo="− Quitar una" secundario disabled={cantidad <= Math.max(1, borrador.asientos.length)} onPress={() => setCantidad(cantidad - 1)} />
      <Boton titulo="+ Agregar una" secundario disabled={cantidad >= disponibles} onPress={() => setCantidad(cantidad + 1)} />
      {!!borrador.asientos.length && <Text style={ui.body}>Asientos seleccionados: {borrador.asientos.join(', ')}. Para reducir la cantidad, quita primero los asientos en el mapa.</Text>}
      <Text style={ui.heading}>Total: {dinero(Math.round(pelicula.precio * 100) * cantidad)}</Text>
    </Tarjeta>}
    <Boton titulo="Elegir asientos" disabled={!funcion || cantidad > disponibles} onPress={() => funcion && navigation.navigate('Asientos', { funcionId: funcion.id, cantidad })} />
  </Pagina>;
}
