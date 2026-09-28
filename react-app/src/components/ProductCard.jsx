function ProductCard({ producto, agregarAlCarrito }) {
  return (
    <div>
      <img
        src={producto.imagen}
        alt={producto.nombre}
        width="200"
      />

      <h3>{producto.nombre}</h3>

      <p>{producto.categoria}</p>

      <p>${producto.precio}</p>

      <button onClick={() => agregarAlCarrito(producto)}>
        Agregar al carrito
      </button>
    </div>
  );
}

export default ProductCard;