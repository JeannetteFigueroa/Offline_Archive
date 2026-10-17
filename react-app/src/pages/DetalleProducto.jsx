import { useState } from "react";
import { Link, useParams } from "react-router-dom";

import "../styles/detalle-producto.css";

function DetalleProducto({
  productos,
  carrito,
  agregarAlCarrito
}) {
  const { id } = useParams();

  const [mensaje, setMensaje] = useState("");

  const producto = productos.find(
    (producto) => producto.id === Number(id)
  );

  if (!producto) {
    return (
      <>
        <main className="detail-page">

          <section className="product-not-found">

            <p>
              ERROR_404 / PRODUCT_NOT_FOUND
            </p>

            <h1>
              PRODUCTO NO ENCONTRADO.
            </h1>

            <Link to="/productos">
              VOLVER AL CATÁLOGO →
            </Link>

          </section>

        </main>

        <footer className="detail-footer">
          <span>
            (OFF)LINE ARCHIVE
          </span>

          <span>
            PRODUCT_SYSTEM / 2003
          </span>
        </footer>
      </>
    );
  }

  const productoEnCarrito = carrito.find(
    (item) => item.id === producto.id
  );

  const cantidadEnCarrito =
    productoEnCarrito?.cantidad || 0;

  const sinStock =
    cantidadEnCarrito >= producto.stock;

  const manejarAgregar = () => {
    if (sinStock) {
      setMensaje(
        "NO HAY MÁS STOCK DISPONIBLE."
      );

      return;
    }

    agregarAlCarrito(producto);

    setMensaje(
      `${producto.nombre.toUpperCase()} FUE AGREGADO AL CARRITO.`
    );
  };

  return (
    <>
      <main className="detail-page">

        <Link
          to="/productos"
          className="back-products"
        >
          ← VOLVER A PRODUCTOS
        </Link>

        <section className="product-detail">

          <div className="detail-image-container">

            <img
              src={producto.imagen}
              alt={producto.nombre}
            />

            <span>
              {producto.codigo}
            </span>

          </div>

          <div className="detail-information">

            <p className="detail-category">
              {producto.categoriaLabel}
            </p>

            <h1 className="detail-name">
              {producto.nombre}
            </h1>

            <p className="detail-description">
              {producto.descripcion}
            </p>

            <div className="detail-data">

              <div>
                <span>
                  PRECIO
                </span>

                <strong>
                  ${producto.precio.toLocaleString("es-CL")}
                </strong>
              </div>

              <div>
                <span>
                  DISPONIBILIDAD
                </span>

                <strong>
                  STOCK: {producto.stock}
                </strong>
              </div>

            </div>

            <button
              type="button"
              className="detail-add-button"
              onClick={manejarAgregar}
              disabled={sinStock}
            >
              {sinStock
                ? "SIN STOCK DISPONIBLE"
                : "AGREGAR AL CARRITO"}

              <span>
                +
              </span>
            </button>

            <p
              className="detail-message"
              role="status"
              aria-live="polite"
            >
              {mensaje}
            </p>

          </div>

        </section>

      </main>

      <footer className="detail-footer">

        <span>
          (OFF)LINE ARCHIVE
        </span>

        <span>
          PRODUCT_SYSTEM / 2003
        </span>

      </footer>
    </>
  );
}

export default DetalleProducto;