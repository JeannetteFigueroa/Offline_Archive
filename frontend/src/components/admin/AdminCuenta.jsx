/**
 * AdminCuenta.jsx
 *
 * Pestaña de Cuenta y Ajustes del panel de administración.
 * Funcionalidades:
 *   - Cambio de contraseña de la cuenta de administrador conectada a Spring Boot / PostgreSQL.
 *   - Descarga de reportes ejecutivos en formato Excel / CSV estructurado con datos del Dashboard e Inventario.
 *   - Información de estado de conexión técnica con el backend y base de datos.
 */

import { useState } from "react";
import authService from "../../services/authService";

function AdminCuenta({ productos = [], ordenes = [], metricasDb = null, setMensaje }) {
  // Estado para el formulario de cambio de contraseña
  const [formPassword, setFormPassword] = useState({
    passwordActual: "",
    nuevaPassword: "",
    confirmarPassword: ""
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [cargandoPassword, setCargandoPassword] = useState(false);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setFormPassword((prev) => ({ ...prev, [name]: value }));
  };

  const handleCambiarPassword = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!formPassword.passwordActual.trim()) {
      setPasswordError("Debes ingresar la contraseña actual.");
      return;
    }
    if (formPassword.nuevaPassword.length < 4) {
      setPasswordError("La nueva contraseña debe tener al menos 4 caracteres.");
      return;
    }
    if (formPassword.nuevaPassword !== formPassword.confirmarPassword) {
      setPasswordError("La confirmación de la nueva contraseña no coincide.");
      return;
    }

    try {
      setCargandoPassword(true);
      await authService.cambiarPassword({
        passwordActual: formPassword.passwordActual,
        nuevaPassword: formPassword.nuevaPassword
      });

      setPasswordSuccess("Contraseña actualizada exitosamente en PostgreSQL.");
      setFormPassword({
        passwordActual: "",
        nuevaPassword: "",
        confirmarPassword: ""
      });
      if (typeof setMensaje === "function") {
        setMensaje("Contraseña actualizada exitosamente.");
      }
    } catch (err) {
      setPasswordError(
        err.message || "No se pudo cambiar la contraseña. Verifica la contraseña actual."
      );
    } finally {
      setCargandoPassword(false);
    }
  };

  /**
   * Genera y descarga un reporte completo en formato CSV compatible con Microsoft Excel (UTF-8 con BOM)
   * que incluye métricas del Dashboard, ranking de ventas y desglose de inventario.
   */
  const descargarReporteExcel = () => {
    try {
      const fechaHoy = new Date().toLocaleString("es-CL");
      const totalVentas = metricasDb?.totalIngresos !== undefined
        ? metricasDb.totalIngresos
        : ordenes.reduce((acc, o) => acc + Number(o.total || 0), 0);

      const pedidosPendientes = metricasDb?.pedidosPendientes !== undefined
        ? metricasDb.pedidosPendientes
        : ordenes.filter((o) => (o.estadoCodigo || o.estado) !== "ENTREGADO" && (o.estadoCodigo || o.estado) !== "CANCELADO").length;

      const sinStock = metricasDb?.productosSinStock !== undefined
        ? metricasDb.productosSinStock
        : productos.filter((p) => Number(p.stock || 0) <= 0).length;

      let csv = "\uFEFF"; // Byte Order Mark para que Excel reconozca tildes y caracteres especiales

      // ── 1. Resumen Ejecutivo del Dashboard
      csv += "REPORTE COMERCIAL Y DE GESTIÓN · (OFF)LINE ARCHIVE\n";
      csv += `Fecha de Generación;${fechaHoy}\n`;
      csv += `Estado del Sistema;Conectado a PostgreSQL 18\n\n`;

      csv += "INDICADORES CLAVE DEL DASHBOARD\n";
      csv += "Métrica;Valor\n";
      csv += `Ventas Totales;$${Number(totalVentas).toLocaleString("es-CL")}\n`;
      csv += `Total de Pedidos Realizados;${metricasDb?.totalPedidos ?? ordenes.length}\n`;
      csv += `Pedidos Pendientes de Preparación;${pedidosPendientes}\n`;
      csv += `Productos Registrados en Catálogo;${metricasDb?.totalProductos ?? productos.length}\n`;
      csv += `Productos Sin Stock;${sinStock}\n`;
      csv += `Total de Categorías;${metricasDb?.totalCategorias ?? "4"}\n\n`;

      // ── 2. Top Productos Más Vendidos
      csv += "TOP PRODUCTOS MÁS VENDIDOS\n";
      csv += "Posición;Nombre del Producto;Unidades Vendidas\n";
      const masVendidos = metricasDb?.productosMasVendidos || [];
      if (masVendidos.length > 0) {
        masVendidos.forEach((item, idx) => {
          const nombre = (item.nombre || item.nombreProducto || "Producto").replace(/;/g, ",");
          const unidades = item.cantidad ?? item.unidadesVendidas ?? 0;
          csv += `${idx + 1};${nombre};${unidades}\n`;
        });
      } else {
        csv += "1;Sin compras registradas aún;0\n";
      }
      csv += "\n";

      // ── 3. Inventario Consolidado
      csv += "INVENTARIO CONSOLIDADO DE PRODUCTOS\n";
      csv += "Código;Nombre;Categoría;Precio Normal;Precio Oferta;Stock Actual;Visibilidad\n";
      productos.forEach((p) => {
        const codigo = p.codigo || p.id;
        const nombre = (p.nombre || "").replace(/;/g, ",");
        const categoria = p.categoriaLabel || p.categoria || "Tops";
        const precio = `$${Number(p.precio || 0).toLocaleString("es-CL")}`;
        const oferta = p.precioOferta ? `$${Number(p.precioOferta).toLocaleString("es-CL")}` : "Sin oferta";
        const stock = p.stock ?? 0;
        const vis = p.oculto ? "Oculto" : "Visible";
        csv += `${codigo};${nombre};${categoria};${precio};${oferta};${stock};${vis}\n`;
      });

      // Crear enlace de descarga automática
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `Reporte_Dashboard_OfflineArchive_${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      if (typeof setMensaje === "function") {
        setMensaje("Reporte Excel / CSV descargado con éxito.");
      }
    } catch {
      setPasswordError("Error al exportar los datos del reporte.");
    }
  };

  return (
    <section className="admin-panel">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h2 className="mb-1">Cuenta y Ajustes del Administrador</h2>
          <p className="text-muted small mb-0">
            Administración de credenciales de seguridad y exportación de métricas comerciales.
          </p>
        </div>
        <button
          className="btn btn-dark btn-sm d-flex align-items-center gap-2 mt-2 mt-md-0"
          onClick={descargarReporteExcel}
          type="button"
        >
          <span>📥</span> Descargar Reporte Excel / CSV
        </button>
      </div>

      <div className="row g-4">
        {/* Columna Izquierda: Formulario de Cambio de Contraseña */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white py-3 border-0">
              <h3 className="h6 mb-0 fw-bold">Seguridad · Cambiar Contraseña</h3>
            </div>
            <div className="card-body">
              {passwordSuccess && (
                <div className="alert alert-success alert-dismissible py-2 small" role="alert">
                  {passwordSuccess}
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Cerrar"
                    onClick={() => setPasswordSuccess("")}
                  />
                </div>
              )}
              {passwordError && (
                <div className="alert alert-danger alert-dismissible py-2 small" role="alert">
                  {passwordError}
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Cerrar"
                    onClick={() => setPasswordError("")}
                  />
                </div>
              )}

              <form onSubmit={handleCambiarPassword}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Contraseña Actual</label>
                  <input
                    type="password"
                    name="passwordActual"
                    className="form-control form-control-sm"
                    value={formPassword.passwordActual}
                    onChange={handlePasswordChange}
                    placeholder="Ingresa tu contraseña actual"
                    autoComplete="current-password"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold">Nueva Contraseña</label>
                  <input
                    type="password"
                    name="nuevaPassword"
                    className="form-control form-control-sm"
                    value={formPassword.nuevaPassword}
                    onChange={handlePasswordChange}
                    placeholder="Mínimo 4 caracteres"
                    autoComplete="new-password"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold">Confirmar Nueva Contraseña</label>
                  <input
                    type="password"
                    name="confirmarPassword"
                    className="form-control form-control-sm"
                    value={formPassword.confirmarPassword}
                    onChange={handlePasswordChange}
                    placeholder="Repite la nueva contraseña"
                    autoComplete="new-password"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-outline-dark btn-sm w-100"
                  disabled={cargandoPassword}
                >
                  {cargandoPassword ? "Actualizando contraseña..." : "Guardar Nueva Contraseña"}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Reportes y Estado Técnico */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white py-3 border-0">
              <h3 className="h6 mb-0 fw-bold">Reportes y Exportación</h3>
            </div>
            <div className="card-body">
              <p className="small text-muted mb-3">
                Exporta el reporte consolidado con las métricas comerciales del Dashboard, volumen de ventas y el estado actual del inventario en PostgreSQL.
              </p>
              <button
                type="button"
                className="btn btn-outline-success btn-sm w-100 py-2 d-flex justify-content-center align-items-center gap-2"
                onClick={descargarReporteExcel}
              >
                <span>📊</span> Exportar Reporte Completo (Excel / CSV)
              </button>
            </div>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white py-3 border-0">
              <h3 className="h6 mb-0 fw-bold">Infraestructura y Servicios Activos</h3>
            </div>
            <div className="card-body">
              <div className="alert alert-success py-2 small mb-3">
                <strong>● PostgreSQL Conectado:</strong> Persistencia relacional activa con control transaccional y triggers de stock.
              </div>
              <ul className="list-group list-group-flush small">
                <li className="list-group-item d-flex justify-content-between px-0 py-1 border-0">
                  <span className="text-muted">Productos en Catálogo:</span>
                  <strong>{productos.length} ítems</strong>
                </li>
                <li className="list-group-item d-flex justify-content-between px-0 py-1 border-0">
                  <span className="text-muted">Pedidos Registrados:</span>
                  <strong>{ordenes.length} compras</strong>
                </li>
                <li className="list-group-item d-flex justify-content-between px-0 py-1 border-0">
                  <span className="text-muted">Servidor Backend:</span>
                  <code>Spring Boot /api/v1 (puerto 8080)</code>
                </li>
                <li className="list-group-item d-flex justify-content-between px-0 py-1 border-0">
                  <span className="text-muted">Documentación API:</span>
                  <code>Swagger UI (/api/swagger-ui.html)</code>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AdminCuenta;
