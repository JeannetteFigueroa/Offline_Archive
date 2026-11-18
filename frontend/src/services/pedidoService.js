/**
 * pedidoService.js
 *
 * Servicio frontend para comunicarse con el endpoint de Checkout y Pedidos de Spring Boot.
 */

import { api } from "./api";

export const pedidoService = {
  /**
   * Envía la orden de compra al backend.
   * Valida stock en base de datos y activa triggers de PostgreSQL.
   *
   * @param {Object} orden
   * @returns {Promise<any>}
   */
  async crearPedido(orden) {
    const payload = {
      clienteNombre: orden.nombre,
      clienteCorreo: orden.correo,
      clienteTelefono: orden.telefono.replace(/\s/g, ""),
      comunaNombre: orden.comuna,
      direccionEntrega: orden.tipoEntrega === "retiro"
        ? `Retiro en Tienda: ${orden.tiendaRetiro || "Sucursal Central"}`
        : orden.direccion,
      tipoEntregaCodigo: orden.tipoEntrega === "retiro" ? "RETIRO" : "DOMICILIO",
      metodoPagoCodigo: (orden.metodoPago || "DEBITO").toUpperCase(),
      items: (orden.carrito || []).map((item) => ({
        productoId: Number(item.id),
        cantidad: Number(item.cantidad || 1)
      }))
    };

    return await api.post("/pedidos", payload);
  },

  /**
   * Consulta el historial de pedidos del usuario autenticado.
   *
   * @returns {Promise<Array>}
   */
  async getMisPedidos() {
    return await api.get("/pedidos/mis-pedidos");
  },

  /**
   * Consulta un pedido por su número (ej: OFF-000001).
   *
   * @param {string} numeroPedido
   * @returns {Promise<any>}
   */
  async getPedidoPorNumero(numeroPedido) {
    return await api.get(`/pedidos/${numeroPedido}`);
  }
};

export default pedidoService;
