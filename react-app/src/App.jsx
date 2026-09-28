import { useEffect, useState } from "react";
import CartItem from "./components/CartItem";

import Navbar from "./components/Navbar";
import ProductCard from "./components/ProductCard";
import productos from "./data/productos";

function App() {
  const [carrito, setCarrito] = useState(() => {
    const carritoGuardado = localStorage.getItem("carrito");

    return carritoGuardado
      ? JSON.parse(carritoGuardado)
      : [];
  });

  useEffect(() => {
    localStorage.setItem(
      "carrito",
      JSON.stringify(carrito)
    );
  }, [carrito]);

  const agregarAlCarrito = (producto) => {
    const productoExiste = carrito.find(
      (item) => item.id === producto.id
    );

    if (productoExiste) {
      const carritoActualizado = carrito.map((item) =>
        item.id === producto.id
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      );

      setCarrito(carritoActualizado);
    } else {
      setCarrito([
        ...carrito,
        {
          ...producto,
          cantidad: 1
        }
      ]);
    }
  };
  const eliminarDelCarrito = (id) => {
    const nuevoCarrito = carrito.filter(
      (producto) => producto.id !== id
    );

    setCarrito(nuevoCarrito);
  };

  const aumentarCantidad = (id) => {
    const carritoActualizado = carrito.map((producto) =>
      producto.id === id
        ? { ...producto, cantidad: producto.cantidad + 1 }
        : producto
    );

    setCarrito(carritoActualizado);
  };

  const disminuirCantidad = (id) => {
    const carritoActualizado = carrito
      .map((producto) =>
        producto.id === id
          ? { ...producto, cantidad: producto.cantidad - 1 }
          : producto
      )
      .filter((producto) => producto.cantidad > 0);

    setCarrito(carritoActualizado);
  };

  const totalCarrito = carrito.reduce((total, producto) => {
    return total + producto.precio * producto.cantidad;
  }, 0);

  const cantidadTotal = carrito.reduce((total, producto) => {
    return total + producto.cantidad;
  }, 0);

  return (
    <div>
      <Navbar
        nombreTienda="0ffline"
        cantidadCarrito={cantidadTotal}
      />

      <h1>Productos destacados</h1>

      {productos.map((producto) => (
        <ProductCard
          key={producto.id}
          producto={producto}
          agregarAlCarrito={agregarAlCarrito}
        />
      ))}

      <h2>Carrito temporal</h2>

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

          <h3>
            Total: ${totalCarrito.toLocaleString("es-CL")}
          </h3>
        </div>
      )}
    </div>
  );
}

export default App;