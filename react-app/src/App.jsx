import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import Navbar from "./components/Navbar";
import productos from "./data/productos";

import Home from "./pages/Home";
import Productos from "./pages/Productos";
import Carrito from "./pages/Carrito";

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

  const cantidadTotal = carrito.reduce((total, producto) => {
    return total + producto.cantidad;
  }, 0);

  const totalCarrito = carrito.reduce((total, producto) => {
    return total + producto.precio * producto.cantidad;
  }, 0);

  return (
    <BrowserRouter>
      <Navbar
        nombreTienda="0ffline"
        cantidadCarrito={cantidadTotal}
      />

      <Routes>
        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/productos"
          element={
            <Productos
              productos={productos}
              agregarAlCarrito={agregarAlCarrito}
            />
          }
        />

        <Route
          path="/carrito"
          element={
            <Carrito
              carrito={carrito}
              eliminarDelCarrito={eliminarDelCarrito}
              aumentarCantidad={aumentarCantidad}
              disminuirCantidad={disminuirCantidad}
              cantidadTotal={cantidadTotal}
              totalCarrito={totalCarrito}
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;