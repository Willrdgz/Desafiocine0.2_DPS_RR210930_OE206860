import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { salasIniciales, crearFuncionesIniciales } from '../../data/salas';
import { Funcion } from '../../types/asiento';
import { eliminarPelicula } from './peliculasSlice';
const slice = createSlice({
  name: 'salas', initialState: () => ({ salas: salasIniciales, funciones: crearFuncionesIniciales() }),
  reducers: {
    agregarFuncion(state, action: PayloadAction<Funcion>) { state.funciones.push(action.payload); },
    eliminarFuncion(state, action: PayloadAction<string>) { state.funciones = state.funciones.filter(f => f.id !== action.payload); },
  },
  extraReducers: builder => builder.addCase(eliminarPelicula, (state, action) => {
    state.funciones = state.funciones.filter(f => f.peliculaId !== action.payload);
  }),
});
export const { agregarFuncion, eliminarFuncion } = slice.actions;
export default slice.reducer;

