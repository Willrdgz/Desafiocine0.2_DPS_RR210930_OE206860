export interface Reserva {
  id: string;
  funcionId: string;
  peliculaId: string;
  peliculaNombre: string;
  salaNombre: string;
  inicio: string;
  asientos: string[];
  cliente: { nombre: string; correo: string };
  totalCentavos: number;
  creada: string;
  utilizada: boolean;
  utilizadaEn?: string;
}

