/**
 * Navbar.jsx
 *
 * Barra de navegación superior de la tienda (Off)line Archive.
 *
 * Funcionalidades:
 *   — Detecta si hay sesión activa (cliente o administrador) vía localStorage/sessionStorage.
 *   — Si el usuario es administrador, el enlace "Mi cuenta" se reemplaza por "Panel Admin"
 *     y redirige a /admin en lugar de /cuenta.
 *   — Muestra el contador de ítems en el carrito.
 *   — Incluye un menú hamburguesa para pantallas móviles (estado controlado por useState).
 *   — El enlace de Ofertas dirige a /productos?categoria=ofertas para aplicar el filtro.
 */

import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

import "../styles/navbar.css";

// Clave de sesión compartida con auth.js (localStorage y sessionStorage)
const SESSION_KEY = "offlineArchiveSession";

function Navbar({ cantidadCarrito }) {
  // useLocation se invoca para que React re-renderice el Navbar al cambiar de ruta
  // (esto mantiene el estado del enlace activo y la sesión actualizada)
  useLocation();

  // Estado del menú hamburguesa (solo visible en móvil)
  const [menuAbierto, setMenuAbierto] = useState(false);

  /**
   * Lee la sesión activa desde localStorage (persistente) o sessionStorage (temporal).
   * Retorna null si no hay sesión o si el dato está corrupto.
   */
  const obtenerSesion = () => {
    try {
      const localSession     = localStorage.getItem(SESSION_KEY);
      const temporarySession = sessionStorage.getItem(SESSION_KEY);
      return JSON.parse(localSession || temporarySession || "null");
    } catch {
      return null;
    }
  };

  const session  = obtenerSesion();
  const loggedIn = Boolean(session);          // true si hay sesión activa
  const esAdmin  = session?.role === "admin"; // true si el rol es administrador

  // Cierra el menú móvil al navegar a otra página
  const cerrarMenu = () => {
    setMenuAbierto(false);
  };

  return (
    <header className="offline-navbar">

      <Link
        to="/"
        className="navbar-logo"
      >
        (Off)line Archive
      </Link>

      <nav className="navbar-menu">

        <Link to="/colecciones">
          Colección Y2K
        </Link>

        <Link to="/productos?categoria=ofertas">
          Ofertas
        </Link>

        <Link to="/SobreNosotros">
          Sobre
          <br />
          Nosotros
        </Link>

        <Link to="/contacto">
          Contacto
        </Link>

      </nav>

      <nav className="navbar-actions">

        <Link to="/productos">
          Buscar
        </Link>

        <Link
          to={esAdmin ? "/admin" : loggedIn ? "/cuenta" : "/login"}
        >
          {esAdmin ? "Panel Admin" : loggedIn ? "Mi cuenta" : "Login"}
        </Link>

        <Link
          to="/carrito"
          className="navbar-cart"
        >
          <span>
            Carrito
          </span>

          <span className="cart-count">
            {cantidadCarrito}
          </span>
        </Link>

      </nav>

      <button
        className="menu-toggle"
        type="button"
        onClick={() => setMenuAbierto(true)}
        aria-label="Abrir menú"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <aside
        className={
          menuAbierto
            ? "mobile-menu active"
            : "mobile-menu"
        }
        aria-hidden={!menuAbierto}
      >

        <div className="mobile-menu-header">

          <span>
            MENU_01
          </span>

          <button
            className="menu-close"
            type="button"
            onClick={cerrarMenu}
            aria-label="Cerrar menú"
          >
            ×
          </button>

        </div>

        <nav className="mobile-menu-links">

          <Link
            to="/colecciones"
            onClick={cerrarMenu}
          >
            <span>02</span>
            Colección Y2K
          </Link>

          <Link
            to="/productos?categoria=ofertas"
            onClick={cerrarMenu}
          >
            <span>03</span>
            Ofertas
          </Link>

          <Link
            to="/SobreNosotros"
            onClick={cerrarMenu}
          >
            <span>04</span>
            Sobre Nosotros
          </Link>

          <Link
            to="/contacto"
            onClick={cerrarMenu}
          >
            <span>05</span>
            Contacto
          </Link>

          <div className="mobile-divider"></div>

          <Link
            to="/productos"
            onClick={cerrarMenu}
          >
            <span>06</span>
            Buscar
          </Link>

          <Link
            to={esAdmin ? "/admin" : loggedIn ? "/cuenta" : "/login"}
            onClick={cerrarMenu}
          >
            <span>07</span>
            {esAdmin ? "Panel Admin" : loggedIn ? "Mi cuenta" : "Login"}
          </Link>

          <Link
            to="/carrito"
            className="mobile-cart"
            onClick={cerrarMenu}
          >
            <span>08</span>

            Carrito

            <b>
              {cantidadCarrito}
            </b>
          </Link>

        </nav>

        <div className="mobile-menu-footer">
          SYSTEM_01

          <span>
            ONLINE
          </span>
        </div>

      </aside>

    </header>
  );
}

export default Navbar;
