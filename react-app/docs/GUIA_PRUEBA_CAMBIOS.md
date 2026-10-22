# Offline Archive — guía de prueba de los cambios

## Qué se agregó

1. **Cuenta de administrador de demostración** creada automáticamente al abrir `/login`.
2. **Redirección por rol**: el admin va a `/admin`; los clientes van a `/cuenta`. La ruta administrativa redirige al login si la sesión no tiene rol `admin`.
3. **Pedidos ficticios para las estadísticas**: la primera vez que se abre el dashboard sin historial local, se crean ocho pedidos marcados `DEMO`, distribuidos en varios meses. Son datos de ejemplo, no ventas reales.
4. **Categoría Ofertas** en el catálogo, con dos prendas de promoción web.
5. Precio normal, precio de oferta y porcentaje de descuento visibles en las tarjetas y en el detalle. El precio rebajado también se usa en el carrito y el checkout.
6. Migración sencilla de productos: si el navegador ya tenía un catálogo guardado, los nuevos productos de oferta se agregan sin borrar los productos existentes.

## Credenciales de prueba

- Correo: `admin@gmail.com`
- Contraseña: `Admin123`

Estas credenciales solo sirven para la demostración frontend. No son una autenticación segura para producción: la aplicación no tiene backend y los datos se guardan en el navegador.

## Instalación en Windows

1. Descomprime el ZIP.
2. Abre la carpeta `react-app` en Visual Studio Code.
3. Abre **Terminal → Nueva terminal**.
4. Comprueba las herramientas con `node -v` y `npm -v`.
5. Instala dependencias: `npm install`.
6. Inicia la tienda: `npm run dev`.
7. Abre la dirección que muestra Vite, normalmente `http://localhost:5173`.

## Prueba A — inicio de sesión admin

1. Abre `/login` desde la tienda o entra a `http://localhost:5173/login`.
2. Ingresa `admin@gmail.com` y `Admin123`.
3. Pulsa **INICIAR SESIÓN**.
4. Debe aparecer el mensaje de acceso correcto y luego abrirse `/admin`.
5. En otra pestaña privada o después de cerrar sesión, intenta entrar directamente a `/admin`. Si no hay una sesión admin, debe redirigir a `/login`.

## Prueba B — estadísticas del dashboard

1. Abre `/admin` con la cuenta admin.
2. Debes ver productos registrados, pedidos registrados, pedidos por preparar y ventas simuladas.
3. El gráfico **Productos más vendidos** debe mostrar barras.
4. **Temporadas de compra** debe mostrar pedidos agrupados por mes.
5. En la sección **Confirmar pedidos**, los pedidos de ejemplo están identificados con una etiqueta `DEMO`.

Los pedidos ficticios solo se generan si el navegador no tiene la clave `offlineArchiveOrders`. Si ya existe esa clave y está vacía, no se sobreescribe. Para reiniciar los datos de demostración, abre las herramientas del navegador (F12) → Application/Almacenamiento → Local Storage → el sitio local y elimina únicamente `offlineArchiveOrders`; vuelve a abrir `/admin`. Esto borra también el historial local de pedidos que tuvieras guardado.

## Prueba C — ofertas de la web

1. Entra a `/productos`.
2. Pulsa el filtro **OFERTAS**.
3. Deben aparecer dos productos con etiqueta de descuento, precio normal tachado y precio rebajado.
4. Oferta 1: Baby Tee Static — precio normal `$19.990`, oferta `$14.990`, descuento `25%`.
5. Oferta 2: Falda Circuit — precio normal `$26.990`, oferta `$19.990`, descuento `26%`.
6. Abre el detalle de cada prenda y comprueba que el descuento también aparece allí.
7. Agrega una oferta al carrito y continúa al checkout. El total del producto debe usar el precio rebajado; el costo de envío se mantiene según las reglas actuales de la tienda.

## Prueba D — cliente y persistencia

1. Registra una cuenta de cliente con un correo permitido (`@gmail.com`, `@duoc.cl` o `@profesor.duoc.cl`).
2. Inicia sesión como cliente; debe ir a `/cuenta`.
3. Intenta abrir `/admin` con la sesión de cliente: debe enviarte a `/login`.
4. Los datos de esta aplicación son locales al navegador y no se sincronizan entre computadores.

## Comprobaciones técnicas

En `react-app`, ejecuta:

```bash
npm test
npm run build
npm run lint
```

- `npm test`: pruebas Jasmine/Karma; requiere Chrome o Edge configurado para el lanzador `ChromeHeadless`.
- `npm run build`: verifica la compilación de producción.
- `npm run lint`: analiza problemas detectables por ESLint.

La compilación no pudo verificarse en el entorno donde se preparó este ZIP porque el `node_modules` incluido en el archivo original tenía dependencias nativas de otra plataforma. Por eso, el ZIP de entrega no incluye `node_modules`: instala dependencias con `npm install` en tu computador antes de probar. No marques las pruebas como aprobadas hasta ejecutarlas y comprobar el resultado.

## Límites conocidos

- Es una simulación frontend. No hay backend, base de datos compartida, pasarela de pago ni control de acceso seguro en servidor.
- El administrador demo se guarda en `localStorage`; un usuario puede modificar datos locales desde las herramientas del navegador. No se debe usar en producción.
- Los pedidos `DEMO` son ficticios y se incluyen solo para poder mostrar las estadísticas sin tener que realizar muchas compras de prueba.
