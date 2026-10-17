import { useEffect, useState } from "react";
import DetalleProducto from "./pages/DetalleProducto";
import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import Colecciones from "./pages/Colecciones";

import Navbar from "./components/Navbar";
import { leerProductos, guardarProductos } from "./data/tienda";
import Admin from "./pages/Admin";

import Home from "./pages/Home";
import Productos from "./pages/Productos";
import Carrito from "./pages/Carrito";
import Checkout from "./pages/Checkout";
import CompraExitosa from "./pages/CompraExitosa";
import PagoRechazado from "./pages/PagoRechazado";
import SobreNosotros from "./pages/SobreNosotros";
import Contacto from "./pages/Contacto";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import Cuenta from "./pages/Cuenta";

function App() {
  const [productosTienda, setProductosTienda] = useState(() => leerProductos());
  useEffect(() => { guardarProductos(productosTienda); }, [productosTienda]);
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

  const descontarStockCompra = (productosComprados) => {
    setProductosTienda((actuales) => actuales.map((producto) => {
      const comprado = productosComprados.find((item) => item.id === producto.id);
      return comprado
        ? { ...producto, stock: Math.max(0, producto.stock - comprado.cantidad) }
        : producto;
    }));
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
              productos={productosTienda}
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
              productos={productosTienda}
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
          path="/checkout"
          element={
            <Checkout
              carrito={carrito}
              totalCarrito={totalCarrito}
              vaciarCarrito={vaciarCarrito}
              descontarStockCompra={descontarStockCompra}
            />
          }
        />

        <Route
          path="/compra-exitosa"
          element={<CompraExitosa />}
        />

        <Route
          path="/pago-rechazado"
          element={<PagoRechazado />}
        />

        <Route
          path="/SobreNosotros"
          element={<SobreNosotros />}
        />
        <Route
          path="/contacto"
          element={<Contacto />}
        />
        <Route
          path="/login"
          element={<Login />}
        />
        <Route
          path="/registro"
          element={<Registro />}
        />
        <Route
          path="/cuenta"
          element={<Cuenta />}
        />
        <Route
          path="/admin/*"
          element={<Admin productos={productosTienda} setProductos={setProductosTienda} />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;