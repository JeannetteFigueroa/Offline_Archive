import { Link } from "react-router-dom";

function Navbar({ nombreTienda, cantidadCarrito }) {
  return (
    <nav>
      <h2>{nombreTienda}</h2>

      <ul>
        <li>
          <Link to="/">
            Inicio
          </Link>
        </li>

        <li>
          <Link to="/productos">
            Productos
          </Link>
        </li>

        <li>
          <Link to="/carrito">
            Carrito ({cantidadCarrito})
          </Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;