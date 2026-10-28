/**
 * AdminPreviewBanner.jsx
 *
 * Banner sticky que aparece en la parte superior de la tienda cuando un
 * administrador navega FUERA del panel /admin (modo vista previa).
 *
 * Propósito:
 *   - Informar visualmente que el admin está viendo la tienda como cliente.
 *   - Ofrecer un acceso rápido de regreso al panel de administración.
 *
 * Renderizado condicional:
 *   - Se oculta si NO hay sesión activa de administrador.
 *   - Se oculta si la ruta actual comienza con /admin (ya está en el panel).
 *   - Se muestra en todas las demás rutas públicas (/, /productos, etc.).
 */

import { Link, useLocation } from "react-router-dom";
import { getStoredSession } from "../utils/auth";

function AdminPreviewBanner() {
  // Obtiene la ruta actual para decidir si mostrar o no el banner.
  const location = useLocation();

  // Lee la sesión almacenada en localStorage/sessionStorage.
  const session = getStoredSession();

  // Verifica si el usuario activo tiene rol de administrador.
  const esAdmin = session?.role === "admin";

  // Verifica si el admin ya está dentro del panel (no necesita el banner ahí).
  const esRutaAdmin = location.pathname.startsWith("/admin");

  // No renderiza nada si no es admin o si ya está en el panel de administración.
  if (!esAdmin || esRutaAdmin) {
    return null;
  }

  return (
    <aside
      className="admin-preview-bar d-flex justify-content-between align-items-center px-3 py-2"
      aria-label="Modo vista previa de administrador"
      style={{
        backgroundColor: "#0d1608",       /* Fondo oscuro con tonalidad verde */
        borderBottom: "1px solid #ccff00", /* Borde neón que identifica el modo admin */
        color: "#f5f5f5",
        fontSize: "0.82rem",
        position: "sticky",               /* Se mantiene fijo al hacer scroll */
        top: 0,
        zIndex: 1050                      /* Por encima del navbar de Bootstrap */
      }}
    >
      {/* Sección izquierda: indicador del modo */}
      <div className="d-flex align-items-center gap-2">
        <span
          className="badge"
          style={{
            backgroundColor: "#ccff00",
            color: "#010300",
            fontWeight: 700,
            fontSize: "0.72rem"
          }}
        >
          MODO VISTA PREVIA
        </span>
        <span className="d-none d-sm-inline text-secondary">
          Estás navegando en la tienda como cliente.
        </span>
      </div>

      {/* Botón para regresar al panel de administración */}
      <Link
        to="/admin"
        className="btn btn-sm"
        style={{
          border: "1px solid #ccff00",
          color: "#ccff00",
          backgroundColor: "transparent",
          fontSize: "0.78rem",
          fontWeight: 600,
          padding: "4px 10px"
        }}
        title="Volver al Panel de Administración"
      >
        Volver al Dashboard ✕
      </Link>
    </aside>
  );
}

export default AdminPreviewBanner;
