function CartItem({
  producto,
  eliminarDelCarrito,
  aumentarCantidad,
  disminuirCantidad
}) {
  const subtotal =
    producto.precio * producto.cantidad;

  return (
    <article className="cart-item">

      <div className="cart-item-image">
        <img
          src={producto.imagen}
          alt={producto.nombre}
        />
      </div>

      <div className="cart-item-information">

        <p className="cart-item-code">
          {producto.codigo}
        </p>

        <h2 className="cart-item-name">
          {producto.nombre}
        </h2>

        <p className="cart-item-price">
          Precio unitario: $
          {producto.precio.toLocaleString("es-CL")}
        </p>

        <div className="quantity-controls">

          <button
            type="button"
            onClick={() =>
              disminuirCantidad(producto)
            }
            aria-label="Disminuir cantidad"
          >
            −
          </button>

          <span>
            {producto.cantidad}
          </span>

          <button
            type="button"
            onClick={() =>
              aumentarCantidad(producto)
            }
            aria-label="Aumentar cantidad"
          >
            +
          </button>

        </div>

        <button
          type="button"
          className="remove-product"
          onClick={() =>
            eliminarDelCarrito(producto.id)
          }
        >
          ELIMINAR
        </button>

      </div>

      <div className="cart-item-subtotal">

        <span>
          SUBTOTAL
        </span>

        <strong>
          ${subtotal.toLocaleString("es-CL")}
        </strong>

      </div>

    </article>
  );
}

export default CartItem;