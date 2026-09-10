import { Text } from 'react-native';
import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RootStackParamList, TabsParamList } from './types';
import PeliculasScreen from '../screens/PeliculasScreen';
import DetallePeliculaScreen from '../screens/DetallePeliculaScreen';
import HistorialScreen from '../screens/HistorialScreen';
import { colors } from '../theme';
import ReservaScreen from '../screens/ReservaScreen';
import MapaAsientosScreen from '../screens/MapaAsientosScreen';
import BoletoScreen from '../screens/BoletoScreen';
import PersonalNavigator from './PersonalNavigator';
const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabsParamList>();
const theme = { ...DarkTheme, colors: { ...DarkTheme.colors, primary: colors.accent, background: colors.background, card: colors.surface, text: colors.text, border: colors.border } };
function ClienteTabs() {
  return <Tab.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.accent, tabBarInactiveTintColor: colors.muted, tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border }, tabBarLabelStyle: { fontSize: 12, fontWeight: '700' } }}>
    <Tab.Screen name="Cartelera" component={PeliculasScreen} options={{ tabBarIcon: ({ color }) => <Text accessible={false} style={{ color, fontSize: 24 }}>▦</Text> }} />
    <Tab.Screen name="Boletos" component={HistorialScreen} options={{ title: 'Mis boletos', tabBarIcon: ({ color }) => <Text accessible={false} style={{ color, fontSize: 24 }}>▤</Text> }} />
  </Tab.Navigator>;
}
export default function AppNavigator() {
  return <NavigationContainer theme={theme}>
    <Stack.Navigator screenOptions={{ headerTintColor: colors.text, headerStyle: { backgroundColor: colors.background }, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="Inicio" component={ClienteTabs} options={{ headerShown: false }} />
      <Stack.Screen name="Detalle" component={DetallePeliculaScreen} options={{ title: 'Detalle de película' }} />
      <Stack.Screen name="Reserva" component={ReservaScreen} options={{ title: 'Seleccionar función' }} />
      <Stack.Screen name="Asientos" component={MapaAsientosScreen} options={{ title: 'Asientos y compra' }} />
      <Stack.Screen name="Boleto" component={BoletoScreen} options={{ title: 'Tu boleto' }} />
      <Stack.Screen name="Personal" component={PersonalNavigator} options={{ title: 'Acceso del personal' }} />
    </Stack.Navigator>
  </NavigationContainer>;
}
