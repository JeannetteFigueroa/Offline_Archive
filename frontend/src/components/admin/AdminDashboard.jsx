/**
 * AdminDashboard.jsx
 *
 * Pestaña de Dashboard del panel de administración.
 * Muestra:
 *   - Métricas comerciales clave calculadas desde PostgreSQL o fallback local.
 *   - Gráfico de barras de "Productos más vendidos".
 *   - Gráfico/lista de "Temporadas de compra" agrupado por mes.
 *   - Accesos directos rápidos hacia inventario, stock y pedidos.
 */

import { useMemo } from "react";
import { Link } from "react-router-dom";

const money = (n) => `$${Number(n || 0).toLocaleString("es-CL")}`;

function AdminDashboard({ productos, ordenes, metricasDb }) {
  // Conteo de pedidos pendientes de preparación
  const pedidosPendientes = useMemo(() => {
    if (metricasDb?.pedidosPendientes !== undefined) {
      return metricasDb.pedidosPendientes;
    }
    return ordenes.filter((o) => {
      const est = o.estadoCodigo || o.estado;
      return est !== "PREPARADO" && est !== "CANCELADO" && est !== "ENTREGADO";
    }).length;
  }, [ordenes, metricasDb]);

  // Suma total de ventas
  const ventasTotales = useMemo(() => {
    if (metricasDb?.totalIngresos !== undefined && metricasDb.totalIngresos > 0) {
      return metricasDb.totalIngresos;
    }
    return ordenes.reduce((total, o) => total + Number(o.total || 0), 0);
  }, [ordenes, metricasDb]);

  // Total de pedidos
  const totalPedidos = useMemo(() => {
    if (metricasDb?.totalPedidos !== undefined && metricasDb.totalPedidos > 0) {
      return metricasDb.totalPedidos;
    }
    return ordenes.length;
  }, [ordenes, metricasDb]);

  // Total de productos sin stock
  const productosSinStock = useMemo(() => {
    if (metricasDb?.productosSinStock !== undefined) {
      return metricasDb.productosSinStock;
    }
    return productos.filter((p) => Number(p.stock || 0) <= 0).length;
  }, [productos, metricasDb]);

  // Ranking de productos más vendidos
  const { ventas, maxVentas } = useMemo(() => {
    if (metricasDb?.productosMasVendidos && metricasDb.productosMasVendidos.length > 0) {
      const top = metricasDb.productosMasVendidos.map((item) => [
        item.nombreProducto || item.nombre || "Producto",
        Number(item.unidadesVendidas ?? item.cantidad ?? 0)
      ]);
      const max = Math.max(...top.map(([, cant]) => cant), 1);
      return { ventas: top, maxVentas: max };
    }

    const conteo = {};
    ordenes.forEach((orden) => {
      (orden.productos || orden.detalles || []).forEach((item) => {
        const nombre = item.nombreProducto || item.nombre;
        if (nombre) {
          conteo[nombre] = (conteo[nombre] || 0) + (item.cantidad || 1);
        }
      });
    });

    const ordenadas = Object.entries(conteo).sort((a, b) => b[1] - a[1]);
    const max = ordenadas.length ? Math.max(...ordenadas.map(([, cant]) => cant)) : 1;

    return {
      ventas: ordenadas.slice(0, 5),
      maxVentas: max
    };
  }, [ordenes, metricasDb]);

  // Agrupación de pedidos por mes
  const pedidosPorMes = useMemo(() => {
    if (metricasDb?.pedidosPorMes) {
      if (Array.isArray(metricasDb.pedidosPorMes) && metricasDb.pedidosPorMes.length > 0) {
        // Backend devuelve una lista de mapas: [{ mes: "2026-11", total: 3 }]
        return metricasDb.pedidosPorMes.map((item) => [
          item.mes || item.periodo || "Sin periodo",
          Number(item.total ?? item.cantidad ?? 0)
        ]);
      }
      if (typeof metricasDb.pedidosPorMes === "object" && Object.keys(metricasDb.pedidosPorMes).length > 0) {
        return Object.entries(metricasDb.pedidosPorMes).map(([mes, cant]) => [
          mes,
          typeof cant === "object" ? Number(cant?.total ?? cant?.cantidad ?? 0) : Number(cant || 0)
        ]);
      }
    }

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
  }, [ordenes, metricasDb]);

  return (
    <>
      {/* Tarjetas de Métricas Clave */}
      <div className="row g-3 mb-4">
        {[
          {
            titulo: "Total Productos",
            valor: metricasDb?.totalProductos || productos.length,
            detalle: `${productosSinStock} agotados / ${productos.filter((p) => p.stock > 0 && p.stock <= 3).length} bajo stock`,
            icono: "🏷️",
            color: "primary"
          },
          {
            titulo: "Total Pedidos",
            valor: totalPedidos,
            detalle: `${pedidosPendientes} pendientes de despacho`,
            icono: "📦",
            color: "info"
          },
          {
            titulo: "Pedidos por Preparar",
            valor: pedidosPendientes,
            detalle: "Requieren confirmación o empaque",
            icono: "⏳",
            color: "warning"
          },
          {
            titulo: "Ingresos Totales",
            valor: money(ventasTotales),
            detalle: "Ventas brutas acumuladas",
            icono: "💰",
            color: "success"
          }
        ].map((card, i) => (
          <div key={i} className="col-12 col-sm-6 col-xl-3">
            <div className={`card border-0 shadow-sm border-start border-4 border-${card.color} h-100`}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="text-secondary small fw-medium">{card.titulo}</span>
                  <span style={{ fontSize: "1.3rem" }}>{card.icono}</span>
                </div>
                <div className="fs-3 fw-bold mb-1">{card.valor}</div>
                <small className="text-muted">{card.detalle}</small>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4 mb-4">
        {/* Productos Más Vendidos */}
        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white py-3 border-0">
              <h3 className="h6 mb-0 fw-bold">Top 5 Productos Más Vendidos</h3>
            </div>
            <div className="card-body">
              {ventas.length === 0 ? (
                <p className="text-muted text-center py-4">No hay datos de ventas disponibles</p>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {ventas.map(([nombre, cant], idx) => {
                    const porcentaje = Math.round((cant / maxVentas) * 100);
                    return (
                      <div key={idx}>
                        <div className="d-flex justify-content-between mb-1 small">
                          <span className="fw-medium text-truncate" style={{ maxWidth: "70%" }}>
                            {idx + 1}. {nombre}
                          </span>
                          <span className="text-muted fw-bold">{cant} unidades</span>
                        </div>
                        <div className="progress" style={{ height: "8px" }}>
                          <div
                            className="progress-bar bg-dark"
                            role="progressbar"
                            style={{ width: `${porcentaje}%` }}
                            aria-valuenow={porcentaje}
                            aria-valuemin="0"
                            aria-valuemax="100"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Estacionalidad / Pedidos por Mes */}
        <div className="col-12 col-lg-5">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white py-3 border-0">
              <h3 className="h6 mb-0 fw-bold">Volumen de Pedidos por Periodo</h3>
            </div>
            <div className="card-body">
              {pedidosPorMes.length === 0 ? (
                <p className="text-muted text-center py-4">No hay periodos registrados</p>
              ) : (
                <ul className="list-group list-group-flush">
                  {pedidosPorMes.map(([periodo, cantidad], idx) => (
                    <li
                      key={idx}
                      className="list-group-item d-flex justify-content-between align-items-center px-0 py-2 border-0 border-bottom"
                    >
                      <span className="text-capitalize small">
                        {typeof periodo === "object" ? (periodo?.mes || periodo?.periodo || "Periodo") : String(periodo)}
                      </span>
                      <span className="badge bg-light text-dark border fw-medium">
                        {typeof cantidad === "object" ? Number(cantidad?.total ?? cantidad?.cantidad ?? 0) : cantidad} pedidos
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white py-3 border-0">
          <h3 className="h6 mb-0 fw-bold">Acciones Rápidas de Operación</h3>
        </div>
        <div className="card-body">
          <div className="d-flex flex-wrap gap-2">
            <Link to="/admin/inventario" className="btn btn-outline-dark btn-sm">
              + Gestionar Productos
            </Link>
            <Link to="/admin/stock" className="btn btn-outline-dark btn-sm">
              + Reponer Stock
            </Link>
            <Link to="/admin/pedidos" className="btn btn-outline-dark btn-sm">
              Ver Pedidos Pendientes
            </Link>
            <Link to="/admin/cuenta" className="btn btn-outline-success btn-sm">
              📊 Descargar Reporte Excel
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminDashboard;
