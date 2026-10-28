/**
 * precios.js
 *
 * Utilidades para el cálculo de precios, ofertas y descuentos.
 *
 * Regla del 5%:
 *   Un producto solo entra en oferta si su precio de oferta es al menos un
 *   5% menor que el precio normal. Rebajas menores al 5% se ignoran para
 *   evitar que pequeños ajustes de precio activen la etiqueta de oferta.
 */

/**
 * Descuento mínimo (en porcentaje) para que un producto sea considerado oferta.
 * Valor exportado para poder usarlo en las pruebas y en la UI del admin.
 *
 * @type {number}
 */
export const DESCUENTO_MINIMO_OFERTA = 5;

/**
 * Retorna el precio que el cliente debe pagar por un producto.
 * Si el producto tiene un precio de oferta válido (menor al normal y con
 * al menos un 5% de descuento), retorna el precio de oferta.
 * En cualquier otro caso retorna el precio normal.
 *
 * @param {{ precio?: number, precioOferta?: number }} producto
 * @returns {number} Precio final a cobrar.
 */
export function obtenerPrecioFinal(producto) {
  const precioOferta = Number(producto?.precioOferta);
  const precioNormal = Number(producto?.precio || 0);

  if (precioOferta > 0 && precioOferta < precioNormal) {
    // Calcula el porcentaje de descuento redondeado
    const descuento = Math.round((1 - precioOferta / precioNormal) * 100);

    // Solo aplica la oferta si el descuento alcanza el mínimo requerido
    if (descuento >= DESCUENTO_MINIMO_OFERTA) {
      return precioOferta;
    }
  }

  return precioNormal;
}

/**
 * Indica si un producto tiene una oferta activa válida (≥ 5% de descuento).
 *
 * @param {{ precio?: number, precioOferta?: number }} producto
 * @returns {boolean}
 */
export function tieneOferta(producto) {
  return obtenerPrecioFinal(producto) < Number(producto?.precio || 0);
}

/**
 * Calcula el porcentaje de descuento redondeado de un producto en oferta.
 * Retorna 0 si el producto no tiene oferta activa.
 *
 * @param {{ precio?: number, precioOferta?: number }} producto
 * @returns {number} Porcentaje de descuento (0–100).
 */
export function calcularDescuento(producto) {
  if (!tieneOferta(producto)) return 0;
  return Math.round(
    (1 - obtenerPrecioFinal(producto) / Number(producto.precio)) * 100
  );
}
