/**
 * AdminHeader.jsx
 *
 * Encabezado principal del panel de administración (Off)line Archive.
 * Incluye el título del panel, descripción, estado de conexión a PostgreSQL
 * y los botones para navegar a la tienda como usuario o cerrar sesión.
 */

import { Link } from "react-router-dom";

function AdminHeader({ cerrarSesionAdmin }) {
  return (
    <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-end gap-3 mb-4">
      <div>
        <p className="admin-eyebrow mb-2">
          OFF(LINE) ARCHIVE / CONTROL
        </p>

        <h1 className="admin-title mb-1">
          PANEL ADMINISTRATIVO.
        </h1>

        <p className="text-secondary mb-0">
          Gestión integral conectada a API Spring Boot y base de datos PostgreSQL.
        </p>

        <span className="badge text-bg-success mt-2">
          ● Conectado a PostgreSQL (Modo Producción)
        </span>
      </div>

      <div className="d-flex flex-wrap gap-2">
        {/* Enlace para navegar por la tienda en modo vista previa */}
        <Link
          className="btn btn-outline-dark"
          to="/"
          title="Ver la tienda desde la perspectiva de un cliente"
        >
          Visualizar tienda como usuario 👁️
        </Link>

        {/* Botón para cerrar la sesión administrativa de forma segura */}
        <button
          type="button"
          className="btn btn-outline-danger"
          onClick={cerrarSesionAdmin}
        >
          Cerrar sesión ✕
        </button>
      </div>
    </div>
  );
}

export default AdminHeader;
