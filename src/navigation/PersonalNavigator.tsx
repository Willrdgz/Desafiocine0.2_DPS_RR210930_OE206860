import { useEffect, useRef, useState } from 'react';
import { AppState, Alert, Text, View, StyleSheet } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PersonalParamList } from './types';
import { Boton, Pagina, mensajeError } from '../components/UI';
import { colors, ui } from '../theme';
import DashboardScreen from '../screens/DashboardScreen';
import GestionPeliculasScreen from '../screens/GestionPeliculasScreen';
import FormularioPeliculaScreen from '../screens/FormularioPeliculaScreen';
import FuncionesScreen from '../screens/FuncionesScreen';
import EscanerScreen from '../screens/EscanerScreen';
import { SesionPersonal } from './SesionPersonal';
const Stack = createNativeStackNavigator<PersonalParamList>();
export default function PersonalNavigator() {
  const [autorizado, setAutorizado] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const vivo = useRef(true);
  const bloqueado = useRef(false);
  const sesionActiva = useRef(false);
  const selectorAbierto = useRef(false);
  const [cubrir, setCubrir] = useState(false);
  useEffect(() => {
    vivo.current = true;
    const listener = AppState.addEventListener('change', estado => {
      if (estado !== 'active') { sesionActiva.current = false; if (!selectorAbierto.current) setAutorizado(false); }
    });
    return () => { vivo.current = false; sesionActiva.current = false; listener.remove(); };
  }, []);
  async function conSelector<T>(tarea: () => Promise<T>): Promise<T> {
    if (!sesionActiva.current || selectorAbierto.current) throw new Error('La sesión no está disponible.');
    selectorAbierto.current = true;
    sesionActiva.current = false;
    setCubrir(true);
    try {
      const resultado = await tarea();
      if (!vivo.current || AppState.currentState !== 'active') throw new Error('Vuelve a entrar a la zona de personal.');
      const auth = await LocalAuthentication.authenticateAsync({ promptMessage: 'Continuar editando película', disableDeviceFallback: true, fallbackLabel: '', cancelLabel: 'Cancelar', biometricsSecurityLevel: 'strong' });
      if (!auth.success || !vivo.current || AppState.currentState !== 'active') throw new Error('Se requiere biometría para continuar.');
      sesionActiva.current = true;
      return resultado;
    } finally {
      selectorAbierto.current = false;
      if (vivo.current) { setCubrir(false); if (!sesionActiva.current) setAutorizado(false); }
    }
  }
  async function entrar() {
    if (bloqueado.current) return;
    bloqueado.current = true; setOcupado(true);
    try {
      if (!await LocalAuthentication.hasHardwareAsync()) throw new Error('Este dispositivo no tiene un sensor biométrico compatible.');
      if (!await LocalAuthentication.isEnrolledAsync()) throw new Error('Registra una huella en los ajustes de seguridad del teléfono.');
      const resultado = await LocalAuthentication.authenticateAsync({ promptMessage: 'Acceso del personal', cancelLabel: 'Cancelar', disableDeviceFallback: true, fallbackLabel: '', biometricsSecurityLevel: 'strong' });
      if (!vivo.current) return;
      if (resultado.success && AppState.currentState === 'active') { sesionActiva.current = true; setAutorizado(true); }
      else if (!resultado.success && !['user_cancel', 'system_cancel', 'app_cancel'].includes(resultado.error)) Alert.alert('Acceso denegado', 'No se pudo verificar la biometría. Intenta nuevamente.');
    } catch (error) { if (vivo.current) Alert.alert('Biometría', mensajeError(error)); }
    finally { bloqueado.current = false; if (vivo.current) setOcupado(false); }
  }
  if (!autorizado) return <Pagina><Text style={ui.eyebrow}>ACCESO RESTRINGIDO</Text><Text style={ui.title}>Zona de personal</Text><Text style={ui.body}>Verifica tu identidad con la biometría registrada en este dispositivo para administrar el cine.</Text><Boton titulo={ocupado ? 'Verificando…' : 'Entrar con biometría'} disabled={ocupado} onPress={entrar} /></Pagina>;
  // La sesión no se persiste. Al bloquearse, todas las pantallas administrativas se desmontan.
  return <SesionPersonal.Provider value={{
    salir: () => { sesionActiva.current = false; setAutorizado(false); },
    verificar: () => { if (!sesionActiva.current || !vivo.current || AppState.currentState !== 'active') throw new Error('La sesión se cerró. Vuelve a autenticarte.'); },
    conSelector,
  }}>
    <View style={{ flex: 1 }}>
    <View style={{ flex: 1 }} pointerEvents={cubrir ? 'none' : 'auto'} importantForAccessibility={cubrir ? 'no-hide-descendants' : 'auto'} accessibilityElementsHidden={cubrir}>
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: colors.surface }, headerTintColor: colors.text, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="Panel" component={DashboardScreen} options={{ title: 'Panel del cine' }} />
      <Stack.Screen name="Gestion" component={GestionPeliculasScreen} options={{ title: 'Gestión de películas' }} />
      <Stack.Screen name="Formulario" component={FormularioPeliculaScreen} options={{ title: 'Datos de película' }} />
      <Stack.Screen name="Funciones" component={FuncionesScreen} options={{ title: 'Programar funciones' }} />
      <Stack.Screen name="Escaner" component={EscanerScreen} options={{ title: 'Validar entradas' }} />
    </Stack.Navigator>
    </View>
    {cubrir && <View accessibilityViewIsModal style={[StyleSheet.absoluteFillObject, { backgroundColor: colors.background, justifyContent: 'center', padding: 24 }]}><Text style={ui.body}>Selecciona una imagen y verifica tu identidad para continuar.</Text></View>}
    </View>
  </SesionPersonal.Provider>;
}
