import * as MailComposer from 'expo-mail-composer';
import * as FileSystem from 'expo-file-system/legacy';
import type Svg from 'react-native-svg';
import { Reserva } from '../types/reserva';

function imagenQR(svg: Svg): Promise<string> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('No se pudo generar el QR. Vuelve a abrir el boleto e intenta nuevamente.')), 10000);
    try {
      svg.toDataURL(base64 => {
        clearTimeout(timeout);
        if (!base64) reject(new Error('La imagen del QR está vacía.'));
        else resolve(base64);
      }, { width: 600, height: 600 });
    } catch (error) { clearTimeout(timeout); reject(error); }
  });
}

export async function prepararCorreoBoleto(reserva: Reserva, svg: Svg) {
  if (!await MailComposer.isAvailableAsync()) throw new Error('Configura una cuenta en una aplicación de correo del teléfono y vuelve a intentarlo.');
  if (!FileSystem.cacheDirectory) throw new Error('No hay una carpeta temporal disponible para adjuntar el QR.');
  const base64 = await imagenQR(svg);
  const nombreSeguro = reserva.id.replace(/[^a-zA-Z0-9_-]/g, '_');
  const uri = FileSystem.cacheDirectory + 'boleto-' + nombreSeguro + '.png';
  await FileSystem.writeAsStringAsync(uri, base64, { encoding: FileSystem.EncodingType.Base64 });
  const fecha = new Date(reserva.inicio).toLocaleString('es-SV', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  await MailComposer.composeAsync({
    recipients: [reserva.cliente.correo],
    subject: 'Tu boleto de cine: ' + reserva.peliculaNombre,
    body: [
      'Hola, ' + reserva.cliente.nombre + '.',
      '',
      'Estos son los datos de tu reserva:',
      'Película: ' + reserva.peliculaNombre,
      'Función: ' + fecha,
      'Sala: ' + reserva.salaNombre,
      'Asientos: ' + reserva.asientos.join(', '),
      'Total: $' + (reserva.totalCentavos / 100).toFixed(2),
      'Código: ' + reserva.id,
      '',
      'Adjuntamos tu QR. Muéstralo en la entrada para validar todos los asientos de esta reserva una sola vez.',
      reserva.utilizada ? 'Este boleto ya fue utilizado.' : 'Conserva este correo hasta tu función.',
    ].join('\n'),
    attachments: [uri],
    isHtml: false,
  });
  // Android no confirma el envío real. No se marca el correo como enviado.
  // Conservamos el PNG en caché porque el cliente puede leerlo después de retornar.
}
