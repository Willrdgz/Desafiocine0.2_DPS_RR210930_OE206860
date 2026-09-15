import { createContext, useContext } from 'react';
export const SesionPersonal = createContext<{ salir: () => void; verificar: () => void; conSelector: <T>(tarea: () => Promise<T>) => Promise<T> }>({ salir: () => {}, verificar: () => { throw new Error('Se requiere autenticación biométrica.'); }, conSelector: async () => { throw new Error('Se requiere autenticación biométrica.'); } });
export const useSesionPersonal = () => useContext(SesionPersonal);
