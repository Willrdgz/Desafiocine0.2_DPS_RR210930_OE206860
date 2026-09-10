import { Pelicula } from '../types/pelicula';
// Catálogo inicial local. Redux y AsyncStorage conservan los cambios del personal.
export const peliculas: Pelicula[] = [
  { codigo: 'P001', nombre: 'Más allá de Orión', genero: 'Ciencia ficción', duracion: 128, clasificacion: '12+', salaId: 'Sala 1', precio: 5.5, disponible: true, color: '#283C66', sinopsis: 'Una joven astronauta recibe una señal desde una estación abandonada. Su viaje para descubrir el origen cambiará lo que sabe de su hogar.' },
  { codigo: 'P002', nombre: 'Un verano inesperado', genero: 'Comedia', duracion: 102, clasificacion: 'Todo público', salaId: 'Sala 2', precio: 4.5, disponible: true, color: '#694334', sinopsis: 'Tres amigos vuelven a su pueblo para salvar un pequeño cine y terminan organizando el festival más improvisado del verano.' },
  { codigo: 'P003', nombre: 'El último bosque', genero: 'Animación', duracion: 94, clasificacion: 'Todo público', salaId: 'Sala 3', precio: 4, disponible: true, color: '#285248', sinopsis: 'Una pequeña exploradora y un zorro emprenden una aventura para devolver los colores a su bosque antes de que llegue el invierno.' },
  { codigo: 'P004', nombre: 'La señal', genero: 'Suspenso', duracion: 116, clasificacion: '16+', salaId: 'Sala 1', precio: 5, disponible: false, color: '#503D5B', sinopsis: 'Una locutora recibe una llamada que anuncia un suceso imposible. Cada nueva pista la acerca a un secreto de su propia ciudad.' },
];
