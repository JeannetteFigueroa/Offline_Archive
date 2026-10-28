import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import {
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  leerOrdenes,
  guardarOrdenes,
  ORDERS_KEY
} from "../data/tienda";

import { clearSession } from "../utils/auth";
import { leerCategorias, guardarCategorias, crearCategoria, eliminarCategoria } from "../data/tienda";
import "../styles/admin.css";

const money = (n) =>
  `$${Number(n || 0).toLocaleString("es-CL")}`;

const initialForm = {
  codigo: "",
  nombre: "",
  categoria: "tops",
  categoriaLabel: "Tops",
  precio: "",
  stock: "",
  imagen: "",
  descripcion: "",
  enOferta: false,
  precioOferta: "",
  descuento: ""
};

const initialEditForm = {
  nombre: "",
  precio: "",
  precioVenta: "",
  descuento: "",
  categoria: "tops",
  descripcion: "",
  imagen: ""
};

function obtenerCategoriaLabel(categoria) {
  const categorias = {
    tops: "Tops",
    bottoms: "Bottoms",
    accesorios: "Accesorios",
    outerwear: "Outerwear",
  };

  return categorias[categoria] || categoria;
}

function productoTieneOferta(producto) {
  const precioNormal =
    Number(producto.precio || 0);

  const precioOferta =
    Number(producto.precioOferta || 0);

  return (
    precioOferta > 0 &&
    precioOferta < precioNormal
  );
}

function obtenerDescuentoProducto(producto) {
  if (!productoTieneOferta(producto)) {
    return 0;
  }

  const precioNormal =
    Number(producto.precio);

  const precioOferta =
    Number(producto.precioOferta);

  return Math.round(
    (1 - precioOferta / precioNormal) * 100
  );
}

/* PEDIDOS DEMO */

function crearPedidosDemo(productos) {
  const porId = (id) =>
    productos.find(
      (producto) => producto.id === id
    ) || productos[0];

  const muestras = [
    {
      meses: 5,
      cliente: "Camila Rojas",
      correo: "camila.demo@gmail.com",
      items: [
        [1, 3],
        [4, 1]
      ]
    },
    {
      meses: 4,
      cliente: "Matías Soto",
      correo: "matias.demo@gmail.com",
      items: [
        [3, 2],
        [5, 1]
      ]
    },
    {
      meses: 3,
      cliente: "Antonia Díaz",
      correo: "antonia.demo@gmail.com",
      items: [[2, 4]]
    },
    {
      meses: 2,
      cliente: "Lucas Pérez",
      correo: "lucas.demo@gmail.com",
      items: [
        [7, 1],
        [8, 1]
      ]
    },
    { meses: 1,
      cliente: "Fernanda Silva",
      correo: "fernanda.demo@gmail.com",
      items: [[1, 3],
      [4, 2]]
    },
    { meses: 0,
      cliente: "Javiera Muñoz", 
      correo: "javiera.demo@gmail.com", 
      items: [[1, 2], 
      [4, 1]] },
    {
      meses: 2,
      cliente: "Tomás Reyes",
      correo: "tomas.demo@gmail.com",
      items: [
        [4, 3],
        [6, 2]
      ]
    },
    {
      meses: 0,
      cliente: "Valentina León",
      correo: "valentina.demo@gmail.com",
      items: [
        [4, 2],
        [3, 1]
      ]
    }
  ];

  return muestras.map(
    (muestra, index) => {
      const fecha = new Date();

      fecha.setMonth(
        fecha.getMonth() -
          muestra.meses
      );

      fecha.setDate(
        Math.min(
          25,
          2 + index * 3
        )
      );

      const lineas =
        muestra.items.map(
          ([id, cantidad]) => {
            const producto =
              porId(id);

            return {
              ...producto,
              cantidad
            };
          }
        );

      const subtotal =
        lineas.reduce(
          (sum, producto) => {
            const precio =
              productoTieneOferta(
                producto
              )
                ? Number(
                    producto.precioOferta
                  )
                : Number(
                    producto.precio
                  );

            return (
              sum +
              precio *
                producto.cantidad
            );
          },
          0
        );

      return {
        id: `DEMO-${String(
          index + 1
        ).padStart(3, "0")}`,

        fecha:
          fecha.toISOString(),

        cuentaEmail:
          muestra.correo,

        cliente: {
          nombre:
            muestra.cliente,

          correo:
            muestra.correo,

          telefono:
            "900000000",

          region:
            "Metropolitana de Santiago",

          comuna:
            "Santiago",

          direccion:
            "Dirección de demostración"
        },

        metodoPago:
          "DEMO",

        productos:
          lineas,

        subtotal,

        envio:
          3990,

        total:
          subtotal + 3990,

        estado:
          index % 3 === 0
            ? "PENDIENTE"
            : index % 3 === 1
              ? "CONFIRMADO"
              : "PAGADA",

        demo:
          true
      };
    }
  );
}

function cargarOrdenesIniciales(productos) {
  const yaExiste =
    localStorage.getItem(
      ORDERS_KEY
    );

  if (yaExiste !== null) {
    return leerOrdenes();
  }

  const demo =
    crearPedidosDemo(productos);

  guardarOrdenes(demo);

  return demo;
}

/* ADMIN*/

function Admin({
  productos,
  setProductos
}) {
  const location = useLocation();
  const navigate = useNavigate();

  // Estado de categorías dinámicas leídas desde localStorage
  const [categorias, setCategorias] = useState(() => leerCategorias());
  const [nuevaCatNombre, setNuevaCatNombre] = useState("");
  const [nuevaCatSlug, setNuevaCatSlug] = useState("");

  /**
   * Cierra la sesión activa del administrador (limpia localStorage y sessionStorage)
   * y redirige a la pantalla de login.
   */
  const cerrarSesionAdmin = () => {
    clearSession();
    navigate("/login");
  };

  /**
   * Alterna la visibilidad de un producto entre visible y oculto.
   * Los productos ocultos no se muestran en el catálogo público (/productos).
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
   * Manejador para el formulario de creación de una nueva categoría.
   * Valida nombre, genera el slug normalizado y evita duplicados.
   */
  const handleCrearCategoria = (e) => {
    e.preventDefault();
    if (!nuevaCatNombre.trim()) {
      setMensaje("Ingresa un nombre para la categoría.");
      return;
    }
    const slug = (nuevaCatSlug.trim() || nuevaCatNombre.trim())
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-");

    if (categorias.some((c) => c.id === slug)) {
      setMensaje(`La categoría "${slug}" ya existe.`);
      return;
    }

    const actualizadas = crearCategoria(categorias, { id: slug, label: nuevaCatNombre.trim() });
    setCategorias(actualizadas);
    setNuevaCatNombre("");
    setNuevaCatSlug("");
    setMensaje(`Categoría "${nuevaCatNombre.trim()}" creada correctamente.`);
  };

  const [mostrarAgregar, setMostrarAgregar] = 
    useState(false);
  
  const [ordenes, setOrdenes] =
    useState(() =>
      cargarOrdenesIniciales(
        productos
      )
    );

  const [form, setForm] =
    useState(initialForm);

  const [mensaje, setMensaje] =
    useState("");

  const [stockId, setStockId] =
    useState("");

  const [
    cantidadStock,
    setCantidadStock
  ] = useState("");

  const [busqueda, setBusqueda] =
    useState("");

  /* PRODUCTO EN EDICIÓN */
  const [
    editandoId,
    setEditandoId
  ] = useState(null);

  const [
    editForm,
    setEditForm
  ] = useState(
    initialEditForm
  );

  const seccion =
    location.pathname.replace(
      "/admin",
      ""
    ) || "/";

  /* ESTADÍSTICAS*/

  const ventas =
    useMemo(() => {
      const map = {};

      ordenes.forEach(
        (orden) =>
          (
            orden.productos || []
          ).forEach(
            (producto) => {
              map[
                producto.nombre
              ] =
                (
                  map[
                    producto.nombre
                  ] || 0
                ) +
                Number(
                  producto.cantidad ||
                    0
                );
            }
          )
      );

      return Object.entries(map)
        .sort(
          (a, b) =>
            b[1] - a[1]
        )
        .slice(0, 5);
    }, [ordenes]);

  const ventasTotales =
    ordenes.reduce(
      (sum, orden) =>
        sum +
        Number(
          orden.total || 0
        ),
      0
    );

  const pedidosPendientes =
    ordenes.filter(
      (orden) =>
        orden.estado ===
          "PAGADA" ||
        orden.estado ===
          "PENDIENTE"
    ).length;

  const maxVentas =
    Math.max(
      1,
      ...ventas.map(
        (venta) => venta[1]
      )
    );

  /* CREAR PRODUCTO*/

    const cambiarPrecioOfertaCreacion = (value) => {
    const precioNormal = Number(form.precio);
    const precioOferta = Number(value);
    let descuento = "";

    if (precioNormal > 0 && precioOferta > 0 && precioOferta < precioNormal) {
      const pct = Math.round((1 - precioOferta / precioNormal) * 100);
      if (pct >= 5) {
        descuento = String(pct);
      }
    }

    setForm((anterior) => ({
      ...anterior,
      precioOferta: value,
      descuento
    }));
  };

  const cambiarDescuentoCreacion = (value) => {
    const precioNormal = Number(form.precio);
    const porcentaje = Number(value);

    if (value === "") {
      setForm((anterior) => ({
        ...anterior,
        descuento: "",
        precioOferta: ""
      }));
      return;
    }

    if (porcentaje < 0 || porcentaje > 90) {
      return;
    }

    const precioCalculado = Math.round(
      precioNormal * (1 - porcentaje / 100)
    );

    setForm((anterior) => ({
      ...anterior,
      descuento: value,
      precioOferta: String(precioCalculado)
    }));
  };

  const manejarImagen = (e) => {
    const archivo = e.target.files[0];

    if (!archivo) {
      return;
    }

    if (!archivo.type.startsWith("image/")) {
      setMensaje("Selecciona un archivo de imagen válido.");
      return;
    }

    if (archivo.size > 1024 * 1024) {
      setMensaje("La imagen no puede superar 1 MB.");
      return;
    }

    const lector = new FileReader();

    lector.onloadend = () => {
      setForm((actual) => ({
        ...actual,
        imagen: lector.result
      }));
    };

    lector.readAsDataURL(archivo);
  };

  const manejarImagenEdicion = (e) => {
    const archivo = e.target.files[0];

    if (!archivo) {
      return;
    }

    if (!archivo.type.startsWith("image/")) {
      setMensaje("Selecciona un archivo de imagen válido.");
      return;
    }

    if (archivo.size > 1024 * 1024) {
      setMensaje("La imagen no puede superar 1 MB.");
      return;
    }

    const lector = new FileReader();

    lector.onloadend = () => {
      setEditForm((actual) => ({
        ...actual,
        imagen: lector.result
      }));
    };

    lector.readAsDataURL(archivo);
  };

  const guardar = (e) => {
    e.preventDefault();

    const codigoIngresado = form.codigo.trim().toUpperCase();

    // Validar campos obligatorios
    if (
      !codigoIngresado ||
      !form.nombre.trim() ||
      Number(form.precio) <= 0 ||
      Number(form.stock) < 0 ||
      !form.imagen
    ) {
      setMensaje(
        "Completa el código, nombre, precio, stock e imagen del producto."
      );
      return;
    }

    // Revisar si el código ya existe
    const codigoRepetido = productos.some(
      (producto) =>
        producto.codigo.trim().toUpperCase() === codigoIngresado
    );

    if (codigoRepetido) {
      setMensaje(`El código ${codigoIngresado} ya está registrado.`);
      return;
    }

    const precioBase = Number(form.precio);
    let precioOfertaFinal = null;
    let descuentoFinal = 0;

    if (form.enOferta) {
      const pOferta = Number(form.precioOferta);
      if (!pOferta || pOferta <= 0) {
        setMensaje("Ingresa un precio de oferta válido mayor a cero.");
        return;
      }
      if (pOferta >= precioBase) {
        setMensaje("El precio de oferta debe ser menor al precio normal.");
        return;
      }
      const pctDescuento = Math.round((1 - pOferta / precioBase) * 100);
      if (pctDescuento < 5) {
        setMensaje(
          `Para activar la oferta manual, el descuento debe ser de al menos 5% (actual: ${pctDescuento}%).`
        );
        return;
      }
      precioOfertaFinal = pOferta;
      descuentoFinal = pctDescuento;
    }

    const nuevo = {
      ...form,
      id: Date.now(),
      codigo: codigoIngresado,
      precio: precioBase,
      stock: Number(form.stock),
      precioOferta: precioOfertaFinal,
      descuento: descuentoFinal
    };

    setProductos((actuales) => crearProducto(actuales, nuevo));
    setForm(initialForm);
    setMostrarAgregar(false);
    setMensaje(
      form.enOferta
        ? `Producto agregado con éxito en oferta (${descuentoFinal}% de descuento).`
        : "Producto agregado correctamente."
    );
  };

  /* EDITAR PRODUCTO / OFERTAS*/

  const iniciarEdicion = (
    producto
  ) => {
    const precioNormal =
      Number(
        producto.precio || 0
      );

    const precioVenta =
      productoTieneOferta(
        producto
      )
        ? Number(
            producto.precioOferta
          )
        : precioNormal;

    const descuento =
      obtenerDescuentoProducto(
        producto
      );

    setEditandoId(
      producto.id
    );

    setEditForm({
      nombre:
        producto.nombre || "",

      precio:
        String(
          precioNormal
        ),

      precioVenta:
        String(
          precioVenta
        ),

      descuento:
        descuento > 0
          ? String(descuento)
          : "",

      categoria:
        producto.categoria ||
        "tops",

      descripcion:
        producto.descripcion ||
        "",

      imagen: 
        producto.imagen || 
        ""
    });

    setMensaje("");
  };

  const cancelarEdicion = () => {
    setEditandoId(null);

    setEditForm(
      initialEditForm
    );
  };

  /*
    Cuando se cambia manualmente el precio de venta,
    calculamos automáticamente el porcentaje.
  */
  const cambiarPrecioVenta = (value) => {
    const precioNormal = Number(editForm.precio);
    const precioVenta = Number(value);
    let descuento = "";

    if (precioNormal > 0 && precioVenta > 0 && precioVenta < precioNormal) {
      const pctCalculado = Math.round(
        (1 - precioVenta / precioNormal) * 100
      );
      // REGLA DEL 5%: Solo si baja al menos un 5% se calcula y activa la oferta
      if (pctCalculado >= 5) {
        descuento = String(pctCalculado);
      }
    }

    setEditForm((anterior) => ({
      ...anterior,
      precioVenta: value,
      descuento
    }));
  };

  /*
    Cuando se escribe un porcentaje,
    calculamos automáticamente el precio rebajado.
  */
  const cambiarDescuento = (
    value
  ) => {
    const precioNormal =
      Number(
        editForm.precio
      );

    const porcentaje =
      Number(value);

    if (value === "") {
      setEditForm(
        (anterior) => ({
          ...anterior,

          descuento:
            "",

          precioVenta:
            anterior.precio
        })
      );

      return;
    }

    if (
      porcentaje < 0 ||
      porcentaje > 90
    ) {
      return;
    }

    const precioOferta =
      Math.round(
        precioNormal *
          (
            1 -
            porcentaje / 100
          )
      );

    setEditForm(
      (anterior) => ({
        ...anterior,

        descuento:
          value,

        precioVenta:
          String(
            precioOferta
          )
      })
    );
  };

  const quitarOferta = () => {
    setEditForm(
      (anterior) => ({
        ...anterior,

        descuento:
          "",

        precioVenta:
          anterior.precio
      })
    );
  };

  const guardarEdicion = (e) => {
    e.preventDefault();

    const precioNormal = Number(editForm.precio);
    const precioVenta = Number(editForm.precioVenta);

    if (!editForm.nombre.trim()) {
      setMensaje("El nombre del producto es obligatorio.");
      return;
    }

    if (precioNormal <= 0) {
      setMensaje("El precio normal debe ser mayor a cero.");
      return;
    }

    if (precioVenta <= 0) {
      setMensaje("El precio de venta debe ser mayor a cero.");
      return;
    }

    /*
      Regla del 5%: A partir de que baje un 5% el precio original se hace la oferta de manera automática.
      Si la rebaja es menor al 5%, no califica como oferta.
    */
    const pctCalculado =
      precioNormal > 0 && precioVenta < precioNormal
        ? Math.round((1 - precioVenta / precioNormal) * 100)
        : 0;

    const esOferta = precioVenta < precioNormal && pctCalculado >= 5;
    const descuento = esOferta ? pctCalculado : 0;

    setProductos((actuales) =>
      actualizarProducto(actuales, editandoId, {
        nombre: editForm.nombre.trim(),
        precio: precioNormal,
        precioOferta: esOferta ? precioVenta : null,
        descuento,
        categoria: editForm.categoria,
        categoriaLabel: obtenerCategoriaLabel(editForm.categoria),
        descripcion: editForm.descripcion.trim(),
        imagen: editForm.imagen
      })
    );

    setMensaje(
      esOferta
        ? `Producto actualizado con ${descuento}% de descuento en oferta.`
        : (precioVenta < precioNormal)
        ? `Producto actualizado. La rebaja (${pctCalculado}%) es inferior al 5% requerido para oferta.`
        : "Producto actualizado correctamente."
    );

    cancelarEdicion();
  };

  /* STOCK*/

  const actualizarStock = (
    e
  ) => {
    e.preventDefault();

    const cantidad =
      Number(
        cantidadStock
      );

    if (
      !stockId ||
      !Number.isInteger(
        cantidad
      ) ||
      cantidad <= 0
    ) {
      setMensaje(
        "Selecciona un producto e ingresa una cantidad entera mayor que cero."
      );

      return;
    }

    setProductos(
      (actuales) =>
        actualizarProducto(
          actuales,
          Number(stockId),
          {
            stock:
              (
                actuales.find(
                  (producto) =>
                    producto.id ===
                    Number(
                      stockId
                    )
                )?.stock || 0
              ) +
              cantidad
          }
        )
    );

    setCantidadStock("");

    setMensaje(
      "Ingreso de stock registrado."
    );
  };

  /* PEDIDOS*/

  const cambiarEstado = (
    id,
    estado
  ) => {
    const actualizadas =
      ordenes.map(
        (orden) =>
          orden.id === id
            ? {
                ...orden,
                estado
              }
            : orden
      );

    setOrdenes(
      actualizadas
    );

    guardarOrdenes(
      actualizadas
    );

    setMensaje(
      `Pedido ${id}: ${estado.toLowerCase()}.`
    );
  };

  const productosFiltrados =
    productos.filter(
      (producto) =>
        `${producto.nombre} ${producto.codigo}`
          .toLowerCase()
          .includes(
            busqueda.toLowerCase()
          )
    );

  /* INTERFAZ*/

  return (
    <main className="admin-page container-fluid py-4 px-3 px-md-5">

      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-end gap-3 mb-4">

        <div>
          <p className="admin-eyebrow mb-2">
            OFF(LINE) ARCHIVE / CONTROL
          </p>

          <h1 className="admin-title mb-1">
            PANEL ADMINISTRATIVO.
          </h1>

          <p className="text-secondary mb-0">
            Gestión local de inventario,
            pedidos y estadísticas de la tienda.
          </p>

          <span className="badge text-bg-warning mt-2">
            Incluye pedidos ficticios de demostración
          </span>
        </div>

        <div className="d-flex flex-wrap gap-2">
          <Link
            className="btn btn-outline-dark"
            to="/"
            title="Ver la tienda desde la perspectiva de un cliente"
          >
            Visualizar tienda como usuario 👁️
          </Link>

          <button
            type="button"
            className="btn btn-outline-danger"
            onClick={cerrarSesionAdmin}
          >
            Cerrar sesión ✕
          </button>
        </div>

      </div>

      {/* MENU ADMIN */}
      <nav className="admin-nav nav nav-pills flex-wrap gap-2 mb-4">

        <Link
          className={`nav-link ${
            seccion === "/"
              ? "active"
              : ""
          }`}
          to="/admin"
        >
          Dashboard
        </Link>

        <Link
          className={`nav-link ${
            seccion ===
            "/inventario"
              ? "active"
              : ""
          }`}
          to="/admin/inventario"
        >
          Inventario
        </Link>

        <Link
          className={`nav-link ${
            seccion ===
            "/categorias"
              ? "active"
              : ""
          }`}
          to="/admin/categorias"
        >
          Categorías
        </Link>

        <Link
          className={`nav-link ${
            seccion === "/stock"
              ? "active"
              : ""
          }`}
          to="/admin/stock"
        >
          Ingresar stock
        </Link>

        <Link
          className={`nav-link ${
            seccion ===
            "/pedidos"
              ? "active"
              : ""
          }`}
          to="/admin/pedidos"
        >
          Confirmar pedidos
        </Link>

        <Link
          className={`nav-link ${
            seccion === "/cuenta"
              ? "active"
              : ""
          }`}
          to="/admin/cuenta"
        >
          Cuenta/ajustes
        </Link>

      </nav>

      {mensaje && (
        <div
          className="alert alert-info alert-dismissible"
          role="status"
        >
          {mensaje}

          <button
            className="btn-close"
            aria-label="Cerrar"
            onClick={() =>
              setMensaje("")
            }
          />
        </div>
      )}

      {/* DASHBOARD*/}

      {seccion === "/" && (
        <>
          <div className="row g-3 mb-4">

            {[
              [
                "Productos registrados",
                productos.length
              ],

              [
                "Pedidos registrados",
                ordenes.length
              ],

              [
                "Pedidos por preparar",
                pedidosPendientes
              ],

              [
                "Ventas simuladas",
                money(
                  ventasTotales
                )
              ]
            ].map(
              ([label, value]) => (
                <div
                  className="col-12 col-sm-6 col-xl-3"
                  key={label}
                >
                  <div className="admin-stat h-100">

                    <span>
                      {label}
                    </span>

                    <strong>
                      {value}
                    </strong>

                  </div>
                </div>
              )
            )}

          </div>

          <div className="row g-4">

            <div className="col-12 col-lg-7">

              <section className="admin-panel h-100">

                <div className="d-flex justify-content-between align-items-center mb-3">

                  <h2>
                    Productos más vendidos
                  </h2>

                  <span className="badge text-bg-secondary">
                    Por unidades
                  </span>

                </div>

                {ventas.length ? (
                  ventas.map(
                    ([
                      nombre,
                      cantidad
                    ]) => (
                      <div
                        className="chart-row"
                        key={nombre}
                      >

                        <div className="d-flex justify-content-between gap-3">

                          <span>
                            {nombre}
                          </span>

                          <strong>
                            {cantidad}
                          </strong>

                        </div>

                        <div className="progress mt-2">

                          <div
                            className="progress-bar"
                            role="progressbar"
                            style={{
                              width:
                                `${
                                  (
                                    cantidad /
                                    maxVentas
                                  ) *
                                  100
                                }%`
                            }}
                            aria-valuenow={
                              cantidad
                            }
                            aria-valuemin="0"
                            aria-valuemax={
                              maxVentas
                            }
                          />

                        </div>
                      </div>
                    )
                  )
                ) : (
                  <p className="text-secondary">
                    Todavía no hay ventas registradas.
                  </p>
                )}

              </section>

            </div>

            <div className="col-12 col-lg-5">

              <section className="admin-panel h-100">

                <h2>
                  Temporadas de compra
                </h2>

                <p className="text-secondary small">
                  Conteo de pedidos por mes de compra.
                </p>

                {Object.entries(
                  ordenes.reduce(
                    (acc, orden) => {
                      const fecha =
                        new Date(
                          orden.fecha
                        );

                      const mes =
                        Number.isNaN(
                          fecha.getTime()
                        )
                          ? "Sin fecha"
                          : fecha.toLocaleDateString(
                              "es-CL",
                              {
                                month:
                                  "long",
                                year:
                                  "numeric"
                              }
                            );

                      acc[mes] =
                        (
                          acc[mes] ||
                          0
                        ) + 1;

                      return acc;
                    },
                    {}
                  )
                ).map(
                  ([
                    mes,
                    cantidad
                  ]) => (
                    <div
                      className="d-flex justify-content-between border-bottom py-2"
                      key={mes}
                    >

                      <span className="text-capitalize">
                        {mes}
                      </span>

                      <strong>
                        {cantidad} pedido(s)
                      </strong>

                    </div>
                  )
                )}

              </section>

            </div>

          </div>

          <div className="admin-shortcuts mt-4">

            <Link to="/admin/inventario">
              ＋ Administrar inventario
            </Link>

            <Link to="/admin/stock">
              ＋ Ingresar stock
            </Link>

            <Link to="/admin/pedidos">
              ✓ Revisar pedidos
            </Link>

          </div>
        </>
      )}

      {/* INVENTARIO*/}

      {seccion === "/inventario" && (
        <section className="admin-panel">

          <h2>
            Inventario de productos
          </h2>

          <div className="row g-2 my-3">

            <div className="col-12 col-md-6">

              <input
                className="form-control"
                placeholder="Buscar por nombre o código"
                value={busqueda}
                onChange={(e) =>
                  setBusqueda(
                    e.target.value
                  )
                }
                aria-label="Buscar producto"
              />

            </div>

          </div>

          {/* EDITAR PRODUCTO */}

          {editandoId !== null && (
            <form
              className="row g-3 border border-warning rounded p-3 mb-4"
              onSubmit={
                guardarEdicion
              }
            >

              <div className="col-12">

                <h3 className="h5">
                  Editar producto
                </h3>

                <p className="text-secondary small mb-0">
                  Si el precio de venta es menor al precio normal,
                  el producto se mostrará automáticamente como oferta.
                </p>

              </div>

              <div className="col-12 col-md-6">

                <label className="form-label">
                  Nombre
                </label>

                <input
                  className="form-control"
                  value={
                    editForm.nombre
                  }
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,

                      nombre:
                        e.target.value
                    })
                  }
                  required
                />

              </div>

              <div className="col-12 col-md-3">

                <label className="form-label">
                  Precio normal
                </label>

                <input
                  className="form-control"
                  type="number"
                  min="1"
                  value={
                    editForm.precio
                  }
                  onChange={(e) => {
                    const precio =
                      e.target.value;

                    setEditForm(
                      (
                        anterior
                      ) => ({
                        ...anterior,

                        precio
                      })
                    );
                  }}
                  required
                />

              </div>

              <div className="col-12 col-md-3">

                <label className="form-label">
                  Precio de venta
                </label>

                <input
                  className="form-control"
                  type="number"
                  min="1"
                  value={
                    editForm.precioVenta
                  }
                  onChange={(e) =>
                    cambiarPrecioVenta(
                      e.target.value
                    )
                  }
                  required
                />

              </div>

              <div className="col-12 col-md-3">

                <label className="form-label">
                  Descuento %
                </label>

                <input
                  className="form-control"
                  type="number"
                  min="0"
                  max="90"
                  value={
                    editForm.descuento
                  }
                  onChange={(e) =>
                    cambiarDescuento(
                      e.target.value
                    )
                  }
                  placeholder="Ej: 20"
                />

              </div>

              <div className="col-12 col-md-4">

                <label className="form-label">
                  Categoría
                </label>

                <select
                  className="form-select"
                  value={editForm.categoria}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      categoria: e.target.value
                    })
                  }
                >
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>

              </div>

              <div className="col-12 col-md-5">

                <label className="form-label">
                  Descripción
                </label>

                <input
                  className="form-control"
                  value={
                    editForm.descripcion
                  }
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,

                      descripcion:
                        e.target.value
                    })
                  }
                />

              </div>

              <div className="col-12">

                {Number(editForm.precioVenta) > 0 &&
                  Number(editForm.precioVenta) < Number(editForm.precio) && (() => {
                    const pct = Math.round(
                      (1 - Number(editForm.precioVenta) / Number(editForm.precio)) * 100
                    );
                    return pct >= 5 ? (
                      <div className="alert alert-success py-2">
                        Oferta automática activa: <strong>{pct}% de descuento</strong>
                        {" — "}
                        {money(editForm.precioVenta)}
                      </div>
                    ) : (
                      <div className="alert alert-warning py-2">
                        ℹ️ Rebaja del {pct}% ({money(editForm.precioVenta)}):
                        No califica como oferta automática (se requiere un descuento mínimo del 5%).
                      </div>
                    );
                  })()}

              </div>

              <div className="col-12 d-flex flex-wrap gap-2">

                <button
                  className="btn btn-dark"
                  type="submit"
                >
                  Guardar cambios
                </button>

                <button
                  className="btn btn-outline-warning"
                  type="button"
                  onClick={
                    quitarOferta
                  }
                >
                  Quitar oferta
                </button>

                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={
                    cancelarEdicion
                  }
                >
                  Cancelar
                </button>

              </div>

            </form>
          )}

          {/* AGREGAR PRODUCTO */}

          <div className="d-flex justify-content-between align-items-center my-3">
            <h3 className="h5 mb-0">
              Gestión de productos
            </h3>

            <button
              type="button"
              className={
                mostrarAgregar
                  ? "btn btn-outline-secondary"
                  : "btn btn-dark"
              }
              onClick={() =>
                setMostrarAgregar(!mostrarAgregar)
              }
            >
              {mostrarAgregar
                ? "✕ Cerrar formulario"
                : "+ Agregar producto"}
            </button>
          </div>

          {mostrarAgregar && (
            <form
              className="row g-2 border rounded p-3 mb-4"
              onSubmit={guardar}
            >
              <h3 className="h5">
                Agregar nuevo producto
              </h3>

              <div className="col-12 col-md-3">
                <label className="form-label">
                  Código
                </label>

                <input
                  className="form-control"
                  value={form.codigo}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      codigo: e.target.value
                    })
                  }
                  required
                />
              </div>

              <div className="col-12 col-md-5">
                <label className="form-label">
                  Nombre
                </label>

                <input
                  className="form-control"
                  value={form.nombre}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      nombre: e.target.value
                    })
                  }
                  required
                />
              </div>

              <div className="col-6 col-md-2">
                <label className="form-label">
                  Precio CLP
                </label>

                <input
                  className="form-control"
                  type="number"
                  min="1"
                  value={form.precio}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      precio: e.target.value
                    })
                  }
                  required
                />
              </div>

              <div className="col-6 col-md-2">
                <label className="form-label">
                  Stock inicial
                </label>

                <input
                  className="form-control"
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      stock: e.target.value
                    })
                  }
                  required
                />
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label">
                  Categoría
                </label>

                <select
                  className="form-select"
                  value={form.categoria}
                  onChange={(e) => {
                    const categoria = e.target.value;
                    const catObj = categorias.find((c) => c.id === categoria);
                    setForm({
                      ...form,
                      categoria,
                      categoriaLabel: catObj ? catObj.label : obtenerCategoriaLabel(categoria)
                    });
                  }}
                >
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-12 col-md-8">
                <label className="form-label">
                  Descripción
                </label>

                <input
                  className="form-control"
                  value={form.descripcion}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      descripcion: e.target.value
                    })
                  }
                />
              </div>

              {/* OPCIÓN DE OFERTA MANUAL EN CREACIÓN */}
              <div className="col-12 col-md-4">
                <label className="form-label">
                  ¿Poner en oferta? (Manual)
                </label>

                <select
                  className="form-select"
                  value={form.enOferta ? "si" : "no"}
                  onChange={(e) => {
                    const activar = e.target.value === "si";
                    setForm((anterior) => ({
                      ...anterior,
                      enOferta: activar,
                      precioOferta: activar && anterior.precio
                        ? String(Math.round(Number(anterior.precio) * 0.9))
                        : "",
                      descuento: activar ? "10" : ""
                    }));
                  }}
                >
                  <option value="no">No (Precio regular)</option>
                  <option value="si">Sí (Agregar oferta manual)</option>
                </select>
              </div>

              {form.enOferta && (
                <>
                  <div className="col-6 col-md-4">
                    <label className="form-label">
                      Precio de Oferta CLP
                    </label>

                    <input
                      className="form-control"
                      type="number"
                      min="1"
                      placeholder="Ej: 19000"
                      value={form.precioOferta}
                      onChange={(e) =>
                        cambiarPrecioOfertaCreacion(e.target.value)
                      }
                      required={form.enOferta}
                    />
                  </div>

                  <div className="col-6 col-md-4">
                    <label className="form-label">
                      Descuento % (Mínimo 5%)
                    </label>

                    <input
                      className="form-control"
                      type="number"
                      min="5"
                      max="90"
                      placeholder="Ej: 15"
                      value={form.descuento}
                      onChange={(e) =>
                        cambiarDescuentoCreacion(e.target.value)
                      }
                    />
                  </div>

                  {form.precio && form.precioOferta && (
                    <div className="col-12">
                      {Number(form.precioOferta) < Number(form.precio) ? (
                        Math.round(
                          (1 -
                            Number(form.precioOferta) /
                              Number(form.precio)) *
                            100
                        ) >= 5 ? (
                          <div className="alert alert-success py-2 mb-0">
                            ✓ Oferta manual válida:{" "}
                            <strong>
                              {Math.round(
                                (1 -
                                  Number(form.precioOferta) /
                                    Number(form.precio)) *
                                  100
                              )}
                              % de descuento
                            </strong>{" "}
                            ({money(form.precioOferta)})
                          </div>
                        ) : (
                          <div className="alert alert-warning py-2 mb-0">
                            ⚠️ Rebaja menor al 5% (
                            {Math.round(
                              (1 -
                                Number(form.precioOferta) /
                                  Number(form.precio)) *
                                100
                            )}
                            %). Debe tener al menos 5% de descuento para considerarse oferta.
                          </div>
                        )
                      ) : (
                        <div className="alert alert-danger py-2 mb-0">
                          El precio de oferta debe ser menor al precio normal ($
                          {Number(form.precio).toLocaleString("es-CL")}).
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              <div className="col-12">
                <label
                  htmlFor="imagenProducto"
                  className="form-label"
                >
                  Imagen del producto
                </label>

                <input
                  id="imagenProducto"
                  className="form-control"
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={manejarImagen}
                  required
                />

                <small className="text-secondary">
                  PNG, JPG o WEBP. Máximo 1 MB.
                </small>

                {form.imagen && (
                  <div className="mt-3">
                    <p className="mb-2">
                      Vista previa:
                    </p>

                    <img
                      src={form.imagen}
                      alt="Vista previa del producto"
                      style={{
                        width: "160px",
                        height: "160px",
                        objectFit: "cover",
                        borderRadius: "8px"
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="col-12">
                <button
                  className="btn btn-dark"
                  type="submit"
                >
                  Guardar producto
                </button>
              </div>
            </form>
          )}

          {/* TABLA */}

          <div className="table-responsive">

            <table className="table table-hover align-middle">

              <thead>
                <tr>
                  <th>
                    Imagen
                  </th>

                  <th>
                    Código
                  </th>

                  <th>
                    Producto
                  </th>

                  <th>
                    Precio normal
                  </th>

                  <th>
                    Precio actual
                  </th>

                  <th>
                    Oferta
                  </th>

                  <th>
                    Stock
                  </th>

                  <th>
                    Estado
                  </th>

                  <th>
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody>

                {productosFiltrados.map(
                  (producto) => {

                    const oferta =
                      productoTieneOferta(
                        producto
                      );

                    const descuento =
                      obtenerDescuentoProducto(
                        producto
                      );

                    return (
                      <tr
                        key={
                          producto.id
                        }
                      >
                        <td>
                          <img
                            src={producto.imagen}
                            alt={producto.nombre}
                            style={{
                              width: "55px",
                              height: "55px",
                              objectFit: "cover",
                              borderRadius: "6px"
                            }}
                          />
                        </td>

                        <td>
                          {producto.codigo}
                        </td>

                        <td>
                          {producto.nombre}
                        </td>

                        <td>
                          {money(
                            producto.precio
                          )}
                        </td>

                        <td>
                          {money(
                            oferta
                              ? producto.precioOferta
                              : producto.precio
                          )}
                        </td>

                        <td>
                          {oferta ? (
                            <span className="badge text-bg-danger">
                              -{descuento}%
                            </span>
                          ) : (
                            <span className="badge text-bg-secondary">
                              Sin oferta
                            </span>
                          )}
                        </td>

                        <td>
                          <span
                            className={`badge ${
                              producto.stock <=
                              3
                                ? "text-bg-danger"
                                : "text-bg-success"
                            }`}
                          >
                            {producto.stock}
                          </span>
                        </td>

                        <td>
                          {producto.oculto ? (
                            <span className="badge text-bg-warning">Oculto</span>
                          ) : (
                            <span className="badge text-bg-success">Visible</span>
                          )}
                        </td>

                        <td>

                          <div className="d-flex flex-wrap gap-2">

                            <button
                              type="button"
                              className={`btn btn-sm ${producto.oculto ? "btn-outline-success" : "btn-outline-secondary"}`}
                              onClick={() => alternarVisibilidad(producto.id)}
                              title={producto.oculto ? "Hacer visible en la tienda" : "Ocultar de la tienda"}
                            >
                              {producto.oculto ? "Mostrar 👁️" : "Ocultar 🚫"}
                            </button>

                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() =>
                                iniciarEdicion(
                                  producto
                                )
                              }
                            >
                              Editar
                            </button>

                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => {

                                setProductos(
                                  (
                                    actuales
                                  ) =>
                                    eliminarProducto(
                                      actuales,
                                      producto.id
                                    )
                                );

                                setMensaje(
                                  "Producto eliminado del catálogo."
                                );
                              }}
                            >
                              Eliminar
                            </button>

                          </div>

                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>

        </section>
      )}

      {/* STOCK*/}

      
      {/* GESTIÓN DE CATEGORÍAS */}
      {seccion === "/categorias" && (
        <section className="admin-panel mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="mb-0">Gestión de Categorías</h2>
          </div>

          <form className="row g-2 border rounded p-3 mb-4 bg-light" onSubmit={handleCrearCategoria}>
            <h3 className="h6 mb-2">Crear nueva categoría</h3>
            <div className="col-12 col-md-5">
              <label className="form-label">Nombre de la categoría</label>
              <input
                className="form-control"
                placeholder="Ej: Calzado, Hoodies, Joyería"
                value={nuevaCatNombre}
                onChange={(e) => {
                  setNuevaCatNombre(e.target.value);
                  setNuevaCatSlug(
                    e.target.value
                      .toLowerCase()
                      .normalize("NFD")
                      .replace(/[\u0300-\u036f]/g, "")
                      .replace(/\s+/g, "-")
                  );
                }}
                required
              />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label">Código / Identificador (slug)</label>
              <input
                className="form-control"
                placeholder="ej: calzado"
                value={nuevaCatSlug}
                onChange={(e) => setNuevaCatSlug(e.target.value)}
                required
              />
            </div>
            <div className="col-12 col-md-3 d-flex align-items-end">
              <button className="btn btn-dark w-100" type="submit">
                + Crear categoría
              </button>
            </div>
          </form>

          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nombre</th>
                  <th>Productos asociados</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {/* Categoría especial promocional del sistema: Ofertas */}
                <tr className="table-light">
                  <td><code>ofertas</code></td>
                  <td>
                    <strong>Ofertas</strong>{" "}
                    <span className="badge text-bg-warning ms-1">Filtro Promocional</span>
                  </td>
                  <td>
                    <span className="badge text-bg-success">
                      {productos.filter(productoTieneOferta).length} en oferta activa
                    </span>
                  </td>
                  <td>
                    <span className="text-muted small">
                      Colección automática (regla ≥ 5% de rebaja)
                    </span>
                  </td>
                </tr>

                {categorias.map((cat) => {
                  const cantProductos = productos.filter((p) => p.categoria === cat.id).length;
                  const esBase = ["tops", "bottoms", "accesorios", "outerwear"].includes(cat.id);
                  return (
                    <tr key={cat.id}>
                      <td><code>{cat.id}</code></td>
                      <td><strong>{cat.label}</strong></td>
                      <td>
                        <span className="badge text-bg-primary">{cantProductos} productos</span>
                      </td>
                      <td>
                        {esBase ? (
                          <span className="text-muted small">Categoría del sistema</span>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            disabled={cantProductos > 0}
                            title={cantProductos > 0 ? "No puedes eliminar una categoría con productos asignados" : "Eliminar categoría"}
                            onClick={() => {
                              const act = eliminarCategoria(categorias, cat.id);
                              setCategorias(act);
                              setMensaje(`Categoría "${cat.label}" eliminada.`);
                            }}
                          >
                            Eliminar
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {seccion === "/stock" && (
        <section className="admin-panel">

          <h2>
            Ingreso de stock
          </h2>

          <p className="text-secondary">
            El ingreso se suma al stock disponible
            del producto seleccionado.
          </p>

          <form
            className="row g-3 align-items-end"
            onSubmit={
              actualizarStock
            }
          >

            <div className="col-12 col-md-7">

              <label className="form-label">
                Producto
              </label>

              <select
                className="form-select"
                value={
                  stockId
                }
                onChange={(e) =>
                  setStockId(
                    e.target.value
                  )
                }
                required
              >

                <option value="">
                  Selecciona un producto
                </option>

                {productos.map(
                  (producto) => (
                    <option
                      key={
                        producto.id
                      }
                      value={
                        producto.id
                      }
                    >
                      {producto.nombre}
                      {" — stock actual: "}
                      {producto.stock}
                    </option>
                  )
                )}

              </select>

            </div>

            <div className="col-12 col-md-3">

              <label className="form-label">
                Unidades recibidas
              </label>

              <input
                className="form-control"
                type="number"
                min="1"
                step="1"
                value={
                  cantidadStock
                }
                onChange={(e) =>
                  setCantidadStock(
                    e.target.value
                  )
                }
                required
              />

            </div>

            <div className="col-12 col-md-2">

              <button className="btn btn-dark w-100">
                Ingresar
              </button>

            </div>

          </form>

        </section>
      )}

      {/* PEDIDOS*/}

      {seccion === "/pedidos" && (
        <section className="admin-panel">

          <h2>
            Confirmación y preparación de pedidos
          </h2>

          {ordenes.length ? (
            <div className="table-responsive">

              <table className="table align-middle">

                <thead>
                  <tr>
                    <th>
                      Pedido
                    </th>

                    <th>
                      Cliente
                    </th>

                    <th>
                      Fecha
                    </th>

                    <th>
                      Total
                    </th>

                    <th>
                      Estado
                    </th>

                    <th>
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {ordenes.map(
                    (orden) => (
                      <tr
                        key={
                          orden.id
                        }
                      >

                        <td>
                          {orden.id}

                          {orden.demo && (
                            <>
                              <br />

                              <span className="badge text-bg-warning">
                                DEMO
                              </span>
                            </>
                          )}
                        </td>

                        <td>
                          {
                            orden.cliente
                              ?.nombre
                          }

                          <br />

                          <small>
                            {
                              orden.cliente
                                ?.correo
                            }
                          </small>
                        </td>

                        <td>
                          {new Date(
                            orden.fecha
                          ).toLocaleDateString(
                            "es-CL"
                          )}
                        </td>

                        <td>
                          {money(
                            orden.total
                          )}
                        </td>

                        <td>
                          <span className="badge text-bg-secondary">
                            {orden.estado}
                          </span>
                        </td>

                        <td>

                          <div className="d-flex flex-wrap gap-1">

                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() =>
                                cambiarEstado(
                                  orden.id,
                                  "CONFIRMADO"
                                )
                              }
                            >
                              Aceptar
                            </button>

                            <button
                              className="btn btn-sm btn-outline-success"
                              onClick={() =>
                                cambiarEstado(
                                  orden.id,
                                  "PREPARADO"
                                )
                              }
                            >
                              Preparado
                            </button>

                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() =>
                                cambiarEstado(
                                  orden.id,
                                  "CANCELADO"
                                )
                              }
                            >
                              Cancelar
                            </button>

                          </div>

                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>
          ) : (
            <p className="text-secondary">
              No hay pedidos registrados todavía.
            </p>
          )}

        </section>
      )}

      {/* CUENTA*/}

      {seccion === "/cuenta" && (
        <section className="admin-panel">

          <h2>
            Cuenta y ajustes
          </h2>

          <p>
            Esta versión corresponde a una
            demostración frontend offline.
            Los cambios se guardan en el
            almacenamiento local de este navegador.
          </p>

          <p>
            <strong>
              Productos:
            </strong>{" "}
            {productos.length} registrados
          </p>

          <p>
            <strong>
              Pedidos:
            </strong>{" "}
            {ordenes.length} registrados
          </p>

          <button
            className="btn btn-outline-danger"
            onClick={() => {
              if (
                window.confirm(
                  "¿Borrar el historial local de pedidos?"
                )
              ) {
                setOrdenes([]);

                guardarOrdenes(
                  []
                );

                setMensaje(
                  "Historial local eliminado."
                );
              }
            }}
          >
            Limpiar historial de pedidos
          </button>

        </section>
      )}

    </main>
  );
}

export default Admin;