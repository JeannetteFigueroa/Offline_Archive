# Documento de cobertura de testing — (Off)line Archive

## 1. Objetivo
Documentar el alcance de las pruebas unitarias del frontend. Las pruebas usan Jasmine como framework de aserciones, Karma como ejecutor en navegador y React Testing Library para renderizar componentes y simular acciones sobre el DOM.

## 2. Configuración
- Comando: `npm test`
- Archivo de configuración: `karma.conf.cjs`
- Frameworks configurados: `jasmine` y `webpack`.
- Navegador: `ChromeHeadless`; el archivo de configuración intenta localizar Chrome o Edge en Windows.
- Transformación: Babel para JavaScript/JSX.
- Reporte de cobertura: `coverage/html` y resumen de texto mediante `karma-coverage`.

## 3. Pruebas incluidas
| Archivo | Casos cubiertos | Cantidad |
|---|---|---:|
| `src/tests/auth.spec.js` | Dominios de correo permitidos y rechazo de dominio no autorizado | 2 |
| `src/tests/ProductCard.spec.jsx` | Renderizado de props, enlace al detalle y evento de agregar al carrito | 3 |
| `src/tests/Checkout.spec.jsx` | Carrito vacío, validación de formulario, creación de orden y navegación, pago rechazado conserva carrito | 4 |
| `src/tests/tienda.spec.js` | Crear producto, actualizar producto, eliminar producto y persistencia de órdenes | 4 |
| **Total definido** | | **13** |

## 4. Relación con los criterios docentes
- **Renderizado:** `ProductCard` muestra nombre, categoría y stock; `Checkout` presenta el estado de carrito vacío.
- **Props:** `ProductCard` utiliza `producto` y `agregarAlCarrito`.
- **Estado/eventos:** se simula clic en “Agregar”, cambios de campos y envío de formulario.
- **Validación:** el checkout muestra errores si faltan datos obligatorios.
- **Persistencia:** se comprueba la lectura/escritura de pedidos y las operaciones CRUD del módulo de datos.
- **Flujo de compra:** se valida el guardado de la orden y que un pago rechazado no vacíe el carrito.

## 5. Mocks y aislamiento
Se utiliza `jasmine.createSpy()` para simular callbacks como `agregarAlCarrito` y `vaciarCarrito`, sin ejecutar toda la lógica externa al componente. Las pruebas que escriben almacenamiento local lo limpian en `afterEach` para evitar que una ejecución afecte a la siguiente.

## 6. Ejecución y análisis
Desde la carpeta `react-app`:
```bash
npm install
npm test
```
Karma debe terminar indicando los specs aprobados/fallidos y el porcentaje de cobertura. El informe HTML se genera en `coverage/html` si la ejecución completa correctamente.

**Importante:** este documento registra la cobertura definida por los casos de prueba, no afirma un porcentaje de cobertura ni una ejecución exitosa. Antes de entregar, ejecutar `npm test`, revisar que los 13 casos pasen y adjuntar/capturar el resumen real generado por Karma. No se pudo verificar la ejecución en este entorno porque el ZIP no incluye `node_modules`.

## 7. Límites actuales
Las pruebas se centran en funciones y componentes seleccionados; no equivalen a pruebas end-to-end ni validan un backend. Se recomienda ampliar con pruebas para registro/login, actualización de stock después de comprar, historial filtrado por cuenta, administración de pedidos y responsividad visual.
