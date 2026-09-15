import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { registrarReserva } from './reservasSlice';
export interface Borrador { cantidad: number; asientos: string[]; nombre: string; correo: string }
export const borradorVacio: Borrador = { cantidad: 1, asientos: [], nombre: '', correo: '' };
const slice = createSlice({
  name: 'borradores', initialState: {} as Record<string, Borrador>,
  reducers: {
    actualizarBorrador(state, action: PayloadAction<{ funcionId: string; cambios: Partial<Borrador> }>) {
      const { funcionId, cambios } = action.payload;
      state[funcionId] = { ...(state[funcionId] ?? borradorVacio), ...cambios };
    },
  },
  extraReducers: builder => builder.addCase(registrarReserva, (state, { payload }) => {
    // Los asientos comprados ya están ocupados; conservamos los datos del cliente.
    state[payload.funcionId] = { cantidad: 1, asientos: [], nombre: payload.cliente.nombre, correo: payload.cliente.correo };
  }),
});
export const { actualizarBorrador } = slice.actions;
export default slice.reducer;
