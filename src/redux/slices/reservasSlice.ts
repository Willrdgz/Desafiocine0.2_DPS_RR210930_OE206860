import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Reserva } from '../../types/reserva';
const slice = createSlice({
  name: 'reservas', initialState: [] as Reserva[],
  reducers: {
    registrarReserva(state, action: PayloadAction<Reserva>) { state.push(action.payload); },
    utilizarReserva(state, action: PayloadAction<{ id: string; fecha: string }>) {
      const reserva = state.find(r => r.id === action.payload.id);
      if (reserva && !reserva.utilizada) { reserva.utilizada = true; reserva.utilizadaEn = action.payload.fecha; }
    },
  },
});
export const { registrarReserva, utilizarReserva } = slice.actions;
export default slice.reducer;

