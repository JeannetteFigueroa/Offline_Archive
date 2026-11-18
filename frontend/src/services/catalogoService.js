/**
 * catalogoService.js
 *
 * Servicio para obtener productos y categorías desde el backend Spring Boot.
 * Cuenta con fallback a datos locales en caso de que el backend no responda.
 */

import { api } from "./api";
import { CATEGORIAS_INICIALES } from "../data/tienda";
import productosIniciales from "../data/productos";

export const catalogoService = {
  /**
   * Obtiene la lista de productos visibles (opcionalmente filtrados por slug de categoría).
   * Conectado directamente a Spring Boot y PostgreSQL.
   *
   * @param {string} [categoriaSlug]
   * @returns {Promise<Array>}
   */
  async getProductos(categoriaSlug = "") {
    try {
      const url = categoriaSlug
        ? `/productos?categoria=${encodeURIComponent(categoriaSlug)}`
        : "/productos";
      const data = await api.get(url);
      if (Array.isArray(data)) {
        return data;
      }
      return productosIniciales;
    } catch {
      return productosIniciales;
    }
  },

  /**
   * Obtiene el detalle de un producto por ID desde el backend PostgreSQL.
   *
   * @param {number|string} id
   * @returns {Promise<any>}
   */
  async getProductoPorId(id) {
    try {
      return await api.get(`/productos/${id}`);
    } catch {
      return productosIniciales.find((p) => String(p.id) === String(id) || p.codigo === String(id)) || null;
    }
  },

  /**
   * Obtiene la lista de categorías del catálogo.
   * @returns {Promise<Array>}
   */
  async getCategorias() {
    try {
      const data = await api.get("/categorias");
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
      return CATEGORIAS_INICIALES;
    } catch {
      return CATEGORIAS_INICIALES;
    }
  }
};

export default catalogoService;
