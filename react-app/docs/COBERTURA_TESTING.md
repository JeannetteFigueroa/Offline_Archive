# Informe de pruebas unitarias y cobertura

## 1. Objetivo

El objetivo de estas pruebas es comprobar el funcionamiento de algunas partes importantes de la aplicación Offline Archive, principalmente:

- Validación de correos electrónicos.
- Visualización de información de productos.
- Navegación al detalle de un producto.
- Incorporación de productos al carrito.
- Modificación de cantidades en el carrito.
- Eliminación de productos del carrito.
- Cálculo del subtotal de un producto.

## 2. Herramientas utilizadas

Para implementar y ejecutar las pruebas se utilizaron las siguientes herramientas:

- Jasmine: creación de las pruebas unitarias.
- Karma: ejecución de las pruebas en el navegador.
- Chrome Headless o Edge Headless: navegador utilizado para ejecutar las pruebas.
- Testing Library: renderizado y consulta de componentes React.
- Karma Coverage: generación del informe de cobertura.
- Webpack y Babel: procesamiento de JavaScript y JSX durante las pruebas.

## 3. Archivos de prueba

Las pruebas se encuentran dentro de la carpeta:

`src/tests/`

Los archivos implementados son:

- `auth.spec.js`
- `ProductCard.spec.jsx`
- `CartItem.spec.jsx`

## 4. Casos de prueba implementados

| N.º | Archivo | Prueba realizada |
|---:|---|---|
| 1 | auth.spec.js | Acepta un correo con dominio permitido. |
| 2 | auth.spec.js | Rechaza un correo con dominio no permitido. |
| 3 | ProductCard.spec.jsx | Muestra correctamente los datos del producto. |
| 4 | ProductCard.spec.jsx | Genera el enlace hacia el detalle del producto. |
| 5 | ProductCard.spec.jsx | Ejecuta la función para agregar un producto al carrito. |
| 6 | CartItem.spec.jsx | Muestra correctamente la información del producto. |
| 7 | CartItem.spec.jsx | Calcula y muestra el subtotal del producto. |
| 8 | CartItem.spec.jsx | Ejecuta la función para aumentar la cantidad. |
| 9 | CartItem.spec.jsx | Ejecuta la función para disminuir la cantidad. |
| 10 | CartItem.spec.jsx | Ejecuta la función para eliminar el producto. |

## 5. Uso de funciones simuladas

En las pruebas de los componentes se utilizaron funciones simuladas mediante `jasmine.createSpy()`.

Estas funciones permiten comprobar si una acción fue ejecutada sin modificar realmente el carrito de la aplicación.

Por ejemplo, al presionar el botón para agregar, aumentar, disminuir o eliminar un producto, Jasmine comprueba que la función correspondiente haya sido llamada.

## 6. Ejecución de las pruebas

Para ejecutar las pruebas se utiliza el siguiente comando:

```bash
npm test