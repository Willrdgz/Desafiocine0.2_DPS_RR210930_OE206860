import { useRef, useState } from 'react';
import { Alert, Text } from 'react-native';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { crearFuncion, borrarFuncion } from '../redux/operaciones';
import { asegurarGuardado } from '../redux/store';
import { Boton, Campo, Pagina, Tarjeta, fechaTexto, mensajeError } from '../components/UI';
import Filtros from '../components/Filtros';
import { ui } from '../theme';
import { useSesionPersonal } from '../navigation/SesionPersonal';
export default function FuncionesScreen() {
  const state = useAppSelector(s => s);
  const dispatch = useAppDispatch();
  const { verificar } = useSesionPersonal();
  const [peliculaId, setPelicula] = useState(state.peliculas[0]?.codigo ?? '');
  const [salaId, setSala] = useState(state.salas.salas[0]?.id ?? '');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const bloqueo = useRef(false);
  async function crear() {
    if (bloqueo.current) return;
    bloqueo.current = true; setOcupado(true);
    try {
      verificar();
      if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(hora)) throw new Error('Usa fecha AAAA-MM-DD y hora HH:MM (24 horas).');
      const [year, month, day] = fecha.split('-').map(Number);
      const [hours, minutes] = hora.split(':').map(Number);
      const inicio = new Date(year, month - 1, day, hours, minutes);
      if (inicio.getFullYear() !== year || inicio.getMonth() !== month - 1 || inicio.getDate() !== day) throw new Error('La fecha no existe.');
      dispatch(crearFuncion({ peliculaId, salaId, inicio: inicio.toISOString() }));
      await asegurarGuardado(); setFecha(''); setHora('');
      Alert.alert('Función creada', 'Ya está disponible en el catálogo si la película está activa.');
    } catch (error) { Alert.alert('No se pudo programar', mensajeError(error)); }
    finally { bloqueo.current = false; setOcupado(false); }
  }
  async function eliminar(id: string) {
    try { verificar(); dispatch(borrarFuncion(id)); await asegurarGuardado(); }
    catch (error) { Alert.alert('No se pudo eliminar', mensajeError(error)); }
  }
  return <Pagina><Text style={ui.title}>Nueva función</Text>
    <Text style={ui.body}>Película</Text>
    {state.peliculas.map(p => <Boton key={p.codigo} titulo={p.nombre} secundario={p.codigo !== peliculaId} onPress={() => { setPelicula(p.codigo); setSala(p.salaId); }} />)}
    {!state.peliculas.length && <Text style={ui.body}>Primero agrega una película.</Text>}
    <Text style={ui.body}>Sala</Text><Filtros opciones={state.salas.salas.map(s => s.id)} seleccionado={salaId} onSelect={setSala} />
    <Campo label="Fecha (AAAA-MM-DD)" placeholder="2026-09-15" value={fecha} onChangeText={setFecha} maxLength={10} />
    <Campo label="Hora local (HH:MM)" placeholder="18:30" value={hora} onChangeText={setHora} maxLength={5} />
    <Boton titulo={ocupado ? 'Guardando…' : 'Crear función'} disabled={ocupado || !peliculaId} onPress={crear} />
    <Text style={ui.heading}>Funciones registradas</Text>
    {[...state.salas.funciones].sort((a,b) => a.inicio.localeCompare(b.inicio)).map(f => <Tarjeta key={f.id}><Text style={ui.heading}>{state.peliculas.find(p => p.codigo === f.peliculaId)?.nombre}</Text><Text style={ui.body}>{f.salaId} · {fechaTexto(f.inicio)}</Text><Boton titulo="Eliminar función" secundario onPress={() => Alert.alert('Eliminar función', 'Solo se puede eliminar si no tiene ventas.', [{ text: 'Cancelar', style: 'cancel' }, { text: 'Eliminar', style: 'destructive', onPress: () => eliminar(f.id) }])} /></Tarjeta>)}
  </Pagina>;
}
