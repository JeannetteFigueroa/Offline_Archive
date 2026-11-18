/**
 * Admin.jsx
 *
 * Página orquestadora del Panel de Administración (Off)line Archive.
 * Su código está parcelado en componentes modulares e independientes ubicados
 * en `src/components/admin/`:
 *   - AdminHeader: Título, botones de vista previa y cerrar sesión.
 *   - AdminNav: Barra de pestañas (Dashboard, Inventario, Categorías, Stock, Pedidos, Cuenta).
 *   - AdminDashboard: Métricas comerciales conectadas a PostgreSQL con fallback local.
 *   - AdminInventario: Tabla de inventario, visibilidad, edición (regla 5%) y creación con persistencia REST en PostgreSQL.
 *   - AdminCategorias: Gestión de categorías dinámicas conectadas a PostgreSQL.
 *   - AdminStock: Ingreso rápido de unidades por producto sincronizado con PostgreSQL.
 *   - AdminPedidos: Listado y actualización de estados de compras sincronizados con PostgreSQL.
 *   - AdminCuenta: Ajustes y resumen del sistema en PostgreSQL.
 */
import { useEffect, useState, useCallback } from "react";
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

// Persistencia, API y autenticación
import {
  leerOrdenes,
  guardarOrdenes,
  leerCategorias,
  CATEGORIAS_INICIALES
} from "../data/tienda";
import { clearSession } from "../utils/auth";
import adminService from "../services/adminService";
import "../styles/admin.css";

/* ─── Utilidades auxiliares ─────────────────────────────────────────────────── */

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

function cargarOrdenesIniciales() {
  return leerOrdenes() || [];
}

/* ─── Componente Principal Admin ─────────────────────────────────────────────── */

function Admin({ productos, setProductos }) {
  const location = useLocation();
  const navigate = useNavigate();

  // Sección activa según la ruta actual (/admin/inventario -> /inventario)
  const seccion = location.pathname.replace("/admin", "") || "/";

  // Estados globales de administración sincronizados con PostgreSQL
  const [categorias, setCategorias] = useState(() => leerCategorias());
  const [ordenes, setOrdenes] = useState(() => cargarOrdenesIniciales());
  const [metricasDb, setMetricasDb] = useState(null);
  const [mensaje, setMensaje] = useState("");

  // Recargar productos desde el backend PostgreSQL
  const recargarProductos = useCallback(async () => {
    try {
      const lista = await adminService.getAllProductosAdmin();
      if (Array.isArray(lista)) {
        const normalizados = lista.map((p) => ({
          id: p.codigo || String(p.id),
          backendId: p.id,
          codigo: p.codigo,
          nombre: p.nombre,
          categoria: p.categoriaSlug || (p.categoria && p.categoria.slug) || "tops",
          categoriaLabel: p.categoriaNombre || (p.categoria && p.categoria.nombre) || "Tops",
          precio: p.precio,
          precioOferta: p.precioOferta || null,
          stock: p.stock,
          imagen: p.imagenUrl || "",
          descripcion: p.descripcion || "",
          oculto: p.visible === false
        }));
        setProductos(normalizados);
      }
    } catch {
      // Conserva productos actuales si la API no responde
    }
  }, [setProductos]);

  // Recargar categorías desde el backend PostgreSQL
  const recargarCategorias = useCallback(async () => {
    try {
      const lista = await adminService.getCategorias();
      if (Array.isArray(lista)) {
        const mapeadas = lista.map((c) => ({
          id: c.slug,
          slug: c.slug,
          label: c.nombre,
          nombre: c.nombre,
          backendId: c.id,
          esSistema: c.esSistema
        }));
        setCategorias(mapeadas);
      }
    } catch {
      setCategorias(CATEGORIAS_INICIALES);
    }
  }, []);

  // Recargar pedidos reales desde PostgreSQL
  const recargarPedidos = useCallback(async () => {
    try {
      const lista = await adminService.getPedidosAdmin();
      if (Array.isArray(lista)) {
        const normalizados = lista.map((p) => ({
          id: p.numeroPedido || String(p.id),
          backendId: p.id,
          numeroPedido: p.numeroPedido,
          fecha: p.fecha,
          clienteNombre: p.clienteNombre,
          clienteCorreo: p.clienteCorreo,
          total: p.total,
          subtotal: p.subtotal,
          costoEnvio: p.costoEnvio,
          estado: p.estadoCodigo,
          estadoCodigo: p.estadoCodigo,
          estadoNombre: p.estadoNombre,
          detalles: p.detalles || [],
          demo: false
        }));
        setOrdenes(normalizados);
      }
    } catch {
      // Conserva órdenes actuales
    }
  }, []);

  // Recargar métricas del dashboard desde PostgreSQL
  const recargarDashboard = useCallback(async () => {
    try {
      const stats = await adminService.getDashboard();
      if (stats) {
        setMetricasDb(stats);
      }
    } catch {
      // Permite cálculo en fallback
    }
  }, []);

  // Efecto para asegurar que el fondo del body coincida con el admin mientras esté montado
  useEffect(() => {
    const prevBg = document.body.style.backgroundColor;
    const prevColor = document.body.style.color;
    document.body.style.backgroundColor = "#f7f7f5";
    document.body.style.color = "#171717";
    return () => {
      document.body.style.backgroundColor = prevBg;
      document.body.style.color = prevColor;
    };
  }, []);

  // Carga inicial sincronizada con backend
  useEffect(() => {
    recargarCategorias();
    recargarPedidos();
    recargarDashboard();
    recargarProductos();
  }, [recargarCategorias, recargarPedidos, recargarDashboard, recargarProductos]);

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
   * Si está conectado al backend, persiste en PostgreSQL.
   */
  const alternarVisibilidad = async (id) => {
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

    try {
      const backendId = prod?.backendId || (typeof prod?.id === "number" ? prod.id : null);
      if (backendId) {
        await adminService.actualizarProducto(backendId, {
          nombre: prod.nombre,
          precio: prod.precio,
          precioOferta: prod.precioOferta,
          categoriaSlug: prod.categoria,
          visible: !nuevoEstado
        });
      }
    } catch {
      // Si la API falla, ya se actualizó localmente
    }
  };

  /**
   * Actualiza el estado de preparación de un pedido en el backend PostgreSQL.
   */
  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      const pedidoObj = ordenes.find((o) => o.backendId === id || o.id === id);
      const idParaApi = pedidoObj?.backendId || (typeof id === "number" ? id : null);

      if (idParaApi) {
        await adminService.actualizarEstadoPedido(idParaApi, nuevoEstado);
        await recargarPedidos();
        await recargarDashboard();
        await recargarProductos();
      } else {
        const actualizadas = ordenes.map((orden) =>
          orden.id === id ? { ...orden, estado: nuevoEstado, estadoCodigo: nuevoEstado } : orden
        );
        setOrdenes(actualizadas);
        guardarOrdenes(actualizadas);
      }
    } catch {
      const actualizadas = ordenes.map((orden) =>
        orden.id === id ? { ...orden, estado: nuevoEstado, estadoCodigo: nuevoEstado } : orden
      );
      setOrdenes(actualizadas);
      guardarOrdenes(actualizadas);
    }

    setMensaje(`Pedido ${id}: ${nuevoEstado.toLowerCase()}.`);
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
        <AdminDashboard
          productos={productos}
          ordenes={ordenes}
          metricasDb={metricasDb}
        />
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
          recargarProductos={recargarProductos}
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
          recargarCategorias={recargarCategorias}
        />
      )}

      {/* 4. Pestaña Ingresar Stock (/stock) */}
      {seccion === "/stock" && (
        <AdminStock
          productos={productos}
          setProductos={setProductos}
          setMensaje={setMensaje}
          recargarProductos={recargarProductos}
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
          metricasDb={metricasDb}
          setMensaje={setMensaje}
        />
      )}
    </main>
  );
}

export default Admin;
