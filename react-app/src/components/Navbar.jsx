import { useState } from "react";
import { Link } from "react-router-dom";

import "../styles/navbar.css";

const SESSION_KEY = "offlineArchiveSession";

function Navbar({ cantidadCarrito }) {
  const [menuAbierto, setMenuAbierto] = useState(false);

  const tieneSesionActiva = () => {
    const localSession =
      localStorage.getItem(SESSION_KEY);

    const temporarySession =
      sessionStorage.getItem(SESSION_KEY);

    return Boolean(
      localSession || temporarySession
    );
  };

  const loggedIn = tieneSesionActiva();

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

        <a href="#">
          Buscar
        </a>

        <Link
          to={loggedIn ? "/cuenta" : "/login"}
        >
          {loggedIn ? "Mi cuenta" : "Login"}
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
            to="/SobreNosotros"
            onClick={cerrarMenu}
          >
            <span>03</span>
            Sobre Nosotros
          </Link>

          <Link
            to="/contacto"
            onClick={cerrarMenu}
          >
            <span>04</span>
            Contacto
          </Link>

          <div className="mobile-divider"></div>

          <a
            href="#"
            onClick={cerrarMenu}
          >
            <span>05</span>
            Buscar
          </a>

          <Link
            to={loggedIn ? "/cuenta" : "/login"}
            onClick={cerrarMenu}
          >
            <span>06</span>
            {loggedIn ? "Mi cuenta" : "Login"}
          </Link>

          <Link
            to="/carrito"
            className="mobile-cart"
            onClick={cerrarMenu}
          >
            <span>07</span>

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