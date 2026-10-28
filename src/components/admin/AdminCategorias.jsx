/**
 * AdminCategorias.jsx
 *
 * Pestaña de Gestión de Categorías del panel de administración.
 * Funcionalidades:
 *   - Formulario para crear una nueva categoría con slug autogenerado y normalizado.
 *   - Tabla con listado de categorías, código, nombre y conteo de productos asociados.
 *   - Identificación de categorías del sistema (no eliminables).
 *   - Fila especial promocional informativa para la colección transversal "Ofertas".
 *   - Eliminación de categorías personalizadas (solo si no tienen productos asignados).
 */

import { useState } from "react";
import { crearCategoria, eliminarCategoria } from "../../data/tienda";

function AdminCategorias({
  categorias,
  setCategorias,
  productos,
  productoTieneOferta,
  setMensaje
}) {
  const [nuevaCatNombre, setNuevaCatNombre] = useState("");
  const [nuevaCatSlug, setNuevaCatSlug] = useState("");

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

    const actualizadas = crearCategoria(categorias, {
      id: slug,
      label: nuevaCatNombre.trim()
    });
    setCategorias(actualizadas);
    setNuevaCatNombre("");
    setNuevaCatSlug("");
    setMensaje(`Categoría "${nuevaCatNombre.trim()}" creada correctamente.`);
  };

  return (
    <section className="admin-panel mb-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Gestión de Categorías</h2>
      </div>

      {/* Formulario de creación de categoría */}
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

      {/* Tabla de categorías */}
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
            {/* Fila promocional especial para Ofertas */}
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
                        title={
                          cantProductos > 0
                            ? "No puedes eliminar una categoría con productos asignados"
                            : "Eliminar categoría"
                        }
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
  );
}

export default AdminCategorias;
