import * as FileSystem from 'expo-file-system/legacy';
import { nanoid } from '@reduxjs/toolkit';

// Solo se persiste el nombre relativo: el directorio de la app puede cambiar.
export function uriImagen(nombre: string) {
  return FileSystem.documentDirectory + 'carteles/' + nombre;
}
export async function guardarImagen(uri: string): Promise<string> {
  if (!FileSystem.documentDirectory) throw new Error('No se puede acceder al almacenamiento del dispositivo.');
  const carpeta = FileSystem.documentDirectory + 'carteles/';
  await FileSystem.makeDirectoryAsync(carpeta, { intermediates: true });
  const extension = uri.split('?')[0].match(/\.(jpg|jpeg|png|webp|heic|avif)$/i)?.[1] ?? 'jpg';
  const nombre = nanoid(20) + '.' + extension;
  await FileSystem.copyAsync({ from: uri, to: uriImagen(nombre) });
  return nombre;
}
