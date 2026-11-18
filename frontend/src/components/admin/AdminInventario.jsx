/**
 * AdminInventario.jsx
 *
 * Pestaña de Inventario del panel de administración.
 * Funcionalidades:
 *   - Buscador de productos en tiempo real por nombre o código.
 *   - Formulario desplegable para agregar un producto nuevo con opción de oferta manual.
 *   - Persistencia completa con backend Spring Boot y PostgreSQL mediante adminService.
 *   - Formulario para editar productos con la regla de oferta automática (≥ 5% de descuento).
 *   - Tabla de productos con estado de visibilidad (Visible/Oculto) y botón para alternar.
 */

import { useState } from "react";
import {
  crearProducto,
  actualizarProducto,
  eliminarProducto
} from "../../data/tienda";
import adminService from "../../services/adminService";

const money = (n) => `$${Number(n || 0).toLocaleString("es-CL")}`;

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

function AdminInventario({
  productos,
  setProductos,
  categorias,
  obtenerCategoriaLabel,
  productoTieneOferta,
  obtenerDescuentoProducto,
  alternarVisibilidad,
  setMensaje,
  recargarProductos
}) {
  const [busqueda, setBusqueda] = useState("");
  const [mostrarAgregar, setMostrarAgregar] = useState(false);
  const [form, setForm] = useState(initialForm);

  // Estado del producto en edición
  const [editandoId, setEditandoId] = useState(null);
  const [editForm, setEditForm] = useState(initialEditForm);

  // Filtrado de productos por búsqueda
  const productosFiltrados = productos.filter((producto) =>
    `${producto.nombre || ""} ${producto.codigo || ""}`.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Manejo de imagen en creación
  const manejarImagen = (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;
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
      setForm((actual) => ({ ...actual, imagen: lector.result }));
    };
    lector.readAsDataURL(archivo);
  };

  // Manejo de imagen en edición
  const manejarImagenEdicion = (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;
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
      setEditForm((actual) => ({ ...actual, imagen: lector.result }));
    };
    lector.readAsDataURL(archivo);
  };

  // Oferta manual en creación: cambio de precio
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

    setForm((anterior) => ({ ...anterior, precioOferta: value, descuento }));
  };

  // Oferta manual en creación: cambio de porcentaje
  const cambiarDescuentoCreacion = (value) => {
    const precioNormal = Number(form.precio);
    const porcentaje = Number(value);

    if (value === "") {
      setForm((anterior) => ({ ...anterior, descuento: "", precioOferta: "" }));
      return;
    }
    if (porcentaje < 0 || porcentaje > 90) return;

    const precioCalculado = Math.round(precioNormal * (1 - porcentaje / 100));
    setForm((anterior) => ({
      ...anterior,
      descuento: value,
      precioOferta: String(precioCalculado)
    }));
  };

  // Guardar nuevo producto
  const guardar = async (e) => {
    e.preventDefault();
    const codigoIngresado = form.codigo.trim().toUpperCase();

    if (
      !codigoIngresado ||
      !form.nombre.trim() ||
      Number(form.precio) <= 0 ||
      Number(form.stock) < 0 ||
      !form.imagen
    ) {
      setMensaje("Completa el código, nombre, precio, stock e imagen del producto.");
      return;
    }

    const codigoRepetido = productos.some(
      (p) => (p.codigo || "").trim().toUpperCase() === codigoIngresado
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
      if (pctDescuento < 1) {
        setMensaje(
          `Para activar la oferta manual, el descuento debe ser de al menos 5% (actual: ${pctDescuento}%).`
        );
        return;
      }
      precioOfertaFinal = pOferta;
      descuentoFinal = pctDescuento;
    }

    const payload = {
      codigo: codigoIngresado,
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      precio: precioBase,
      precioOferta: precioOfertaFinal,
      stock: Number(form.stock || 0),
      categoriaSlug: form.categoria,
      imagenUrl: form.imagen,
      visible: true
    };

    try {
      await adminService.crearProducto(payload);
      if (typeof recargarProductos === "function") {
        await recargarProductos();
      } else {
        const nuevo = {
          ...form,
          id: Date.now(),
          codigo: codigoIngresado,
          precio: precioBase,
          stock: Number(form.stock),
          precioOferta: precioOfertaFinal,
          descuento: descuentoFinal,
          oculto: false
        };
        setProductos((actuales) => crearProducto(actuales, nuevo));
      }
    } catch {
      // Fallback local
      const nuevo = {
        ...form,
        id: Date.now(),
        codigo: codigoIngresado,
        precio: precioBase,
        stock: Number(form.stock),
        precioOferta: precioOfertaFinal,
        descuento: descuentoFinal,
        oculto: false
      };
      setProductos((actuales) => crearProducto(actuales, nuevo));
    }

    setForm(initialForm);
    setMostrarAgregar(false);
    setMensaje(
      form.enOferta
        ? `Producto agregado con éxito en oferta (${descuentoFinal}% de descuento).`
        : "Producto agregado correctamente."
    );
  };

  // Iniciar edición de un producto existente
  const iniciarEdicion = (producto) => {
    const precioNormal = Number(producto.precio || 0);
    const precioVenta = productoTieneOferta(producto)
      ? Number(producto.precioOferta)
      : precioNormal;
    const descuento = obtenerDescuentoProducto(producto);

    setEditandoId(producto.backendId || producto.id);
    setEditForm({
      nombre: producto.nombre || "",
      precio: String(precioNormal),
      precioVenta: String(precioVenta),
      descuento: descuento > 0 ? String(descuento) : "",
      categoria: producto.categoria || "tops",
      descripcion: producto.descripcion || "",
      imagen: producto.imagen || ""
    });
    setMensaje("");
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setEditForm(initialEditForm);
  };

  // Cambio de precio de venta en edición (Regla del 5%)
  const cambiarPrecioVenta = (value) => {
    const precioNormal = Number(editForm.precio);
    const precioVenta = Number(value);
    let descuento = "";

    if (precioNormal > 0 && precioVenta > 0 && precioVenta < precioNormal) {
      const pctCalculado = Math.round((1 - precioVenta / precioNormal) * 100);
      if (pctCalculado >= 5) {
        descuento = String(pctCalculado);
      }
    }

    setEditForm((anterior) => ({ ...anterior, precioVenta: value, descuento }));
  };

  // Cambio de porcentaje de descuento en edición
  const cambiarDescuento = (value) => {
    const precioNormal = Number(editForm.precio);
    const porcentaje = Number(value);

    if (value === "") {
      setEditForm((anterior) => ({
        ...anterior,
        descuento: "",
        precioVenta: anterior.precio
      }));
      return;
    }
    if (porcentaje < 0 || porcentaje > 90) return;

    const precioOferta = Math.round(precioNormal * (1 - porcentaje / 100));
    setEditForm((anterior) => ({
      ...anterior,
      descuento: value,
      precioVenta: String(precioOferta)
    }));
  };

  const quitarOferta = () => {
    setEditForm((anterior) => ({
      ...anterior,
      descuento: "",
      precioVenta: anterior.precio
    }));
  };

  // Guardar edición
  const guardarEdicion = async (e) => {
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

    // Regla del 5% mínimo
    const pctCalculado =
      precioNormal > 0 && precioVenta < precioNormal
        ? Math.round((1 - precioVenta / precioNormal) * 100)
        : 0;
    const esOferta = precioVenta < precioNormal && pctCalculado >= 5;
    const descuento = esOferta ? pctCalculado : 0;

    const payload = {
      nombre: editForm.nombre.trim(),
      precio: precioNormal,
      precioOferta: esOferta ? precioVenta : null,
      categoriaSlug: editForm.categoria,
      descripcion: editForm.descripcion.trim(),
      imagenUrl: editForm.imagen
    };

    try {
      if (typeof editandoId === "number" && editandoId > 0) {
        await adminService.actualizarProducto(editandoId, payload);
      }
      if (typeof recargarProductos === "function") {
        await recargarProductos();
      } else {
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
      }
    } catch {
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
    }

    setMensaje(
      esOferta
        ? `Producto actualizado con ${descuento}% de descuento en oferta.`
        : precioVenta < precioNormal
        ? `Producto actualizado. La rebaja (${pctCalculado}%) es inferior al 5% requerido para oferta.`
        : "Producto actualizado correctamente."
    );

    cancelarEdicion();
  };

  const handleEliminarProducto = async (producto) => {
    const idBackend = producto.backendId || (typeof producto.id === "number" ? producto.id : null);
    try {
      if (idBackend) {
        await adminService.eliminarProducto(idBackend);
      }
      if (typeof recargarProductos === "function") {
        await recargarProductos();
      } else {
        setProductos((actuales) => eliminarProducto(actuales, producto.id));
      }
    } catch {
      setProductos((actuales) => eliminarProducto(actuales, producto.id));
    }
    setMensaje("Producto eliminado del catálogo.");
  };

  return (
    <section className="admin-panel">
      <h2>Inventario de productos</h2>

      {/* Buscador de productos */}
      <div className="row g-2 my-3">
        <div className="col-12 col-md-6">
          <input
            className="form-control"
            placeholder="Buscar por nombre o código"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            aria-label="Buscar producto"
          />
        </div>
      </div>

      {/* Formulario de Edición */}
      {editandoId !== null && (
        <form className="row g-3 border border-warning rounded p-3 mb-4" onSubmit={guardarEdicion}>
          <div className="col-12">
            <h3 className="h5">Editar producto</h3>
            <p className="text-secondary small mb-0">
              Si el precio de venta es menor al precio normal y la rebaja es al menos un 5%,
              el producto se mostrará automáticamente como oferta.
            </p>
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label">Nombre</label>
            <input
              className="form-control"
              value={editForm.nombre}
              onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
              required
            />
          </div>

          <div className="col-12 col-md-3">
            <label className="form-label">Precio normal CLP</label>
            <input
              className="form-control"
              type="number"
              min="1"
              value={editForm.precio}
              onChange={(e) => setEditForm({ ...editForm, precio: e.target.value })}
              required
            />
          </div>

          <div className="col-12 col-md-3">
            <label className="form-label">Precio de venta CLP</label>
            <input
              className="form-control"
              type="number"
              min="1"
              value={editForm.precioVenta}
              onChange={(e) => cambiarPrecioVenta(e.target.value)}
              required
            />
          </div>

          {/* Advertencia o Confirmación de la regla del 5% */}
          {editForm.precio && editForm.precioVenta && Number(editForm.precioVenta) < Number(editForm.precio) && (
            <div className="col-12">
              {Math.round(
                (1 - Number(editForm.precioVenta) / Number(editForm.precio)) * 100
              ) >= 5 ? (
                <div className="alert alert-success py-2 mb-0">
                  Oferta automática activa:{" "}
                  <strong>
                    {Math.round(
                      (1 - Number(editForm.precioVenta) / Number(editForm.precio)) * 100
                    )}% de descuento
                  </strong>{" "}
                  ({money(editForm.precioVenta)})
                </div>
              ) : (
                <div className="alert alert-warning py-2 mb-0">
                  No califica como oferta automática (se requiere un descuento mínimo del 5%).
                </div>
              )}
            </div>
          )}

          <div className="col-6 col-md-3">
            <label className="form-label">Descuento % (Opcional)</label>
            <input
              className="form-control"
              type="number"
              min="0"
              max="90"
              value={editForm.descuento}
              onChange={(e) => cambiarDescuento(e.target.value)}
              placeholder="Ej: 20"
            />
          </div>

          <div className="col-6 col-md-4">
            <label className="form-label">Categoría</label>
            <select
              className="form-select"
              value={editForm.categoria}
              onChange={(e) => setEditForm({ ...editForm, categoria: e.target.value })}
            >
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="col-12 col-md-5">
            <label className="form-label">Descripción</label>
            <input
              className="form-control"
              value={editForm.descripcion}
              onChange={(e) => setEditForm({ ...editForm, descripcion: e.target.value })}
            />
          </div>

          <div className="col-12">
            <label htmlFor="imagenProductoEdicion" className="form-label">
              Cambiar imagen (opcional)
            </label>
            <input
              id="imagenProductoEdicion"
              className="form-control"
              type="file"
              accept="image/png, image/jpeg, image/webp"
              onChange={manejarImagenEdicion}
            />
          </div>

          <div className="col-12 d-flex flex-wrap gap-2">
            <button className="btn btn-primary" type="submit">
              Guardar cambios
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={quitarOferta}
            >
              Quitar oferta
            </button>
            <button
              type="button"
              className="btn btn-outline-dark"
              onClick={cancelarEdicion}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Encabezado y botón para agregar producto */}
      <div className="d-flex justify-content-between align-items-center my-3">
        <h3 className="h5 mb-0">Gestión de productos</h3>

        <button
          type="button"
          className={mostrarAgregar ? "btn btn-outline-secondary" : "btn btn-dark"}
          onClick={() => setMostrarAgregar(!mostrarAgregar)}
        >
          {mostrarAgregar ? "✕ Cerrar formulario" : "+ Agregar producto"}
        </button>
      </div>

      {/* Formulario Agregar Producto */}
      {mostrarAgregar && (
        <form className="row g-2 border rounded p-3 mb-4" onSubmit={guardar}>
          <h3 className="h5">Agregar nuevo producto</h3>

          <div className="col-12 col-md-3">
            <label className="form-label">Código</label>
            <input
              className="form-control"
              value={form.codigo}
              onChange={(e) => setForm({ ...form, codigo: e.target.value })}
              required
            />
          </div>

          <div className="col-12 col-md-5">
            <label className="form-label">Nombre</label>
            <input
              className="form-control"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              required
            />
          </div>

          <div className="col-12 col-md-4">
            <label className="form-label">Categoría</label>
            <select
              className="form-select"
              value={form.categoria}
              onChange={(e) => {
                const cat = categorias.find((c) => c.id === e.target.value);
                setForm({
                  ...form,
                  categoria: e.target.value,
                  categoriaLabel: cat ? cat.label : e.target.value
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

          <div className="col-6 col-md-4">
            <label className="form-label">Precio normal CLP</label>
            <input
              className="form-control"
              type="number"
              min="1"
              placeholder="Ej: 25000"
              value={form.precio}
              onChange={(e) => setForm({ ...form, precio: e.target.value })}
              required
            />
          </div>

          <div className="col-6 col-md-4">
            <label className="form-label">Stock inicial</label>
            <input
              className="form-control"
              type="number"
              min="0"
              placeholder="Ej: 10"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              required
            />
          </div>

          <div className="col-12 col-md-4">
            <label className="form-label">¿Poner en oferta? (Manual)</label>
            <select
              className="form-select"
              value={form.enOferta ? "si" : "no"}
              onChange={(e) => {
                const activar = e.target.value === "si";
                setForm((anterior) => ({
                  ...anterior,
                  enOferta: activar,
                  precioOferta: activar && anterior.precio ? String(Math.round(Number(anterior.precio) * 0.9)) : "",
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
                <label className="form-label">Precio de Oferta CLP</label>
                <input
                  className="form-control"
                  type="number"
                  min="1"
                  placeholder="Ej: 19000"
                  value={form.precioOferta}
                  onChange={(e) => cambiarPrecioOfertaCreacion(e.target.value)}
                  required={form.enOferta}
                />
              </div>

              <div className="col-6 col-md-4">
                <label className="form-label">Descuento % (Mínimo 5%)</label>
                <input
                  className="form-control"
                  type="number"
                  min="5"
                  max="90"
                  placeholder="Ej: 15"
                  value={form.descuento}
                  onChange={(e) => cambiarDescuentoCreacion(e.target.value)}
                />
              </div>

              {form.precio && form.precioOferta && (
                <div className="col-12">
                  {Number(form.precioOferta) < Number(form.precio) ? (
                    Math.round(
                      (1 - Number(form.precioOferta) / Number(form.precio)) * 100
                    ) >= 5 ? (
                      <div className="alert alert-success py-2 mb-0">
                        ✓ Oferta manual válida:{" "}
                        <strong>
                          {Math.round(
                            (1 - Number(form.precioOferta) / Number(form.precio)) * 100
                          )}
                          % de descuento
                        </strong>{" "}
                        ({money(form.precioOferta)})
                      </div>
                    ) : (
                      <div className="alert alert-warning py-2 mb-0">
                        ⚠️ Rebaja menor al 5% (
                        {Math.round(
                          (1 - Number(form.precioOferta) / Number(form.precio)) * 100
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
            <label htmlFor="imagenProducto" className="form-label">
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
            <small className="text-secondary">PNG, JPG o WEBP. Máximo 1 MB.</small>

            {form.imagen && (
              <div className="mt-3">
                <p className="mb-2">Vista previa:</p>
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
            <button className="btn btn-dark" type="submit">
              Guardar producto
            </button>
          </div>
        </form>
      )}

      {/* Tabla de Productos del Inventario */}
      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead>
            <tr>
              <th>Imagen</th>
              <th>Código</th>
              <th>Producto</th>
              <th>Precio normal</th>
              <th>Precio actual</th>
              <th>Oferta</th>
              <th>Stock</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {productosFiltrados.map((producto) => {
              const oferta = productoTieneOferta(producto);
              const descuento = obtenerDescuentoProducto(producto);

              return (
                <tr key={producto.id}>
                  <td>
                    {producto.imagen ? (
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
                    ) : (
                      <div
                        style={{
                          width: "55px",
                          height: "55px",
                          backgroundColor: "#eee",
                          borderRadius: "6px"
                        }}
                      />
                    )}
                  </td>
                  <td><strong>{producto.codigo || "—"}</strong></td>
                  <td>{producto.nombre}</td>
                  <td>{money(producto.precio)}</td>
                  <td>{money(oferta ? producto.precioOferta : producto.precio)}</td>
                  <td>
                    {oferta ? (
                      <span className="badge text-bg-danger">-{descuento}%</span>
                    ) : (
                      <span className="badge text-bg-secondary">Sin oferta</span>
                    )}
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        producto.stock <= 3 ? "text-bg-danger" : "text-bg-success"
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
                        className={`btn btn-sm ${
                          producto.oculto ? "btn-outline-success" : "btn-outline-secondary"
                        }`}
                        onClick={() => alternarVisibilidad(producto.id)}
                        title={producto.oculto ? "Hacer visible en la tienda" : "Ocultar de la tienda"}
                      >
                        {producto.oculto ? "Mostrar 👁️" : "Ocultar 🚫"}
                      </button>

                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => iniciarEdicion(producto)}
                      >
                        Editar
                      </button>

                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleEliminarProducto(producto)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default AdminInventario;
