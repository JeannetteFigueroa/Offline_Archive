/**
 * AdminPedidos.jsx
 *
 * Pestaña de Confirmación y preparación de pedidos del panel de administración.
 * Permite visualizar el listado completo de pedidos (reales de PostgreSQL y demo),
 * datos del cliente, total de la orden y cambiar su estado:
 *   - CONFIRMADO (Aceptar)
 *   - PREPARADO / EN_PREPARACION
 *   - CANCELADO
 */

const money = (n) => `$${Number(n || 0).toLocaleString("es-CL")}`;

function AdminPedidos({ ordenes, cambiarEstado }) {
  return (
    <section className="admin-panel">
      <h2>Confirmación y preparación de pedidos</h2>

      {ordenes.length ? (
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {ordenes.map((orden) => {
                const idMostrar = orden.numeroPedido || orden.id;
                const idAccion = orden.backendId || orden.id;
                const estado = orden.estadoCodigo || orden.estado;
                const clienteNombre = orden.clienteNombre || orden.cliente?.nombre || "Invitado";
                const clienteCorreo = orden.clienteCorreo || orden.cliente?.correo || orden.cuentaEmail || "";
                const fechaMostrar = orden.fecha ? new Date(orden.fecha).toLocaleDateString("es-CL") : "—";

                return (
                  <tr key={idMostrar}>
                    <td>
                      <strong>{idMostrar}</strong>
                      {orden.demo && (
                        <>
                          <br />
                          <span className="badge text-bg-warning">DEMO</span>
                        </>
                      )}
                    </td>

                    <td>
                      {clienteNombre}
                      <br />
                      <small className="text-secondary">{clienteCorreo}</small>
                    </td>

                    <td>{fechaMostrar}</td>

                    <td>{money(orden.total)}</td>

                    <td>
                      <span
                        className={`badge ${
                          estado === "CONFIRMADO" || estado === "ENTREGADO"
                            ? "text-bg-success"
                            : estado === "CANCELADO"
                            ? "text-bg-danger"
                            : estado === "EN_PREPARACION" || estado === "PREPARADO"
                            ? "text-bg-info"
                            : "text-bg-secondary"
                        }`}
                      >
                        {estado}
                      </span>
                    </td>

                    <td>
                      <div className="d-flex flex-wrap gap-1">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => cambiarEstado(idAccion, "CONFIRMADO")}
                        >
                          Aceptar
                        </button>

                        <button
                          className="btn btn-sm btn-outline-success"
                          onClick={() => cambiarEstado(idAccion, "PREPARADO")}
                        >
                          Preparado
                        </button>

                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => cambiarEstado(idAccion, "CANCELADO")}
                        >
                          Rechazar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="alert alert-secondary">
          No hay pedidos registrados en el sistema.
        </div>
      )}
    </section>
  );
}

export default AdminPedidos;
