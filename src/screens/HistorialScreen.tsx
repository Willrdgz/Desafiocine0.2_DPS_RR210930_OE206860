import { FlatList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { RootStackParamList, TabsParamList } from '../navigation/types';
import { useAppSelector } from '../redux/hooks';
import { Boton, Tarjeta, fechaTexto, dinero } from '../components/UI';
import { ui } from '../theme';
type Props = CompositeScreenProps<BottomTabScreenProps<TabsParamList, 'Boletos'>, NativeStackScreenProps<RootStackParamList>>;
export default function HistorialScreen({ navigation }: Props) {
  const reservas = useAppSelector(s => s.reservas);
  return <SafeAreaView style={ui.page} edges={['top', 'left', 'right']}>
    <FlatList data={[...reservas].reverse()} keyExtractor={r => r.id} contentContainerStyle={ui.content}
      ListHeaderComponent={<View style={{ gap: 12 }}><Text style={ui.eyebrow}>TUS EXPERIENCIAS</Text><Text style={ui.title}>Mis boletos</Text><Text style={ui.body}>Compras guardadas en este dispositivo.</Text></View>}
      renderItem={({ item }) => <Tarjeta><Text style={ui.eyebrow}>{item.utilizada ? 'UTILIZADO' : 'SIN UTILIZAR'}</Text><Text style={ui.heading}>{item.peliculaNombre}</Text><Text style={ui.body}>{fechaTexto(item.inicio)}{'\n'}{item.salaNombre} · {item.asientos.join(', ')}</Text><Text style={ui.heading}>{dinero(item.totalCentavos)}</Text><Boton titulo="Ver boleto y QR" onPress={() => navigation.navigate('Boleto', { reservaId: item.id })} /></Tarjeta>}
      ListEmptyComponent={<View style={{ gap: 20, paddingVertical: 40 }}><Text style={ui.heading}>Tu próxima historia te espera</Text><Text style={ui.body}>Todavía no tienes boletos. Elige una película para realizar tu primera compra.</Text><Boton titulo="Explorar cartelera" onPress={() => navigation.navigate('Cartelera')} /></View>}
    />
  </SafeAreaView>;
}
