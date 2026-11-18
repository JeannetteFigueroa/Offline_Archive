/**
 * AdminCategorias.jsx
 *
 * Pestaña de Gestión de Categorías del panel de administración.
 * Funcionalidades:
 *   - Formulario para crear una nueva categoría con slug autogenerado y normalizado.
 *   - Conectado a la API REST Spring Boot y persistencia en PostgreSQL con adminService.
 *   - Tabla con listado de categorías, código, nombre y conteo de productos asociados.
 *   - Identificación de categorías del sistema (no eliminables).
 *   - Fila especial promocional informativa para la colección transversal "Ofertas".
 *   - Eliminación de categorías personalizadas (solo si no tienen productos asignados).
 */

import { useState } from "react";
import { crearCategoria, eliminarCategoria } from "../../data/tienda";
import adminService from "../../services/adminService";

function AdminCategorias({
  categorias,
  setCategorias,
  productos,
  productoTieneOferta,
  setMensaje,
  recargarCategorias
}) {
  const [nuevaCatNombre, setNuevaCatNombre] = useState("");
  const [nuevaCatSlug, setNuevaCatSlug] = useState("");

  const handleCrearCategoria = async (e) => {
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

    if (categorias.some((c) => c.id === slug || c.slug === slug)) {
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

    try {
      await adminService.crearCategoria({
        nombre: nuevaCatNombre.trim(),
        slug: slug
      });
      if (typeof recargarCategorias === "function") {
        await recargarCategorias();
      }
    } catch {
      // Si la API falla, ya se reflejó localmente
    }
  };

  const handleEliminarCategoria = async (categoria) => {
    try {
      if (categoria.backendId || typeof categoria.id === "number") {
        await adminService.eliminarCategoria(categoria.backendId || categoria.id);
      }
      if (typeof recargarCategorias === "function") {
        await recargarCategorias();
      } else {
        const actualizadas = eliminarCategoria(categorias, categoria.id);
        setCategorias(actualizadas);
      }
    } catch {
      const actualizadas = eliminarCategoria(categorias, categoria.id);
      setCategorias(actualizadas);
    }
    setMensaje(`Categoría "${categoria.label || categoria.nombre}" eliminada.`);
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
          <label className="form-label">Identificador (Slug)</label>
          <input
            className="form-control"
            placeholder="calzado"
            value={nuevaCatSlug}
            onChange={(e) => setNuevaCatSlug(e.target.value)}
          />
        </div>

        <div className="col-12 col-md-3 d-flex align-items-end">
          <button className="btn btn-dark w-100" type="submit">
            + Crear categoría
          </button>
        </div>
      </form>

      {/* Tabla de categorías registradas */}
      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead>
            <tr>
              <th>Código / Slug</th>
              <th>Nombre</th>
              <th>Productos asociados</th>
              <th>Tipo</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {/* Fila especial promocional transversal */}
            <tr className="table-info">
              <td>
                <code>ofertas</code>
              </td>
              <td>
                <strong>Colección Ofertas</strong>
              </td>
              <td>
                <span className="badge text-bg-danger">
                  {productos.filter((p) => productoTieneOferta(p)).length} en oferta
                </span>
              </td>
              <td>
                <span className="badge text-bg-info">Colección transversal</span>
              </td>
              <td>
                <small className="text-muted">Automática (≥ 5% desc.)</small>
              </td>
            </tr>

            {/* Listado dinámico de categorías */}
            {categorias.map((cat) => {
              const slug = cat.slug || cat.id;
              const label = cat.label || cat.nombre;
              const conteo = productos.filter(
                (p) => p.categoria === slug || (p.categoriaSlug && p.categoriaSlug === slug)
              ).length;
              const esBase = cat.esSistema !== undefined ? cat.esSistema : (cat.esBase ?? ["tops", "bottoms", "accesorios", "outerwear"].includes(slug));

              return (
                <tr key={slug}>
                  <td>
                    <code>{slug}</code>
                  </td>
                  <td>{label}</td>
                  <td>
                    <span className="badge text-bg-secondary">{conteo}</span>
                  </td>
                  <td>
                    {esBase ? (
                      <span className="badge text-bg-primary">Categoría del sistema</span>
                    ) : (
                      <span className="badge text-bg-light border">Personalizada</span>
                    )}
                  </td>
                  <td>
                    {!esBase && conteo === 0 ? (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleEliminarCategoria(cat)}
                      >
                        Eliminar
                      </button>
                    ) : !esBase ? (
                      <small className="text-secondary">Con productos</small>
                    ) : (
                      <small className="text-muted">Protegida</small>
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
