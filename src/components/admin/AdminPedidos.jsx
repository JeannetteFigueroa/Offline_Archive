/**
 * AdminPedidos.jsx
 *
 * Pestaña de Confirmación y preparación de pedidos del panel de administración.
 * Permite visualizar el listado completo de pedidos (reales y demo),
 * datos del cliente, total de la orden y cambiar su estado:
 *   - CONFIRMADO (Aceptar)
 *   - PREPARADO
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
              {ordenes.map((orden) => (
                <tr key={orden.id}>
                  <td>
                    {orden.id}
                    {orden.demo && (
                      <>
                        <br />
                        <span className="badge text-bg-warning">DEMO</span>
                      </>
                    )}
                  </td>

                  <td>
                    {orden.cliente?.nombre}
                    <br />
                    <small>{orden.cliente?.correo}</small>
                  </td>

                  <td>
                    {new Date(orden.fecha).toLocaleDateString("es-CL")}
                  </td>

                  <td>{money(orden.total)}</td>

                  <td>
                    <span className="badge text-bg-secondary">{orden.estado}</span>
                  </td>

                  <td>
                    <div className="d-flex flex-wrap gap-1">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => cambiarEstado(orden.id, "CONFIRMADO")}
                      >
                        Aceptar
                      </button>

                      <button
                        className="btn btn-sm btn-outline-success"
                        onClick={() => cambiarEstado(orden.id, "PREPARADO")}
                      >
                        Preparado
                      </button>

                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => cambiarEstado(orden.id, "CANCELADO")}
                      >
                        Cancelar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-secondary">No hay pedidos registrados todavía.</p>
      )}
    </section>
  );
}

export default AdminPedidos;
