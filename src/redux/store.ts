import AsyncStorage from '@react-native-async-storage/async-storage';
import { crearStorePersistente } from './persistence';
export const { store, persistor, estadoAlmacenamiento, observarAlmacenamiento, asegurarGuardado } = crearStorePersistente(AsyncStorage);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
