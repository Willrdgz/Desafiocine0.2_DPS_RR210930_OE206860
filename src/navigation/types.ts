import { NavigatorScreenParams } from '@react-navigation/native';
export type RootStackParamList = {
  Inicio: NavigatorScreenParams<TabsParamList> | undefined;
  Detalle: { peliculaId: string };
  Reserva: { peliculaId: string };
  Asientos: { funcionId: string; cantidad: number };
  Boleto: { reservaId: string };
  Personal: undefined;
};
export type TabsParamList = { Cartelera: undefined; Boletos: undefined };
export type PersonalParamList = {
  Panel: undefined;
  Gestion: undefined;
  Formulario: { peliculaId?: string };
  Funciones: undefined;
  Escaner: undefined;
};
