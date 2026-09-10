import { combineReducers } from '@reduxjs/toolkit';
import peliculas from './slices/peliculasSlice';
import reservas from './slices/reservasSlice';
import salas from './slices/salasSlice';
export const cineReducer = combineReducers({ peliculas, reservas, salas });
export type CineState = ReturnType<typeof cineReducer>;

