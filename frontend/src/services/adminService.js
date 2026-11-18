/**
 * adminService.js
 *
 * Servicio integral para operaciones administrativas conectadas al backend Spring Boot.
 * Todas las llamadas se realizan mediante el cliente `api` (adjuntando Bearer Token en cookies/header).
 */

import { api } from "./api";

export const adminService = {
  /**
   * Obtiene estadísticas comerciales completas desde la base de datos PostgreSQL.
   */
  async getDashboard() {
    return await api.get("/admin/dashboard");
  },

  /**
   * Obtiene todos los productos (incluidos visibles y ocultos) para la vista administrativa.
   */
  async getAllProductosAdmin() {
    return await api.get("/productos/admin");
  },

  /**
   * Crea un producto en PostgreSQL.
   * Si no se especifica código, el backend auto-genera 'ITEM_XXX'.
   */
  async crearProducto(datos) {
    return await api.post("/productos", datos);
  },

  /**
   * Actualiza los datos de un producto existente.
   */
  async actualizarProducto(id, datos) {
    return await api.put(`/productos/${id}`, datos);
  },

  /**
   * Elimina un producto por ID.
   */
  async eliminarProducto(id) {
    return await api.delete(`/productos/${id}`);
  },

  /**
   * Lista todas las categorías registradas.
   */
  async getCategorias() {
    return await api.get("/categorias");
  },

  /**
   * Crea una nueva categoría.
   */
  async crearCategoria(datos) {
    return await api.post("/categorias", datos);
  },

  /**
   * Elimina una categoría por ID.
   */
  async eliminarCategoria(id) {
    return await api.delete(`/categorias/${id}`);
  },

  /**
   * Lista todos los pedidos registrados en PostgreSQL.
   */
  async getPedidosAdmin() {
    return await api.get("/pedidos/admin");
  },

  /**
   * Actualiza el estado de un pedido (ej: CONFIRMADO, EN_PREPARACION, ENVIADO, ENTREGADO, CANCELADO).
   */
  async actualizarEstadoPedido(id, estadoCodigo) {
    return await api.patch(`/pedidos/admin/${id}/estado`, { estadoCodigo });
  },

  /**
   * Agrega unidades al stock de un producto existente.
   */
  async ingresarStock(id, cantidad) {
    const producto = await api.get(`/productos/${id}`);
    const nuevoStock = (producto.stock || 0) + Number(cantidad);
    return await api.put(`/productos/${id}`, {
      nombre: producto.nombre,
      precio: producto.precio,
      precioOferta: producto.precioOferta,
      categoriaSlug: producto.categoriaSlug || (producto.categoria && producto.categoria.slug),
      stock: nuevoStock,
      descripcion: producto.descripcion,
      imagenUrl: producto.imagenUrl,
      visible: producto.visible
    });
  }
};

export default adminService;
