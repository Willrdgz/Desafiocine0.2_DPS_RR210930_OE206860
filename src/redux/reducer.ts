import { combineReducers } from '@reduxjs/toolkit';
import peliculas from './slices/peliculasSlice';
import reservas from './slices/reservasSlice';
import salas from './slices/salasSlice';
import borradores from './slices/borradoresSlice';
export const cineReducer = combineReducers({ peliculas, reservas, salas, borradores });
export type CineState = ReturnType<typeof cineReducer>;
