import { Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PersonalParamList } from '../navigation/types';
import { useSesionPersonal } from '../navigation/SesionPersonal';
import { useAppSelector } from '../redux/hooks';
import { estadisticas } from '../redux/operaciones';
import { Boton, Pagina, Tarjeta, dinero } from '../components/UI';
import { ui } from '../theme';
export default function DashboardScreen({ navigation }: NativeStackScreenProps<PersonalParamList, 'Panel'>) {
  const state = useAppSelector(s => s);
  const datos = estadisticas(state);
  const { salir } = useSesionPersonal();
  return <Pagina><Text style={ui.eyebrow}>ZONA DE PERSONAL</Text><Text style={ui.title}>Resumen del cine</Text>
    <Text style={ui.body}>Totales de todas las funciones registradas, incluidas las pasadas.</Text>
    <Tarjeta>{[
      ['Películas', datos.peliculas], ['Funciones', datos.funciones], ['Boletos vendidos', datos.vendidos],
      ['Asientos disponibles', datos.disponibles], ['Asientos ocupados', datos.ocupados], ['Ingresos', dinero(datos.ingresos)],
    ].map(([label, value]) => <Text key={label} style={ui.heading}>{label}: {value}</Text>)}</Tarjeta>
    <Tarjeta><Text style={ui.body}>Película con más entradas vendidas</Text><Text style={ui.heading}>{datos.popular}</Text></Tarjeta>
    <Boton titulo="Gestionar películas" onPress={() => navigation.navigate('Gestion')} />
    <Boton titulo="Programar funciones" onPress={() => navigation.navigate('Funciones')} />
    <Boton titulo="Escanear boleto" onPress={() => navigation.navigate('Escaner')} />
    <Boton titulo="Cerrar sesión de personal" secundario onPress={salir} />
  </Pagina>;
}
