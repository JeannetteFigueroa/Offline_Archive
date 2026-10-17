# ERS V2 — (Off)line Archive

**Asignatura:** DSY1104 — Desarrollo Fullstack II  
**Evaluación:** Parcial N.º 2 — Implementando frontend y pruebas unitarias a mi tienda online  
**Tipo de solución:** Prototipo frontend offline, sin backend conectado.

## 1. Propósito
Desarrollar una tienda online frontend para visualizar productos, filtrar el catálogo, gestionar un carrito, simular compras, vincular pedidos a la cuenta del cliente y disponer de una vista administrativa para inventario, stock, pedidos y estadísticas.

## 2. Alcance de esta versión
La aplicación es una simulación que persiste información en `localStorage` del navegador. No procesa pagos reales ni reemplaza una base de datos o un sistema de autenticación de producción.

## 3. Tecnologías
- React y JavaScript para componentes, props, estado y renderizado.
- Vite como servidor de desarrollo y empaquetador.
- React Router para navegación entre vistas.
- Bootstrap 5 para grilla responsiva, formularios, tablas, botones, badges y utilidades.
- Jasmine, Karma y React Testing Library para pruebas unitarias y simulación de eventos.
- `localStorage` como persistencia local de demostración.

## 4. Requisitos funcionales
| ID | Requisito |
|---|---|
| RF-01 | Mostrar productos desde el archivo de datos iniciales `src/data/productos.js`. |
| RF-02 | Buscar productos por nombre, descripción o categoría y filtrar por categoría. |
| RF-03 | Mostrar detalle de producto y permitir agregarlo al carrito. |
| RF-04 | Permitir aumentar/disminuir cantidades, eliminar productos y vaciar el carrito. |
| RF-05 | Validar los datos del checkout y simular la confirmación o rechazo de pago. |
| RF-06 | Guardar pedidos con identificador, fecha, productos, cliente, método de pago, subtotal, envío, total y estado. |
| RF-07 | Si hay sesión iniciada, asociar la orden al correo de la cuenta y completar datos conocidos en checkout. |
| RF-08 | Mostrar en “Mi cuenta” el historial de órdenes asociadas al correo del usuario. |
| RF-09 | Descontar del inventario las cantidades compradas en una compra simulada exitosa. |
| RF-10 | Proveer dashboard administrativo con indicadores y gráficos sencillos basados en pedidos guardados. |
| RF-11 | Permitir crear y eliminar productos, buscar en inventario e ingresar stock. |
| RF-12 | Permitir aceptar/confirmar, marcar como preparado o cancelar pedidos desde administración. |
| RF-13 | Mantener los datos simulados entre recargas mediante `localStorage`. |

## 5. Requisitos no funcionales
- RNF-01: diseño responsivo en móviles, tabletas y escritorio mediante Bootstrap y CSS adaptable.
- RNF-02: componentes reutilizables y con responsabilidad acotada.
- RNF-03: validar formularios y mostrar errores comprensibles.
- RNF-04: pruebas unitarias para renderizado, props, eventos, validaciones y persistencia.
- RNF-05: el código debe poder ejecutarse localmente con Node.js y npm.

## 6. Vistas y navegación
- Tienda: `/`, `/productos`, `/productos/:id`, `/colecciones`, `/SobreNosotros`, `/contacto`.
- Compra: `/carrito`, `/checkout`, `/compra-exitosa`, `/pago-rechazado`.
- Cuenta: `/login`, `/registro`, `/cuenta`.
- Administración demo: `/admin`, `/admin/inventario`, `/admin/stock`, `/admin/pedidos`, `/admin/cuenta`.

## 7. Persistencia simulada
- `src/data/productos.js`: catálogo inicial.
- `src/data/tienda.js`: funciones de lectura, creación, actualización y eliminación de productos, y lectura/escritura de pedidos.
- `offlineArchiveProductos`: catálogo con cambios administrativos.
- `offlineArchiveOrders`: historial de pedidos.
- `offlineArchiveLastOrder`: pedido más reciente para la vista de resultado.
- `carrito`: contenido persistido del carrito.
- `offlineArchiveAccount` y `offlineArchiveSession`: cuenta y sesión de demostración.

## 8. Restricciones y trabajo futuro
No existe backend ni autenticación real por roles; `/admin` es accesible como demo y no debe publicarse como administración real. `localStorage` es específico del navegador y puede ser modificado por el usuario. Una siguiente versión debe conectar API y base de datos, validar permisos de administrador en servidor, procesar pagos mediante proveedor autorizado y gestionar concurrencia de stock.
