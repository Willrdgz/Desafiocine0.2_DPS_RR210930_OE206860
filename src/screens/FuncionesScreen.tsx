import { useRef, useState } from 'react';
import { Alert, Modal, Platform, StyleSheet, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { crearFuncion, borrarFuncion } from '../redux/operaciones';
import { asegurarGuardado } from '../redux/store';
import { Boton, Pagina, Tarjeta, mensajeError } from '../components/UI';
import Filtros from '../components/Filtros';
import { colors, ui } from '../theme';
import { useSesionPersonal } from '../navigation/SesionPersonal';

const diaTexto = (fecha: Date) => fecha.toLocaleDateString('es-SV', { day: 'numeric', month: 'long', year: 'numeric' });
const horaTexto = (hora: Date) => (hora.getHours() % 12 || 12) + ':' + String(hora.getMinutes()).padStart(2, '0') + (hora.getHours() < 12 ? ' AM' : ' PM');

export default function FuncionesScreen() {
  const state = useAppSelector(s => s);
  const dispatch = useAppDispatch();
  const { verificar } = useSesionPersonal();
  const [peliculaId, setPelicula] = useState('');
  const [salaId, setSala] = useState('');
  const [fecha, setFecha] = useState<Date | null>(null);
  const [hora, setHora] = useState<Date | null>(null);
  const [selector, setSelector] = useState<'date' | 'time' | null>(null);
  const [confirmacion, setConfirmacion] = useState<{ pelicula: string; sala: string; inicio: Date } | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const bloqueo = useRef(false);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  async function crear() {
    if (bloqueo.current) return;
    bloqueo.current = true; setOcupado(true);
    try {
      verificar();
      const pelicula = state.peliculas.find(p => p.codigo === peliculaId);
      if (!pelicula || !salaId || !fecha || !hora) throw new Error('Selecciona película, sala, fecha y hora antes de guardar.');
      const inicio = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), hora.getHours(), hora.getMinutes(), 0, 0);
      dispatch(crearFuncion({ peliculaId, salaId, inicio: inicio.toISOString() }));
      await asegurarGuardado();
      setConfirmacion({ pelicula: pelicula.nombre, sala: salaId, inicio });
      setPelicula(''); setSala(''); setFecha(null); setHora(null); setSelector(null);
    } catch (error) { Alert.alert('No se pudo programar', mensajeError(error)); }
    finally { bloqueo.current = false; setOcupado(false); }
  }
  async function eliminar(id: string) {
    try { verificar(); dispatch(borrarFuncion(id)); await asegurarGuardado(); }
    catch (error) { Alert.alert('No se pudo eliminar', mensajeError(error)); }
  }
  return <Pagina>
    <Text style={ui.title}>Nueva función</Text>
    <View pointerEvents={ocupado ? 'none' : 'auto'} style={styles.formulario}>
      <Text style={ui.body}>Película</Text>
      {state.peliculas.map(p => <Boton key={p.codigo} titulo={p.nombre} secundario={p.codigo !== peliculaId} onPress={() => { setPelicula(p.codigo); setSala(p.salaId); }} />)}
      {!state.peliculas.length && <Text style={ui.body}>Primero agrega una película.</Text>}
      <Text style={ui.body}>Sala</Text><Filtros opciones={state.salas.salas.map(s => s.id)} seleccionado={salaId} onSelect={setSala} />
      <Text style={ui.body}>Día de la función</Text>
      <Boton titulo={fecha ? diaTexto(fecha) : 'Seleccionar fecha en el calendario'} secundario onPress={() => setSelector('date')} />
      <Text style={ui.body}>Hora de la función</Text>
      <Boton titulo={hora ? horaTexto(hora) : 'Seleccionar hora · AM / PM'} secundario onPress={() => setSelector('time')} />
      {selector && <View>
        <DateTimePicker
          value={(selector === 'date' ? fecha : hora) ?? new Date()}
          mode={selector}
          display={Platform.OS === 'android' ? selector === 'date' ? 'calendar' : 'clock' : 'spinner'}
          is24Hour={false}
          locale={Platform.OS === 'ios' ? 'en-US' : undefined}
          minimumDate={selector === 'date' ? hoy : undefined}
          onChange={(event, valor) => {
            if (Platform.OS === 'android') setSelector(null);
            if (event.type === 'set' && valor) {
              if (selector === 'date') setFecha(valor);
              else setHora(valor);
            }
          }}
        />
        {Platform.OS === 'ios' && <Boton titulo="Listo" onPress={() => {
          if (selector === 'date' && !fecha) setFecha(new Date());
          if (selector === 'time' && !hora) setHora(new Date());
          setSelector(null);
        }} />}
      </View>}
    </View>
    <Boton titulo={ocupado ? 'Guardando…' : 'Guardar función'} disabled={ocupado || !peliculaId || !salaId || !fecha || !hora} onPress={crear} />
    <Text style={ui.heading}>Funciones registradas</Text>
    {[...state.salas.funciones].sort((a,b) => a.inicio.localeCompare(b.inicio)).map(f => <Tarjeta key={f.id}>
      <Text style={ui.heading}>{state.peliculas.find(p => p.codigo === f.peliculaId)?.nombre}</Text>
      <Text style={ui.body}>{f.salaId} · {diaTexto(new Date(f.inicio))} · {horaTexto(new Date(f.inicio))}</Text>
      <Boton titulo="Eliminar función" secundario onPress={() => Alert.alert('Eliminar función', 'Solo se puede eliminar si no tiene ventas.', [{ text: 'Cancelar', style: 'cancel' }, { text: 'Eliminar', style: 'destructive', onPress: () => eliminar(f.id) }])} />
    </Tarjeta>)}
    <Modal visible={!!confirmacion} transparent animationType="fade" onRequestClose={() => setConfirmacion(null)}>
      <View style={styles.fondo}>
        <View style={styles.alerta} accessibilityViewIsModal>
          <Text style={styles.icono}>✓</Text>
          <Text style={ui.heading}>¡Función guardada!</Text>
          <Text style={ui.body}>La función de «{confirmacion?.pelicula}» se ha guardado correctamente.</Text>
          {confirmacion && <Text style={styles.detalles}>{confirmacion.sala}{'\n'}{diaTexto(confirmacion.inicio)}{'\n'}{horaTexto(confirmacion.inicio)}</Text>}
          <Text style={ui.body}>El formulario está limpio para programar otra función.</Text>
          <Boton titulo="Entendido" onPress={() => setConfirmacion(null)} />
        </View>
      </View>
    </Modal>
  </Pagina>;
}
const styles = StyleSheet.create({
  formulario: { gap: 16 },
  fondo: { flex: 1, backgroundColor: '#000000AA', justifyContent: 'center', padding: 24 },
  alerta: { backgroundColor: colors.surface, borderRadius: 24, padding: 24, gap: 18, borderWidth: 1, borderColor: colors.border },
  icono: { color: colors.accent, fontSize: 44, fontWeight: '800', textAlign: 'center' },
  detalles: { color: colors.text, fontSize: 18, lineHeight: 28, fontWeight: '600' },
});
