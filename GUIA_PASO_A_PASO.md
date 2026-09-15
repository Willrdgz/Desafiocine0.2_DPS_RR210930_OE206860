# Cine local: guía paso a paso

El proyecto utiliza Expo SDK 54, React Native, TypeScript, React Navigation,
Redux Toolkit y AsyncStorage. Los carteles se dibujan localmente y el catálogo
inicial es ficticio; no se consulta ninguna API ni backend.

## 1. Abrir el proyecto

En CMD, desde la carpeta del repositorio:

```cmd
npx.cmd expo start --clear --go
```

Abre Expo Go compatible con SDK 54 en Android y escanea el QR nuevo.
Teléfono y computadora deben compartir red. El código está en esta carpeta,
no en otra copia del proyecto.

Las dependencias ya estaban instaladas. En una copia nueva, ejecuta primero
`npm.cmd ci`.

## 2. Entender los datos

- `src/types/pelicula.ts`: campos de una película.
- `src/types/asiento.ts`: salas, asientos y funciones.
- `src/types/reserva.ts`: compra, cliente y estado de utilización.
- `src/data/peliculas.ts`: catálogo inicial.
- `src/data/salas.ts`: tres salas de 20 asientos y funciones de ejemplo para
  los tres días siguientes a la primera apertura.

Los datos de ejemplo se cargan únicamente en la primera instalación.
Después se recupera lo guardado. Editar el catálogo inicial en el código no
reemplaza las películas ya persistidas: utiliza la zona de personal.
Si han pasado las fechas de ejemplo, programa nuevas funciones.

## 3. Entender Redux y la persistencia

El estado contiene `peliculas`, `reservas` y `salas`; este último incluye
las distribuciones y las funciones.

- `src/redux/slices/`: reducers de cada grupo de datos.
- `src/redux/operaciones.ts`: reglas de compra, CRUD, funciones,
  validación de QR y estadísticas.
- `src/redux/persistence.ts`: configuración de Redux y redux-persist.
- `src/redux/store.ts`: conecta AsyncStorage real del dispositivo.
- `src/redux/hooks.ts`: hooks tipados para las pantallas.
- `App.tsx`: Provider y PersistGate, para esperar los datos antes de navegar.

La compra verifica y registra todo en una operación síncrona. Los asientos
ocupados se obtienen de las reservas por función, para no tener dos fuentes
de datos que puedan contradecirse. Los precios se guardan en centavos.
El boleto conserva una copia del título, horario, sala y total originales.

La interfaz espera el guardado antes de mostrar confirmación de compra,
edición o validación. Si falla una lectura o escritura, se bloquea el uso
y se explica el problema. No se reemplazan datos corruptos por el catálogo
de ejemplo silenciosamente.

La autorización biométrica es temporal y no se guarda en AsyncStorage:
cerrar la aplicación o enviarla a segundo plano requiere autenticarse otra vez.
Los datos del cine sí se persisten.

## 4. Probar la compra

1. Abre Cartelera.
2. Busca por nombre, género, clasificación o sala. Prueba también las etiquetas
   de filtro y Limpiar búsqueda y filtros.
3. Abre una película disponible.
4. Pulsa Elegir función y comprar.
5. Elige una función futura y la cantidad de entradas.
6. Pulsa Elegir asientos.
7. Selecciona exactamente esa cantidad en el mapa.
8. Completa nombre y correo y confirma la compra.
9. Revisa el boleto y su QR.
10. Ve a Mis boletos y vuelve a abrirlo.

Durante la selección, puedes usar la flecha Atrás o **Volver y agregar más
entradas**: los asientos, nombre y correo se conservan por función. Aumenta
la cantidad y vuelve al mapa para completar la selección. Para reducirla,
quita primero los asientos que ya no quieras.

Al completar una compra aparece una confirmación con la película y los
asientos. **Comprar otra entrada** conserva los datos del cliente, pero
empieza con asientos nuevos: los de la compra anterior ya están ocupados.
Al agregar o editar una película también aparece una alerta con su nombre.

Es una venta simulada local: no hay pasarela ni cobro bancario.
La selección aún sin confirmar no ocupa asientos.
Una reserva puede contener varios asientos; su QR valida al grupo completo
una sola vez. Si necesitas entradas que se validen por separado, registra
compras separadas.

## 5. Probar la persistencia y las validaciones

1. Compra A1 y A2 de una función.
2. Intenta comprarlos de nuevo: deben aparecer ocupados.
3. Abre otra función: A1 y A2 deben seguir disponibles allí.
4. Cierra completamente Expo Go, vuelve a abrir el mismo proyecto y revisa
   Mis boletos y la ocupación.
5. Prueba correo incorrecto y nombre vacío: no deben registrarse compras.

No desinstales Expo Go ni borres sus datos para esta prueba: esas acciones
eliminan el almacenamiento local.

## 6. Entrar a la zona de personal

1. Registra una huella en los ajustes de seguridad del teléfono.
2. Baja hasta el final de Cartelera. Debajo de la última película hay una barra
   gris: desliza el dedo sobre ella o mantenla pulsada un segundo para mostrar
   **Acceso del personal**. Pulsa ese botón. Se oculta al alejarte del final
   o volver a entrar a Cartelera.
3. Pulsa Entrar con biometría y autentícate.
4. Deben aparecer estadísticas y accesos a películas, funciones y escáner.
5. Cierra sesión o manda la aplicación a segundo plano y vuelve:
   las pantallas administrativas deben quedar ocultas y pedir biometría.

No se permite entrar con PIN como sustituto ni se concede acceso si falta
hardware o biometría registrada. La identidad utilizada es la biometría del
dispositivo: esta versión académica local no administra cuentas de empleados.

## 7. Gestionar películas y funciones

Desde Gestionar películas:

Puedes añadir pósteres tanto a películas nuevas como a las existentes:

- Entra a Agregar película o Editar y pulsa Seleccionar imagen de la galería.
- Selecciona y recorta una imagen. Al volver, confirma la huella para continuar
  con el mismo formulario.
- Revisa la vista previa y pulsa Guardar película.
- Cambiar imagen permite reemplazarla; Quitar imagen restaura el cartel de texto
  cuando guardes. Cancelar el selector conserva la imagen anterior.
- El póster aparece en la cartelera y en el detalle. Se copia al almacenamiento
  privado del dispositivo; Redux guarda su nombre y AsyncStorage lo conserva.
- Comprueba que siga visible al cerrar y abrir Expo Go. Las películas existentes
  sin imagen siguen funcionando y no se borra ninguna compra.

1. Agrega una película con código único, nombre, género, duración, clasificación,
   sala y precio.
2. Edítala y cambia su disponibilidad.
3. Filtra por estado, género, clasificación o sala.
4. Prueba código duplicado, nombre vacío o precio negativo: se muestra un error.
5. Elimina una película sin ventas y confirma.
6. Si tiene ventas, la eliminación se rechaza para conservar el historial;
   puede marcarse no disponible.

Desde Programar funciones:

1. Selecciona película y sala.
2. Pulsa Seleccionar fecha en el calendario y elige el día.
3. Pulsa Seleccionar hora y elige la hora y AM o PM en el reloj.
4. Guarda: aparece una confirmación con película, sala, día y hora. El formulario
   limpia película, sala, fecha y hora solo después de guardar correctamente.
   Comprueba que aparezca en el recorrido de compra. Si hay un conflicto de
   horario, conserva los datos para corregirlos.
5. Intenta duplicar el horario o cruzarlo con otra película en la misma sala.
6. Prueba eliminar una función: solo se permite sin ventas.

La sala del formulario de película es la asignación predeterminada.
La sala elegida al programar una función es la que determina su mapa.
Cambiar la duración de una película tampoco puede crear cruces de horarios.

## 8. Validar un QR con la cámara

Todo reside en un solo dispositivo; dos instalaciones no comparten ventas.

1. Abre un boleto comprado y pulsa **Enviar por correo**. Debes tener una
   aplicación de correo configurada en el teléfono.
2. Se abrirá un borrador con el correo del cliente, el detalle de la reserva y
   el QR adjunto como PNG. Revisa los datos y pulsa Enviar en esa aplicación.
   Abre el correo recibido y muestra la imagen en otra pantalla, por ejemplo
   la computadora. También puedes usar una captura del QR si no hay internet.
3. En el teléfono donde compraste, entra a la zona de personal.
4. Pulsa Escanear boleto y concede permiso de cámara.
5. Apunta hacia el QR mostrado en la otra pantalla.
6. Comprueba el mensaje de entrada validada y los asientos.
7. Pulsa Escanear otro boleto y presenta el mismo QR: debe rechazarse por usado.
8. Reinicia la app y repite: debe seguir rechazándolo.
9. Prueba un QR ajeno: debe mostrar un error, sin modificar compras.

El escáner usa CameraView y solo procesa un resultado por intento.
La cámara se desmonta al salir del escáner o cerrar la sesión.
El QR incluye un identificador aleatorio, no los datos personales del cliente.

El correo se prepara con `expo-mail-composer`; el QR se genera en el teléfono
y se adjunta desde la caché con `expo-file-system`. El envío requiere internet
y una cuenta de correo. No es un envío automático desde un servidor ni se
guarda una marca de "correo enviado": Android no confirma si el usuario envió
o canceló el borrador. La integración de correo es una función adicional que
debe consultarse con el docente por la restricción de servicios externos.

## 9. Consultar estadísticas

El panel calcula total de películas y funciones, entradas vendidas,
asientos disponibles y ocupados, ingresos y película con más entradas.
Los totales incluyen todas las funciones registradas, incluso las pasadas.
Usar un boleto no libera el asiento ni elimina los ingresos.

## 10. Ejecutar comprobaciones

```cmd
npm.cmd run typecheck
npm.cmd test
npx.cmd expo export --platform android --output-dir .expo/preview-export
```

Las pruebas automáticas utilizan un adaptador de almacenamiento en memoria
con la misma configuración de persistencia que la aplicación. Cubren reglas,
recuperación y fallos de almacenamiento; no sustituyen las pruebas físicas
de huella, cámara, permisos, teclado, navegación y distribución en pantalla.

El QR de arranque de Expo sirve para abrir el proyecto. El QR de Mis boletos
sirve para validar una reserva: son dos códigos con funciones distintas.
