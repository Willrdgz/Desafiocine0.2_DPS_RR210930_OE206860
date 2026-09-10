import { nanoid, ThunkAction, UnknownAction } from '@reduxjs/toolkit';
import { CineState } from './reducer';
import { registrarReserva, utilizarReserva } from './slices/reservasSlice';
import { guardarPelicula, eliminarPelicula } from './slices/peliculasSlice';
import { agregarFuncion, eliminarFuncion } from './slices/salasSlice';
import { Pelicula } from '../types/pelicula';
import { Funcion } from '../types/asiento';
type Operacion<T> = ThunkAction<T, CineState, unknown, UnknownAction>;
export function ocupados(state: CineState, funcionId: string): string[] {
  return state.reservas.filter(r => r.funcionId === funcionId).flatMap(r => r.asientos);
}
export const comprar = (datos: { funcionId: string; asientos: string[]; nombre: string; correo: string }): Operacion<string> => (dispatch, getState) => {
  // Validar y escribir sin awaits: otra compra no puede intercalarse entre ambos pasos.
  const state = getState();
  const funcion = state.salas.funciones.find(f => f.id === datos.funcionId);
  const pelicula = state.peliculas.find(p => p.codigo === funcion?.peliculaId);
  const sala = state.salas.salas.find(s => s.id === funcion?.salaId);
  if (!funcion || !pelicula?.disponible || !sala) throw new Error('Esta función ya no está disponible.');
  if (new Date(funcion.inicio).getTime() <= Date.now()) throw new Error('Esta función ya comenzó. Elige otro horario.');
  if (!datos.nombre.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo.trim())) throw new Error('Ingresa tu nombre y un correo válido.');
  if (!datos.asientos.length || new Set(datos.asientos).size !== datos.asientos.length || datos.asientos.some(a => !sala.asientos.includes(a))) throw new Error('Selecciona asientos válidos.');
  if (datos.asientos.some(a => ocupados(state, funcion.id).includes(a))) throw new Error('Uno de los asientos ya está ocupado. Cambia tu selección.');
  if (!Number.isFinite(pelicula.precio) || pelicula.precio < 0) throw new Error('El precio de esta película no es válido.');
  const id = 'CINE-' + nanoid(20);
  dispatch(registrarReserva({
    id, funcionId: funcion.id, peliculaId: pelicula.codigo, peliculaNombre: pelicula.nombre,
    salaNombre: sala.nombre, inicio: funcion.inicio, asientos: [...datos.asientos].sort(),
    cliente: { nombre: datos.nombre.trim(), correo: datos.correo.trim() },
    totalCentavos: Math.round(pelicula.precio * 100) * datos.asientos.length,
    creada: new Date().toISOString(), utilizada: false,
  }));
  return id;
};
export const guardar = (pelicula: Pelicula, editando: boolean): Operacion<void> => (dispatch, getState) => {
  const state = getState();
  const codigo = pelicula.codigo.trim().toUpperCase();
  const existente = state.peliculas.find(p => p.codigo.toUpperCase() === codigo);
  if (!codigo || !/^[A-Z0-9_-]+$/.test(codigo)) throw new Error('El código solo admite letras, números, guion y guion bajo.');
  if ((!editando && existente) || (editando && !existente)) throw new Error(editando ? 'La película ya no existe.' : 'Ya existe una película con ese código.');
  if (!pelicula.nombre.trim() || !pelicula.genero.trim() || !pelicula.clasificacion.trim()) throw new Error('Nombre, género y clasificación son obligatorios.');
  if (!Number.isInteger(pelicula.duracion) || pelicula.duracion <= 0) throw new Error('La duración debe ser un número entero mayor que cero.');
  if (!Number.isFinite(pelicula.precio) || pelicula.precio < 0) throw new Error('El precio debe ser un número igual o mayor que cero.');
  if (!state.salas.salas.some(s => s.id === pelicula.salaId)) throw new Error('Selecciona una sala válida.');
  // Un cambio de duración tampoco puede introducir cruces de funciones ya creadas.
  const funcionesPropias = state.salas.funciones.filter(f => f.peliculaId === codigo);
  for (const f of funcionesPropias) {
    const inicio = Date.parse(f.inicio);
    const conflicto = state.salas.funciones.some(otra => {
      if (otra.id === f.id || otra.salaId !== f.salaId) return false;
      const duracion = otra.peliculaId === codigo ? pelicula.duracion : state.peliculas.find(p => p.codigo === otra.peliculaId)?.duracion ?? 0;
      return inicio < Date.parse(otra.inicio) + duracion * 60000 && Date.parse(otra.inicio) < inicio + pelicula.duracion * 60000;
    });
    if (conflicto) throw new Error('La nueva duración se cruza con otra función de la misma sala.');
  }
  dispatch(guardarPelicula({ ...pelicula, codigo, nombre: pelicula.nombre.trim(), genero: pelicula.genero.trim(), clasificacion: pelicula.clasificacion.trim(), precio: Math.round(pelicula.precio * 100) / 100 }));
};
export const borrarPelicula = (id: string): Operacion<void> => (dispatch, getState) => {
  if (getState().reservas.some(r => r.peliculaId === id)) throw new Error('Esta película tiene ventas. Puedes marcarla como no disponible para conservar el historial.');
  dispatch(eliminarPelicula(id));
};
export const crearFuncion = (datos: Omit<Funcion, 'id'>): Operacion<void> => (dispatch, getState) => {
  const state = getState();
  const pelicula = state.peliculas.find(p => p.codigo === datos.peliculaId);
  const inicio = Date.parse(datos.inicio);
  if (!pelicula || !state.salas.salas.some(s => s.id === datos.salaId)) throw new Error('Selecciona película y sala.');
  if (!Number.isFinite(inicio) || inicio <= Date.now()) throw new Error('La fecha y hora deben estar en el futuro.');
  const fin = inicio + pelicula.duracion * 60000;
  if (state.salas.funciones.some(f => {
    if (f.salaId !== datos.salaId) return false;
    const otroInicio = Date.parse(f.inicio);
    const duracion = state.peliculas.find(p => p.codigo === f.peliculaId)?.duracion ?? 0;
    return inicio === otroInicio || (inicio < otroInicio + duracion * 60000 && otroInicio < fin);
  })) throw new Error('El horario coincide o se cruza con otra función de la misma sala.');
  dispatch(agregarFuncion({ ...datos, id: 'F-' + nanoid(12) }));
};
export const borrarFuncion = (id: string): Operacion<void> => (dispatch, getState) => {
  if (getState().reservas.some(r => r.funcionId === id)) throw new Error('No puedes eliminar una función con entradas vendidas.');
  dispatch(eliminarFuncion(id));
};
export const validarBoleto = (qr: string): Operacion<string> => (dispatch, getState) => {
  if (!qr.startsWith('CINE:1:')) throw new Error('Este QR no es un boleto de esta aplicación.');
  const reserva = getState().reservas.find(r => r.id === qr.slice(7));
  if (!reserva) throw new Error('Reserva no encontrada en este dispositivo.');
  if (reserva.utilizada) throw new Error('Este boleto ya fue utilizado.');
  dispatch(utilizarReserva({ id: reserva.id, fecha: new Date().toISOString() }));
  return reserva.id;
};
export function estadisticas(state: CineState) {
  const vendidos = state.reservas.reduce((n, r) => n + r.asientos.length, 0);
  const capacidad = state.salas.funciones.reduce((n, f) => n + (state.salas.salas.find(s => s.id === f.salaId)?.asientos.length ?? 0), 0);
  const conteo: Record<string, number> = {};
  state.reservas.forEach(r => { conteo[r.peliculaId] = (conteo[r.peliculaId] ?? 0) + r.asientos.length; });
  const ganadora = Object.entries(conteo).sort((a, b) => b[1] - a[1])[0];
  return { peliculas: state.peliculas.length, funciones: state.salas.funciones.length, vendidos, ocupados: vendidos,
    disponibles: capacidad - vendidos, ingresos: state.reservas.reduce((n, r) => n + r.totalCentavos, 0),
    popular: ganadora ? state.peliculas.find(p => p.codigo === ganadora[0])?.nombre ?? 'Sin datos' : 'Sin ventas todavía' };
}

