import { useState } from "react";

import {
  crearProducto,
  actualizarProducto,
  eliminarProducto
} from "../../data/tienda";

const money = (numero) =>
  `$${Number(numero || 0).toLocaleString("es-CL")}`;

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
    outerwear: "Outerwear"
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

  return Math.round(
    (
      1 -
      Number(producto.precioOferta) /
        Number(producto.precio)
    ) * 100
  );
}

function AdminInventario({
  productos,
  setProductos,
  setMensaje
}) {
  const [mostrarAgregar, setMostrarAgregar] =
    useState(false);

  const [form, setForm] =
    useState(initialForm);

  const [busqueda, setBusqueda] =
    useState("");

  const [editandoId, setEditandoId] =
    useState(null);

  const [editForm, setEditForm] =
    useState(initialEditForm);

  // Procesa imágenes para crear y editar.
  const procesarImagen = (
    archivo,
    guardarImagen
  ) => {
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
      guardarImagen(lector.result);
    };

    lector.readAsDataURL(archivo);
  };

  const manejarImagen = (e) => {
    const archivo =
      e.target.files?.[0];

    procesarImagen(
      archivo,
      (imagen) => {
        setForm((actual) => ({
          ...actual,
          imagen
        }));
      }
    );
  };

  const manejarImagenEdicion = (e) => {
    const archivo =
      e.target.files?.[0];

    procesarImagen(
      archivo,
      (imagen) => {
        setEditForm((actual) => ({
          ...actual,
          imagen
        }));
      }
    );
  };

  // CREAR PRODUCTO
  const guardar = (e) => {
    e.preventDefault();

    const codigoIngresado =
      form.codigo
        .trim()
        .toUpperCase();

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

    const codigoRepetido =
      productos.some(
        (producto) =>
          String(
            producto.codigo || ""
          )
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

      codigo:
        codigoIngresado,

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

    setForm(initialForm);

    setMostrarAgregar(false);

    setMensaje(
      "Producto agregado correctamente."
    );
  };

  // EDITAR PRODUCTO
  const iniciarEdicion = (
    producto
  ) => {
    const precioNormal =
      Number(
        producto.precio || 0
      );

    const precioVenta =
      productoTieneOferta(producto)
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
        String(precioNormal),

      precioVenta:
        String(precioVenta),

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
        producto.imagen || ""
    });

    setMensaje("");
  };

  const cancelarEdicion = () => {
    setEditandoId(null);

    setEditForm(
      initialEditForm
    );
  };

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
      precioVenta < precioNormal
    ) {
      descuento = String(
        Math.round(
          (
            1 -
            precioVenta /
              precioNormal
          ) * 100
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

          descuento: "",

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

        descuento: "",

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

    if (!editForm.nombre.trim()) {
      setMensaje(
        "El nombre del producto es obligatorio."
      );

      return;
    }

    if (precioNormal <= 0) {
      setMensaje(
        "El precio normal debe ser mayor a cero."
      );

      return;
    }

    if (precioVenta <= 0) {
      setMensaje(
        "El precio de venta debe ser mayor a cero."
      );

      return;
    }

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
            ) * 100
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

            imagen:
              editForm.imagen
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

  const productosFiltrados =
    productos.filter(
      (producto) =>
        `${producto.nombre} ${producto.codigo}`
          .toLowerCase()
          .includes(
            busqueda.toLowerCase()
          )
    );

  return (
    <section className="admin-panel">

      <h2>
        Inventario de productos
      </h2>

      {/* BUSCADOR */}
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
              Si el precio de venta es menor
              al precio normal, el producto
              se mostrará automáticamente
              como oferta.
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
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  precio:
                    e.target.value
                })
              }
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
              value={
                editForm.categoria
              }
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  categoria:
                    e.target.value
                })
              }
            >
              <option value="tops">
                Tops
              </option>

              <option value="bottoms">
                Bottoms
              </option>

              <option value="accesorios">
                Accesorios
              </option>

              <option value="outerwear">
                Outerwear
              </option>
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

          {/* IMAGEN EN EDICIÓN */}
          <div className="col-12">
            <label className="form-label">
              Imagen del producto
            </label>

            <input
              className="form-control"
              type="file"
              accept="image/png, image/jpeg, image/webp"
              onChange={
                manejarImagenEdicion
              }
            />

            <small className="text-secondary">
              Déjalo vacío para mantener
              la imagen actual. Máximo 1 MB.
            </small>

            {editForm.imagen && (
              <div className="mt-3">
                <img
                  src={
                    editForm.imagen
                  }
                  alt="Vista previa"
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

            {Number(
              editForm.precioVenta
            ) <
              Number(
                editForm.precio
              ) && (
              <div className="alert alert-success py-2">

                Oferta activa:{" "}

                <strong>
                  {editForm.descuento ||
                    Math.round(
                      (
                        1 -
                        Number(
                          editForm.precioVenta
                        ) /
                          Number(
                            editForm.precio
                          )
                      ) * 100
                    )}
                  %
                </strong>

                {" — "}

                {money(
                  editForm.precioVenta
                )}

              </div>
            )}

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
            setMostrarAgregar(
              !mostrarAgregar
            )
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
                  codigo:
                    e.target.value
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
                  nombre:
                    e.target.value
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
                  precio:
                    e.target.value
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
                  stock:
                    e.target.value
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
              value={
                form.categoria
              }
              onChange={(e) => {
                const categoria =
                  e.target.value;

                setForm({
                  ...form,
                  categoria,
                  categoriaLabel:
                    obtenerCategoriaLabel(
                      categoria
                    )
                });
              }}
            >
              <option value="tops">
                Tops
              </option>

              <option value="bottoms">
                Bottoms
              </option>

              <option value="accesorios">
                Accesorios
              </option>

              <option value="outerwear">
                Outerwear
              </option>
            </select>
          </div>

          <div className="col-12 col-md-8">
            <label className="form-label">
              Descripción
            </label>

            <input
              className="form-control"
              value={
                form.descripcion
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  descripcion:
                    e.target.value
                })
              }
            />
          </div>

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
              onChange={
                manejarImagen
              }
              required
            />

            <small className="text-secondary">
              PNG, JPG o WEBP.
              Máximo 1 MB.
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

      {/* PRODUCTOS - VISTA MÓVIL */}
      <div className="d-md-none">
  
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
              <div
              className="border rounded p-3 mb-3"
              key={`mobile-${producto.id}`}
              >
  
              {/* CABECERA */}
              <div className="d-flex gap-3 mb-3">
  
                  <img
                  src={producto.imagen}
                  alt={producto.nombre}
                  style={{
                      width: "80px",
                      height: "80px",
                      objectFit: "cover",
                      borderRadius: "6px",
                      flexShrink: 0
                  }}
                  />
  
                  <div>
                  <small className="text-secondary">
                      {producto.codigo}
                  </small>
  
                  <h3 className="h6 mb-1">
                      {producto.nombre}
                  </h3>
  
                  {oferta ? (
                      <span className="badge text-bg-danger">
                      -{descuento}% OFERTA
                      </span>
                  ) : (
                      <span className="badge text-bg-secondary">
                      Sin oferta
                      </span>
                  )}
                  </div>
  
              </div>
  
              {/* INFORMACIÓN */}
              <div className="border-top pt-3">
  
                  <div className="d-flex justify-content-between mb-2">
                  <span>
                      Precio normal
                  </span>
  
                  <strong>
                      {money(
                      producto.precio
                      )}
                  </strong>
                  </div>
  
                  <div className="d-flex justify-content-between mb-2">
                  <span>
                      Precio actual
                  </span>
  
                  <strong>
                      {money(
                      oferta
                          ? producto.precioOferta
                          : producto.precio
                      )}
                  </strong>
                  </div>
  
                  <div className="d-flex justify-content-between align-items-center mb-3">
                  <span>
                      Stock
                  </span>
  
                  <span
                      className={`badge ${
                      producto.stock <= 3
                          ? "text-bg-danger"
                          : "text-bg-success"
                      }`}
                  >
                      {producto.stock}
                  </span>
                  </div>
  
              </div>
  
              {/* ACCIONES */}
              <div className="d-grid gap-2">
  
                  <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={() =>
                      iniciarEdicion(
                      producto
                      )
                  }
                  >
                  Editar producto
                  </button>
  
                  <button
                  type="button"
                  className="btn btn-outline-danger"
                  onClick={() => {
                      setProductos(
                      (actuales) =>
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
                  Eliminar producto
                  </button>
  
              </div>
  
              </div>
          );
          }
      )}
  
      </div>


{/* PRODUCTOS - TABLA TABLET / ESCRITORIO */}
<div className="table-responsive d-none d-md-block">

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
        <th>Acciones</th>
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
            <tr key={producto.id}>

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
                    producto.stock <= 3
                      ? "text-bg-danger"
                      : "text-bg-success"
                  }`}
                >
                  {producto.stock}
                </span>
              </td>

              <td>
                <div className="d-flex flex-wrap gap-2">

                  <button
                    type="button"
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
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => {
                      setProductos(
                        (actuales) =>
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
  );
}

export default AdminInventario;