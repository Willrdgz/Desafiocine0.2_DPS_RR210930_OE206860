import { useRef, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import type Svg from 'react-native-svg';
import QRCode from 'react-native-qrcode-svg';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useAppSelector } from '../redux/hooks';
import { Boton, Pagina, Tarjeta, fechaTexto, dinero, mensajeError } from '../components/UI';
import { prepararCorreoBoleto } from '../services/correoBoleto';
import { ui } from '../theme';
export default function BoletoScreen({ route, navigation }: NativeStackScreenProps<RootStackParamList, 'Boleto'>) {
  const reserva = useAppSelector(s => s.reservas.find(r => r.id === route.params.reservaId));
  const svgRef = useRef<Svg | null>(null);
  const bloqueado = useRef(false);
  const [preparando, setPreparando] = useState(false);
  async function enviarCorreo() {
    if (!reserva || bloqueado.current) return;
    if (!svgRef.current) return Alert.alert('QR no disponible', 'Espera a que termine de cargar el boleto.');
    bloqueado.current = true; setPreparando(true);
    try { await prepararCorreoBoleto(reserva, svgRef.current); }
    catch (error) { Alert.alert('No se pudo abrir el correo', mensajeError(error)); }
    finally { bloqueado.current = false; setPreparando(false); }
  }
  if (!reserva) return <Pagina><Text style={ui.heading}>Boleto no encontrado.</Text></Pagina>;
  return <Pagina>
    <Text style={ui.eyebrow}>{reserva.utilizada ? 'BOLETO UTILIZADO' : 'COMPRA CONFIRMADA'}</Text>
    <Text style={ui.title}>{reserva.peliculaNombre}</Text>
    <Tarjeta>
      <Text style={ui.heading}>{reserva.salaNombre} · {reserva.asientos.join(', ')}</Text>
      <Text style={ui.body}>{fechaTexto(reserva.inicio)}</Text>
      <Text style={ui.body}>{reserva.cliente.nombre}</Text>
      <Text style={ui.heading}>Total: {dinero(reserva.totalCentavos)}</Text>
      <View style={{ alignSelf: 'center', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12 }}><QRCode value={'CINE:1:' + reserva.id} size={200} quietZone={16} getRef={(svg: Svg | null) => { svgRef.current = svg; }} /></View>
      <Text selectable style={[ui.body, { textAlign: 'center' }]}>{reserva.id}</Text>
      <Text style={ui.body}>{reserva.utilizada ? 'Validado el ' + fechaTexto(reserva.utilizadaEn!) : 'Este QR corresponde a todos los asientos de la reserva y permite una sola validación.'}</Text>
    </Tarjeta>
    <Text style={ui.body}>Destinatario: {reserva.cliente.correo}</Text>
    <Boton titulo={preparando ? 'Preparando correo…' : 'Enviar por correo'} disabled={preparando} onPress={enviarCorreo} />
    <Text style={ui.body}>Se abrirá tu aplicación de correo con el QR adjunto. Revisa el destinatario y pulsa Enviar allí.</Text>
    <Boton titulo="Ir a mis boletos" onPress={() => navigation.navigate('Inicio', { screen: 'Boletos' })} />
    <Boton titulo="Comprar otra entrada" secundario onPress={() => navigation.navigate('Reserva', { peliculaId: reserva.peliculaId, funcionId: reserva.funcionId })} />
  </Pagina>;
}
