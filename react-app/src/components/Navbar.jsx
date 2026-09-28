import { Link } from "react-router-dom";
import "../styles/Navbar.css";

function Navbar({ nombreTienda, cantidadCarrito }) {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark offline-navbar">
      <div className="container">
        <Link className="navbar-brand offline-logo" to="/">
          {nombreTienda}
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarOffline"
          aria-controls="navbarOffline"
          aria-expanded="false"
          aria-label="Abrir navegación"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div
          className="collapse navbar-collapse"
          id="navbarOffline"
        >
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                Inicio
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/productos">
                Productos
              </Link>
            </li>
          </ul>

          <Link
            className="offline-cart"
            to="/carrito"
          >
            Carrito ({cantidadCarrito})
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;