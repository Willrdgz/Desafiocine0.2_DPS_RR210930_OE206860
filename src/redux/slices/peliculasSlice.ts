import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { peliculas } from '../../data/peliculas';
import { Pelicula } from '../../types/pelicula';
const slice = createSlice({
  name: 'peliculas', initialState: peliculas,
  reducers: {
    guardarPelicula(state, action: PayloadAction<Pelicula>) {
      const index = state.findIndex(p => p.codigo === action.payload.codigo);
      if (index === -1) state.push(action.payload);
      else state[index] = action.payload;
    },
    eliminarPelicula(state, action: PayloadAction<string>) { return state.filter(p => p.codigo !== action.payload); },
  },
});
export const { guardarPelicula, eliminarPelicula } = slice.actions;
export default slice.reducer;

