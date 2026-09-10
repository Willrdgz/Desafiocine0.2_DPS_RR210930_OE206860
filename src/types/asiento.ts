export type Asiento = string;
export interface Sala { id: string; nombre: string; asientos: Asiento[] }
export interface Funcion { id: string; peliculaId: string; salaId: string; inicio: string }

