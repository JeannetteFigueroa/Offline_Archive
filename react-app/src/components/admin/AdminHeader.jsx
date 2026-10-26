import { Link } from "react-router-dom";

function AdminHeader() {
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
          Gestión local de inventario, pedidos y estadísticas de la tienda.
        </p>

        <span className="badge text-bg-warning mt-2">
          Incluye pedidos ficticios de demostración
        </span>
      </div>

      <Link
        className="btn btn-outline-dark"
        to="/"
      >
        Volver a la tienda ↗
      </Link>
    </div>
  );
}

export default AdminHeader;