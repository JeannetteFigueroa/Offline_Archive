import AdminHeader from "../components/admin/AdminHeader";
import AdminNav from "../components/admin/AdminNav";
import AdminDashboard from "../components/admin/AdminDashboard";
import AdminInventario from "../components/admin/AdminInventario";
import AdminStock from "../components/admin/AdminStock";
import AdminPedidos from "../components/admin/AdminPedidos";
import AdminCuenta from "../components/admin/AdminCuenta";

import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

import {
  actualizarProducto,
  leerOrdenes,
  guardarOrdenes,
  ORDERS_KEY
} from "../data/tienda";

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
  descripcion: ""
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
  const location =
    useLocation();
  
  const [ordenes, setOrdenes] =
    useState(() =>
      cargarOrdenesIniciales(
        productos
      )
    );

  const [mensaje, setMensaje] =
    useState("");

  /* PRODUCTO EN EDICIÓN */


  const seccion =
    location.pathname.replace(
      "/admin",
      ""
    ) || "/";


  /* CREAR PRODUCTO*/

  const manejarImagen = (e) => {
    const archivo = e.target.files[0];

    if (!archivo) {
      return;
    }

    // Solo permite imágenes.
    if (!archivo.type.startsWith("image/")) {
      setMensaje(
        "Selecciona un archivo de imagen válido."
      );
      return;
    }

    // Máximo 1 MB para no llenar localStorage.
    if (archivo.size > 1024 * 1024) {
      setMensaje(
        "La imagen no puede superar 1 MB."
      );
      return;
    }

    const lector = new FileReader();

    lector.onloadend = () => {
      setForm((actual) => ({
        ...actual,
        imagen: lector.result
      }));
    };

    const manejarImagenEdicion = (e) => {
      const archivo = e.target.files[0];

      if (!archivo) {
        return;
      }

      if (!archivo.type.startsWith("image/")) {
        setMensaje(
          "Selecciona un archivo de imagen válido."
        );
        return;
      }

      if (archivo.size > 1024 * 1024) {
        setMensaje(
          "La imagen no puede superar 1 MB."
        );
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

    lector.readAsDataURL(archivo);
  };  

  const guardar = (e) => {
    e.preventDefault();

    const codigoIngresado =
      form.codigo.trim().toUpperCase();

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
    const codigoRepetido =
      productos.some(
        (producto) =>
          producto.codigo
            .trim()
            .toUpperCase() ===
          codigoIngresado
      );

    if (codigoRepetido) {
      setMensaje(
        `El código ${codigoIngresado} ya está registrado.`
      );

      return;
    }

    const nuevo = {
      ...form,

      id: Date.now(),

      codigo: codigoIngresado,

      precio:
        Number(form.precio),

      stock:
        Number(form.stock)
    };

    setProductos(
      (actuales) =>
        crearProducto(
          actuales,
          nuevo
        )
    );

    setForm(
      initialForm
    );

    setMostrarAgregar(
      false
    );

    setMensaje(
      "Producto agregado correctamente."
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
  const cambiarPrecioVenta = (
    value
  ) => {
    const precioNormal =
      Number(
        editForm.precio
      );

    const precioVenta =
      Number(value);

    let descuento = "";

    if (
      precioNormal > 0 &&
      precioVenta > 0 &&
      precioVenta <
        precioNormal
    ) {
      descuento = String(
        Math.round(
          (
            1 -
            precioVenta /
              precioNormal
          ) *
            100
        )
      );
    }

    setEditForm(
      (anterior) => ({
        ...anterior,

        precioVenta:
          value,

        descuento
      })
    );
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

  const guardarEdicion = (
    e
  ) => {
    e.preventDefault();

    const precioNormal =
      Number(
        editForm.precio
      );

    const precioVenta =
      Number(
        editForm.precioVenta
      );

    if (
      !editForm.nombre.trim()
    ) {
      setMensaje(
        "El nombre del producto es obligatorio."
      );

      return;
    }

    if (
      precioNormal <= 0
    ) {
      setMensaje(
        "El precio normal debe ser mayor a cero."
      );

      return;
    }

    if (
      precioVenta <= 0
    ) {
      setMensaje(
        "El precio de venta debe ser mayor a cero."
      );

      return;
    }

    /*
      Si el precio de venta es menor,
      automáticamente queda como oferta.

      Si es igual o mayor,
      se elimina la oferta.
    */
    const esOferta =
      precioVenta <
      precioNormal;

    const descuento =
      esOferta
        ? Math.round(
            (
              1 -
              precioVenta /
                precioNormal
            ) *
              100
          )
        : 0;

    setProductos(
      (actuales) =>
        actualizarProducto(
          actuales,
          editandoId,
          {
            nombre:
              editForm.nombre.trim(),

            precio:
              precioNormal,

            precioOferta:
              esOferta
                ? precioVenta
                : null,

            descuento,

            categoria:
              editForm.categoria,

            categoriaLabel:
              obtenerCategoriaLabel(
                editForm.categoria
              ),

            descripcion:
              editForm.descripcion.trim(),

            imagen: editForm.imagen,
          }
        )
    );

    setMensaje(
      esOferta
        ? `Producto actualizado con ${descuento}% de descuento.`
        : "Producto actualizado correctamente."
    );

    cancelarEdicion();
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


  /* INTERFAZ*/

  return (
    <main className="admin-page container-fluid py-4 px-3 px-md-5">

      <AdminHeader />

      {/* MENU ADMIN */}
      <AdminNav seccion={seccion} />

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
        <AdminDashboard
          productos={productos}
          ordenes={ordenes}
        />
      )}

      {/* INVENTARIO*/}

      {seccion === "/inventario" && (
        <AdminInventario
          productos={productos}
          setProductos={setProductos}
          setMensaje={setMensaje}
        />
      )}

      {/* STOCK*/}

      {seccion === "/stock" && (
        <AdminStock
          productos={productos}
          setProductos={setProductos}
          setMensaje={setMensaje}
        />
      )}

      {/* PEDIDOS*/}

      {seccion === "/pedidos" && (
        <AdminPedidos
          ordenes={ordenes}
          cambiarEstado={cambiarEstado}
        />
      )}

      {/* CUENTA*/}

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