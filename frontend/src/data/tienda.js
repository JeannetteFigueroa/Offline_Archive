/**
 * tienda.js
 *
 * Módulo de persistencia local de la tienda (Off)line Archive.
 * Toda la información del catálogo y los pedidos se guarda en
 * localStorage, sin necesidad de un servidor backend.
 *
 * Exporta:
 *   — Constantes de clave (keys) para localStorage.
 *   — Funciones CRUD para productos.
 *   — Funciones CRUD para categorías.
 *   — Función para alternar la visibilidad (ocultar/mostrar) de un producto.
 *   — Funciones para leer y guardar pedidos/órdenes.
 */

import productosIniciales from "./productos.js";

/* ─── Claves de almacenamiento local ─────────────────────────────────────── */
export const PRODUCTOS_KEY  = "offlineArchiveProductos";
export const ORDERS_KEY     = "offlineArchiveOrders";
export const CATEGORIAS_KEY = "offlineArchiveCategorias";

/* ─── Categorías del sistema (no eliminables desde el admin) ─────────────── */
export const CATEGORIAS_INICIALES = [
  { id: "tops",       label: "Tops"       },
  { id: "bottoms",    label: "Bottoms"    },
  { id: "accesorios", label: "Accesorios" },
  { id: "outerwear",  label: "Outerwear"  }
];

/* ─── Categorías ─────────────────────────────────────────────────────────── */

/**
 * Lee las categorías guardadas en localStorage.
 * Si no hay ninguna guardada, retorna las categorías iniciales del sistema.
 *
 * @returns {Array<{id: string, label: string}>}
 */
export function leerCategorias() {
  try {
    const guardadas = JSON.parse(localStorage.getItem(CATEGORIAS_KEY) || "null");
    if (Array.isArray(guardadas) && guardadas.length > 0) {
      return guardadas;
    }
    // Sin datos previos → devuelve las 4 categorías base
    return CATEGORIAS_INICIALES;
  } catch {
    return CATEGORIAS_INICIALES;
  }
}

/**
 * Guarda el array de categorías en localStorage.
 *
 * @param {Array<{id: string, label: string}>} categorias
 */
export function guardarCategorias(categorias) {
  localStorage.setItem(CATEGORIAS_KEY, JSON.stringify(categorias));
}

/**
 * Agrega una nueva categoría al array y la persiste en localStorage.
 * Normaliza el id (minúsculas, sin tildes, guiones en vez de espacios).
 * Ignora la operación si ya existe una categoría con el mismo id.
 *
 * @param {Array} categorias  - Array actual de categorías.
 * @param {{ id?: string, label: string }} nueva - Datos de la nueva categoría.
 * @returns {Array} Array actualizado con la nueva categoría incluida (o el mismo si ya existía).
 */
export function crearCategoria(categorias, nueva) {
  // Normaliza el id: minúsculas, sin acentos, sin espacios
  const normalizado = (nueva.id || nueva.label || "")
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-");

  // Evita duplicados: si ya existe una categoría con ese id, no hace nada
  if (!normalizado || categorias.some((c) => c.id.toLowerCase() === normalizado)) {
    return categorias;
  }

  const actualizadas = [
    ...categorias,
    { id: normalizado, label: nueva.label.trim() }
  ];
  guardarCategorias(actualizadas);
  return actualizadas;
}

/**
 * Elimina una categoría del array y actualiza localStorage.
 * Las categorías del sistema (tops, bottoms, accesorios, outerwear)
 * están protegidas en la UI del admin, pero esta función no las discrimina.
 *
 * @param {Array} categorias - Array actual de categorías.
 * @param {string} id - Identificador de la categoría a eliminar.
 * @returns {Array} Array sin la categoría eliminada.
 */
export function eliminarCategoria(categorias, id) {
  const filtradas = categorias.filter((c) => c.id !== id);
  guardarCategorias(filtradas);
  return filtradas;
}

/* ─── Productos ──────────────────────────────────────────────────────────── */

/**
 * Lee los productos guardados en localStorage.
 * Si no hay productos guardados, retorna el catálogo inicial.
 * Si hay productos guardados, mezcla con los productos base para incluir
 * cualquier producto nuevo que se haya añadido al código fuente.
 *
 * @returns {Array} Lista de productos.
 */
export function leerProductos() {
  try {
    const guardados = JSON.parse(localStorage.getItem(PRODUCTOS_KEY) || "null");
    if (!Array.isArray(guardados)) return productosIniciales;

    // Detecta productos nuevos del catálogo base que aún no están guardados
    const codigosGuardados = new Set(guardados.map((p) => p.codigo));
    const productosNuevos  = productosIniciales.filter((p) => !codigosGuardados.has(p.codigo));
    return [...guardados, ...productosNuevos];
  } catch {
    return productosIniciales;
  }
}

/**
 * Guarda el array completo de productos en localStorage.
 *
 * @param {Array} productos
 */
export function guardarProductos(productos) {
  localStorage.setItem(PRODUCTOS_KEY, JSON.stringify(productos));
}

/**
 * Agrega un producto nuevo al catálogo.
 * Asigna un id único basado en timestamp si no se proporciona.
 * Inicializa el campo `oculto` en false si no se especifica.
 *
 * @param {Array} productos - Catálogo actual.
 * @param {Object} producto - Datos del nuevo producto.
 * @returns {Array} Nuevo catálogo con el producto agregado.
 */
export function crearProducto(productos, producto) {
  const nuevo = {
    ...producto,
    id:     producto.id ?? Date.now(),  // id único si no se proporciona
    oculto: Boolean(producto.oculto)    // false por defecto
  };
  return [...productos, nuevo];
}

/**
 * Actualiza campos de un producto existente sin modificar los demás.
 * Usa desestructuración (spread) para mantener la inmutabilidad.
 *
 * @param {Array} productos - Catálogo actual.
 * @param {number|string} id - Id del producto a modificar.
 * @param {Object} cambios - Campos a actualizar.
 * @returns {Array} Catálogo con el producto actualizado.
 */
export function actualizarProducto(productos, id, cambios) {
  return productos.map((producto) =>
    producto.id === id ? { ...producto, ...cambios } : producto
  );
}

/**
 * Invierte el estado de visibilidad de un producto (oculto ↔ visible).
 * Solo afecta al producto con el id indicado; los demás no cambian.
 *
 * @param {Array} productos - Catálogo actual.
 * @param {number|string} id - Id del producto a alternar.
 * @returns {Array} Catálogo con el estado `oculto` del producto invertido.
 */
export function alternarVisibilidadProducto(productos, id) {
  return productos.map((producto) =>
    producto.id === id ? { ...producto, oculto: !producto.oculto } : producto
  );
}

/**
 * Elimina un producto del catálogo por su id.
 *
 * @param {Array} productos - Catálogo actual.
 * @param {number|string} id - Id del producto a eliminar.
 * @returns {Array} Catálogo sin el producto eliminado.
 */
export function eliminarProducto(productos, id) {
  return productos.filter((producto) => producto.id !== id);
}

/* ─── Órdenes / Pedidos ──────────────────────────────────────────────────── */

/**
 * Lee el historial de pedidos guardado en localStorage.
 *
 * @returns {Array} Lista de órdenes, o array vacío si no hay ninguna.
 */
export function leerOrdenes() {
  try {
    const ordenes = JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
    return Array.isArray(ordenes) ? ordenes : [];
  } catch {
    return [];
  }
}

/**
 * Guarda el historial completo de pedidos en localStorage.
 *
 * @param {Array} ordenes - Array de órdenes a persistir.
 */
export function guardarOrdenes(ordenes) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(ordenes));
}
