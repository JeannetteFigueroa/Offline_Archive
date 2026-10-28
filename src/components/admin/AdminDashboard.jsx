/**
 * AdminDashboard.jsx
 *
 * Pestaña de Dashboard del panel de administración.
 * Muestra:
 *   - Métricas comerciales clave (productos, pedidos, pedidos por preparar, ventas).
 *   - Gráfico de barras de "Productos más vendidos".
 *   - Gráfico/lista de "Temporadas de compra" agrupado por mes.
 *   - Accesos directos rápidos hacia inventario, stock y pedidos.
 */

import { useMemo } from "react";
import { Link } from "react-router-dom";

const money = (n) => `$${Number(n || 0).toLocaleString("es-CL")}`;

function AdminDashboard({ productos, ordenes }) {
  // Conteo de pedidos pendientes de preparación
  const pedidosPendientes = useMemo(
    () => ordenes.filter((o) => o.estado !== "PREPARADO" && o.estado !== "CANCELADO").length,
    [ordenes]
  );

  // Suma total de ventas simuladas
  const ventasTotales = useMemo(
    () => ordenes.reduce((total, o) => total + Number(o.total || 0), 0),
    [ordenes]
  );

  // Ranking de productos más vendidos
  const { ventas, maxVentas } = useMemo(() => {
    const conteo = {};
    ordenes.forEach((orden) => {
      (orden.productos || []).forEach((item) => {
        conteo[item.nombre] = (conteo[item.nombre] || 0) + item.cantidad;
      });
    });

    const ordenadas = Object.entries(conteo).sort((a, b) => b[1] - a[1]);
    const max = ordenadas.length ? Math.max(...ordenadas.map(([, cant]) => cant)) : 1;

    return {
      ventas: ordenadas.slice(0, 5),
      maxVentas: max
    };
  }, [ordenes]);

  // Agrupación de pedidos por mes
  const pedidosPorMes = useMemo(() => {
    return Object.entries(
      ordenes.reduce((acc, orden) => {
        const fecha = new Date(orden.fecha);
        const mes = Number.isNaN(fecha.getTime())
          ? "Sin fecha"
          : fecha.toLocaleDateString("es-CL", {
              month: "long",
              year: "numeric"
            });

        acc[mes] = (acc[mes] || 0) + 1;
        return acc;
      }, {})
    );
  }, [ordenes]);

  return (
    <>
      {/* Tarjetas de Métricas Clave */}
      <div className="row g-3 mb-4">
        {[
          ["Productos registrados", productos.length],
          ["Pedidos registrados", ordenes.length],
          ["Pedidos por preparar", pedidosPendientes],
          ["Ventas simuladas", money(ventasTotales)]
        ].map(([label, value]) => (
          <div className="col-12 col-sm-6 col-xl-3" key={label}>
            <div className="admin-stat h-100">
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          </div>
        ))}
      </div>

      {/* Gráficos de Estadísticas */}
      <div className="row g-4">
        {/* Productos más vendidos */}
        <div className="col-12 col-lg-7">
          <section className="admin-panel h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2>Productos más vendidos</h2>
              <span className="badge text-bg-secondary">Por unidades</span>
            </div>

            {ventas.length ? (
              ventas.map(([nombre, cantidad]) => (
                <div className="chart-row" key={nombre}>
                  <div className="d-flex justify-content-between gap-3">
                    <span>{nombre}</span>
                    <strong>{cantidad}</strong>
                  </div>

                  <div className="progress mt-2">
                    <div
                      className="progress-bar"
                      role="progressbar"
                      style={{
                        width: `${(cantidad / maxVentas) * 100}%`
                      }}
                      aria-valuenow={cantidad}
                      aria-valuemin="0"
                      aria-valuemax={maxVentas}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-secondary">Todavía no hay ventas registradas.</p>
            )}
          </section>
        </div>

        {/* Temporadas de compra */}
        <div className="col-12 col-lg-5">
          <section className="admin-panel h-100">
            <h2>Temporadas de compra</h2>
            <p className="text-secondary small">Conteo de pedidos por mes de compra.</p>

            {pedidosPorMes.map(([mes, cantidad]) => (
              <div className="d-flex justify-content-between border-bottom py-2" key={mes}>
                <span className="text-capitalize">{mes}</span>
                <strong>{cantidad} pedido(s)</strong>
              </div>
            ))}
          </section>
        </div>
      </div>

      {/* Accesos directos */}
      <div className="admin-shortcuts mt-4">
        <Link to="/admin/inventario">＋ Administrar inventario</Link>
        <Link to="/admin/stock">＋ Ingresar stock</Link>
        <Link to="/admin/pedidos">✓ Revisar pedidos</Link>
      </div>
    </>
  );
}

export default AdminDashboard;
