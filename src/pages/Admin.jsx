/**
 * Admin.jsx
 *
 * Página orquestadora del Panel de Administración (Off)line Archive.
 * Su código está parcelado en componentes modulares e independientes ubicados
 * en `src/components/admin/`:
 *   - AdminHeader: Título, botones de vista previa y cerrar sesión.
 *   - AdminNav: Barra de pestañas (Dashboard, Inventario, Categorías, Stock, Pedidos, Cuenta).
 *   - AdminDashboard: Métricas comerciales, productos más vendidos y estacionalidad.
 *   - AdminInventario: Tabla de inventario, visibilidad, edición (regla 5%) y creación con oferta manual.
 *   - AdminCategorias: Gestión de categorías dinámicas y colección promocional de Ofertas.
 *   - AdminStock: Ingreso rápido de unidades por producto.
 *   - AdminPedidos: Listado y actualización de estados de compras.
 *   - AdminCuenta: Ajustes offline y reinicio de pedidos demo.
 */
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// Componentes modulares parcelados del panel
import AdminHeader from "../components/admin/AdminHeader";
import AdminNav from "../components/admin/AdminNav";
import AdminDashboard from "../components/admin/AdminDashboard";
import AdminInventario from "../components/admin/AdminInventario";
import AdminCategorias from "../components/admin/AdminCategorias";
import AdminStock from "../components/admin/AdminStock";
import AdminPedidos from "../components/admin/AdminPedidos";
import AdminCuenta from "../components/admin/AdminCuenta";

// Persistencia y autenticación
import {
  leerOrdenes,
  guardarOrdenes,
  ORDERS_KEY,
  leerCategorias
} from "../data/tienda";
import { clearSession } from "../utils/auth";
import "../styles/admin.css";

/* ─── Utilidades auxiliares ───────────────────────────────────────────────── */

function obtenerCategoriaLabel(categoria) {
  const categorias = {
    tops: "Tops",
    bottoms: "Bottoms",
    accesorios: "Accesorios",
    outerwear: "Outerwear"
  };
  return categorias[categoria] || categoria;
}

function productoTieneOferta(producto) {
  const precioNormal = Number(producto.precio || 0);
  const precioOferta = Number(producto.precioOferta || 0);
  return precioOferta > 0 && precioOferta < precioNormal;
}

function obtenerDescuentoProducto(producto) {
  if (!productoTieneOferta(producto)) return 0;
  return Math.round((1 - Number(producto.precioOferta) / Number(producto.precio)) * 100);
}

/* ─── Pedidos de Demostración ─────────────────────────────────────────────── */

function crearPedidosDemo(productos) {
  const porId = (id) => productos.find((p) => p.id === id) || productos[0];

  const muestras = [
    { meses: 5, cliente: "Camila Rojas", correo: "camila.demo@gmail.com", items: [[1, 3], [4, 1]] },
    { meses: 4, cliente: "Matías Soto", correo: "matias.demo@gmail.com", items: [[2, 2], [3, 1]] },
    { meses: 3, cliente: "Valentina Paz", correo: "valentina.demo@gmail.com", items: [[1, 1], [5, 2]] },
    { meses: 3, cliente: "Diego Morales", correo: "diego.demo@gmail.com", items: [[3, 3]] },
    { meses: 2, cliente: "Sofía Castro", correo: "sofia.demo@gmail.com", items: [[2, 1], [4, 2]] },
    { meses: 1, cliente: "Lucas Bravo", correo: "lucas.demo@gmail.com", items: [[1, 2], [2, 1], [3, 1]] },
    { meses: 1, cliente: "Fernanda Díaz", correo: "fernanda.demo@gmail.com", items: [[5, 1], [4, 1]] },
    { meses: 0, cliente: "Martín Vera", correo: "martin.demo@gmail.com", items: [[2, 2], [1, 1]] }
  ];

  return muestras.map((muestra, index) => {
    const fecha = new Date();
    fecha.setMonth(fecha.getMonth() - muestra.meses);
    fecha.setDate(Math.min(28, 2 + index * 3));

    const lineas = muestra.items.map(([id, cantidad]) => {
      const producto = porId(id);
      return { ...producto, cantidad };
    });

    const subtotal = lineas.reduce((sum, item) => {
      const precio = productoTieneOferta(item) ? Number(item.precioOferta) : Number(item.precio);
      return sum + precio * item.cantidad;
    }, 0);

    return {
      id: `DEMO-${String(index + 1).padStart(3, "0")}`,
      fecha: fecha.toISOString(),
      cuentaEmail: muestra.correo,
      cliente: {
        nombre: muestra.cliente,
        correo: muestra.correo,
        telefono: "900000000",
        region: "Metropolitana de Santiago",
        comuna: "Santiago",
        direccion: "Dirección de demostración"
      },
      metodoPago: "DEMO",
      productos: lineas,
      subtotal,
      envio: 3990,
      total: subtotal + 3990,
      estado: index % 3 === 0 ? "PENDIENTE" : index % 3 === 1 ? "CONFIRMADO" : "PAGADA",
      demo: true
    };
  });
}

function cargarOrdenesIniciales(productos) {
  const yaExiste = localStorage.getItem(ORDERS_KEY);
  if (yaExiste !== null) {
    return leerOrdenes();
  }
  const demo = crearPedidosDemo(productos);
  guardarOrdenes(demo);
  return demo;
}

/* ─── Componente Principal Admin ──────────────────────────────────────────── */

function Admin({ productos, setProductos }) {
  const location = useLocation();
  const navigate = useNavigate();

  // Sección activa según la ruta actual (/admin/inventario -> /inventario)
  const seccion = location.pathname.replace("/admin", "") || "/";

  // Estados globales de administración
  const [categorias, setCategorias] = useState(() => leerCategorias());
  const [ordenes, setOrdenes] = useState(() => cargarOrdenesIniciales(productos));
  const [mensaje, setMensaje] = useState("");

  /**
   * Cierra la sesión activa del administrador (limpia tokens de storage)
   * y redirige al inicio de sesión.
   */
  const cerrarSesionAdmin = () => {
    clearSession();
    navigate("/login");
  };

  /**
   * Alterna el estado de visibilidad de un producto entre visible y oculto.
   * Los productos ocultos no se muestran a los clientes en /productos.
   */
  const alternarVisibilidad = (id) => {
    const prod = productos.find((p) => p.id === id);
    const nuevoEstado = !prod?.oculto;
    setProductos((actuales) =>
      actuales.map((p) => (p.id === id ? { ...p, oculto: nuevoEstado } : p))
    );
    setMensaje(
      nuevoEstado
        ? `"${prod?.nombre || "Producto"}" ha sido ocultado de la tienda.`
        : `"${prod?.nombre || "Producto"}" ahora es visible en la tienda.`
    );
  };

  /**
   * Actualiza el estado de preparación de un pedido en el historial.
   */
  const cambiarEstado = (id, estado) => {
    const actualizadas = ordenes.map((orden) =>
      orden.id === id ? { ...orden, estado } : orden
    );
    setOrdenes(actualizadas);
    guardarOrdenes(actualizadas);
    setMensaje(`Pedido ${id}: ${estado.toLowerCase()}.`);
  };

  return (
    <main className="admin-page container-fluid py-4 px-3 px-md-5">
      {/* Encabezado con navegación a tienda y logout */}
      <AdminHeader cerrarSesionAdmin={cerrarSesionAdmin} />

      {/* Menú de pestañas */}
      <AdminNav seccion={seccion} />

      {/* Alerta de notificación flotante */}
      {mensaje && (
        <div className="alert alert-info alert-dismissible" role="status">
          {mensaje}
          <button
            className="btn-close"
            aria-label="Cerrar"
            onClick={() => setMensaje("")}
          />
        </div>
      )}

      {/* 1. Pestaña Dashboard (/) */}
      {seccion === "/" && (
        <AdminDashboard productos={productos} ordenes={ordenes} />
      )}

      {/* 2. Pestaña Inventario (/inventario) */}
      {seccion === "/inventario" && (
        <AdminInventario
          productos={productos}
          setProductos={setProductos}
          categorias={categorias}
          obtenerCategoriaLabel={obtenerCategoriaLabel}
          productoTieneOferta={productoTieneOferta}
          obtenerDescuentoProducto={obtenerDescuentoProducto}
          alternarVisibilidad={alternarVisibilidad}
          setMensaje={setMensaje}
        />
      )}

      {/* 3. Pestaña Categorías (/categorias) */}
      {seccion === "/categorias" && (
        <AdminCategorias
          categorias={categorias}
          setCategorias={setCategorias}
          productos={productos}
          productoTieneOferta={productoTieneOferta}
          setMensaje={setMensaje}
        />
      )}

      {/* 4. Pestaña Ingresar Stock (/stock) */}
      {seccion === "/stock" && (
        <AdminStock
          productos={productos}
          setProductos={setProductos}
          setMensaje={setMensaje}
        />
      )}

      {/* 5. Pestaña Confirmar Pedidos (/pedidos) */}
      {seccion === "/pedidos" && (
        <AdminPedidos ordenes={ordenes} cambiarEstado={cambiarEstado} />
      )}

      {/* 6. Pestaña Cuenta / Ajustes (/cuenta) */}
      {seccion === "/cuenta" && (
        <AdminCuenta
          productos={productos}
          ordenes={ordenes}
          setOrdenes={setOrdenes}
          setMensaje={setMensaje}
        />
      )}
    </main>
  );
}

export default Admin;