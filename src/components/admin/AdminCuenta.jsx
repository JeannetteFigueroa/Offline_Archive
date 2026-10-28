/**
 * AdminCuenta.jsx
 *
 * Pestaña de Cuenta y Ajustes del panel de administración.
 * Muestra información del estado offline de la tienda y permite
 * reiniciar o limpiar el historial local de pedidos.
 */

import { guardarOrdenes } from "../../data/tienda";

function AdminCuenta({ productos, ordenes, setOrdenes, setMensaje }) {
  const limpiarHistorial = () => {
    if (window.confirm("¿Borrar el historial local de pedidos?")) {
      setOrdenes([]);
      guardarOrdenes([]);
      setMensaje("Historial local eliminado.");
    }
  };

  return (
    <section className="admin-panel">
      <h2>Cuenta y ajustes</h2>

      <p>
        Esta versión corresponde a una demostración frontend offline.
        Los cambios se guardan en el almacenamiento local de este navegador.
      </p>

      <p>
        <strong>Productos:</strong> {productos.length} registrados
      </p>

      <p>
        <strong>Pedidos:</strong> {ordenes.length} registrados
      </p>

      <button className="btn btn-outline-danger" onClick={limpiarHistorial}>
        Limpiar historial de pedidos
      </button>
    </section>
  );
}

export default AdminCuenta;
