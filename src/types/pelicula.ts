export interface Pelicula {
  codigo: string;
  nombre: string;
  genero: string;
  duracion: number;
  clasificacion: string;
  salaId: string;
  precio: number;
  disponible: boolean;
  sinopsis: string;
  color: string;
  imagen?: string;
}
