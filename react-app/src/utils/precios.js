export function obtenerPrecioFinal(producto) {
  const precioOferta = Number(producto?.precioOferta);
  const precioNormal = Number(producto?.precio || 0);
  return precioOferta > 0 && precioOferta < precioNormal ? precioOferta : precioNormal;
}

export function tieneOferta(producto) {
  return obtenerPrecioFinal(producto) < Number(producto?.precio || 0);
}

export function calcularDescuento(producto) {
  if (!tieneOferta(producto)) return 0;
  return Math.round((1 - obtenerPrecioFinal(producto) / Number(producto.precio)) * 100);
}
