import { Link } from "react-router-dom";
import { obtenerPrecioFinal, tieneOferta, calcularDescuento } from "../utils/precios";

function ProductCard({ producto, agregarAlCarrito }) {
  return (
    <article className="product-card">

      <div className="product-image">
        <img
          src={producto.imagen}
          alt={producto.nombre}
          loading="lazy"
        />

        <span className="product-code">
          {producto.codigo}
        </span>
        {tieneOferta(producto) && <span className="badge text-bg-danger position-absolute top-0 end-0 m-2">-{calcularDescuento(producto)}% OFERTA</span>}
      </div>

      <div className="product-content">

        <p className="product-category">
          {producto.categoriaLabel}
        </p>

        <h3 className="product-name">
          {producto.nombre}
        </h3>

        <p className="product-description">
          {producto.descripcion}
        </p>

        <div className="product-information">

          <div>
            <div className="d-flex flex-column align-items-start gap-1">
              {tieneOferta(producto) && <del className="text-secondary small">${producto.precio.toLocaleString("es-CL")}</del>}
              <strong className="product-price" style={tieneOferta(producto) ? { color: "#c62828" } : undefined}>
                ${obtenerPrecioFinal(producto).toLocaleString("es-CL")}
              </strong>
            </div>

            <span className="product-stock">
              STOCK: {producto.stock}
            </span>
          </div>

          <div className="product-actions">

            <Link
              to={`/productos/${producto.id}`}
              className="view-product"
            >
              VER DETALLE
            </Link>

            <button
              type="button"
              className="add-product"
              onClick={() => agregarAlCarrito(producto)}
            >
              AGREGAR
              <span>+</span>
            </button>

          </div>

        </div>

      </div>

    </article>
  );
}

export default ProductCard;