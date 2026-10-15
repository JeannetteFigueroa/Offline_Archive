import { Link } from "react-router-dom";

import "../styles/resultado-compra.css";

// Recupera la última orden almacenada
// El try evita que la página falle si el dato está dañado
function obtenerUltimaOrden() {
  try {
    return JSON.parse(
      localStorage.getItem(
        "offlineArchiveLastOrder"
      ) || "null"
    );
  } catch {
    return null;
  }
}

function CompraExitosa() {
  const orden = obtenerUltimaOrden();

  // Esta vista aparece si no existe una compra guardada
  if (!orden) {
    return (
      <main className="result-page">
        <section className="result-card">
          <p className="result-code">
            ORDER_SYSTEM / NO_DATA
          </p>

          <h1 className="result-title">
            NO HAY UNA ORDEN RECIENTE.
          </h1>

          <p className="result-message">
            Todavía no se ha registrado una compra.
          </p>

          <div className="result-actions">
            <Link to="/productos">
              VER PRODUCTOS →
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="result-page">
      <section className="result-card result-success">
        <p className="result-code">
          PAYMENT_SYSTEM / SUCCESS
        </p>

        <div
          className="result-icon"
          aria-hidden="true"
        >
          ✓
        </div>

        <h1 className="result-title">
          COMPRA CONFIRMADA.
        </h1>

        <p className="result-message">
          Tu pedido fue registrado correctamente.
        </p>

        <div className="result-order">
          <div className="result-row">
            <span>Número de orden</span>
            <strong>{orden.id}</strong>
          </div>

          <div className="result-row">
            <span>Cliente</span>
            <strong>
              {orden.cliente.nombre}
            </strong>
          </div>

          <div className="result-row">
            <span>Correo</span>
            <strong>
              {orden.cliente.correo}
            </strong>
          </div>

          <div className="result-row">
            <span>Productos</span>
            <strong>
              {orden.productos.reduce(
                (total, producto) =>
                  total + producto.cantidad,
                0
              )}
            </strong>
          </div>

          <div className="result-row">
            <span>Método de pago</span>
            <strong>
              {orden.metodoPago}
            </strong>
          </div>

          <div className="result-row result-total">
            <span>Total pagado</span>
            <strong>
              ${orden.total.toLocaleString("es-CL")}
            </strong>
          </div>
        </div>

        <div className="result-actions">
          <Link to="/">
            VOLVER AL INICIO
          </Link>

          <Link to="/productos">
            SEGUIR COMPRANDO →
          </Link>
        </div>
      </section>
    </main>
  );
}

export default CompraExitosa;