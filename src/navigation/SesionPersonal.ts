import { createContext, useContext } from 'react';
export const SesionPersonal = createContext<{ salir: () => void; verificar: () => void }>({ salir: () => {}, verificar: () => { throw new Error('Se requiere autenticación biométrica.'); } });
export const useSesionPersonal = () => useContext(SesionPersonal);
