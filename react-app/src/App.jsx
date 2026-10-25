import { useEffect, useState } from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  useLocation
} from "react-router-dom";

import Navbar from "./components/Navbar";
import AdminRoute from "./components/AdminRoute";

import {
  leerProductos,
  guardarProductos
} from "./data/tienda";

import { obtenerPrecioFinal } from "./utils/precios";

import Home from "./pages/Home";
import Colecciones from "./pages/Colecciones";
import Productos from "./pages/Productos";
import DetalleProducto from "./pages/DetalleProducto";
import Carrito from "./pages/Carrito";
import Checkout from "./pages/Checkout";
import CompraExitosa from "./pages/CompraExitosa";
import PagoRechazado from "./pages/PagoRechazado";
import SobreNosotros from "./pages/SobreNosotros";
import Contacto from "./pages/Contacto";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import Cuenta from "./pages/Cuenta";
import Admin from "./pages/Admin";

function AppContent() {
  const location = useLocation();

  // Detecta si estamos dentro de cualquier página del administrador.
  const esPaginaAdmin =
    location.pathname.startsWith("/admin");

  // Catálogo general de productos.
  const [productosTienda, setProductosTienda] =
    useState(() => leerProductos());

  useEffect(() => {
    guardarProductos(productosTienda);
  }, [productosTienda]);

  // Carrito.
  const [carrito, setCarrito] = useState(() => {
    const carritoGuardado =
      localStorage.getItem("carrito");

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

  // Agregar producto al carrito.
  const agregarAlCarrito = (producto) => {
    const productoExiste = carrito.find(
      (item) => item.id === producto.id
    );

    if (productoExiste) {
      if (
        productoExiste.cantidad >=
        producto.stock
      ) {
        return;
      }

      const carritoActualizado =
        carrito.map((item) =>
          item.id === producto.id
            ? {
                ...item,
                cantidad:
                  item.cantidad + 1
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

  // Eliminar producto del carrito.
  const eliminarDelCarrito = (id) => {
    const nuevoCarrito =
      carrito.filter(
        (producto) =>
          producto.id !== id
      );

    setCarrito(nuevoCarrito);
  };

  // Aumentar cantidad.
  const aumentarCantidad = (id) => {
    const carritoActualizado =
      carrito.map((producto) =>
        producto.id === id &&
        producto.cantidad < producto.stock
          ? {
              ...producto,
              cantidad:
                producto.cantidad + 1
            }
          : producto
      );

    setCarrito(carritoActualizado);
  };

  // Disminuir cantidad.
  const disminuirCantidad = (id) => {
    const carritoActualizado =
      carrito.map((producto) =>
        producto.id === id &&
        producto.cantidad > 1
          ? {
              ...producto,
              cantidad:
                producto.cantidad - 1
            }
          : producto
      );

    setCarrito(carritoActualizado);
  };

  // Vaciar carrito.
  const vaciarCarrito = () => {
    setCarrito([]);
  };

  // Descontar stock después de una compra.
  const descontarStockCompra = (
    productosComprados
  ) => {
    setProductosTienda((actuales) =>
      actuales.map((producto) => {
        const comprado =
          productosComprados.find(
            (item) =>
              item.id === producto.id
          );

        return comprado
          ? {
              ...producto,

              stock: Math.max(
                0,
                producto.stock -
                  comprado.cantidad
              )
            }
          : producto;
      })
    );
  };

  // Cantidad total del carrito.
  const cantidadTotal =
    carrito.reduce(
      (total, producto) =>
        total + producto.cantidad,
      0
    );

  // Precio total respetando ofertas.
  const totalCarrito =
    carrito.reduce(
      (total, producto) =>
        total +
        obtenerPrecioFinal(producto) *
          producto.cantidad,
      0
    );

  return (
    <>
      {/* Navbar de la tienda.
          No se muestra dentro del administrador. */}
      {!esPaginaAdmin && (
        <Navbar
          cantidadCarrito={cantidadTotal}
        />
      )}

      <Routes>

        <Route
          path="/"
          element={<Home />}
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
              agregarAlCarrito={
                agregarAlCarrito
              }
            />
          }
        />

        <Route
          path="/productos/:id"
          element={
            <DetalleProducto
              productos={productosTienda}
              carrito={carrito}
              agregarAlCarrito={
                agregarAlCarrito
              }
            />
          }
        />

        <Route
          path="/carrito"
          element={
            <Carrito
              carrito={carrito}
              eliminarDelCarrito={
                eliminarDelCarrito
              }
              aumentarCantidad={
                aumentarCantidad
              }
              disminuirCantidad={
                disminuirCantidad
              }
              vaciarCarrito={
                vaciarCarrito
              }
              cantidadTotal={
                cantidadTotal
              }
              totalCarrito={
                totalCarrito
              }
            />
          }
        />

        <Route
          path="/checkout"
          element={
            <Checkout
              carrito={carrito}
              totalCarrito={
                totalCarrito
              }
              vaciarCarrito={
                vaciarCarrito
              }
              descontarStockCompra={
                descontarStockCompra
              }
            />
          }
        />

        <Route
          path="/compra-exitosa"
          element={
            <CompraExitosa />
          }
        />

        <Route
          path="/pago-rechazado"
          element={
            <PagoRechazado />
          }
        />

        <Route
          path="/SobreNosotros"
          element={
            <SobreNosotros />
          }
        />

        <Route
          path="/contacto"
          element={
            <Contacto />
          }
        />

        <Route
          path="/login"
          element={
            <Login />
          }
        />

        <Route
          path="/registro"
          element={
            <Registro />
          }
        />

        <Route
          path="/cuenta"
          element={
            <Cuenta />
          }
        />

        {/* ADMIN */}
        <Route
          path="/admin/*"
          element={
            <AdminRoute>
              <Admin
                productos={
                  productosTienda
                }
                setProductos={
                  setProductosTienda
                }
              />
            </AdminRoute>
          }
        />

      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;