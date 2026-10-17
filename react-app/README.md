# (Off)line Archive — tienda online frontend

Proyecto frontend de la Evaluación Parcial 2 de DSY1104 Desarrollo Fullstack II. Es una demostración offline: React + Vite, React Router, Bootstrap 5, persistencia de prueba en `localStorage` y pruebas unitarias con Jasmine/Karma.

## Requisitos
- Node.js LTS compatible con la versión de Vite instalada.
- Google Chrome o Microsoft Edge para ejecutar Karma en modo headless.

## Ejecutar
Desde la carpeta `react-app`:

```bash
npm install
npm run dev
```

Vite mostrará la URL local (normalmente `http://localhost:5173`).

## Pruebas y cobertura
```bash
npm test
```
Karma ejecuta Jasmine en ChromeHeadless. El informe de cobertura se genera en `coverage/` si el navegador y las dependencias se encuentran correctamente configurados. En Windows, si no detecta Chrome, configura `CHROME_BIN` con la ruta a `chrome.exe` o adapta `karma.conf.cjs` para Edge.

## Vistas
- Tienda: `/`, `/productos`, `/productos/:id`, `/colecciones`.
- Compra simulada: `/carrito`, `/checkout`, `/compra-exitosa`, `/pago-rechazado`.
- Cliente: `/login`, `/registro`, `/cuenta`.
- Administración de demostración: `/admin`, `/admin/inventario`, `/admin/stock`, `/admin/pedidos`, `/admin/cuenta`.

## Persistencia y límites
`src/data/productos.js` contiene los datos iniciales del catálogo. `src/data/tienda.js` ofrece operaciones de lectura y CRUD y guarda los cambios en `localStorage`. Los pedidos de prueba se guardan en `offlineArchiveOrders`, se asocian al correo de la sesión cuando hay una sesión iniciada, se muestran en la cuenta del cliente y aparecen en la administración. Al confirmar una compra se descuenta el stock en el catálogo local.

Este trabajo es una simulación frontend sin backend. Los datos viven en el navegador actual; `localStorage` no sustituye una base de datos y no debe utilizarse para autenticar o procesar pagos reales. La ruta `/admin` es de demostración y aún requiere autenticación/autorización real antes de producción.

## Frameworks y herramientas
- React: componentes, props, estado y navegación.
- Bootstrap 5: sistema de grilla responsive, utilidades, formularios, botones, tablas y badges.
- Jasmine + Karma + Testing Library: validaciones, renderizado, eventos y persistencia.
