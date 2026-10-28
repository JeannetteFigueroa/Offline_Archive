import { Link } from "react-router-dom";

import "../styles/resultado-compra.css";

function PagoRechazado() {
  return (
    <main className="result-page">
      <section className="result-card result-error">
        <p className="result-code">
          PAYMENT_SYSTEM / ERROR
        </p>

        <div
          className="result-icon"
          aria-hidden="true"
        >
          !
        </div>

        <h1 className="result-title">
          PAGO RECHAZADO.
        </h1>

        <p className="result-message">
          No fue posible completar el pago.
          Los productos continúan guardados en
          tu carrito para que puedas intentarlo
          nuevamente.
        </p>

        <div className="result-actions">
          <Link to="/carrito">
            VOLVER AL CARRITO
          </Link>

          <Link to="/checkout">
            REINTENTAR PAGO →
          </Link>
        </div>
      </section>
    </main>
  );
}

export default PagoRechazado;