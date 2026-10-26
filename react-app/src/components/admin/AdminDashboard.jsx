import { useMemo } from "react";
import { Link } from "react-router-dom";

const money = (numero) =>
  `$${Number(numero || 0).toLocaleString("es-CL")}`;

function AdminDashboard({
  productos,
  ordenes
}) {
  // Calcula los productos más vendidos.
  const ventas = useMemo(() => {
    const mapaVentas = {};

    ordenes.forEach((orden) => {
      (orden.productos || []).forEach(
        (producto) => {
          mapaVentas[producto.nombre] =
            (mapaVentas[producto.nombre] || 0) +
            Number(producto.cantidad || 0);
        }
      );
    });

    return Object.entries(mapaVentas)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [ordenes]);

  // Total de ventas registradas.
  const ventasTotales = ordenes.reduce(
    (total, orden) =>
      total + Number(orden.total || 0),
    0
  );

  // Pedidos que todavía requieren atención.
  const pedidosPendientes =
    ordenes.filter(
      (orden) =>
        orden.estado === "PAGADA" ||
        orden.estado === "PENDIENTE"
    ).length;

  // Se usa para calcular el ancho
  // de las barras del gráfico.
  const maxVentas = Math.max(
    1,
    ...ventas.map((venta) => venta[1])
  );

  // Agrupa pedidos por mes.
  const temporadas = ordenes.reduce(
    (acumulador, orden) => {
      const fecha = new Date(orden.fecha);

      const mes = Number.isNaN(
        fecha.getTime()
      )
        ? "Sin fecha"
        : fecha.toLocaleDateString(
            "es-CL",
            {
              month: "long",
              year: "numeric"
            }
          );

      acumulador[mes] =
        (acumulador[mes] || 0) + 1;

      return acumulador;
    },
    {}
  );

  return (
    <>
      {/* Resumen general */}
      <div className="row g-3 mb-4">
        {[
          [
            "Productos registrados",
            productos.length
          ],
          [
            "Pedidos registrados",
            ordenes.length
          ],
          [
            "Pedidos por preparar",
            pedidosPendientes
          ],
          [
            "Ventas simuladas",
            money(ventasTotales)
          ]
        ].map(([label, value]) => (
          <div
            className="col-12 col-sm-6 col-xl-3"
            key={label}
          >
            <div className="admin-stat h-100">
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">

        {/* Productos más vendidos */}
        <div className="col-12 col-lg-7">
          <section className="admin-panel h-100">

            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2>
                Productos más vendidos
              </h2>

              <span className="badge text-bg-secondary">
                Por unidades
              </span>
            </div>

            {ventas.length ? (
              ventas.map(
                ([nombre, cantidad]) => (
                  <div
                    className="chart-row"
                    key={nombre}
                  >
                    <div className="d-flex justify-content-between gap-3">
                      <span>
                        {nombre}
                      </span>

                      <strong>
                        {cantidad}
                      </strong>
                    </div>

                    <div className="progress mt-2">
                      <div
                        className="progress-bar"
                        role="progressbar"
                        style={{
                          width: `${
                            (cantidad /
                              maxVentas) *
                            100
                          }%`
                        }}
                        aria-valuenow={
                          cantidad
                        }
                        aria-valuemin="0"
                        aria-valuemax={
                          maxVentas
                        }
                      />
                    </div>
                  </div>
                )
              )
            ) : (
              <p className="text-secondary">
                Todavía no hay ventas
                registradas.
              </p>
            )}

          </section>
        </div>

        {/* Temporadas */}
        <div className="col-12 col-lg-5">
          <section className="admin-panel h-100">

            <h2>
              Temporadas de compra
            </h2>

            <p className="text-secondary small">
              Conteo de pedidos por mes
              de compra.
            </p>

            {Object.entries(
              temporadas
            ).map(
              ([mes, cantidad]) => (
                <div
                  className="d-flex justify-content-between border-bottom py-2"
                  key={mes}
                >
                  <span className="text-capitalize">
                    {mes}
                  </span>

                  <strong>
                    {cantidad} pedido(s)
                  </strong>
                </div>
              )
            )}

            {!ordenes.length && (
              <p className="text-secondary">
                Aún no hay datos
                suficientes.
              </p>
            )}

          </section>
        </div>

      </div>

      {/* Accesos rápidos */}
      <div className="admin-shortcuts mt-4">

        <Link to="/admin/inventario">
          ＋ Administrar inventario
        </Link>

        <Link to="/admin/stock">
          ＋ Ingresar stock
        </Link>

        <Link to="/admin/pedidos">
          ✓ Revisar pedidos
        </Link>

      </div>
    </>
  );
}

export default AdminDashboard;