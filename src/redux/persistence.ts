import { configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import { cineReducer, CineState } from './reducer';
export interface Almacenamiento {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<unknown>;
  removeItem(key: string): Promise<unknown>;
}
function objeto(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
const texto = (v: unknown) => typeof v === 'string';
const fecha = (v: unknown) => texto(v) && Number.isFinite(Date.parse(v as string));
const numero = (v: unknown) => typeof v === 'number' && Number.isFinite(v) && v >= 0;
export function datosValidos(value: unknown): value is CineState {
  if (!objeto(value) || !Array.isArray(value.peliculas) || !Array.isArray(value.reservas) || !objeto(value.salas) || !Array.isArray(value.salas.salas) || !Array.isArray(value.salas.funciones)) return false;
  const peliculas = value.peliculas;
  const salas = value.salas.salas;
  const funciones = value.salas.funciones;
  const reservas = value.reservas;
  if (value.borradores !== undefined && (!objeto(value.borradores) || !Object.values(value.borradores).every(b => objeto(b) && Number.isInteger(b.cantidad) && typeof b.cantidad === 'number' && b.cantidad > 0 && Array.isArray(b.asientos) && b.asientos.every(texto) && texto(b.nombre) && texto(b.correo)))) return false;
  if (!peliculas.every(p => objeto(p) && (p.imagen === undefined || (typeof p.imagen === 'string' && /^[a-zA-Z0-9_-]+\.(jpg|jpeg|png|webp|heic|avif)$/i.test(p.imagen))))) return false;
  if (!peliculas.every(p => objeto(p) && ['codigo', 'nombre', 'genero', 'clasificacion', 'salaId', 'sinopsis', 'color'].every(k => texto(p[k])) && numero(p.precio) && numero(p.duracion) && typeof p.disponible === 'boolean')) return false;
  if (!salas.every(s => objeto(s) && texto(s.id) && texto(s.nombre) && Array.isArray(s.asientos) && s.asientos.every(texto) && new Set(s.asientos).size === s.asientos.length)) return false;
  if (!funciones.every(f => objeto(f) && texto(f.id) && texto(f.peliculaId) && texto(f.salaId) && fecha(f.inicio) && peliculas.some(p => p.codigo === f.peliculaId) && salas.some(s => s.id === f.salaId))) return false;
  if (!reservas.every(r => objeto(r) && ['id', 'funcionId', 'peliculaId', 'peliculaNombre', 'salaNombre'].every(k => texto(r[k])) && fecha(r.inicio) && fecha(r.creada) && numero(r.totalCentavos) && Number.isInteger(r.totalCentavos) && typeof r.utilizada === 'boolean' && (!r.utilizada || fecha(r.utilizadaEn)) && objeto(r.cliente) && texto(r.cliente.nombre) && texto(r.cliente.correo) && Array.isArray(r.asientos) && r.asientos.length > 0 && r.asientos.every(texto) && new Set(r.asientos).size === r.asientos.length && funciones.some(f => f.id === r.funcionId && f.peliculaId === r.peliculaId))) return false;
  if ([peliculas.map(p => p.codigo), salas.map(s => s.id), funciones.map(f => f.id), reservas.map(r => r.id)].some(ids => new Set(ids).size !== ids.length)) return false;
  for (const f of funciones) {
    const asientos = reservas.filter(r => r.funcionId === f.id).flatMap(r => r.asientos);
    const sala = salas.find(s => s.id === f.salaId);
    if (new Set(asientos).size !== asientos.length || asientos.some(a => !sala.asientos.includes(a))) return false;
  }
  return true;
}
export function crearStorePersistente(adapter: Almacenamiento) {
  let fallo: string | null = null;
  const observadores = new Set<() => void>();
  function reportar(mensaje: string) { fallo = mensaje; observadores.forEach(fn => fn()); }
  const storage = {
    async getItem(key: string) {
      try {
        const raw = await adapter.getItem(key);
        if (raw !== null) {
          const container: unknown = JSON.parse(raw);
          if (!objeto(container)) throw new Error('Formato inválido');
          const decoded = Object.fromEntries(Object.entries(container).map(([k, v]) => [k, JSON.parse(String(v))]));
          if (!datosValidos(decoded)) throw new Error('Datos inválidos');
        }
        return raw;
      } catch (error) {
        reportar('No se pudieron recuperar los datos. Cierra y vuelve a abrir la aplicación. Si continúa, conserva sus datos y solicita revisión; no se sobrescribirá el almacenamiento.');
        throw error;
      }
    },
    async setItem(key: string, value: string) {
      if (fallo) throw new Error(fallo);
      try { return await adapter.setItem(key, value); }
      catch (error) {
        reportar('No se pudieron guardar los cambios. Revisa el espacio del dispositivo. Las operaciones recientes podrían no estar guardadas; vuelve a abrir la aplicación antes de continuar.');
        throw error;
      }
    },
    removeItem: (key: string) => adapter.removeItem(key),
  };
  const reducer = persistReducer({ key: 'cine-v1', version: 1, timeout: 0, storage }, cineReducer);
  const store = configureStore({
    reducer,
    middleware: getDefault => getDefault({ serializableCheck: { ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER] } }),
  });
  const persistor = persistStore(store);
  return {
    store, persistor,
    estadoAlmacenamiento: () => fallo,
    observarAlmacenamiento: (fn: () => void) => { observadores.add(fn); return () => { observadores.delete(fn); }; },
    asegurarGuardado: async () => { await persistor.flush(); if (fallo) throw new Error(fallo); },
  };
}
