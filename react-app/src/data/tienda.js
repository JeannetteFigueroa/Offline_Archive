import productosIniciales from "./productos.js";

export const PRODUCTOS_KEY = "offlineArchiveProductos";
export const ORDERS_KEY = "offlineArchiveOrders";

export function leerProductos() {
  try {
    const guardados = JSON.parse(localStorage.getItem(PRODUCTOS_KEY) || "null");
    if (!Array.isArray(guardados)) return productosIniciales;
    // Agrega productos nuevos del catálogo base sin borrar los cambios locales existentes.
    const codigosGuardados = new Set(guardados.map((p) => p.codigo));
    const productosNuevos = productosIniciales.filter((p) => !codigosGuardados.has(p.codigo));
    return [...guardados, ...productosNuevos];
  } catch {
    return productosIniciales;
  }
}

export function guardarProductos(productos) {
  localStorage.setItem(PRODUCTOS_KEY, JSON.stringify(productos));
}

export function crearProducto(productos, producto) {
  const nuevo = { ...producto, id: producto.id ?? Date.now() };
  return [...productos, nuevo];
}

export function actualizarProducto(productos, id, cambios) {
  return productos.map((producto) =>
    producto.id === id ? { ...producto, ...cambios } : producto
  );
}

export function eliminarProducto(productos, id) {
  return productos.filter((producto) => producto.id !== id);
}

export function leerOrdenes() {
  try {
    const ordenes = JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
    return Array.isArray(ordenes) ? ordenes : [];
  } catch {
    return [];
  }
}

export function guardarOrdenes(ordenes) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(ordenes));
}
