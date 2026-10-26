import { Link } from "react-router-dom";

function AdminNav({ seccion }) {
  return (
    <nav className="admin-nav nav nav-pills flex-wrap gap-2 mb-4">

      <Link
        className={`nav-link ${
          seccion === "/" ? "active" : ""
        }`}
        to="/admin"
      >
        Dashboard
      </Link>

      <Link
        className={`nav-link ${
          seccion === "/inventario" ? "active" : ""
        }`}
        to="/admin/inventario"
      >
        Inventario
      </Link>

      <Link
        className={`nav-link ${
          seccion === "/stock" ? "active" : ""
        }`}
        to="/admin/stock"
      >
        Ingresar stock
      </Link>

      <Link
        className={`nav-link ${
          seccion === "/pedidos" ? "active" : ""
        }`}
        to="/admin/pedidos"
      >
        Confirmar pedidos
      </Link>

      <Link
        className={`nav-link ${
          seccion === "/cuenta" ? "active" : ""
        }`}
        to="/admin/cuenta"
      >
        Cuenta/ajustes
      </Link>

    </nav>
  );
}

export default AdminNav;