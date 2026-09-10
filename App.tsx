import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { useSyncExternalStore } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ActivityIndicator, Text, View } from 'react-native';
import { store, persistor, estadoAlmacenamiento, observarAlmacenamiento } from './src/redux/store';
import { colors, ui } from './src/theme';

export default function App() {
  const error = useSyncExternalStore(observarAlmacenamiento, estadoAlmacenamiento);
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      {error ? <View style={[ui.page, { justifyContent: 'center', padding: 32, gap: 20 }]}><Text style={ui.heading}>Almacenamiento no disponible</Text><Text style={ui.body}>{error}</Text></View> :
        <Provider store={store}><PersistGate persistor={persistor} loading={<View style={[ui.page, { justifyContent: 'center' }]}><ActivityIndicator color={colors.accent} /><Text style={[ui.body, { textAlign: 'center' }]}>Recuperando tus datos…</Text></View>}><AppNavigator /></PersistGate></Provider>}
    </SafeAreaProvider>
  );
}
