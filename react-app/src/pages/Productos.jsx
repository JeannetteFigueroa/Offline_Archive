import ProductCard from "../components/ProductCard";

function Productos({ productos, agregarAlCarrito }) {
  return (
    <main>
      <h1>Productos</h1>

      {productos.map((producto) => (
        <ProductCard
          key={producto.id}
          producto={producto}
          agregarAlCarrito={agregarAlCarrito}
        />
      ))}
    </main>
  );
}

export default Productos;