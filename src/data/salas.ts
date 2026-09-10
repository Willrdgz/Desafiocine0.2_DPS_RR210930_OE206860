import { Sala, Funcion } from '../types/asiento';
export const salasIniciales: Sala[] = [1, 2, 3].map(numero => ({
  id: 'Sala ' + numero, nombre: 'Sala ' + numero,
  asientos: ['A', 'B', 'C', 'D'].flatMap(fila => [1, 2, 3, 4, 5].map(col => fila + col)),
}));
// Se generan una sola vez al iniciar la instalación; después se recuperan del dispositivo.
export function crearFuncionesIniciales(): Funcion[] {
  return [1, 2, 3].flatMap(numero => [1, 2, 3].map(dia => {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + dia);
    fecha.setHours(18, 0, 0, 0);
    return { id: 'F-' + numero + '-' + dia, peliculaId: 'P00' + numero, salaId: 'Sala ' + numero, inicio: fecha.toISOString() };
  }));
}

