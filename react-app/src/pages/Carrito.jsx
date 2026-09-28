import CartItem from "../components/CartItem";

function Carrito({
  carrito,
  eliminarDelCarrito,
  aumentarCantidad,
  disminuirCantidad,
  cantidadTotal,
  totalCarrito
}) {
  return (
    <main>
      <h1>Carrito de compras</h1>

      {carrito.length === 0 ? (
        <p>Tu carrito está vacío</p>
      ) : (
        <div>
          <p>Productos agregados: {cantidadTotal}</p>

          {carrito.map((producto) => (
            <CartItem
              key={producto.id}
              producto={producto}
              eliminarDelCarrito={eliminarDelCarrito}
              aumentarCantidad={aumentarCantidad}
              disminuirCantidad={disminuirCantidad}
            />
          ))}

          <h2>
            Total: ${totalCarrito.toLocaleString("es-CL")}
          </h2>
        </div>
      )}
    </main>
  );
}

export default Carrito;