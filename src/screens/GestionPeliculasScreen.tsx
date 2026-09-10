import { useState } from 'react';
import { Alert, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PersonalParamList } from '../navigation/types';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { guardar, borrarPelicula } from '../redux/operaciones';
import { asegurarGuardado } from '../redux/store';
import { Pelicula } from '../types/pelicula';
import Buscador from '../components/Buscador';
import Filtros from '../components/Filtros';
import { Boton, Pagina, Tarjeta, mensajeError } from '../components/UI';
import { ui } from '../theme';
import { useSesionPersonal } from '../navigation/SesionPersonal';
export default function GestionPeliculasScreen({ navigation }: NativeStackScreenProps<PersonalParamList, 'Gestion'>) {
  const peliculas = useAppSelector(s => s.peliculas);
  const dispatch = useAppDispatch();
  const { verificar } = useSesionPersonal();
  const [busqueda, setBusqueda] = useState('');
  const [estado, setEstado] = useState('Todas');
  const [genero, setGenero] = useState('Todos');
  const [clasificacion, setClasificacion] = useState('Todas');
  const [sala, setSala] = useState('Todas las salas');
  const [ocupado, setOcupado] = useState(false);
  async function cambiar(p: Pelicula, eliminar = false) {
    if (ocupado) return;
    setOcupado(true);
    try {
      verificar();
      if (eliminar) dispatch(borrarPelicula(p.codigo));
      else dispatch(guardar({ ...p, disponible: !p.disponible }, true));
      await asegurarGuardado();
    } catch (error) { Alert.alert('No se pudo guardar', mensajeError(error)); }
    finally { setOcupado(false); }
  }
  const normalizar = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const lista = peliculas.filter(p => normalizar(p.nombre + ' ' + p.codigo + ' ' + p.genero + ' ' + p.clasificacion + ' ' + p.salaId).includes(normalizar(busqueda.trim())) && (estado === 'Todas' || (estado === 'Disponible') === p.disponible) && (genero === 'Todos' || p.genero === genero) && (clasificacion === 'Todas' || p.clasificacion === clasificacion) && (sala === 'Todas las salas' || p.salaId === sala));
  return <Pagina><Boton titulo="Agregar película" onPress={() => navigation.navigate('Formulario', {})} />
    <Buscador value={busqueda} onChangeText={setBusqueda} /><Filtros opciones={['Todas', 'Disponible', 'No disponible']} seleccionado={estado} onSelect={setEstado} />
    <Text style={ui.body}>Género</Text><Filtros opciones={['Todos', ...new Set(peliculas.map(p => p.genero))]} seleccionado={genero} onSelect={setGenero} />
    <Text style={ui.body}>Clasificación</Text><Filtros opciones={['Todas', ...new Set(peliculas.map(p => p.clasificacion))]} seleccionado={clasificacion} onSelect={setClasificacion} />
    <Text style={ui.body}>Sala asignada</Text><Filtros opciones={['Todas las salas', ...new Set(peliculas.map(p => p.salaId))]} seleccionado={sala} onSelect={setSala} />
    <Boton titulo="Limpiar filtros" secundario onPress={() => { setBusqueda(''); setEstado('Todas'); setGenero('Todos'); setClasificacion('Todas'); setSala('Todas las salas'); }} />
    {!lista.length && <Text style={ui.body}>No hay películas para estos filtros.</Text>}
    {lista.map(p => <Tarjeta key={p.codigo}><Text style={ui.heading}>{p.nombre}</Text><Text style={ui.body}>{p.codigo} · {p.genero} · {p.clasificacion} · {p.salaId}{'\n'}{p.disponible ? 'Disponible' : 'No disponible'}</Text>
      <Boton titulo="Editar" secundario onPress={() => navigation.navigate('Formulario', { peliculaId: p.codigo })} />
      <Boton titulo={p.disponible ? 'Marcar no disponible' : 'Marcar disponible'} disabled={ocupado} secundario onPress={() => cambiar(p)} />
      <Boton titulo="Eliminar" disabled={ocupado} secundario onPress={() => Alert.alert('Eliminar película', 'Se eliminarán también sus funciones sin ventas. Esta acción no se puede deshacer.', [{ text: 'Cancelar', style: 'cancel' }, { text: 'Eliminar', style: 'destructive', onPress: () => cambiar(p, true) }])} />
    </Tarjeta>)}
  </Pagina>;
}
