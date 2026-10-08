import { useEffect, useState } from "react";
import DetalleProducto from "./pages/DetalleProducto";
import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import Colecciones from "./pages/Colecciones";

import Navbar from "./components/Navbar";
import productos from "./data/productos";

import Home from "./pages/Home";
import Productos from "./pages/Productos";
import Carrito from "./pages/Carrito";
import SobreNosotros from "./pages/SobreNosotros";

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

      if (productoExiste.cantidad >= producto.stock) {
        return;
      }

      const carritoActualizado = carrito.map((item) =>
        item.id === producto.id
          ? {
              ...item,
              cantidad: item.cantidad + 1
            }
          : item
      );

      setCarrito(carritoActualizado);

    } else {

      if (producto.stock <= 0) {
        return;
      }

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
      producto.id === id &&
      producto.cantidad < producto.stock
        ? {
            ...producto,
            cantidad: producto.cantidad + 1
          }
        : producto
    );

    setCarrito(carritoActualizado);
  };

  const disminuirCantidad = (id) => {
    const carritoActualizado = carrito.map((producto) =>
      producto.id === id &&
      producto.cantidad > 1
        ? {
            ...producto,
            cantidad: producto.cantidad - 1
          }
        : producto
    );

    setCarrito(carritoActualizado);
  };

  const vaciarCarrito = () => {
    setCarrito([]);
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
        cantidadCarrito={cantidadTotal}
      />

      <Routes>
        <Route
          path="/"
          element={<Home />}

        
        />

        <Route
          path="/productos/:id"
          element={
            <DetalleProducto
              productos={productos}
              carrito={carrito}
              agregarAlCarrito={agregarAlCarrito}
            />
          }
        />

        <Route
          path="/colecciones"
          element={<Colecciones />}
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
              vaciarCarrito={vaciarCarrito}
              cantidadTotal={cantidadTotal}
              totalCarrito={totalCarrito}
            />
          }
        />
        <Route
          path="/SobreNosotros"
          element={<SobreNosotros />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;