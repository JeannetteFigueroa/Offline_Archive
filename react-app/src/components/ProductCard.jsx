import { Link } from "react-router-dom";

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
            <strong className="product-price">
              ${producto.precio.toLocaleString("es-CL")}
            </strong>

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