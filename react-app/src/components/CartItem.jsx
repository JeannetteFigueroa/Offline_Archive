function CartItem({
  producto,
  eliminarDelCarrito,
  aumentarCantidad,
  disminuirCantidad
}) {
  return (
    <div>
      <h4>{producto.nombre}</h4>

      <p>
        Precio: ${producto.precio.toLocaleString("es-CL")}
      </p>

      <div>
        <button onClick={() => disminuirCantidad(producto.id)}>
          -
        </button>

        <span>
          {producto.cantidad}
        </span>

        <button onClick={() => aumentarCantidad(producto.id)}>
          +
        </button>
      </div>

      <p>
        Subtotal: $
        {(producto.precio * producto.cantidad).toLocaleString("es-CL")}
      </p>

      <button onClick={() => eliminarDelCarrito(producto.id)}>
        Eliminar
      </button>
    </div>
  );
}

export default CartItem;