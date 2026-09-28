import { useState } from "react";
import { Link } from "react-router-dom";

import CartItem from "../components/CartItem";
import "../styles/carrito.css";

function Carrito({
  carrito,
  eliminarDelCarrito,
  aumentarCantidad,
  disminuirCantidad,
  vaciarCarrito,
  cantidadTotal,
  totalCarrito
}) {
  const [mensaje, setMensaje] = useState("");

  const manejarAumentar = (producto) => {
    if (producto.cantidad >= producto.stock) {
      setMensaje(
        "NO HAY MÁS STOCK DISPONIBLE."
      );

      return;
    }

    aumentarCantidad(producto.id);

    setMensaje(
      "CANTIDAD ACTUALIZADA."
    );
  };

  const manejarDisminuir = (producto) => {
    if (producto.cantidad <= 1) {
      return;
    }

    disminuirCantidad(producto.id);

    setMensaje(
      "CANTIDAD ACTUALIZADA."
    );
  };

  const manejarEliminar = (id) => {
    eliminarDelCarrito(id);

    setMensaje(
      "PRODUCTO ELIMINADO DEL CARRITO."
    );
  };

  const manejarVaciar = () => {
    vaciarCarrito();

    setMensaje(
      "EL CARRITO FUE VACIADO."
    );
  };

  return (
    <>
      <main className="cart-page">

        <section className="cart-header">

          <div>

            <p className="cart-code">
              ORDER_SYSTEM / 001
            </p>

            <h1 className="cart-title">
              CARRITO.
            </h1>

            <p className="cart-description">
              Revisa las piezas seleccionadas antes de continuar.
            </p>

          </div>

          <p className="cart-quantity">

            <span>
              {cantidadTotal}
            </span>

            {" "}PRODUCTOS

          </p>

        </section>

        <section className="cart-layout">

          <div className="cart-products">

            <div className="cart-section-header">

              <span>
                PRODUCTOS_SELECCIONADOS
              </span>

              <span>
                STATUS: ACTIVE
              </span>

            </div>

            {carrito.length === 0 ? (

              <div className="empty-cart">

                <p className="empty-cart-code">
                  ERROR_404 / EMPTY_CART
                </p>

                <h2>
                  TU CARRITO ESTÁ VACÍO.
                </h2>

                <p>
                  Todavía no has seleccionado productos del archivo.
                </p>

                <Link to="/productos">
                  VER PRODUCTOS →
                </Link>

              </div>

            ) : (

              <div className="cart-items">

                {carrito.map((producto) => (
                  <CartItem
                    key={producto.id}
                    producto={producto}
                    eliminarDelCarrito={
                      manejarEliminar
                    }
                    aumentarCantidad={
                      manejarAumentar
                    }
                    disminuirCantidad={
                      manejarDisminuir
                    }
                  />
                ))}

              </div>

            )}

          </div>

          <aside className="cart-summary">

            <p className="summary-code">
              ORDER_SUMMARY / 001
            </p>

            <h2>
              RESUMEN
            </h2>

            <div className="summary-information">

              <div className="summary-row">

                <span>
                  Subtotal
                </span>

                <strong>
                  ${totalCarrito.toLocaleString("es-CL")}
                </strong>

              </div>

              <div className="summary-row">

                <span>
                  Envío
                </span>

                <strong>
                  Por calcular
                </strong>

              </div>

              <div className="summary-row summary-total">

                <span>
                  TOTAL
                </span>

                <strong>
                  ${totalCarrito.toLocaleString("es-CL")}
                </strong>

              </div>

            </div>

            <button
              type="button"
              className="checkout-button"
              disabled={carrito.length === 0}
            >
              CONTINUAR COMPRA
              <span>→</span>
            </button>

            <button
              type="button"
              className="empty-cart-button"
              disabled={carrito.length === 0}
              onClick={manejarVaciar}
            >
              VACIAR CARRITO
            </button>

            <p
              className="cart-message"
              role="status"
              aria-live="polite"
            >
              {mensaje}
            </p>

          </aside>

        </section>

      </main>

      <footer className="cart-footer">

        <span>
          (OFF)LINE ARCHIVE
        </span>

        <span>
          SECURE_ORDER_SYSTEM / 2003
        </span>

      </footer>
    </>
  );
}

export default Carrito;