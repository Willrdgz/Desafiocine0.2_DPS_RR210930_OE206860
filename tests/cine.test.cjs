// Ejecutar con node --test tests/cine.test.cjs. No requiere emulador.
const fs = require('node:fs');
const ts = require('typescript');
const assert = require('node:assert/strict');
const { test } = require('node:test');
require.extensions['.ts'] = function(mod, filename) {
  const source = fs.readFileSync(filename, 'utf8');
  const result = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } });
  mod._compile(result.outputText, filename);
};
const { configureStore } = require('@reduxjs/toolkit');
const { cineReducer } = require('../src/redux/reducer.ts');
const { comprar, ocupados, guardar, borrarPelicula, crearFuncion, borrarFuncion, validarBoleto, estadisticas } = require('../src/redux/operaciones.ts');
const { crearStorePersistente, datosValidos } = require('../src/redux/persistence.ts');
const nuevo = () => configureStore({ reducer: cineReducer });
const entrada = (store, cambios = {}) => ({ funcionId: store.getState().salas.funciones[0].id, asientos: ['A1'], nombre: 'Ana Pérez', correo: 'ana@example.com', ...cambios });
const fechaFutura = dias => { const d = new Date(); d.setDate(d.getDate() + dias); d.setHours(15,0,0,0); return d.toISOString(); };
function memoria(initial = null) {
  let value = initial;
  return { getItem: async () => value, setItem: async (_, next) => { value = next; }, removeItem: async () => { value = null; }, leer: () => value };
}
async function listo(p) {
  if (p.persistor.getState().bootstrapped) return;
  await new Promise(resolve => { const unsub = p.persistor.subscribe(() => { if (p.persistor.getState().bootstrapped) { unsub(); resolve(); } }); });
}
test('compra atómica: bloquea duplicados y permite el mismo asiento en otra función', () => {
  const s = nuevo();
  const id = s.dispatch(comprar(entrada(s, { asientos: ['A1', 'A2'] })));
  assert.equal(s.getState().reservas[0].id, id);
  assert.equal(s.getState().reservas[0].totalCentavos, 1100);
  assert.throws(() => s.dispatch(comprar(entrada(s))), /ocupado/);
  assert.equal(s.getState().reservas.length, 1);
  s.dispatch(comprar(entrada(s, { funcionId: s.getState().salas.funciones[1].id })));
  assert.equal(s.getState().reservas.length, 2);
  assert.deepEqual(ocupados(s.getState(), s.getState().salas.funciones[0].id), ['A1', 'A2']);
});
test('rechaza selección vacía, repetida, inexistente y datos inválidos', () => {
  const s = nuevo();
  for (const asientos of [[], ['A1', 'A1'], ['Z99']]) assert.throws(() => s.dispatch(comprar(entrada(s, { asientos }))), /asientos/);
  assert.throws(() => s.dispatch(comprar(entrada(s, { correo: 'incorrecto' }))), /correo/);
  assert.throws(() => s.dispatch(comprar(entrada(s, { nombre: ' ' }))), /nombre/);
  assert.equal(s.getState().reservas.length, 0);
});
test('la compra vuelve a verificar disponibilidad y horario', () => {
  const s = nuevo();
  const p = s.getState().peliculas[0];
  s.dispatch(guardar({ ...p, disponible: false }, true));
  assert.throws(() => s.dispatch(comprar(entrada(s))), /disponible/);
  const seed = JSON.parse(JSON.stringify(cineReducer(undefined, { type: 'init' })));
  seed.salas.funciones[0].inicio = '2020-01-01T00:00:00.000Z';
  const viejo = configureStore({ reducer: cineReducer, preloadedState: seed });
  assert.throws(() => viejo.dispatch(comprar(entrada(viejo))), /comenzó/);
});
test('CRUD rechaza códigos duplicados, nombres vacíos y precios negativos', () => {
  const s = nuevo(); const p = s.getState().peliculas[0];
  assert.throws(() => s.dispatch(guardar({ ...p, codigo: 'p001' }, false)), /código/);
  assert.throws(() => s.dispatch(guardar({ ...p, nombre: ' ' }, true)), /obligatorios/);
  assert.throws(() => s.dispatch(guardar({ ...p, precio: -1 }, true)), /precio/);
  assert.throws(() => s.dispatch(guardar({ ...p, precio: NaN }, true)), /precio/);
  assert.throws(() => s.dispatch(guardar({ ...p, duracion: 1.5 }, true)), /duración/);
  s.dispatch(guardar({ ...p, codigo: 'NUEVA', nombre: 'Nueva película', precio: 0 }, false));
  assert.equal(s.getState().peliculas.length, 5);
  s.dispatch(borrarPelicula('NUEVA'));
  assert.equal(s.getState().peliculas.length, 4);
});
test('funciones rechazan horarios repetidos, cruzados y duración editada que produce cruces', () => {
  const s = nuevo();
  const f = s.getState().salas.funciones[0];
  assert.throws(() => s.dispatch(crearFuncion(f)), /horario/);
  assert.throws(() => s.dispatch(crearFuncion({ ...f, inicio: new Date(Date.parse(f.inicio) + 60000).toISOString() })), /horario/);
  s.dispatch(crearFuncion({ ...f, salaId: 'Sala 2', inicio: fechaFutura(10) }));
  s.dispatch(crearFuncion({ ...f, inicio: fechaFutura(10) }));
  const fin = new Date(Date.parse(fechaFutura(10)) + 128 * 60000).toISOString();
  s.dispatch(crearFuncion({ ...f, peliculaId: 'P002', inicio: fin }));
  assert.throws(() => s.dispatch(guardar({ ...s.getState().peliculas[0], duracion: 130 }, true)), /duración/);
});
test('ventas conservan datos históricos y bloquean borrado de películas y funciones', () => {
  const s = nuevo(); s.dispatch(comprar(entrada(s)));
  const p = s.getState().peliculas[0];
  s.dispatch(guardar({ ...p, nombre: 'Título editado', precio: 12 }, true));
  assert.equal(s.getState().reservas[0].peliculaNombre, p.nombre);
  assert.equal(s.getState().reservas[0].totalCentavos, 550);
  assert.throws(() => s.dispatch(borrarPelicula(p.codigo)), /ventas/);
  assert.throws(() => s.dispatch(borrarFuncion(s.getState().reservas[0].funcionId)), /vendidas/);
  s.dispatch(borrarPelicula('P003'));
  assert.equal(s.getState().salas.funciones.filter(f => f.peliculaId === 'P003').length, 0);
});
test('QR se valida una sola vez y rechaza entradas externas o desconocidas', () => {
  const s = nuevo(); const id = s.dispatch(comprar(entrada(s)));
  assert.throws(() => s.dispatch(validarBoleto('https://example.com')), /QR/);
  assert.throws(() => s.dispatch(validarBoleto('CINE:1:no-existe')), /no encontrada/);
  s.dispatch(validarBoleto('CINE:1:' + id));
  assert.equal(s.getState().reservas[0].utilizada, true);
  assert.throws(() => s.dispatch(validarBoleto('CINE:1:' + id)), /utilizado/);
  assert.equal(ocupados(s.getState(), entrada(s).funcionId).length, 1);
});
test('estadísticas cuentan asientos vendidos e ingresos en centavos', () => {
  const s = nuevo(); s.dispatch(comprar(entrada(s, { asientos: ['A1', 'A2'] })));
  const e = estadisticas(s.getState());
  assert.equal(e.vendidos, 2); assert.equal(e.ocupados, 2);
  assert.equal(e.disponibles, 178); assert.equal(e.ingresos, 1100);
  assert.equal(e.popular, 'Más allá de Orión');
});
test('persistencia recupera catálogo, funciones, reservas y QR utilizados tras reiniciar', async () => {
  const adapter = memoria();
  const a = crearStorePersistente(adapter); await listo(a);
  const id = a.store.dispatch(comprar(entrada(a.store)));
  a.store.dispatch(validarBoleto('CINE:1:' + id));
  a.store.dispatch(guardar({ ...a.store.getState().peliculas[0], nombre: 'Persistida' }, true));
  a.store.dispatch(crearFuncion({ peliculaId: 'P001', salaId: 'Sala 1', inicio: fechaFutura(15) }));
  await a.asegurarGuardado(); a.persistor.pause();
  const b = crearStorePersistente(adapter); await listo(b);
  assert.equal(b.store.getState().peliculas[0].nombre, 'Persistida');
  assert.equal(b.store.getState().salas.funciones.length, 10);
  assert.equal(b.store.getState().reservas[0].utilizada, true);
  assert.equal(b.store.getState().reservas[0].id, id);
  assert.throws(() => b.store.dispatch(comprar(entrada(b.store))), /ocupado/);
  assert.throws(() => b.store.dispatch(validarBoleto('CINE:1:' + id)), /utilizado/);
  assert.ok(datosValidos(b.store.getState()));
  await b.asegurarGuardado(); b.persistor.pause();
});
test('almacenamiento dañado se bloquea sin sobrescribir el original', async t => {
  t.mock.method(console, 'error', () => {}); // Redux Persist registra el fallo que esta prueba provoca.
  const adapter = memoria('contenido corrupto');
  const a = crearStorePersistente(adapter); await listo(a);
  assert.match(a.estadoAlmacenamiento(), /recuperar/);
  await assert.rejects(a.asegurarGuardado(), /recuperar/);
  assert.equal(adapter.leer(), 'contenido corrupto');
  a.persistor.pause();
});
test('fallo de escritura se informa antes de confirmar persistencia', async t => {
  t.mock.method(console, 'error', () => {});
  const a = crearStorePersistente({ getItem: async () => null, setItem: async () => { throw new Error('disco lleno'); }, removeItem: async () => {} });
  await listo(a);
  a.store.dispatch(comprar(entrada(a.store)));
  await assert.rejects(a.asegurarGuardado(), /guardar/);
  a.persistor.pause();
});
