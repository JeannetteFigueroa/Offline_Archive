const money = (numero) =>
  `$${Number(numero || 0).toLocaleString("es-CL")}`;

function AdminPedidos({
  ordenes,
  cambiarEstado
}) {
  return (
    <section className="admin-panel">

        <h2>
        Confirmación y preparación de pedidos
        </h2>

        {ordenes.length ? (
        <>
            {/* VISTA MÓVIL */}
            <div className="d-md-none">

            {ordenes.map((orden) => (
                <div
                className="border rounded p-3 mb-3"
                key={`mobile-${orden.id}`}
                >

                <div className="d-flex justify-content-between align-items-start gap-2 mb-3">

                    <div>
                    <small className="text-secondary">
                        PEDIDO
                    </small>

                    <h3 className="h6 mb-1">
                        {orden.id}
                    </h3>

                    {orden.demo && (
                        <span className="badge text-bg-warning">
                        DEMO
                        </span>
                    )}
                    </div>

                    <span className="badge text-bg-secondary">
                    {orden.estado}
                    </span>

                </div>

                <div className="border-top pt-3">

                    <div className="mb-2">
                    <small className="text-secondary">
                        Cliente
                    </small>

                    <div>
                        <strong>
                        {orden.cliente?.nombre}
                        </strong>
                    </div>

                    <small>
                        {orden.cliente?.correo}
                    </small>
                    </div>

                    <div className="d-flex justify-content-between mb-2">
                    <span>
                        Fecha
                    </span>

                    <strong>
                        {new Date(
                        orden.fecha
                        ).toLocaleDateString(
                        "es-CL"
                        )}
                    </strong>
                    </div>

                    <div className="d-flex justify-content-between mb-3">
                    <span>
                        Total
                    </span>

                    <strong>
                        {money(
                        orden.total
                        )}
                    </strong>
                    </div>

                </div>

                <div className="d-grid gap-2">

                    <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={() =>
                        cambiarEstado(
                        orden.id,
                        "CONFIRMADO"
                        )
                    }
                    >
                    Aceptar pedido
                    </button>

                    <button
                    type="button"
                    className="btn btn-outline-success"
                    onClick={() =>
                        cambiarEstado(
                        orden.id,
                        "PREPARADO"
                        )
                    }
                    >
                    Marcar preparado
                    </button>

                    <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={() =>
                        cambiarEstado(
                        orden.id,
                        "CANCELADO"
                        )
                    }
                    >
                    Cancelar pedido
                    </button>

                </div>

                </div>
            ))}

            </div>

            {/* TABLA TABLET / ESCRITORIO */}
            <div className="table-responsive d-none d-md-block">

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

                            <span className="badge text-bg-warning">
                            DEMO
                            </span>
                        </>
                        )}
                    </td>

                    <td>
                        {orden.cliente?.nombre}

                        <br />

                        <small>
                        {orden.cliente?.correo}
                        </small>
                    </td>

                    <td>
                        {new Date(
                        orden.fecha
                        ).toLocaleDateString(
                        "es-CL"
                        )}
                    </td>

                    <td>
                        {money(
                        orden.total
                        )}
                    </td>

                    <td>
                        <span className="badge text-bg-secondary">
                        {orden.estado}
                        </span>
                    </td>

                    <td>
                        <div className="d-flex flex-wrap gap-1">

                        <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={() =>
                            cambiarEstado(
                                orden.id,
                                "CONFIRMADO"
                            )
                            }
                        >
                            Aceptar
                        </button>

                        <button
                            type="button"
                            className="btn btn-sm btn-outline-success"
                            onClick={() =>
                            cambiarEstado(
                                orden.id,
                                "PREPARADO"
                            )
                            }
                        >
                            Preparado
                        </button>

                        <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() =>
                            cambiarEstado(
                                orden.id,
                                "CANCELADO"
                            )
                            }
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
        </>
        ) : (
        <p className="text-secondary">
            No hay pedidos registrados todavía.
        </p>
        )}

    </section>
    );
}

export default AdminPedidos;