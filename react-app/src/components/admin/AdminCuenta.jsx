import { guardarOrdenes } from "../../data/tienda";

function AdminCuenta({
  productos,
  ordenes,
  setOrdenes,
  setMensaje
}) {
  const limpiarHistorial = () => {
    const confirmar = window.confirm(
      "¿Borrar el historial local de pedidos?"
    );

    if (!confirmar) {
      return;
    }

    setOrdenes([]);
    guardarOrdenes([]);

    setMensaje(
      "Historial local eliminado."
    );
  };

  return (
    <section className="admin-panel">

      <h2>
        Cuenta y ajustes
      </h2>

      <p>
        Esta versión corresponde a una
        demostración frontend offline.
        Los cambios se guardan en el
        almacenamiento local de este navegador.
      </p>

      <p>
        <strong>
          Productos:
        </strong>{" "}
        {productos.length} registrados
      </p>

      <p>
        <strong>
          Pedidos:
        </strong>{" "}
        {ordenes.length} registrados
      </p>

      <button
        className="btn btn-outline-danger"
        type="button"
        onClick={limpiarHistorial}
      >
        Limpiar historial de pedidos
      </button>

    </section>
  );
}

export default AdminCuenta;