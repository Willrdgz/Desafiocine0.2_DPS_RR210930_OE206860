import { useRef, useState } from 'react';
import { Linking, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useIsFocused } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { validarBoleto } from '../redux/operaciones';
import { asegurarGuardado } from '../redux/store';
import { Boton, Pagina, Tarjeta, mensajeError } from '../components/UI';
import { ui } from '../theme';
import { useSesionPersonal } from '../navigation/SesionPersonal';
export default function EscanerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const focused = useIsFocused();
  const dispatch = useAppDispatch();
  const { verificar } = useSesionPersonal();
  const reservas = useAppSelector(s => s.reservas);
  const bloqueo = useRef(false);
  const [resultado, setResultado] = useState('');
  const [id, setId] = useState('');
  const [procesando, setProcesando] = useState(false);
  async function escanear(data: string) {
    if (bloqueo.current || !focused) return;
    bloqueo.current = true; setProcesando(true);
    try {
      verificar();
      const reservaId = dispatch(validarBoleto(data));
      await asegurarGuardado();
      setId(reservaId); setResultado('Entrada validada y marcada como utilizada.');
    } catch (error) { setId(''); setResultado(mensajeError(error)); }
    finally { setProcesando(false); }
  }
  const reserva = reservas.find(r => r.id === id);
  return <Pagina><Text style={ui.title}>Escanear boleto</Text><Text style={ui.body}>Solo se validan reservas guardadas en este dispositivo. Una validación utiliza todos los asientos del QR.</Text>
    {!permission ? <Text style={ui.body}>Consultando permiso de cámara…</Text> : !permission.granted ?
      <><Text style={ui.body}>Necesitamos permiso para usar la cámara.</Text><Boton titulo={permission.canAskAgain ? 'Permitir cámara' : 'Abrir ajustes'} onPress={() => { (permission.canAskAgain ? requestPermission() : Linking.openSettings()).catch(error => setResultado(mensajeError(error))); }} /></> :
      focused && !resultado && <View style={{ height: 300, borderRadius: 18, overflow: 'hidden' }}><CameraView style={{ flex: 1 }} facing="back" barcodeScannerSettings={{ barcodeTypes: ['qr'] }} onBarcodeScanned={procesando ? undefined : ({ data }) => escanear(data)} onMountError={() => setResultado('No se pudo iniciar la cámara. Revisa que no esté en uso en otra aplicación.')} /></View>}
    {procesando && <Text style={ui.body}>Guardando validación…</Text>}
    {!!resultado && <Tarjeta><Text style={ui.heading}>{id ? 'Boleto válido' : 'No validado'}</Text><Text style={ui.body}>{resultado}</Text>{reserva && <Text style={ui.body}>{reserva.peliculaNombre}{'\n'}{reserva.salaNombre} · {reserva.asientos.join(', ')}{'\n'}{reserva.cliente.nombre}</Text>}<Boton titulo="Escanear otro boleto" onPress={() => { setResultado(''); setId(''); bloqueo.current = false; }} /></Tarjeta>}
  </Pagina>;
}
